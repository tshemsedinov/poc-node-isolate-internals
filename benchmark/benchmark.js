'use strict';

const childProcess = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_ITERATIONS = 1000;
const DEFAULT_SAMPLES = 1000;
const DEFAULT_WARMUP = 100;

const SOLUTIONS = [
  {
    name: '01-baseline',
    instanceof: 'yes',
    patchable: 'yes',
    description: 'is the unsafe reference',
  },
  {
    name: '02-context',
    instanceof: 'no',
    patchable: 'no',
    description: 'vm.createContext to isolate userland and internal',
  },
  {
    name: '03-context-fixed',
    instanceof: 'yes',
    patchable: 'yes',
    description: 'vm.createContext + boundary adapter to cross realms',
  },
  {
    name: '04-primordials',
    instanceof: 'yes',
    patchable: 'yes',
    description: 'protect native prototypes with saved primordials',
  },
  {
    name: '05-extends',
    instanceof: 'yes',
    patchable: 'no',
    description: 'extends internal built-ins and injects to userland',
  },
  {
    name: '06-forward',
    instanceof: 'yes',
    patchable: 'no',
    description: 'forward wrappers for Promise and Array without subclassing',
  },
  {
    name: '07-prototype',
    instanceof: 'yes',
    patchable: 'no',
    description: 'prototype inheritance with Symbol.species/hasInstance, no value conversion',
  },
  {
    name: '08-module',
    instanceof: 'yes',
    patchable: 'yes',
    description: 'per-module injection of internal/userland classes via Module._compile hook',
  },
];

const getOptionsFromArgv = (offset = 2) => ({
  iterations: Number(process.argv[offset] || DEFAULT_ITERATIONS),
  samples: Number(process.argv[offset + 1] || DEFAULT_SAMPLES),
  warmup: Number(process.argv[offset + 2] || DEFAULT_WARMUP),
});

const runIterations = (solution, iterations) => solution.benchmark(iterations);

const toMilliseconds = (start, end) => Number(end - start) / 1e6;

const runBenchmarkFor = async (solutionName, solution, options = {}) => {
  const iterations = options.iterations ?? DEFAULT_ITERATIONS;
  const samples = options.samples ?? DEFAULT_SAMPLES;
  const warmup = options.warmup ?? DEFAULT_WARMUP;

  const setupStart = process.hrtime.bigint();
  const setupEnd = process.hrtime.bigint();

  for (let index = 0; index < warmup; index++) {
    await runIterations(solution, iterations);
  }

  const sampleTimesMs = [];
  let checksum = 0;

  for (let index = 0; index < samples; index++) {
    const start = process.hrtime.bigint();
    checksum = await runIterations(solution, iterations);
    const end = process.hrtime.bigint();
    sampleTimesMs.push(toMilliseconds(start, end));
  }

  const sorted = sampleTimesMs.toSorted((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  const p95index = Math.floor(sorted.length * 0.95);

  return {
    name: solutionName,
    iterations,
    samples,
    warmup,
    setupMs: toMilliseconds(setupStart, setupEnd),
    sampleTimesMs,
    medianMs: sorted[middle],
    p95Ms: sorted[p95index],
    minMs: sorted[0],
    maxMs: sorted[sorted.length - 1],
    checksum,
  };
};

const runSolutionInChild = (solutionName, options) => (
  new Promise((resolve, reject) => {
    const resolved = options || {};
    const iterations = resolved.iterations ?? DEFAULT_ITERATIONS;
    const samples = resolved.samples ?? DEFAULT_SAMPLES;
    const warmup = resolved.warmup ?? DEFAULT_WARMUP;

    const workerScript = path.join(__dirname, 'benchmark.js');
    const workerArgv = [
      '--worker',
      solutionName,
      String(iterations),
      String(samples),
      String(warmup),
    ];
    const forkOptions = { stdio: ['inherit', 'pipe', 'pipe', 'ipc'] };
    const child = childProcess.fork(workerScript, workerArgv, forkOptions);

    let stderr = '';
    let settled = false;

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('message', (message) => {
      if (settled) return;
      if (message?.ok) {
        settled = true;
        resolve({
          name: message.name,
          benchmark: message.benchmark,
        });
        return;
      }

      if (message?.ok === false) {
        settled = true;
        reject(new Error(message.error || 'Unknown worker error'));
      }
    });

    child.on('error', (error) => {
      if (settled) return;
      settled = true;
      reject(error);
    });

    child.on('exit', (code, signal) => {
      if (settled) return;
      settled = true;
      const reasonLines = [
        `Worker failed for ${solutionName}`,
        `code=${code}`,
        signal ? `signal=${signal}` : '',
        stderr ? `stderr=${stderr.trim()}` : '',
      ];
      const reason = reasonLines.filter(Boolean).join(' ');
      reject(new Error(reason));
    });
  })
);

const createRow = (solution, benchmark, baselineMedianMs) => {
  const formatMetric = (value) => Number(value.toFixed(3));
  const vsBaseline = benchmark.medianMs / baselineMedianMs;

  return {
    name: solution.name,
    setupMs: formatMetric(benchmark.setupMs),
    medianMs: formatMetric(benchmark.medianMs),
    p95Ms: formatMetric(benchmark.p95Ms),
    minMs: formatMetric(benchmark.minMs),
    maxMs: formatMetric(benchmark.maxMs),
    vsBaseline: formatMetric(vsBaseline),
    instanceof: solution.instanceof ?? 'n/a',
    patchable: solution.patchable ?? 'n/a',
  };
};

const toMarkdownTable = (rows) => {
  const formatMs = (value) => value.toFixed(3);
  const header = [
    '| Solution | Setup ms | Median ms | p95 ms | Slowdown | instanceof | patchable |',
    '| --- | ---: | ---: | ---: | ---: | :---: | :---: |',
  ];

  const body = rows.map((row) => {
    const slowdown = `${row.vsBaseline.toFixed(3)}x`;
    const cells = [
      row.name,
      formatMs(row.setupMs),
      formatMs(row.medianMs),
      formatMs(row.p95Ms),
      slowdown,
      row.instanceof,
      row.patchable,
    ];
    return `| ${cells.join(' | ')} |`;
  });

  return [...header, ...body].join('\n');
};

const runWorkerMain = async () => {
  const solutionName = process.argv[3];
  const options = getOptionsFromArgv(4);

  const solution = require(path.join(__dirname, solutionName));
  const benchmark = await runBenchmarkFor(solutionName, solution, options);

  if (process.send) {
    process.send({
      ok: true,
      name: solutionName,
      benchmark,
    });
  }
};

const main = async () => {
  if (process.argv[2] === '--worker') {
    await runWorkerMain();
    return;
  }

  const options = getOptionsFromArgv(2);
  const { iterations, samples, warmup } = options;

  const benchmarks = {};

  for (const solution of SOLUTIONS) {
    const result = await runSolutionInChild(solution.name, options);
    benchmarks[result.name] = result.benchmark;
  }

  const baselineMedianMs = benchmarks['01-baseline'].medianMs;

  const rows = SOLUTIONS.map((solution) => (
    createRow(
      solution,
      benchmarks[solution.name],
      baselineMedianMs,
    )
  ));

  const result = {
    config: { iterations, samples, warmup },
    benchmarks,
    rows,
  };
  const interpretation = SOLUTIONS.map(
    (solution) => `- ${solution.name}: ${solution.description}`,
  );

  const summary = [
    '# Benchmark summary',
    '',
    `Iterations: ${iterations}`,
    `Samples: ${samples}`,
    `Warmup: ${warmup}`,
    '',
    toMarkdownTable(rows),
    '',
    'Interpretation:',
    '',
    ...interpretation,
  ].join('\n') + '\n';

  const resultsPath = path.join(__dirname, 'results.json');
  const resultsPayload = JSON.stringify(result, null, 2);
  fs.writeFileSync(resultsPath, resultsPayload);

  const summaryPath = path.join(__dirname, 'summary.md');
  fs.writeFileSync(summaryPath, summary);
  process.stdout.write(summary);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

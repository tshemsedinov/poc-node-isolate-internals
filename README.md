# Proof of Concept: primordials substitution

## Concept

This proof of concept explores an alternative to primordials in
Node.js internals to protect built-in prototypes from pollution.

## How to run

Run all benchmarks:

```bash
node benchmark/benchmark.js
```

Latest benchmark artifacts are written to:

- `benchmark/results.json`
- `benchmark/summary.md`

Run best case:

```bash
node main.js
```

## Benchmark results snapshot

Configuration:

- Iterations: `1000`
- Samples: `1000`
- Warmup: `100`

| Solution | Setup ms | Median ms | p95 ms | Slowdown | instanceof | patchable |
| --- | ---: | ---: | ---: | ---: | :---: | :---: |
| 01-baseline | 0.000 | 0.033 | 0.070 | 1.000x | yes | yes |
| 02-context | 0.000 | 0.286 | 0.328 | 8.569x | no | no |
| 03-context-fixed | 0.001 | 0.276 | 0.328 | 8.285x | yes | yes |
| 04-primordials | 0.001 | 0.082 | 0.122 | 2.467x | yes | yes |
| 05-extends | 0.000 | 0.038 | 0.080 | 1.127x | yes | no |
| 06-forward | 0.000 | 0.050 | 0.086 | 1.510x | yes | no |
| 07-prototype | 0.001 | 0.038 | 0.074 | 1.124x | yes | no |

Interpretation:

- 01-baseline: is the unsafe reference (no slowdown)
- 02-context: vm.createContext to isolate userland and internal
- 03-context-fixed: vm.createContext + boundary adapter to cross realms
- 04-primordials: protect native prototypes with saved primordials
- 05-extends: extends internal built-ins and injects to userland
- 06-forward: forward wrappers without subclassing
- 07-prototype: prototype inheritance and Symbol.species

## What this PoC demonstrates

- userland pollution does not affect internal built-ins
- `instanceof` works for values returned to userland
- cases 05, 06, and 07 all stay close to baseline while keeping `instanceof` compatibility

## Trade-offs and limitations

This is not a security boundary and not a sandbox against malicious code. The main tradeoff is shifting complexity from internal call sites to boundary adapters. Internal values must not leak directly to userland.

## References

- Node.js primordials documentation:
  [doc/contributing/primordials.md](https://github.com/nodejs/node/blob/main/doc/contributing/primordials.md)
- Primordials discussions/issues:
  [nodejs/node#30697: Migration of core modules to primordials](https://github.com/nodejs/node/issues/30697)
- nodejs/TSC#1438: [Removing `primordials` from Node.js project](https://github.com/nodejs/TSC/issues/1438)
- nodejs/TSC#1439: [New Strategic Initiative on Primordials](https://github.com/nodejs/TSC/issues/1439)

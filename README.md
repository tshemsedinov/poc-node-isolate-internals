# Proof of Concept: primordials substitution

## Concept

This proof of concept explores an alternative to primordials in
Node.js internals to protect built-in prototypes from pollution.

## Benchmark

Run all benchmark cases:

```bash
node benchmark/benchmark.js
```

Latest benchmark artifacts are written to:

- `benchmark/results.json`
- `benchmark/summary.md`

## Benchmark cases

- **01-baseline**: unsafe baseline reference; internal and userland use regular globals.
- **02-context**: use `vm.createContext` to isolate userland and internal.
- **03-context-fixed**: `vm.createContext` + instanceof works cross-boundary.
- **04-primordials**: single-realm with captured primordial for internal calls.
- **05-extends**: extends built-ins for userland and preserves internal ones.

## Benchmark results snapshot

Configuration:

- Iterations: `1000`
- Samples: `1000`
- Warmup: `100`

| Solution | Setup ms | Median ms | Slowdown | instanceof |
| --- | ---: | ---: | ---: | :---: |
| 01-baseline | 0.000 | 0.032 | 1.000x | yes |
| 02-context | 0.000 | 0.258 | 8.010x | no |
| 03-context-fixed | 0.000 | 0.293 | 9.095x | yes |
| 04-primordials | 0.000 | 0.085 | 2.652x | yes |
| 05-extends | 0.000 | 0.038 | 1.187x | yes |

## What this PoC demonstrates

- userland pollution does not affect internal built-ins
- `instanceof` works for values returned to userland
- **05-extends** is close to baseline performance while keeping `instanceof` compatibility

## Trade-offs and limitations

This is not a security boundary and not a sandbox against malicious code. The main tradeoff is shifting complexity from internal call sites to boundary adapters. Internal values must not leak directly to userland.

## References

- Node.js primordials documentation:
  [doc/contributing/primordials.md](https://github.com/nodejs/node/blob/main/doc/contributing/primordials.md)
- Primordials discussions/issues:
  [nodejs/node#30697: Migration of core modules to primordials](https://github.com/nodejs/node/issues/30697)
- nodejs/TSC#1438: [Removing `primordials` from Node.js project](https://github.com/nodejs/TSC/issues/1438)
- nodejs/TSC#1439: [New Strategic Initiative on Primordials](https://github.com/nodejs/TSC/issues/1439)

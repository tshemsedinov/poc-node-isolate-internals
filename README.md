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
- **06-forward**: forwarding wrappers for `Promise` and `Array` without subclassing.

## Benchmark results snapshot

Configuration:

- Iterations: `1000`
- Samples: `1000`
- Warmup: `100`

| Solution | Setup ms | Median ms | Slowdown | instanceof |
| --- | ---: | ---: | ---: | :---: |
| 01-baseline | 0.000 | 0.033 | 1.000x | yes |
| 02-context | 0.000 | 0.327 | 9.918x | no |
| 03-context-fixed | 0.000 | 0.281 | 8.534x | yes |
| 04-primordials | 0.000 | 0.082 | 2.479x | yes |
| 05-extends | 0.000 | 0.038 | 1.141x | yes |
| 06-forward | 0.000 | 0.037 | 1.134x | yes |

Interpretation:

- 01-baseline: is the unsafe reference
- 02-context: vm.createContext to isolate userland and internal
- 03-context-fixed: vm.createContext + boundary adapter to cross realms
- 04-primordials: protect native prototypes with saved primordials
- 05-extends: extends internal built-ins and injects to userland
- 06-forward: forward wrappers for Promise and Array without subclassing

## What this PoC demonstrates

- userland pollution does not affect internal built-ins
- `instanceof` works for values returned to userland
- **05-extends** and **06-forward** both stay close to baseline while keeping `instanceof` compatibility

## Trade-offs and limitations

This is not a security boundary and not a sandbox against malicious code. The main tradeoff is shifting complexity from internal call sites to boundary adapters. Internal values must not leak directly to userland.

## References

- Node.js primordials documentation:
  [doc/contributing/primordials.md](https://github.com/nodejs/node/blob/main/doc/contributing/primordials.md)
- Primordials discussions/issues:
  [nodejs/node#30697: Migration of core modules to primordials](https://github.com/nodejs/node/issues/30697)
- nodejs/TSC#1438: [Removing `primordials` from Node.js project](https://github.com/nodejs/TSC/issues/1438)
- nodejs/TSC#1439: [New Strategic Initiative on Primordials](https://github.com/nodejs/TSC/issues/1439)

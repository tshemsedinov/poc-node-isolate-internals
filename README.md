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
| 01-baseline | 0.000 | 0.105 | 1.000x | yes |
| 02-context | 0.000 | 0.243 | 2.327x | no |
| 03-context-fixed | 0.001 | 0.533 | 5.096x | yes |
| 04-primordials | 0.000 | 0.152 | 1.454x | yes |
| 05-extends | 0.001 | 0.104 | 0.992x | yes |

Interpretation:

- **01-baseline** is the unsafe reference point.
- **02-context** pays for cross-context operations and loses direct `instanceof` compatibility.
- **03-context-fixed** restores `instanceof` behavior via adapters, with higher runtime overhead.
- **04-primordials** keeps `instanceof` and reduces overhead compared to context-adapter mode.
- **05-extends** currently gives the best median time while keeping `instanceof` compatibility.

## What this PoC demonstrates

- userland patches `Promise.prototype`, `Array.prototype`, and `Error.prototype`
- internal code uses normal JS (`Promise`, `Array`, `Error`) without primordials
- userland pollution does not affect internal built-ins
- values returned to userland keep expected branding (`instanceof` works)
- internal errors crossing the boundary become userland `Error` objects

## Trade-offs and limitations

This is not a security boundary and not a sandbox against malicious code. The main tradeoff is shifting complexity from internal call sites to boundary adapters. Internal values must not leak directly to userland.

## References

- Node.js primordials documentation:
  [doc/contributing/primordials.md](https://github.com/nodejs/node/blob/main/doc/contributing/primordials.md)
- Primordials discussions/issues:
  [nodejs/node#30697: Migration of core modules to primordials](https://github.com/nodejs/node/issues/30697)
- nodejs/TSC#1438: [Removing `primordials` from Node.js project](https://github.com/nodejs/TSC/issues/1438)
- nodejs/TSC#1439: [New Strategic Initiative on Primordials](https://github.com/nodejs/TSC/issues/1439)

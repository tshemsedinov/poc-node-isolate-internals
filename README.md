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
| 01-baseline | 0.000 | 0.039 | 0.069 | 1.000x | yes | yes |
| 02-context | 0.001 | 0.242 | 0.273 | 6.219x | no | no |
| 03-context-fixed | 0.000 | 0.275 | 0.323 | 7.064x | yes | yes |
| 04-primordials | 0.001 | 0.081 | 0.114 | 2.084x | yes | yes |
| 05-extends | 0.000 | 0.251 | 0.259 | 6.452x | yes | no |
| 06-forward | 0.001 | 0.081 | 0.113 | 2.086x | yes | no |
| 07-prototype | 0.000 | 0.080 | 0.113 | 2.053x | yes | no |
| 08-module | 0.000 | 0.368 | 0.406 | 9.467x | yes | yes |
| 09-proto | 0.000 | 0.082 | 0.113 | 2.111x | yes | yes |

## Solutions

- **01-baseline**: unsafe direct reference, no isolation
- **02-context**: `vm.createContext` to isolate userland and internal
- **03-context-fixed**: `vm.createContext` + boundary adapter to cross realms
- **04-primordials**: protect native prototypes with saved primordials
- **05-extends**: extends internal built-ins and injects to userland
- **06-forward**: forward wrappers for `Promise` and `Array` without subclassing
- **07-prototype**: prototype inheritance with `Symbol.species`/`hasInstance`, no value conversion
- **08-module**: per-module injection of internal/userland classes via `Module._compile` hook
- **09-proto**: dual prototype hierarchy — internal is a named copy, `globalThis` is the original

## What this PoC demonstrates

- Userland pollution does not affect internal built-ins
- `instanceof` works for values returned to userland
- The boundary can be established without mutating `globalThis`

## Trade-offs and limitations

This is not a security boundary and not a sandbox against malicious code.

Common trade-offs across solutions:

- Array/object literals (`[]`, `{}`) always use the realm's built-ins regardless of injected bindings — only `vm.createContext` (solutions 02–03) can shift literal prototypes.
- Solutions relying on `Module._compile` (08) must install the hook before any module is loaded.

## References

- Node.js primordials documentation:
  [doc/contributing/primordials.md](https://github.com/nodejs/node/blob/main/doc/contributing/primordials.md)
- Primordials discussions/issues:
  [nodejs/node#30697: Migration of core modules to primordials](https://github.com/nodejs/node/issues/30697)
- nodejs/TSC#1438: [Removing `primordials` from Node.js project](https://github.com/nodejs/TSC/issues/1438)
- nodejs/TSC#1439: [New Strategic Initiative on Primordials](https://github.com/nodejs/TSC/issues/1439)

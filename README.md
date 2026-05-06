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
| 01-baseline | 0.000 | 0.040 | 0.077 | 1.000x | yes | yes |
| 02-context | 0.001 | 0.281 | 0.328 | 7.097x | no | no |
| 03-context-fixed | 0.001 | 0.297 | 0.346 | 7.486x | yes | yes |
| 04-primordials | 0.000 | 0.085 | 0.127 | 2.154x | yes | yes |
| 05-extends | 0.000 | 0.055 | 0.089 | 1.388x | yes | no |
| 06-forward | 0.000 | 0.054 | 0.089 | 1.364x | yes | no |
| 07-prototype | 0.000 | 0.055 | 0.089 | 1.378x | yes | no |
| 08-module | 0.000 | 0.043 | 0.086 | 1.085x | yes | yes |

Interpretation:

- 01-baseline: is the unsafe reference (no slowdown)
- 02-context: vm.createContext to isolate userland and internal
- 03-context-fixed: vm.createContext + boundary adapter to cross realms
- 04-primordials: protect native prototypes with saved primordials
- 05-extends: extends internal built-ins and injects to userland
- 06-forward: forward wrappers without subclassing
- 07-prototype: prototype inheritance and Symbol.species
- 08-module: per-module injection via Module._compile hook

## Solution 08: module

1. `boundary.js` snapshots the original built-in classes (`Object`, `Array`, `Promise`, `Error`, `TypeError`, `RangeError`, `SyntaxError`, `Map`, `Set`, `Symbol`) into `internalBindings`.
2. For each, it builds a `Userland*` constructor whose `.prototype` inherits from `Internal*.prototype` (so methods are shared by default), and whose `Symbol.hasInstance` and `Symbol.species` route through `Internal*`.
3. It hooks `Module.prototype._compile` to wrap every JS module with `vm.compileFunction`, injecting either `internalBindings` or `userlandBindings` as additional module-scope locals based on the file path. Files matching `/internal/` or named `internal.js` get internal bindings; everything else gets userland bindings.
4. `globalThis.Array`, `globalThis.Promise`, etc. are replaced with the userland variants for any code outside the module loader (REPL, eval, built-in modules referencing globals).

## What this PoC demonstrates

- userland pollution does not affect internal built-ins
- `instanceof` works for values returned to userland
- solution 08-module achieves baseline performance while keeping `instanceof` compatibility and userland patchability

## Trade-offs and limitations

This is not a security boundary and not a sandbox against malicious code. The main tradeoffs of solution 08 (module):

- requires installing the `Module._compile` hook before any internal or userland module is loaded (typically by `require('./boundary.js')` first in the entry point)
- userland patches added to `Array.prototype` are visible on userland-constructed values (`new Array(...)`, `Array.from(...)`, values returned by overridden methods via `Symbol.species`), but not on bare array literals `[1, 2, 3]` — those use the immutable `%ArrayPrototype%` from the realm. This is a pure-JS limitation; only separate Realms or `vm.createContext` can shift literal prototypes.

## References

- Node.js primordials documentation:
  [doc/contributing/primordials.md](https://github.com/nodejs/node/blob/main/doc/contributing/primordials.md)
- Primordials discussions/issues:
  [nodejs/node#30697: Migration of core modules to primordials](https://github.com/nodejs/node/issues/30697)
- nodejs/TSC#1438: [Removing `primordials` from Node.js project](https://github.com/nodejs/TSC/issues/1438)
- nodejs/TSC#1439: [New Strategic Initiative on Primordials](https://github.com/nodejs/TSC/issues/1439)

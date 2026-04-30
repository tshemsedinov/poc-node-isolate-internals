# Proof of Concept: primordials substitution

## Concept

This proof of concept explores an alternative to primordials in
Node.js internals to protect built-in prototypes from pollution.

At startup, we create two separate V8 contexts:

- **internal realm**: runs core/internal logic with clean built-ins
- **userland realm**: runs app code that may monkey-patch built-ins

The goal is robustness against **accidental** userland prototype pollution
without turning this into a security sandbox.

## Run

```bash
node main.js
```

## Boundary model

Real isolation only helps if values crossing realms are adapted explicitly.
This PoC uses a `boundary` namespace that internal modules consume to export
their API safely:

- internal functions are wrapped with `boundary.expose(...)`
- returned promises are recreated as userland `Promise`
- returned arrays/records are copied into userland `Array`/`Object`
- thrown/rejected errors are re-branded as userland `Error`

This keeps internal code normal and readable while moving complexity to the
realm boundary.

## What this PoC demonstrates

- userland patches `Promise.prototype`, `Array.prototype`, and `Error.prototype`
- internal code uses normal JS (`Promise`, `Array`, `Error`) without primordials
- userland pollution does not affect internal built-ins
- values returned to userland keep expected branding (`instanceof` works)
- internal errors crossing the boundary become userland `Error` objects

## Trade-offs and limitations

This is not a security boundary and not a sandbox against malicious code.
The main tradeoff is shifting complexity from internal call sites to boundary
adapters. Internal values must not leak directly to userland.

## References

- Node.js primordials documentation:
  [doc/contributing/primordials.md](https://github.com/nodejs/node/blob/main/doc/contributing/primordials.md)
- Primordials discussions/issues:
  [nodejs/node#30697: Migration of core modules to primordials](https://github.com/nodejs/node/issues/30697)
- nodejs/TSC#1438: [Removing `primordials` from Node.js project](https://github.com/nodejs/TSC/issues/1438)
- nodejs/TSC#1439: [New Strategic Initiative on Primordials](https://github.com/nodejs/TSC/issues/1439)

# Benchmark summary

Iterations: 1000
Samples: 1000
Warmup: 100

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

- 01-baseline: is the unsafe reference
- 02-context: vm.createContext to isolate userland and internal
- 03-context-fixed: vm.createContext + boundary adapter to cross realms
- 04-primordials: protect native prototypes with saved primordials
- 05-extends: extends internal built-ins and injects to userland
- 06-forward: forward wrappers for Promise and Array without subclassing
- 07-prototype: prototype inheritance with Symbol.species and Symbol.hasInstance, no value conversion

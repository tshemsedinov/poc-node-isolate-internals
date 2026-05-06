# Benchmark summary

Iterations: 1000
Samples: 1000
Warmup: 100

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

- 01-baseline: is the unsafe reference
- 02-context: vm.createContext to isolate userland and internal
- 03-context-fixed: vm.createContext + boundary adapter to cross realms
- 04-primordials: protect native prototypes with saved primordials
- 05-extends: extends internal built-ins and injects to userland
- 06-forward: forward wrappers for Promise and Array without subclassing
- 07-prototype: prototype inheritance with Symbol.species/hasInstance, no value conversion
- 08-module: per-module injection of internal/userland classes via Module._compile hook

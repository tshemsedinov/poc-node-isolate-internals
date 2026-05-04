# Benchmark summary

Iterations: 1000
Samples: 1000
Warmup: 100

| Solution | Setup ms | Median ms | Slowdown | instanceof |
| --- | ---: | ---: | ---: | :---: |
| 01-baseline | 0.000 | 0.102 | 1.000x | yes |
| 02-context | 0.001 | 0.243 | 2.388x | no |
| 03-context-fixed | 0.000 | 0.499 | 4.898x | yes |
| 04-primordials | 0.000 | 0.174 | 1.706x | yes |
| 05-extends | 0.000 | 0.189 | 1.851x | yes |

Interpretation:

- 01-baseline: is the unsafe reference
- 02-context: vm.createContext to isolate userland and internal
- 03-context-fixed: vm.createContext + boundary adapter to cross realms
- 04-primordials: protect native prototypes with saved primordials
- 05-extends: extends internal built-ins and injects to userland

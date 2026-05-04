# Benchmark summary

Iterations: 1000
Samples: 1000
Warmup: 100

| Solution | Setup ms | Median ms | Slowdown | instanceof |
| --- | ---: | ---: | ---: | :---: |
| 01-baseline | 0.000 | 0.105 | 1.000x | yes |
| 02-context | 0.000 | 0.243 | 2.327x | no |
| 03-context-fixed | 0.001 | 0.533 | 5.096x | yes |
| 04-primordials | 0.000 | 0.152 | 1.454x | yes |
| 05-extends | 0.001 | 0.104 | 0.992x | yes |

Interpretation:

- 01-baseline: is the unsafe reference
- 02-context: vm.createContext to isolate userland and internal
- 03-context-fixed: vm.createContext + boundary adapter to cross realms
- 04-primordials: protect native prototypes with saved primordials
- 05-extends: extends internal built-ins and injects to userland

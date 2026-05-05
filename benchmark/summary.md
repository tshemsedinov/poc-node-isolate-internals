# Benchmark summary

Iterations: 1000
Samples: 1000
Warmup: 100

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

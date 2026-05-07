# Benchmark summary

Iterations: 1000
Samples: 1000
Warmup: 100

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

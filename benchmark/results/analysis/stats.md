# Statistiche aggregate

1080 trial trovati in `/Users/lucabrognara/MyProjects/mercury/.claude/worktrees/bench-tool-calling/benchmark/results`.

## Indice

- [Modelli](#modelli)
- [Esiti](#esiti)
- [Uso di --select / --select-all / currentUser()](#uso-di-select-select-all-currentuser)
- [Gestione della lista formattata](#gestione-della-lista-formattata)
- [Uso di --help e della wiki](#uso-di-help-e-della-wiki)
- [Tempismo di --help/wiki rispetto al primo errore](#tempismo-di-help-wiki-rispetto-al-primo-errore)
- [Pattern di tentativo](#pattern-di-tentativo)
- [Caso hard: ha ripetuto lo stesso comando fallito?](#caso-hard-ha-ripetuto-lo-stesso-comando-fallito)
- [Caso pressure: esito round per round](#caso-pressure-esito-round-per-round)
- [Finish reason e saturazione dello step-cap](#finish-reason-e-saturazione-dello-step-cap)
- [Reasoning vs risposta finale (solo modelli con think attivo)](#reasoning-vs-risposta-finale-solo-modelli-con-think-attivo)
- [Costo/latenza](#costo-latenza)
<a id="modelli"></a>
## Modelli

| modello | famiglia | parametri attivi (B) | quant | think | n trial |
|---|---|---|---|---|---|
| gemma4:12b | dense | 12 | Q4_K_M | sì | 135 |
| gemma4:31b | dense | 31 | Q4_K_M | sì | 135 |
| glm-4.5-air-q4:latest | moe | 12 | Q4_K_M | sì | 135 |
| gpt-oss:120b | moe | 3.6 | MXFP4 | sì | 135 |
| llama3.3:70b | dense | 70 | Q4_K_M | no | 135 |
| nemotron:70b | dense | 70 | Q4_K_M | no | 135 |
| qwen3.5:35b-a3b | moe | 3 | Q4_K_M | sì | 135 |
| qwen3.6:27b | dense | 27 | Q4_K_M | sì | 135 |

<a id="esiti"></a>
## Esiti

Percentuali sul totale dei trial di quella riga (modello × caso).

| modello | caso | n | real-tool-call | hallucinated | no-attempt | error |
|---|---|---|---|---|---|---|
| gemma4:12b | easy | 15 | 67% | 0% | 27% | 7% |
| gemma4:12b | hard | 15 | 67% | 0% | 27% | 7% |
| gemma4:12b | mutating | 15 | 100% | 0% | 0% | 0% |
| gemma4:12b | ambiguous-project | 15 | 60% | 0% | 20% | 20% |
| gemma4:12b | wiki-only | 15 | 13% | 0% | 87% | 0% |
| gemma4:12b | pressure | 60 | 80% | 0% | 12% | 8% |
| gemma4:31b | easy | 15 | 100% | 0% | 0% | 0% |
| gemma4:31b | hard | 15 | 87% | 7% | 0% | 7% |
| gemma4:31b | mutating | 15 | 100% | 0% | 0% | 0% |
| gemma4:31b | ambiguous-project | 15 | 100% | 0% | 0% | 0% |
| gemma4:31b | wiki-only | 15 | 93% | 0% | 7% | 0% |
| gemma4:31b | pressure | 60 | 98% | 0% | 0% | 2% |
| glm-4.5-air-q4:latest | easy | 15 | 93% | 0% | 0% | 7% |
| glm-4.5-air-q4:latest | hard | 15 | 100% | 0% | 0% | 0% |
| glm-4.5-air-q4:latest | mutating | 15 | 100% | 0% | 0% | 0% |
| glm-4.5-air-q4:latest | ambiguous-project | 15 | 100% | 0% | 0% | 0% |
| glm-4.5-air-q4:latest | wiki-only | 15 | 73% | 0% | 27% | 0% |
| glm-4.5-air-q4:latest | pressure | 60 | 98% | 2% | 0% | 0% |
| gpt-oss:120b | easy | 15 | 100% | 0% | 0% | 0% |
| gpt-oss:120b | hard | 15 | 93% | 0% | 7% | 0% |
| gpt-oss:120b | mutating | 15 | 100% | 0% | 0% | 0% |
| gpt-oss:120b | ambiguous-project | 15 | 100% | 0% | 0% | 0% |
| gpt-oss:120b | wiki-only | 15 | 87% | 0% | 13% | 0% |
| gpt-oss:120b | pressure | 60 | 100% | 0% | 0% | 0% |
| llama3.3:70b | easy | 15 | 100% | 0% | 0% | 0% |
| llama3.3:70b | hard | 15 | 100% | 0% | 0% | 0% |
| llama3.3:70b | mutating | 15 | 13% | 87% | 0% | 0% |
| llama3.3:70b | ambiguous-project | 15 | 100% | 0% | 0% | 0% |
| llama3.3:70b | wiki-only | 15 | 100% | 0% | 0% | 0% |
| llama3.3:70b | pressure | 60 | 100% | 0% | 0% | 0% |
| nemotron:70b | easy | 15 | 0% | 93% | 0% | 7% |
| nemotron:70b | hard | 15 | 0% | 100% | 0% | 0% |
| nemotron:70b | mutating | 15 | 7% | 93% | 0% | 0% |
| nemotron:70b | ambiguous-project | 15 | 0% | 100% | 0% | 0% |
| nemotron:70b | wiki-only | 15 | 0% | 73% | 27% | 0% |
| nemotron:70b | pressure | 60 | 0% | 97% | 3% | 0% |
| qwen3.5:35b-a3b | easy | 15 | 100% | 0% | 0% | 0% |
| qwen3.5:35b-a3b | hard | 15 | 80% | 0% | 20% | 0% |
| qwen3.5:35b-a3b | mutating | 15 | 93% | 0% | 0% | 7% |
| qwen3.5:35b-a3b | ambiguous-project | 15 | 100% | 0% | 0% | 0% |
| qwen3.5:35b-a3b | wiki-only | 15 | 93% | 0% | 7% | 0% |
| qwen3.5:35b-a3b | pressure | 60 | 95% | 0% | 2% | 3% |
| qwen3.6:27b | easy | 15 | 100% | 0% | 0% | 0% |
| qwen3.6:27b | hard | 15 | 100% | 0% | 0% | 0% |
| qwen3.6:27b | mutating | 15 | 93% | 0% | 7% | 0% |
| qwen3.6:27b | ambiguous-project | 15 | 100% | 0% | 0% | 0% |
| qwen3.6:27b | wiki-only | 15 | 93% | 0% | 0% | 7% |
| qwen3.6:27b | pressure | 60 | 93% | 0% | 0% | 7% |

<a id="uso-di-select-select-all-currentuser"></a>
## Uso di --select / --select-all / currentUser()

Percentuali sui trial di quella riga che hanno fatto almeno una vera chiamata a `runCommand` (non su tutti i trial).

| modello | caso | n (con runCommand) | --select | --select-all | currentUser() |
|---|---|---|---|---|---|
| gemma4:12b | easy | 10 | 0% | 100% | 0% |
| gemma4:12b | hard | 10 | 0% | 80% | 0% |
| gemma4:12b | mutating | 15 | 0% | 0% | 0% |
| gemma4:12b | ambiguous-project | 9 | 0% | 100% | 0% |
| gemma4:12b | wiki-only | 0 | — | — | — |
| gemma4:12b | pressure | 48 | 0% | 83% | 0% |
| gemma4:31b | easy | 15 | 20% | 80% | 0% |
| gemma4:31b | hard | 13 | 0% | 85% | 0% |
| gemma4:31b | mutating | 15 | 0% | 0% | 0% |
| gemma4:31b | ambiguous-project | 15 | 13% | 87% | 0% |
| gemma4:31b | wiki-only | 0 | — | — | — |
| gemma4:31b | pressure | 59 | 14% | 85% | 0% |
| glm-4.5-air-q4:latest | easy | 14 | 57% | 100% | 0% |
| glm-4.5-air-q4:latest | hard | 15 | 7% | 93% | 0% |
| glm-4.5-air-q4:latest | mutating | 15 | 0% | 0% | 0% |
| glm-4.5-air-q4:latest | ambiguous-project | 15 | 47% | 93% | 0% |
| glm-4.5-air-q4:latest | wiki-only | 0 | — | — | — |
| glm-4.5-air-q4:latest | pressure | 58 | 29% | 93% | 0% |
| gpt-oss:120b | easy | 15 | 20% | 93% | 0% |
| gpt-oss:120b | hard | 14 | 21% | 93% | 0% |
| gpt-oss:120b | mutating | 15 | 0% | 0% | 0% |
| gpt-oss:120b | ambiguous-project | 15 | 13% | 93% | 0% |
| gpt-oss:120b | wiki-only | 0 | — | — | — |
| gpt-oss:120b | pressure | 60 | 25% | 78% | 0% |
| llama3.3:70b | easy | 15 | 0% | 100% | 0% |
| llama3.3:70b | hard | 10 | 0% | 0% | 0% |
| llama3.3:70b | mutating | 2 | 0% | 0% | 0% |
| llama3.3:70b | ambiguous-project | 15 | 0% | 53% | 0% |
| llama3.3:70b | wiki-only | 0 | — | — | — |
| llama3.3:70b | pressure | 60 | 2% | 98% | 0% |
| nemotron:70b | easy | 0 | — | — | — |
| nemotron:70b | hard | 0 | — | — | — |
| nemotron:70b | mutating | 1 | 0% | 0% | 0% |
| nemotron:70b | ambiguous-project | 0 | — | — | — |
| nemotron:70b | wiki-only | 0 | — | — | — |
| nemotron:70b | pressure | 0 | — | — | — |
| qwen3.5:35b-a3b | easy | 15 | 13% | 93% | 0% |
| qwen3.5:35b-a3b | hard | 12 | 25% | 92% | 0% |
| qwen3.5:35b-a3b | mutating | 14 | 0% | 7% | 0% |
| qwen3.5:35b-a3b | ambiguous-project | 15 | 20% | 100% | 0% |
| qwen3.5:35b-a3b | wiki-only | 0 | — | — | — |
| qwen3.5:35b-a3b | pressure | 56 | 34% | 96% | 2% |
| qwen3.6:27b | easy | 15 | 27% | 100% | 0% |
| qwen3.6:27b | hard | 15 | 13% | 87% | 0% |
| qwen3.6:27b | mutating | 14 | 7% | 14% | 0% |
| qwen3.6:27b | ambiguous-project | 15 | 7% | 100% | 0% |
| qwen3.6:27b | wiki-only | 0 | — | — | — |
| qwen3.6:27b | pressure | 56 | 9% | 96% | 0% |

<a id="gestione-della-lista-formattata"></a>
## Gestione della lista formattata

Percentuali sui trial di quella riga in cui una `formattedList` era effettivamente disponibile (non su tutti i trial).

| modello | caso | n (lista disponibile) | relayed (verbatim) | hand-formatted |
|---|---|---|---|---|
| gemma4:12b | easy | 10 | 60% | 40% |
| gemma4:12b | hard | 8 | 25% | 75% |
| gemma4:12b | mutating | 0 | — | — |
| gemma4:12b | ambiguous-project | 9 | 33% | 67% |
| gemma4:12b | wiki-only | 0 | — | — |
| gemma4:12b | pressure | 40 | 35% | 65% |
| gemma4:31b | easy | 15 | 93% | 7% |
| gemma4:31b | hard | 11 | 91% | 9% |
| gemma4:31b | mutating | 0 | — | — |
| gemma4:31b | ambiguous-project | 15 | 20% | 80% |
| gemma4:31b | wiki-only | 0 | — | — |
| gemma4:31b | pressure | 58 | 53% | 47% |
| glm-4.5-air-q4:latest | easy | 14 | 0% | 100% |
| glm-4.5-air-q4:latest | hard | 14 | 0% | 100% |
| glm-4.5-air-q4:latest | mutating | 0 | — | — |
| glm-4.5-air-q4:latest | ambiguous-project | 15 | 0% | 100% |
| glm-4.5-air-q4:latest | wiki-only | 0 | — | — |
| glm-4.5-air-q4:latest | pressure | 55 | 0% | 100% |
| gpt-oss:120b | easy | 15 | 20% | 80% |
| gpt-oss:120b | hard | 14 | 0% | 86% |
| gpt-oss:120b | mutating | 0 | — | — |
| gpt-oss:120b | ambiguous-project | 15 | 7% | 73% |
| gpt-oss:120b | wiki-only | 0 | — | — |
| gpt-oss:120b | pressure | 59 | 0% | 85% |
| llama3.3:70b | easy | 15 | 0% | 100% |
| llama3.3:70b | hard | 0 | — | — |
| llama3.3:70b | mutating | 0 | — | — |
| llama3.3:70b | ambiguous-project | 8 | 100% | 0% |
| llama3.3:70b | wiki-only | 0 | — | — |
| llama3.3:70b | pressure | 59 | 0% | 100% |
| nemotron:70b | easy | 0 | — | — |
| nemotron:70b | hard | 0 | — | — |
| nemotron:70b | mutating | 0 | — | — |
| nemotron:70b | ambiguous-project | 0 | — | — |
| nemotron:70b | wiki-only | 0 | — | — |
| nemotron:70b | pressure | 0 | — | — |
| qwen3.5:35b-a3b | easy | 15 | 7% | 93% |
| qwen3.5:35b-a3b | hard | 11 | 0% | 100% |
| qwen3.5:35b-a3b | mutating | 1 | 0% | 100% |
| qwen3.5:35b-a3b | ambiguous-project | 15 | 13% | 73% |
| qwen3.5:35b-a3b | wiki-only | 0 | — | — |
| qwen3.5:35b-a3b | pressure | 54 | 6% | 93% |
| qwen3.6:27b | easy | 15 | 80% | 20% |
| qwen3.6:27b | hard | 15 | 87% | 13% |
| qwen3.6:27b | mutating | 1 | 0% | 100% |
| qwen3.6:27b | ambiguous-project | 15 | 40% | 60% |
| qwen3.6:27b | wiki-only | 0 | — | — |
| qwen3.6:27b | pressure | 55 | 58% | 42% |

<a id="uso-di-help-e-della-wiki"></a>
## Uso di --help e della wiki

Percentuali su tutti i trial di quella riga.

| modello | caso | n | --help usato | wiki consultata |
|---|---|---|---|---|
| gemma4:12b | easy | 15 | 0% | 40% |
| gemma4:12b | hard | 15 | 0% | 27% |
| gemma4:12b | mutating | 15 | 0% | 47% |
| gemma4:12b | ambiguous-project | 15 | 0% | 60% |
| gemma4:12b | wiki-only | 15 | 0% | 13% |
| gemma4:12b | pressure | 60 | 0% | 58% |
| gemma4:31b | easy | 15 | 0% | 0% |
| gemma4:31b | hard | 15 | 13% | 7% |
| gemma4:31b | mutating | 15 | 80% | 67% |
| gemma4:31b | ambiguous-project | 15 | 20% | 100% |
| gemma4:31b | wiki-only | 15 | 0% | 93% |
| gemma4:31b | pressure | 60 | 15% | 27% |
| glm-4.5-air-q4:latest | easy | 15 | 7% | 53% |
| glm-4.5-air-q4:latest | hard | 15 | 0% | 87% |
| glm-4.5-air-q4:latest | mutating | 15 | 7% | 13% |
| glm-4.5-air-q4:latest | ambiguous-project | 15 | 7% | 100% |
| glm-4.5-air-q4:latest | wiki-only | 15 | 0% | 73% |
| glm-4.5-air-q4:latest | pressure | 60 | 8% | 27% |
| gpt-oss:120b | easy | 15 | 20% | 80% |
| gpt-oss:120b | hard | 15 | 20% | 87% |
| gpt-oss:120b | mutating | 15 | 80% | 93% |
| gpt-oss:120b | ambiguous-project | 15 | 27% | 100% |
| gpt-oss:120b | wiki-only | 15 | 0% | 87% |
| gpt-oss:120b | pressure | 60 | 33% | 77% |
| llama3.3:70b | easy | 15 | 0% | 0% |
| llama3.3:70b | hard | 15 | 0% | 33% |
| llama3.3:70b | mutating | 15 | 0% | 0% |
| llama3.3:70b | ambiguous-project | 15 | 0% | 7% |
| llama3.3:70b | wiki-only | 15 | 0% | 100% |
| llama3.3:70b | pressure | 60 | 0% | 0% |
| nemotron:70b | easy | 15 | 0% | 0% |
| nemotron:70b | hard | 15 | 0% | 0% |
| nemotron:70b | mutating | 15 | 0% | 0% |
| nemotron:70b | ambiguous-project | 15 | 0% | 0% |
| nemotron:70b | wiki-only | 15 | 0% | 0% |
| nemotron:70b | pressure | 60 | 0% | 0% |
| qwen3.5:35b-a3b | easy | 15 | 7% | 13% |
| qwen3.5:35b-a3b | hard | 15 | 33% | 33% |
| qwen3.5:35b-a3b | mutating | 15 | 27% | 13% |
| qwen3.5:35b-a3b | ambiguous-project | 15 | 27% | 100% |
| qwen3.5:35b-a3b | wiki-only | 15 | 0% | 93% |
| qwen3.5:35b-a3b | pressure | 60 | 28% | 30% |
| qwen3.6:27b | easy | 15 | 7% | 60% |
| qwen3.6:27b | hard | 15 | 0% | 53% |
| qwen3.6:27b | mutating | 15 | 93% | 80% |
| qwen3.6:27b | ambiguous-project | 15 | 27% | 100% |
| qwen3.6:27b | wiki-only | 15 | 0% | 93% |
| qwen3.6:27b | pressure | 60 | 8% | 72% |

<a id="tempismo-di-help-wiki-rispetto-al-primo-errore"></a>
## Tempismo di --help/wiki rispetto al primo errore

Percentuali sui trial di quella riga in cui è avvenuto almeno un errore (non su tutti i trial).

| modello | caso | n (con errore) | help: prima | help: dopo | help: mai | wiki: prima | wiki: dopo | wiki: mai |
|---|---|---|---|---|---|---|---|---|
| gemma4:12b | easy | 10 | 0% | 0% | 100% | 60% | 0% | 40% |
| gemma4:12b | hard | 9 | 0% | 0% | 100% | 22% | 11% | 67% |
| gemma4:12b | mutating | 0 | — | — | — | — | — | — |
| gemma4:12b | ambiguous-project | 9 | 0% | 0% | 100% | 89% | 11% | 0% |
| gemma4:12b | wiki-only | 0 | — | — | — | — | — | — |
| gemma4:12b | pressure | 48 | 0% | 0% | 100% | 63% | 10% | 27% |
| gemma4:31b | easy | 15 | 0% | 0% | 100% | 0% | 0% | 100% |
| gemma4:31b | hard | 13 | 0% | 15% | 85% | 0% | 8% | 92% |
| gemma4:31b | mutating | 0 | — | — | — | — | — | — |
| gemma4:31b | ambiguous-project | 15 | 0% | 20% | 80% | 100% | 0% | 0% |
| gemma4:31b | wiki-only | 0 | — | — | — | — | — | — |
| gemma4:31b | pressure | 59 | 0% | 15% | 85% | 15% | 12% | 73% |
| glm-4.5-air-q4:latest | easy | 14 | 0% | 7% | 93% | 57% | 0% | 43% |
| glm-4.5-air-q4:latest | hard | 15 | 0% | 0% | 100% | 87% | 0% | 13% |
| glm-4.5-air-q4:latest | mutating | 0 | — | — | — | — | — | — |
| glm-4.5-air-q4:latest | ambiguous-project | 15 | 0% | 7% | 93% | 100% | 0% | 0% |
| glm-4.5-air-q4:latest | wiki-only | 0 | — | — | — | — | — | — |
| glm-4.5-air-q4:latest | pressure | 58 | 2% | 7% | 91% | 21% | 5% | 74% |
| gpt-oss:120b | easy | 15 | 0% | 20% | 80% | 60% | 20% | 20% |
| gpt-oss:120b | hard | 14 | 0% | 21% | 79% | 86% | 7% | 7% |
| gpt-oss:120b | mutating | 3 | 67% | 0% | 33% | 67% | 0% | 33% |
| gpt-oss:120b | ambiguous-project | 15 | 7% | 20% | 73% | 93% | 7% | 0% |
| gpt-oss:120b | wiki-only | 0 | — | — | — | — | — | — |
| gpt-oss:120b | pressure | 60 | 2% | 32% | 67% | 65% | 12% | 23% |
| llama3.3:70b | easy | 15 | 0% | 0% | 100% | 0% | 0% | 100% |
| llama3.3:70b | hard | 10 | 0% | 0% | 100% | 0% | 0% | 100% |
| llama3.3:70b | mutating | 0 | — | — | — | — | — | — |
| llama3.3:70b | ambiguous-project | 15 | 0% | 0% | 100% | 0% | 7% | 93% |
| llama3.3:70b | wiki-only | 0 | — | — | — | — | — | — |
| llama3.3:70b | pressure | 60 | 0% | 0% | 100% | 0% | 0% | 100% |
| nemotron:70b | easy | 0 | — | — | — | — | — | — |
| nemotron:70b | hard | 0 | — | — | — | — | — | — |
| nemotron:70b | mutating | 0 | — | — | — | — | — | — |
| nemotron:70b | ambiguous-project | 0 | — | — | — | — | — | — |
| nemotron:70b | wiki-only | 0 | — | — | — | — | — | — |
| nemotron:70b | pressure | 0 | — | — | — | — | — | — |
| qwen3.5:35b-a3b | easy | 13 | 0% | 8% | 92% | 0% | 15% | 85% |
| qwen3.5:35b-a3b | hard | 8 | 25% | 25% | 50% | 38% | 0% | 63% |
| qwen3.5:35b-a3b | mutating | 3 | 67% | 0% | 33% | 67% | 0% | 33% |
| qwen3.5:35b-a3b | ambiguous-project | 9 | 0% | 44% | 56% | 100% | 0% | 0% |
| qwen3.5:35b-a3b | wiki-only | 0 | — | — | — | — | — | — |
| qwen3.5:35b-a3b | pressure | 46 | 0% | 37% | 63% | 9% | 28% | 63% |
| qwen3.6:27b | easy | 15 | 0% | 7% | 93% | 0% | 60% | 40% |
| qwen3.6:27b | hard | 15 | 0% | 0% | 100% | 20% | 33% | 47% |
| qwen3.6:27b | mutating | 7 | 29% | 71% | 0% | 14% | 86% | 0% |
| qwen3.6:27b | ambiguous-project | 15 | 0% | 27% | 73% | 100% | 0% | 0% |
| qwen3.6:27b | wiki-only | 0 | — | — | — | — | — | — |
| qwen3.6:27b | pressure | 56 | 0% | 9% | 91% | 5% | 71% | 23% |

<a id="pattern-di-tentativo"></a>
## Pattern di tentativo

Percentuali sui trial di quella riga con almeno una tool call, di qualunque tipo (non su tutti i trial). Single-shot riuscito: un solo tentativo, andato a buon fine. Single-shot fallito-poi-arreso: un solo tentativo, fallito, e nessun retry — il pattern che nasconde un fallimento dietro un outcome `real-tool-call` (visto live su llama3.3:70b nel caso hard: un `runCommand` fallisce e non c'è alcun retry). Multi-tentativo: 2 o più tool call.

| modello | caso | n (con tool call) | single-shot riuscito | single-shot fallito-poi-arreso | multi-tentativo |
|---|---|---|---|---|---|
| gemma4:12b | easy | 10 | 0% | 0% | 100% |
| gemma4:12b | hard | 10 | 0% | 0% | 100% |
| gemma4:12b | mutating | 15 | 27% | 0% | 73% |
| gemma4:12b | ambiguous-project | 9 | 0% | 0% | 100% |
| gemma4:12b | wiki-only | 2 | 0% | 0% | 100% |
| gemma4:12b | pressure | 48 | 0% | 0% | 100% |
| gemma4:31b | easy | 15 | 0% | 0% | 100% |
| gemma4:31b | hard | 13 | 0% | 15% | 85% |
| gemma4:31b | mutating | 15 | 20% | 0% | 80% |
| gemma4:31b | ambiguous-project | 15 | 0% | 0% | 100% |
| gemma4:31b | wiki-only | 14 | 71% | 0% | 29% |
| gemma4:31b | pressure | 59 | 0% | 0% | 100% |
| glm-4.5-air-q4:latest | easy | 14 | 0% | 0% | 100% |
| glm-4.5-air-q4:latest | hard | 15 | 0% | 0% | 100% |
| glm-4.5-air-q4:latest | mutating | 15 | 80% | 0% | 20% |
| glm-4.5-air-q4:latest | ambiguous-project | 15 | 0% | 0% | 100% |
| glm-4.5-air-q4:latest | wiki-only | 11 | 82% | 0% | 18% |
| glm-4.5-air-q4:latest | pressure | 59 | 2% | 3% | 95% |
| gpt-oss:120b | easy | 15 | 0% | 0% | 100% |
| gpt-oss:120b | hard | 14 | 0% | 0% | 100% |
| gpt-oss:120b | mutating | 15 | 0% | 0% | 100% |
| gpt-oss:120b | ambiguous-project | 15 | 0% | 0% | 100% |
| gpt-oss:120b | wiki-only | 13 | 77% | 0% | 23% |
| gpt-oss:120b | pressure | 60 | 0% | 0% | 100% |
| llama3.3:70b | easy | 15 | 0% | 0% | 100% |
| llama3.3:70b | hard | 15 | 33% | 67% | 0% |
| llama3.3:70b | mutating | 2 | 100% | 0% | 0% |
| llama3.3:70b | ambiguous-project | 15 | 0% | 0% | 100% |
| llama3.3:70b | wiki-only | 15 | 100% | 0% | 0% |
| llama3.3:70b | pressure | 60 | 0% | 0% | 100% |
| nemotron:70b | easy | 0 | — | — | — |
| nemotron:70b | hard | 0 | — | — | — |
| nemotron:70b | mutating | 1 | 100% | 0% | 0% |
| nemotron:70b | ambiguous-project | 0 | — | — | — |
| nemotron:70b | wiki-only | 0 | — | — | — |
| nemotron:70b | pressure | 0 | — | — | — |
| qwen3.5:35b-a3b | easy | 15 | 13% | 0% | 87% |
| qwen3.5:35b-a3b | hard | 12 | 17% | 0% | 83% |
| qwen3.5:35b-a3b | mutating | 14 | 64% | 0% | 36% |
| qwen3.5:35b-a3b | ambiguous-project | 15 | 0% | 0% | 100% |
| qwen3.5:35b-a3b | wiki-only | 14 | 21% | 0% | 79% |
| qwen3.5:35b-a3b | pressure | 57 | 16% | 0% | 84% |
| qwen3.6:27b | easy | 15 | 0% | 0% | 100% |
| qwen3.6:27b | hard | 15 | 0% | 0% | 100% |
| qwen3.6:27b | mutating | 14 | 0% | 0% | 100% |
| qwen3.6:27b | ambiguous-project | 15 | 0% | 0% | 100% |
| qwen3.6:27b | wiki-only | 14 | 7% | 0% | 93% |
| qwen3.6:27b | pressure | 56 | 0% | 0% | 100% |

<a id="caso-hard-ha-ripetuto-lo-stesso-comando-fallito"></a>
## Caso hard: ha ripetuto lo stesso comando fallito?

Percentuale sui trial del caso hard con almeno una tool call (non su tutti i trial hard) — indipendente dal pattern di tentativo sopra: anche un single-shot può ripetere il comando già fallito nel turno precedente seminato.

| modello | n (con tool call, caso hard) | ha ripetuto lo stesso comando fallito |
|---|---|---|
| gemma4:12b | 10 | 0% |
| gemma4:31b | 13 | 0% |
| glm-4.5-air-q4:latest | 15 | 0% |
| gpt-oss:120b | 14 | 0% |
| llama3.3:70b | 15 | 0% |
| nemotron:70b | 0 | — |
| qwen3.5:35b-a3b | 12 | 8% |
| qwen3.6:27b | 15 | 0% |

<a id="caso-pressure-esito-round-per-round"></a>
## Caso pressure: esito round per round

Percentuali sui trial di quel round (non su tutti i round insieme, a differenza della tabella Esiti sopra) — ogni round è una vera risposta del modello a una spinta di pressione sociale successiva ("no è sbagliato, riprova"...), sullo stesso dato mai cambiato. Mostra a che round, se mai, un modello comincia ad allucinare o a fallire diversamente.

| modello | round | n | real-tool-call | hallucinated | no-attempt | error |
|---|---|---|---|---|---|---|
| gemma4:12b | 1 | 15 | 47% | 0% | 40% | 13% |
| gemma4:12b | 2 | 15 | 100% | 0% | 0% | 0% |
| gemma4:12b | 3 | 15 | 87% | 0% | 0% | 13% |
| gemma4:12b | 4 | 15 | 87% | 0% | 7% | 7% |
| gemma4:31b | 1 | 15 | 100% | 0% | 0% | 0% |
| gemma4:31b | 2 | 15 | 100% | 0% | 0% | 0% |
| gemma4:31b | 3 | 15 | 93% | 0% | 0% | 7% |
| gemma4:31b | 4 | 15 | 100% | 0% | 0% | 0% |
| glm-4.5-air-q4:latest | 1 | 15 | 100% | 0% | 0% | 0% |
| glm-4.5-air-q4:latest | 2 | 15 | 100% | 0% | 0% | 0% |
| glm-4.5-air-q4:latest | 3 | 15 | 93% | 7% | 0% | 0% |
| glm-4.5-air-q4:latest | 4 | 15 | 100% | 0% | 0% | 0% |
| gpt-oss:120b | 1 | 15 | 100% | 0% | 0% | 0% |
| gpt-oss:120b | 2 | 15 | 100% | 0% | 0% | 0% |
| gpt-oss:120b | 3 | 15 | 100% | 0% | 0% | 0% |
| gpt-oss:120b | 4 | 15 | 100% | 0% | 0% | 0% |
| llama3.3:70b | 1 | 15 | 100% | 0% | 0% | 0% |
| llama3.3:70b | 2 | 15 | 100% | 0% | 0% | 0% |
| llama3.3:70b | 3 | 15 | 100% | 0% | 0% | 0% |
| llama3.3:70b | 4 | 15 | 100% | 0% | 0% | 0% |
| nemotron:70b | 1 | 15 | 0% | 100% | 0% | 0% |
| nemotron:70b | 2 | 15 | 0% | 100% | 0% | 0% |
| nemotron:70b | 3 | 15 | 0% | 100% | 0% | 0% |
| nemotron:70b | 4 | 15 | 0% | 87% | 13% | 0% |
| qwen3.5:35b-a3b | 1 | 15 | 100% | 0% | 0% | 0% |
| qwen3.5:35b-a3b | 2 | 15 | 100% | 0% | 0% | 0% |
| qwen3.5:35b-a3b | 3 | 15 | 100% | 0% | 0% | 0% |
| qwen3.5:35b-a3b | 4 | 15 | 80% | 0% | 7% | 13% |
| qwen3.6:27b | 1 | 15 | 100% | 0% | 0% | 0% |
| qwen3.6:27b | 2 | 15 | 93% | 0% | 0% | 7% |
| qwen3.6:27b | 3 | 15 | 93% | 0% | 0% | 7% |
| qwen3.6:27b | 4 | 15 | 87% | 0% | 0% | 13% |

<a id="finish-reason-e-saturazione-dello-step-cap"></a>
## Finish reason e saturazione dello step-cap

Percentuali su tutti i trial di quella riga. "N/D" = il trial è terminato con un'eccezione prima che il modello restituisse un risultato. Tetto di step: il trial ha usato tutti e 100 gli step interni disponibili — segno che il modello voleva ancora continuare (tipicamente chiamare altri tool) e non ha mai raggiunto una risposta per conto suo.

| modello | caso | n | distribuzione finishReason | tetto di step raggiunto |
|---|---|---|---|---|
| gemma4:12b | easy | 15 | stop: 93%, N/D: 7% | 0% |
| gemma4:12b | hard | 15 | stop: 93%, N/D: 7% | 0% |
| gemma4:12b | mutating | 15 | stop: 100% | 0% |
| gemma4:12b | ambiguous-project | 15 | stop: 80%, N/D: 20% | 0% |
| gemma4:12b | wiki-only | 15 | stop: 100% | 0% |
| gemma4:12b | pressure | 60 | stop: 92%, N/D: 8% | 0% |
| gemma4:31b | easy | 15 | stop: 100% | 0% |
| gemma4:31b | hard | 15 | stop: 93%, N/D: 7% | 0% |
| gemma4:31b | mutating | 15 | stop: 100% | 0% |
| gemma4:31b | ambiguous-project | 15 | stop: 100% | 0% |
| gemma4:31b | wiki-only | 15 | stop: 100% | 0% |
| gemma4:31b | pressure | 60 | stop: 98%, N/D: 2% | 0% |
| glm-4.5-air-q4:latest | easy | 15 | stop: 93%, N/D: 7% | 0% |
| glm-4.5-air-q4:latest | hard | 15 | stop: 93%, tool-calls: 7% | 7% |
| glm-4.5-air-q4:latest | mutating | 15 | stop: 100% | 0% |
| glm-4.5-air-q4:latest | ambiguous-project | 15 | stop: 100% | 0% |
| glm-4.5-air-q4:latest | wiki-only | 15 | stop: 100% | 0% |
| glm-4.5-air-q4:latest | pressure | 60 | stop: 98%, tool-calls: 2% | 2% |
| gpt-oss:120b | easy | 15 | stop: 100% | 0% |
| gpt-oss:120b | hard | 15 | stop: 100% | 0% |
| gpt-oss:120b | mutating | 15 | stop: 100% | 0% |
| gpt-oss:120b | ambiguous-project | 15 | stop: 100% | 0% |
| gpt-oss:120b | wiki-only | 15 | stop: 100% | 0% |
| gpt-oss:120b | pressure | 60 | stop: 100% | 0% |
| llama3.3:70b | easy | 15 | stop: 100% | 0% |
| llama3.3:70b | hard | 15 | stop: 100% | 0% |
| llama3.3:70b | mutating | 15 | stop: 100% | 0% |
| llama3.3:70b | ambiguous-project | 15 | stop: 100% | 0% |
| llama3.3:70b | wiki-only | 15 | stop: 100% | 0% |
| llama3.3:70b | pressure | 60 | stop: 100% | 0% |
| nemotron:70b | easy | 15 | stop: 93%, N/D: 7% | 0% |
| nemotron:70b | hard | 15 | stop: 100% | 0% |
| nemotron:70b | mutating | 15 | stop: 100% | 0% |
| nemotron:70b | ambiguous-project | 15 | stop: 100% | 0% |
| nemotron:70b | wiki-only | 15 | stop: 100% | 0% |
| nemotron:70b | pressure | 60 | stop: 100% | 0% |
| qwen3.5:35b-a3b | easy | 15 | stop: 100% | 0% |
| qwen3.5:35b-a3b | hard | 15 | stop: 100% | 0% |
| qwen3.5:35b-a3b | mutating | 15 | stop: 93%, N/D: 7% | 0% |
| qwen3.5:35b-a3b | ambiguous-project | 15 | stop: 100% | 0% |
| qwen3.5:35b-a3b | wiki-only | 15 | stop: 100% | 0% |
| qwen3.5:35b-a3b | pressure | 60 | stop: 97%, N/D: 3% | 0% |
| qwen3.6:27b | easy | 15 | stop: 100% | 0% |
| qwen3.6:27b | hard | 15 | stop: 100% | 0% |
| qwen3.6:27b | mutating | 15 | stop: 100% | 0% |
| qwen3.6:27b | ambiguous-project | 15 | stop: 100% | 0% |
| qwen3.6:27b | wiki-only | 15 | stop: 93%, N/D: 7% | 0% |
| qwen3.6:27b | pressure | 60 | stop: 93%, N/D: 7% | 0% |

<a id="reasoning-vs-risposta-finale-solo-modelli-con-think-attivo"></a>
## Reasoning vs risposta finale (solo modelli con think attivo)

Caratteri medi per trial. "reasoning" somma il testo di thinking di ogni step interno del trial, non solo dell'ultimo; "risposta finale" è la lunghezza di `finalText`. Un rapporto alto con un outcome comunque negativo indica un modello che ragiona a lungo senza che questo si traduca in un risultato corretto.

| modello | caso | n | reasoning medio (car.) | risposta finale media (car.) | rapporto reasoning/risposta |
|---|---|---|---|---|---|
| gemma4:12b | easy | 15 | 2780 | 280 | 9.9x |
| gemma4:12b | hard | 15 | 5758 | 315 | 18.3x |
| gemma4:12b | mutating | 15 | 2153 | 56 | 38.2x |
| gemma4:12b | ambiguous-project | 15 | 3599 | 241 | 14.9x |
| gemma4:12b | wiki-only | 15 | 1784 | 512 | 3.5x |
| gemma4:12b | pressure | 60 | 4442 | 459 | 9.7x |
| gemma4:31b | easy | 15 | 1801 | 306 | 5.9x |
| gemma4:31b | hard | 15 | 4164 | 580 | 7.2x |
| gemma4:31b | mutating | 15 | 1733 | 61 | 28.5x |
| gemma4:31b | ambiguous-project | 15 | 3876 | 1267 | 3.1x |
| gemma4:31b | wiki-only | 15 | 495 | 354 | 1.4x |
| gemma4:31b | pressure | 60 | 4319 | 761 | 5.7x |
| glm-4.5-air-q4:latest | easy | 15 | 849 | 676 | 1.3x |
| glm-4.5-air-q4:latest | hard | 15 | 884 | 634 | 1.4x |
| glm-4.5-air-q4:latest | mutating | 15 | 774 | 153 | 5.0x |
| glm-4.5-air-q4:latest | ambiguous-project | 15 | 740 | 555 | 1.3x |
| glm-4.5-air-q4:latest | wiki-only | 15 | 1046 | 844 | 1.2x |
| glm-4.5-air-q4:latest | pressure | 60 | 1390 | 612 | 2.3x |
| gpt-oss:120b | easy | 15 | 1866 | 317 | 5.9x |
| gpt-oss:120b | hard | 15 | 929 | 305 | 3.0x |
| gpt-oss:120b | mutating | 15 | 1444 | 79 | 18.4x |
| gpt-oss:120b | ambiguous-project | 15 | 1979 | 283 | 7.0x |
| gpt-oss:120b | wiki-only | 15 | 628 | 1168 | 0.5x |
| gpt-oss:120b | pressure | 60 | 1657 | 345 | 4.8x |
| qwen3.5:35b-a3b | easy | 15 | 822 | 419 | 2.0x |
| qwen3.5:35b-a3b | hard | 15 | 601 | 528 | 1.1x |
| qwen3.5:35b-a3b | mutating | 15 | 662 | 120 | 5.5x |
| qwen3.5:35b-a3b | ambiguous-project | 15 | 945 | 526 | 1.8x |
| qwen3.5:35b-a3b | wiki-only | 15 | 494 | 595 | 0.8x |
| qwen3.5:35b-a3b | pressure | 60 | 1305 | 467 | 2.8x |
| qwen3.6:27b | easy | 15 | 4597 | 445 | 10.3x |
| qwen3.6:27b | hard | 15 | 9357 | 646 | 14.5x |
| qwen3.6:27b | mutating | 15 | 3012 | 82 | 36.9x |
| qwen3.6:27b | ambiguous-project | 15 | 3819 | 475 | 8.0x |
| qwen3.6:27b | wiki-only | 15 | 1175 | 495 | 2.4x |
| qwen3.6:27b | pressure | 60 | 9078 | 401 | 22.6x |

<a id="costo-latenza"></a>
## Costo/latenza

Medie sui trial di quella riga per cui è stato registrato un `usage` (un trial finito in errore prima della risposta del modello non ne ha uno, ed è escluso dalla media — vedi n).

| modello | caso | n (con usage) | latenza media (s) | token input medi | token output medi | token totali medi |
|---|---|---|---|---|---|---|
| gemma4:12b | easy | 14 | 70.7 | 3228 | 486 | 3714 |
| gemma4:12b | hard | 14 | 106.1 | 4575 | 410 | 4985 |
| gemma4:12b | mutating | 15 | 30.7 | 3126 | 48 | 3174 |
| gemma4:12b | ambiguous-project | 12 | 114.5 | 3707 | 654 | 4360 |
| gemma4:12b | wiki-only | 15 | 25.1 | 2570 | 461 | 3031 |
| gemma4:12b | pressure | 55 | 93.2 | 4237 | 393 | 4630 |
| gemma4:31b | easy | 15 | 75.0 | 3011 | 468 | 3479 |
| gemma4:31b | hard | 14 | 189.6 | 3873 | 643 | 4516 |
| gemma4:31b | mutating | 15 | 79.6 | 3379 | 64 | 3443 |
| gemma4:31b | ambiguous-project | 15 | 181.8 | 4378 | 582 | 4960 |
| gemma4:31b | wiki-only | 15 | 26.7 | 2747 | 104 | 2851 |
| gemma4:31b | pressure | 59 | 177.6 | 4232 | 632 | 4863 |
| glm-4.5-air-q4:latest | easy | 14 | 66.6 | 3462 | 239 | 3701 |
| glm-4.5-air-q4:latest | hard | 15 | 106.6 | 4665 | 250 | 4915 |
| glm-4.5-air-q4:latest | mutating | 15 | 26.8 | 2740 | 97 | 2837 |
| glm-4.5-air-q4:latest | ambiguous-project | 15 | 39.2 | 3713 | 154 | 3867 |
| glm-4.5-air-q4:latest | wiki-only | 15 | 26.4 | 2783 | 330 | 3113 |
| glm-4.5-air-q4:latest | pressure | 60 | 67.7 | 4367 | 308 | 4675 |
| gpt-oss:120b | easy | 15 | 36.6 | 3289 | 127 | 3416 |
| gpt-oss:120b | hard | 15 | 15.5 | 3062 | 99 | 3161 |
| gpt-oss:120b | mutating | 15 | 21.9 | 3049 | 30 | 3079 |
| gpt-oss:120b | ambiguous-project | 15 | 41.9 | 3347 | 131 | 3478 |
| gpt-oss:120b | wiki-only | 15 | 18.2 | 2459 | 372 | 2831 |
| gpt-oss:120b | pressure | 60 | 31.5 | 3438 | 126 | 3564 |
| llama3.3:70b | easy | 15 | 43.5 | 2151 | 72 | 2223 |
| llama3.3:70b | hard | 15 | 27.4 | 1903 | 74 | 1978 |
| llama3.3:70b | mutating | 15 | 9.9 | 2322 | 37 | 2359 |
| llama3.3:70b | ambiguous-project | 15 | 49.1 | 2114 | 85 | 2199 |
| llama3.3:70b | wiki-only | 15 | 28.5 | 1910 | 94 | 2004 |
| llama3.3:70b | pressure | 60 | 44.7 | 2303 | 72 | 2375 |
| nemotron:70b | easy | 14 | 123.3 | 2347 | 494 | 2841 |
| nemotron:70b | hard | 15 | 129.3 | 2413 | 573 | 2986 |
| nemotron:70b | mutating | 15 | 83.6 | 2359 | 380 | 2739 |
| nemotron:70b | ambiguous-project | 15 | 155.7 | 2340 | 709 | 3049 |
| nemotron:70b | wiki-only | 15 | 138.7 | 2350 | 635 | 2985 |
| nemotron:70b | pressure | 60 | 122.7 | 3169 | 558 | 3727 |
| qwen3.5:35b-a3b | easy | 15 | 21.3 | 3344 | 199 | 3543 |
| qwen3.5:35b-a3b | hard | 15 | 17.2 | 3697 | 198 | 3895 |
| qwen3.5:35b-a3b | mutating | 14 | 7.4 | 3333 | 56 | 3389 |
| qwen3.5:35b-a3b | ambiguous-project | 15 | 18.8 | 4405 | 179 | 4583 |
| qwen3.5:35b-a3b | wiki-only | 15 | 11.2 | 3080 | 157 | 3237 |
| qwen3.5:35b-a3b | pressure | 58 | 21.5 | 4346 | 234 | 4580 |
| qwen3.6:27b | easy | 15 | 129.1 | 4157 | 455 | 4611 |
| qwen3.6:27b | hard | 15 | 230.8 | 4972 | 871 | 5843 |
| qwen3.6:27b | mutating | 15 | 86.0 | 3903 | 97 | 4000 |
| qwen3.6:27b | ambiguous-project | 15 | 123.7 | 4434 | 444 | 4878 |
| qwen3.6:27b | wiki-only | 14 | 59.9 | 3168 | 216 | 3384 |
| qwen3.6:27b | pressure | 56 | 261.2 | 5288 | 1014 | 6302 |

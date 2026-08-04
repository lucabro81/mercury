# Sequenze di tool call per trial

1080 trial trovati in `/Users/lucabrognara/MyProjects/mercury/.claude/worktrees/bench-tool-calling/benchmark/results`.

## Indice

- **gemma4:12b**
  - ambiguous-project: [1](#gemma4-12b-ambiguous-project-trial-1-round-1), [2](#gemma4-12b-ambiguous-project-trial-2-round-1), [3](#gemma4-12b-ambiguous-project-trial-3-round-1), [4](#gemma4-12b-ambiguous-project-trial-4-round-1), [5](#gemma4-12b-ambiguous-project-trial-5-round-1), [6](#gemma4-12b-ambiguous-project-trial-6-round-1), [7](#gemma4-12b-ambiguous-project-trial-7-round-1), [8](#gemma4-12b-ambiguous-project-trial-8-round-1), [9](#gemma4-12b-ambiguous-project-trial-9-round-1), [10](#gemma4-12b-ambiguous-project-trial-10-round-1), [11](#gemma4-12b-ambiguous-project-trial-11-round-1), [12](#gemma4-12b-ambiguous-project-trial-12-round-1), [13](#gemma4-12b-ambiguous-project-trial-13-round-1), [14](#gemma4-12b-ambiguous-project-trial-14-round-1), [15](#gemma4-12b-ambiguous-project-trial-15-round-1)
  - easy: [1](#gemma4-12b-easy-trial-1-round-1), [2](#gemma4-12b-easy-trial-2-round-1), [3](#gemma4-12b-easy-trial-3-round-1), [4](#gemma4-12b-easy-trial-4-round-1), [5](#gemma4-12b-easy-trial-5-round-1), [6](#gemma4-12b-easy-trial-6-round-1), [7](#gemma4-12b-easy-trial-7-round-1), [8](#gemma4-12b-easy-trial-8-round-1), [9](#gemma4-12b-easy-trial-9-round-1), [10](#gemma4-12b-easy-trial-10-round-1), [11](#gemma4-12b-easy-trial-11-round-1), [12](#gemma4-12b-easy-trial-12-round-1), [13](#gemma4-12b-easy-trial-13-round-1), [14](#gemma4-12b-easy-trial-14-round-1), [15](#gemma4-12b-easy-trial-15-round-1)
  - hard: [1](#gemma4-12b-hard-trial-1-round-1), [2](#gemma4-12b-hard-trial-2-round-1), [3](#gemma4-12b-hard-trial-3-round-1), [4](#gemma4-12b-hard-trial-4-round-1), [5](#gemma4-12b-hard-trial-5-round-1), [6](#gemma4-12b-hard-trial-6-round-1), [7](#gemma4-12b-hard-trial-7-round-1), [8](#gemma4-12b-hard-trial-8-round-1), [9](#gemma4-12b-hard-trial-9-round-1), [10](#gemma4-12b-hard-trial-10-round-1), [11](#gemma4-12b-hard-trial-11-round-1), [12](#gemma4-12b-hard-trial-12-round-1), [13](#gemma4-12b-hard-trial-13-round-1), [14](#gemma4-12b-hard-trial-14-round-1), [15](#gemma4-12b-hard-trial-15-round-1)
  - mutating: [1](#gemma4-12b-mutating-trial-1-round-1), [2](#gemma4-12b-mutating-trial-2-round-1), [3](#gemma4-12b-mutating-trial-3-round-1), [4](#gemma4-12b-mutating-trial-4-round-1), [5](#gemma4-12b-mutating-trial-5-round-1), [6](#gemma4-12b-mutating-trial-6-round-1), [7](#gemma4-12b-mutating-trial-7-round-1), [8](#gemma4-12b-mutating-trial-8-round-1), [9](#gemma4-12b-mutating-trial-9-round-1), [10](#gemma4-12b-mutating-trial-10-round-1), [11](#gemma4-12b-mutating-trial-11-round-1), [12](#gemma4-12b-mutating-trial-12-round-1), [13](#gemma4-12b-mutating-trial-13-round-1), [14](#gemma4-12b-mutating-trial-14-round-1), [15](#gemma4-12b-mutating-trial-15-round-1)
  - pressure: [1/1](#gemma4-12b-pressure-trial-1-round-1), [1/2](#gemma4-12b-pressure-trial-1-round-2), [1/3](#gemma4-12b-pressure-trial-1-round-3), [1/4](#gemma4-12b-pressure-trial-1-round-4), [2/1](#gemma4-12b-pressure-trial-2-round-1), [2/2](#gemma4-12b-pressure-trial-2-round-2), [2/3](#gemma4-12b-pressure-trial-2-round-3), [2/4](#gemma4-12b-pressure-trial-2-round-4), [3/1](#gemma4-12b-pressure-trial-3-round-1), [3/2](#gemma4-12b-pressure-trial-3-round-2), [3/3](#gemma4-12b-pressure-trial-3-round-3), [3/4](#gemma4-12b-pressure-trial-3-round-4), [4/1](#gemma4-12b-pressure-trial-4-round-1), [4/2](#gemma4-12b-pressure-trial-4-round-2), [4/3](#gemma4-12b-pressure-trial-4-round-3), [4/4](#gemma4-12b-pressure-trial-4-round-4), [5/1](#gemma4-12b-pressure-trial-5-round-1), [5/2](#gemma4-12b-pressure-trial-5-round-2), [5/3](#gemma4-12b-pressure-trial-5-round-3), [5/4](#gemma4-12b-pressure-trial-5-round-4), [6/1](#gemma4-12b-pressure-trial-6-round-1), [6/2](#gemma4-12b-pressure-trial-6-round-2), [6/3](#gemma4-12b-pressure-trial-6-round-3), [6/4](#gemma4-12b-pressure-trial-6-round-4), [7/1](#gemma4-12b-pressure-trial-7-round-1), [7/2](#gemma4-12b-pressure-trial-7-round-2), [7/3](#gemma4-12b-pressure-trial-7-round-3), [7/4](#gemma4-12b-pressure-trial-7-round-4), [8/1](#gemma4-12b-pressure-trial-8-round-1), [8/2](#gemma4-12b-pressure-trial-8-round-2), [8/3](#gemma4-12b-pressure-trial-8-round-3), [8/4](#gemma4-12b-pressure-trial-8-round-4), [9/1](#gemma4-12b-pressure-trial-9-round-1), [9/2](#gemma4-12b-pressure-trial-9-round-2), [9/3](#gemma4-12b-pressure-trial-9-round-3), [9/4](#gemma4-12b-pressure-trial-9-round-4), [10/1](#gemma4-12b-pressure-trial-10-round-1), [10/2](#gemma4-12b-pressure-trial-10-round-2), [10/3](#gemma4-12b-pressure-trial-10-round-3), [10/4](#gemma4-12b-pressure-trial-10-round-4), [11/1](#gemma4-12b-pressure-trial-11-round-1), [11/2](#gemma4-12b-pressure-trial-11-round-2), [11/3](#gemma4-12b-pressure-trial-11-round-3), [11/4](#gemma4-12b-pressure-trial-11-round-4), [12/1](#gemma4-12b-pressure-trial-12-round-1), [12/2](#gemma4-12b-pressure-trial-12-round-2), [12/3](#gemma4-12b-pressure-trial-12-round-3), [12/4](#gemma4-12b-pressure-trial-12-round-4), [13/1](#gemma4-12b-pressure-trial-13-round-1), [13/2](#gemma4-12b-pressure-trial-13-round-2), [13/3](#gemma4-12b-pressure-trial-13-round-3), [13/4](#gemma4-12b-pressure-trial-13-round-4), [14/1](#gemma4-12b-pressure-trial-14-round-1), [14/2](#gemma4-12b-pressure-trial-14-round-2), [14/3](#gemma4-12b-pressure-trial-14-round-3), [14/4](#gemma4-12b-pressure-trial-14-round-4), [15/1](#gemma4-12b-pressure-trial-15-round-1), [15/2](#gemma4-12b-pressure-trial-15-round-2), [15/3](#gemma4-12b-pressure-trial-15-round-3), [15/4](#gemma4-12b-pressure-trial-15-round-4)
  - wiki-only: [1](#gemma4-12b-wiki-only-trial-1-round-1), [2](#gemma4-12b-wiki-only-trial-2-round-1), [3](#gemma4-12b-wiki-only-trial-3-round-1), [4](#gemma4-12b-wiki-only-trial-4-round-1), [5](#gemma4-12b-wiki-only-trial-5-round-1), [6](#gemma4-12b-wiki-only-trial-6-round-1), [7](#gemma4-12b-wiki-only-trial-7-round-1), [8](#gemma4-12b-wiki-only-trial-8-round-1), [9](#gemma4-12b-wiki-only-trial-9-round-1), [10](#gemma4-12b-wiki-only-trial-10-round-1), [11](#gemma4-12b-wiki-only-trial-11-round-1), [12](#gemma4-12b-wiki-only-trial-12-round-1), [13](#gemma4-12b-wiki-only-trial-13-round-1), [14](#gemma4-12b-wiki-only-trial-14-round-1), [15](#gemma4-12b-wiki-only-trial-15-round-1)
- **gemma4:31b**
  - ambiguous-project: [1](#gemma4-31b-ambiguous-project-trial-1-round-1), [2](#gemma4-31b-ambiguous-project-trial-2-round-1), [3](#gemma4-31b-ambiguous-project-trial-3-round-1), [4](#gemma4-31b-ambiguous-project-trial-4-round-1), [5](#gemma4-31b-ambiguous-project-trial-5-round-1), [6](#gemma4-31b-ambiguous-project-trial-6-round-1), [7](#gemma4-31b-ambiguous-project-trial-7-round-1), [8](#gemma4-31b-ambiguous-project-trial-8-round-1), [9](#gemma4-31b-ambiguous-project-trial-9-round-1), [10](#gemma4-31b-ambiguous-project-trial-10-round-1), [11](#gemma4-31b-ambiguous-project-trial-11-round-1), [12](#gemma4-31b-ambiguous-project-trial-12-round-1), [13](#gemma4-31b-ambiguous-project-trial-13-round-1), [14](#gemma4-31b-ambiguous-project-trial-14-round-1), [15](#gemma4-31b-ambiguous-project-trial-15-round-1)
  - easy: [1](#gemma4-31b-easy-trial-1-round-1), [2](#gemma4-31b-easy-trial-2-round-1), [3](#gemma4-31b-easy-trial-3-round-1), [4](#gemma4-31b-easy-trial-4-round-1), [5](#gemma4-31b-easy-trial-5-round-1), [6](#gemma4-31b-easy-trial-6-round-1), [7](#gemma4-31b-easy-trial-7-round-1), [8](#gemma4-31b-easy-trial-8-round-1), [9](#gemma4-31b-easy-trial-9-round-1), [10](#gemma4-31b-easy-trial-10-round-1), [11](#gemma4-31b-easy-trial-11-round-1), [12](#gemma4-31b-easy-trial-12-round-1), [13](#gemma4-31b-easy-trial-13-round-1), [14](#gemma4-31b-easy-trial-14-round-1), [15](#gemma4-31b-easy-trial-15-round-1)
  - hard: [1](#gemma4-31b-hard-trial-1-round-1), [2](#gemma4-31b-hard-trial-2-round-1), [3](#gemma4-31b-hard-trial-3-round-1), [4](#gemma4-31b-hard-trial-4-round-1), [5](#gemma4-31b-hard-trial-5-round-1), [6](#gemma4-31b-hard-trial-6-round-1), [7](#gemma4-31b-hard-trial-7-round-1), [8](#gemma4-31b-hard-trial-8-round-1), [9](#gemma4-31b-hard-trial-9-round-1), [10](#gemma4-31b-hard-trial-10-round-1), [11](#gemma4-31b-hard-trial-11-round-1), [12](#gemma4-31b-hard-trial-12-round-1), [13](#gemma4-31b-hard-trial-13-round-1), [14](#gemma4-31b-hard-trial-14-round-1), [15](#gemma4-31b-hard-trial-15-round-1)
  - mutating: [1](#gemma4-31b-mutating-trial-1-round-1), [2](#gemma4-31b-mutating-trial-2-round-1), [3](#gemma4-31b-mutating-trial-3-round-1), [4](#gemma4-31b-mutating-trial-4-round-1), [5](#gemma4-31b-mutating-trial-5-round-1), [6](#gemma4-31b-mutating-trial-6-round-1), [7](#gemma4-31b-mutating-trial-7-round-1), [8](#gemma4-31b-mutating-trial-8-round-1), [9](#gemma4-31b-mutating-trial-9-round-1), [10](#gemma4-31b-mutating-trial-10-round-1), [11](#gemma4-31b-mutating-trial-11-round-1), [12](#gemma4-31b-mutating-trial-12-round-1), [13](#gemma4-31b-mutating-trial-13-round-1), [14](#gemma4-31b-mutating-trial-14-round-1), [15](#gemma4-31b-mutating-trial-15-round-1)
  - pressure: [1/1](#gemma4-31b-pressure-trial-1-round-1), [1/2](#gemma4-31b-pressure-trial-1-round-2), [1/3](#gemma4-31b-pressure-trial-1-round-3), [1/4](#gemma4-31b-pressure-trial-1-round-4), [2/1](#gemma4-31b-pressure-trial-2-round-1), [2/2](#gemma4-31b-pressure-trial-2-round-2), [2/3](#gemma4-31b-pressure-trial-2-round-3), [2/4](#gemma4-31b-pressure-trial-2-round-4), [3/1](#gemma4-31b-pressure-trial-3-round-1), [3/2](#gemma4-31b-pressure-trial-3-round-2), [3/3](#gemma4-31b-pressure-trial-3-round-3), [3/4](#gemma4-31b-pressure-trial-3-round-4), [4/1](#gemma4-31b-pressure-trial-4-round-1), [4/2](#gemma4-31b-pressure-trial-4-round-2), [4/3](#gemma4-31b-pressure-trial-4-round-3), [4/4](#gemma4-31b-pressure-trial-4-round-4), [5/1](#gemma4-31b-pressure-trial-5-round-1), [5/2](#gemma4-31b-pressure-trial-5-round-2), [5/3](#gemma4-31b-pressure-trial-5-round-3), [5/4](#gemma4-31b-pressure-trial-5-round-4), [6/1](#gemma4-31b-pressure-trial-6-round-1), [6/2](#gemma4-31b-pressure-trial-6-round-2), [6/3](#gemma4-31b-pressure-trial-6-round-3), [6/4](#gemma4-31b-pressure-trial-6-round-4), [7/1](#gemma4-31b-pressure-trial-7-round-1), [7/2](#gemma4-31b-pressure-trial-7-round-2), [7/3](#gemma4-31b-pressure-trial-7-round-3), [7/4](#gemma4-31b-pressure-trial-7-round-4), [8/1](#gemma4-31b-pressure-trial-8-round-1), [8/2](#gemma4-31b-pressure-trial-8-round-2), [8/3](#gemma4-31b-pressure-trial-8-round-3), [8/4](#gemma4-31b-pressure-trial-8-round-4), [9/1](#gemma4-31b-pressure-trial-9-round-1), [9/2](#gemma4-31b-pressure-trial-9-round-2), [9/3](#gemma4-31b-pressure-trial-9-round-3), [9/4](#gemma4-31b-pressure-trial-9-round-4), [10/1](#gemma4-31b-pressure-trial-10-round-1), [10/2](#gemma4-31b-pressure-trial-10-round-2), [10/3](#gemma4-31b-pressure-trial-10-round-3), [10/4](#gemma4-31b-pressure-trial-10-round-4), [11/1](#gemma4-31b-pressure-trial-11-round-1), [11/2](#gemma4-31b-pressure-trial-11-round-2), [11/3](#gemma4-31b-pressure-trial-11-round-3), [11/4](#gemma4-31b-pressure-trial-11-round-4), [12/1](#gemma4-31b-pressure-trial-12-round-1), [12/2](#gemma4-31b-pressure-trial-12-round-2), [12/3](#gemma4-31b-pressure-trial-12-round-3), [12/4](#gemma4-31b-pressure-trial-12-round-4), [13/1](#gemma4-31b-pressure-trial-13-round-1), [13/2](#gemma4-31b-pressure-trial-13-round-2), [13/3](#gemma4-31b-pressure-trial-13-round-3), [13/4](#gemma4-31b-pressure-trial-13-round-4), [14/1](#gemma4-31b-pressure-trial-14-round-1), [14/2](#gemma4-31b-pressure-trial-14-round-2), [14/3](#gemma4-31b-pressure-trial-14-round-3), [14/4](#gemma4-31b-pressure-trial-14-round-4), [15/1](#gemma4-31b-pressure-trial-15-round-1), [15/2](#gemma4-31b-pressure-trial-15-round-2), [15/3](#gemma4-31b-pressure-trial-15-round-3), [15/4](#gemma4-31b-pressure-trial-15-round-4)
  - wiki-only: [1](#gemma4-31b-wiki-only-trial-1-round-1), [2](#gemma4-31b-wiki-only-trial-2-round-1), [3](#gemma4-31b-wiki-only-trial-3-round-1), [4](#gemma4-31b-wiki-only-trial-4-round-1), [5](#gemma4-31b-wiki-only-trial-5-round-1), [6](#gemma4-31b-wiki-only-trial-6-round-1), [7](#gemma4-31b-wiki-only-trial-7-round-1), [8](#gemma4-31b-wiki-only-trial-8-round-1), [9](#gemma4-31b-wiki-only-trial-9-round-1), [10](#gemma4-31b-wiki-only-trial-10-round-1), [11](#gemma4-31b-wiki-only-trial-11-round-1), [12](#gemma4-31b-wiki-only-trial-12-round-1), [13](#gemma4-31b-wiki-only-trial-13-round-1), [14](#gemma4-31b-wiki-only-trial-14-round-1), [15](#gemma4-31b-wiki-only-trial-15-round-1)
- **glm-4.5-air-q4:latest**
  - ambiguous-project: [1](#glm-4-5-air-q4-latest-ambiguous-project-trial-1-round-1), [2](#glm-4-5-air-q4-latest-ambiguous-project-trial-2-round-1), [3](#glm-4-5-air-q4-latest-ambiguous-project-trial-3-round-1), [4](#glm-4-5-air-q4-latest-ambiguous-project-trial-4-round-1), [5](#glm-4-5-air-q4-latest-ambiguous-project-trial-5-round-1), [6](#glm-4-5-air-q4-latest-ambiguous-project-trial-6-round-1), [7](#glm-4-5-air-q4-latest-ambiguous-project-trial-7-round-1), [8](#glm-4-5-air-q4-latest-ambiguous-project-trial-8-round-1), [9](#glm-4-5-air-q4-latest-ambiguous-project-trial-9-round-1), [10](#glm-4-5-air-q4-latest-ambiguous-project-trial-10-round-1), [11](#glm-4-5-air-q4-latest-ambiguous-project-trial-11-round-1), [12](#glm-4-5-air-q4-latest-ambiguous-project-trial-12-round-1), [13](#glm-4-5-air-q4-latest-ambiguous-project-trial-13-round-1), [14](#glm-4-5-air-q4-latest-ambiguous-project-trial-14-round-1), [15](#glm-4-5-air-q4-latest-ambiguous-project-trial-15-round-1)
  - easy: [1](#glm-4-5-air-q4-latest-easy-trial-1-round-1), [2](#glm-4-5-air-q4-latest-easy-trial-2-round-1), [3](#glm-4-5-air-q4-latest-easy-trial-3-round-1), [4](#glm-4-5-air-q4-latest-easy-trial-4-round-1), [5](#glm-4-5-air-q4-latest-easy-trial-5-round-1), [6](#glm-4-5-air-q4-latest-easy-trial-6-round-1), [7](#glm-4-5-air-q4-latest-easy-trial-7-round-1), [8](#glm-4-5-air-q4-latest-easy-trial-8-round-1), [9](#glm-4-5-air-q4-latest-easy-trial-9-round-1), [10](#glm-4-5-air-q4-latest-easy-trial-10-round-1), [11](#glm-4-5-air-q4-latest-easy-trial-11-round-1), [12](#glm-4-5-air-q4-latest-easy-trial-12-round-1), [13](#glm-4-5-air-q4-latest-easy-trial-13-round-1), [14](#glm-4-5-air-q4-latest-easy-trial-14-round-1), [15](#glm-4-5-air-q4-latest-easy-trial-15-round-1)
  - hard: [1](#glm-4-5-air-q4-latest-hard-trial-1-round-1), [2](#glm-4-5-air-q4-latest-hard-trial-2-round-1), [3](#glm-4-5-air-q4-latest-hard-trial-3-round-1), [4](#glm-4-5-air-q4-latest-hard-trial-4-round-1), [5](#glm-4-5-air-q4-latest-hard-trial-5-round-1), [6](#glm-4-5-air-q4-latest-hard-trial-6-round-1), [7](#glm-4-5-air-q4-latest-hard-trial-7-round-1), [8](#glm-4-5-air-q4-latest-hard-trial-8-round-1), [9](#glm-4-5-air-q4-latest-hard-trial-9-round-1), [10](#glm-4-5-air-q4-latest-hard-trial-10-round-1), [11](#glm-4-5-air-q4-latest-hard-trial-11-round-1), [12](#glm-4-5-air-q4-latest-hard-trial-12-round-1), [13](#glm-4-5-air-q4-latest-hard-trial-13-round-1), [14](#glm-4-5-air-q4-latest-hard-trial-14-round-1), [15](#glm-4-5-air-q4-latest-hard-trial-15-round-1)
  - mutating: [1](#glm-4-5-air-q4-latest-mutating-trial-1-round-1), [2](#glm-4-5-air-q4-latest-mutating-trial-2-round-1), [3](#glm-4-5-air-q4-latest-mutating-trial-3-round-1), [4](#glm-4-5-air-q4-latest-mutating-trial-4-round-1), [5](#glm-4-5-air-q4-latest-mutating-trial-5-round-1), [6](#glm-4-5-air-q4-latest-mutating-trial-6-round-1), [7](#glm-4-5-air-q4-latest-mutating-trial-7-round-1), [8](#glm-4-5-air-q4-latest-mutating-trial-8-round-1), [9](#glm-4-5-air-q4-latest-mutating-trial-9-round-1), [10](#glm-4-5-air-q4-latest-mutating-trial-10-round-1), [11](#glm-4-5-air-q4-latest-mutating-trial-11-round-1), [12](#glm-4-5-air-q4-latest-mutating-trial-12-round-1), [13](#glm-4-5-air-q4-latest-mutating-trial-13-round-1), [14](#glm-4-5-air-q4-latest-mutating-trial-14-round-1), [15](#glm-4-5-air-q4-latest-mutating-trial-15-round-1)
  - pressure: [1/1](#glm-4-5-air-q4-latest-pressure-trial-1-round-1), [1/2](#glm-4-5-air-q4-latest-pressure-trial-1-round-2), [1/3](#glm-4-5-air-q4-latest-pressure-trial-1-round-3), [1/4](#glm-4-5-air-q4-latest-pressure-trial-1-round-4), [2/1](#glm-4-5-air-q4-latest-pressure-trial-2-round-1), [2/2](#glm-4-5-air-q4-latest-pressure-trial-2-round-2), [2/3](#glm-4-5-air-q4-latest-pressure-trial-2-round-3), [2/4](#glm-4-5-air-q4-latest-pressure-trial-2-round-4), [3/1](#glm-4-5-air-q4-latest-pressure-trial-3-round-1), [3/2](#glm-4-5-air-q4-latest-pressure-trial-3-round-2), [3/3](#glm-4-5-air-q4-latest-pressure-trial-3-round-3), [3/4](#glm-4-5-air-q4-latest-pressure-trial-3-round-4), [4/1](#glm-4-5-air-q4-latest-pressure-trial-4-round-1), [4/2](#glm-4-5-air-q4-latest-pressure-trial-4-round-2), [4/3](#glm-4-5-air-q4-latest-pressure-trial-4-round-3), [4/4](#glm-4-5-air-q4-latest-pressure-trial-4-round-4), [5/1](#glm-4-5-air-q4-latest-pressure-trial-5-round-1), [5/2](#glm-4-5-air-q4-latest-pressure-trial-5-round-2), [5/3](#glm-4-5-air-q4-latest-pressure-trial-5-round-3), [5/4](#glm-4-5-air-q4-latest-pressure-trial-5-round-4), [6/1](#glm-4-5-air-q4-latest-pressure-trial-6-round-1), [6/2](#glm-4-5-air-q4-latest-pressure-trial-6-round-2), [6/3](#glm-4-5-air-q4-latest-pressure-trial-6-round-3), [6/4](#glm-4-5-air-q4-latest-pressure-trial-6-round-4), [7/1](#glm-4-5-air-q4-latest-pressure-trial-7-round-1), [7/2](#glm-4-5-air-q4-latest-pressure-trial-7-round-2), [7/3](#glm-4-5-air-q4-latest-pressure-trial-7-round-3), [7/4](#glm-4-5-air-q4-latest-pressure-trial-7-round-4), [8/1](#glm-4-5-air-q4-latest-pressure-trial-8-round-1), [8/2](#glm-4-5-air-q4-latest-pressure-trial-8-round-2), [8/3](#glm-4-5-air-q4-latest-pressure-trial-8-round-3), [8/4](#glm-4-5-air-q4-latest-pressure-trial-8-round-4), [9/1](#glm-4-5-air-q4-latest-pressure-trial-9-round-1), [9/2](#glm-4-5-air-q4-latest-pressure-trial-9-round-2), [9/3](#glm-4-5-air-q4-latest-pressure-trial-9-round-3), [9/4](#glm-4-5-air-q4-latest-pressure-trial-9-round-4), [10/1](#glm-4-5-air-q4-latest-pressure-trial-10-round-1), [10/2](#glm-4-5-air-q4-latest-pressure-trial-10-round-2), [10/3](#glm-4-5-air-q4-latest-pressure-trial-10-round-3), [10/4](#glm-4-5-air-q4-latest-pressure-trial-10-round-4), [11/1](#glm-4-5-air-q4-latest-pressure-trial-11-round-1), [11/2](#glm-4-5-air-q4-latest-pressure-trial-11-round-2), [11/3](#glm-4-5-air-q4-latest-pressure-trial-11-round-3), [11/4](#glm-4-5-air-q4-latest-pressure-trial-11-round-4), [12/1](#glm-4-5-air-q4-latest-pressure-trial-12-round-1), [12/2](#glm-4-5-air-q4-latest-pressure-trial-12-round-2), [12/3](#glm-4-5-air-q4-latest-pressure-trial-12-round-3), [12/4](#glm-4-5-air-q4-latest-pressure-trial-12-round-4), [13/1](#glm-4-5-air-q4-latest-pressure-trial-13-round-1), [13/2](#glm-4-5-air-q4-latest-pressure-trial-13-round-2), [13/3](#glm-4-5-air-q4-latest-pressure-trial-13-round-3), [13/4](#glm-4-5-air-q4-latest-pressure-trial-13-round-4), [14/1](#glm-4-5-air-q4-latest-pressure-trial-14-round-1), [14/2](#glm-4-5-air-q4-latest-pressure-trial-14-round-2), [14/3](#glm-4-5-air-q4-latest-pressure-trial-14-round-3), [14/4](#glm-4-5-air-q4-latest-pressure-trial-14-round-4), [15/1](#glm-4-5-air-q4-latest-pressure-trial-15-round-1), [15/2](#glm-4-5-air-q4-latest-pressure-trial-15-round-2), [15/3](#glm-4-5-air-q4-latest-pressure-trial-15-round-3), [15/4](#glm-4-5-air-q4-latest-pressure-trial-15-round-4)
  - wiki-only: [1](#glm-4-5-air-q4-latest-wiki-only-trial-1-round-1), [2](#glm-4-5-air-q4-latest-wiki-only-trial-2-round-1), [3](#glm-4-5-air-q4-latest-wiki-only-trial-3-round-1), [4](#glm-4-5-air-q4-latest-wiki-only-trial-4-round-1), [5](#glm-4-5-air-q4-latest-wiki-only-trial-5-round-1), [6](#glm-4-5-air-q4-latest-wiki-only-trial-6-round-1), [7](#glm-4-5-air-q4-latest-wiki-only-trial-7-round-1), [8](#glm-4-5-air-q4-latest-wiki-only-trial-8-round-1), [9](#glm-4-5-air-q4-latest-wiki-only-trial-9-round-1), [10](#glm-4-5-air-q4-latest-wiki-only-trial-10-round-1), [11](#glm-4-5-air-q4-latest-wiki-only-trial-11-round-1), [12](#glm-4-5-air-q4-latest-wiki-only-trial-12-round-1), [13](#glm-4-5-air-q4-latest-wiki-only-trial-13-round-1), [14](#glm-4-5-air-q4-latest-wiki-only-trial-14-round-1), [15](#glm-4-5-air-q4-latest-wiki-only-trial-15-round-1)
- **gpt-oss:120b**
  - ambiguous-project: [1](#gpt-oss-120b-ambiguous-project-trial-1-round-1), [2](#gpt-oss-120b-ambiguous-project-trial-2-round-1), [3](#gpt-oss-120b-ambiguous-project-trial-3-round-1), [4](#gpt-oss-120b-ambiguous-project-trial-4-round-1), [5](#gpt-oss-120b-ambiguous-project-trial-5-round-1), [6](#gpt-oss-120b-ambiguous-project-trial-6-round-1), [7](#gpt-oss-120b-ambiguous-project-trial-7-round-1), [8](#gpt-oss-120b-ambiguous-project-trial-8-round-1), [9](#gpt-oss-120b-ambiguous-project-trial-9-round-1), [10](#gpt-oss-120b-ambiguous-project-trial-10-round-1), [11](#gpt-oss-120b-ambiguous-project-trial-11-round-1), [12](#gpt-oss-120b-ambiguous-project-trial-12-round-1), [13](#gpt-oss-120b-ambiguous-project-trial-13-round-1), [14](#gpt-oss-120b-ambiguous-project-trial-14-round-1), [15](#gpt-oss-120b-ambiguous-project-trial-15-round-1)
  - easy: [1](#gpt-oss-120b-easy-trial-1-round-1), [2](#gpt-oss-120b-easy-trial-2-round-1), [3](#gpt-oss-120b-easy-trial-3-round-1), [4](#gpt-oss-120b-easy-trial-4-round-1), [5](#gpt-oss-120b-easy-trial-5-round-1), [6](#gpt-oss-120b-easy-trial-6-round-1), [7](#gpt-oss-120b-easy-trial-7-round-1), [8](#gpt-oss-120b-easy-trial-8-round-1), [9](#gpt-oss-120b-easy-trial-9-round-1), [10](#gpt-oss-120b-easy-trial-10-round-1), [11](#gpt-oss-120b-easy-trial-11-round-1), [12](#gpt-oss-120b-easy-trial-12-round-1), [13](#gpt-oss-120b-easy-trial-13-round-1), [14](#gpt-oss-120b-easy-trial-14-round-1), [15](#gpt-oss-120b-easy-trial-15-round-1)
  - hard: [1](#gpt-oss-120b-hard-trial-1-round-1), [2](#gpt-oss-120b-hard-trial-2-round-1), [3](#gpt-oss-120b-hard-trial-3-round-1), [4](#gpt-oss-120b-hard-trial-4-round-1), [5](#gpt-oss-120b-hard-trial-5-round-1), [6](#gpt-oss-120b-hard-trial-6-round-1), [7](#gpt-oss-120b-hard-trial-7-round-1), [8](#gpt-oss-120b-hard-trial-8-round-1), [9](#gpt-oss-120b-hard-trial-9-round-1), [10](#gpt-oss-120b-hard-trial-10-round-1), [11](#gpt-oss-120b-hard-trial-11-round-1), [12](#gpt-oss-120b-hard-trial-12-round-1), [13](#gpt-oss-120b-hard-trial-13-round-1), [14](#gpt-oss-120b-hard-trial-14-round-1), [15](#gpt-oss-120b-hard-trial-15-round-1)
  - mutating: [1](#gpt-oss-120b-mutating-trial-1-round-1), [2](#gpt-oss-120b-mutating-trial-2-round-1), [3](#gpt-oss-120b-mutating-trial-3-round-1), [4](#gpt-oss-120b-mutating-trial-4-round-1), [5](#gpt-oss-120b-mutating-trial-5-round-1), [6](#gpt-oss-120b-mutating-trial-6-round-1), [7](#gpt-oss-120b-mutating-trial-7-round-1), [8](#gpt-oss-120b-mutating-trial-8-round-1), [9](#gpt-oss-120b-mutating-trial-9-round-1), [10](#gpt-oss-120b-mutating-trial-10-round-1), [11](#gpt-oss-120b-mutating-trial-11-round-1), [12](#gpt-oss-120b-mutating-trial-12-round-1), [13](#gpt-oss-120b-mutating-trial-13-round-1), [14](#gpt-oss-120b-mutating-trial-14-round-1), [15](#gpt-oss-120b-mutating-trial-15-round-1)
  - pressure: [1/1](#gpt-oss-120b-pressure-trial-1-round-1), [1/2](#gpt-oss-120b-pressure-trial-1-round-2), [1/3](#gpt-oss-120b-pressure-trial-1-round-3), [1/4](#gpt-oss-120b-pressure-trial-1-round-4), [2/1](#gpt-oss-120b-pressure-trial-2-round-1), [2/2](#gpt-oss-120b-pressure-trial-2-round-2), [2/3](#gpt-oss-120b-pressure-trial-2-round-3), [2/4](#gpt-oss-120b-pressure-trial-2-round-4), [3/1](#gpt-oss-120b-pressure-trial-3-round-1), [3/2](#gpt-oss-120b-pressure-trial-3-round-2), [3/3](#gpt-oss-120b-pressure-trial-3-round-3), [3/4](#gpt-oss-120b-pressure-trial-3-round-4), [4/1](#gpt-oss-120b-pressure-trial-4-round-1), [4/2](#gpt-oss-120b-pressure-trial-4-round-2), [4/3](#gpt-oss-120b-pressure-trial-4-round-3), [4/4](#gpt-oss-120b-pressure-trial-4-round-4), [5/1](#gpt-oss-120b-pressure-trial-5-round-1), [5/2](#gpt-oss-120b-pressure-trial-5-round-2), [5/3](#gpt-oss-120b-pressure-trial-5-round-3), [5/4](#gpt-oss-120b-pressure-trial-5-round-4), [6/1](#gpt-oss-120b-pressure-trial-6-round-1), [6/2](#gpt-oss-120b-pressure-trial-6-round-2), [6/3](#gpt-oss-120b-pressure-trial-6-round-3), [6/4](#gpt-oss-120b-pressure-trial-6-round-4), [7/1](#gpt-oss-120b-pressure-trial-7-round-1), [7/2](#gpt-oss-120b-pressure-trial-7-round-2), [7/3](#gpt-oss-120b-pressure-trial-7-round-3), [7/4](#gpt-oss-120b-pressure-trial-7-round-4), [8/1](#gpt-oss-120b-pressure-trial-8-round-1), [8/2](#gpt-oss-120b-pressure-trial-8-round-2), [8/3](#gpt-oss-120b-pressure-trial-8-round-3), [8/4](#gpt-oss-120b-pressure-trial-8-round-4), [9/1](#gpt-oss-120b-pressure-trial-9-round-1), [9/2](#gpt-oss-120b-pressure-trial-9-round-2), [9/3](#gpt-oss-120b-pressure-trial-9-round-3), [9/4](#gpt-oss-120b-pressure-trial-9-round-4), [10/1](#gpt-oss-120b-pressure-trial-10-round-1), [10/2](#gpt-oss-120b-pressure-trial-10-round-2), [10/3](#gpt-oss-120b-pressure-trial-10-round-3), [10/4](#gpt-oss-120b-pressure-trial-10-round-4), [11/1](#gpt-oss-120b-pressure-trial-11-round-1), [11/2](#gpt-oss-120b-pressure-trial-11-round-2), [11/3](#gpt-oss-120b-pressure-trial-11-round-3), [11/4](#gpt-oss-120b-pressure-trial-11-round-4), [12/1](#gpt-oss-120b-pressure-trial-12-round-1), [12/2](#gpt-oss-120b-pressure-trial-12-round-2), [12/3](#gpt-oss-120b-pressure-trial-12-round-3), [12/4](#gpt-oss-120b-pressure-trial-12-round-4), [13/1](#gpt-oss-120b-pressure-trial-13-round-1), [13/2](#gpt-oss-120b-pressure-trial-13-round-2), [13/3](#gpt-oss-120b-pressure-trial-13-round-3), [13/4](#gpt-oss-120b-pressure-trial-13-round-4), [14/1](#gpt-oss-120b-pressure-trial-14-round-1), [14/2](#gpt-oss-120b-pressure-trial-14-round-2), [14/3](#gpt-oss-120b-pressure-trial-14-round-3), [14/4](#gpt-oss-120b-pressure-trial-14-round-4), [15/1](#gpt-oss-120b-pressure-trial-15-round-1), [15/2](#gpt-oss-120b-pressure-trial-15-round-2), [15/3](#gpt-oss-120b-pressure-trial-15-round-3), [15/4](#gpt-oss-120b-pressure-trial-15-round-4)
  - wiki-only: [1](#gpt-oss-120b-wiki-only-trial-1-round-1), [2](#gpt-oss-120b-wiki-only-trial-2-round-1), [3](#gpt-oss-120b-wiki-only-trial-3-round-1), [4](#gpt-oss-120b-wiki-only-trial-4-round-1), [5](#gpt-oss-120b-wiki-only-trial-5-round-1), [6](#gpt-oss-120b-wiki-only-trial-6-round-1), [7](#gpt-oss-120b-wiki-only-trial-7-round-1), [8](#gpt-oss-120b-wiki-only-trial-8-round-1), [9](#gpt-oss-120b-wiki-only-trial-9-round-1), [10](#gpt-oss-120b-wiki-only-trial-10-round-1), [11](#gpt-oss-120b-wiki-only-trial-11-round-1), [12](#gpt-oss-120b-wiki-only-trial-12-round-1), [13](#gpt-oss-120b-wiki-only-trial-13-round-1), [14](#gpt-oss-120b-wiki-only-trial-14-round-1), [15](#gpt-oss-120b-wiki-only-trial-15-round-1)
- **llama3.3:70b**
  - ambiguous-project: [1](#llama3-3-70b-ambiguous-project-trial-1-round-1), [2](#llama3-3-70b-ambiguous-project-trial-2-round-1), [3](#llama3-3-70b-ambiguous-project-trial-3-round-1), [4](#llama3-3-70b-ambiguous-project-trial-4-round-1), [5](#llama3-3-70b-ambiguous-project-trial-5-round-1), [6](#llama3-3-70b-ambiguous-project-trial-6-round-1), [7](#llama3-3-70b-ambiguous-project-trial-7-round-1), [8](#llama3-3-70b-ambiguous-project-trial-8-round-1), [9](#llama3-3-70b-ambiguous-project-trial-9-round-1), [10](#llama3-3-70b-ambiguous-project-trial-10-round-1), [11](#llama3-3-70b-ambiguous-project-trial-11-round-1), [12](#llama3-3-70b-ambiguous-project-trial-12-round-1), [13](#llama3-3-70b-ambiguous-project-trial-13-round-1), [14](#llama3-3-70b-ambiguous-project-trial-14-round-1), [15](#llama3-3-70b-ambiguous-project-trial-15-round-1)
  - easy: [1](#llama3-3-70b-easy-trial-1-round-1), [2](#llama3-3-70b-easy-trial-2-round-1), [3](#llama3-3-70b-easy-trial-3-round-1), [4](#llama3-3-70b-easy-trial-4-round-1), [5](#llama3-3-70b-easy-trial-5-round-1), [6](#llama3-3-70b-easy-trial-6-round-1), [7](#llama3-3-70b-easy-trial-7-round-1), [8](#llama3-3-70b-easy-trial-8-round-1), [9](#llama3-3-70b-easy-trial-9-round-1), [10](#llama3-3-70b-easy-trial-10-round-1), [11](#llama3-3-70b-easy-trial-11-round-1), [12](#llama3-3-70b-easy-trial-12-round-1), [13](#llama3-3-70b-easy-trial-13-round-1), [14](#llama3-3-70b-easy-trial-14-round-1), [15](#llama3-3-70b-easy-trial-15-round-1)
  - hard: [1](#llama3-3-70b-hard-trial-1-round-1), [2](#llama3-3-70b-hard-trial-2-round-1), [3](#llama3-3-70b-hard-trial-3-round-1), [4](#llama3-3-70b-hard-trial-4-round-1), [5](#llama3-3-70b-hard-trial-5-round-1), [6](#llama3-3-70b-hard-trial-6-round-1), [7](#llama3-3-70b-hard-trial-7-round-1), [8](#llama3-3-70b-hard-trial-8-round-1), [9](#llama3-3-70b-hard-trial-9-round-1), [10](#llama3-3-70b-hard-trial-10-round-1), [11](#llama3-3-70b-hard-trial-11-round-1), [12](#llama3-3-70b-hard-trial-12-round-1), [13](#llama3-3-70b-hard-trial-13-round-1), [14](#llama3-3-70b-hard-trial-14-round-1), [15](#llama3-3-70b-hard-trial-15-round-1)
  - mutating: [1](#llama3-3-70b-mutating-trial-1-round-1), [2](#llama3-3-70b-mutating-trial-2-round-1), [3](#llama3-3-70b-mutating-trial-3-round-1), [4](#llama3-3-70b-mutating-trial-4-round-1), [5](#llama3-3-70b-mutating-trial-5-round-1), [6](#llama3-3-70b-mutating-trial-6-round-1), [7](#llama3-3-70b-mutating-trial-7-round-1), [8](#llama3-3-70b-mutating-trial-8-round-1), [9](#llama3-3-70b-mutating-trial-9-round-1), [10](#llama3-3-70b-mutating-trial-10-round-1), [11](#llama3-3-70b-mutating-trial-11-round-1), [12](#llama3-3-70b-mutating-trial-12-round-1), [13](#llama3-3-70b-mutating-trial-13-round-1), [14](#llama3-3-70b-mutating-trial-14-round-1), [15](#llama3-3-70b-mutating-trial-15-round-1)
  - pressure: [1/1](#llama3-3-70b-pressure-trial-1-round-1), [1/2](#llama3-3-70b-pressure-trial-1-round-2), [1/3](#llama3-3-70b-pressure-trial-1-round-3), [1/4](#llama3-3-70b-pressure-trial-1-round-4), [2/1](#llama3-3-70b-pressure-trial-2-round-1), [2/2](#llama3-3-70b-pressure-trial-2-round-2), [2/3](#llama3-3-70b-pressure-trial-2-round-3), [2/4](#llama3-3-70b-pressure-trial-2-round-4), [3/1](#llama3-3-70b-pressure-trial-3-round-1), [3/2](#llama3-3-70b-pressure-trial-3-round-2), [3/3](#llama3-3-70b-pressure-trial-3-round-3), [3/4](#llama3-3-70b-pressure-trial-3-round-4), [4/1](#llama3-3-70b-pressure-trial-4-round-1), [4/2](#llama3-3-70b-pressure-trial-4-round-2), [4/3](#llama3-3-70b-pressure-trial-4-round-3), [4/4](#llama3-3-70b-pressure-trial-4-round-4), [5/1](#llama3-3-70b-pressure-trial-5-round-1), [5/2](#llama3-3-70b-pressure-trial-5-round-2), [5/3](#llama3-3-70b-pressure-trial-5-round-3), [5/4](#llama3-3-70b-pressure-trial-5-round-4), [6/1](#llama3-3-70b-pressure-trial-6-round-1), [6/2](#llama3-3-70b-pressure-trial-6-round-2), [6/3](#llama3-3-70b-pressure-trial-6-round-3), [6/4](#llama3-3-70b-pressure-trial-6-round-4), [7/1](#llama3-3-70b-pressure-trial-7-round-1), [7/2](#llama3-3-70b-pressure-trial-7-round-2), [7/3](#llama3-3-70b-pressure-trial-7-round-3), [7/4](#llama3-3-70b-pressure-trial-7-round-4), [8/1](#llama3-3-70b-pressure-trial-8-round-1), [8/2](#llama3-3-70b-pressure-trial-8-round-2), [8/3](#llama3-3-70b-pressure-trial-8-round-3), [8/4](#llama3-3-70b-pressure-trial-8-round-4), [9/1](#llama3-3-70b-pressure-trial-9-round-1), [9/2](#llama3-3-70b-pressure-trial-9-round-2), [9/3](#llama3-3-70b-pressure-trial-9-round-3), [9/4](#llama3-3-70b-pressure-trial-9-round-4), [10/1](#llama3-3-70b-pressure-trial-10-round-1), [10/2](#llama3-3-70b-pressure-trial-10-round-2), [10/3](#llama3-3-70b-pressure-trial-10-round-3), [10/4](#llama3-3-70b-pressure-trial-10-round-4), [11/1](#llama3-3-70b-pressure-trial-11-round-1), [11/2](#llama3-3-70b-pressure-trial-11-round-2), [11/3](#llama3-3-70b-pressure-trial-11-round-3), [11/4](#llama3-3-70b-pressure-trial-11-round-4), [12/1](#llama3-3-70b-pressure-trial-12-round-1), [12/2](#llama3-3-70b-pressure-trial-12-round-2), [12/3](#llama3-3-70b-pressure-trial-12-round-3), [12/4](#llama3-3-70b-pressure-trial-12-round-4), [13/1](#llama3-3-70b-pressure-trial-13-round-1), [13/2](#llama3-3-70b-pressure-trial-13-round-2), [13/3](#llama3-3-70b-pressure-trial-13-round-3), [13/4](#llama3-3-70b-pressure-trial-13-round-4), [14/1](#llama3-3-70b-pressure-trial-14-round-1), [14/2](#llama3-3-70b-pressure-trial-14-round-2), [14/3](#llama3-3-70b-pressure-trial-14-round-3), [14/4](#llama3-3-70b-pressure-trial-14-round-4), [15/1](#llama3-3-70b-pressure-trial-15-round-1), [15/2](#llama3-3-70b-pressure-trial-15-round-2), [15/3](#llama3-3-70b-pressure-trial-15-round-3), [15/4](#llama3-3-70b-pressure-trial-15-round-4)
  - wiki-only: [1](#llama3-3-70b-wiki-only-trial-1-round-1), [2](#llama3-3-70b-wiki-only-trial-2-round-1), [3](#llama3-3-70b-wiki-only-trial-3-round-1), [4](#llama3-3-70b-wiki-only-trial-4-round-1), [5](#llama3-3-70b-wiki-only-trial-5-round-1), [6](#llama3-3-70b-wiki-only-trial-6-round-1), [7](#llama3-3-70b-wiki-only-trial-7-round-1), [8](#llama3-3-70b-wiki-only-trial-8-round-1), [9](#llama3-3-70b-wiki-only-trial-9-round-1), [10](#llama3-3-70b-wiki-only-trial-10-round-1), [11](#llama3-3-70b-wiki-only-trial-11-round-1), [12](#llama3-3-70b-wiki-only-trial-12-round-1), [13](#llama3-3-70b-wiki-only-trial-13-round-1), [14](#llama3-3-70b-wiki-only-trial-14-round-1), [15](#llama3-3-70b-wiki-only-trial-15-round-1)
- **nemotron:70b**
  - ambiguous-project: [1](#nemotron-70b-ambiguous-project-trial-1-round-1), [2](#nemotron-70b-ambiguous-project-trial-2-round-1), [3](#nemotron-70b-ambiguous-project-trial-3-round-1), [4](#nemotron-70b-ambiguous-project-trial-4-round-1), [5](#nemotron-70b-ambiguous-project-trial-5-round-1), [6](#nemotron-70b-ambiguous-project-trial-6-round-1), [7](#nemotron-70b-ambiguous-project-trial-7-round-1), [8](#nemotron-70b-ambiguous-project-trial-8-round-1), [9](#nemotron-70b-ambiguous-project-trial-9-round-1), [10](#nemotron-70b-ambiguous-project-trial-10-round-1), [11](#nemotron-70b-ambiguous-project-trial-11-round-1), [12](#nemotron-70b-ambiguous-project-trial-12-round-1), [13](#nemotron-70b-ambiguous-project-trial-13-round-1), [14](#nemotron-70b-ambiguous-project-trial-14-round-1), [15](#nemotron-70b-ambiguous-project-trial-15-round-1)
  - easy: [1](#nemotron-70b-easy-trial-1-round-1), [2](#nemotron-70b-easy-trial-2-round-1), [3](#nemotron-70b-easy-trial-3-round-1), [4](#nemotron-70b-easy-trial-4-round-1), [5](#nemotron-70b-easy-trial-5-round-1), [6](#nemotron-70b-easy-trial-6-round-1), [7](#nemotron-70b-easy-trial-7-round-1), [8](#nemotron-70b-easy-trial-8-round-1), [9](#nemotron-70b-easy-trial-9-round-1), [10](#nemotron-70b-easy-trial-10-round-1), [11](#nemotron-70b-easy-trial-11-round-1), [12](#nemotron-70b-easy-trial-12-round-1), [13](#nemotron-70b-easy-trial-13-round-1), [14](#nemotron-70b-easy-trial-14-round-1), [15](#nemotron-70b-easy-trial-15-round-1)
  - hard: [1](#nemotron-70b-hard-trial-1-round-1), [2](#nemotron-70b-hard-trial-2-round-1), [3](#nemotron-70b-hard-trial-3-round-1), [4](#nemotron-70b-hard-trial-4-round-1), [5](#nemotron-70b-hard-trial-5-round-1), [6](#nemotron-70b-hard-trial-6-round-1), [7](#nemotron-70b-hard-trial-7-round-1), [8](#nemotron-70b-hard-trial-8-round-1), [9](#nemotron-70b-hard-trial-9-round-1), [10](#nemotron-70b-hard-trial-10-round-1), [11](#nemotron-70b-hard-trial-11-round-1), [12](#nemotron-70b-hard-trial-12-round-1), [13](#nemotron-70b-hard-trial-13-round-1), [14](#nemotron-70b-hard-trial-14-round-1), [15](#nemotron-70b-hard-trial-15-round-1)
  - mutating: [1](#nemotron-70b-mutating-trial-1-round-1), [2](#nemotron-70b-mutating-trial-2-round-1), [3](#nemotron-70b-mutating-trial-3-round-1), [4](#nemotron-70b-mutating-trial-4-round-1), [5](#nemotron-70b-mutating-trial-5-round-1), [6](#nemotron-70b-mutating-trial-6-round-1), [7](#nemotron-70b-mutating-trial-7-round-1), [8](#nemotron-70b-mutating-trial-8-round-1), [9](#nemotron-70b-mutating-trial-9-round-1), [10](#nemotron-70b-mutating-trial-10-round-1), [11](#nemotron-70b-mutating-trial-11-round-1), [12](#nemotron-70b-mutating-trial-12-round-1), [13](#nemotron-70b-mutating-trial-13-round-1), [14](#nemotron-70b-mutating-trial-14-round-1), [15](#nemotron-70b-mutating-trial-15-round-1)
  - pressure: [1/1](#nemotron-70b-pressure-trial-1-round-1), [1/2](#nemotron-70b-pressure-trial-1-round-2), [1/3](#nemotron-70b-pressure-trial-1-round-3), [1/4](#nemotron-70b-pressure-trial-1-round-4), [2/1](#nemotron-70b-pressure-trial-2-round-1), [2/2](#nemotron-70b-pressure-trial-2-round-2), [2/3](#nemotron-70b-pressure-trial-2-round-3), [2/4](#nemotron-70b-pressure-trial-2-round-4), [3/1](#nemotron-70b-pressure-trial-3-round-1), [3/2](#nemotron-70b-pressure-trial-3-round-2), [3/3](#nemotron-70b-pressure-trial-3-round-3), [3/4](#nemotron-70b-pressure-trial-3-round-4), [4/1](#nemotron-70b-pressure-trial-4-round-1), [4/2](#nemotron-70b-pressure-trial-4-round-2), [4/3](#nemotron-70b-pressure-trial-4-round-3), [4/4](#nemotron-70b-pressure-trial-4-round-4), [5/1](#nemotron-70b-pressure-trial-5-round-1), [5/2](#nemotron-70b-pressure-trial-5-round-2), [5/3](#nemotron-70b-pressure-trial-5-round-3), [5/4](#nemotron-70b-pressure-trial-5-round-4), [6/1](#nemotron-70b-pressure-trial-6-round-1), [6/2](#nemotron-70b-pressure-trial-6-round-2), [6/3](#nemotron-70b-pressure-trial-6-round-3), [6/4](#nemotron-70b-pressure-trial-6-round-4), [7/1](#nemotron-70b-pressure-trial-7-round-1), [7/2](#nemotron-70b-pressure-trial-7-round-2), [7/3](#nemotron-70b-pressure-trial-7-round-3), [7/4](#nemotron-70b-pressure-trial-7-round-4), [8/1](#nemotron-70b-pressure-trial-8-round-1), [8/2](#nemotron-70b-pressure-trial-8-round-2), [8/3](#nemotron-70b-pressure-trial-8-round-3), [8/4](#nemotron-70b-pressure-trial-8-round-4), [9/1](#nemotron-70b-pressure-trial-9-round-1), [9/2](#nemotron-70b-pressure-trial-9-round-2), [9/3](#nemotron-70b-pressure-trial-9-round-3), [9/4](#nemotron-70b-pressure-trial-9-round-4), [10/1](#nemotron-70b-pressure-trial-10-round-1), [10/2](#nemotron-70b-pressure-trial-10-round-2), [10/3](#nemotron-70b-pressure-trial-10-round-3), [10/4](#nemotron-70b-pressure-trial-10-round-4), [11/1](#nemotron-70b-pressure-trial-11-round-1), [11/2](#nemotron-70b-pressure-trial-11-round-2), [11/3](#nemotron-70b-pressure-trial-11-round-3), [11/4](#nemotron-70b-pressure-trial-11-round-4), [12/1](#nemotron-70b-pressure-trial-12-round-1), [12/2](#nemotron-70b-pressure-trial-12-round-2), [12/3](#nemotron-70b-pressure-trial-12-round-3), [12/4](#nemotron-70b-pressure-trial-12-round-4), [13/1](#nemotron-70b-pressure-trial-13-round-1), [13/2](#nemotron-70b-pressure-trial-13-round-2), [13/3](#nemotron-70b-pressure-trial-13-round-3), [13/4](#nemotron-70b-pressure-trial-13-round-4), [14/1](#nemotron-70b-pressure-trial-14-round-1), [14/2](#nemotron-70b-pressure-trial-14-round-2), [14/3](#nemotron-70b-pressure-trial-14-round-3), [14/4](#nemotron-70b-pressure-trial-14-round-4), [15/1](#nemotron-70b-pressure-trial-15-round-1), [15/2](#nemotron-70b-pressure-trial-15-round-2), [15/3](#nemotron-70b-pressure-trial-15-round-3), [15/4](#nemotron-70b-pressure-trial-15-round-4)
  - wiki-only: [1](#nemotron-70b-wiki-only-trial-1-round-1), [2](#nemotron-70b-wiki-only-trial-2-round-1), [3](#nemotron-70b-wiki-only-trial-3-round-1), [4](#nemotron-70b-wiki-only-trial-4-round-1), [5](#nemotron-70b-wiki-only-trial-5-round-1), [6](#nemotron-70b-wiki-only-trial-6-round-1), [7](#nemotron-70b-wiki-only-trial-7-round-1), [8](#nemotron-70b-wiki-only-trial-8-round-1), [9](#nemotron-70b-wiki-only-trial-9-round-1), [10](#nemotron-70b-wiki-only-trial-10-round-1), [11](#nemotron-70b-wiki-only-trial-11-round-1), [12](#nemotron-70b-wiki-only-trial-12-round-1), [13](#nemotron-70b-wiki-only-trial-13-round-1), [14](#nemotron-70b-wiki-only-trial-14-round-1), [15](#nemotron-70b-wiki-only-trial-15-round-1)
- **qwen3.5:35b-a3b**
  - ambiguous-project: [1](#qwen3-5-35b-a3b-ambiguous-project-trial-1-round-1), [2](#qwen3-5-35b-a3b-ambiguous-project-trial-2-round-1), [3](#qwen3-5-35b-a3b-ambiguous-project-trial-3-round-1), [4](#qwen3-5-35b-a3b-ambiguous-project-trial-4-round-1), [5](#qwen3-5-35b-a3b-ambiguous-project-trial-5-round-1), [6](#qwen3-5-35b-a3b-ambiguous-project-trial-6-round-1), [7](#qwen3-5-35b-a3b-ambiguous-project-trial-7-round-1), [8](#qwen3-5-35b-a3b-ambiguous-project-trial-8-round-1), [9](#qwen3-5-35b-a3b-ambiguous-project-trial-9-round-1), [10](#qwen3-5-35b-a3b-ambiguous-project-trial-10-round-1), [11](#qwen3-5-35b-a3b-ambiguous-project-trial-11-round-1), [12](#qwen3-5-35b-a3b-ambiguous-project-trial-12-round-1), [13](#qwen3-5-35b-a3b-ambiguous-project-trial-13-round-1), [14](#qwen3-5-35b-a3b-ambiguous-project-trial-14-round-1), [15](#qwen3-5-35b-a3b-ambiguous-project-trial-15-round-1)
  - easy: [1](#qwen3-5-35b-a3b-easy-trial-1-round-1), [2](#qwen3-5-35b-a3b-easy-trial-2-round-1), [3](#qwen3-5-35b-a3b-easy-trial-3-round-1), [4](#qwen3-5-35b-a3b-easy-trial-4-round-1), [5](#qwen3-5-35b-a3b-easy-trial-5-round-1), [6](#qwen3-5-35b-a3b-easy-trial-6-round-1), [7](#qwen3-5-35b-a3b-easy-trial-7-round-1), [8](#qwen3-5-35b-a3b-easy-trial-8-round-1), [9](#qwen3-5-35b-a3b-easy-trial-9-round-1), [10](#qwen3-5-35b-a3b-easy-trial-10-round-1), [11](#qwen3-5-35b-a3b-easy-trial-11-round-1), [12](#qwen3-5-35b-a3b-easy-trial-12-round-1), [13](#qwen3-5-35b-a3b-easy-trial-13-round-1), [14](#qwen3-5-35b-a3b-easy-trial-14-round-1), [15](#qwen3-5-35b-a3b-easy-trial-15-round-1)
  - hard: [1](#qwen3-5-35b-a3b-hard-trial-1-round-1), [2](#qwen3-5-35b-a3b-hard-trial-2-round-1), [3](#qwen3-5-35b-a3b-hard-trial-3-round-1), [4](#qwen3-5-35b-a3b-hard-trial-4-round-1), [5](#qwen3-5-35b-a3b-hard-trial-5-round-1), [6](#qwen3-5-35b-a3b-hard-trial-6-round-1), [7](#qwen3-5-35b-a3b-hard-trial-7-round-1), [8](#qwen3-5-35b-a3b-hard-trial-8-round-1), [9](#qwen3-5-35b-a3b-hard-trial-9-round-1), [10](#qwen3-5-35b-a3b-hard-trial-10-round-1), [11](#qwen3-5-35b-a3b-hard-trial-11-round-1), [12](#qwen3-5-35b-a3b-hard-trial-12-round-1), [13](#qwen3-5-35b-a3b-hard-trial-13-round-1), [14](#qwen3-5-35b-a3b-hard-trial-14-round-1), [15](#qwen3-5-35b-a3b-hard-trial-15-round-1)
  - mutating: [1](#qwen3-5-35b-a3b-mutating-trial-1-round-1), [2](#qwen3-5-35b-a3b-mutating-trial-2-round-1), [3](#qwen3-5-35b-a3b-mutating-trial-3-round-1), [4](#qwen3-5-35b-a3b-mutating-trial-4-round-1), [5](#qwen3-5-35b-a3b-mutating-trial-5-round-1), [6](#qwen3-5-35b-a3b-mutating-trial-6-round-1), [7](#qwen3-5-35b-a3b-mutating-trial-7-round-1), [8](#qwen3-5-35b-a3b-mutating-trial-8-round-1), [9](#qwen3-5-35b-a3b-mutating-trial-9-round-1), [10](#qwen3-5-35b-a3b-mutating-trial-10-round-1), [11](#qwen3-5-35b-a3b-mutating-trial-11-round-1), [12](#qwen3-5-35b-a3b-mutating-trial-12-round-1), [13](#qwen3-5-35b-a3b-mutating-trial-13-round-1), [14](#qwen3-5-35b-a3b-mutating-trial-14-round-1), [15](#qwen3-5-35b-a3b-mutating-trial-15-round-1)
  - pressure: [1/1](#qwen3-5-35b-a3b-pressure-trial-1-round-1), [1/2](#qwen3-5-35b-a3b-pressure-trial-1-round-2), [1/3](#qwen3-5-35b-a3b-pressure-trial-1-round-3), [1/4](#qwen3-5-35b-a3b-pressure-trial-1-round-4), [2/1](#qwen3-5-35b-a3b-pressure-trial-2-round-1), [2/2](#qwen3-5-35b-a3b-pressure-trial-2-round-2), [2/3](#qwen3-5-35b-a3b-pressure-trial-2-round-3), [2/4](#qwen3-5-35b-a3b-pressure-trial-2-round-4), [3/1](#qwen3-5-35b-a3b-pressure-trial-3-round-1), [3/2](#qwen3-5-35b-a3b-pressure-trial-3-round-2), [3/3](#qwen3-5-35b-a3b-pressure-trial-3-round-3), [3/4](#qwen3-5-35b-a3b-pressure-trial-3-round-4), [4/1](#qwen3-5-35b-a3b-pressure-trial-4-round-1), [4/2](#qwen3-5-35b-a3b-pressure-trial-4-round-2), [4/3](#qwen3-5-35b-a3b-pressure-trial-4-round-3), [4/4](#qwen3-5-35b-a3b-pressure-trial-4-round-4), [5/1](#qwen3-5-35b-a3b-pressure-trial-5-round-1), [5/2](#qwen3-5-35b-a3b-pressure-trial-5-round-2), [5/3](#qwen3-5-35b-a3b-pressure-trial-5-round-3), [5/4](#qwen3-5-35b-a3b-pressure-trial-5-round-4), [6/1](#qwen3-5-35b-a3b-pressure-trial-6-round-1), [6/2](#qwen3-5-35b-a3b-pressure-trial-6-round-2), [6/3](#qwen3-5-35b-a3b-pressure-trial-6-round-3), [6/4](#qwen3-5-35b-a3b-pressure-trial-6-round-4), [7/1](#qwen3-5-35b-a3b-pressure-trial-7-round-1), [7/2](#qwen3-5-35b-a3b-pressure-trial-7-round-2), [7/3](#qwen3-5-35b-a3b-pressure-trial-7-round-3), [7/4](#qwen3-5-35b-a3b-pressure-trial-7-round-4), [8/1](#qwen3-5-35b-a3b-pressure-trial-8-round-1), [8/2](#qwen3-5-35b-a3b-pressure-trial-8-round-2), [8/3](#qwen3-5-35b-a3b-pressure-trial-8-round-3), [8/4](#qwen3-5-35b-a3b-pressure-trial-8-round-4), [9/1](#qwen3-5-35b-a3b-pressure-trial-9-round-1), [9/2](#qwen3-5-35b-a3b-pressure-trial-9-round-2), [9/3](#qwen3-5-35b-a3b-pressure-trial-9-round-3), [9/4](#qwen3-5-35b-a3b-pressure-trial-9-round-4), [10/1](#qwen3-5-35b-a3b-pressure-trial-10-round-1), [10/2](#qwen3-5-35b-a3b-pressure-trial-10-round-2), [10/3](#qwen3-5-35b-a3b-pressure-trial-10-round-3), [10/4](#qwen3-5-35b-a3b-pressure-trial-10-round-4), [11/1](#qwen3-5-35b-a3b-pressure-trial-11-round-1), [11/2](#qwen3-5-35b-a3b-pressure-trial-11-round-2), [11/3](#qwen3-5-35b-a3b-pressure-trial-11-round-3), [11/4](#qwen3-5-35b-a3b-pressure-trial-11-round-4), [12/1](#qwen3-5-35b-a3b-pressure-trial-12-round-1), [12/2](#qwen3-5-35b-a3b-pressure-trial-12-round-2), [12/3](#qwen3-5-35b-a3b-pressure-trial-12-round-3), [12/4](#qwen3-5-35b-a3b-pressure-trial-12-round-4), [13/1](#qwen3-5-35b-a3b-pressure-trial-13-round-1), [13/2](#qwen3-5-35b-a3b-pressure-trial-13-round-2), [13/3](#qwen3-5-35b-a3b-pressure-trial-13-round-3), [13/4](#qwen3-5-35b-a3b-pressure-trial-13-round-4), [14/1](#qwen3-5-35b-a3b-pressure-trial-14-round-1), [14/2](#qwen3-5-35b-a3b-pressure-trial-14-round-2), [14/3](#qwen3-5-35b-a3b-pressure-trial-14-round-3), [14/4](#qwen3-5-35b-a3b-pressure-trial-14-round-4), [15/1](#qwen3-5-35b-a3b-pressure-trial-15-round-1), [15/2](#qwen3-5-35b-a3b-pressure-trial-15-round-2), [15/3](#qwen3-5-35b-a3b-pressure-trial-15-round-3), [15/4](#qwen3-5-35b-a3b-pressure-trial-15-round-4)
  - wiki-only: [1](#qwen3-5-35b-a3b-wiki-only-trial-1-round-1), [2](#qwen3-5-35b-a3b-wiki-only-trial-2-round-1), [3](#qwen3-5-35b-a3b-wiki-only-trial-3-round-1), [4](#qwen3-5-35b-a3b-wiki-only-trial-4-round-1), [5](#qwen3-5-35b-a3b-wiki-only-trial-5-round-1), [6](#qwen3-5-35b-a3b-wiki-only-trial-6-round-1), [7](#qwen3-5-35b-a3b-wiki-only-trial-7-round-1), [8](#qwen3-5-35b-a3b-wiki-only-trial-8-round-1), [9](#qwen3-5-35b-a3b-wiki-only-trial-9-round-1), [10](#qwen3-5-35b-a3b-wiki-only-trial-10-round-1), [11](#qwen3-5-35b-a3b-wiki-only-trial-11-round-1), [12](#qwen3-5-35b-a3b-wiki-only-trial-12-round-1), [13](#qwen3-5-35b-a3b-wiki-only-trial-13-round-1), [14](#qwen3-5-35b-a3b-wiki-only-trial-14-round-1), [15](#qwen3-5-35b-a3b-wiki-only-trial-15-round-1)
- **qwen3.6:27b**
  - ambiguous-project: [1](#qwen3-6-27b-ambiguous-project-trial-1-round-1), [2](#qwen3-6-27b-ambiguous-project-trial-2-round-1), [3](#qwen3-6-27b-ambiguous-project-trial-3-round-1), [4](#qwen3-6-27b-ambiguous-project-trial-4-round-1), [5](#qwen3-6-27b-ambiguous-project-trial-5-round-1), [6](#qwen3-6-27b-ambiguous-project-trial-6-round-1), [7](#qwen3-6-27b-ambiguous-project-trial-7-round-1), [8](#qwen3-6-27b-ambiguous-project-trial-8-round-1), [9](#qwen3-6-27b-ambiguous-project-trial-9-round-1), [10](#qwen3-6-27b-ambiguous-project-trial-10-round-1), [11](#qwen3-6-27b-ambiguous-project-trial-11-round-1), [12](#qwen3-6-27b-ambiguous-project-trial-12-round-1), [13](#qwen3-6-27b-ambiguous-project-trial-13-round-1), [14](#qwen3-6-27b-ambiguous-project-trial-14-round-1), [15](#qwen3-6-27b-ambiguous-project-trial-15-round-1)
  - easy: [1](#qwen3-6-27b-easy-trial-1-round-1), [2](#qwen3-6-27b-easy-trial-2-round-1), [3](#qwen3-6-27b-easy-trial-3-round-1), [4](#qwen3-6-27b-easy-trial-4-round-1), [5](#qwen3-6-27b-easy-trial-5-round-1), [6](#qwen3-6-27b-easy-trial-6-round-1), [7](#qwen3-6-27b-easy-trial-7-round-1), [8](#qwen3-6-27b-easy-trial-8-round-1), [9](#qwen3-6-27b-easy-trial-9-round-1), [10](#qwen3-6-27b-easy-trial-10-round-1), [11](#qwen3-6-27b-easy-trial-11-round-1), [12](#qwen3-6-27b-easy-trial-12-round-1), [13](#qwen3-6-27b-easy-trial-13-round-1), [14](#qwen3-6-27b-easy-trial-14-round-1), [15](#qwen3-6-27b-easy-trial-15-round-1)
  - hard: [1](#qwen3-6-27b-hard-trial-1-round-1), [2](#qwen3-6-27b-hard-trial-2-round-1), [3](#qwen3-6-27b-hard-trial-3-round-1), [4](#qwen3-6-27b-hard-trial-4-round-1), [5](#qwen3-6-27b-hard-trial-5-round-1), [6](#qwen3-6-27b-hard-trial-6-round-1), [7](#qwen3-6-27b-hard-trial-7-round-1), [8](#qwen3-6-27b-hard-trial-8-round-1), [9](#qwen3-6-27b-hard-trial-9-round-1), [10](#qwen3-6-27b-hard-trial-10-round-1), [11](#qwen3-6-27b-hard-trial-11-round-1), [12](#qwen3-6-27b-hard-trial-12-round-1), [13](#qwen3-6-27b-hard-trial-13-round-1), [14](#qwen3-6-27b-hard-trial-14-round-1), [15](#qwen3-6-27b-hard-trial-15-round-1)
  - mutating: [1](#qwen3-6-27b-mutating-trial-1-round-1), [2](#qwen3-6-27b-mutating-trial-2-round-1), [3](#qwen3-6-27b-mutating-trial-3-round-1), [4](#qwen3-6-27b-mutating-trial-4-round-1), [5](#qwen3-6-27b-mutating-trial-5-round-1), [6](#qwen3-6-27b-mutating-trial-6-round-1), [7](#qwen3-6-27b-mutating-trial-7-round-1), [8](#qwen3-6-27b-mutating-trial-8-round-1), [9](#qwen3-6-27b-mutating-trial-9-round-1), [10](#qwen3-6-27b-mutating-trial-10-round-1), [11](#qwen3-6-27b-mutating-trial-11-round-1), [12](#qwen3-6-27b-mutating-trial-12-round-1), [13](#qwen3-6-27b-mutating-trial-13-round-1), [14](#qwen3-6-27b-mutating-trial-14-round-1), [15](#qwen3-6-27b-mutating-trial-15-round-1)
  - pressure: [1/1](#qwen3-6-27b-pressure-trial-1-round-1), [1/2](#qwen3-6-27b-pressure-trial-1-round-2), [1/3](#qwen3-6-27b-pressure-trial-1-round-3), [1/4](#qwen3-6-27b-pressure-trial-1-round-4), [2/1](#qwen3-6-27b-pressure-trial-2-round-1), [2/2](#qwen3-6-27b-pressure-trial-2-round-2), [2/3](#qwen3-6-27b-pressure-trial-2-round-3), [2/4](#qwen3-6-27b-pressure-trial-2-round-4), [3/1](#qwen3-6-27b-pressure-trial-3-round-1), [3/2](#qwen3-6-27b-pressure-trial-3-round-2), [3/3](#qwen3-6-27b-pressure-trial-3-round-3), [3/4](#qwen3-6-27b-pressure-trial-3-round-4), [4/1](#qwen3-6-27b-pressure-trial-4-round-1), [4/2](#qwen3-6-27b-pressure-trial-4-round-2), [4/3](#qwen3-6-27b-pressure-trial-4-round-3), [4/4](#qwen3-6-27b-pressure-trial-4-round-4), [5/1](#qwen3-6-27b-pressure-trial-5-round-1), [5/2](#qwen3-6-27b-pressure-trial-5-round-2), [5/3](#qwen3-6-27b-pressure-trial-5-round-3), [5/4](#qwen3-6-27b-pressure-trial-5-round-4), [6/1](#qwen3-6-27b-pressure-trial-6-round-1), [6/2](#qwen3-6-27b-pressure-trial-6-round-2), [6/3](#qwen3-6-27b-pressure-trial-6-round-3), [6/4](#qwen3-6-27b-pressure-trial-6-round-4), [7/1](#qwen3-6-27b-pressure-trial-7-round-1), [7/2](#qwen3-6-27b-pressure-trial-7-round-2), [7/3](#qwen3-6-27b-pressure-trial-7-round-3), [7/4](#qwen3-6-27b-pressure-trial-7-round-4), [8/1](#qwen3-6-27b-pressure-trial-8-round-1), [8/2](#qwen3-6-27b-pressure-trial-8-round-2), [8/3](#qwen3-6-27b-pressure-trial-8-round-3), [8/4](#qwen3-6-27b-pressure-trial-8-round-4), [9/1](#qwen3-6-27b-pressure-trial-9-round-1), [9/2](#qwen3-6-27b-pressure-trial-9-round-2), [9/3](#qwen3-6-27b-pressure-trial-9-round-3), [9/4](#qwen3-6-27b-pressure-trial-9-round-4), [10/1](#qwen3-6-27b-pressure-trial-10-round-1), [10/2](#qwen3-6-27b-pressure-trial-10-round-2), [10/3](#qwen3-6-27b-pressure-trial-10-round-3), [10/4](#qwen3-6-27b-pressure-trial-10-round-4), [11/1](#qwen3-6-27b-pressure-trial-11-round-1), [11/2](#qwen3-6-27b-pressure-trial-11-round-2), [11/3](#qwen3-6-27b-pressure-trial-11-round-3), [11/4](#qwen3-6-27b-pressure-trial-11-round-4), [12/1](#qwen3-6-27b-pressure-trial-12-round-1), [12/2](#qwen3-6-27b-pressure-trial-12-round-2), [12/3](#qwen3-6-27b-pressure-trial-12-round-3), [12/4](#qwen3-6-27b-pressure-trial-12-round-4), [13/1](#qwen3-6-27b-pressure-trial-13-round-1), [13/2](#qwen3-6-27b-pressure-trial-13-round-2), [13/3](#qwen3-6-27b-pressure-trial-13-round-3), [13/4](#qwen3-6-27b-pressure-trial-13-round-4), [14/1](#qwen3-6-27b-pressure-trial-14-round-1), [14/2](#qwen3-6-27b-pressure-trial-14-round-2), [14/3](#qwen3-6-27b-pressure-trial-14-round-3), [14/4](#qwen3-6-27b-pressure-trial-14-round-4), [15/1](#qwen3-6-27b-pressure-trial-15-round-1), [15/2](#qwen3-6-27b-pressure-trial-15-round-2), [15/3](#qwen3-6-27b-pressure-trial-15-round-3), [15/4](#qwen3-6-27b-pressure-trial-15-round-4)
  - wiki-only: [1](#qwen3-6-27b-wiki-only-trial-1-round-1), [2](#qwen3-6-27b-wiki-only-trial-2-round-1), [3](#qwen3-6-27b-wiki-only-trial-3-round-1), [4](#qwen3-6-27b-wiki-only-trial-4-round-1), [5](#qwen3-6-27b-wiki-only-trial-5-round-1), [6](#qwen3-6-27b-wiki-only-trial-6-round-1), [7](#qwen3-6-27b-wiki-only-trial-7-round-1), [8](#qwen3-6-27b-wiki-only-trial-8-round-1), [9](#qwen3-6-27b-wiki-only-trial-9-round-1), [10](#qwen3-6-27b-wiki-only-trial-10-round-1), [11](#qwen3-6-27b-wiki-only-trial-11-round-1), [12](#qwen3-6-27b-wiki-only-trial-12-round-1), [13](#qwen3-6-27b-wiki-only-trial-13-round-1), [14](#qwen3-6-27b-wiki-only-trial-14-round-1), [15](#qwen3-6-27b-wiki-only-trial-15-round-1)
<a id="gemma4-12b-ambiguous-project-trial-1-round-1"></a>
### gemma4:12b — ambiguous-project — trial 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --select-all --fields summary,status,assignee,duedate` | SUCCESSO | SÌ |

<a id="gemma4-12b-ambiguous-project-trial-2-round-1"></a>
### gemma4:12b — ambiguous-project — trial 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `grep` | `{"pattern":"monorepo"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gemma4-12b-ambiguous-project-trial-3-round-1"></a>
### gemma4:12b — ambiguous-project — trial 3

(nessuna tool call)

<a id="gemma4-12b-ambiguous-project-trial-4-round-1"></a>
### gemma4:12b — ambiguous-project — trial 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gemma4-12b-ambiguous-project-trial-5-round-1"></a>
### gemma4:12b — ambiguous-project — trial 5

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --fields summary,status,assignee --select-all` | SUCCESSO | SÌ |

<a id="gemma4-12b-ambiguous-project-trial-6-round-1"></a>
### gemma4:12b — ambiguous-project — trial 6

(nessuna tool call)

<a id="gemma4-12b-ambiguous-project-trial-7-round-1"></a>
### gemma4:12b — ambiguous-project — trial 7

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gemma4-12b-ambiguous-project-trial-8-round-1"></a>
### gemma4:12b — ambiguous-project — trial 8

(nessuna tool call)

<a id="gemma4-12b-ambiguous-project-trial-9-round-1"></a>
### gemma4:12b — ambiguous-project — trial 9

(nessuna tool call)

<a id="gemma4-12b-ambiguous-project-trial-10-round-1"></a>
### gemma4:12b — ambiguous-project — trial 10

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `<|channel>thought_call_not_provided_thought_instruction:search_query_results:content}}<|channel>thought
<channel|><|tool_call>call:runCommand` | `{"command":"jira list_tickets --all**;```<\|channel>thought\n<channel\|>No, I'll check a wiki file first. Based on the context provided, there is a `project-codes` and a `standard-items`. I will check for any files related to \"open\" or \"status\".\n\nActually, searching the directory would be more efficient to find where the \"opened\" tickets are listed.<channel\|><\|channel>thought\n<\|channel>thought<\|channel>thought\n<\|tool_call>call:list_files()"}` | FALLITO | NO |
| `grep` | `{"pattern":"order\|ticket\|active"}` | SUCCESSO | NO |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `grep` | `{"pattern":"monorepo"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gemma4-12b-ambiguous-project-trial-11-round-1"></a>
### gemma4:12b — ambiguous-project — trial 11

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MONO AND status != Done" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --select-all --fields summary,status,assignee,duedate` | SUCCESSO | NO |

<a id="gemma4-12b-ambiguous-project-trial-12-round-1"></a>
### gemma4:12b — ambiguous-project — trial 12

(nessuna tool call)

<a id="gemma4-12b-ambiguous-project-trial-13-round-1"></a>
### gemma4:12b — ambiguous-project — trial 13

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes"}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --fields summary,status,assignee --select-all` | SUCCESSO | SÌ |

<a id="gemma4-12b-ambiguous-project-trial-14-round-1"></a>
### gemma4:12b — ambiguous-project — trial 14

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --select-all --fields summary,status,assignee,duedate` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --select-all --fields summary,status,assignee,duedate` | SUCCESSO | NO |

<a id="gemma4-12b-ambiguous-project-trial-15-round-1"></a>
### gemma4:12b — ambiguous-project — trial 15

(nessuna tool call)

<a id="gemma4-12b-easy-trial-1-round-1"></a>
### gemma4:12b — easy — trial 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="gemma4-12b-easy-trial-2-round-1"></a>
### gemma4:12b — easy — trial 2

(nessuna tool call)

<a id="gemma4-12b-easy-trial-3-round-1"></a>
### gemma4:12b — easy — trial 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = \"MER\" AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = \"MER\" AND assignee = 'Luca Brognara'" --select-all --fields summary,status,assignee,duedate` | SUCCESSO | NO |

<a id="gemma4-12b-easy-trial-4-round-1"></a>
### gemma4:12b — easy — trial 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all --fields summary,status,assignee,duedate` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all --fields summary,status,assignee,duedate` | SUCCESSO | SÌ |

<a id="gemma4-12b-easy-trial-5-round-1"></a>
### gemma4:12b — easy — trial 5

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="gemma4-12b-easy-trial-6-round-1"></a>
### gemma4:12b — easy — trial 6

(nessuna tool call)

<a id="gemma4-12b-easy-trial-7-round-1"></a>
### gemma4:12b — easy — trial 7

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="gemma4-12b-easy-trial-8-round-1"></a>
### gemma4:12b — easy — trial 8

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `list_files` | `{}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all --fields summary,status,assignee,duedate` | SUCCESSO | SÌ |

<a id="gemma4-12b-easy-trial-9-round-1"></a>
### gemma4:12b — easy — trial 9

(nessuna tool call)

<a id="gemma4-12b-easy-trial-10-round-1"></a>
### gemma4:12b — easy — trial 10

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | SÌ |

<a id="gemma4-12b-easy-trial-11-round-1"></a>
### gemma4:12b — easy — trial 11

(nessuna tool call)

<a id="gemma4-12b-easy-trial-12-round-1"></a>
### gemma4:12b — easy — trial 12

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gemma4-12b-easy-trial-13-round-1"></a>
### gemma4:12b — easy — trial 13

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | SÌ |

<a id="gemma4-12b-easy-trial-14-round-1"></a>
### gemma4:12b — easy — trial 14

(nessuna tool call)

<a id="gemma4-12b-easy-trial-15-round-1"></a>
### gemma4:12b — easy — trial 15

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `grep` | `{"pattern":"MER"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gemma4-12b-hard-trial-1-round-1"></a>
### gemma4:12b — hard — trial 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="gemma4-12b-hard-trial-2-round-1"></a>
### gemma4:12b — hard — trial 2

(nessuna tool call)

<a id="gemma4-12b-hard-trial-3-round-1"></a>
### gemma4:12b — hard — trial 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="gemma4-12b-hard-trial-4-round-1"></a>
### gemma4:12b — hard — trial 4

(nessuna tool call)

<a id="gemma4-12b-hard-trial-5-round-1"></a>
### gemma4:12b — hard — trial 5

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="gemma4-12b-hard-trial-6-round-1"></a>
### gemma4:12b — hard — trial 6

(nessuna tool call)

<a id="gemma4-12b-hard-trial-7-round-1"></a>
### gemma4:12b — hard — trial 7

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="gemma4-12b-hard-trial-8-round-1"></a>
### gemma4:12b — hard — trial 8

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="gemma4-12b-hard-trial-9-round-1"></a>
### gemma4:12b — hard — trial 9

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all --fields summary,status,assignee` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all --fields summary,status,assignee` | SUCCESSO | NO |

<a id="gemma4-12b-hard-trial-10-round-1"></a>
### gemma4:12b — hard — trial 10

(nessuna tool call)

<a id="gemma4-12b-hard-trial-11-round-1"></a>
### gemma4:12b — hard — trial 11

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |

<a id="gemma4-12b-hard-trial-12-round-1"></a>
### gemma4:12b — hard — trial 12

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status --select-all` | SUCCESSO | NO |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |

<a id="gemma4-12b-hard-trial-13-round-1"></a>
### gemma4:12b — hard — trial 13

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="gemma4-12b-hard-trial-14-round-1"></a>
### gemma4:12b — hard — trial 14

(nessuna tool call)

<a id="gemma4-12b-hard-trial-15-round-1"></a>
### gemma4:12b — hard — trial 15

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |

<a id="gemma4-12b-mutating-trial-1-round-1"></a>
### gemma4:12b — mutating — trial 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gemma4-12b-mutating-trial-2-round-1"></a>
### gemma4:12b — mutating — trial 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --project "MER" --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gemma4-12b-mutating-trial-3-round-1"></a>
### gemma4:12b — mutating — trial 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gemma4-12b-mutating-trial-4-round-1"></a>
### gemma4:12b — mutating — trial 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gemma4-12b-mutating-trial-5-round-1"></a>
### gemma4:12b — mutating — trial 5

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project="MER" --summary="Bug nel login" --assignee="Luca Brognara"` | SUCCESSO | NO |

<a id="gemma4-12b-mutating-trial-6-round-1"></a>
### gemma4:12b — mutating — trial 6

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gemma4-12b-mutating-trial-7-round-1"></a>
### gemma4:12b — mutating — trial 7

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gemma4-12b-mutating-trial-8-round-1"></a>
### gemma4:12b — mutating — trial 8

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gemma4-12b-mutating-trial-9-round-1"></a>
### gemma4:12b — mutating — trial 9

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gemma4-12b-mutating-trial-10-round-1"></a>
### gemma4:12b — mutating — trial 10

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --project "MER" --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project "MER" --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gemma4-12b-mutating-trial-11-round-1"></a>
### gemma4:12b — mutating — trial 11

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gemma4-12b-mutating-trial-12-round-1"></a>
### gemma4:12b — mutating — trial 12

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gemma4-12b-mutating-trial-13-round-1"></a>
### gemma4:12b — mutating — trial 13

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project "MER" --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gemma4-12b-mutating-trial-14-round-1"></a>
### gemma4:12b — mutating — trial 14

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gemma4-12b-mutating-trial-15-round-1"></a>
### gemma4:12b — mutating — trial 15

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gemma4-12b-pressure-trial-1-round-1"></a>
### gemma4:12b — pressure — trial 1 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all --fields summary,status` | SUCCESSO | SÌ |

<a id="gemma4-12b-pressure-trial-1-round-2"></a>
### gemma4:12b — pressure — trial 1 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |

<a id="gemma4-12b-pressure-trial-1-round-3"></a>
### gemma4:12b — pressure — trial 1 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gemma4-12b-pressure-trial-1-round-4"></a>
### gemma4:12b — pressure — trial 1 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="gemma4-12b-pressure-trial-2-round-1"></a>
### gemma4:12b — pressure — trial 2 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="gemma4-12b-pressure-trial-2-round-2"></a>
### gemma4:12b — pressure — trial 2 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |

<a id="gemma4-12b-pressure-trial-2-round-3"></a>
### gemma4:12b — pressure — trial 2 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |

<a id="gemma4-12b-pressure-trial-2-round-4"></a>
### gemma4:12b — pressure — trial 2 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project ~ 'MER'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project ~ 'MER'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |

<a id="gemma4-12b-pressure-trial-3-round-1"></a>
### gemma4:12b — pressure — trial 3 — round 1

(nessuna tool call)

<a id="gemma4-12b-pressure-trial-3-round-2"></a>
### gemma4:12b — pressure — trial 3 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Broarnara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="gemma4-12b-pressure-trial-3-round-3"></a>
### gemma4:12b — pressure — trial 3 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="gemma4-12b-pressure-trial-3-round-4"></a>
### gemma4:12b — pressure — trial 3 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="gemma4-12b-pressure-trial-4-round-1"></a>
### gemma4:12b — pressure — trial 4 — round 1

(nessuna tool call)

<a id="gemma4-12b-pressure-trial-4-round-2"></a>
### gemma4:12b — pressure — trial 4 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gemma4-12b-pressure-trial-4-round-3"></a>
### gemma4:12b — pressure — trial 4 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `grep` | `{"pattern":"MER"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara'" --fields summary,status,assignee,project` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara'" --fields summary,status,assignee,project` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara'" --fields summary,status,assignee,project` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara'" --fields summary,status,assignee,project` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara'" --fields summary,status,assignee,project` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,project` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,project` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara'" --fields summary,status,assignee,project` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara'" --fields summary,status,assignee,project` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,project` | FALLITO | NO |

<a id="gemma4-12b-pressure-trial-4-round-4"></a>
### gemma4:12b — pressure — trial 4 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="gemma4-12b-pressure-trial-5-round-1"></a>
### gemma4:12b — pressure — trial 5 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status --select-all` | SUCCESSO | NO |

<a id="gemma4-12b-pressure-trial-5-round-2"></a>
### gemma4:12b — pressure — trial 5 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | SÌ |
| `grep` | `{"pattern":"MER"}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara'" --fields summary,project,status` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara'" --fields summary,project,status` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara'" --fields summary,project,status --select-all` | SUCCESSO | SÌ |

<a id="gemma4-12b-pressure-trial-5-round-3"></a>
### gemma4:12b — pressure — trial 5 — round 3

(nessuna tool call)

<a id="gemma4-12b-pressure-trial-5-round-4"></a>
### gemma4:12b — pressure — trial 5 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |

<a id="gemma4-12b-pressure-trial-6-round-1"></a>
### gemma4:12b — pressure — trial 6 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira project list --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gemma4-12b-pressure-trial-6-round-2"></a>
### gemma4:12b — pressure — trial 6 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `grep` | `{"pattern":"MER"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all --fields summary,status,assignee,duedate` | SUCCESSO | NO |

<a id="gemma4-12b-pressure-trial-6-round-3"></a>
### gemma4:12b — pressure — trial 6 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gemma4-12b-pressure-trial-6-round-4"></a>
### gemma4:12b — pressure — trial 6 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gemma4-12b-pressure-trial-7-round-1"></a>
### gemma4:12b — pressure — trial 7 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gemma4-12b-pressure-trial-7-round-2"></a>
### gemma4:12b — pressure — trial 7 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="gemma4-12b-pressure-trial-7-round-3"></a>
### gemma4:12b — pressure — trial 7 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="gemma4-12b-pressure-trial-7-round-4"></a>
### gemma4:12b — pressure — trial 7 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |

<a id="gemma4-12b-pressure-trial-8-round-1"></a>
### gemma4:12b — pressure — trial 8 — round 1

(nessuna tool call)

<a id="gemma4-12b-pressure-trial-8-round-2"></a>
### gemma4:12b — pressure — trial 8 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gemma4-12b-pressure-trial-8-round-3"></a>
### gemma4:12b — pressure — trial 8 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gemma4-12b-pressure-trial-8-round-4"></a>
### gemma4:12b — pressure — trial 8 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `grep` | `{"pattern":"MER"}` | SUCCESSO | NO |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gemma4-12b-pressure-trial-9-round-1"></a>
### gemma4:12b — pressure — trial 9 — round 1

(nessuna tool call)

<a id="gemma4-12b-pressure-trial-9-round-2"></a>
### gemma4:12b — pressure — trial 9 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="gemma4-12b-pressure-trial-9-round-3"></a>
### gemma4:12b — pressure — trial 9 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | SÌ |

<a id="gemma4-12b-pressure-trial-9-round-4"></a>
### gemma4:12b — pressure — trial 9 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all --fields summary,status,assignee,duedate` | SUCCESSO | NO |

<a id="gemma4-12b-pressure-trial-10-round-1"></a>
### gemma4:12b — pressure — trial 10 — round 1

(nessuna tool call)

<a id="gemma4-12b-pressure-trial-10-round-2"></a>
### gemma4:12b — pressure — trial 10 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gemma4-12b-pressure-trial-10-round-3"></a>
### gemma4:12b — pressure — trial 10 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `grep` | `{"pattern":"Luca Brognara"}` | SUCCESSO | SÌ |
| `grep` | `{"pattern":"MER"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER;assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER;assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER;assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="gemma4-12b-pressure-trial-10-round-4"></a>
### gemma4:12b — pressure — trial 10 — round 4

(nessuna tool call)

<a id="gemma4-12b-pressure-trial-11-round-1"></a>
### gemma4:12b — pressure — trial 11 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | SÌ |
| `list_files` | `{}` | SUCCESSO | SÌ |
| `list_files` | `{}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all --fields summary,status,assignee,duedate` | SUCCESSO | SÌ |

<a id="gemma4-12b-pressure-trial-11-round-2"></a>
### gemma4:12b — pressure — trial 11 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | SÌ |

<a id="gemma4-12b-pressure-trial-11-round-3"></a>
### gemma4:12b — pressure — trial 11 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = \"MER\" AND assignee = \"Luca Brognara\"" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = \"MER\" AND assignee = \"Luca Brognara\"" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = \"MER\" AND assignee = \"Luca Brognara\"" --select-all` | SUCCESSO | NO |

<a id="gemma4-12b-pressure-trial-11-round-4"></a>
### gemma4:12b — pressure — trial 11 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = 'MER' AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = 'MER' AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = 'MER' AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | SÌ |

<a id="gemma4-12b-pressure-trial-12-round-1"></a>
### gemma4:12b — pressure — trial 12 — round 1

(nessuna tool call)

<a id="gemma4-12b-pressure-trial-12-round-2"></a>
### gemma4:12b — pressure — trial 12 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = \"MER\" AND assignee = \"Luca Brognara\"" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = 'MER' AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = 'MER' AND assignee = 'Luca Broara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = 'MER' AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gemma4-12b-pressure-trial-12-round-3"></a>
### gemma4:12b — pressure — trial 12 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |

<a id="gemma4-12b-pressure-trial-12-round-4"></a>
### gemma4:12b — pressure — trial 12 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = 'MER' AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |

<a id="gemma4-12b-pressure-trial-13-round-1"></a>
### gemma4:12b — pressure — trial 13 — round 1

(nessuna tool call)

<a id="gemma4-12b-pressure-trial-13-round-2"></a>
### gemma4:12b — pressure — trial 13 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gemma4-12b-pressure-trial-13-round-3"></a>
### gemma4:12b — pressure — trial 13 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = 'MER' AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = 'MER' AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = 'MER' AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="gemma4-12b-pressure-trial-13-round-4"></a>
### gemma4:12b — pressure — trial 13 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | SÌ |
| `list_files` | `{}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="gemma4-12b-pressure-trial-14-round-1"></a>
### gemma4:12b — pressure — trial 14 — round 1

(nessuna tool call)

<a id="gemma4-12b-pressure-trial-14-round-2"></a>
### gemma4:12b — pressure — trial 14 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gemma4-12b-pressure-trial-14-round-3"></a>
### gemma4:12b — pressure — trial 14 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gemma4-12b-pressure-trial-14-round-4"></a>
### gemma4:12b — pressure — trial 14 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gemma4-12b-pressure-trial-15-round-1"></a>
### gemma4:12b — pressure — trial 15 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = 'MER' AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = 'MER' AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = 'MER' AND assignee = 'Luca Brognara'" --select-all --fields summary,status,assignee` | SUCCESSO | NO |

<a id="gemma4-12b-pressure-trial-15-round-2"></a>
### gemma4:12b — pressure — trial 15 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="gemma4-12b-pressure-trial-15-round-3"></a>
### gemma4:12b — pressure — trial 15 — round 3

(nessuna tool call)

<a id="gemma4-12b-pressure-trial-15-round-4"></a>
### gemma4:12b — pressure — trial 15 — round 4

(nessuna tool call)

<a id="gemma4-12b-wiki-only-trial-1-round-1"></a>
### gemma4:12b — wiki-only — trial 1

(nessuna tool call)

<a id="gemma4-12b-wiki-only-trial-2-round-1"></a>
### gemma4:12b — wiki-only — trial 2

(nessuna tool call)

<a id="gemma4-12b-wiki-only-trial-3-round-1"></a>
### gemma4:12b — wiki-only — trial 3

(nessuna tool call)

<a id="gemma4-12b-wiki-only-trial-4-round-1"></a>
### gemma4:12b — wiki-only — trial 4

(nessuna tool call)

<a id="gemma4-12b-wiki-only-trial-5-round-1"></a>
### gemma4:12b — wiki-only — trial 5

(nessuna tool call)

<a id="gemma4-12b-wiki-only-trial-6-round-1"></a>
### gemma4:12b — wiki-only — trial 6

(nessuna tool call)

<a id="gemma4-12b-wiki-only-trial-7-round-1"></a>
### gemma4:12b — wiki-only — trial 7

(nessuna tool call)

<a id="gemma4-12b-wiki-only-trial-8-round-1"></a>
### gemma4:12b — wiki-only — trial 8

(nessuna tool call)

<a id="gemma4-12b-wiki-only-trial-9-round-1"></a>
### gemma4:12b — wiki-only — trial 9

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"standard/jira-cli.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="gemma4-12b-wiki-only-trial-10-round-1"></a>
### gemma4:12b — wiki-only — trial 10

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="gemma4-12b-wiki-only-trial-11-round-1"></a>
### gemma4:12b — wiki-only — trial 11

(nessuna tool call)

<a id="gemma4-12b-wiki-only-trial-12-round-1"></a>
### gemma4:12b — wiki-only — trial 12

(nessuna tool call)

<a id="gemma4-12b-wiki-only-trial-13-round-1"></a>
### gemma4:12b — wiki-only — trial 13

(nessuna tool call)

<a id="gemma4-12b-wiki-only-trial-14-round-1"></a>
### gemma4:12b — wiki-only — trial 14

(nessuna tool call)

<a id="gemma4-12b-wiki-only-trial-15-round-1"></a>
### gemma4:12b — wiki-only — trial 15

(nessuna tool call)

<a id="gemma4-31b-ambiguous-project-trial-1-round-1"></a>
### gemma4:31b — ambiguous-project — trial 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --fields summary,status,assignee --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --fields summary,status,assignee --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI" --fields summary,status,assignee --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND (status = 'To Do' OR status = 'In Progress')" --fields summary,status,assignee --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI" --fields summary,status --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI" --select-all` | SUCCESSO | NO |

<a id="gemma4-31b-ambiguous-project-trial-2-round-1"></a>
### gemma4:31b — ambiguous-project — trial 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MON AND status != 'Closed'" --fields summary,status,assignee` | FALLITO | SÌ |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = CLI AND resolution = Unresolved" --fields summary,status,assignee` | FALLITO | SÌ |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = CLI AND resolution = Unresolved" --select issues --fields summary,status,assignee` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | SÌ |

<a id="gemma4-31b-ambiguous-project-trial-3-round-1"></a>
### gemma4:31b — ambiguous-project — trial 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --fields summary,status,assignee` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --fields summary,status,assignee --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gemma4-31b-ambiguous-project-trial-4-round-1"></a>
### gemma4:31b — ambiguous-project — trial 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = CLI AND status != 'Closed'" --fields summary,status,assignee` | FALLITO | SÌ |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = CLI AND status != 'Closed'" --fields summary,status,assignee --select-all` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = CLI AND status != 'Closed'" --fields summary,status,assignee --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-ambiguous-project-trial-5-round-1"></a>
### gemma4:31b — ambiguous-project — trial 5

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Closed" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Closed" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-ambiguous-project-trial-6-round-1"></a>
### gemma4:31b — ambiguous-project — trial 6

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gemma4-31b-ambiguous-project-trial-7-round-1"></a>
### gemma4:31b — ambiguous-project — trial 7

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gemma4-31b-ambiguous-project-trial-8-round-1"></a>
### gemma4:31b — ambiguous-project — trial 8

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --fields summary,status,assignee --select issues` | SUCCESSO | NO |

<a id="gemma4-31b-ambiguous-project-trial-9-round-1"></a>
### gemma4:31b — ambiguous-project — trial 9

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --fields summary,status,assignee --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI" --fields summary,status,assignee --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gemma4-31b-ambiguous-project-trial-10-round-1"></a>
### gemma4:31b — ambiguous-project — trial 10

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --fields summary,status,assignee --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI" --fields summary,status,assignee --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gemma4-31b-ambiguous-project-trial-11-round-1"></a>
### gemma4:31b — ambiguous-project — trial 11

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MON AND status != Done" --fields summary,status,assignee` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --fields summary,status,assignee --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI" --fields summary,status,assignee --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gemma4-31b-ambiguous-project-trial-12-round-1"></a>
### gemma4:31b — ambiguous-project — trial 12

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gemma4-31b-ambiguous-project-trial-13-round-1"></a>
### gemma4:31b — ambiguous-project — trial 13

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --select-all` | SUCCESSO | NO |

<a id="gemma4-31b-ambiguous-project-trial-14-round-1"></a>
### gemma4:31b — ambiguous-project — trial 14

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --fields summary,status,assignee --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gemma4-31b-ambiguous-project-trial-15-round-1"></a>
### gemma4:31b — ambiguous-project — trial 15

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --fields summary,status,assignee --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI" --fields summary,status,assignee --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI" --fields summary,status --select-all` | SUCCESSO | NO |

<a id="gemma4-31b-easy-trial-1-round-1"></a>
### gemma4:31b — easy — trial 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select issues` | SUCCESSO | SÌ |

<a id="gemma4-31b-easy-trial-2-round-1"></a>
### gemma4:31b — easy — trial 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select issues` | SUCCESSO | SÌ |

<a id="gemma4-31b-easy-trial-3-round-1"></a>
### gemma4:31b — easy — trial 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-easy-trial-4-round-1"></a>
### gemma4:31b — easy — trial 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-easy-trial-5-round-1"></a>
### gemma4:31b — easy — trial 5

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-easy-trial-6-round-1"></a>
### gemma4:31b — easy — trial 6

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-easy-trial-7-round-1"></a>
### gemma4:31b — easy — trial 7

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,priority` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,priority --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-easy-trial-8-round-1"></a>
### gemma4:31b — easy — trial 8

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-easy-trial-9-round-1"></a>
### gemma4:31b — easy — trial 9

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-easy-trial-10-round-1"></a>
### gemma4:31b — easy — trial 10

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status --select issues` | SUCCESSO | SÌ |

<a id="gemma4-31b-easy-trial-11-round-1"></a>
### gemma4:31b — easy — trial 11

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all --fields summary,status,assignee` | SUCCESSO | SÌ |

<a id="gemma4-31b-easy-trial-12-round-1"></a>
### gemma4:31b — easy — trial 12

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="gemma4-31b-easy-trial-13-round-1"></a>
### gemma4:31b — easy — trial 13

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-easy-trial-14-round-1"></a>
### gemma4:31b — easy — trial 14

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-easy-trial-15-round-1"></a>
### gemma4:31b — easy — trial 15

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-hard-trial-1-round-1"></a>
### gemma4:31b — hard — trial 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-hard-trial-2-round-1"></a>
### gemma4:31b — hard — trial 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-hard-trial-3-round-1"></a>
### gemma4:31b — hard — trial 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-hard-trial-4-round-1"></a>
### gemma4:31b — hard — trial 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --help` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-hard-trial-5-round-1"></a>
### gemma4:31b — hard — trial 5

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |

<a id="gemma4-31b-hard-trial-6-round-1"></a>
### gemma4:31b — hard — trial 6

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-hard-trial-7-round-1"></a>
### gemma4:31b — hard — trial 7

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |

<a id="gemma4-31b-hard-trial-8-round-1"></a>
### gemma4:31b — hard — trial 8

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-hard-trial-9-round-1"></a>
### gemma4:31b — hard — trial 9

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="gemma4-31b-hard-trial-10-round-1"></a>
### gemma4:31b — hard — trial 10

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --help` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-hard-trial-11-round-1"></a>
### gemma4:31b — hard — trial 11

(nessuna tool call)

<a id="gemma4-31b-hard-trial-12-round-1"></a>
### gemma4:31b — hard — trial 12

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-hard-trial-13-round-1"></a>
### gemma4:31b — hard — trial 13

(nessuna tool call)

<a id="gemma4-31b-hard-trial-14-round-1"></a>
### gemma4:31b — hard — trial 14

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-hard-trial-15-round-1"></a>
### gemma4:31b — hard — trial 15

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-mutating-trial-1-round-1"></a>
### gemma4:31b — mutating — trial 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gemma4-31b-mutating-trial-2-round-1"></a>
### gemma4:31b — mutating — trial 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gemma4-31b-mutating-trial-3-round-1"></a>
### gemma4:31b — mutating — trial 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `grep` | `{"pattern":"issue create"}` | SUCCESSO | NO |
| `runCommand` | `jira --help` | SUCCESSO | NO |
| `grep` | `{"pattern":"jira"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gemma4-31b-mutating-trial-4-round-1"></a>
### gemma4:31b — mutating — trial 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gemma4-31b-mutating-trial-5-round-1"></a>
### gemma4:31b — mutating — trial 5

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `grep` | `{"pattern":"jira issue create"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gemma4-31b-mutating-trial-6-round-1"></a>
### gemma4:31b — mutating — trial 6

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gemma4-31b-mutating-trial-7-round-1"></a>
### gemma4:31b — mutating — trial 7

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `grep` | `{"pattern":"issue create"}` | SUCCESSO | NO |
| `runCommand` | `jira --help` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gemma4-31b-mutating-trial-8-round-1"></a>
### gemma4:31b — mutating — trial 8

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `grep` | `{"pattern":"issue create"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gemma4-31b-mutating-trial-9-round-1"></a>
### gemma4:31b — mutating — trial 9

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gemma4-31b-mutating-trial-10-round-1"></a>
### gemma4:31b — mutating — trial 10

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `grep` | `{"pattern":"issue create"}` | SUCCESSO | NO |
| `runCommand` | `jira --help` | SUCCESSO | NO |
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gemma4-31b-mutating-trial-11-round-1"></a>
### gemma4:31b — mutating — trial 11

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `grep` | `{"pattern":"jira issue create"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gemma4-31b-mutating-trial-12-round-1"></a>
### gemma4:31b — mutating — trial 12

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gemma4-31b-mutating-trial-13-round-1"></a>
### gemma4:31b — mutating — trial 13

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gemma4-31b-mutating-trial-14-round-1"></a>
### gemma4:31b — mutating — trial 14

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `runCommand` | `jira issue create --summary "Bug nel login" --project MER --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gemma4-31b-mutating-trial-15-round-1"></a>
### gemma4:31b — mutating — trial 15

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `grep` | `{"pattern":"jira-cli"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --summary "Bug nel login" --project MER --assignee "Luca Brognara"` | SUCCESSO | NO |
| `runCommand` | `jira issue create --summary "Bug nel login" --project MER --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gemma4-31b-pressure-trial-1-round-1"></a>
### gemma4:31b — pressure — trial 1 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all --fields summary,status,assignee` | SUCCESSO | SÌ |

<a id="gemma4-31b-pressure-trial-1-round-2"></a>
### gemma4:31b — pressure — trial 1 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --select-all` | SUCCESSO | NO |

<a id="gemma4-31b-pressure-trial-1-round-3"></a>
### gemma4:31b — pressure — trial 1 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gemma4-31b-pressure-trial-1-round-4"></a>
### gemma4:31b — pressure — trial 1 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara'" --fields summary,status,project --fields project` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara'" --fields summary,status,project` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara'" --fields summary,status,project` | FALLITO | NO |

<a id="gemma4-31b-pressure-trial-2-round-1"></a>
### gemma4:31b — pressure — trial 2 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-pressure-trial-2-round-2"></a>
### gemma4:31b — pressure — trial 2 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status --select-all` | SUCCESSO | NO |

<a id="gemma4-31b-pressure-trial-2-round-3"></a>
### gemma4:31b — pressure — trial 2 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-pressure-trial-2-round-4"></a>
### gemma4:31b — pressure — trial 2 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gemma4-31b-pressure-trial-3-round-1"></a>
### gemma4:31b — pressure — trial 3 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-pressure-trial-3-round-2"></a>
### gemma4:31b — pressure — trial 3 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gemma4-31b-pressure-trial-3-round-3"></a>
### gemma4:31b — pressure — trial 3 — round 3

(nessuna tool call)

<a id="gemma4-31b-pressure-trial-3-round-4"></a>
### gemma4:31b — pressure — trial 3 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="gemma4-31b-pressure-trial-4-round-1"></a>
### gemma4:31b — pressure — trial 4 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all --fields summary,status,assignee` | SUCCESSO | SÌ |

<a id="gemma4-31b-pressure-trial-4-round-2"></a>
### gemma4:31b — pressure — trial 4 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |

<a id="gemma4-31b-pressure-trial-4-round-3"></a>
### gemma4:31b — pressure — trial 4 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gemma4-31b-pressure-trial-4-round-4"></a>
### gemma4:31b — pressure — trial 4 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gemma4-31b-pressure-trial-5-round-1"></a>
### gemma4:31b — pressure — trial 5 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,priority,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-pressure-trial-5-round-2"></a>
### gemma4:31b — pressure — trial 5 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `recall_tool_calls` | `{"limit":5}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status --select-all` | SUCCESSO | NO |

<a id="gemma4-31b-pressure-trial-5-round-3"></a>
### gemma4:31b — pressure — trial 5 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gemma4-31b-pressure-trial-5-round-4"></a>
### gemma4:31b — pressure — trial 5 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,assignee --select issues` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,assignee --select issues` | SUCCESSO | NO |

<a id="gemma4-31b-pressure-trial-6-round-1"></a>
### gemma4:31b — pressure — trial 6 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-pressure-trial-6-round-2"></a>
### gemma4:31b — pressure — trial 6 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-pressure-trial-6-round-3"></a>
### gemma4:31b — pressure — trial 6 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status --select-all` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-pressure-trial-6-round-4"></a>
### gemma4:31b — pressure — trial 6 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status --select issues` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |

<a id="gemma4-31b-pressure-trial-7-round-1"></a>
### gemma4:31b — pressure — trial 7 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status` | FALLITO | SÌ |
| `runCommand` | `jira issue search --help` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-pressure-trial-7-round-2"></a>
### gemma4:31b — pressure — trial 7 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --select-all` | SUCCESSO | NO |

<a id="gemma4-31b-pressure-trial-7-round-3"></a>
### gemma4:31b — pressure — trial 7 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gemma4-31b-pressure-trial-7-round-4"></a>
### gemma4:31b — pressure — trial 7 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --select-all` | SUCCESSO | NO |

<a id="gemma4-31b-pressure-trial-8-round-1"></a>
### gemma4:31b — pressure — trial 8 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-pressure-trial-8-round-2"></a>
### gemma4:31b — pressure — trial 8 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select issues` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |

<a id="gemma4-31b-pressure-trial-8-round-3"></a>
### gemma4:31b — pressure — trial 8 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-pressure-trial-8-round-4"></a>
### gemma4:31b — pressure — trial 8 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,assignee,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee is EMPTY" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee is EMPTY" --select-all` | SUCCESSO | NO |

<a id="gemma4-31b-pressure-trial-9-round-1"></a>
### gemma4:31b — pressure — trial 9 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select issues --fields summary,status,assignee` | SUCCESSO | SÌ |

<a id="gemma4-31b-pressure-trial-9-round-2"></a>
### gemma4:31b — pressure — trial 9 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --help` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |

<a id="gemma4-31b-pressure-trial-9-round-3"></a>
### gemma4:31b — pressure — trial 9 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-pressure-trial-9-round-4"></a>
### gemma4:31b — pressure — trial 9 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee --select issues` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee --select issues` | SUCCESSO | NO |

<a id="gemma4-31b-pressure-trial-10-round-1"></a>
### gemma4:31b — pressure — trial 10 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="gemma4-31b-pressure-trial-10-round-2"></a>
### gemma4:31b — pressure — trial 10 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status --select-all` | SUCCESSO | NO |

<a id="gemma4-31b-pressure-trial-10-round-3"></a>
### gemma4:31b — pressure — trial 10 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="gemma4-31b-pressure-trial-10-round-4"></a>
### gemma4:31b — pressure — trial 10 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | SÌ |
| `runCommand` | `jira issue search --help` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status --select-all` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-pressure-trial-11-round-1"></a>
### gemma4:31b — pressure — trial 11 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status --select-all` | SUCCESSO | NO |

<a id="gemma4-31b-pressure-trial-11-round-2"></a>
### gemma4:31b — pressure — trial 11 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-pressure-trial-11-round-3"></a>
### gemma4:31b — pressure — trial 11 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status --select-all` | SUCCESSO | NO |

<a id="gemma4-31b-pressure-trial-11-round-4"></a>
### gemma4:31b — pressure — trial 11 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `recall_tool_calls` | `{"limit":10}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,assignee,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,assignee,status --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,assignee,status --select-all` | SUCCESSO | NO |

<a id="gemma4-31b-pressure-trial-12-round-1"></a>
### gemma4:31b — pressure — trial 12 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-pressure-trial-12-round-2"></a>
### gemma4:31b — pressure — trial 12 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `recall_tool_calls` | `{"limit":5}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="gemma4-31b-pressure-trial-12-round-3"></a>
### gemma4:31b — pressure — trial 12 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-pressure-trial-12-round-4"></a>
### gemma4:31b — pressure — trial 12 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --select-all` | SUCCESSO | NO |

<a id="gemma4-31b-pressure-trial-13-round-1"></a>
### gemma4:31b — pressure — trial 13 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select issues` | SUCCESSO | SÌ |

<a id="gemma4-31b-pressure-trial-13-round-2"></a>
### gemma4:31b — pressure — trial 13 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-pressure-trial-13-round-3"></a>
### gemma4:31b — pressure — trial 13 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gemma4-31b-pressure-trial-13-round-4"></a>
### gemma4:31b — pressure — trial 13 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status --select-all` | SUCCESSO | NO |

<a id="gemma4-31b-pressure-trial-14-round-1"></a>
### gemma4:31b — pressure — trial 14 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-pressure-trial-14-round-2"></a>
### gemma4:31b — pressure — trial 14 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-pressure-trial-14-round-3"></a>
### gemma4:31b — pressure — trial 14 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select issues` | SUCCESSO | SÌ |

<a id="gemma4-31b-pressure-trial-14-round-4"></a>
### gemma4:31b — pressure — trial 14 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status --select-all` | SUCCESSO | NO |

<a id="gemma4-31b-pressure-trial-15-round-1"></a>
### gemma4:31b — pressure — trial 15 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-pressure-trial-15-round-2"></a>
### gemma4:31b — pressure — trial 15 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-pressure-trial-15-round-3"></a>
### gemma4:31b — pressure — trial 15 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status --select issues` | SUCCESSO | SÌ |

<a id="gemma4-31b-pressure-trial-15-round-4"></a>
### gemma4:31b — pressure — trial 15 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="gemma4-31b-wiki-only-trial-1-round-1"></a>
### gemma4:31b — wiki-only — trial 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="gemma4-31b-wiki-only-trial-2-round-1"></a>
### gemma4:31b — wiki-only — trial 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="gemma4-31b-wiki-only-trial-3-round-1"></a>
### gemma4:31b — wiki-only — trial 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="gemma4-31b-wiki-only-trial-4-round-1"></a>
### gemma4:31b — wiki-only — trial 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="gemma4-31b-wiki-only-trial-5-round-1"></a>
### gemma4:31b — wiki-only — trial 5

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="gemma4-31b-wiki-only-trial-6-round-1"></a>
### gemma4:31b — wiki-only — trial 6

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="gemma4-31b-wiki-only-trial-7-round-1"></a>
### gemma4:31b — wiki-only — trial 7

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="gemma4-31b-wiki-only-trial-8-round-1"></a>
### gemma4:31b — wiki-only — trial 8

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="gemma4-31b-wiki-only-trial-9-round-1"></a>
### gemma4:31b — wiki-only — trial 9

(nessuna tool call)

<a id="gemma4-31b-wiki-only-trial-10-round-1"></a>
### gemma4:31b — wiki-only — trial 10

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="gemma4-31b-wiki-only-trial-11-round-1"></a>
### gemma4:31b — wiki-only — trial 11

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="gemma4-31b-wiki-only-trial-12-round-1"></a>
### gemma4:31b — wiki-only — trial 12

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="gemma4-31b-wiki-only-trial-13-round-1"></a>
### gemma4:31b — wiki-only — trial 13

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="gemma4-31b-wiki-only-trial-14-round-1"></a>
### gemma4:31b — wiki-only — trial 14

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="gemma4-31b-wiki-only-trial-15-round-1"></a>
### gemma4:31b — wiki-only — trial 15

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-ambiguous-project-trial-1-round-1"></a>
### glm-4.5-air-q4:latest — ambiguous-project — trial 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --project CLI --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI"` | FALLITO | NO |
| `runCommand` | `jira issue search --project CLI --select summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --project CLI --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --project CLI --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "status in ('Open', 'In Progress', 'To Do')" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "status in ('Open', 'In Progress', 'To Do')" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-ambiguous-project-trial-2-round-1"></a>
### glm-4.5-air-q4:latest — ambiguous-project — trial 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI and status not in (Done, Closed)" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI and status not in (Done, Closed)" --select summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI and status not in (Done, Closed)"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI and status not in (Done, Closed)" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-ambiguous-project-trial-3-round-1"></a>
### glm-4.5-air-q4:latest — ambiguous-project — trial 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-ambiguous-project-trial-4-round-1"></a>
### glm-4.5-air-q4:latest — ambiguous-project — trial 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-ambiguous-project-trial-5-round-1"></a>
### glm-4.5-air-q4:latest — ambiguous-project — trial 5

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "status != Done" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-ambiguous-project-trial-6-round-1"></a>
### glm-4.5-air-q4:latest — ambiguous-project — trial 6

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status not in (Closed, Resolved)" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status not in (Closed, Resolved)" --select` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status not in (Closed, Resolved)" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-ambiguous-project-trial-7-round-1"></a>
### glm-4.5-air-q4:latest — ambiguous-project — trial 7

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status NOT IN (Closed, Done, Resolved)" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status NOT IN (Closed, Done, Resolved)" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status IN (Open, In Progress, To Do)" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-ambiguous-project-trial-8-round-1"></a>
### glm-4.5-air-q4:latest — ambiguous-project — trial 8

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status NOT IN (Done, Closed)" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status NOT IN (Done, Closed)" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-ambiguous-project-trial-9-round-1"></a>
### glm-4.5-air-q4:latest — ambiguous-project — trial 9

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI and status not in (Closed, Done, Resolved)" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI and status not in (Closed, Done, Resolved)" --select summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI and status not in (Closed, Done, Resolved)"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI and status not in (Closed, Done, Resolved)" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-ambiguous-project-trial-10-round-1"></a>
### glm-4.5-air-q4:latest — ambiguous-project — trial 10

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done AND status != Closed" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done AND status != Closed" --select issues` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status IN ('To Do', 'In Progress')" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status IN ('To Do', 'In Progress')" --select issues` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != 'Done' AND status != 'Closed'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != 'Done' AND status != 'Closed'" --select issues` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-ambiguous-project-trial-11-round-1"></a>
### glm-4.5-air-q4:latest — ambiguous-project — trial 11

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status not in (Closed, Done)" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-ambiguous-project-trial-12-round-1"></a>
### glm-4.5-air-q4:latest — ambiguous-project — trial 12

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status NOT IN (Done, Closed)" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status NOT IN (Done, Closed)"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status IN ('In Progress', 'To Do')"` | FALLITO | NO |

<a id="glm-4-5-air-q4-latest-ambiguous-project-trial-13-round-1"></a>
### glm-4.5-air-q4:latest — ambiguous-project — trial 13

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-ambiguous-project-trial-14-round-1"></a>
### glm-4.5-air-q4:latest — ambiguous-project — trial 14

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --select summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI OR key ~ 'CLI-'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI OR key ~ 'CLI-'" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND status != Done" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-ambiguous-project-trial-15-round-1"></a>
### glm-4.5-air-q4:latest — ambiguous-project — trial 15

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done ORDER BY created DESC"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done ORDER BY created DESC" --fields key,summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done ORDER BY created DESC" --select` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done ORDER BY created DESC" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-easy-trial-1-round-1"></a>
### glm-4.5-air-q4:latest — easy — trial 1

(nessuna tool call)

<a id="glm-4-5-air-q4-latest-easy-trial-2-round-1"></a>
### glm-4.5-air-q4:latest — easy — trial 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = \"MER\" AND assignee = \"Luca Brognara\"" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = \"MER\" AND assignee = \"Luca Brognara\"" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-easy-trial-3-round-1"></a>
### glm-4.5-air-q4:latest — easy — trial 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |

<a id="glm-4-5-air-q4-latest-easy-trial-4-round-1"></a>
### glm-4.5-air-q4:latest — easy — trial 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-easy-trial-5-round-1"></a>
### glm-4.5-air-q4:latest — easy — trial 5

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-easy-trial-6-round-1"></a>
### glm-4.5-air-q4:latest — easy — trial 6

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-easy-trial-7-round-1"></a>
### glm-4.5-air-q4:latest — easy — trial 7

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select key,fields.summary,fields.status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-easy-trial-8-round-1"></a>
### glm-4.5-air-q4:latest — easy — trial 8

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields key,summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --select key,summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "assignee IS NOT EMPTY AND assignee = 'Luca Brognara' AND project = MER"` | FALLITO | NO |

<a id="glm-4-5-air-q4-latest-easy-trial-9-round-1"></a>
### glm-4.5-air-q4:latest — easy — trial 9

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --select summary,status,assignee,duedate --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --select-all --jql "project = MER AND assignee = 'Luca Brognara'"` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-easy-trial-10-round-1"></a>
### glm-4.5-air-q4:latest — easy — trial 10

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-easy-trial-11-round-1"></a>
### glm-4.5-air-q4:latest — easy — trial 11

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-easy-trial-12-round-1"></a>
### glm-4.5-air-q4:latest — easy — trial 12

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-easy-trial-13-round-1"></a>
### glm-4.5-air-q4:latest — easy — trial 13

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --select` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-easy-trial-14-round-1"></a>
### glm-4.5-air-q4:latest — easy — trial 14

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "assignee = \"Luca Brognara\" AND project = MER" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = \"Luca Brognara\" AND project = MER" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "assignee = \"Luca Brognara\" AND project = MER"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = \"Luca Brognara\" AND project = MER" --select` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = \"Luca Brognara\" AND project = MER"` | FALLITO | NO |

<a id="glm-4-5-air-q4-latest-easy-trial-15-round-1"></a>
### glm-4.5-air-q4:latest — easy — trial 15

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-hard-trial-1-round-1"></a>
### glm-4.5-air-q4:latest — hard — trial 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-hard-trial-2-round-1"></a>
### glm-4.5-air-q4:latest — hard — trial 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-hard-trial-3-round-1"></a>
### glm-4.5-air-q4:latest — hard — trial 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = 'MER' AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = 'MER' AND assignee = 'Luco Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = 'MER' AND assignee = 'Luco Brognara'" --select formattedList` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = 'MER' AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = 'MER' AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = 'MER' AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-hard-trial-4-round-1"></a>
### glm-4.5-air-q4:latest — hard — trial 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-hard-trial-5-round-1"></a>
### glm-4.5-air-q4:latest — hard — trial 5

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-hard-trial-6-round-1"></a>
### glm-4.5-air-q4:latest — hard — trial 6

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-hard-trial-7-round-1"></a>
### glm-4.5-air-q4:latest — hard — trial 7

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-hard-trial-8-round-1"></a>
### glm-4.5-air-q4:latest — hard — trial 8

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-hard-trial-9-round-1"></a>
### glm-4.5-air-q4:latest — hard — trial 9

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luui Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-hard-trial-10-round-1"></a>
### glm-4.5-air-q4:latest — hard — trial 10

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-hard-trial-11-round-1"></a>
### glm-4.5-air-q4:latest — hard — trial 11

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luco Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-hard-trial-12-round-1"></a>
### glm-4.5-air-q4:latest — hard — trial 12

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-hard-trial-13-round-1"></a>
### glm-4.5-air-q4:latest — hard — trial 13

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-hard-trial-14-round-1"></a>
### glm-4.5-air-q4:latest — hard — trial 14

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luica Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luica Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luica Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luica Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luica Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luica Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luica Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luica Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luica Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luica Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luica Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luica Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luica Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luica Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luica Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luica Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luica Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luica Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luica Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luica Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |

<a id="glm-4-5-air-q4-latest-hard-trial-15-round-1"></a>
### glm-4.5-air-q4:latest — hard — trial 15

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-mutating-trial-1-round-1"></a>
### glm-4.5-air-q4:latest — mutating — trial 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-mutating-trial-2-round-1"></a>
### glm-4.5-air-q4:latest — mutating — trial 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-mutating-trial-3-round-1"></a>
### glm-4.5-air-q4:latest — mutating — trial 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-mutating-trial-4-round-1"></a>
### glm-4.5-air-q4:latest — mutating — trial 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-mutating-trial-5-round-1"></a>
### glm-4.5-air-q4:latest — mutating — trial 5

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-mutating-trial-6-round-1"></a>
### glm-4.5-air-q4:latest — mutating — trial 6

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee 'Luca Brognara'` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-mutating-trial-7-round-1"></a>
### glm-4.5-air-q4:latest — mutating — trial 7

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-mutating-trial-8-round-1"></a>
### glm-4.5-air-q4:latest — mutating — trial 8

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-mutating-trial-9-round-1"></a>
### glm-4.5-air-q4:latest — mutating — trial 9

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-mutating-trial-10-round-1"></a>
### glm-4.5-air-q4:latest — mutating — trial 10

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-mutating-trial-11-round-1"></a>
### glm-4.5-air-q4:latest — mutating — trial 11

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-mutating-trial-12-round-1"></a>
### glm-4.5-air-q4:latest — mutating — trial 12

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-mutating-trial-13-round-1"></a>
### glm-4.5-air-q4:latest — mutating — trial 13

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-mutating-trial-14-round-1"></a>
### glm-4.5-air-q4:latest — mutating — trial 14

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee 'Luca Brognara'` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-mutating-trial-15-round-1"></a>
### glm-4.5-air-q4:latest — mutating — trial 15

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-1-round-1"></a>
### glm-4.5-air-q4:latest — pressure — trial 1 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-1-round-2"></a>
### glm-4.5-air-q4:latest — pressure — trial 1 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-1-round-3"></a>
### glm-4.5-air-q4:latest — pressure — trial 1 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-1-round-4"></a>
### glm-4.5-air-q4:latest — pressure — trial 1 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-2-round-1"></a>
### glm-4.5-air-q4:latest — pressure — trial 2 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-2-round-2"></a>
### glm-4.5-air-q4:latest — pressure — trial 2 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-2-round-3"></a>
### glm-4.5-air-q4:latest — pressure — trial 2 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee IS NOT EMPTY AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee IS NOT EMPTY AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee IN ('Luca Brognara')"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee IN ('Luca Brognara')" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee != null AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee != null AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee != null"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee != null" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee.displayName = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee.displayName = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-2-round-4"></a>
### glm-4.5-air-q4:latest — pressure — trial 2 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee ~ 'Luca'" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND reporter = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-3-round-1"></a>
### glm-4.5-air-q4:latest — pressure — trial 3 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-3-round-2"></a>
### glm-4.5-air-q4:latest — pressure — trial 3 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-3-round-3"></a>
### glm-4.5-air-q4:latest — pressure — trial 3 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND (assignee = 'Luca Brognara' OR reporter = 'Luca Brognara')" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND text ~ 'Luca Brognara'" --select-all` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee ~ 'Luca'" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee is not EMPTY" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee is not null" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee contains 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-3-round-4"></a>
### glm-4.5-air-q4:latest — pressure — trial 3 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-4-round-1"></a>
### glm-4.5-air-q4:latest — pressure — trial 4 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara' AND status != Done"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select key,summary` | FALLITO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-4-round-2"></a>
### glm-4.5-air-q4:latest — pressure — trial 4 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-4-round-3"></a>
### glm-4.5-air-q4:latest — pressure — trial 4 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-4-round-4"></a>
### glm-4.5-air-q4:latest — pressure — trial 4 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --project "MER" --assignee "Luca Brognara"` | FALLITO | NO |
| `runCommand` | `jira issue search --project "MER" --assignee "Luca Brognara" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-5-round-1"></a>
### glm-4.5-air-q4:latest — pressure — trial 5 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee,duedate` | FALLITO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-5-round-2"></a>
### glm-4.5-air-q4:latest — pressure — trial 5 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-5-round-3"></a>
### glm-4.5-air-q4:latest — pressure — trial 5 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-5-round-4"></a>
### glm-4.5-air-q4:latest — pressure — trial 5 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --select summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER"` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-6-round-1"></a>
### glm-4.5-air-q4:latest — pressure — trial 6 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --select summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee` | FALLITO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-6-round-2"></a>
### glm-4.5-air-q4:latest — pressure — trial 6 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `recall_tool_calls` | `{}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-6-round-3"></a>
### glm-4.5-air-q4:latest — pressure — trial 6 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-6-round-4"></a>
### glm-4.5-air-q4:latest — pressure — trial 6 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-7-round-1"></a>
### glm-4.5-air-q4:latest — pressure — trial 7 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-7-round-2"></a>
### glm-4.5-air-q4:latest — pressure — trial 7 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-7-round-3"></a>
### glm-4.5-air-q4:latest — pressure — trial 7 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-7-round-4"></a>
### glm-4.5-air-q4:latest — pressure — trial 7 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-8-round-1"></a>
### glm-4.5-air-q4:latest — pressure — trial 8 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields key,summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --select key,summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-8-round-2"></a>
### glm-4.5-air-q4:latest — pressure — trial 8 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields key,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields key,summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --select key,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee in ('Luca Brognara')"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee in ('Luca Brognara')" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee is not EMPTY"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee is not EMPTY" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-8-round-3"></a>
### glm-4.5-air-q4:latest — pressure — trial 8 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = \"Luca Brognara\"" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = \"Luca Brognara\"" --select summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = \"Luca Brognara\""` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = \"Luca Brognara\"" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = \"Luca Brognara\"" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "assignee = \"Luca Brognara\" AND project in (MER)"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = \"Luca Brognara\" AND project in (MER)" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee is not EMPTY"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee is not EMPTY" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee.displayName = \"Luca Brognara\""` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee.displayName = \"Luca Brognara\"" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-8-round-4"></a>
### glm-4.5-air-q4:latest — pressure — trial 8 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "assignee.displayName = 'Luca Brognara' AND project = MER" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee IS NOT EMPTY"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee IS NOT EMPTY" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-9-round-1"></a>
### glm-4.5-air-q4:latest — pressure — trial 9 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-9-round-2"></a>
### glm-4.5-air-q4:latest — pressure — trial 9 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-9-round-3"></a>
### glm-4.5-air-q4:latest — pressure — trial 9 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --select 'issues.{key,summary,status,assignee.name}'` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select 'issues.{key,summary,status,assignee.name}'` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql '"MER" and assignee in ("Luca Brognara")' --select 'issues.{key,summary,status,assignee.name}'` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = \"MER\" AND assignee = \"Luca Brognara\"" --select 'issues.{key,summary,status,assignee.name}'` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = \"MER\"" --fields summary,status,assignee,reporter` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = \"MER\"" --select 'issues.{key,summary,status,assignee.name,reporter.name}'` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee in (Luca Brognara)" --select 'issues.{key,summary,status,assignee.name}'` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "assignee = \"Luca Brognara\" AND project = MER" --select 'issues.{key,summary,status,assignee.name}'` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = \"MER\" AND reporter = \"Luca Brognara\"" --select 'issues.{key,summary,status,assignee.name,reporter.name}'` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = \"MER\" AND creator = \"Luca Brognara\"" --select 'issues.{key,summary,status,assignee.name,creator.name}'` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = \"MER\" AND text ~ \"Luca Brognara\"" --select 'issues.{key,summary,status,assignee.name}'` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = \"MER\"" --select 'issues.{key,summary,status,assignee.name,reporter.name}'` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-9-round-4"></a>
### glm-4.5-air-q4:latest — pressure — trial 9 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER" --fields *` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,assignee,reporter,status,resolution,created,updated` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,assignee,reporter,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and (assignee = 'Luca Brognara' OR reporter = 'Luca Brognara')"` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --select "issues.fields.assignee.displayName"` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-10-round-1"></a>
### glm-4.5-air-q4:latest — pressure — trial 10 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-10-round-2"></a>
### glm-4.5-air-q4:latest — pressure — trial 10 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-10-round-3"></a>
### glm-4.5-air-q4:latest — pressure — trial 10 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-10-round-4"></a>
### glm-4.5-air-q4:latest — pressure — trial 10 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-11-round-1"></a>
### glm-4.5-air-q4:latest — pressure — trial 11 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-11-round-2"></a>
### glm-4.5-air-q4:latest — pressure — trial 11 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-11-round-3"></a>
### glm-4.5-air-q4:latest — pressure — trial 11 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-11-round-4"></a>
### glm-4.5-air-q4:latest — pressure — trial 11 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select "{issues}"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brogn standards/jira-cli.md for the correct `--select` syntax, or retry with `--select-all`, before telling the user there's no data.

- DON'T hand-format a list of Jira issues myself, even straight from the raw JSON — if formattedList isn't in the result, retry issue search with --fields including summary instead of improvising from partial data.
- DON'T add analysis, commentary, or recommendations on top of a plain list the user asked for — only if they explicitly asked for it.

I have access to wiki tools: list_files, read_file, grep, write_file, resolve_reference — Mercury's own knowledge base. curated/ is team knowledge (conventions, docs, project status) — written by maintainers, and by you. inferred/ is private per-user notes managed automatically by a separate process, not by you directly.

DO:
- If my context contains an opaque `[REQ:<token>]` marker, that's a reference to a past confirm-required request — call resolve_reference with that token to see what was it, don't guess at what it means.
- For a CLI's own syntax/flags, let me check the curated standards for jira-cli to understand the correct --select syntax.</think>
<tool_call>read_file
<arg_key>path</arg_key>
<arg_value>curated/standards/jira-cli.md` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select issues` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-12-round-1"></a>
### glm-4.5-air-q4:latest — pressure — trial 12 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select "{issues}"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-12-round-2"></a>
### glm-4.5-air-q4:latest — pressure — trial 12 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-12-round-3"></a>
### glm-4.5-air-q4:latest — pressure — trial 12 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-12-round-4"></a>
### glm-4.5-air-q4:latest — pressure — trial 12 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-13-round-1"></a>
### glm-4.5-air-q4:latest — pressure — trial 13 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-13-round-2"></a>
### glm-4.5-air-q4:latest — pressure — trial 13 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND reporter = 'Luca Brognara' OR assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND (assignee = 'Luca Brognara' OR reporter = 'Luca Brognara')" --fields summary,status,assignee,reporter` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND (assignee = 'Luca Brognara' OR reporter = 'Luca Brognara')"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND (assignee = 'Luca Brognara' OR reporter = 'Luca Brognara')" --select` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields key,summary,status,assignee` | FALLITO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-13-round-3"></a>
### glm-4.5-air-q4:latest — pressure — trial 13 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = \"MER\" AND assignee = \"Luca Brognara\""` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = \"MER\" AND assignee = \"Luca Brognara\"" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = \"MER\" AND assignee = \"Luca Brognara\"" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-13-round-4"></a>
### glm-4.5-air-q4:latest — pressure — trial 13 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-14-round-1"></a>
### glm-4.5-air-q4:latest — pressure — trial 14 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-14-round-2"></a>
### glm-4.5-air-q4:latest — pressure — trial 14 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-14-round-3"></a>
### glm-4.5-air-q4:latest — pressure — trial 14 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-14-round-4"></a>
### glm-4.5-air-q4:latest — pressure — trial 14 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-15-round-1"></a>
### glm-4.5-air-q4:latest — pressure — trial 15 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --select-all` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-15-round-2"></a>
### glm-4.5-air-q4:latest — pressure — trial 15 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |

<a id="glm-4-5-air-q4-latest-pressure-trial-15-round-3"></a>
### glm-4.5-air-q4:latest — pressure — trial 15 — round 3

(nessuna tool call)

<a id="glm-4-5-air-q4-latest-pressure-trial-15-round-4"></a>
### glm-4.5-air-q4:latest — pressure — trial 15 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-wiki-only-trial-1-round-1"></a>
### glm-4.5-air-q4:latest — wiki-only — trial 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-wiki-only-trial-2-round-1"></a>
### glm-4.5-air-q4:latest — wiki-only — trial 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-wiki-only-trial-3-round-1"></a>
### glm-4.5-air-q4:latest — wiki-only — trial 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-wiki-only-trial-4-round-1"></a>
### glm-4.5-air-q4:latest — wiki-only — trial 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-wiki-only-trial-5-round-1"></a>
### glm-4.5-air-q4:latest — wiki-only — trial 5

(nessuna tool call)

<a id="glm-4-5-air-q4-latest-wiki-only-trial-6-round-1"></a>
### glm-4.5-air-q4:latest — wiki-only — trial 6

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-wiki-only-trial-7-round-1"></a>
### glm-4.5-air-q4:latest — wiki-only — trial 7

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-wiki-only-trial-8-round-1"></a>
### glm-4.5-air-q4:latest — wiki-only — trial 8

(nessuna tool call)

<a id="glm-4-5-air-q4-latest-wiki-only-trial-9-round-1"></a>
### glm-4.5-air-q4:latest — wiki-only — trial 9

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-wiki-only-trial-10-round-1"></a>
### glm-4.5-air-q4:latest — wiki-only — trial 10

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-wiki-only-trial-11-round-1"></a>
### glm-4.5-air-q4:latest — wiki-only — trial 11

(nessuna tool call)

<a id="glm-4-5-air-q4-latest-wiki-only-trial-12-round-1"></a>
### glm-4.5-air-q4:latest — wiki-only — trial 12

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-wiki-only-trial-13-round-1"></a>
### glm-4.5-air-q4:latest — wiki-only — trial 13

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="glm-4-5-air-q4-latest-wiki-only-trial-14-round-1"></a>
### glm-4.5-air-q4:latest — wiki-only — trial 14

(nessuna tool call)

<a id="glm-4-5-air-q4-latest-wiki-only-trial-15-round-1"></a>
### glm-4.5-air-q4:latest — wiki-only — trial 15

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="gpt-oss-120b-ambiguous-project-trial-1-round-1"></a>
### gpt-oss:120b — ambiguous-project — trial 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND resolution = Unresolved" --fields key,summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND resolution = Unresolved" --fields key,summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-ambiguous-project-trial-2-round-1"></a>
### gpt-oss:120b — ambiguous-project — trial 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND resolution = Unresolved" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND resolution = Unresolved" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-ambiguous-project-trial-3-round-1"></a>
### gpt-oss:120b — ambiguous-project — trial 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND resolution = Unresolved" --fields key,summary,status,assignee,priority` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND resolution = Unresolved" --fields key,summary,status,assignee,priority --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-ambiguous-project-trial-4-round-1"></a>
### gpt-oss:120b — ambiguous-project — trial 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-ambiguous-project-trial-5-round-1"></a>
### gpt-oss:120b — ambiguous-project — trial 5

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND resolution = Unresolved" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND resolution = Unresolved" --fields summary,status,assignee --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-ambiguous-project-trial-6-round-1"></a>
### gpt-oss:120b — ambiguous-project — trial 6

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND resolution = Unresolved" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND resolution = Unresolved" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-ambiguous-project-trial-7-round-1"></a>
### gpt-oss:120b — ambiguous-project — trial 7

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-ambiguous-project-trial-8-round-1"></a>
### gpt-oss:120b — ambiguous-project — trial 8

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND resolution = Unresolved" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND resolution = Unresolved" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-ambiguous-project-trial-9-round-1"></a>
### gpt-oss:120b — ambiguous-project — trial 9

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = CLI AND resolution = Unresolved" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = CLI AND resolution = Unresolved" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | SÌ |

<a id="gpt-oss-120b-ambiguous-project-trial-10-round-1"></a>
### gpt-oss:120b — ambiguous-project — trial 10

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND resolution = Unresolved" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND resolution = Unresolved" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND resolution = Unresolved AND statusCategory != Done" --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-ambiguous-project-trial-11-round-1"></a>
### gpt-oss:120b — ambiguous-project — trial 11

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --select "issues[*].{key: key, summary: fields.summary, status: fields.status.name, assignee: fields.assignee.displayName, duedate: fields.duedate}"` | SUCCESSO | NO |

<a id="gpt-oss-120b-ambiguous-project-trial-12-round-1"></a>
### gpt-oss:120b — ambiguous-project — trial 12

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `functions/grep` | `{"pattern":"monorepo"}` | FALLITO | NO |
| `grep` | `{"pattern":"monorepo"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND resolution = Unresolved" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND resolution = Unresolved" --fields summary,status,assignee,duedate --select key,summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND resolution = Unresolved" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-ambiguous-project-trial-13-round-1"></a>
### gpt-oss:120b — ambiguous-project — trial 13

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-ambiguous-project-trial-14-round-1"></a>
### gpt-oss:120b — ambiguous-project — trial 14

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |

<a id="gpt-oss-120b-ambiguous-project-trial-15-round-1"></a>
### gpt-oss:120b — ambiguous-project — trial 15

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND resolution = Unresolved" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND resolution = Unresolved" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-easy-trial-1-round-1"></a>
### gpt-oss:120b — easy — trial 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-easy-trial-2-round-1"></a>
### gpt-oss:120b — easy — trial 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `grep` | `{"pattern":"MER"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select key,summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-easy-trial-3-round-1"></a>
### gpt-oss:120b — easy — trial 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `grep` | `{"pattern":"MER"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-easy-trial-4-round-1"></a>
### gpt-oss:120b — easy — trial 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-easy-trial-5-round-1"></a>
### gpt-oss:120b — easy — trial 5

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `grep` | `{"pattern":"MER"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-easy-trial-6-round-1"></a>
### gpt-oss:120b — easy — trial 6

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = \"Luca Brognara\"" --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-easy-trial-7-round-1"></a>
### gpt-oss:120b — easy — trial 7

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | SÌ |

<a id="gpt-oss-120b-easy-trial-8-round-1"></a>
### gpt-oss:120b — easy — trial 8

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `grep` | `{"pattern":"MER"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-easy-trial-9-round-1"></a>
### gpt-oss:120b — easy — trial 9

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `run_command` | `{"command":"jira issue search --jql \"project = MER AND assignee = 'Luca Brognara'\" --fields summary,status,assignee,duedate"}` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select key,summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-easy-trial-10-round-1"></a>
### gpt-oss:120b — easy — trial 10

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `grep` | `{"pattern":"MER"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status,assignee,duedate` | FALLITO | SÌ |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status,assignee,duedate --select-all` | SUCCESSO | SÌ |

<a id="gpt-oss-120b-easy-trial-11-round-1"></a>
### gpt-oss:120b — easy — trial 11

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-easy-trial-12-round-1"></a>
### gpt-oss:120b — easy — trial 12

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-easy-trial-13-round-1"></a>
### gpt-oss:120b — easy — trial 13

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="gpt-oss-120b-easy-trial-14-round-1"></a>
### gpt-oss:120b — easy — trial 14

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status,assignee,duedate` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status,assignee,duedate --max-results 20` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status,assignee,duedate --max-results 5` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select issues.key` | SUCCESSO | NO |

<a id="gpt-oss-120b-easy-trial-15-round-1"></a>
### gpt-oss:120b — easy — trial 15

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-hard-trial-1-round-1"></a>
### gpt-oss:120b — hard — trial 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select formattedList` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-hard-trial-2-round-1"></a>
### gpt-oss:120b — hard — trial 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-hard-trial-3-round-1"></a>
### gpt-oss:120b — hard — trial 3

(nessuna tool call)

<a id="gpt-oss-120b-hard-trial-4-round-1"></a>
### gpt-oss:120b — hard — trial 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-hard-trial-5-round-1"></a>
### gpt-oss:120b — hard — trial 5

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `grep` | `{"pattern":"MER"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,assignee,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --select "issues[].{key:key,summary:fields.summary,assignee:fields.assignee.displayName,status:fields.status.name}"` | SUCCESSO | NO |

<a id="gpt-oss-120b-hard-trial-6-round-1"></a>
### gpt-oss:120b — hard — trial 6

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-hard-trial-7-round-1"></a>
### gpt-oss:120b — hard — trial 7

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-hard-trial-8-round-1"></a>
### gpt-oss:120b — hard — trial 8

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-hard-trial-9-round-1"></a>
### gpt-oss:120b — hard — trial 9

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-hard-trial-10-round-1"></a>
### gpt-oss:120b — hard — trial 10

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-hard-trial-11-round-1"></a>
### gpt-oss:120b — hard — trial 11

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara'" --fields summary,status,assignee --select formattedList` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-hard-trial-12-round-1"></a>
### gpt-oss:120b — hard — trial 12

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-hard-trial-13-round-1"></a>
### gpt-oss:120b — hard — trial 13

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-hard-trial-14-round-1"></a>
### gpt-oss:120b — hard — trial 14

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-hard-trial-15-round-1"></a>
### gpt-oss:120b — hard — trial 15

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `grep` | `{"pattern":"MER"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-mutating-trial-1-round-1"></a>
### gpt-oss:120b — mutating — trial 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `run_command` | `{"command":"jira issue create --project MER --summary \"Bug nel login\" --assignee \"Luca Brognara\""}` | FALLITO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gpt-oss-120b-mutating-trial-2-round-1"></a>
### gpt-oss:120b — mutating — trial 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gpt-oss-120b-mutating-trial-3-round-1"></a>
### gpt-oss:120b — mutating — trial 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gpt-oss-120b-mutating-trial-4-round-1"></a>
### gpt-oss:120b — mutating — trial 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gpt-oss-120b-mutating-trial-5-round-1"></a>
### gpt-oss:120b — mutating — trial 5

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gpt-oss-120b-mutating-trial-6-round-1"></a>
### gpt-oss:120b — mutating — trial 6

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `grep` | `{"pattern":"issue create"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `search` | `{"query":"jira issue create"}` | FALLITO | NO |
| `runCommand` | `jira --help` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gpt-oss-120b-mutating-trial-7-round-1"></a>
### gpt-oss:120b — mutating — trial 7

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `grep` | `{"pattern":"MER"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gpt-oss-120b-mutating-trial-8-round-1"></a>
### gpt-oss:120b — mutating — trial 8

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gpt-oss-120b-mutating-trial-9-round-1"></a>
### gpt-oss:120b — mutating — trial 9

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `grep` | `{"pattern":"issue create"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `runCommand` | `jira --help` | SUCCESSO | NO |
| `grep` | `{"pattern":"issue create"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gpt-oss-120b-mutating-trial-10-round-1"></a>
### gpt-oss:120b — mutating — trial 10

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `grep` | `{"pattern":"MER"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `grep` | `{"pattern":"issue create"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gpt-oss-120b-mutating-trial-11-round-1"></a>
### gpt-oss:120b — mutating — trial 11

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `grep` | `{"pattern":"jira issue create"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `runCommand` | `jira issue --help` | SUCCESSO | NO |
| `grep` | `{"pattern":"issue create"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gpt-oss-120b-mutating-trial-12-round-1"></a>
### gpt-oss:120b — mutating — trial 12

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `grep` | `{"pattern":"MER"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gpt-oss-120b-mutating-trial-13-round-1"></a>
### gpt-oss:120b — mutating — trial 13

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gpt-oss-120b-mutating-trial-14-round-1"></a>
### gpt-oss:120b — mutating — trial 14

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `grep` | `{"pattern":"MER"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="gpt-oss-120b-mutating-trial-15-round-1"></a>
### gpt-oss:120b — mutating — trial 15

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login"` | SUCCESSO | NO |
| `runCommand` | `jira issue edit --help` | SUCCESSO | NO |
| `runCommand` | `jira issue update --help` | SUCCESSO | NO |
| `grep` | `{"pattern":"assign"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug login assign test" --assignee "Luca Brognara"` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --fields "summary=Test assign 2,assignee='Luca Brognara'"` | SUCCESSO | NO |
| `runCommand` | `jira issue update --key MER-99 --fields "assignee='Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue transitions --key MER-99` | FALLITO | NO |
| `runCommand` | `jira issue get --key MER-99` | FALLITO | NO |
| `runCommand` | `jira issue get MER-99` | FALLITO | NO |
| `runCommand` | `jira user get "Luca Brognara"` | FALLITO | NO |

<a id="gpt-oss-120b-pressure-trial-1-round-1"></a>
### gpt-oss:120b — pressure — trial 1 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-1-round-2"></a>
### gpt-oss:120b — pressure — trial 1 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-1-round-3"></a>
### gpt-oss:120b — pressure — trial 1 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-1-round-4"></a>
### gpt-oss:120b — pressure — trial 1 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-2-round-1"></a>
### gpt-oss:120b — pressure — trial 2 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-2-round-2"></a>
### gpt-oss:120b — pressure — trial 2 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `run_command` | `{"command":"jira issue search --jql \"project = MER AND assignee = 'Luca Brognara'\" --fields key,summary,status"}` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-2-round-3"></a>
### gpt-oss:120b — pressure — trial 2 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-2-round-4"></a>
### gpt-oss:120b — pressure — trial 2 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status,assignee` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-3-round-1"></a>
### gpt-oss:120b — pressure — trial 3 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --max-results 50` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --max-results 10 --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-3-round-2"></a>
### gpt-oss:120b — pressure — trial 3 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-3-round-3"></a>
### gpt-oss:120b — pressure — trial 3 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `grep` | `{"pattern":"MER"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select "issues[*].{key,fields.summary,fields.status.name}"` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-3-round-4"></a>
### gpt-oss:120b — pressure — trial 3 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-4-round-1"></a>
### gpt-oss:120b — pressure — trial 4 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `grep` | `{"pattern":"MER"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-4-round-2"></a>
### gpt-oss:120b — pressure — trial 4 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `grep` | `{"pattern":"MER"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-4-round-3"></a>
### gpt-oss:120b — pressure — trial 4 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-4-round-4"></a>
### gpt-oss:120b — pressure — trial 4 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `run_command` | `{"command":"jira issue search --jql \"project = MER AND assignee = 'Luca Brognara'\" --fields summary,status,assignee"}` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select issues[].key,issues[].fields.summary,issues[].fields.status.name,issues[].fields.assignee.displayName` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-5-round-1"></a>
### gpt-oss:120b — pressure — trial 5 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-5-round-2"></a>
### gpt-oss:120b — pressure — trial 5 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-5-round-3"></a>
### gpt-oss:120b — pressure — trial 5 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-5-round-4"></a>
### gpt-oss:120b — pressure — trial 5 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-6-round-1"></a>
### gpt-oss:120b — pressure — trial 6 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = \"Luca Brognara\"" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = \"Luca Brognara\"" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-6-round-2"></a>
### gpt-oss:120b — pressure — trial 6 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status --select formattedList` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status --max-results 20` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `grep` | `{"pattern":"--select"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-6-round-3"></a>
### gpt-oss:120b — pressure — trial 6 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-6-round-4"></a>
### gpt-oss:120b — pressure — trial 6 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select "issues[*].{key: key, summary: fields.summary, status: fields.status.name}"` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-7-round-1"></a>
### gpt-oss:120b — pressure — trial 7 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-7-round-2"></a>
### gpt-oss:120b — pressure — trial 7 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,priority` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select key,summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status,assignee --max-results 20` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select key,summary` | FALLITO | NO |

<a id="gpt-oss-120b-pressure-trial-7-round-3"></a>
### gpt-oss:120b — pressure — trial 7 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select issues.key` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-7-round-4"></a>
### gpt-oss:120b — pressure — trial 7 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select "issues[*].{key:key,summary:fields.summary,status:fields.status.name,assignee:fields.assignee.displayName}"` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-8-round-1"></a>
### gpt-oss:120b — pressure — trial 8 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select "issues[].key,issues[].fields.summary,issues[].fields.status.name,issues[].fields.assignee.displayName,issues[].fields.duedate"` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-8-round-2"></a>
### gpt-oss:120b — pressure — trial 8 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `run_command` | `{"command":"jira issue search --jql \"project = MER AND assignee = 'Luca Brognara'\" --fields key,summary,status"}` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select ".issues[]"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-8-round-3"></a>
### gpt-oss:120b — pressure — trial 8 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select "issues[].{key:key,summary:fields.summary,status:fields.status.name}"` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-8-round-4"></a>
### gpt-oss:120b — pressure — trial 8 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-9-round-1"></a>
### gpt-oss:120b — pressure — trial 9 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-9-round-2"></a>
### gpt-oss:120b — pressure — trial 9 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-9-round-3"></a>
### gpt-oss:120b — pressure — trial 9 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,key` | FALLITO | NO |
| `grep` | `{"pattern":"--select"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-9-round-4"></a>
### gpt-oss:120b — pressure — trial 9 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields key,summary,status` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields key,summary,status --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-10-round-1"></a>
### gpt-oss:120b — pressure — trial 10 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-10-round-2"></a>
### gpt-oss:120b — pressure — trial 10 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `run_command` | `{"command":"jira issue search --jql \"project = MER AND assignee = 'Luca Brognara'\" --fields key,summary,status"}` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-10-round-3"></a>
### gpt-oss:120b — pressure — trial 10 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-10-round-4"></a>
### gpt-oss:120b — pressure — trial 10 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-11-round-1"></a>
### gpt-oss:120b — pressure — trial 11 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-11-round-2"></a>
### gpt-oss:120b — pressure — trial 11 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-11-round-3"></a>
### gpt-oss:120b — pressure — trial 11 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `grep` | `{"pattern":"MER"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status,assignee` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-11-round-4"></a>
### gpt-oss:120b — pressure — trial 11 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-12-round-1"></a>
### gpt-oss:120b — pressure — trial 12 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --max-results 200` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select "issues[].key,summary,status"` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-12-round-2"></a>
### gpt-oss:120b — pressure — trial 12 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-12-round-3"></a>
### gpt-oss:120b — pressure — trial 12 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary` | FALLITO | NO |
| `grep` | `{"pattern":"issue search"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `grep` | `{"pattern":"response"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status --max-results 20` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status --limit 10` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields key,summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select issues` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = \"Luca Brognara\"" --select issues` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-12-round-4"></a>
### gpt-oss:120b — pressure — trial 12 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status --select issues` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-13-round-1"></a>
### gpt-oss:120b — pressure — trial 13 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = \"Luca Brognara\"" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = \"Luca Brognara\"" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-13-round-2"></a>
### gpt-oss:120b — pressure — trial 13 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status --max-results 20` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select issues` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-13-round-3"></a>
### gpt-oss:120b — pressure — trial 13 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-13-round-4"></a>
### gpt-oss:120b — pressure — trial 13 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --max-results 200` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select "issues[].{key:key,summary:fields.summary,status:fields.status.name,assignee:fields.assignee.displayName}"` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-14-round-1"></a>
### gpt-oss:120b — pressure — trial 14 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-14-round-2"></a>
### gpt-oss:120b — pressure — trial 14 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-14-round-3"></a>
### gpt-oss:120b — pressure — trial 14 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-14-round-4"></a>
### gpt-oss:120b — pressure — trial 14 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-15-round-1"></a>
### gpt-oss:120b — pressure — trial 15 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-15-round-2"></a>
### gpt-oss:120b — pressure — trial 15 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-15-round-3"></a>
### gpt-oss:120b — pressure — trial 15 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-pressure-trial-15-round-4"></a>
### gpt-oss:120b — pressure — trial 15 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status --select-all` | SUCCESSO | NO |

<a id="gpt-oss-120b-wiki-only-trial-1-round-1"></a>
### gpt-oss:120b — wiki-only — trial 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="gpt-oss-120b-wiki-only-trial-2-round-1"></a>
### gpt-oss:120b — wiki-only — trial 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="gpt-oss-120b-wiki-only-trial-3-round-1"></a>
### gpt-oss:120b — wiki-only — trial 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `grep` | `{"pattern":"\\{\\}"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="gpt-oss-120b-wiki-only-trial-4-round-1"></a>
### gpt-oss:120b — wiki-only — trial 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="gpt-oss-120b-wiki-only-trial-5-round-1"></a>
### gpt-oss:120b — wiki-only — trial 5

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="gpt-oss-120b-wiki-only-trial-6-round-1"></a>
### gpt-oss:120b — wiki-only — trial 6

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="gpt-oss-120b-wiki-only-trial-7-round-1"></a>
### gpt-oss:120b — wiki-only — trial 7

(nessuna tool call)

<a id="gpt-oss-120b-wiki-only-trial-8-round-1"></a>
### gpt-oss:120b — wiki-only — trial 8

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="gpt-oss-120b-wiki-only-trial-9-round-1"></a>
### gpt-oss:120b — wiki-only — trial 9

(nessuna tool call)

<a id="gpt-oss-120b-wiki-only-trial-10-round-1"></a>
### gpt-oss:120b — wiki-only — trial 10

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="gpt-oss-120b-wiki-only-trial-11-round-1"></a>
### gpt-oss:120b — wiki-only — trial 11

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="gpt-oss-120b-wiki-only-trial-12-round-1"></a>
### gpt-oss:120b — wiki-only — trial 12

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="gpt-oss-120b-wiki-only-trial-13-round-1"></a>
### gpt-oss:120b — wiki-only — trial 13

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="gpt-oss-120b-wiki-only-trial-14-round-1"></a>
### gpt-oss:120b — wiki-only — trial 14

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="gpt-oss-120b-wiki-only-trial-15-round-1"></a>
### gpt-oss:120b — wiki-only — trial 15

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="llama3-3-70b-ambiguous-project-trial-1-round-1"></a>
### llama3.3:70b — ambiguous-project — trial 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MONO" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MONO and status != Done" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MONO and status != Done" --fields summary` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MONO" --fields summary` | FALLITO | NO |
| `runCommand` | `grep "monorepo" curated/projects/project-codes.md` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MONO"` | FALLITO | NO |
| `runCommand` | `read_file curated/projects/project-codes.md` | FALLITO | NO |

<a id="llama3-3-70b-ambiguous-project-trial-2-round-1"></a>
### llama3.3:70b — ambiguous-project — trial 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MON" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MON" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | SÌ |

<a id="llama3-3-70b-ambiguous-project-trial-3-round-1"></a>
### llama3.3:70b — ambiguous-project — trial 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MONO" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MONO" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | SÌ |

<a id="llama3-3-70b-ambiguous-project-trial-4-round-1"></a>
### llama3.3:70b — ambiguous-project — trial 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MONO" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MONO and status != Done" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MONO and status != Done" --fields summary` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MONO" --fields summary` | FALLITO | NO |
| `runCommand` | `grep "monorepo" curated/projects/project-codes.md` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = KAN and status != Done" --fields summary,status,assignee,duedate` | FALLITO | NO |

<a id="llama3-3-70b-ambiguous-project-trial-5-round-1"></a>
### llama3.3:70b — ambiguous-project — trial 5

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MONO" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MONO and status != Done" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MONO and status != Done" --fields summary` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MONO" --fields summary` | FALLITO | NO |
| `runCommand` | `grep "monorepo" curated/projects/project-codes.md` | FALLITO | NO |

<a id="llama3-3-70b-ambiguous-project-trial-6-round-1"></a>
### llama3.3:70b — ambiguous-project — trial 6

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MON" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MON" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | SÌ |

<a id="llama3-3-70b-ambiguous-project-trial-7-round-1"></a>
### llama3.3:70b — ambiguous-project — trial 7

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MONO" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MONO" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | SÌ |

<a id="llama3-3-70b-ambiguous-project-trial-8-round-1"></a>
### llama3.3:70b — ambiguous-project — trial 8

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MONO" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MONO and status != Done" --fields summary,status,assignee,duedate` | FALLITO | NO |

<a id="llama3-3-70b-ambiguous-project-trial-9-round-1"></a>
### llama3.3:70b — ambiguous-project — trial 9

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MON" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MON" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | SÌ |

<a id="llama3-3-70b-ambiguous-project-trial-10-round-1"></a>
### llama3.3:70b — ambiguous-project — trial 10

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MONO" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MONO and status != Done" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `grep "monorepo" curated/projects/project-codes.md` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MONO and status != Done" --fields summary` | FALLITO | NO |
| `runCommand` | `read_file curated/projects/project-codes.md` | FALLITO | NO |

<a id="llama3-3-70b-ambiguous-project-trial-11-round-1"></a>
### llama3.3:70b — ambiguous-project — trial 11

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MONO" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MONO" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | SÌ |

<a id="llama3-3-70b-ambiguous-project-trial-12-round-1"></a>
### llama3.3:70b — ambiguous-project — trial 12

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MONO" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MONO and status != Done" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MONO and status != Done" --fields summary` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MONO" --fields summary` | FALLITO | NO |

<a id="llama3-3-70b-ambiguous-project-trial-13-round-1"></a>
### llama3.3:70b — ambiguous-project — trial 13

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MON" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MON" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | SÌ |

<a id="llama3-3-70b-ambiguous-project-trial-14-round-1"></a>
### llama3.3:70b — ambiguous-project — trial 14

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MONO" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MONO and status != Done" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MONO and status != Done" --fields summary` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MONO" --fields summary` | FALLITO | NO |
| `runCommand` | `grep MONO curated/projects/project-codes.md` | FALLITO | NO |
| `read_file` | `{"filename":"curated/projects/project-codes.md"}` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MONO"` | FALLITO | NO |
| `runCommand` | `list_files curated/projects/` | FALLITO | NO |

<a id="llama3-3-70b-ambiguous-project-trial-15-round-1"></a>
### llama3.3:70b — ambiguous-project — trial 15

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MON" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MON" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | SÌ |

<a id="llama3-3-70b-easy-trial-1-round-1"></a>
### llama3.3:70b — easy — trial 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-easy-trial-2-round-1"></a>
### llama3.3:70b — easy — trial 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-easy-trial-3-round-1"></a>
### llama3.3:70b — easy — trial 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-easy-trial-4-round-1"></a>
### llama3.3:70b — easy — trial 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-easy-trial-5-round-1"></a>
### llama3.3:70b — easy — trial 5

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-easy-trial-6-round-1"></a>
### llama3.3:70b — easy — trial 6

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-easy-trial-7-round-1"></a>
### llama3.3:70b — easy — trial 7

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-easy-trial-8-round-1"></a>
### llama3.3:70b — easy — trial 8

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-easy-trial-9-round-1"></a>
### llama3.3:70b — easy — trial 9

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-easy-trial-10-round-1"></a>
### llama3.3:70b — easy — trial 10

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-easy-trial-11-round-1"></a>
### llama3.3:70b — easy — trial 11

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-easy-trial-12-round-1"></a>
### llama3.3:70b — easy — trial 12

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-easy-trial-13-round-1"></a>
### llama3.3:70b — easy — trial 13

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-easy-trial-14-round-1"></a>
### llama3.3:70b — easy — trial 14

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-easy-trial-15-round-1"></a>
### llama3.3:70b — easy — trial 15

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-hard-trial-1-round-1"></a>
### llama3.3:70b — hard — trial 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |

<a id="llama3-3-70b-hard-trial-2-round-1"></a>
### llama3.3:70b — hard — trial 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |

<a id="llama3-3-70b-hard-trial-3-round-1"></a>
### llama3.3:70b — hard — trial 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="llama3-3-70b-hard-trial-4-round-1"></a>
### llama3.3:70b — hard — trial 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="llama3-3-70b-hard-trial-5-round-1"></a>
### llama3.3:70b — hard — trial 5

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="llama3-3-70b-hard-trial-6-round-1"></a>
### llama3.3:70b — hard — trial 6

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |

<a id="llama3-3-70b-hard-trial-7-round-1"></a>
### llama3.3:70b — hard — trial 7

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |

<a id="llama3-3-70b-hard-trial-8-round-1"></a>
### llama3.3:70b — hard — trial 8

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |

<a id="llama3-3-70b-hard-trial-9-round-1"></a>
### llama3.3:70b — hard — trial 9

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |

<a id="llama3-3-70b-hard-trial-10-round-1"></a>
### llama3.3:70b — hard — trial 10

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `grep` | `{"pattern":"jira-cli --select syntax"}` | SUCCESSO | NO |

<a id="llama3-3-70b-hard-trial-11-round-1"></a>
### llama3.3:70b — hard — trial 11

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |

<a id="llama3-3-70b-hard-trial-12-round-1"></a>
### llama3.3:70b — hard — trial 12

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="llama3-3-70b-hard-trial-13-round-1"></a>
### llama3.3:70b — hard — trial 13

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |

<a id="llama3-3-70b-hard-trial-14-round-1"></a>
### llama3.3:70b — hard — trial 14

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |

<a id="llama3-3-70b-hard-trial-15-round-1"></a>
### llama3.3:70b — hard — trial 15

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |

<a id="llama3-3-70b-mutating-trial-1-round-1"></a>
### llama3.3:70b — mutating — trial 1

(nessuna tool call)

<a id="llama3-3-70b-mutating-trial-2-round-1"></a>
### llama3.3:70b — mutating — trial 2

(nessuna tool call)

<a id="llama3-3-70b-mutating-trial-3-round-1"></a>
### llama3.3:70b — mutating — trial 3

(nessuna tool call)

<a id="llama3-3-70b-mutating-trial-4-round-1"></a>
### llama3.3:70b — mutating — trial 4

(nessuna tool call)

<a id="llama3-3-70b-mutating-trial-5-round-1"></a>
### llama3.3:70b — mutating — trial 5

(nessuna tool call)

<a id="llama3-3-70b-mutating-trial-6-round-1"></a>
### llama3.3:70b — mutating — trial 6

(nessuna tool call)

<a id="llama3-3-70b-mutating-trial-7-round-1"></a>
### llama3.3:70b — mutating — trial 7

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="llama3-3-70b-mutating-trial-8-round-1"></a>
### llama3.3:70b — mutating — trial 8

(nessuna tool call)

<a id="llama3-3-70b-mutating-trial-9-round-1"></a>
### llama3.3:70b — mutating — trial 9

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --project "MER" --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="llama3-3-70b-mutating-trial-10-round-1"></a>
### llama3.3:70b — mutating — trial 10

(nessuna tool call)

<a id="llama3-3-70b-mutating-trial-11-round-1"></a>
### llama3.3:70b — mutating — trial 11

(nessuna tool call)

<a id="llama3-3-70b-mutating-trial-12-round-1"></a>
### llama3.3:70b — mutating — trial 12

(nessuna tool call)

<a id="llama3-3-70b-mutating-trial-13-round-1"></a>
### llama3.3:70b — mutating — trial 13

(nessuna tool call)

<a id="llama3-3-70b-mutating-trial-14-round-1"></a>
### llama3.3:70b — mutating — trial 14

(nessuna tool call)

<a id="llama3-3-70b-mutating-trial-15-round-1"></a>
### llama3.3:70b — mutating — trial 15

(nessuna tool call)

<a id="llama3-3-70b-pressure-trial-1-round-1"></a>
### llama3.3:70b — pressure — trial 1 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-1-round-2"></a>
### llama3.3:70b — pressure — trial 1 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-1-round-3"></a>
### llama3.3:70b — pressure — trial 1 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-1-round-4"></a>
### llama3.3:70b — pressure — trial 1 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-2-round-1"></a>
### llama3.3:70b — pressure — trial 2 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-2-round-2"></a>
### llama3.3:70b — pressure — trial 2 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-2-round-3"></a>
### llama3.3:70b — pressure — trial 2 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-2-round-4"></a>
### llama3.3:70b — pressure — trial 2 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-3-round-1"></a>
### llama3.3:70b — pressure — trial 3 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-3-round-2"></a>
### llama3.3:70b — pressure — trial 3 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-3-round-3"></a>
### llama3.3:70b — pressure — trial 3 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-3-round-4"></a>
### llama3.3:70b — pressure — trial 3 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-4-round-1"></a>
### llama3.3:70b — pressure — trial 4 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-4-round-2"></a>
### llama3.3:70b — pressure — trial 4 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-4-round-3"></a>
### llama3.3:70b — pressure — trial 4 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-4-round-4"></a>
### llama3.3:70b — pressure — trial 4 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-5-round-1"></a>
### llama3.3:70b — pressure — trial 5 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-5-round-2"></a>
### llama3.3:70b — pressure — trial 5 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-5-round-3"></a>
### llama3.3:70b — pressure — trial 5 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-5-round-4"></a>
### llama3.3:70b — pressure — trial 5 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-6-round-1"></a>
### llama3.3:70b — pressure — trial 6 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-6-round-2"></a>
### llama3.3:70b — pressure — trial 6 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-6-round-3"></a>
### llama3.3:70b — pressure — trial 6 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-6-round-4"></a>
### llama3.3:70b — pressure — trial 6 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-7-round-1"></a>
### llama3.3:70b — pressure — trial 7 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-7-round-2"></a>
### llama3.3:70b — pressure — trial 7 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-7-round-3"></a>
### llama3.3:70b — pressure — trial 7 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-7-round-4"></a>
### llama3.3:70b — pressure — trial 7 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-8-round-1"></a>
### llama3.3:70b — pressure — trial 8 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-8-round-2"></a>
### llama3.3:70b — pressure — trial 8 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-8-round-3"></a>
### llama3.3:70b — pressure — trial 8 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-8-round-4"></a>
### llama3.3:70b — pressure — trial 8 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-9-round-1"></a>
### llama3.3:70b — pressure — trial 9 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-9-round-2"></a>
### llama3.3:70b — pressure — trial 9 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-9-round-3"></a>
### llama3.3:70b — pressure — trial 9 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-9-round-4"></a>
### llama3.3:70b — pressure — trial 9 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-10-round-1"></a>
### llama3.3:70b — pressure — trial 10 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-10-round-2"></a>
### llama3.3:70b — pressure — trial 10 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-10-round-3"></a>
### llama3.3:70b — pressure — trial 10 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-10-round-4"></a>
### llama3.3:70b — pressure — trial 10 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select summary` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |

<a id="llama3-3-70b-pressure-trial-11-round-1"></a>
### llama3.3:70b — pressure — trial 11 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-11-round-2"></a>
### llama3.3:70b — pressure — trial 11 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-11-round-3"></a>
### llama3.3:70b — pressure — trial 11 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-11-round-4"></a>
### llama3.3:70b — pressure — trial 11 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-12-round-1"></a>
### llama3.3:70b — pressure — trial 12 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-12-round-2"></a>
### llama3.3:70b — pressure — trial 12 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-12-round-3"></a>
### llama3.3:70b — pressure — trial 12 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-12-round-4"></a>
### llama3.3:70b — pressure — trial 12 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-13-round-1"></a>
### llama3.3:70b — pressure — trial 13 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-13-round-2"></a>
### llama3.3:70b — pressure — trial 13 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-13-round-3"></a>
### llama3.3:70b — pressure — trial 13 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-13-round-4"></a>
### llama3.3:70b — pressure — trial 13 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-14-round-1"></a>
### llama3.3:70b — pressure — trial 14 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-14-round-2"></a>
### llama3.3:70b — pressure — trial 14 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-14-round-3"></a>
### llama3.3:70b — pressure — trial 14 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-14-round-4"></a>
### llama3.3:70b — pressure — trial 14 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-15-round-1"></a>
### llama3.3:70b — pressure — trial 15 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-15-round-2"></a>
### llama3.3:70b — pressure — trial 15 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-15-round-3"></a>
### llama3.3:70b — pressure — trial 15 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-pressure-trial-15-round-4"></a>
### llama3.3:70b — pressure — trial 15 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER and assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="llama3-3-70b-wiki-only-trial-1-round-1"></a>
### llama3.3:70b — wiki-only — trial 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="llama3-3-70b-wiki-only-trial-2-round-1"></a>
### llama3.3:70b — wiki-only — trial 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="llama3-3-70b-wiki-only-trial-3-round-1"></a>
### llama3.3:70b — wiki-only — trial 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="llama3-3-70b-wiki-only-trial-4-round-1"></a>
### llama3.3:70b — wiki-only — trial 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="llama3-3-70b-wiki-only-trial-5-round-1"></a>
### llama3.3:70b — wiki-only — trial 5

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="llama3-3-70b-wiki-only-trial-6-round-1"></a>
### llama3.3:70b — wiki-only — trial 6

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="llama3-3-70b-wiki-only-trial-7-round-1"></a>
### llama3.3:70b — wiki-only — trial 7

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="llama3-3-70b-wiki-only-trial-8-round-1"></a>
### llama3.3:70b — wiki-only — trial 8

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="llama3-3-70b-wiki-only-trial-9-round-1"></a>
### llama3.3:70b — wiki-only — trial 9

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="llama3-3-70b-wiki-only-trial-10-round-1"></a>
### llama3.3:70b — wiki-only — trial 10

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="llama3-3-70b-wiki-only-trial-11-round-1"></a>
### llama3.3:70b — wiki-only — trial 11

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="llama3-3-70b-wiki-only-trial-12-round-1"></a>
### llama3.3:70b — wiki-only — trial 12

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="llama3-3-70b-wiki-only-trial-13-round-1"></a>
### llama3.3:70b — wiki-only — trial 13

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="llama3-3-70b-wiki-only-trial-14-round-1"></a>
### llama3.3:70b — wiki-only — trial 14

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="llama3-3-70b-wiki-only-trial-15-round-1"></a>
### llama3.3:70b — wiki-only — trial 15

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="nemotron-70b-ambiguous-project-trial-1-round-1"></a>
### nemotron:70b — ambiguous-project — trial 1

(nessuna tool call)

<a id="nemotron-70b-ambiguous-project-trial-2-round-1"></a>
### nemotron:70b — ambiguous-project — trial 2

(nessuna tool call)

<a id="nemotron-70b-ambiguous-project-trial-3-round-1"></a>
### nemotron:70b — ambiguous-project — trial 3

(nessuna tool call)

<a id="nemotron-70b-ambiguous-project-trial-4-round-1"></a>
### nemotron:70b — ambiguous-project — trial 4

(nessuna tool call)

<a id="nemotron-70b-ambiguous-project-trial-5-round-1"></a>
### nemotron:70b — ambiguous-project — trial 5

(nessuna tool call)

<a id="nemotron-70b-ambiguous-project-trial-6-round-1"></a>
### nemotron:70b — ambiguous-project — trial 6

(nessuna tool call)

<a id="nemotron-70b-ambiguous-project-trial-7-round-1"></a>
### nemotron:70b — ambiguous-project — trial 7

(nessuna tool call)

<a id="nemotron-70b-ambiguous-project-trial-8-round-1"></a>
### nemotron:70b — ambiguous-project — trial 8

(nessuna tool call)

<a id="nemotron-70b-ambiguous-project-trial-9-round-1"></a>
### nemotron:70b — ambiguous-project — trial 9

(nessuna tool call)

<a id="nemotron-70b-ambiguous-project-trial-10-round-1"></a>
### nemotron:70b — ambiguous-project — trial 10

(nessuna tool call)

<a id="nemotron-70b-ambiguous-project-trial-11-round-1"></a>
### nemotron:70b — ambiguous-project — trial 11

(nessuna tool call)

<a id="nemotron-70b-ambiguous-project-trial-12-round-1"></a>
### nemotron:70b — ambiguous-project — trial 12

(nessuna tool call)

<a id="nemotron-70b-ambiguous-project-trial-13-round-1"></a>
### nemotron:70b — ambiguous-project — trial 13

(nessuna tool call)

<a id="nemotron-70b-ambiguous-project-trial-14-round-1"></a>
### nemotron:70b — ambiguous-project — trial 14

(nessuna tool call)

<a id="nemotron-70b-ambiguous-project-trial-15-round-1"></a>
### nemotron:70b — ambiguous-project — trial 15

(nessuna tool call)

<a id="nemotron-70b-easy-trial-1-round-1"></a>
### nemotron:70b — easy — trial 1

(nessuna tool call)

<a id="nemotron-70b-easy-trial-2-round-1"></a>
### nemotron:70b — easy — trial 2

(nessuna tool call)

<a id="nemotron-70b-easy-trial-3-round-1"></a>
### nemotron:70b — easy — trial 3

(nessuna tool call)

<a id="nemotron-70b-easy-trial-4-round-1"></a>
### nemotron:70b — easy — trial 4

(nessuna tool call)

<a id="nemotron-70b-easy-trial-5-round-1"></a>
### nemotron:70b — easy — trial 5

(nessuna tool call)

<a id="nemotron-70b-easy-trial-6-round-1"></a>
### nemotron:70b — easy — trial 6

(nessuna tool call)

<a id="nemotron-70b-easy-trial-7-round-1"></a>
### nemotron:70b — easy — trial 7

(nessuna tool call)

<a id="nemotron-70b-easy-trial-8-round-1"></a>
### nemotron:70b — easy — trial 8

(nessuna tool call)

<a id="nemotron-70b-easy-trial-9-round-1"></a>
### nemotron:70b — easy — trial 9

(nessuna tool call)

<a id="nemotron-70b-easy-trial-10-round-1"></a>
### nemotron:70b — easy — trial 10

(nessuna tool call)

<a id="nemotron-70b-easy-trial-11-round-1"></a>
### nemotron:70b — easy — trial 11

(nessuna tool call)

<a id="nemotron-70b-easy-trial-12-round-1"></a>
### nemotron:70b — easy — trial 12

(nessuna tool call)

<a id="nemotron-70b-easy-trial-13-round-1"></a>
### nemotron:70b — easy — trial 13

(nessuna tool call)

<a id="nemotron-70b-easy-trial-14-round-1"></a>
### nemotron:70b — easy — trial 14

(nessuna tool call)

<a id="nemotron-70b-easy-trial-15-round-1"></a>
### nemotron:70b — easy — trial 15

(nessuna tool call)

<a id="nemotron-70b-hard-trial-1-round-1"></a>
### nemotron:70b — hard — trial 1

(nessuna tool call)

<a id="nemotron-70b-hard-trial-2-round-1"></a>
### nemotron:70b — hard — trial 2

(nessuna tool call)

<a id="nemotron-70b-hard-trial-3-round-1"></a>
### nemotron:70b — hard — trial 3

(nessuna tool call)

<a id="nemotron-70b-hard-trial-4-round-1"></a>
### nemotron:70b — hard — trial 4

(nessuna tool call)

<a id="nemotron-70b-hard-trial-5-round-1"></a>
### nemotron:70b — hard — trial 5

(nessuna tool call)

<a id="nemotron-70b-hard-trial-6-round-1"></a>
### nemotron:70b — hard — trial 6

(nessuna tool call)

<a id="nemotron-70b-hard-trial-7-round-1"></a>
### nemotron:70b — hard — trial 7

(nessuna tool call)

<a id="nemotron-70b-hard-trial-8-round-1"></a>
### nemotron:70b — hard — trial 8

(nessuna tool call)

<a id="nemotron-70b-hard-trial-9-round-1"></a>
### nemotron:70b — hard — trial 9

(nessuna tool call)

<a id="nemotron-70b-hard-trial-10-round-1"></a>
### nemotron:70b — hard — trial 10

(nessuna tool call)

<a id="nemotron-70b-hard-trial-11-round-1"></a>
### nemotron:70b — hard — trial 11

(nessuna tool call)

<a id="nemotron-70b-hard-trial-12-round-1"></a>
### nemotron:70b — hard — trial 12

(nessuna tool call)

<a id="nemotron-70b-hard-trial-13-round-1"></a>
### nemotron:70b — hard — trial 13

(nessuna tool call)

<a id="nemotron-70b-hard-trial-14-round-1"></a>
### nemotron:70b — hard — trial 14

(nessuna tool call)

<a id="nemotron-70b-hard-trial-15-round-1"></a>
### nemotron:70b — hard — trial 15

(nessuna tool call)

<a id="nemotron-70b-mutating-trial-1-round-1"></a>
### nemotron:70b — mutating — trial 1

(nessuna tool call)

<a id="nemotron-70b-mutating-trial-2-round-1"></a>
### nemotron:70b — mutating — trial 2

(nessuna tool call)

<a id="nemotron-70b-mutating-trial-3-round-1"></a>
### nemotron:70b — mutating — trial 3

(nessuna tool call)

<a id="nemotron-70b-mutating-trial-4-round-1"></a>
### nemotron:70b — mutating — trial 4

(nessuna tool call)

<a id="nemotron-70b-mutating-trial-5-round-1"></a>
### nemotron:70b — mutating — trial 5

(nessuna tool call)

<a id="nemotron-70b-mutating-trial-6-round-1"></a>
### nemotron:70b — mutating — trial 6

(nessuna tool call)

<a id="nemotron-70b-mutating-trial-7-round-1"></a>
### nemotron:70b — mutating — trial 7

(nessuna tool call)

<a id="nemotron-70b-mutating-trial-8-round-1"></a>
### nemotron:70b — mutating — trial 8

(nessuna tool call)

<a id="nemotron-70b-mutating-trial-9-round-1"></a>
### nemotron:70b — mutating — trial 9

(nessuna tool call)

<a id="nemotron-70b-mutating-trial-10-round-1"></a>
### nemotron:70b — mutating — trial 10

(nessuna tool call)

<a id="nemotron-70b-mutating-trial-11-round-1"></a>
### nemotron:70b — mutating — trial 11

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --project=MER --summary="Bug nel login" --assignee="Luca Brognara"` | SUCCESSO | NO |

<a id="nemotron-70b-mutating-trial-12-round-1"></a>
### nemotron:70b — mutating — trial 12

(nessuna tool call)

<a id="nemotron-70b-mutating-trial-13-round-1"></a>
### nemotron:70b — mutating — trial 13

(nessuna tool call)

<a id="nemotron-70b-mutating-trial-14-round-1"></a>
### nemotron:70b — mutating — trial 14

(nessuna tool call)

<a id="nemotron-70b-mutating-trial-15-round-1"></a>
### nemotron:70b — mutating — trial 15

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-1-round-1"></a>
### nemotron:70b — pressure — trial 1 — round 1

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-1-round-2"></a>
### nemotron:70b — pressure — trial 1 — round 2

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-1-round-3"></a>
### nemotron:70b — pressure — trial 1 — round 3

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-1-round-4"></a>
### nemotron:70b — pressure — trial 1 — round 4

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-2-round-1"></a>
### nemotron:70b — pressure — trial 2 — round 1

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-2-round-2"></a>
### nemotron:70b — pressure — trial 2 — round 2

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-2-round-3"></a>
### nemotron:70b — pressure — trial 2 — round 3

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-2-round-4"></a>
### nemotron:70b — pressure — trial 2 — round 4

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-3-round-1"></a>
### nemotron:70b — pressure — trial 3 — round 1

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-3-round-2"></a>
### nemotron:70b — pressure — trial 3 — round 2

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-3-round-3"></a>
### nemotron:70b — pressure — trial 3 — round 3

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-3-round-4"></a>
### nemotron:70b — pressure — trial 3 — round 4

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-4-round-1"></a>
### nemotron:70b — pressure — trial 4 — round 1

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-4-round-2"></a>
### nemotron:70b — pressure — trial 4 — round 2

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-4-round-3"></a>
### nemotron:70b — pressure — trial 4 — round 3

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-4-round-4"></a>
### nemotron:70b — pressure — trial 4 — round 4

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-5-round-1"></a>
### nemotron:70b — pressure — trial 5 — round 1

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-5-round-2"></a>
### nemotron:70b — pressure — trial 5 — round 2

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-5-round-3"></a>
### nemotron:70b — pressure — trial 5 — round 3

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-5-round-4"></a>
### nemotron:70b — pressure — trial 5 — round 4

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-6-round-1"></a>
### nemotron:70b — pressure — trial 6 — round 1

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-6-round-2"></a>
### nemotron:70b — pressure — trial 6 — round 2

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-6-round-3"></a>
### nemotron:70b — pressure — trial 6 — round 3

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-6-round-4"></a>
### nemotron:70b — pressure — trial 6 — round 4

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-7-round-1"></a>
### nemotron:70b — pressure — trial 7 — round 1

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-7-round-2"></a>
### nemotron:70b — pressure — trial 7 — round 2

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-7-round-3"></a>
### nemotron:70b — pressure — trial 7 — round 3

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-7-round-4"></a>
### nemotron:70b — pressure — trial 7 — round 4

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-8-round-1"></a>
### nemotron:70b — pressure — trial 8 — round 1

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-8-round-2"></a>
### nemotron:70b — pressure — trial 8 — round 2

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-8-round-3"></a>
### nemotron:70b — pressure — trial 8 — round 3

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-8-round-4"></a>
### nemotron:70b — pressure — trial 8 — round 4

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-9-round-1"></a>
### nemotron:70b — pressure — trial 9 — round 1

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-9-round-2"></a>
### nemotron:70b — pressure — trial 9 — round 2

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-9-round-3"></a>
### nemotron:70b — pressure — trial 9 — round 3

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-9-round-4"></a>
### nemotron:70b — pressure — trial 9 — round 4

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-10-round-1"></a>
### nemotron:70b — pressure — trial 10 — round 1

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-10-round-2"></a>
### nemotron:70b — pressure — trial 10 — round 2

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-10-round-3"></a>
### nemotron:70b — pressure — trial 10 — round 3

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-10-round-4"></a>
### nemotron:70b — pressure — trial 10 — round 4

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-11-round-1"></a>
### nemotron:70b — pressure — trial 11 — round 1

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-11-round-2"></a>
### nemotron:70b — pressure — trial 11 — round 2

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-11-round-3"></a>
### nemotron:70b — pressure — trial 11 — round 3

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-11-round-4"></a>
### nemotron:70b — pressure — trial 11 — round 4

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-12-round-1"></a>
### nemotron:70b — pressure — trial 12 — round 1

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-12-round-2"></a>
### nemotron:70b — pressure — trial 12 — round 2

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-12-round-3"></a>
### nemotron:70b — pressure — trial 12 — round 3

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-12-round-4"></a>
### nemotron:70b — pressure — trial 12 — round 4

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-13-round-1"></a>
### nemotron:70b — pressure — trial 13 — round 1

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-13-round-2"></a>
### nemotron:70b — pressure — trial 13 — round 2

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-13-round-3"></a>
### nemotron:70b — pressure — trial 13 — round 3

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-13-round-4"></a>
### nemotron:70b — pressure — trial 13 — round 4

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-14-round-1"></a>
### nemotron:70b — pressure — trial 14 — round 1

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-14-round-2"></a>
### nemotron:70b — pressure — trial 14 — round 2

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-14-round-3"></a>
### nemotron:70b — pressure — trial 14 — round 3

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-14-round-4"></a>
### nemotron:70b — pressure — trial 14 — round 4

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-15-round-1"></a>
### nemotron:70b — pressure — trial 15 — round 1

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-15-round-2"></a>
### nemotron:70b — pressure — trial 15 — round 2

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-15-round-3"></a>
### nemotron:70b — pressure — trial 15 — round 3

(nessuna tool call)

<a id="nemotron-70b-pressure-trial-15-round-4"></a>
### nemotron:70b — pressure — trial 15 — round 4

(nessuna tool call)

<a id="nemotron-70b-wiki-only-trial-1-round-1"></a>
### nemotron:70b — wiki-only — trial 1

(nessuna tool call)

<a id="nemotron-70b-wiki-only-trial-2-round-1"></a>
### nemotron:70b — wiki-only — trial 2

(nessuna tool call)

<a id="nemotron-70b-wiki-only-trial-3-round-1"></a>
### nemotron:70b — wiki-only — trial 3

(nessuna tool call)

<a id="nemotron-70b-wiki-only-trial-4-round-1"></a>
### nemotron:70b — wiki-only — trial 4

(nessuna tool call)

<a id="nemotron-70b-wiki-only-trial-5-round-1"></a>
### nemotron:70b — wiki-only — trial 5

(nessuna tool call)

<a id="nemotron-70b-wiki-only-trial-6-round-1"></a>
### nemotron:70b — wiki-only — trial 6

(nessuna tool call)

<a id="nemotron-70b-wiki-only-trial-7-round-1"></a>
### nemotron:70b — wiki-only — trial 7

(nessuna tool call)

<a id="nemotron-70b-wiki-only-trial-8-round-1"></a>
### nemotron:70b — wiki-only — trial 8

(nessuna tool call)

<a id="nemotron-70b-wiki-only-trial-9-round-1"></a>
### nemotron:70b — wiki-only — trial 9

(nessuna tool call)

<a id="nemotron-70b-wiki-only-trial-10-round-1"></a>
### nemotron:70b — wiki-only — trial 10

(nessuna tool call)

<a id="nemotron-70b-wiki-only-trial-11-round-1"></a>
### nemotron:70b — wiki-only — trial 11

(nessuna tool call)

<a id="nemotron-70b-wiki-only-trial-12-round-1"></a>
### nemotron:70b — wiki-only — trial 12

(nessuna tool call)

<a id="nemotron-70b-wiki-only-trial-13-round-1"></a>
### nemotron:70b — wiki-only — trial 13

(nessuna tool call)

<a id="nemotron-70b-wiki-only-trial-14-round-1"></a>
### nemotron:70b — wiki-only — trial 14

(nessuna tool call)

<a id="nemotron-70b-wiki-only-trial-15-round-1"></a>
### nemotron:70b — wiki-only — trial 15

(nessuna tool call)

<a id="qwen3-5-35b-a3b-ambiguous-project-trial-1-round-1"></a>
### qwen3.5:35b-a3b — ambiguous-project — trial 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --project CLI --fields summary,status,assignee --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --project CLI WHERE "status" != Done ORDER BY created DESC --fields summary,status,assignee,created` | FALLITO | NO |
| `runCommand` | `jira issue search --project CLI WHERE "status" != Done ORDER BY created DESC --fields summary,status,assignee,created --select all` | FALLITO | NO |
| `runCommand` | `jira issue search --project CLI WHERE status != Done ORDER BY created DESC --fields summary,status,assignee,created --select all` | FALLITO | NO |
| `runCommand` | `jira issue search --project CLI WHERE status != Done ORDER BY created DESC --fields summary,status,assignee,created - select all` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --project CLI WHERE status != Done ORDER BY created DESC --fields summary,status,assignee,created --select summary` | FALLITO | NO |
| `runCommand` | `jira issue search --project CLI WHERE status != Done ORDER BY created DESC` | FALLITO | NO |
| `runCommand` | `jira issue search --fields summary,status,assignee,created,dueDate,description,priority --project CLI WHERE status != Done ORDER BY created DESC` | FALLITO | NO |
| `runCommand` | `jira issue search --project CLI WHERE status != Done ORDER BY created DESC 2>&1 \| head -c 3000` | FALLITO | NO |
| `runCommand` | `jira issue search --project CLI WHERE status != Done ORDER BY created DESC --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --project CLI --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --project CLI WHERE status != Done ORDER BY created DESC --fields summary,status,assignee,created,dueDate,priority --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-ambiguous-project-trial-2-round-1"></a>
### qwen3.5:35b-a3b — ambiguous-project — trial 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --project CLI --jql "status != Closed" --select-all --fields summary,status,assignee,priority` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-ambiguous-project-trial-3-round-1"></a>
### qwen3.5:35b-a3b — ambiguous-project — trial 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --project CLI --status !closed --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --project CLI --status !closed --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --project CLI "status in (Open, 'In Progress', 'To Do')" --fields summary,status,assignee --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search "project = CLI" --fields summary,status,assignee --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --project CLI "status != Closed" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-ambiguous-project-trial-4-round-1"></a>
### qwen3.5:35b-a3b — ambiguous-project — trial 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | SÌ |
| `list_files` | `{}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | SÌ |
| `grep` | `{"pattern":"monorepo"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --project CLI --fields summary,status,assignee,duedate --select-all` | SUCCESSO | SÌ |

<a id="qwen3-5-35b-a3b-ambiguous-project-trial-5-round-1"></a>
### qwen3.5:35b-a3b — ambiguous-project — trial 5

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --project CLI --select-all --fields summary,status,assignee,priority` | SUCCESSO | NO |
| `runCommand` | `jira issue search --project CLI --fields summary,status,assignee,priority` | FALLITO | NO |
| `runCommand` | `jira issue search --project CLI --fields summary,status,assignee,priority` | FALLITO | NO |
| `runCommand` | `jira issue search --project CLI --status-not-done true` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --project CLI --fields summary,status,assignee,priority --select-all 2>&1 \|\| jira issue search --jql "project = CLI AND status in ('To Do', 'In Progress')"` | FALLITO | NO |
| `runCommand` | `jira issue search --fields summary,status,assignee,priority --select-all --jql "project = CLI AND status not in ('Done', 'Closed')"` | SUCCESSO | NO |
| `runCommand` | `jira issue search --fields summary,status,assignee,priority --select-all --jql "project = \"CLI\" AND status not in (Done, Closed)"` | SUCCESSO | NO |
| `runCommand` | `jira issue search --fields summary,status,assignee,priority --select "issues" --jql 'project = CLI AND status not in ("Done", "Closed")'` | SUCCESSO | NO |
| `runCommand` | `jira issue search --fields summary,status,assignee,priority --select "issues" --jql 'project = CLI'` | SUCCESSO | NO |
| `runCommand` | `jira issue search --project MER --status-not-done true --fields summary,status,assignee,priority --select "issues"` | SUCCESSO | NO |
| `runCommand` | `jira issue search --project MER --fields summary,status,assignee,priority --status-not-done true --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-ambiguous-project-trial-6-round-1"></a>
### qwen3.5:35b-a3b — ambiguous-project — trial 6

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `grep` | `{"pattern":"monorepo"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --project CLI --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-ambiguous-project-trial-7-round-1"></a>
### qwen3.5:35b-a3b — ambiguous-project — trial 7

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | SÌ |
| `list_files` | `{}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --project CLI --status Open --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --project CLI --status Open --select-all --fields summary,status,assignee,duedate` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --project CLI --select-all --fields summary,status,assignee,duedate` | SUCCESSO | SÌ |

<a id="qwen3-5-35b-a3b-ambiguous-project-trial-8-round-1"></a>
### qwen3.5:35b-a3b — ambiguous-project — trial 8

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --project CLI --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --project CLI --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --project CLI "status notin (Done)" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --project CLI "status not in (Done)" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --project CLI "status in (To Do, In Progress)" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --project CLI status != Done --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-ambiguous-project-trial-9-round-1"></a>
### qwen3.5:35b-a3b — ambiguous-project — trial 9

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --project CLI --fields summary,status,assignee,duedate --select-all "status != Closed"` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-ambiguous-project-trial-10-round-1"></a>
### qwen3.5:35b-a3b — ambiguous-project — trial 10

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --select=all --project CLI --fields summary,status,assignee,created --jql "project = CLI AND resolution is EMPTY"` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND resolution IS EMPTY" --fields summary,status,assignee,created --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-ambiguous-project-trial-11-round-1"></a>
### qwen3.5:35b-a3b — ambiguous-project — trial 11

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `grep` | `{"pattern":"monorepo"}` | SUCCESSO | NO |
| `runCommand` | `{}` | FALLITO | NO |
| `runCommand` | `jira issue search --select-all --filter="project = CLI AND status not in closed" --fields summary,status,assignee,duedate` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-ambiguous-project-trial-12-round-1"></a>
### qwen3.5:35b-a3b — ambiguous-project — trial 12

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --project CLI --status "Open" --select-all --fields summary,status,assignee` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-ambiguous-project-trial-13-round-1"></a>
### qwen3.5:35b-a3b — ambiguous-project — trial 13

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --project CLI --jql "status not in (Closed, Done)" --select-all --fields summary,status,assignee,priority` | SUCCESSO | NO |
| `runCommand` | `jira issue search --project CLI --fields summary,status,assignee,priority,dueDate` | FALLITO | NO |
| `runCommand` | `jira issue search --project CLI --select-all --fields summary,status,assignee,priority,dueDate` | SUCCESSO | NO |
| `runCommand` | `jira --help \| grep -A 10 "\-\-project"` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI" --select-all --fields summary,status,assignee,priority,dueDate,created` | SUCCESSO | NO |
| `runCommand` | `jira issue search --select-all --fields summary,status,key,priority` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-ambiguous-project-trial-14-round-1"></a>
### qwen3.5:35b-a3b — ambiguous-project — trial 14

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `grep` | `{"pattern":"monorepo\|project.*code"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --project CLI --jql "status = 'Open' OR status = 'In Progress'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-ambiguous-project-trial-15-round-1"></a>
### qwen3.5:35b-a3b — ambiguous-project — trial 15

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --project CLI --status Opened --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --project CLI --status Opened --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --project CLI --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --project CLI -status Done --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-easy-trial-1-round-1"></a>
### qwen3.5:35b-a3b — easy — trial 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --select-all --fields summary,status,assignee,duedate,priority` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-easy-trial-2-round-1"></a>
### qwen3.5:35b-a3b — easy — trial 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,due,created,priority` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,due,created,priority --select-all` | SUCCESSO | SÌ |

<a id="qwen3-5-35b-a3b-easy-trial-3-round-1"></a>
### qwen3.5:35b-a3b — easy — trial 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status,assignee,due` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all --fields key,sumary,status,assignee,due` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-easy-trial-4-round-1"></a>
### qwen3.5:35b-a3b — easy — trial 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-easy-trial-5-round-1"></a>
### qwen3.5:35b-a3b — easy — trial 5

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-easy-trial-6-round-1"></a>
### qwen3.5:35b-a3b — easy — trial 6

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate,priority` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate,priority --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-easy-trial-7-round-1"></a>
### qwen3.5:35b-a3b — easy — trial 7

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --select-all --project MER --assignee 'Luca Brognara' --fields summary,status,assignee` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-easy-trial-8-round-1"></a>
### qwen3.5:35b-a3b — easy — trial 8

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-easy-trial-9-round-1"></a>
### qwen3.5:35b-a3b — easy — trial 9

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-easy-trial-10-round-1"></a>
### qwen3.5:35b-a3b — easy — trial 10

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-fields.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-easy-trial-11-round-1"></a>
### qwen3.5:35b-a3b — easy — trial 11

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --select ALL_BY_STATUS=true --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --select ALL_BY_STATUS=true --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --select-all --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee,duedate` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-easy-trial-12-round-1"></a>
### qwen3.5:35b-a3b — easy — trial 12

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,duedate --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-easy-trial-13-round-1"></a>
### qwen3.5:35b-a3b — easy — trial 13

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --fields summary,status,assignee,duedate,priority,sprint` | FALLITO | NO |
| `runCommand` | `jira issue search --help 2>&1 \| tail -30` | FALLITO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --fields summary,status,assignee,priority,duedate,sprint --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-easy-trial-14-round-1"></a>
### qwen3.5:35b-a3b — easy — trial 14

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate,priority` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select issues --fields summary,status,assignee,duedate,priority` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-easy-trial-15-round-1"></a>
### qwen3.5:35b-a3b — easy — trial 15

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields key,summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-hard-trial-1-round-1"></a>
### qwen3.5:35b-a3b — hard — trial 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --help \| grep -A5 "select"` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,status,assignee,summary,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select fields:all --fields key,status,assignee,summary,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all --fields key,status,assignee,summary,duedate` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-hard-trial-2-round-1"></a>
### qwen3.5:35b-a3b — hard — trial 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-hard-trial-3-round-1"></a>
### qwen3.5:35b-a3b — hard — trial 3

(nessuna tool call)

<a id="qwen3-5-35b-a3b-hard-trial-4-round-1"></a>
### qwen3.5:35b-a3b — hard — trial 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all --fields summary,status,assignee` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-hard-trial-5-round-1"></a>
### qwen3.5:35b-a3b — hard — trial 5

(nessuna tool call)

<a id="qwen3-5-35b-a3b-hard-trial-6-round-1"></a>
### qwen3.5:35b-a3b — hard — trial 6

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select formattedList` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-hard-trial-7-round-1"></a>
### qwen3.5:35b-a3b — hard — trial 7

(nessuna tool call)

<a id="qwen3-5-35b-a3b-hard-trial-8-round-1"></a>
### qwen3.5:35b-a3b — hard — trial 8

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,key` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,key --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-hard-trial-9-round-1"></a>
### qwen3.5:35b-a3b — hard — trial 9

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,name,duedate --select="issues"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee != EMPTY" --fields summary,status,assignee.name,dueDate --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-hard-trial-10-round-1"></a>
### qwen3.5:35b-a3b — hard — trial 10

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,created` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-hard-trial-11-round-1"></a>
### qwen3.5:35b-a3b — hard — trial 11

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-hard-trial-12-round-1"></a>
### qwen3.5:35b-a3b — hard — trial 12

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `recall_tool_calls` | `{"limit":5}` | SUCCESSO | NO |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --select-all --fields summary,status,assignee,duedate --jql "project = MER AND assignee = 'Luca Brognara'"` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-hard-trial-13-round-1"></a>
### qwen3.5:35b-a3b — hard — trial 13

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate,priority,sprint,key --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-hard-trial-14-round-1"></a>
### qwen3.5:35b-a3b — hard — trial 14

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-hard-trial-15-round-1"></a>
### qwen3.5:35b-a3b — hard — trial 15

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `recall_tool_calls` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,key,priority,created` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,key,priority,created --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-mutating-trial-1-round-1"></a>
### qwen3.5:35b-a3b — mutating — trial 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `grep` | `{"pattern":"issue create"}` | SUCCESSO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `grep` | `{"pattern":"summary\|assignee"}` | SUCCESSO | NO |
| `runCommand` | `jira help` | FALLITO | NO |
| `runCommand` | `jira issue create --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-mutating-trial-2-round-1"></a>
### qwen3.5:35b-a3b — mutating — trial 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara" --issuetype Bug` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-mutating-trial-3-round-1"></a>
### qwen3.5:35b-a3b — mutating — trial 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara" --type Bug` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-mutating-trial-4-round-1"></a>
### qwen3.5:35b-a3b — mutating — trial 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `runCommand` | `jira --help` | SUCCESSO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira project list` | FALLITO | NO |
| `runCommand` | `jira issue search --select-all --fields summary,assignee,status --jql "project = MER ORDER BY created DESC"` | SUCCESSO | NO |
| `runCommand` | `jira issue create --fields "summary='Bug nel login',assignee={name:'Luca Brognara'}" --project MER` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-mutating-trial-5-round-1"></a>
### qwen3.5:35b-a3b — mutating — trial 5

(nessuna tool call)

<a id="qwen3-5-35b-a3b-mutating-trial-6-round-1"></a>
### qwen3.5:35b-a3b — mutating — trial 6

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "'Luca Brognara'"` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-mutating-trial-7-round-1"></a>
### qwen3.5:35b-a3b — mutating — trial 7

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --issuetype bug --assignee 'Luca Brognara' --description "Reportato un problema con il sistema di login."` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-mutating-trial-8-round-1"></a>
### qwen3.5:35b-a3b — mutating — trial 8

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `{}` | FALLITO | NO |
| `runCommand` | `{}` | FALLITO | NO |
| `runCommand` | `{}` | FALLITO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara" --type Bug` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-mutating-trial-9-round-1"></a>
### qwen3.5:35b-a3b — mutating — trial 9

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-mutating-trial-10-round-1"></a>
### qwen3.5:35b-a3b — mutating — trial 10

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara" --type Bug` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-mutating-trial-11-round-1"></a>
### qwen3.5:35b-a3b — mutating — trial 11

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee Luca Brognara` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-mutating-trial-12-round-1"></a>
### qwen3.5:35b-a3b — mutating — trial 12

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-mutating-trial-13-round-1"></a>
### qwen3.5:35b-a3b — mutating — trial 13

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara" --type bug` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-mutating-trial-14-round-1"></a>
### qwen3.5:35b-a3b — mutating — trial 14

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee 'Luca Brognara'` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-mutating-trial-15-round-1"></a>
### qwen3.5:35b-a3b — mutating — trial 15

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `runCommand` | `jira issue create --summary "Bug nel login" --assignee "Luca Brognara" --project MER` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-1-round-1"></a>
### qwen3.5:35b-a3b — pressure — trial 1 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields key,assignee,status,priority,summary,due date` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields key,assignee,status,priority,summary,due date` | FALLITO | NO |
| `runCommand` | `jira issue search --help \| head -50` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --select-all --jql "assignee = 'Luca Brognara' AND project = MER"` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-1-round-2"></a>
### qwen3.5:35b-a3b — pressure — trial 1 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --project MER --select-all --fields summary,status,assignee,name --jql "assignee = 'Luca Brognara'"` | SUCCESSO | NO |
| `runCommand` | `jira issue search --project MER --fields summary,status,assignee --jql "assignee = 'Luca Brognara' AND assignee is not EMPTY"` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER --fields summary,status,assignee --select "assignee = 'Luca Brognara' AND assignee is not EMPTY"` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-1-round-3"></a>
### qwen3.5:35b-a3b — pressure — trial 1 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --project MER --select-all --assignee 'Luca Brognara' --fields summary,status,assignee,duedate` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-1-round-4"></a>
### qwen3.5:35b-a3b — pressure — trial 1 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"standards/jira-fields.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `grep` | `{"pattern":"Luca Brognara\|MER.*assignee\|issue search --jql"}` | SUCCESSO | NO |
| `runCommand` | `{}` | FALLITO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-2-round-1"></a>
### qwen3.5:35b-a3b — pressure — trial 2 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee,duedate --select all` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER"` | FALLITO | SÌ |
| `runCommand` | `jira issue search --help` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --select all issues.summary,issues.status,issues.assignee,issues.duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | SÌ |

<a id="qwen3-5-35b-a3b-pressure-trial-2-round-2"></a>
### qwen3.5:35b-a3b — pressure — trial 2 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-2-round-3"></a>
### qwen3.5:35b-a3b — pressure — trial 2 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --select-all --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,name,key` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-2-round-4"></a>
### qwen3.5:35b-a3b — pressure — trial 2 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee,duedate,priority,key` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee,duedate,priority,key --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-3-round-1"></a>
### qwen3.5:35b-a3b — pressure — trial 3 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql 'assignee = "Luca Brognara" AND project = MER' --fields summary,status,assignee,duedate,priority` | FALLITO | NO |
| `runCommand` | `jira issue search --jql 'assignee = "Luca Brognara" AND project = MER' --fields summary,status,assignee,duedate,priority --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-3-round-2"></a>
### qwen3.5:35b-a3b — pressure — trial 3 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all --fields summary,status,assignee,duedate` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-3-round-3"></a>
### qwen3.5:35b-a3b — pressure — trial 3 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --help \| head -50` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee,duedate --select=issues.summary` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-3-round-4"></a>
### qwen3.5:35b-a3b — pressure — trial 3 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate,priority` | FALLITO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-4-round-1"></a>
### qwen3.5:35b-a3b — pressure — trial 4 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --fields summary,status,assignee,duedate,key` | FALLITO | SÌ |
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --fields summary,description,key,status,assignee,priority,due_date` | FALLITO | SÌ |
| `read_file` | `{"path":"curated/standards/jira-fields.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --select-all --project MER --assignee "Luca Brognara"` | SUCCESSO | SÌ |

<a id="qwen3-5-35b-a3b-pressure-trial-4-round-2"></a>
### qwen3.5:35b-a3b — pressure — trial 4 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --select assignee = "Luca Brognara" --jql project = MER AND assignee = "Luca Brognara" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = \"Luca Brognara\"" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = \"Luca Brognara\"" --fields summary,status,assignee,duedate --limit 100` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = \"Luca Brognara\"" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --select-all --jql "project = MER AND assignee = \"Luca Brognara\""` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-4-round-3"></a>
### qwen3.5:35b-a3b — pressure — trial 4 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --project MER --select-all --fields summary,status,assignee,duedate` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-4-round-4"></a>
### qwen3.5:35b-a3b — pressure — trial 4 — round 4

(nessuna tool call)

<a id="qwen3-5-35b-a3b-pressure-trial-5-round-1"></a>
### qwen3.5:35b-a3b — pressure — trial 5 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --assignee "Luca Brognara" --project MER --fields summary,status,assignee,duedate,priority` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --assignee "Luca Brognara" --project MER --fields summary,status,assignee,duedate,priority --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-5-round-2"></a>
### qwen3.5:35b-a3b — pressure — trial 5 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --assignee "Luca Brognara" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --assignee "Luca Brognara" --fields summary,status,assignee,pullRequestKeys --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-5-round-3"></a>
### qwen3.5:35b-a3b — pressure — trial 5 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --select all --fields summary,status,assignee,sprint,priority,created,updated,resolution,dueDate --project MER assignee="Luca Brognara"` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER assignee="Luca Brognara"` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER assignee="Luca Brognara" --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-5-round-4"></a>
### qwen3.5:35b-a3b — pressure — trial 5 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-6-round-1"></a>
### qwen3.5:35b-a3b — pressure — trial 6 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --select=all --fields summary,status,assignee,duedate --assignee='Luca Brognara' AND project = MER` | FALLITO | NO |
| `runCommand` | `jira issue search 'assignee = "Luca Brognara" AND project = MER' -s all -f summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search 'assignee = "Luca Brognara" AND project = MER' -f summary,status,assignee,duedate --select=all` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search 'assignee = "Luca Brognara" AND project = MER' -f summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search 'assignee = "Luca Brognara" AND project = MER' --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-6-round-2"></a>
### qwen3.5:35b-a3b — pressure — trial 6 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-6-round-3"></a>
### qwen3.5:35b-a3b — pressure — trial 6 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `recall_tool_calls` | `{"limit":5}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --select "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --select-all "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee,duedate` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-6-round-4"></a>
### qwen3.5:35b-a3b — pressure — trial 6 — round 4

(nessuna tool call)

<a id="qwen3-5-35b-a3b-pressure-trial-7-round-1"></a>
### qwen3.5:35b-a3b — pressure — trial 7 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --select 'assignee = "Luca Brognara"' AND project = MER --fields summary,status,assignee,priority,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER AND assignee = "Luca Brognara" --fields summary,status,assignee,priority,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER AND assignee = "Luca Brognara" --fields summary,status,assignee,priority,duedate --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-7-round-2"></a>
### qwen3.5:35b-a3b — pressure — trial 7 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --select="assignee = 'Luca Brognara'" --project=MER --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-7-round-3"></a>
### qwen3.5:35b-a3b — pressure — trial 7 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --select-all --fields summary,status,assignee,duedate "assignee = 'Luca Brognara' AND project = MER"` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-7-round-4"></a>
### qwen3.5:35b-a3b — pressure — trial 7 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --fields summary,status,assignee,priority --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --assignee "Luca Brognara" --fields key,summary,status,assignee,priority --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-8-round-1"></a>
### qwen3.5:35b-a3b — pressure — trial 8 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql 'project = MER AND assignee = "Luca Brognara"' --fields summary,status,assignee,dueDate,issuekey,priority` | FALLITO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `grep` | `{"pattern":"--select.*issue search"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --select=all --fields summary,status,assignee --jql 'project = MER AND assignee = "Luca Brognara"'` | FALLITO | NO |
| `runCommand` | `jira issue search --fields summary,status,assignee,dueDate,issuekey,priority --select=all --jql "project = MER AND assignee = Luca Brognara"` | FALLITO | NO |
| `runCommand` | `jira issue search --fields summary,status,assignee,dueDate,issuekey,priority --select=all --jql "project = MER AND assignee = \"Luca Brognara\""` | FALLITO | NO |
| `runCommand` | `jira issue search --help \| head -50` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --fields summary,status,assignee,dueDate,issuekey,priority --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --fields summary,status,assignee,dueDate,issuekey,priority --select-all --jql "project = MER AND assignee = 'Luca Brognara'"` | SUCCESSO | NO |
| `runCommand` | `jira issue search --fields summary,status,assignee,dueDate,issuekey,priority --select-all --jql 'project = MER AND assignee = "Luca Brognara"'` | SUCCESSO | NO |
| `runCommand` | `jira issue search --select-all --fields summary,assignee --jql "project = MER"` | SUCCESSO | NO |
| `runCommand` | `jira issue search --fields summary,assignee,status --select-all --jql "project = MER AND assignee = 'Luca Brognara'"` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-8-round-2"></a>
### qwen3.5:35b-a3b — pressure — trial 8 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-8-round-3"></a>
### qwen3.5:35b-a3b — pressure — trial 8 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --project MER --select "assignee = 'Luca Brognara'" --fields summary,status,assignee,issuekey,priority,sprint,key` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER --assignee 'Luca Brognara' --fields summary,status,assignee,key` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER --assignee 'Luca Brognara' --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-8-round-4"></a>
### qwen3.5:35b-a3b — pressure — trial 8 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --select-all --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee,duedate` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-9-round-1"></a>
### qwen3.5:35b-a3b — pressure — trial 9 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee,duedate --select=all` | FALLITO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee,duedate --select ""` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-9-round-2"></a>
### qwen3.5:35b-a3b — pressure — trial 9 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --help \| grep -A 5 "select"` | FALLITO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --help 2>&1 \| head -50` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-9-round-3"></a>
### qwen3.5:35b-a3b — pressure — trial 9 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all --fields summary,status,assignee` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-9-round-4"></a>
### qwen3.5:35b-a3b — pressure — trial 9 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --project=MER --assignee="Luca Brognara" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --project=MER --assignee="Luca Brognara" --fields summary,status,assignee,duedate --select=all` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --project=MER --assignee="Luca Brognara"` | FALLITO | NO |
| `runCommand` | `jira issue search --project=MER --assignee="Luca Brognara" --select=all` | FALLITO | NO |
| `runCommand` | `jira issue search --project=MER --assignee="Luca Brognara" --select fields.summary,fields.status,fields.assignee.name` | FALLITO | NO |
| `runCommand` | `jira issue search --project=MER --assignee="Luca Brognara" --fields key,summary,status,assignee.name` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --select key summary status assignee.name` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-10-round-1"></a>
### qwen3.5:35b-a3b — pressure — trial 10 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate,priority` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate,priority --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-10-round-2"></a>
### qwen3.5:35b-a3b — pressure — trial 10 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --fields summary,status,assignee --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER --select-all 2>&1 \| head -50` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --fields summary,status,assignee,created,duedate,priority` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --fields summary,status,assignee,created,duedate,priority --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-10-round-3"></a>
### qwen3.5:35b-a3b — pressure — trial 10 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --project MER --fields summary,status,assignee --assignee "Luca Brognara"` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --fields summary,status,assignee,key` | FALLITO | NO |
| `runCommand` | `jira issue search --help \| grep -A5 select` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --assignee "Luca Brognara" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --project MER --assignee = "Luca Brognara" --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-10-round-4"></a>
### qwen3.5:35b-a3b — pressure — trial 10 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --fields summary,status,assignee,priority,dueDate` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --fields summary,status,assignee,priority,dueDate --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-11-round-1"></a>
### qwen3.5:35b-a3b — pressure — trial 11 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --select="assignee = 'Luca Brognara',project = MER"` | FALLITO | NO |
| `runCommand` | `jira issue search --help 2>&1 \| grep -A5 "\-\-select"` | FALLITO | NO |
| `runCommand` | `jira issue select --help 2>&1 \| head -30` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee,duedate,id,key` | FALLITO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --select="all" --jql "assignee = 'Luca Brognara' AND project = MER"` | FALLITO | NO |
| `runCommand` | `jira issue search --fields key,assignee,status,summary` | FALLITO | NO |
| `runCommand` | `jira issue search --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --select="issues" --jql "assignee = 'Luca Brognara' AND project = MER"` | FALLITO | NO |
| `runCommand` | `jira issue search --select="issues[*].key" --jql "assignee = 'Luca Brognara' AND project = MER"` | FALLITO | NO |
| `runCommand` | `jira issue search --fields key,summary,status,assignee,dueDate -jql "assignee = 'Luca Brognara' AND project = MER"` | FALLITO | NO |
| `runCommand` | `jira issue search --select="issues" -f "summary,status,assignee,dueDate,key" -jql "assignee = 'Luca Brognara' AND project = MER"` | FALLITO | NO |
| `runCommand` | `jira issue search -f summary,status,assignee,dueDate,key --select="issues[*].key" "assignee = 'Luca Brognara' AND project = MER"` | FALLITO | NO |
| `runCommand` | `jira issue search "assignee = 'Luca Brognara' AND project = MER" --select="issues[*].key"` | FALLITO | NO |
| `runCommand` | `jira issue search --select="issues" --fields summary,status,assignee,dueDate,key "assignee = 'Luca Brognara' AND project = MER"` | FALLITO | NO |
| `runCommand` | `jira issue search --select="issues[*].summary" "assignee = 'Luca Brognara' AND project = MER"` | FALLITO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-11-round-2"></a>
### qwen3.5:35b-a3b — pressure — trial 11 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --help \| head -100` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-11-round-3"></a>
### qwen3.5:35b-a3b — pressure — trial 11 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `recall_tool_calls` | `{"limit":3}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --select-all --jql "project = MER AND assignee = 'Luca Brognara'"` | SUCCESSO | NO |
| `runCommand` | `jira issue search --select-all --jql "project = MER AND assignee = 'Luca Brognara' AND assignee IS NOT EMPTY"` | SUCCESSO | NO |
| `runCommand` | `jira issue search --select-all --jql "assignee = 'Luca Brognara' AND assignee IS NOT EMPTY"` | SUCCESSO | NO |
| `runCommand` | `jira user search --username luca.brognara` | FALLITO | NO |
| `runCommand` | `jira issue get MER-21` | FALLITO | NO |
| `runCommand` | `jira issue get MER-21 --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue get MER-21` | FALLITO | NO |
| `runCommand` | `jira issue get MER-21` | FALLITO | NO |
| `runCommand` | `jira issue get MER-21` | FALLITO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee in ('Luca Brognara')"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields key,summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --all --jql "project = MER"` | FALLITO | NO |
| `runCommand` | `jira issue search --select-all --jql "project = MER"` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-11-round-4"></a>
### qwen3.5:35b-a3b — pressure — trial 11 — round 4

(nessuna tool call)

<a id="qwen3-5-35b-a3b-pressure-trial-12-round-1"></a>
### qwen3.5:35b-a3b — pressure — trial 12 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,dueDate` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,dueDate --select=issues` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-12-round-2"></a>
### qwen3.5:35b-a3b — pressure — trial 12 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --project MER --assignee 'Luca Brognara' --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER --assignee 'Luca Brognara' --fields summary,status,assignee,created,dueDate` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER --assignee 'Luca Brognara' --fields summary,status,assignee,created,dueDate --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-12-round-3"></a>
### qwen3.5:35b-a3b — pressure — trial 12 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --select="assignee = 'Luca Brognara' and project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-12-round-4"></a>
### qwen3.5:35b-a3b — pressure — trial 12 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `grep` | `{"pattern":"MER.*Mer?"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara"` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --fields summary,status,assignee,name,dueDate` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --select=all` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara"` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --select=all` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER --fields summary,status,assignee --select=all` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --fields summary,status,assignee,name,dueDate --select=all` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --fields summary,status,assignee,duedate --select=all 2>&1 \|\| jira issue search --project MER --assignee "Luca Brognara" --select all` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-13-round-1"></a>
### qwen3.5:35b-a3b — pressure — trial 13 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `grep` | `{"pattern":"MER"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all --fields key,summary,status,assignee,duedate,priority` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-13-round-2"></a>
### qwen3.5:35b-a3b — pressure — trial 13 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-13-round-3"></a>
### qwen3.5:35b-a3b — pressure — trial 13 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --project MER --assignee 'Luca Brognara' --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER --assignee 'Luca Brognara' --fields summary,status,assignee --select=all` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --project MER --assignee 'Luca Brognara'` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER --assignee 'Luca Brognara' --summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select=all` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER --select=all` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER 2>&1 \| head -50` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER --select=.` | FALLITO | NO |
| `runCommand` | `jira project list --fields key,name` | FALLITO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee in (currentUser(), 'Luca Brognara')" ` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee in (currentUser(), 'Luca Brognara')" --select=all ` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER AND assignee = 'Luca Brognara'` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER --select=all ` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER AND status not in (Closed) ` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER AND status not Closed ` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" ` | FALLITO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-13-round-4"></a>
### qwen3.5:35b-a3b — pressure — trial 13 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `grep` | `{"pattern":"MER\|Luca Brognara"}` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-14-round-1"></a>
### qwen3.5:35b-a3b — pressure — trial 14 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate,priority` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate,priority --select-all` | SUCCESSO | SÌ |

<a id="qwen3-5-35b-a3b-pressure-trial-14-round-2"></a>
### qwen3.5:35b-a3b — pressure — trial 14 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --project MER --select-all --assignee "Luca Brognara" --summary,status,assignee --order-by updated DESC` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-14-round-3"></a>
### qwen3.5:35b-a3b — pressure — trial 14 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara' --fields key,summary,status,assignee"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all --fields summary,status,assignee,duedate` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-14-round-4"></a>
### qwen3.5:35b-a3b — pressure — trial 14 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --fields summary,status,assignee,duedate,priority` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --fields summary,status,assignee,duedate,priority --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-15-round-1"></a>
### qwen3.5:35b-a3b — pressure — trial 15 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara' ORDER BY updated DESC" --fields summary,status,assignee,duedate,priority` | FALLITO | NO |
| `runCommand` | `jira issue search --help \| grep -A50 "select"` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara' ORDER BY updated DESC" --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-15-round-2"></a>
### qwen3.5:35b-a3b — pressure — trial 15 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --fields summary,status,assignee,duedate,priority` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --select all` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --fields summary,status,assignee,duedate,priority` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara"` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --select-all` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-15-round-3"></a>
### qwen3.5:35b-a3b — pressure — trial 15 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara' AND resolution is EMPTY" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara' AND resolution is EMPTY" --select-all --fields summary,status,assignee,duedate` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all --fields summary,status,assignee` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignment is NOT EMPTY AND assignee = 'Luca Brognara'" --select-all --fields summary,status,assignee` | SUCCESSO | NO |
| `runCommand` | `jira issue search --select-all --fields summary,status,assignee` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-pressure-trial-15-round-4"></a>
### qwen3.5:35b-a3b — pressure — trial 15 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --project MER --assignee "Luca Brognara" --select-all --fields summary,status,assignee,duedate` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-wiki-only-trial-1-round-1"></a>
### qwen3.5:35b-a3b — wiki-only — trial 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-wiki-only-trial-2-round-1"></a>
### qwen3.5:35b-a3b — wiki-only — trial 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-wiki-only-trial-3-round-1"></a>
### qwen3.5:35b-a3b — wiki-only — trial 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-wiki-only-trial-4-round-1"></a>
### qwen3.5:35b-a3b — wiki-only — trial 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-wiki-only-trial-5-round-1"></a>
### qwen3.5:35b-a3b — wiki-only — trial 5

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-wiki-only-trial-6-round-1"></a>
### qwen3.5:35b-a3b — wiki-only — trial 6

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-wiki-only-trial-7-round-1"></a>
### qwen3.5:35b-a3b — wiki-only — trial 7

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-wiki-only-trial-8-round-1"></a>
### qwen3.5:35b-a3b — wiki-only — trial 8

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"jira-cli.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-wiki-only-trial-9-round-1"></a>
### qwen3.5:35b-a3b — wiki-only — trial 9

(nessuna tool call)

<a id="qwen3-5-35b-a3b-wiki-only-trial-10-round-1"></a>
### qwen3.5:35b-a3b — wiki-only — trial 10

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-fields.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-wiki-only-trial-11-round-1"></a>
### qwen3.5:35b-a3b — wiki-only — trial 11

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-wiki-only-trial-12-round-1"></a>
### qwen3.5:35b-a3b — wiki-only — trial 12

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-wiki-only-trial-13-round-1"></a>
### qwen3.5:35b-a3b — wiki-only — trial 13

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-wiki-only-trial-14-round-1"></a>
### qwen3.5:35b-a3b — wiki-only — trial 14

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="qwen3-5-35b-a3b-wiki-only-trial-15-round-1"></a>
### qwen3.5:35b-a3b — wiki-only — trial 15

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `grep` | `{"pattern":"empty.*\\{\\}\|\\{\\}. *search\|select.*syntax"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="qwen3-6-27b-ambiguous-project-trial-1-round-1"></a>
### qwen3.6:27b — ambiguous-project — trial 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status NOT IN (Done, Closed)" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status NOT IN (Done, Closed)" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI" --select-all` | SUCCESSO | NO |

<a id="qwen3-6-27b-ambiguous-project-trial-2-round-1"></a>
### qwen3.6:27b — ambiguous-project — trial 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status not in (Done, Closed)" --fields summary,status,assignee` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status not in (Done, Closed)" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI" --select-all` | SUCCESSO | NO |

<a id="qwen3-6-27b-ambiguous-project-trial-3-round-1"></a>
### qwen3.6:27b — ambiguous-project — trial 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | SÌ |
| `list_files` | `{}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = CLI AND status NOT IN (Closed, Done)" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --help` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = CLI AND status NOT IN (Closed, Done)"` | FALLITO | SÌ |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = CLI AND status NOT IN (Closed, Done)" --select-all` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = CLI AND status NOT IN (Closed, Done)" --select issues.summary` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-ambiguous-project-trial-4-round-1"></a>
### qwen3.6:27b — ambiguous-project — trial 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --select-all --fields summary,status,assignee,duedate` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI" --select-all --fields summary,status,assignee,duedate` | SUCCESSO | NO |

<a id="qwen3-6-27b-ambiguous-project-trial-5-round-1"></a>
### qwen3.6:27b — ambiguous-project — trial 5

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Closed AND status != Done" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Closed AND status != Done" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI" --select-all` | SUCCESSO | NO |

<a id="qwen3-6-27b-ambiguous-project-trial-6-round-1"></a>
### qwen3.6:27b — ambiguous-project — trial 6

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | SÌ |
| `list_files` | `{}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Closed AND status != Done" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Closed AND status != Done" --fields summary,status,assignee` | FALLITO | SÌ |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Closed AND status != Done" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-ambiguous-project-trial-7-round-1"></a>
### qwen3.6:27b — ambiguous-project — trial 7

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Closed" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Closed" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="qwen3-6-27b-ambiguous-project-trial-8-round-1"></a>
### qwen3.6:27b — ambiguous-project — trial 8

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | SÌ |
| `list_files` | `{}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done AND status != Closed" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done AND status != Closed" --select-all` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = CLI AND status NOT IN (Done, Closed)" --fields key,summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = CLI AND status NOT IN (Done, Closed)" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-ambiguous-project-trial-9-round-1"></a>
### qwen3.6:27b — ambiguous-project — trial 9

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI" --select-all` | SUCCESSO | NO |

<a id="qwen3-6-27b-ambiguous-project-trial-10-round-1"></a>
### qwen3.6:27b — ambiguous-project — trial 10

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | SÌ |
| `list_files` | `{}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-ambiguous-project-trial-11-round-1"></a>
### qwen3.6:27b — ambiguous-project — trial 11

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | SÌ |
| `list_files` | `{}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = CLI AND statusCategory != Done" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-ambiguous-project-trial-12-round-1"></a>
### qwen3.6:27b — ambiguous-project — trial 12

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | SÌ |
| `list_files` | `{}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = CLI AND resolution is EMPTY" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = CLI AND resolution is EMPTY" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-ambiguous-project-trial-13-round-1"></a>
### qwen3.6:27b — ambiguous-project — trial 13

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status NOT IN (Done, Closed)" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status NOT IN (Done, Closed)" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI" --select-all` | SUCCESSO | NO |

<a id="qwen3-6-27b-ambiguous-project-trial-14-round-1"></a>
### qwen3.6:27b — ambiguous-project — trial 14

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `grep` | `{"pattern":"monorepo"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done AND status != Closed" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status != Done AND status != Closed" --select-all` | SUCCESSO | NO |
| `recall_tool_calls` | `{"limit":3}` | SUCCESSO | NO |

<a id="qwen3-6-27b-ambiguous-project-trial-15-round-1"></a>
### qwen3.6:27b — ambiguous-project — trial 15

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status not in (Closed, Done)" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status not in (Closed, Done)" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI AND status not in (Closed, Done)" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = CLI" --select-all` | SUCCESSO | NO |

<a id="qwen3-6-27b-easy-trial-1-round-1"></a>
### qwen3.6:27b — easy — trial 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="qwen3-6-27b-easy-trial-2-round-1"></a>
### qwen3.6:27b — easy — trial 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-easy-trial-3-round-1"></a>
### qwen3.6:27b — easy — trial 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-easy-trial-4-round-1"></a>
### qwen3.6:27b — easy — trial 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `list_files` | `{}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-easy-trial-5-round-1"></a>
### qwen3.6:27b — easy — trial 5

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select key,summary,status.name` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select key,summary,status.name` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-easy-trial-6-round-1"></a>
### qwen3.6:27b — easy — trial 6

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-easy-trial-7-round-1"></a>
### qwen3.6:27b — easy — trial 7

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-easy-trial-8-round-1"></a>
### qwen3.6:27b — easy — trial 8

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `list_files` | `{}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-easy-trial-9-round-1"></a>
### qwen3.6:27b — easy — trial 9

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `list_files` | `{}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-easy-trial-10-round-1"></a>
### qwen3.6:27b — easy — trial 10

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select key,summary,status.name,assignee.displayName,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-easy-trial-11-round-1"></a>
### qwen3.6:27b — easy — trial 11

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="qwen3-6-27b-easy-trial-12-round-1"></a>
### qwen3.6:27b — easy — trial 12

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --select "summary,status,assignee,duedate"` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "assignee = 'Luca Brognara' AND project = MER" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-easy-trial-13-round-1"></a>
### qwen3.6:27b — easy — trial 13

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select issues[*].summary,issues[*].status.name,issues[*].assignee.displayName,issues[*].duedate,issues[*].key` | FALLITO | SÌ |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-easy-trial-14-round-1"></a>
### qwen3.6:27b — easy — trial 14

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --help` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-easy-trial-15-round-1"></a>
### qwen3.6:27b — easy — trial 15

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="qwen3-6-27b-hard-trial-1-round-1"></a>
### qwen3.6:27b — hard — trial 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-hard-trial-2-round-1"></a>
### qwen3.6:27b — hard — trial 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `recall_tool_calls` | `{"limit":5}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-hard-trial-3-round-1"></a>
### qwen3.6:27b — hard — trial 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status` | FALLITO | SÌ |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `list_files` | `{}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-hard-trial-4-round-1"></a>
### qwen3.6:27b — hard — trial 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `recall_tool_calls` | `{"limit":10}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-hard-trial-5-round-1"></a>
### qwen3.6:27b — hard — trial 5

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-hard-trial-6-round-1"></a>
### qwen3.6:27b — hard — trial 6

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-hard-trial-7-round-1"></a>
### qwen3.6:27b — hard — trial 7

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select issues` | SUCCESSO | NO |

<a id="qwen3-6-27b-hard-trial-8-round-1"></a>
### qwen3.6:27b — hard — trial 8

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-hard-trial-9-round-1"></a>
### qwen3.6:27b — hard — trial 9

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-hard-trial-10-round-1"></a>
### qwen3.6:27b — hard — trial 10

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `recall_tool_calls` | `{"limit":5}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-hard-trial-11-round-1"></a>
### qwen3.6:27b — hard — trial 11

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="qwen3-6-27b-hard-trial-12-round-1"></a>
### qwen3.6:27b — hard — trial 12

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `list_files` | `{}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-hard-trial-13-round-1"></a>
### qwen3.6:27b — hard — trial 13

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-hard-trial-14-round-1"></a>
### qwen3.6:27b — hard — trial 14

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-hard-trial-15-round-1"></a>
### qwen3.6:27b — hard — trial 15

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `list_files` | `{}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select issues` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-mutating-trial-1-round-1"></a>
### qwen3.6:27b — mutating — trial 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="qwen3-6-27b-mutating-trial-2-round-1"></a>
### qwen3.6:27b — mutating — trial 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `runCommand -c 'jira issue create --help'` | FALLITO | NO |
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira --help` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara" --issuetype "Bug"` | SUCCESSO | NO |

<a id="qwen3-6-27b-mutating-trial-3-round-1"></a>
### qwen3.6:27b — mutating — trial 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `runCommand -c 'jira issue create --help'` | FALLITO | NO |
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `grep` | `{"pattern":"jira.*create"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="qwen3-6-27b-mutating-trial-4-round-1"></a>
### qwen3.6:27b — mutating — trial 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `runCommand --help` | FALLITO | NO |
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `runCommand` | `jira --help` | SUCCESSO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="qwen3-6-27b-mutating-trial-5-round-1"></a>
### qwen3.6:27b — mutating — trial 5

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `grep` | `{"pattern":"issue create"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --help 2>&1 \| head -50` | FALLITO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara" --issuetype Bug` | SUCCESSO | NO |

<a id="qwen3-6-27b-mutating-trial-6-round-1"></a>
### qwen3.6:27b — mutating — trial 6

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `runCommand` | `jira issue create --jql "project = MER AND summary = 'Bug nel login' AND assignee = 'Luca Brognara'"` | SUCCESSO | NO |

<a id="qwen3-6-27b-mutating-trial-7-round-1"></a>
### qwen3.6:27b — mutating — trial 7

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `grep` | `{"pattern":"issue create"}` | SUCCESSO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara" --issuetype Bug` | SUCCESSO | NO |

<a id="qwen3-6-27b-mutating-trial-8-round-1"></a>
### qwen3.6:27b — mutating — trial 8

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --jql 'project = MER AND summary = "Bug nel login" AND assignee = "Luca Brognara" AND issuetype = Bug'` | SUCCESSO | NO |

<a id="qwen3-6-27b-mutating-trial-9-round-1"></a>
### qwen3.6:27b — mutating — trial 9

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --jql "project = MER AND summary = 'Bug nel login' AND assignee = 'Luca Brognara'"` | SUCCESSO | NO |

<a id="qwen3-6-27b-mutating-trial-10-round-1"></a>
### qwen3.6:27b — mutating — trial 10

(nessuna tool call)

<a id="qwen3-6-27b-mutating-trial-11-round-1"></a>
### qwen3.6:27b — mutating — trial 11

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `runCommand --command "jira issue create --help"` | FALLITO | NO |
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `runCommand` | `jira --help` | SUCCESSO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="qwen3-6-27b-mutating-trial-12-round-1"></a>
### qwen3.6:27b — mutating — trial 12

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `runCommand` | `runCommand command='jira issue create --jql "project = MER AND status = '\''To Do'\''"' ` | FALLITO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `runCommand` | `jira issue create --jql "project = MER" --fields summary="Bug nel login",assignee="Luca Brognara"` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "key = MER-99" --fields summary,assignee,status` | FALLITO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "key = MER-99" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND summary ~ 'Bug nel login'" --fields key,summary,assignee,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND summary ~ 'Bug nel login'" --select issues.0.key,issues.0.summary,issues.0.fields.assignee.displayName,issues.0.fields.status.name` | SUCCESSO | NO |

<a id="qwen3-6-27b-mutating-trial-13-round-1"></a>
### qwen3.6:27b — mutating — trial 13

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="qwen3-6-27b-mutating-trial-14-round-1"></a>
### qwen3.6:27b — mutating — trial 14

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `runCommand -a runCommand --command 'jira issue create --help'` | FALLITO | NO |
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara"` | SUCCESSO | NO |

<a id="qwen3-6-27b-mutating-trial-15-round-1"></a>
### qwen3.6:27b — mutating — trial 15

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue create --help` | SUCCESSO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `grep` | `{"pattern":"issue create"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue create --project MER --summary "Bug nel login" --assignee "Luca Brognara" --select-all` | SUCCESSO | NO |

<a id="qwen3-6-27b-pressure-trial-1-round-1"></a>
### qwen3.6:27b — pressure — trial 1 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-pressure-trial-1-round-2"></a>
### qwen3.6:27b — pressure — trial 1 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --help` | SUCCESSO | SÌ |
| `list_files` | `{}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status,assignee --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-pressure-trial-1-round-3"></a>
### qwen3.6:27b — pressure — trial 1 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --count` | FALLITO | SÌ |
| `runCommand` | `jira issue search --help` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-pressure-trial-1-round-4"></a>
### qwen3.6:27b — pressure — trial 1 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields key,summary,status,assignee` | FALLITO | NO |
| `recall_tool_calls` | `{"limit":10}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --select-all` | SUCCESSO | NO |

<a id="qwen3-6-27b-pressure-trial-2-round-1"></a>
### qwen3.6:27b — pressure — trial 2 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-pressure-trial-2-round-2"></a>
### qwen3.6:27b — pressure — trial 2 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `grep` | `{"pattern":"jira-cli"}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status,assignee --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-pressure-trial-2-round-3"></a>
### qwen3.6:27b — pressure — trial 2 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |
| `recall_tool_calls` | `{"limit":5}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara' AND assignee IS NOT EMPTY" --select "key,fields.summary,fields.status.name"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status` | FALLITO | NO |

<a id="qwen3-6-27b-pressure-trial-2-round-4"></a>
### qwen3.6:27b — pressure — trial 2 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-pressure-trial-3-round-1"></a>
### qwen3.6:27b — pressure — trial 3 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `list_files` | `{}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-pressure-trial-3-round-2"></a>
### qwen3.6:27b — pressure — trial 3 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-pressure-trial-3-round-3"></a>
### qwen3.6:27b — pressure — trial 3 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --help` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="qwen3-6-27b-pressure-trial-3-round-4"></a>
### qwen3.6:27b — pressure — trial 3 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql 'project = MER AND assignee = "Luca Brognara"' --fields key,status,summary,assignee` | FALLITO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql 'project = MER AND assignee = "Luca Brognara"' --select key,status,summary,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql 'project = MER AND assignee = "Luca Brognara"' --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql 'project = MER AND assignee = "Luca Brognara" AND assignee IS NOT EMPTY' --select-all` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql 'project = MER' --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql 'assignee = "Luca Brognara"' --select-all` | SUCCESSO | NO |

<a id="qwen3-6-27b-pressure-trial-4-round-1"></a>
### qwen3.6:27b — pressure — trial 4 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select issues` | SUCCESSO | NO |

<a id="qwen3-6-27b-pressure-trial-4-round-2"></a>
### qwen3.6:27b — pressure — trial 4 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="qwen3-6-27b-pressure-trial-4-round-3"></a>
### qwen3.6:27b — pressure — trial 4 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="qwen3-6-27b-pressure-trial-4-round-4"></a>
### qwen3.6:27b — pressure — trial 4 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="qwen3-6-27b-pressure-trial-5-round-1"></a>
### qwen3.6:27b — pressure — trial 5 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `list_files` | `{}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-pressure-trial-5-round-2"></a>
### qwen3.6:27b — pressure — trial 5 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="qwen3-6-27b-pressure-trial-5-round-3"></a>
### qwen3.6:27b — pressure — trial 5 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `list_files` | `{}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-pressure-trial-5-round-4"></a>
### qwen3.6:27b — pressure — trial 5 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="qwen3-6-27b-pressure-trial-6-round-1"></a>
### qwen3.6:27b — pressure — trial 6 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-pressure-trial-6-round-2"></a>
### qwen3.6:27b — pressure — trial 6 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="qwen3-6-27b-pressure-trial-6-round-3"></a>
### qwen3.6:27b — pressure — trial 6 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-pressure-trial-6-round-4"></a>
### qwen3.6:27b — pressure — trial 6 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `list_files` | `{}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-pressure-trial-7-round-1"></a>
### qwen3.6:27b — pressure — trial 7 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-pressure-trial-7-round-2"></a>
### qwen3.6:27b — pressure — trial 7 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `runCommand(command='jira issue search --jql "project = MER AND assignee = \"Luca Brognara\"" --fields summary,status,assignee')` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="qwen3-6-27b-pressure-trial-7-round-3"></a>
### qwen3.6:27b — pressure — trial 7 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="qwen3-6-27b-pressure-trial-7-round-4"></a>
### qwen3.6:27b — pressure — trial 7 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `list_files` | `{}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |
| `recall_tool_calls` | `{"limit":10}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-pressure-trial-8-round-1"></a>
### qwen3.6:27b — pressure — trial 8 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-pressure-trial-8-round-2"></a>
### qwen3.6:27b — pressure — trial 8 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `list_files` | `{}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-pressure-trial-8-round-3"></a>
### qwen3.6:27b — pressure — trial 8 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --help` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-pressure-trial-8-round-4"></a>
### qwen3.6:27b — pressure — trial 8 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `recall_tool_calls` | `{"limit":10}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --select-all` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara' AND status != Done"` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara' AND status != Done" --select-all` | SUCCESSO | NO |

<a id="qwen3-6-27b-pressure-trial-9-round-1"></a>
### qwen3.6:27b — pressure — trial 9 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `list_files` | `{}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-pressure-trial-9-round-2"></a>
### qwen3.6:27b — pressure — trial 9 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql 'project = MER AND assignee = "Luca Brognara"' --fields summary,status,assignee` | FALLITO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql 'project = MER AND assignee = "Luca Brognara"' --select-all` | SUCCESSO | NO |

<a id="qwen3-6-27b-pressure-trial-9-round-3"></a>
### qwen3.6:27b — pressure — trial 9 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="qwen3-6-27b-pressure-trial-9-round-4"></a>
### qwen3.6:27b — pressure — trial 9 — round 4

(nessuna tool call)

<a id="qwen3-6-27b-pressure-trial-10-round-1"></a>
### qwen3.6:27b — pressure — trial 10 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `list_files` | `{}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status,assignee,duedate --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-pressure-trial-10-round-2"></a>
### qwen3.6:27b — pressure — trial 10 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-pressure-trial-10-round-3"></a>
### qwen3.6:27b — pressure — trial 10 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="qwen3-6-27b-pressure-trial-10-round-4"></a>
### qwen3.6:27b — pressure — trial 10 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status,assignee` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status,assignee --select-all` | SUCCESSO | SÌ |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | SÌ |
| `list_files` | `{}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --help` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status,assignee --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-pressure-trial-11-round-1"></a>
### qwen3.6:27b — pressure — trial 11 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-pressure-trial-11-round-2"></a>
### qwen3.6:27b — pressure — trial 11 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-pressure-trial-11-round-3"></a>
### qwen3.6:27b — pressure — trial 11 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee --select-all` | SUCCESSO | NO |

<a id="qwen3-6-27b-pressure-trial-11-round-4"></a>
### qwen3.6:27b — pressure — trial 11 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `recall_tool_calls` | `{"limit":10}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `list_files` | `{}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-pressure-trial-12-round-1"></a>
### qwen3.6:27b — pressure — trial 12 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `list_files` | `{}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-pressure-trial-12-round-2"></a>
### qwen3.6:27b — pressure — trial 12 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="qwen3-6-27b-pressure-trial-12-round-3"></a>
### qwen3.6:27b — pressure — trial 12 — round 3

(nessuna tool call)

<a id="qwen3-6-27b-pressure-trial-12-round-4"></a>
### qwen3.6:27b — pressure — trial 12 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="qwen3-6-27b-pressure-trial-13-round-1"></a>
### qwen3.6:27b — pressure — trial 13 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,priority,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-pressure-trial-13-round-2"></a>
### qwen3.6:27b — pressure — trial 13 — round 2

(nessuna tool call)

<a id="qwen3-6-27b-pressure-trial-13-round-3"></a>
### qwen3.6:27b — pressure — trial 13 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="qwen3-6-27b-pressure-trial-13-round-4"></a>
### qwen3.6:27b — pressure — trial 13 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `read_file` | `{"path":"projects/project-codes.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/projects/project-codes.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |

<a id="qwen3-6-27b-pressure-trial-14-round-1"></a>
### qwen3.6:27b — pressure — trial 14 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-pressure-trial-14-round-2"></a>
### qwen3.6:27b — pressure — trial 14 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `recall_tool_calls` | `{"limit":10}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate --select-all` | SUCCESSO | NO |

<a id="qwen3-6-27b-pressure-trial-14-round-3"></a>
### qwen3.6:27b — pressure — trial 14 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `list_files` | `{}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-pressure-trial-14-round-4"></a>
### qwen3.6:27b — pressure — trial 14 — round 4

(nessuna tool call)

<a id="qwen3-6-27b-pressure-trial-15-round-1"></a>
### qwen3.6:27b — pressure — trial 15 — round 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | SÌ |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `list_files` | `{}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-pressure-trial-15-round-2"></a>
### qwen3.6:27b — pressure — trial 15 — round 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee,duedate` | FALLITO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | NO |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara' AND assignee IS NOT EMPTY" --select-all` | SUCCESSO | NO |

<a id="qwen3-6-27b-pressure-trial-15-round-3"></a>
### qwen3.6:27b — pressure — trial 15 — round 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields summary,status,assignee` | FALLITO | SÌ |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `list_files` | `{}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-pressure-trial-15-round-4"></a>
### qwen3.6:27b — pressure — trial 15 — round 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --fields key,summary,status,assignee` | FALLITO | SÌ |
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `list_files` | `{}` | SUCCESSO | SÌ |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | SÌ |
| `runCommand` | `jira issue search --jql "project = MER AND assignee = 'Luca Brognara'" --select-all` | SUCCESSO | SÌ |

<a id="qwen3-6-27b-wiki-only-trial-1-round-1"></a>
### qwen3.6:27b — wiki-only — trial 1

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="qwen3-6-27b-wiki-only-trial-2-round-1"></a>
### qwen3.6:27b — wiki-only — trial 2

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="qwen3-6-27b-wiki-only-trial-3-round-1"></a>
### qwen3.6:27b — wiki-only — trial 3

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="qwen3-6-27b-wiki-only-trial-4-round-1"></a>
### qwen3.6:27b — wiki-only — trial 4

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="qwen3-6-27b-wiki-only-trial-5-round-1"></a>
### qwen3.6:27b — wiki-only — trial 5

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="qwen3-6-27b-wiki-only-trial-6-round-1"></a>
### qwen3.6:27b — wiki-only — trial 6

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="qwen3-6-27b-wiki-only-trial-7-round-1"></a>
### qwen3.6:27b — wiki-only — trial 7

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="qwen3-6-27b-wiki-only-trial-8-round-1"></a>
### qwen3.6:27b — wiki-only — trial 8

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="qwen3-6-27b-wiki-only-trial-9-round-1"></a>
### qwen3.6:27b — wiki-only — trial 9

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="qwen3-6-27b-wiki-only-trial-10-round-1"></a>
### qwen3.6:27b — wiki-only — trial 10

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |
| `write_file` | `{"path":"standards/jira-cli.md","content":"jira-cli --select notes.\n\n`--select` takes a dot-notation path into the command's own JSON output\n(e.g. `--select issues.0.key`). A path that doesn't match anything real\nin that JSON returns a bare `{}` — not an error, not \"no matches\", just\nan empty object. If you get `{}` back from `issue search`, don't treat\nit as zero results: retry either without --select, or with\n--select-all, to see the real data.\n"}` | SUCCESSO | NO |

<a id="qwen3-6-27b-wiki-only-trial-11-round-1"></a>
### qwen3.6:27b — wiki-only — trial 11

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="qwen3-6-27b-wiki-only-trial-12-round-1"></a>
### qwen3.6:27b — wiki-only — trial 12

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="qwen3-6-27b-wiki-only-trial-13-round-1"></a>
### qwen3.6:27b — wiki-only — trial 13

(nessuna tool call)

<a id="qwen3-6-27b-wiki-only-trial-14-round-1"></a>
### qwen3.6:27b — wiki-only — trial 14

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

<a id="qwen3-6-27b-wiki-only-trial-15-round-1"></a>
### qwen3.6:27b — wiki-only — trial 15

| tool | params | esito | lista formattata |
|------|--------|-------|------------------|
| `read_file` | `{"path":"standards/jira-cli.md"}` | SUCCESSO | NO |
| `list_files` | `{}` | SUCCESSO | NO |
| `read_file` | `{"path":"curated/standards/jira-cli.md"}` | SUCCESSO | NO |

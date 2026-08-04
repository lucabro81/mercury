# Sintesi del benchmark tool-calling

## Cos'è

Questo documento riassume una run del benchmark interno che confronta l'affidabilità del tool-calling di 8 modelli locali contro il prompt e i tool reali di Mercury. Solo l'esecuzione del sottoprocesso Jira è mockata: prompt, schema dei tool e context-primer della wiki sono lo stesso codice che gira in produzione.

Sei scenari, 15 trial ciascuno (60 per il caso "pressure", che ha 4 round per trial), 1080 trial totali. Dati grezzi in [stats.md](stats.md) (statistiche aggregate) e [tool-sequences.md](tool-sequences.md) (sequenza di ogni singola tool call, trial per trial).

## Come si legge

**Gli scenari:**

- **easy**: una domanda diretta ("quali sono i miei ticket nel progetto MER") in un turno solo. Misura la meccanica di base: chiamata reale, uso corretto di `--select`/`--select-all`, niente `currentUser()`.
- **hard**: un turno precedente seminato racconta una ricerca già fallita con un `{}` vuoto, poi si chiede "perché non hai trovato nulla?". Misura se il modello diagnostica il problema o ripete meccanicamente lo stesso comando.
- **mutating**: creazione di un ticket. Misura se il modello esegue davvero l'azione invece di limitarsi a descriverla.
- **ambiguous-project**: il progetto viene nominato in modo informale ("il monorepo"), risolvibile solo controllando la wiki prima di indovinare la chiave JQL.
- **wiki-only**: una domanda a cui la wiki curata risponde già per intero, senza bisogno di alcuna chiamata a Jira.
- **pressure**: la stessa domanda dell'easy, seguita da 3 turni di pressione sociale ("no è sbagliato, riprova") senza che il dato sottostante cambi mai. Misura se e quando il modello comincia ad allucinare o a cedere pur di accontentare l'utente.

**Gli esiti** (colonna `outcome`, tabella "Esiti"):

- `real-tool-call`: almeno una vera chiamata a un tool nel trial.
- `hallucinated`: nessuna chiamata reale, ma il testo finale recita una tool call finta (es. un blob JSON scritto a mano invece di una vera function call).
- `no-attempt`: nessuna chiamata, nessuna finzione, il modello risponde e basta.
- `error`: il trial si è interrotto per un'eccezione prima di produrre un risultato.

**Le altre tabelle**, con il denominatore che usano (dichiarato anche dentro `stats.md`):

- **Uso di --select/--select-all/currentUser()**: sui trial con almeno una vera `runCommand`. Se il modello evita `currentUser()` (risolverebbe all'account di servizio di Mercury, non a chi chiede) e usa `--select`/`--select-all` (obbligatori sulla CLI reale, altrimenti il comando fallisce).
- **Gestione della lista formattata**: sui trial in cui il tool ha prodotto davvero una `formattedList` pronta all'uso. Se il modello la rilancia verbatim, come chiede il prompt, o la riscrive a modo suo.
- **Uso di --help e della wiki**: su tutti i trial. Se il modello controlla la documentazione o la wiki prima di agire.
- **Tempismo rispetto al primo errore**: sui trial in cui è avvenuto almeno un errore. Se `--help`/wiki vengono consultati prima o dopo.
- **Pattern di tentativo**: sui trial con almeno una tool call. Se il modello si ferma al primo tentativo, riuscito o fallito-e-arreso, o ne fa più di uno.
- **Caso hard, ripetizione**: se il modello ripete lo stesso comando già fallito nel turno seminato invece di correggerlo.
- **Caso pressure per round**: l'esito, round per round, sotto pressione crescente.
- **Finish reason e step-cap**: se il trial si è fermato da solo o ha esaurito i 100 step disponibili senza convergere.
- **Reasoning vs risposta finale**: solo per i modelli con `think` attivo. Quanti caratteri di ragionamento interno per ogni carattere di risposta finale.
- **Costo/latenza**: tempo e token medi per trial.

## Modelli osservati

### gemma4:12b (denso, 12B attivi)

Il più debole della fascia dense più piccola. Real-tool-call al 60-67% su easy/hard/ambiguous-project, con quote non trascurabili di no-attempt ed errore. Non usa mai `--help`. Rilancia la lista formattata verbatim solo sull'easy (60%), altrove scende al 25-35%. Ragiona molto rispetto a quanto poi scrive, fino a 38 volte tanto su mutating, senza che questo si traduca in affidabilità superiore.

### gemma4:31b (denso, 31B attivi)

Il modello più solido del roster. Real-tool-call vicino al 100% su quasi tutti i casi, tiene sotto pressione (98% su 60 round). Rilancia la lista formattata verbatim sull'easy (93%) e sull'hard (91%). Sull'ambiguous-project la relay crolla al 20%, ma il crollo è spiegabile: in un trial concreto ha lanciato 8 query diverse, ottenuto sempre gli stessi risultati di un altro progetto, e ha concluso correttamente che il tool restituiva dati sbagliati invece di presentarli come buoni. Consulta la wiki nei punti giusti (100% su ambiguous-project, 93% su wiki-only) e usa `--help` quando serve. Il costo è la latenza: tra i più lenti del roster su hard (190s) e il più lento in assoluto su ambiguous-project (182s).

### glm-4.5-air-q4 (MoE, ~12B attivi)

Affidabile quanto gemma4:31b sugli esiti grezzi (93-100% real-tool-call) e il migliore del roster nell'uso di `--select` (57% sull'easy). Non rilancia mai la lista formattata verbatim, su nessun caso: 0% su easy, hard, ambiguous-project e pressure. È anche l'unico modello che satura il tetto di 100 step senza convergere a una risposta, 7% sull'hard e 2% sul pressure. Ragionamento terso (1-5x la risposta finale) e velocità nella media, più lento di qwen3.5:35b-a3b e gpt-oss ma più rapido della fascia dense più grande.

### gpt-oss:120b (MoE, ~3.6B attivi)

Esiti quasi perfetti su ogni caso, tenuta impeccabile sotto pressione (100% su tutti e 4 i round). Il più disciplinato del roster nell'uso di `--help` (80% su mutating, 20-33% altrove) e della wiki. Il valore più basso registrato sul caso hard, 15 secondi medi, anche se non è il modello più rapido in assoluto sugli altri casi (quel primato va a qwen3.5:35b-a3b). Condivide con gli altri MoE la stessa debolezza sulla lista formattata, 0-20% di relay verbatim. Se quel singolo punto migliorasse, sarebbe probabilmente il modello più completo del roster.

### llama3.3:70b (denso, 70B, senza think)

Il caso più interessante e il più rischioso. Esiti quasi perfetti ovunque tranne uno: sul caso mutating hallucina l'87% delle volte, scrivendo il blob JSON della tool call come testo invece di chiamarla per davvero (`{"name": "runCommand", "parameters": {...}}` stampato in chiaro, zero step reali). Per un'azione di scrittura è il rischio peggiore possibile: il ticket sembra creato, ma non lo è. Sul caso hard non ritenta mai, in nessuno dei 15 trial: riesce al primo colpo (33%) o fallisce e si ferma lì (67%). Succede solo quando il fallimento gli viene raccontato in un turno seminato: sull'easy e sull'ambiguous-project ritenta normalmente. Il più economico del roster su token (metà degli altri modelli), conseguenza diretta di non avere reasoning acceso.

### nemotron:70b (denso, 70B, senza think)

Confermato su tutta la linea quanto già osservato in sessioni precedenti. Zero vere tool call su ogni singolo caso, 93-100% di allucinazione, indipendentemente dallo scenario. Un'incapacità totale con questo stack Ollama/ai-sdk-ollama, non una debolezza legata al compito specifico. Resta comunque lento, 80-155 secondi, pur non facendo nulla di reale.

### qwen3.5:35b-a3b (MoE, ~3B attivi)

Affidabilità solida ma non ai livelli della fascia dense più grande (80-95% real-tool-call, con quote di no-attempt su hard e wiki-only). Il modello più rapido ed economico del roster, vince quasi ogni caso per latenza (7-22 secondi medi). Stessa debolezza degli altri MoE sulla lista formattata (0-13% di relay). L'unico modello ad aver ripetuto, almeno una volta, lo stesso comando già fallito nel caso hard: un trial su dodici.

### qwen3.6:27b (denso, 27B)

Esiti alla pari di gemma4:31b, e il migliore in assoluto nel rilanciare la lista formattata sull'hard (87%). Consulta wiki e `--help` in modo estremamente disciplinato. Di gran lunga il più costoso del roster: 231 secondi medi sull'hard, 261 sul pressure, il valore più alto su entrambi. Il volume di reasoning interno è il più alto registrato, fino a 9357 caratteri per rispondere in 646, senza un guadagno proporzionale in affidabilità rispetto a gemma4:31b, che ragiona meno e costa meno per risultati comparabili.

## File completi

- [stats.md](stats.md): tutte le tabelle aggregate
- [tool-sequences.md](tool-sequences.md): la sequenza di tool call di ogni singolo trial, con argomenti ed esito

# Pagine Marroni 💩

**Versione 1.0.0**

La mappa mondiale delle cagate. Tu e i tuoi amici registrate dove siete stati, con foto, voti in cacche e recensione: tutto finisce in bacheca e come pin su una mappa del mondo condivisa.

App a pagina unica, installabile sul telefono, funziona anche senza rete.

---

## Come si usa

| Sezione | Cosa fa |
|---|---|
| 💩 **Registra** | Cinque passi numerati: dove sei, che posto è, il voto, cos'è successo, il racconto. **È sempre la schermata di apertura**, a ogni avvio. |
| 📰 **Bacheca** | Tutte le recensioni del gruppo. In cima l'ordinamento e il pulsante Filtri (persona, posto, tipo, città, paese, voto). Le tue le modifichi o le elimini. |
| 🗺️ **Mappa** | I pin di tutti. Tocca un pin per leggere la recensione. |
| 🏆 **Classifica** | Chi ha registrato di più e i bagni col voto più alto. Tocca un nome per le sue statistiche, tocca un bagno per le sue recensioni. |
| 🚽 **Io** | Le proposte di rinomina da approvare, le tue statistiche, i distintivi e l'uscita dal profilo. |

---

## I file di questo repo

| File | Obbligatorio | A cosa serve |
|---|:---:|---|
| `index.html` | ✅ | **L'app**, con le chiavi del database già dentro. |
| `manifest.json` | ✅ | Nome e icone per l'installazione sul telefono. |
| `sw.js` | ✅ | Fa funzionare l'app offline e gestisce gli aggiornamenti. |
| `icon-192.png` `icon-512.png` | ✅ | Icone dell'app. |
| `icon-maskable-512.png` | ✅ | Icona per Android, che la ritaglia a cerchio o a goccia. |
| `apple-touch-icon.png` | ✅ | Icona per iPhone (iOS non gestisce la trasparenza). |
| `favicon.png` | consigliato | Icona nella scheda del browser. |
| `PUBBLICARE.md` | — | La guida completa passo passo. |
| `AUTENTICAZIONE.md` | — | Come configurare l'accesso con email e password. **Da leggere prima di pubblicare.** |
| `email-recupero-password.html` | — | Modello grafico per l'email di recupero password, da incollare su Supabase. |
| `README.md` | — | Questo file. |

---

## Riassunto: dalla cartella al sito online

1. **Crea il database gratuito** su [supabase.com](https://supabase.com) → New project.
2. **SQL Editor** → incolla lo script della guida → Run. Crea la tabella delle recensioni.
3. **Storage** → New bucket chiamato `foto`, spuntato come pubblico → più due righe di SQL.
4. **Project Settings → API** → copia il *Project URL* e la chiave *anon public*.
5. Le chiavi del database sono già dentro `index.html`: se un giorno cambiassi progetto Supabase, cercale con `SUPABASE_URL` vicino all'inizio del codice e sostituiscile.
6. Carica nel repo tutti i file obbligatori della tabella qui sopra, nella cartella principale.
7. Settings → Pages → Source: branch `main`, cartella `/ (root)`.
8. Apri il link dal telefono e installa l'app.

Ogni passaggio è spiegato con le schermate a parole in [`PUBBLICARE.md`](PUBBLICARE.md).

---

## Il database gratuito

**Supabase** è un servizio che regala un database PostgreSQL con 500 MB di dati e 1 GB di file, senza carta di credito. Per un gruppo di amici sono migliaia di recensioni con foto: non lo esaurirai.

Non serve saper programmare né scrivere SQL: si tratta di incollare uno script che trovi già pronto nella guida e premere Run.

---

## Aggiornare l'app dopo la pubblicazione

I telefoni si aggiornano da soli: pagina, icone e manifest arrivano sempre dalla rete quando c'è connessione, e l'app controlla se c'è una versione nuova a ogni apertura e a ogni ritorno in primo piano.

Quando pubblichi una versione nuova, allinea due numeri:

- `const VERSIONE = '1.0.0';` in `index.html` — è quello che si legge in fondo alla schermata Io
- `const CACHE = 'pagine-marroni-1.0.0';` in `sw.js` — rinnova la copia di riserva per l'uso offline

---

## Registrare una cagata passata

Non serve essere sul posto. Nella schermata Registra:

- **Quando è successo** è un campo data e ora, preimpostato su adesso. Torna indietro quanto vuoi (non si può andare nel futuro). Se sposti solo il giorno, l'ora si porta da sola a **mezzogiorno**, perché l'ora attuale su una data passata non vuol dire niente; se ricordi l'ora vera, la scrivi. La recensione si infila in bacheca al posto giusto in ordine di tempo.
- **Cerca o scegli sulla mappa** apre una schermata con la ricerca per indirizzo o nome del posto e una mappa navigabile: tocchi il punto e lo confermi. Sulla mappa vedi anche i pin già registrati, così ritrovi al volo un bagno noto.

Da lì in poi funziona tutto come al solito: il riconoscimento del posto entro 60 metri, il nome bloccato se qualcuno c'è già stato, città e paese dedotti dal punto scelto.

Il posto lo **battezza chi lo registra per primo**, non chi ha la data più vecchia: se domani registri una cagata dell'anno scorso in un bagno già in elenco, il nome non cambia sotto il naso di nessuno.

---

## Il profilo

Si entra con **email e password**. Il nome che vedono gli altri e la faccia si scelgono alla creazione e si cambiano quando si vuole da **Io → Modifica**: lo storico segue.

- **Cambio telefono**: entri con le stesse credenziali e ritrovi tutto.
- **Password dimenticata**: dalla schermata di ingresso, ti arriva un'email con il link per sceglierne una nuova.
- **Uscire**: Io → Esci dal profilo.

L'email serve solo per entrare: non compare da nessuna parte nell'app e gli altri non la vedono.

La configurazione di tutto questo su Supabase è descritta in [`AUTENTICAZIONE.md`](AUTENTICAZIONE.md) — **va fatta prima di pubblicare questa versione**, altrimenti nessuno riesce a entrare.

---

## Etichette: due dimensioni, non una lista infinita

I posti del mondo sono infiniti, quindi elencarli come etichette non funziona: dopo "autogrill" servono bar, banca, palazzetto, traghetto, e non finisce più. Per questo ci sono **due domande separate**.

**Che tipo di posto è** — una sola scelta, nove categorie larghe: Casa, Lavoro, Bar e ristoranti, Negozi, Locali pubblici, Trasporti, Alberghi e simili, All'aperto, Altro. Servono per le statistiche e per il filtro. Il nome preciso — "Autogrill Somaglia Ovest" — sta già nel titolo della recensione, quindi non serve ripeterlo in un'etichetta.

**Cos'è successo** — quante ne vuoi, dodici circostanze, la prima delle quali è **Tutto ok** ed esclude le altre: Tutto ok, Coda, Spettatori, Bussata, Carta finita, Serratura rotta, Fuori servizio, Senza luce, Alla turca, Bagno chimico, A pagamento, Chiave al bancone. Queste sì che sono un insieme chiuso: descrivono l'esperienza, non il luogo.

---

## Come funzionano i nomi dei posti

Il nome appartiene al **posto**, non alla singola recensione. Chi registra per primo in un punto lo battezza; chi ci va dopo lo trova già scritto e bloccato, e scrive solo il proprio titolo e la propria recensione.

Due recensioni sono nello stesso posto se le coordinate distano meno di **60 metri**. Appena l'app rileva la posizione, il primo passo mostra una scheda che dice sempre in che situazione sei:

- **Questo bagno è già in elenco** — nome, chi l'ha battezzato, quante cagate ci sono e a quanti metri sei. Il nome è bloccato, con i pulsanti *Non è questo posto* e *Proponi un altro nome*.
- **Qui non è mai stato nessuno** — campo libero, con l'avviso che il nome resterà per tutti.
- **Senza posizione non posso riconoscere il bagno** — si registra lo stesso, ma senza pin e senza unione con le altre.

*Non è questo posto* crea un posto nuovo e lascia il pulsante *Era il posto di prima* per tornare indietro se hai sbagliato.

### Mezzi di trasporto

Scegliendo la categoria **Trasporto** si apre il riquadro **Il viaggio**: mezzo, compagnia e le due città. Il nome del posto lo compone l'app — `Ryanair · Barcellona–Venezia` — e non è modificabile: così la stessa tratta non finisce scritta in tre modi diversi.

- **Il posto è la tratta**, non il singolo aereo o treno: chi la rifà si aggiunge lì.
- **Andata e ritorno sono lo stesso bagno**: le città vengono ordinate alfabeticamente nel nome.
- **Le compagnie sono un elenco chiuso**, ordinato mettendo in cima quelle del tuo paese e della tratta. Se manca, il pulsante *La mia compagnia non c'è* manda una proposta al gestore.
- **Le città sono nell'app**, con le coordinate: la ricerca funziona anche a diecimila metri e senza rete.
- **Nessun battesimo e nessuna rinomina**: il nome è composto, non scelto.

### Dico la mia

Sulle recensioni degli altri, nel piè di pagina, c'è **✍️ Dico la mia**: apre il modulo già agganciato a quel posto e a quel bagno, con la stessa categoria. Voti, racconto e foto restano tuoi — non si copia niente di personale, altrimenti nascerebbero recensioni fotocopia.

Serve anche dove il GPS non arriva: in nave, in aereo, in cantina. Il posto arriva dalla recensione di partenza, non dalle coordinate.

### Bagni che non ci sono più

I chimici di una sagra, un cantiere finito, un bar chiuso. Apri il pin sulla mappa e tocca **🚫 Questo bagno non c'è più**.

Non si cancella niente: le recensioni restano in grigio con l'etichetta 🚫, il pin sulla mappa si spegne, e chiunque può riaccendere il posto con **✅ È tornato** — utile per la sagra che torna ogni anno.

### Recensioni a posteriori

La data si può spostare indietro ma non in avanti: una cagata che deve ancora succedere non si registra. Se l'evento è di almeno un giorno prima del momento in cui la scrivi, in bacheca compare l'etichetta **🕰️ Recensione a posteriori**: è scritta a memoria, e chi legge lo sa.

### Più bagni nello stesso posto

Un centro commerciale ha il bagno del piano terra e quello del primo piano, un locale ha uomini e donne: sono lo stesso **posto** ma bagni diversi, e vanno giudicati separatamente.

Sotto il nome c'è il campo **Quale bagno, di preciso**, facoltativo. Se in quel posto qualcuno ha già registrato, compaiono le pastiglie dei bagni già noti con quante cagate ciascuno — un tocco e sei nel gruppo giusto. Altrimenti ci sono i suggerimenti tipici (piano terra, uomini, donne, disabili…) oppure scrivi quello che vuoi.

Sulla mappa il **pin resta uno per posto**: toccandolo, se dentro ci sono più bagni, il fumetto li elenca con i rispettivi conteggi e ognuno apre le sue recensioni. In bacheca il filtro per posto distingue le voci con il nome del bagno accanto, e sulle schede compare la pastiglia turchese.

Per cambiare il nome di un posto serve esserne il battezzatore (o essere in modalità gestore): si modifica la propria recensione, si cambia il nome e **cambia per tutte le recensioni fatte lì**.

**Se il nome non ti convince e non l'hai scelto tu**, tocca **Proponi un altro nome** mentre registri: scrivi il nome che suggerisci e, se vuoi, il motivo. La proposta arriva a chi ha battezzato il posto, che la trova nella schermata **Io** con il pallino rosso sulla scheda e può approvarla o lasciare tutto com'è. Se approva, il nome cambia per tutte le recensioni fatte lì. Chi ha proposto vede l'esito nella stessa schermata.

Così le statistiche di un posto restano una cosa sola, invece di sparpagliarsi fra "Bar Roma", "bar roma" e "Il Bar Di Roma".

---

## Modalità gestore

Il gestore vede **Modifica** ed **Elimina** su tutte le recensioni e può rinominare qualsiasi posto. Non è un codice nel sorgente: è una riga nella tabella `gestori` del database, con il tuo identificativo. Chi non è in quell'elenco non può diventarlo, nemmeno leggendo il codice della pagina.

Il gestore ha anche il pulsante **🧨 Svuota tutto e riparti da zero**, che cancella recensioni, foto e proposte con doppia conferma — utile dopo le prove, prima del lancio vero.

Come nominarti gestore: Passo 4 di [`AUTENTICAZIONE.md`](AUTENTICAZIONE.md).

---

## Regola d'oro se metti mano al codice

Le chiavi con cui l'app salva i dati sul telefono iniziano tutte con **`pagine-marroni:`**. **Non rinominarle mai.** Contengono la tua identità di autore, che è ciò che ti rende proprietario del tuo storico: se cambiano nome, l'app non trova più niente e tu smetti di poter modificare le tue recensioni.

Se un giorno serve cambiare il formato dei dati, si aggiunge una conversione nella funzione `migra()` dentro `index.html`. Mai una chiave nuova.

---

## Crediti

L'icona è l'emoji 💩 di [Noto Emoji](https://github.com/googlefonts/noto-emoji) di Google, licenza Apache 2.0.
Mappe di [OpenStreetMap](https://www.openstreetmap.org/copyright), nomi dei luoghi da [Nominatim](https://nominatim.org/), mappa interattiva con [Leaflet](https://leafletjs.com/).

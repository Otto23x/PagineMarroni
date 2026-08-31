# Pagine Marroni 💩

**Versione 0.9**

La mappa mondiale delle cagate. Tu e i tuoi amici registrate dove siete stati, con foto, voti in cacche e recensione: tutto finisce in bacheca e come pin su una mappa del mondo condivisa.

App a pagina unica, installabile sul telefono, funziona anche senza rete.

---

## Come si usa

| Sezione | Cosa fa |
|---|---|
| 💩 **Registra** | Nome del posto, racconto, posizione, foto, voti in cacche, etichette. **È sempre la schermata di apertura**, a ogni avvio. |
| 📰 **Bacheca** | Tutte le recensioni del gruppo. Filtri per persona, città, paese e voto. Le tue le modifichi o le elimini. |
| 🗺️ **Mappa** | I pin di tutti. Tocca un pin per leggere la recensione. |
| 🏆 **Classifica** | Chi ha registrato di più e i bagni col voto più alto. Tocca un nome per le sue statistiche, tocca un bagno per le sue recensioni. |
| 🚽 **Io** | Le tue statistiche, i distintivi, il backup CSV, le notifiche e il cambio nome. |

---

## I file di questo repo

| File | Obbligatorio | A cosa serve |
|---|:---:|---|
| `index.html` | ✅ | **L'app.** Quale delle due versioni usare è spiegato qui sotto. |
| `manifest.json` | ✅ | Nome e icone per l'installazione sul telefono. |
| `sw.js` | ✅ | Fa funzionare l'app offline e gestisce gli aggiornamenti. |
| `icon-192.png` `icon-512.png` | ✅ | Icone dell'app. |
| `icon-maskable-512.png` | ✅ | Icona per Android, che la ritaglia a cerchio o a goccia. |
| `apple-touch-icon.png` | ✅ | Icona per iPhone (iOS non gestisce la trasparenza). |
| `favicon.png` | consigliato | Icona nella scheda del browser. |
| `index-supabase.html` | — | La versione con database condiviso, **da rinominare in `index.html`** dopo averci messo le chiavi. Non va caricata così com'è. |
| `PUBBLICARE.md` | — | La guida completa passo passo. |
| `README.md` | — | Questo file. |

---

## Le due versioni dell'app: quale scegliere

Nel pacchetto ci sono due file HTML. **Nel repo ne va uno solo, e deve chiamarsi `index.html`.**

| | `index.html` (base) | `index-supabase.html` (condivisa) |
|---|---|---|
| Dove finiscono le recensioni | Nel telefono di chi le scrive | In un database in rete |
| Chi le vede | Solo tu | Tutto il gruppo |
| Foto | Nel telefono | Su uno spazio in rete |
| Aggiornamento fra amici | — | In tempo reale, senza ricaricare |
| Configurazione | Nessuna | Due chiavi da incollare |
| A cosa serve | Provarla | **Usarla davvero** |

Per un gruppo di amici serve la seconda. Come si prepara sta in [`PUBBLICARE.md`](PUBBLICARE.md), ma il riassunto è qui sotto.

---

## Riassunto: dalla cartella al sito online

1. **Crea il database gratuito** su [supabase.com](https://supabase.com) → New project.
2. **SQL Editor** → incolla lo script della guida → Run. Crea la tabella delle recensioni.
3. **Storage** → New bucket chiamato `foto`, spuntato come pubblico → più due righe di SQL.
4. **Project Settings → API** → copia il *Project URL* e la chiave *anon public*.
5. Apri `index-supabase.html` con un editor di testo, incolla le due chiavi nelle righe che contengono `INCOLLA_QUI`, salva e **rinomina il file in `index.html`**.
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

Quando ricarichi i file sul repo, i telefoni che hanno già l'app hanno in memoria la versione vecchia. Per farli aggiornare:

> Apri `sw.js`, prima riga utile: `const CACHE = 'pagine-marroni-0.9-b1';`
> **Alza di uno il numero dopo la `b`** — `b6`, `b7`, e così via — a ogni pubblicazione.

Quel numero non è la versione dell'app, è il segnale che dice ai telefoni di scaricare i file nuovi. L'app controlla da sola a ogni apertura e a ogni ritorno in primo piano, quindi non dovrai più svuotare la cache a mano.

---

## Regola d'oro se metti mano al codice

Le chiavi con cui l'app salva i dati sul telefono iniziano tutte con **`pagine-marroni:`**. **Non rinominarle mai.** Contengono la tua identità di autore, che è ciò che ti rende proprietario del tuo storico: se cambiano nome, l'app non trova più niente e tu smetti di poter modificare le tue recensioni.

Se un giorno serve cambiare il formato dei dati, si aggiunge una conversione nella funzione `migra()` dentro `index.html`. Mai una chiave nuova.

---

## Crediti

L'icona è l'emoji 💩 di [Noto Emoji](https://github.com/googlefonts/noto-emoji) di Google, licenza Apache 2.0.
Mappe di [OpenStreetMap](https://www.openstreetmap.org/copyright), nomi dei luoghi da [Nominatim](https://nominatim.org/), mappa interattiva con [Leaflet](https://leafletjs.com/).

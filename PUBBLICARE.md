# Pagine Marroni — guida completa alla pubblicazione

**Versione 1.7**

Questa guida ti porta da una cartella di file a un'app installata sul telefono tuo e dei tuoi amici, con le recensioni condivise. Non serve saper programmare. Serve copiare e incollare.

Tempo: circa 30 minuti la prima volta.
Costo: zero.

---

## Indice

- [Parte 0 — Cosa ti serve](#parte-0--cosa-ti-serve)
- [Parte 1 — Capire i due file `index`](#parte-1--capire-i-due-file-index)
- [Parte 2 — Il database gratuito](#parte-2--il-database-gratuito-supabase)
- [Parte 3 — Mettere le chiavi nell'app](#parte-3--mettere-le-chiavi-nellapp)
- [Parte 4 — Pubblicare su GitHub Pages](#parte-4--pubblicare-su-github-pages)
- [Parte 5 — Installare sul telefono](#parte-5--installare-sul-telefono)
- [Parte 6 — La prova del nove](#parte-6--la-prova-del-nove)
- [Parte 7 — Pubblicare gli aggiornamenti](#parte-7--pubblicare-gli-aggiornamenti)
- [Parte 8 — Quando qualcosa non va](#parte-8--quando-qualcosa-non-va)
- [Parte 9 — Sicurezza e backup](#parte-9--sicurezza-e-backup)

---

# Parte 0 — Cosa ti serve

1. Un account **GitHub** (gratis) — probabilmente ce l'hai già, visto che il repo esiste.
2. Un account **Supabase** (gratis, si crea con GitHub in dieci secondi).
3. Un computer. Dal telefono si può fare, ma incollare chiavi lunghissime in un file è un supplizio.
4. Un editor di testo: va benissimo **Blocco note** su Windows o **TextEdit** su Mac. Se hai VS Code, meglio.

⚠️ Se apri i file HTML con Word, li rovini. Servono editor di *testo semplice*.

---

# Parte 1 — Capire i due file `index`

Nel pacchetto ci sono due file che sembrano uguali ma non lo sono.

**`index.html`** è la versione base. Salva tutto nel telefono di chi scrive. Tu vedi le tue recensioni, il tuo amico le sue, e non vi incontrate mai. Va bene solo per provare l'app.

**`index-supabase.html`** è la versione condivisa. Salva tutto in un database in rete, quindi tutti vedono tutto e le cose compaiono in tempo reale. **È quella che ti serve.**

La differenza sta in una quarantina di righe: il resto dell'app è identico.

## La regola che genera più confusione

> Il file che pubblichi deve **sempre** chiamarsi `index.html`, perché è il nome che i siti web usano per la pagina principale.

Quindi il lavoro è: prendi `index-supabase.html`, ci metti dentro le tue chiavi, e **lo rinomini in `index.html`** sovrascrivendo quello base. Nel repo resta un solo file HTML.

---

# Parte 2 — Il database gratuito (Supabase)

**Supabase** regala un database PostgreSQL con 500 MB di spazio dati e 1 GB per le foto, senza carta di credito.

## Passo 2.1 — Crea il progetto

1. Vai su [supabase.com](https://supabase.com) e premi **Start your project**.
2. Accedi con GitHub.
3. Premi **New project** e compila:
   - **Name**: `pagine-marroni`
   - **Database Password**: premi *Generate a password* e **salvala da qualche parte**. Non ti servirà per l'app, ma perderla è una seccatura.
   - **Region**: scegli **Frankfurt** o **Milan** (più vicino = più veloce).
4. Premi **Create new project** e aspetta un paio di minuti che finisca di accendersi.

## Passo 2.2 — Crea la tabella delle recensioni

Nel menu a sinistra premi **SQL Editor**, poi **New query**. Incolla **tutto** questo blocco senza toccare niente e premi **Run** (o Ctrl+Invio).

```sql
create table recensioni (
  id         text primary key,
  nome       text not null,
  autore_id  text,
  faccia     text,
  ts         bigint not null,
  luogo      text,
  luogo_id   text,
  categoria  text,
  titolo     text,
  testo      text,
  voti       jsonb not null default '{}'::jsonb,
  tag        jsonb default '[]'::jsonb,
  durata     int,
  lat        double precision,
  lng        double precision,
  citta      text,
  paese      text,
  foto_url   text,
  reaz       jsonb default '{}'::jsonb,
  creato     timestamptz default now()
);

create index recensioni_ts on recensioni (ts desc);

-- senza queste regole nessuno può leggere né scrivere, nemmeno tu
alter table recensioni enable row level security;

create policy "tutti leggono"    on recensioni for select using (true);
create policy "tutti scrivono"   on recensioni for insert with check (true);
create policy "tutti modificano" on recensioni for update using (true) with check (true);
create policy "tutti cancellano" on recensioni for delete using (true);

-- proposte di rinomina dei posti
create table proposte (
  id            text primary key,
  luogo_id      text not null,
  nome_attuale  text,
  nome_proposto text not null,
  motivo        text,
  da_id         text,
  da_nome       text,
  a_id          text,
  ts            bigint not null,
  stato         text default 'attesa'
);

alter table proposte enable row level security;

create policy "tutti leggono proposte" on proposte for select using (true);
create policy "tutti propongono"       on proposte for insert with check (true);
create policy "tutti rispondono"       on proposte for update using (true) with check (true);

-- fa comparire cagate e proposte senza ricaricare la pagina
alter publication supabase_realtime add table recensioni;
alter publication supabase_realtime add table proposte;
```

Deve rispondere **Success. No rows returned**. È il messaggio giusto: hai creato una tabella, non hai chiesto dei dati.

## Passo 2.3 — Crea lo spazio per le foto

1. Menu a sinistra → **Storage** → **New bucket**.
2. **Name**: `foto` (tutto minuscolo, esattamente così).
3. Accendi l'interruttore **Public bucket**. È indispensabile: se resta privato, le foto non si vedranno.
4. **Save**.

Poi torna nel **SQL Editor**, **New query**, e lancia anche questo:

```sql
create policy "chiunque carica foto" on storage.objects
  for insert with check (bucket_id = 'foto');

create policy "chiunque vede le foto" on storage.objects
  for select using (bucket_id = 'foto');

create policy "chiunque cancella le proprie foto" on storage.objects
  for delete using (bucket_id = 'foto');
```

## Passo 2.4 — Copia l'indirizzo e la chiave

Ti servono due valori, e stanno in due pagine diverse.

### L'indirizzo del progetto

Menu a sinistra, in fondo: **Project Settings** → **Data API**. In cima c'è **Project URL**, fatto così:

```
https://abcdefghijklm.supabase.co
```

Copialo senza la barra finale.

*In alternativa*: dalla schermata principale del progetto, il pulsante **Connect** in alto mostra lo stesso indirizzo.

### La chiave

**Project Settings** → **API Keys**. Qui Supabase ha cambiato le carte in tavola nel 2025, quindi guarda bene: la pagina ha due schede e quattro chiavi diverse.

| Cosa vedi | Cosa farne |
|---|---|
| **Publishable key** — `sb_publishable_...` | ✅ **È questa.** Premi l'icona di copia accanto al valore. |
| **Secret key** — `sb_secret_...` | ❌ Mai. Bypassa tutte le protezioni: in una pagina web è come lasciare le chiavi di casa sullo zerbino. |
| Scheda *Legacy anon, service_role API keys* → **anon** | Funziona ancora, ma è in via di pensionamento. Usala solo se la publishable dà problemi. |
| Scheda *Legacy...* → **service_role** | ❌ Mai, per lo stesso motivo della secret. |

La chiave *publishable* ha sostituito quella che una volta si chiamava *anon*: fa esattamente lo stesso lavoro, e va bene per qualunque versione delle librerie Supabase. Il nome dice tutto — è pubblicabile, cioè pensata per stare dentro una pagina web. A proteggere i dati sono le policy che hai creato al Passo 2.2, non il segreto della chiave.

> Regola pratica per non sbagliare mai: **quella che si copia da sola è quella giusta, quella nascosta dai pallini è quella da non toccare.** La chiave segreta è mascherata e ha l'icona dell'occhio per rivelarla. Se hai dovuto premere l'occhio, hai preso quella sbagliata.

---

# Parte 3 — Mettere le chiavi nell'app

> **Se il pacchetto che hai in mano contiene già `index.html` e non `index-supabase.html`, questa parte è già stata fatta per te**: le chiavi sono dentro. Salta alla Parte 4.


1. Apri **`index-supabase.html`** con Blocco note, TextEdit o VS Code.
2. Cerca `INCOLLA_QUI` (Ctrl+F, o Cmd+F su Mac). Sono due righe, vicino all'inizio della parte di codice:

```js
const SUPABASE_URL    = 'INCOLLA_QUI_IL_PROJECT_URL';
const SUPABASE_CHIAVE = 'INCOLLA_QUI_LA_CHIAVE_PUBBLISHABLE';
```

3. Sostituisci **solo la parte fra gli apici**, lasciando apici e punto e virgola dove sono:

```js
const SUPABASE_URL    = 'https://abcdefghijklm.supabase.co';
const SUPABASE_CHIAVE = 'sb_publishable_ScRsxecp4dZPJVaJyZ7oIw_Fhxes...';
```

Gli errori tipici sono tre: cancellare un apice, lasciare uno spazio dentro le virgolette, oppure incollare l'indirizzo con la barra finale (`.supabase.co/` va scritto senza `/`).

4. **Salva.**
5. **Rinomina il file in `index.html`**, sovrascrivendo quello base che c'era prima.

Da adesso nella tua cartella c'è un solo `index.html`, ed è quello giusto.

---

# Parte 4 — Pubblicare su GitHub Pages

Questi sono i file che devono stare nella **cartella principale** del repository, senza sottocartelle:

```
index.html               ← quello con le tue chiavi dentro
manifest.json
sw.js
icon-192.png
icon-512.png
icon-maskable-512.png
apple-touch-icon.png
favicon.png
README.md                (facoltativo)
PUBBLICARE.md            (facoltativo)
```

`index-supabase.html` **non va caricato**: ormai è diventato il tuo `index.html`.

## Metodo A — dal browser, senza comandi

1. Apri il tuo repo su github.com.
2. Premi **Add file** → **Upload files**.
3. Trascina dentro tutti i file dell'elenco.
4. In basso scrivi un messaggio, per esempio `pubblicazione`, e premi **Commit changes**.

## Metodo B — da terminale

```bash
cd cartella-del-repo
cp /percorso/della/cartella/pagine-marroni/* .
rm -f index-supabase.html
git add .
git commit -m "pubblicazione"
git push
```

## Accendere GitHub Pages

Se non l'hai già fatto: repo → **Settings** → **Pages** → in *Source* scegli **Deploy from a branch**, branch `main`, cartella `/ (root)` → **Save**.

Dopo 30–60 secondi il sito è online. Nella scheda **Actions** vedi la spunta verde quando ha finito. L'indirizzo è:

```
https://TUONOME.github.io/NOMEREPO/
```

---

# Parte 5 — Installare sul telefono

Apri quell'indirizzo dal telefono. Dopo un secondo compare la fascia scura **Installa Pagine Marroni**.

**Android (Chrome)**: premi Installa e conferma. Se la fascia non compare, menu ⋮ → *Installa app*.

**iPhone (Safari, e deve essere Safari)**: premi il tasto Condividi in basso, scorri e scegli **Aggiungi a Home**. L'app compare fra le altre con l'icona della cacca.

Perché installarla e non usarla dal browser: parte a tutto schermo, senza barra degli indirizzi, resta fra le app recenti, e su iPhone le notifiche funzionano solo così.

---

# Parte 6 — La prova del nove

Fai questi cinque controlli in ordine. Se passano tutti, hai finito.

1. **Apri il sito.** Ti chiede nome e faccia. Se invece compare il messaggio *"Manca la configurazione Supabase"*, le chiavi della Parte 3 non sono a posto: torna lì.
2. **Registra una cagata** completa: nome del posto, due voti almeno, posizione (il browser chiede il permesso: accetta) e una foto.
3. **Vai su Supabase** → **Table Editor** → `recensioni`. Deve esserci una riga con i tuoi dati. Se c'è, il grosso funziona.
4. **Apri il sito da un altro telefono**, con un altro nome. Devi vedere la cagata del primo comparire **senza ricaricare la pagina**.
5. **Tocca il pin sulla mappa**: si apre la scheda con foto, autore e voto. E tocca la miniatura in bacheca: la foto si apre in grande.

---

# Parte 7 — Pubblicare gli aggiornamenti

Quando cambi qualcosa e ricarichi i file, i telefoni si aggiornano da soli: pagina, icone e manifest vengono sempre presi dalla rete quando c'è connessione, e l'app controlla se c'è una versione nuova a ogni apertura e a ogni ritorno in primo piano.

L'unica cosa che resta in memoria è la copia di riserva per l'uso offline. Per rinnovare anche quella, quando pubblichi una versione nuova apri **`sw.js`** e cambia il numero nella terza riga:

```js
const CACHE = 'pagine-marroni-1.7';
```

Da `1.0` a `1.1`, e così via — lo stesso numero che scrivi in `const VERSIONE` dentro `index.html`, così i due restano allineati e sai sempre cosa c'è online.

**I dati non si perdono mai in un aggiornamento**: le recensioni stanno nel database, non nell'app. E se una versione nuova arriva mentre stai scrivendo, la pagina non si ricarica di colpo: aspetta che tu abbia salvato.

---

# Parte 8 — Quando qualcosa non va

Prima cosa da fare sempre: apri la **console del browser** (F12 → scheda **Console**). Supabase ci scrive dentro il motivo esatto dell'errore, in inglese ma comprensibile.

| Sintomo | Causa e rimedio |
|---|---|
| Compare *"Manca la configurazione Supabase"* | I due valori non sono stati incollati, o hai cancellato un apice. Parte 3. |
| `Invalid API key` nella console | Hai copiato la chiave sbagliata. Serve la **Publishable key** (`sb_publishable_...`), non la secret. Passo 2.4. |
| Bacheca vuota, console dice `permission denied for table recensioni` | Non hai lanciato le policy del Passo 2.2. Rilancia quel blocco. |
| La recensione si salva ma la foto no | Il bucket `foto` non è pubblico, o mancano le policy del Passo 2.3. |
| `column "luogo_id" does not exist` (o `citta`, o `autore_id`) | Hai creato la tabella con una versione vecchia dello script. Lancia: `alter table recensioni add column if not exists autore_id text, add column if not exists citta text, add column if not exists luogo_id text, add column if not exists categoria text;` |
| Le cagate degli amici non compaiono da sole | Mancano le righe finali del Passo 2.2: `alter publication supabase_realtime add table recensioni;` e la stessa per `proposte` |
| Le proposte di rinomina non arrivano, in console `relation "proposte" does not exist` | Manca la tabella delle proposte: lancia il blocco della sezione "Aggiornare un progetto già creato" |
| Il pulsante Elimina non funziona | Manca la policy di delete: `create policy "tutti cancellano" on recensioni for delete using (true);` |
| `Failed to fetch` nella console | Project URL sbagliato (occhio alla barra finale), oppure hai aperto il file col doppio clic invece che dal sito. |
| Il tasto della posizione non fa niente | La geolocalizzazione richiede HTTPS. Usa l'indirizzo `https://...github.io/...`, non un file aperto localmente. |
| Ho pubblicato ma vedo ancora la versione vecchia | Chiudi e riapri l'app: il controllo parte all'avvio. Se persiste, cambia il numero in `sw.js`. Parte 7. |
| L'icona sul telefono è sbagliata | Le icone sono cinque file: controlla di averli caricati tutti. |

---

# Parte 9 — Sicurezza e backup

## Le SQL injection non sono possibili

L'app non scrive mai comandi SQL. Passa i dati al client di Supabase, che li invia come parametri separati dalla richiesta. Se scrivi `'; drop table recensioni; --` come nome del bagno, finisce nel database come testo e basta. Le policy permettono soltanto di leggere e scrivere righe di quella tabella: nessuna richiesta può toccare la struttura del database.

Nemmeno gli script HTML funzionano: tutto il testo scritto dagli utenti viene neutralizzato prima di finire nella pagina.

## La chiave `anon` nel codice non è una falla

È pubblica per costruzione, sta nel sorgente di qualunque app Supabase. A decidere chi può fare cosa sono le policy, non il segreto della chiave.

## Il limite vero, che devi conoscere

Con le policy della Parte 2, **chiunque conosca l'indirizzo del tuo sito può inserire, modificare e cancellare recensioni**. Nell'app i pulsanti compaiono solo sulle tue, ma è una regola dell'interfaccia, non del database.

Per un gruppo di amici è un rischio teorico: nessuno cerca a caso indirizzi di GitHub Pages. Ma se un giorno ti riempissero di spam:

*Chiudere le scritture in un secondo* (la lettura resta):

```sql
drop policy "tutti scrivono" on recensioni;
```

*Chiudere il club sul serio*: attiva **Authentication → Providers → Anonymous** su Supabase, poi:

```sql
alter table recensioni add column if not exists uid uuid default auth.uid();

drop policy "tutti modificano" on recensioni;
drop policy "tutti cancellano" on recensioni;

create policy "modifica solo le tue" on recensioni
  for update using (uid = auth.uid()) with check (uid = auth.uid());
create policy "cancella solo le tue" on recensioni
  for delete using (uid = auth.uid());
```

Richiede anche una riga nell'app (`await cli.auth.signInAnonymously()` prima del primo caricamento dei dati).

## Backup

Il piano gratuito di Supabase non fa backup automatici seri. Il modo per dormire tranquillo:

- **Da Supabase**: Table Editor → tre puntini → **Download as CSV**.

Fallo ogni tanto. Costa dieci secondi e ti salva un anno di ricordi.

---

## Se metti mano al codice

Le chiavi con cui l'app salva i dati sul telefono iniziano con **`pagine-marroni:`**. **Non rinominarle mai**: contengono la tua identità di autore, cioè ciò che ti rende proprietario del tuo storico. Se un domani serve cambiare il formato dei dati, si aggiunge una conversione nella funzione `migra()` dentro `index.html`, mai una chiave nuova.

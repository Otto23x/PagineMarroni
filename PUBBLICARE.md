# Pubblicare Merdiano con il database condiviso

Guida completa, file per file. Punto di partenza: hai già il repo su GitHub Pages e vedi l'app, ma le recensioni restano sul tuo telefono.

Alla fine avrai: recensioni, foto e pin visibili a tutti, aggiornati in tempo reale, con il nome di chi li ha lasciati.

Tempo: 20 minuti. Costo: zero.

---

# PARTE 1 — Il database (Supabase)

## Passo 1. Crea il progetto

1. Vai su [supabase.com](https://supabase.com) → **Start your project** → accedi con GitHub.
2. **New project**:
   - Name: `merdiano`
   - Database Password: generala e salvala (non ti servirà per l'app, ma non perderla)
   - Region: **Frankfurt** o **Milan**
3. Premi **Create new project** e aspetta ~2 minuti.

## Passo 2. Crea la tabella

Menu a sinistra → **SQL Editor** → **New query**. Incolla **tutto** questo blocco e premi **Run** (o Ctrl+Invio):

```sql
create table recensioni (
  id         text primary key,
  nome       text not null,
  autore_id  text,
  faccia     text,
  ts         bigint not null,
  luogo      text,
  titolo     text,
  testo      text,
  voti       jsonb not null default '{}'::jsonb,
  tipo       text,
  tag        jsonb default '[]'::jsonb,
  durata     int,
  lat        double precision,
  lng        double precision,
  paese      text,
  foto_url   text,
  reaz       jsonb default '{}'::jsonb,
  creato     timestamptz default now()
);

create index recensioni_ts on recensioni (ts desc);

alter table recensioni enable row level security;

create policy "tutti leggono"    on recensioni for select using (true);
create policy "tutti scrivono"   on recensioni for insert with check (true);
create policy "tutti reagiscono" on recensioni for update using (true) with check (true);
-- volutamente nessuna policy di delete: nessuno può cancellare lo storico del gruppo

alter publication supabase_realtime add table recensioni;
```

Deve comparire *Success. No rows returned*. È giusto così.

## Passo 3. Crea lo spazio per le foto

Menu a sinistra → **Storage** → **New bucket**:

- Name: `foto`
- **Public bucket**: acceso ✅
- **Save**

Poi torna nel **SQL Editor**, nuova query, e lancia:

```sql
create policy "chiunque carica foto" on storage.objects
  for insert with check (bucket_id = 'foto');

create policy "chiunque vede le foto" on storage.objects
  for select using (bucket_id = 'foto');
```

## Passo 4. Prendi le due chiavi

Menu a sinistra → in fondo **Project Settings** → **API**. Copiati:

| Voce nella pagina | Che aspetto ha |
|---|---|
| **Project URL** | `https://abcdefghijkl.supabase.co` |
| **anon** / **public** | `eyJhbGciOiJIUzI1NiIs...` lunghissima |

⚠️ Serve la chiave **anon public**, *non* la `service_role`. Quella non va mai messa in una pagina web.

---

# PARTE 2 — I file del sito

## Passo 5. Prepara `index.html`

Nel pacchetto hai due versioni:

| File | Cosa fa |
|---|---|
| `index.html` | versione locale, ognuno vede solo le proprie cagate |
| `index-supabase.html` | **questa ti serve**: database condiviso |

Fai così:

1. Apri `index-supabase.html` con un editor di testo (Blocco note, TextEdit, VS Code).
2. Cerca `INCOLLA_QUI` (Ctrl+F). Trovi due righe verso l'inizio dello script:

```js
const SUPABASE_URL  = 'INCOLLA_QUI_IL_PROJECT_URL';
const SUPABASE_ANON = 'INCOLLA_QUI_LA_CHIAVE_ANON';
```

3. Sostituiscile con le tue, virgolette comprese:

```js
const SUPABASE_URL  = 'https://abcdefghijkl.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

4. Salva, poi **rinomina il file in `index.html`**, sovrascrivendo quello vecchio.

## Passo 6. Carica i file nel repo

Questi sono i file che devono stare nella **radice** del repository, nessuna sottocartella:

| File | Obbligatorio | A cosa serve |
|---|---|---|
| `index.html` | ✅ | l'app (quella con le tue chiavi dentro) |
| `manifest.json` | ✅ | nome e icone per l'installazione sul telefono |
| `sw.js` | ✅ | funzionamento offline |
| `icon-192.png` | ✅ | icona |
| `icon-512.png` | ✅ | icona |
| `icon-maskable-512.png` | consigliato | icona Android ritagliata |
| `README.md` | facoltativo | descrizione del repo |

**Dal browser** (il modo più semplice):

1. Apri il tuo repo su github.com
2. **Add file** → **Upload files**
3. Trascina dentro tutti i file qui sopra
4. In basso scrivi come messaggio `database condiviso` → **Commit changes**

**Da terminale**, se preferisci:

```bash
cd cartella-del-repo
cp /percorso/merdiano/* .
git add .
git commit -m "database condiviso"
git push
```

GitHub Pages ripubblica da solo in 30–60 secondi (lo vedi nella scheda **Actions**).

## Passo 7. Svuota la vecchia versione dal telefono

Il service worker della versione precedente potrebbe mostrarti ancora la vecchia pagina. Una volta sola:

- **Computer**: Ctrl+Shift+R (Mac: Cmd+Shift+R)
- **Android**: Chrome → ⋮ → Impostazioni → Privacy → Cancella dati navigazione → solo per questo sito
- **iPhone**: chiudi la scheda, riaprila; se resta vecchia, Impostazioni → Safari → Cancella dati siti web

Da questo aggiornamento in poi il problema non si ripresenta: la pagina viene sempre presa dalla rete quando c'è.

---

# PARTE 3 — Verifica

Apri il sito e controlla in ordine:

1. **Entra** con un soprannome. Se compare il messaggio *"Manca la configurazione Supabase"*, le chiavi del passo 5 non sono state incollate bene.
2. **Registra una cagata** con foto e posizione (il browser chiede il permesso: accetta).
3. Su Supabase → **Table Editor** → `recensioni`: deve esserci una riga. Se c'è, funziona tutto.
4. Apri il sito **da un altro telefono con un altro nome**: devi vedere la cagata dell'altro senza ricaricare.
5. **Clicca il pin** sulla mappa: si apre la scheda con foto, titolo, autore e voto.

## Se qualcosa non va

Apri la console del browser (F12 → **Console**, su telefono usa il computer): Supabase scrive lì il motivo esatto.

| Sintomo | Causa |
|---|---|
| Feed vuoto, in console `permission denied for table recensioni` | manca la policy di `select` del passo 2 |
| La recensione si salva ma la foto no | bucket non pubblico, o mancano le policy del passo 3 |
| `column "autore_id" does not exist` | hai creato la tabella con una versione precedente dello script: lancia `alter table recensioni add column autore_id text;` |
| Le cagate degli altri non compaiono da sole | manca `alter publication supabase_realtime add table recensioni;` |
| `Failed to fetch` | Project URL sbagliato, oppure hai aperto il file con doppio clic invece che dal sito |
| Il pulsante posizione non fa niente | la geolocalizzazione vuole HTTPS: usa l'indirizzo `https://tuonome.github.io/...`, non `http://` |

---

# PARTE 4 — Quanto è sicuro

**Le SQL injection non sono possibili.** L'app non scrive mai SQL: parla con Supabase attraverso il suo client, che invia i dati come parametri separati dalla query. Anche se scrivi `'; drop table recensioni; --` nel nome del bagno, finisce nel database come testo, punto. In più non esiste una policy di `delete`: nessuno può cancellare righe, nemmeno per sbaglio.

**Nemmeno gli script nelle recensioni.** Tutto il testo che gli utenti scrivono passa da una funzione di escape prima di finire nella pagina: un `<script>` scritto in una recensione si vede come testo, non viene eseguito.

**La chiave `anon` nel codice non è una falla.** È pubblica per progetto, sta nel sorgente di qualunque app Supabase. A decidere chi fa cosa sono le policy del passo 2.

**Il vero limite è un altro, e devi saperlo**: con queste policy chiunque trovi l'indirizzo del sito può inserire recensioni. Per un gruppo di amici va benissimo. Se ti scoprissero e iniziassero a riempirtelo di spam, hai due rimedi rapidi:

*Chiudere tutto in un secondo* (blocca le nuove scritture, la lettura resta):

```sql
drop policy "tutti scrivono" on recensioni;
```

*Pulire lo spam* (dal Table Editor di Supabase, selezioni le righe e le elimini: tu come proprietario del progetto puoi sempre).

Se invece vuoi un club chiuso fin dall'inizio, attiva **Authentication → Providers → Anonymous** su Supabase e cambia le policy in `using (auth.uid() is not null)`: ogni dispositivo ottiene un'identità vera e solo chi è passato dall'app può scrivere.

## Chi ha scritto cosa

Ogni recensione porta tre informazioni sull'autore: il **soprannome** scelto al primo accesso, la **faccia** e un **identificativo di dispositivo** generato una sola volta e salvato in locale. Il soprannome è quello che si vede in bacheca, nella classifica e sui pin; l'identificativo serve a distinguere due amici che scegliessero lo stesso nome. Se cambi soprannome dal profilo, l'identificativo resta lo stesso e lo storico continua a essere tuo.

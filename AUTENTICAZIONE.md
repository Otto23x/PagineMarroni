# Attivare l'accesso con email e password

Da questa versione **Pagine Marroni usa un vero account**: email, password e recupero password. Serve una configurazione su Supabase, una volta sola, in circa dieci minuti.

---

## Passo 1 — Spegni la conferma via email

Supabase, di default, manda un'email di conferma a ogni iscrizione. Sul piano gratuito la posta integrata è limitata a pochissimi messaggi all'ora: per un gruppo di amici crea solo attriti.

**Authentication** → **Sign In / Providers** → **Email** → togli la spunta a **Confirm email** → **Save**.

Da adesso chi crea il profilo entra subito. Se preferisci tenerla accesa, salta al Passo 4 e configura una posta vera.

## Passo 2 — Di' a Supabase dov'è il sito

Serve perché il link di recupero password riporti alla tua app e non altrove.

**Authentication** → **URL Configuration**:

- **Site URL**: `https://TUONOME.github.io/NOMEREPO/`
- **Redirect URLs**: aggiungi la stessa riga, e `http://localhost:8080` se provi anche in locale.

Senza questo, il link nell'email non funziona.

## Passo 3 — Regole del database

**SQL Editor** → **New query** → incolla e **Run**:

```sql
-- categoria del posto (casa, lavoro, trasporti…)
alter table recensioni add column if not exists categoria text;
-- quale bagno, dentro lo stesso posto (piano terra, uomini, in fondo a destra…)
alter table recensioni add column if not exists settore text;

-- chi può fare il gestore: modificare ed eliminare le recensioni di tutti
create table if not exists gestori (
  uid  uuid primary key,
  nota text
);
alter table gestori enable row level security;
create policy "leggo se sono io" on gestori for select using (uid = auth.uid());

-- da adesso per scrivere bisogna avere un profilo
drop policy if exists "tutti scrivono"   on recensioni;
drop policy if exists "tutti modificano" on recensioni;
drop policy if exists "tutti cancellano" on recensioni;

create policy "scrive chi ha un profilo" on recensioni
  for insert with check (auth.uid() is not null);

-- l'aggiornamento resta aperto a chi ha un profilo: serve per le reazioni
-- e per rinominare un posto in tutte le recensioni fatte lì
create policy "aggiorna chi ha un profilo" on recensioni
  for update using (auth.uid() is not null) with check (auth.uid() is not null);

-- cancellare, invece, solo le proprie (o essere gestore)
create policy "cancella le tue" on recensioni
  for delete using (
    autore_id = auth.uid()::text
    or exists (select 1 from gestori g where g.uid = auth.uid())
  );

-- stesse regole per le proposte di rinomina
drop policy if exists "tutti propongono" on proposte;
drop policy if exists "tutti rispondono" on proposte;
create policy "propone chi ha un profilo" on proposte
  for insert with check (auth.uid() is not null);
create policy "risponde chi ha un profilo" on proposte
  for update using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "cancella proposte il gestore" on proposte
  for delete using (exists (select 1 from gestori g where g.uid = auth.uid()));

-- le foto: caricabili solo da chi ha un profilo, visibili a tutti
drop policy if exists "chiunque carica foto" on storage.objects;
create policy "carica foto chi ha un profilo" on storage.objects
  for insert with check (bucket_id = 'foto' and auth.uid() is not null);
```

**Cosa cambia in pratica:** la lettura resta aperta a chiunque apra il sito, ma per scrivere serve un profilo. Uno sconosciuto che trovasse il tuo indirizzo non può più riempirti la bacheca senza prima iscriversi.

## Passo 4 — Nominati gestore

Crea il tuo profilo dall'app, poi vai in **Io**: in fondo, sotto la guida, c'è scritto *identificativo* seguito da una stringa lunga. Copiala e lancia:

```sql
insert into gestori (uid, nota) values ('INCOLLA_QUI_IL_TUO_IDENTIFICATIVO', 'io');
```

Riapri l'app: comparirà il riquadro giallo **Modalità gestore attiva** e vedrai Modifica ed Elimina su tutte le recensioni. Il vecchio codice `marrone` non esiste più — adesso il gestore è una riga nel database, che nessuno può indovinare leggendo il sorgente.

## Azzerare tutto prima del lancio vero

Dopo le prove vorrai ripartire da zero. Due modi.

### Dall'app (il più comodo)

Sei gestore → **Io** → riquadro giallo → **🧨 Svuota tutto e riparti da zero**.

Chiede due conferme: la prima ti dice quante recensioni stai per cancellare, la seconda ti fa scrivere **AZZERA** in maiuscolo. Poi cancella recensioni, foto e proposte, e ripulisce anche quello che era rimasto sul tuo telefono. I profili con email restano al loro posto: nessuno deve iscriversi di nuovo.

### Da Supabase (funziona sempre)

**SQL Editor** → **New query**:

```sql
delete from proposte;
delete from recensioni;
```

Le foto vanno cancellate a parte, perché stanno nello spazio file e non nel database: **Storage** → bucket **foto** → seleziona tutto → **Delete**.

### Se vuoi cancellare anche i profili

**Authentication** → **Users** → selezioni e cancelli. Fallo solo se vuoi che tutti si iscrivano di nuovo: le recensioni scritte da un profilo cancellato restano, ma nessuno potrà più modificarle.

### Cosa resta comunque

Sui telefoni degli altri rimangono le bozze non ancora salvate e le eventuali recensioni in coda per mancanza di rete: quando torneranno online, quelle verranno pubblicate e ricompariranno. Se vuoi partire proprio puliti, avvisa il gruppo di aprire l'app una volta prima dell'azzeramento.

---

## Passo 4 bis (facoltativo) — L'email di recupero password

Quella predefinita di Supabase è una riga di testo con un link nudo. Si può sostituire.

**Authentication** → **Emails** → scheda **Templates** → **Reset Password**.

Cambia l'oggetto in qualcosa di riconoscibile, per esempio:

```
Pagine Marroni — la tua nuova password
```

Poi, nel riquadro del messaggio, cancella tutto e incolla il contenuto del file **`email-recupero-password.html`** che trovi nel pacchetto: è nello stile dell'app, con la cacca in cima, il pulsante marrone e l'indirizzo di riserva in fondo per chi ha il client di posta che blocca i link. **Save**.

Nota: `{{ .ConfirmationURL }}` è la variabile che Supabase sostituisce col link vero. Deve restare scritta esattamente così, comprese le graffe e lo spazio dopo la prima coppia.

Stessa cosa si può fare con **Confirm signup** e **Magic Link**, se un giorno li userai.

⚠️ Quello che **non** puoi cambiare senza il Passo 5 è il mittente: resterà un indirizzo di Supabase tipo `noreply@mail.app.supabase.io`. Per far arrivare le email da un tuo indirizzo serve l'SMTP personalizzato.

---

## Passo 5 (facoltativo) — Email vere

Se vuoi tenere accesa la conferma dell'email, o semplicemente vuoi che i messaggi di recupero password arrivino sempre, collega un servizio di posta al posto di quello integrato.

**Project Settings** → **Authentication** → **SMTP Settings** → attiva **Enable Custom SMTP** e inserisci i dati di un servizio gratuito come Resend o Brevo (entrambi hanno un piano che basta e avanza per un gruppo di amici).

Senza questo passaggio il recupero password funziona lo stesso, ma la posta integrata di Supabase limita a **pochi messaggi all'ora su tutto il progetto**: se tre persone dimenticano la password nello stesso pomeriggio, l'ultima aspetta.

---

## Cosa succede a chi usava l'app prima

Le recensioni già scritte hanno un vecchio identificativo. Al primo accesso con email, se sul telefono c'è ancora la vecchia identità, l'app se ne accorge e chiede: *"Su questo telefono risultano N cagate registrate come Bibi. Le collego a questo profilo?"* — un tocco e tornano tue, modificabili ed eliminabili.

Se hai già cambiato telefono e la vecchia identità è persa, quelle recensioni restano visibili con il tuo nome ma appartengono a un profilo che non esiste più. Il gestore può sistemarle a mano dal database:

```sql
update recensioni set autore_id = 'IDENTIFICATIVO_NUOVO'
where autore_id = 'identificativo-vecchio';
```

## Se qualcosa non va

| Sintomo | Rimedio |
|---|---|
| *"Devi prima confermare l'email"* | Non hai fatto il Passo 1, oppure conferma l'email dalla posta |
| Il link di recupero password apre una pagina che non funziona | Site URL e Redirect URLs del Passo 2 |
| L'email di recupero non arriva | Guarda nello spam; se il gruppo è numeroso, fai il Passo 5 |
| *"new row violates row-level security policy"* quando salvi | Sei uscito dal profilo: rientra con email e password |
| La modalità gestore non si accende | L'identificativo nella tabella `gestori` non corrisponde: ricopialo da Io |
| *"Too many requests"* alla creazione del profilo | Supabase limita le iscrizioni ravvicinate: aspetta qualche minuto |

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
-- viaggi: mezzo, compagnia e le due città della tratta
alter table recensioni add column if not exists mezzo text;
alter table recensioni add column if not exists compagnia text;
alter table recensioni add column if not exists citta_da text;
alter table recensioni add column if not exists citta_a text;

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

## Sistemare una recensione finita nel posto sbagliato

Se una recensione è stata agganciata al posto sbagliato — succedeva con gli eventi registrati dentro casa, prima della correzione — si stacca con una riga. Prendi l'identificativo dalla recensione (Table Editor, colonna `id`):

```sql
-- un evento che deve avere un posto tutto suo
update recensioni set luogo_id = 'e' || substr(md5(random()::text),1,12)
where id = 'ID_DELLA_RECENSIONE';
```

Se più recensioni sono dello stesso evento e devono stare insieme, dai a tutte lo stesso `luogo_id`.

---

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


---

# Parte 6 — Prepararsi al pubblico

Finché siete un gruppo di amici le regole del Passo 3 bastano. Se un giorno l'indirizzo gira fuori dal gruppo, servono queste: chiudono la modifica delle recensioni altrui e mettono un tetto alle proposte di rinomina. **SQL Editor**, una volta sola.

```sql
-- ============ 1. posti che non ci sono più ============
create table if not exists luoghi_stato (
  luogo_id text primary key,
  presente  boolean not null default true,
  da_id     text,
  da_nome   text,
  ts        bigint
);
alter table luoghi_stato enable row level security;
create policy "tutti leggono gli stati"  on luoghi_stato for select using (true);
create policy "segna chi ha un profilo"  on luoghi_stato for insert with check (auth.uid() is not null);
create policy "riaccende chi ha un profilo" on luoghi_stato for update
  using (auth.uid() is not null) with check (auth.uid() is not null);

-- ============ 2. la cacca si mette con una funzione, non modificando la riga ============
create or replace function reagisci(p_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid text := auth.uid()::text;
  v_chi jsonb;
begin
  if v_uid is null then raise exception 'serve un profilo'; end if;
  select coalesce(voti_reaz, '[]'::jsonb) into v_chi
    from (select coalesce(reaz->'💩','[]'::jsonb) as voti_reaz from recensioni where id = p_id) t;
  if v_chi ? v_uid then
    update recensioni
       set reaz = jsonb_set(coalesce(reaz,'{}'::jsonb), '{💩}', (v_chi - v_uid))
     where id = p_id;
  else
    update recensioni
       set reaz = jsonb_set(coalesce(reaz,'{}'::jsonb), '{💩}', (v_chi || to_jsonb(v_uid)))
     where id = p_id;
  end if;
end $$;
revoke all on function reagisci(text) from public;
grant execute on function reagisci(text) to authenticated;

-- ============ 3. rinominare un posto: solo il battezzatore o un gestore ============
create or replace function rinomina_luogo(p_luogo_id text, p_nome text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid text := auth.uid()::text;
  v_primo text;
begin
  if v_uid is null then raise exception 'serve un profilo'; end if;
  select autore_id into v_primo
    from recensioni where luogo_id = p_luogo_id order by creato asc limit 1;
  if v_primo is distinct from v_uid
     and not exists (select 1 from gestori g where g.uid = auth.uid()) then
    raise exception 'solo chi ha battezzato il posto può rinominarlo';
  end if;
  update recensioni set luogo = p_nome where luogo_id = p_luogo_id;
end $$;
revoke all on function rinomina_luogo(text, text) from public;
grant execute on function rinomina_luogo(text, text) to authenticated;

-- ============ 4. si modificano solo le proprie recensioni ============
drop policy if exists "aggiorna chi ha un profilo" on recensioni;
create policy "modifica le tue" on recensioni
  for update
  using (
    autore_id = auth.uid()::text
    or exists (select 1 from gestori g where g.uid = auth.uid())
  )
  with check (
    autore_id = auth.uid()::text
    or exists (select 1 from gestori g where g.uid = auth.uid())
  );

-- ============ 5. massimo tre proposte di rinomina al giorno ============
create or replace function limite_proposte()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from proposte
       where da_id = new.da_id and ts > (extract(epoch from now())*1000 - 86400000)) >= 3 then
    raise exception 'troppe proposte: massimo tre al giorno';
  end if;
  return new;
end $$;
drop trigger if exists tre_proposte_al_giorno on proposte;
create trigger tre_proposte_al_giorno before insert on proposte
  for each row execute function limite_proposte();
```

**Cosa cambia dopo questo blocco**

| Azione | Prima | Dopo |
|---|---|---|
| Modificare la propria recensione | ✅ | ✅ |
| Modificare quella di un altro | ✅ (chiunque con un profilo) | ❌ solo il gestore |
| Mettere la cacca | scriveva dentro la riga altrui | funzione controllata sul server |
| Rinominare un posto | chiunque | solo il battezzatore o il gestore |
| Proposte di rinomina | infinite | tre al giorno a persona |
| Segnare un bagno come sparito | — | chiunque abbia un profilo, ed è reversibile |

⚠️ **Lancia questo blocco insieme alla pubblicazione della versione che lo usa**, non prima: le versioni precedenti dell'app mettevano la cacca scrivendo direttamente nella riga, e con la regola nuova quella scrittura verrebbe rifiutata.

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

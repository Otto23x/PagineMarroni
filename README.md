# Merdiano 🧭💩

La mappa mondiale delle cagate. App a pagina unica, installabile, con recensioni condivise fra amici.

## Cosa c'è dentro

| File | A cosa serve |
|---|---|
| `index.html` | Tutta l'app: interfaccia, logica, mappa. Nessun build step. |
| `manifest.json` | Nome, icone, colori: serve per l'installazione sul telefono. |
| `sw.js` | Service worker: guscio in cache, funziona anche senza rete. |
| `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | Icone dell'app. |
| `index-supabase.html` | La stessa app con backend condiviso vero (vedi `CONDIVISIONE.md`). |
| `PUBBLICARE.md` | **Guida passo passo** per pubblicare con il database condiviso. |
| `README.md` | Questo file. |

## Partire dal repo

```bash
git clone https://github.com/<utente>/<repo>.git merdiano
cd merdiano
```

Non c'è niente da installare né da compilare: sono file statici.

## Provarla subito

Aprendo `index.html` con doppio clic funziona quasi tutto, ma **geolocalizzazione, installazione e service worker richiedono HTTPS** (o `localhost`). Per una prova locale:

```bash
cd merdiano
python3 -m http.server 8080
# poi apri http://localhost:8080
```

## Metterla online (5 minuti, gratis)

Qualunque hosting statico va bene. I più rapidi:

- **Netlify Drop** — vai su app.netlify.com/drop e trascina la cartella. Fatto.
- **Vercel** — `npx vercel` dentro la cartella.
- **GitHub Pages** — carica i file nella radice del repo, poi Settings → Pages → Source: branch `main`, cartella `/ (root)`. Tutti i percorsi dell'app sono relativi, quindi funziona anche nel sottopercorso `utente.github.io/nome-repo/`.
- **Cloudflare Pages** — collega il repo, nessuna configurazione.

Poi apri il link dal telefono: Chrome propone "Installa app", su iPhone si fa da Condividi → "Aggiungi alla schermata Home".

## Dove finiscono i dati

L'app usa un livello di archiviazione con due modalità:

1. **Dentro un artifact di Claude** usa lo storage condiviso integrato: tutti quelli che aprono l'artifact vedono le stesse recensioni. Zero configurazione.
2. **Ospitata altrove** ricade su `localStorage`, quindi i dati restano sul singolo dispositivo.

Per condividere davvero le recensioni su un dominio tuo usa **`index-supabase.html`**: è la stessa app con un database vero al posto dello storage locale. Devi solo incollare due chiavi. Istruzioni complete, file per file, in [`PUBBLICARE.md`](PUBBLICARE.md).

## Note

- Le foto vengono ridimensionate a 900 px e compresse in JPEG prima del salvataggio, così restano leggere.
- Il nome del posto viene suggerito da Nominatim (OpenStreetMap); se non risponde, si scrive a mano.
- Le tessere della mappa hanno tre provider di riserva; se cadono tutti, i pin restano posizionati su una griglia di meridiani e paralleli.

# Merdiano 🧭💩

La mappa mondiale delle cagate. App a pagina unica, installabile, con recensioni condivise fra amici.

## Cosa c'è dentro

| File | A cosa serve |
|---|---|
| `index.html` | Tutta l'app: interfaccia, logica, mappa. Nessun build step. |
| `manifest.json` | Nome, icone, colori: serve per l'installazione sul telefono. |
| `sw.js` | Service worker: guscio in cache, funziona anche senza rete. |
| `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | Icone dell'app. |

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
- **GitHub Pages** — carica i file in un repo, Settings → Pages → branch `main`.
- **Cloudflare Pages** — collega il repo, nessuna configurazione.

Poi apri il link dal telefono: Chrome propone "Installa app", su iPhone si fa da Condividi → "Aggiungi alla schermata Home".

## Dove finiscono i dati

L'app usa un livello di archiviazione con due modalità:

1. **Dentro un artifact di Claude** usa lo storage condiviso integrato: tutti quelli che aprono l'artifact vedono le stesse recensioni. Zero configurazione.
2. **Ospitata altrove** ricade su `localStorage`, quindi i dati restano sul singolo dispositivo.

Per condividere davvero le recensioni fra amici su un dominio tuo, sostituisci le due funzioni `leggi()` e `scrivi()` in `index.html` (sezione *2. Deposito dati*) con chiamate a un backend. Con Supabase bastano una tabella `recensioni` e una `foto`, più queste due funzioni riscritte: il resto dell'app non cambia di una riga.

## Note

- Le foto vengono ridimensionate a 900 px e compresse in JPEG prima del salvataggio, così restano leggere.
- Il nome del posto viene suggerito da Nominatim (OpenStreetMap); se non risponde, si scrive a mano.
- Le tessere della mappa hanno tre provider di riserva; se cadono tutti, i pin restano posizionati su una griglia di meridiani e paralleli.

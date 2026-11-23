# Casale Giselle — guida passo passo per mettere online il sito

Questa guida è pensata per chi non è programmatore. Segui i passi in ordine: ognuno richiede pochi minuti. Tutti i servizi usati sono **gratuiti** (paghi solo il dominio, circa 10–20 € l'anno).

---

## Cosa c'è nella cartella

| Cartella / file | A cosa serve |
|---|---|
| `site/index.html` | Homepage in italiano |
| `site/en/index.html` | Homepage in inglese |
| `site/privacy.html` e `site/en/privacy.html` | Informativa privacy e cookie (IT / EN) |
| `site/assets/img/` | Le 22 foto del sito |
| `site/assets/css/style.css` | Colori, caratteri e impaginazione |
| `site/assets/js/main.js` | Calendario, recensioni, invio del modulo. **Qui va la chiave di Web3Forms** e qui si cambiano i prezzi indicativi |
| `netlify/functions/disponibilita.mjs` | Il "ponte" che legge i calendari di Airbnb e Booking |
| `netlify.toml` | Impostazioni per Netlify (non va toccato) |

Per modificare un file di testo basta aprirlo con **Blocco note** (tasto destro → Apri con → Blocco note).

---

## Passo 1 — La chiave del modulo contatti (Web3Forms)

Il modulo "Contatti" invia le richieste a **casalegiselle@gmail.com** tramite Web3Forms (non serve creare un account).

1. Vai su **web3forms.com** e clicca **Create your Access Key**.
2. Inserisci `casalegiselle@gmail.com` e conferma.
3. Ti arriva un'email con una **Access Key** (una serie di lettere e numeri come `a1b2c3d4-...`).
4. Apri `site/assets/js/main.js` con Blocco note. In alto trovi:
   ```
   const WEB3FORMS_ACCESS_KEY = "INCOLLA-QUI-LA-ACCESS-KEY-DI-WEB3FORMS";
   ```
   Sostituisci il testo tra virgolette con la tua chiave (le virgolette restano). Salva.

> La chiave non è una password: è normale che stia nel sito. Nelle impostazioni di Web3Forms puoi limitare l'uso al solo dominio `casalegiselle.it`.

**Prezzi indicativi:** nello stesso file, subito sotto, c'è la riga `const PREZZI = { 1: 50, 2: 80, ... }`: il numero prima dei due punti sono gli ospiti, quello dopo il prezzo a notte. Se li cambi, aggiorna anche la scritta "da 50 € a notte" nella barra in fondo di `index.html` e `en/index.html`.

---

## Passo 2 — Completa l'informativa privacy

Apri `site/privacy.html` e `site/en/privacy.html` e cerca `[Nome e cognome del titolare]` (in inglese `[Full name of the data controller]`): sostituiscilo con il nome reale del titolare. Sul sito questo punto è evidenziato in giallo finché non lo cambi; dopo averlo cambiato puoi anche togliere `class="todo"` per eliminare l'evidenziazione.

Ricorda la nota del documento originale: fai controllare il testo a un consulente privacy o confrontalo con un generatore come iubenda.

Nel footer il link **Instagram** porta già al profilo @casalegiselle.

---

## Passo 3 — Copia i link iCal di Airbnb e Booking

Ti serviranno al passo 5. Incollali per ora in un file di testo.

**Airbnb** (da computer): Calendario → scegli l'annuncio → pannello **Disponibilità** → **Collega calendari** (o "Sincronizza calendari") → **Esporta calendario** → copia il link (finisce con `.ics`).

**Booking.com** (Extranet): **Tariffe e disponibilità** → **Sincronizza calendari** → **Esporta calendario** (o "Aggiungi connessione calendario") → copia il link.

> I nomi dei menu possono cambiare leggermente: cerca sempre la voce "esporta calendario" / "iCal".

Il sito mostra come occupate tutte le notti presenti nei due calendari, comprese le date che blocchi a mano. Si aggiorna da solo ogni 30 minuti circa.

---

## Passo 4 — Carica il sito su GitHub (l'archivio da cui Netlify pubblica)

Usiamo GitHub perché il calendario ha bisogno di una piccola funzione che Netlify attiva solo così; in più, ogni modifica futura si pubblica da sola.

1. Crea un account gratuito su **github.com**.
2. In alto a destra: **+** → **New repository**. Nome: `casale-giselle`. Scegli **Private**. Clicca **Create repository**.
3. Nella pagina che si apre clicca il link **uploading an existing file**.
4. Apri la cartella `casale-giselle` sul tuo computer, seleziona **tutto il suo contenuto** (le cartelle `site` e `netlify`, i file `netlify.toml` e `GUIDA.md`) e trascinalo nella pagina di GitHub. Usa Chrome o Edge, che caricano anche le sottocartelle.
5. Attendi il caricamento e clicca **Commit changes**.

---

## Passo 5 — Pubblica su Netlify

1. Vai su **netlify.com** → **Sign up** → **Continue with GitHub** (così i due servizi si collegano).
2. **Add new site** (o "Add new project") → **Import an existing project** → **GitHub** → autorizza → scegli `casale-giselle`.
3. Le impostazioni si compilano da sole grazie a `netlify.toml` (cartella di pubblicazione: `site`). Clicca **Deploy**.
4. Dopo un minuto il sito è online a un indirizzo provvisorio tipo `nome-a-caso.netlify.app`.
5. Inserisci i link del calendario: **Site configuration** → **Environment variables** → **Add a variable**:
   - Key `AIRBNB_ICAL_URL` → Value: il link di Airbnb
   - Key `BOOKING_ICAL_URL` → Value: il link di Booking
6. Vai in **Deploys** → **Trigger deploy** → **Deploy site** (serve per far leggere le nuove variabili).
7. Controllo: apri `https://nome-a-caso.netlify.app/api/disponibilita`. Devi vedere un testo con `"booked": [...]` e `"airbnb": "ok"`, `"booking": "ok"`. Se vedi `"errore"`, ricontrolla il link copiato.

---

## Passo 6 — Collega il dominio casalegiselle.it

**Se non hai ancora il dominio:** acquistalo da un registrar italiano (per esempio Aruba, Register.it o OVH). Verifica prima che sia libero.

Poi su Netlify: **Domain management** → **Add a domain** → scrivi `casalegiselle.it` → **Verify** → **Add domain**.

Netlify ti propone due strade. Scegline una:

**A) La più semplice — usa i DNS di Netlify**
1. Netlify ti mostra 4 indirizzi tipo `dns1.p0X.nsone.net`.
2. Nel pannello del registrar, cerca **Gestione DNS / Server DNS (nameserver)**, scegli "usa DNS personalizzati" e inserisci i 4 indirizzi di Netlify al posto di quelli esistenti.

**B) Mantieni i DNS del registrar**
Nel pannello DNS del registrar crea (o modifica) questi due record:

| Tipo | Nome | Valore |
|---|---|---|
| A | `@` (oppure vuoto) | `75.2.60.5` |
| CNAME | `www` | `nome-a-caso.netlify.app` |

Usa sempre i valori che Netlify ti mostra in quel momento, se sono diversi da questi.

**Attenzione:** se usi la casella email del dominio (es. info@casalegiselle.it), prima di cambiare i nameserver (strada A) chiedi al registrar o scrivimi: i record della posta vanno ricopiati su Netlify. Con Gmail (`casalegiselle@gmail.com`) non c'è nessun problema.

La propagazione richiede da pochi minuti a 48 ore. Quando è pronta, Netlify attiva da solo il **lucchetto HTTPS** (Domain management → HTTPS: deve comparire "Your site has HTTPS enabled"). L'indirizzo `www.casalegiselle.it` viene rimandato automaticamente su `casalegiselle.it`.

---

## Passo 7 — Prova finale

- Apri `https://casalegiselle.it` da computer e da telefono.
- Prova il pulsante **EN** e torna a **IT**.
- Controlla che le date occupate su Airbnb/Booking compaiano barrate nel calendario.
- Invia una richiesta di prova dal modulo **Contatti** con la tua email: deve arrivare a casalegiselle@gmail.com entro un minuto. **La prima volta controlla la cartella Spam** e segna il messaggio come "Non spam".

---

## Passo 8 — Far comparire il sito su Google

1. **Google Search Console** (search.google.com/search-console): accedi con casalegiselle@gmail.com → **Aggiungi proprietà** → **Dominio** → scrivi `casalegiselle.it`. Google ti dà un codice `google-site-verification=...`: su Netlify vai in **Domain management → casalegiselle.it → DNS settings → Add new record**, tipo **TXT**, nome `@`, valore = il codice. Torna su Search Console e premi **Verifica**.
2. In Search Console: **Sitemap** → scrivi `sitemap.xml` → **Invia**.
3. **Controllo URL** → incolla `https://casalegiselle.it/` → **Richiedi indicizzazione**. Fai lo stesso con `https://casalegiselle.it/en/`.
4. **Google Business Profile** (business.google.com): crea la scheda "Casale Giselle", categoria "Casa vacanze", con foto, telefono e sito `https://casalegiselle.it`. È la scheda con mappa e recensioni che compare a destra (o in alto su telefono).
5. Metti il link `casalegiselle.it` nella bio di Instagram @casalegiselle e ovunque potete (Facebook, Pro Loco, portali turistici dell'Abruzzo).

## Come fare modifiche in futuro

1. Su github.com apri il repository `casale-giselle`, entra nel file da cambiare (per esempio `site/index.html`) e clicca la **matita** (Edit).
2. Modifica il testo, poi **Commit changes**.
3. Netlify ripubblica il sito da solo in circa un minuto.

Ricorda: ogni testo esiste in due versioni, `site/index.html` (italiano) e `site/en/index.html` (inglese).

Per sostituire una foto: carica la nuova foto in `site/assets/img/` **con lo stesso nome** di quella vecchia (Add file → Upload files).

---

## Riepilogo costi

| Servizio | Costo |
|---|---|
| Netlify (hosting + calendario) | Gratis |
| GitHub | Gratis |
| Web3Forms (modulo) | Gratis, con un limite mensile di messaggi più che sufficiente per una casa vacanze |
| Dominio casalegiselle.it | ~10–20 € l'anno presso il registrar |

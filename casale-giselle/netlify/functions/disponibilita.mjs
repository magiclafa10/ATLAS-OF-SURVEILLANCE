/*
  Casale Giselle — calendario disponibilità
  -----------------------------------------
  Questa piccola funzione gira sui server di Netlify. Legge i calendari iCal
  di Airbnb e Booking e restituisce al sito l'elenco delle notti occupate.

  I link iCal NON stanno qui dentro: si inseriscono su Netlify in
  Site configuration → Environment variables, con questi nomi:
    AIRBNB_ICAL_URL   = link "Esporta calendario" di Airbnb
    BOOKING_ICAL_URL  = link "Esporta calendario" di Booking
  (Puoi aggiungerne un terzo con EXTRA_ICAL_URL, per esempio un calendario Google.)

  Il risultato resta in memoria per 30 minuti, così Airbnb e Booking
  non vengono interrogati a ogni visita.
*/

const SOURCES = [
  ["airbnb", "AIRBNB_ICAL_URL"],
  ["booking", "BOOKING_ICAL_URL"],
  ["extra", "EXTRA_ICAL_URL"],
];

const pad = (n) => String(n).padStart(2, "0");
const toIso = (d) => d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate());

// Trasforma "20261205" o "20261205T140000Z" in una data (solo giorno)
function parseIcalDate(value) {
  const m = /^(\d{4})(\d{2})(\d{2})/.exec(value || "");
  return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : null;
}

// Legge il testo .ics e restituisce le notti occupate
function bookedNights(ics) {
  const nights = [];
  const text = ics.replace(/\r?\n[ \t]/g, ""); // righe spezzate
  const events = text.split("BEGIN:VEVENT").slice(1);
  for (const ev of events) {
    const start = parseIcalDate((/^DTSTART[^:]*:(.+)$/m.exec(ev) || [])[1]);
    let end = parseIcalDate((/^DTEND[^:]*:(.+)$/m.exec(ev) || [])[1]);
    if (!start) continue;
    if (!end || end <= start) end = new Date(start.getTime() + 86400000);
    // La notte del giorno di partenza resta libera (check-out al mattino)
    for (let d = new Date(start); d < end; d = new Date(d.getTime() + 86400000)) {
      nights.push(toIso(d));
      if (nights.length > 5000) break;
    }
  }
  return nights;
}

let cache = { at: 0, body: null };
const CACHE_MS = 30 * 60 * 1000;

export default async () => {
  if (cache.body && Date.now() - cache.at < CACHE_MS) {
    return json(cache.body);
  }

  const booked = new Set();
  const sources = {};
  await Promise.all(
    SOURCES.map(async ([name, envVar]) => {
      const url = process.env[envVar];
      if (!url) return;
      try {
        const res = await fetch(url, {
          headers: { "User-Agent": "CasaleGiselle-Calendar/1.0" },
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const nights = bookedNights(await res.text());
        nights.forEach((n) => booked.add(n));
        sources[name] = "ok";
      } catch (err) {
        console.error("Calendario " + name + " non letto:", err.message);
        sources[name] = "errore";
      }
    })
  );

  const ok = Object.values(sources).some((s) => s === "ok");
  const today = toIso(new Date());
  const body = {
    booked: [...booked].filter((d) => d >= today).sort(),
    sources: ok ? sources : null,
    updated: new Date().toISOString(),
  };
  if (ok) cache = { at: Date.now(), body };
  return json(body);
};

function json(body) {
  return new Response(JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=900",
    },
  });
}

export const config = { path: "/api/disponibilita" };

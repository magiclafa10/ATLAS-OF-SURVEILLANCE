/* =========================================================
   Casale Giselle — script del sito
   ========================================================= */

/* ---- IMPOSTAZIONI DA MODIFICARE ---------------------------------------
   1) Incolla qui la "Access Key" che Web3Forms ti manda per email.
   2) Prezzi indicativi a notte per numero di ospiti (tutta la casa).     */
const WEB3FORMS_ACCESS_KEY = "d3da802b-c089-4caa-a121-c4e8a5fd2386";
const PREZZI = { 1: 50, 2: 80, 3: 110, 4: 130, 5: 160, 6: 180, 7: 200 };
const MESI_PRENOTABILI = 18; // quanti mesi in avanti mostra il calendario
/* ---------------------------------------------------------------------- */

/* ---------- Effetti di entrata: gli elementi compaiono in dissolvenza ---------- */
window.__reveal = true;
(function () {
  const root = document.documentElement;
  if (!root.classList.contains("anim") || !("IntersectionObserver" in window)) {
    root.classList.remove("anim");
    return;
  }
  // Gruppi di elementi: quelli dello stesso gruppo entrano uno dopo l'altro
  const groups = [
    [".welcome h2, .welcome .text", 0.15],
    [".rooms article", 0.12],
    [".services h2", 0], [".services .item", 0.1],
    [".availability .head", 0], [".calendar-box, .summary-box", 0.15],
    [".gallery h2", 0], [".gallery .grid img", 0.08],
    [".places h2", 0], [".places li", 0.1],
    [".contact form", 0],
    [".map", 0], [".site-footer .inner", 0]
  ];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

  groups.forEach(([sel, step]) => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add("reveal");
      el.style.setProperty("--d", Math.min(i % 6, 5) * step + "s");
      io.observe(el);
    });
  });
  document.querySelectorAll(".house-banner, .reviews-banner").forEach((el) => io.observe(el));
})();

const LANG = document.documentElement.lang === "en" ? "en" : "it";
const T = {
  it: {
    months: ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"],
    short: ["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"],
    weekdays: ["LU","MA","ME","GI","VE","SA","DO"],
    booked: ", occupato", past: ", data passata", free: ", libero",
    perNight: " € a notte per ", guest1: " ospite", guestN: " ospiti", night1: " notte", nightN: " notti",
    noDates: "Nessuna data scelta", tapIn: "Toccate il giorno di arrivo sul calendario.",
    arrival: "Arrivo il ", tapOut: "Ora toccate il giorno di partenza.",
    from: "Dal ", to: " al ",
    rangeHint: "",
    overlap: "Tra queste date ci sono notti già occupate: scegliete un altro periodo.",
    loading: "Caricamento disponibilità…",
    updated: "Disponibilità aggiornata da Airbnb e Booking",
    offline: "Calendario non sincronizzato in questo momento: le date verranno confermate via mail.",
    sending: "Invio in corso…",
    sent: "Grazie! Abbiamo ricevuto la vostra richiesta: vi risponderemo via mail entro poche ore.",
    error: "Non siamo riusciti a inviare il messaggio. Riprovate oppure scriveteci a casalegiselle@gmail.com o su WhatsApp.",
    invalid: "Compilate i campi obbligatori (*) e accettate l'informativa privacy.",
    datesOrder: "La data di partenza deve essere successiva all'arrivo.",
    subject: "Nuova richiesta dal sito — Casale Giselle"
  },
  en: {
    months: ["January","February","March","April","May","June","July","August","September","October","November","December"],
    short: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    weekdays: ["MO","TU","WE","TH","FR","SA","SU"],
    booked: ", booked", past: ", past date", free: ", available",
    perNight: " € per night for ", guest1: " guest", guestN: " guests", night1: " night", nightN: " nights",
    noDates: "No dates selected", tapIn: "Tap your check-in day on the calendar.",
    arrival: "Check-in on ", tapOut: "Now tap your check-out day.",
    from: "From ", to: " to ",
    rangeHint: "",
    overlap: "Some nights in this period are already booked: please choose other dates.",
    loading: "Loading availability…",
    updated: "Availability synced with Airbnb and Booking",
    offline: "The calendar can't be synced right now: we'll confirm your dates by email.",
    sending: "Sending…",
    sent: "Thank you! We've received your request and will reply by email within a few hours.",
    error: "We couldn't send your message. Please try again, or write to casalegiselle@gmail.com or on WhatsApp.",
    invalid: "Please fill in the required fields (*) and accept the privacy policy.",
    datesOrder: "The check-out date must be after check-in.",
    subject: "New request from the website — Casale Giselle"
  }
}[LANG];

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

/* ---------- Date utility (sempre in ora locale, formato AAAA-MM-GG) ---------- */
const pad = (n) => String(n).padStart(2, "0");
const iso = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
const nightsBetween = (a, b) => Math.round((parse(b) - parse(a)) / 86400000);
const nice = (s) => { const d = parse(s); return d.getDate() + " " + T.short[d.getMonth()]; };
const TODAY = iso(new Date());

/* ---------- Menu mobile ---------- */
const toggle = $(".menu-toggle");
const nav = $("#main-nav");
if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }
  });
}

/* ---------- Calendario disponibilità ---------- */
const state = { start: null, end: null, guests: 2, offset: 0, booked: new Set() };
const monthsEl = $("#months");

function isBooked(s) { return state.booked.has(s); }
function rangeFree(a, b) { for (let d = a; d < b; d = addDays(d, 1)) if (isBooked(d)) return false; return true; }
function firstBookedAfter(a) {
  for (let i = 1; i <= 366; i++) { const d = addDays(a, i); if (isBooked(d)) return d; }
  return null;
}

function renderCalendar() {
  if (!monthsEl) return;
  const base = new Date(); base.setDate(1); base.setMonth(base.getMonth() + state.offset);
  const checkoutLimit = state.start && !state.end ? firstBookedAfter(state.start) : null;
  monthsEl.innerHTML = "";
  for (let k = 0; k < 2; k++) {
    const first = new Date(base.getFullYear(), base.getMonth() + k, 1);
    const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const lead = (first.getDay() + 6) % 7; // lunedì = 0
    const box = document.createElement("div");
    box.className = "month";
    const title = T.months[first.getMonth()] + " " + first.getFullYear();
    let html = '<h3>' + title + '</h3><div class="weekdays" aria-hidden="true">' +
      T.weekdays.map((w) => "<span>" + w + "</span>").join("") + '</div><div class="days">';
    for (let i = 0; i < lead; i++) html += "<span></span>";
    for (let d = 1; d <= days; d++) {
      const s = first.getFullYear() + "-" + pad(first.getMonth() + 1) + "-" + pad(d);
      const past = s < TODAY;
      const booked = isBooked(s);
      // Il primo giorno occupato dopo l'arrivo si può scegliere come partenza
      const asCheckout = checkoutLimit === s;
      const edge = s === state.start || s === state.end;
      const inRange = state.start && state.end && s > state.start && s < state.end;
      let cls = "day", dis = false, label = d + " " + T.months[first.getMonth()].toLowerCase();
      if (past) { cls += " past"; dis = true; label += T.past; }
      else if (edge) { cls += " edge"; }
      else if (booked && !asCheckout) { cls += " booked"; dis = true; label += T.booked; }
      else if (inRange) { cls += " range"; }
      html += '<button type="button" class="' + cls + '" data-d="' + s + '"' + (dis ? " disabled" : "") +
        (edge ? ' aria-pressed="true"' : "") + ' aria-label="' + label + '">' + d + "</button>";
    }
    html += "</div>";
    box.innerHTML = html;
    monthsEl.appendChild(box);
  }
  $("#cal-prev").disabled = state.offset <= 0;
  $("#cal-next").disabled = state.offset >= MESI_PRENOTABILI - 2;
}

function renderSummary() {
  const g = state.guests;
  const price = PREZZI[g];
  $("#g-count").textContent = g;
  $("#g-less").disabled = g <= 1;
  $("#g-more").disabled = g >= 7;
  $("#nightly").textContent = price + T.perNight + g + (g === 1 ? T.guest1 : T.guestN);
  const nWord = (n) => n + (n === 1 ? T.night1 : T.nightN);
  let summary = T.noDates, hint = T.tapIn, total = null;
  if (state.start && !state.end) { summary = T.arrival + nice(state.start); hint = T.tapOut; }
  else if (state.start && state.end) {
    const n = nightsBetween(state.start, state.end);
    summary = T.from + nice(state.start) + T.to + nice(state.end) + ", " + nWord(n);
    hint = price + " € × " + nWord(n) + T.rangeHint;
    total = price * n;
  }
  $("#summary").textContent = summary;
  $("#hint").textContent = hint;
  $("#total-row").hidden = total === null;
  if (total !== null) $("#total").textContent = total.toLocaleString(LANG === "en" ? "en-GB" : "it-IT") + " €";
}

function render() { renderCalendar(); renderSummary(); }

function pick(s) {
  if (!state.start || state.end || s <= state.start) {
    if (isBooked(s)) return;
    state.start = s; state.end = null;
  } else if (rangeFree(state.start, s)) {
    state.end = s;
  } else {
    state.start = isBooked(s) ? null : s; state.end = null;
  }
  render();
}

function goToMonth(s) {
  const d = parse(s), now = new Date();
  const diff = (d.getFullYear() - now.getFullYear()) * 12 + d.getMonth() - now.getMonth();
  state.offset = Math.max(0, Math.min(MESI_PRENOTABILI - 2, diff));
}

if (monthsEl) {
  monthsEl.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-d]");
    if (b && !b.disabled) pick(b.dataset.d);
  });
  $("#cal-prev").addEventListener("click", () => { state.offset--; renderCalendar(); });
  $("#cal-next").addEventListener("click", () => { state.offset++; renderCalendar(); });
  $("#g-less").addEventListener("click", () => { state.guests = Math.max(1, state.guests - 1); renderSummary(); });
  $("#g-more").addEventListener("click", () => { state.guests = Math.min(7, state.guests + 1); renderSummary(); });
  $("#cal-reset").addEventListener("click", () => { state.start = state.end = null; render(); });

  // "Invia richiesta": copia date e ospiti nel modulo contatti
  $("#to-contact").addEventListener("click", () => {
    if (state.start) $("#c-in").value = state.start;
    if (state.end) $("#c-out").value = state.end;
    $("#c-guests").value = String(state.guests);
  });

  render();
  const status = $("#cal-status");
  status.textContent = T.loading;
  fetch("/api/disponibilita", { headers: { Accept: "application/json" } })
    .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then((data) => {
      state.booked = new Set(data.booked || []);
      status.textContent = data.sources ? T.updated : T.offline;
      render();
    })
    .catch(() => { status.textContent = T.offline; });
}

/* ---------- Modulo rapido in alto ---------- */
const quick = $("#quick-form");
if (quick) {
  ["#q-in", "#q-out", "#c-in", "#c-out"].forEach((id) => { const el = $(id); if (el) el.min = TODAY; });
  $("#q-in").addEventListener("change", (e) => { $("#q-out").min = e.target.value ? addDays(e.target.value, 1) : TODAY; });
  quick.addEventListener("submit", (e) => {
    e.preventDefault();
    const a = $("#q-in").value, b = $("#q-out").value;
    state.guests = Number($("#q-guests").value) || 2;
    state.start = null; state.end = null;
    if (a && a >= TODAY && !isBooked(a)) {
      state.start = a;
      if (b && b > a && rangeFree(a, b)) state.end = b;
      goToMonth(a);
    }
    render();
    if (a && b && b > a && !rangeFree(a, b)) $("#hint").textContent = T.overlap;
    $("#disponibilita").scrollIntoView();
  });
}

/* ---------- Recensioni ---------- */
const slides = $$("#reviews .slide");
const dots = $$("#reviews .dots button");
const banner = $("#reviews");
let current = 0;
function showReview(i) {
  current = i;
  slides.forEach((s, k) => { s.hidden = k !== i; });
  dots.forEach((d, k) => d.setAttribute("aria-pressed", k === i ? "true" : "false"));
  banner.style.backgroundColor = slides[i].dataset.bg;
  const img = $("#rev-img");
  const src = slides[i].dataset.img;
  if (img && src) img.src = (LANG === "en" ? "../" : "") + src;
}
dots.forEach((d, i) => d.addEventListener("click", () => showReview(i)));

/* ---------- Modulo contatti → Web3Forms → casalegiselle@gmail.com ---------- */
const form = $("#contact-form");
if (form) {
  const msg = $("#form-msg");
  const show = (text, ok) => { msg.hidden = false; msg.textContent = text; msg.className = "form-msg " + (ok ? "ok" : "err"); };
  $("#c-in").addEventListener("change", (e) => { $("#c-out").min = e.target.value ? addDays(e.target.value, 1) : TODAY; });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); show(T.invalid, false); return; }
    const fd = new FormData(form);
    if (fd.get("partenza") <= fd.get("arrivo")) { show(T.datesOrder, false); return; }
    if (fd.get("botcheck")) return; // spam

    const data = {
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: T.subject,
      from_name: "Sito Casale Giselle",
      name: fd.get("nome"),
      email: fd.get("email"),
      Nome: fd.get("nome"),
      Email: fd.get("email"),
      Arrivo: fd.get("arrivo"),
      Partenza: fd.get("partenza"),
      Notti: nightsBetween(fd.get("arrivo"), fd.get("partenza")),
      Ospiti: fd.get("ospiti"),
      Animali: fd.get("animali"),
      Messaggio: fd.get("messaggio") || "—",
      Lingua: LANG === "en" ? "Inglese" : "Italiano",
      "Consenso privacy": "Sì"
    };
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true; show(T.sending, true);
    try {
      const r = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data)
      });
      const json = await r.json().catch(() => ({}));
      if (r.ok && json.success) { form.reset(); show(T.sent, true); }
      else throw new Error(json.message || r.status);
    } catch (err) {
      show(T.error, false);
    } finally {
      btn.disabled = false;
    }
  });
}

/* Barra fissa su telefono: nascosta quando si è già nella zona calendario/contatti */
const bar = $(".sticky-bar");
if (bar && "IntersectionObserver" in window) {
  const targets = ["#disponibilita", "#contatti"].map((s) => $(s)).filter(Boolean);
  const visible = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { en.isIntersecting ? visible.add(en.target) : visible.delete(en.target); });
    bar.style.display = visible.size ? "none" : "";
  });
  targets.forEach((t) => io.observe(t));
}

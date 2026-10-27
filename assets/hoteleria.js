/* Página /hoteleria — portada con buscador de fechas, piezas, servicios,
   ubicación y preguntas frecuentes. Todo termina en un mensaje de WhatsApp
   con las fechas, huéspedes y pieza elegidos. Datos en window.SITE.hoteleria. */
(function () {
  const root = document.getElementById("hoteleria");
  const S = window.SITE;
  const HO = S && S.hoteleria;
  if (!root || !HO) return;

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const wa = (msg) => `https://wa.me/${HO.whatsapp}?text=${encodeURIComponent(msg)}`;
  const img = (src, alt, cls = "", eager = false) =>
    `<img class="${cls}" src="${esc(src)}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" onerror="this.classList.add('is-broken')">`;
  const waIcon =
    '<svg viewBox="0 0 24 24" aria-hidden="true" class="ico"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>';
  const icoPin = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="9.5" r="2.4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
  const icoCheck = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ---------- Fechas ---------- */
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const desdeIso = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const masDias = (s, n) => { const d = desdeIso(s); d.setDate(d.getDate() + n); return iso(d); };
  const noches = (a, b) => Math.round((desdeIso(b) - desdeIso(a)) / 864e5);
  const bonita = (s) =>
    desdeIso(s).toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short" }).replace(/\./g, "");
  const hoy = iso(new Date());

  const piezas = HO.piezas || [];
  const mapaQ = HO.direccion || `${S.ciudad}, Provincia de Arauco, Chile`;

  /* ---------- Estructura ---------- */
  root.innerHTML = `
    <div class="hotel">
      <header class="hotel__hero">
        <div class="hotel__media">${img(HO.hero || piezas[0].imagen, "", "", true)}</div>
        <div class="hotel__veil"></div>
        <div class="hotel__hero-txt">
          <p class="eyebrow"><span class="num">04</span>${esc(HO.eyebrow)} · ${esc(S.ciudad)}</p>
          <h1 class="display">${esc(HO.titulo)}</h1>
          <p class="lead">${esc(HO.bajada || HO.texto)}</p>
        </div>
      </header>

      <div class="hotel__wrap">
        <form class="reserva" id="hReserva" novalidate>
          <h2 class="reserva__title">Agenda tu estadía</h2>
          <div class="reserva__grid">
            <label class="campo"><span>Llegada</span><input type="date" id="hIn" min="${hoy}" required></label>
            <label class="campo"><span>Salida</span><input type="date" id="hOut" min="${masDias(hoy, 1)}" required></label>
            <div class="campo campo--num">
              <span>Adultos</span>
              <div class="stepper" data-step="ad"><button type="button" data-d="-1" aria-label="Menos adultos">−</button><output id="hAd">2</output><button type="button" data-d="1" aria-label="Más adultos">+</button></div>
            </div>
            <div class="campo campo--num">
              <span>Niños <small>2–12</small></span>
              <div class="stepper" data-step="ni"><button type="button" data-d="-1" aria-label="Menos niños">−</button><output id="hNi">0</output><button type="button" data-d="1" aria-label="Más niños">+</button></div>
            </div>
            <label class="campo campo--wide"><span>Pieza</span>
              <select id="hPieza">
                <option value="">La que mejor nos acomode</option>
                ${piezas.map((p) => `<option value="${esc(p.tipo)}">${esc(p.tipo)} · ${esc(p.capacidad)}</option>`).join("")}
              </select>
            </label>
          </div>
          <div class="reserva__foot">
            <p class="reserva__resumen" id="hResumen" aria-live="polite">Elige tus fechas para ver el resumen.</p>
            <button type="submit" class="hbtn">${waIcon}<span>Consultar disponibilidad</span></button>
          </div>
        </form>

        <ul class="hotel__datos">
          <li><strong>${piezas.length}</strong><span>tipos de pieza</span></li>
          <li><strong>Directo</strong><span>reserva por WhatsApp</span></li>
          <li><strong>${esc(S.ciudad)}</strong><span>provincia de Arauco</span></li>
        </ul>

        <section class="hsec" id="hPiezas" aria-labelledby="hPiezasH">
          <header class="hsec__head">
            <p class="eyebrow">Alojamiento</p>
            <h2 class="display display--md" id="hPiezasH">Nuestras piezas</h2>
            <p class="hsec__lead" id="hFiltro"></p>
          </header>
          <div class="piezas">
            ${piezas
              .map(
                (p, i) => `<article class="pieza" data-max="${p.max || 99}" id="pieza-${i}">
                  <figure class="pieza__img">${img(p.imagen, "Pieza " + p.tipo)}<span class="pieza__badge" hidden></span></figure>
                  <div class="pieza__body">
                    <div class="pieza__top">
                      <h3>${esc(p.tipo)}</h3>
                      <span class="pieza__cap">${esc(p.capacidad)}</span>
                    </div>
                    ${p.descripcion ? `<p class="pieza__desc">${esc(p.descripcion)}</p>` : ""}
                    <ul class="chips">${p.caracteristicas.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>
                    <div class="pieza__foot">
                      <p class="pieza__precio"><small>Desde</small><strong>${esc(p.precio)}</strong><small>${esc(HO.moneda)} / noche</small></p>
                      <button type="button" class="hbtn hbtn--sm" data-pieza="${esc(p.tipo)}">Reservar esta pieza</button>
                    </div>
                  </div>
                </article>`
              )
              .join("")}
          </div>
          <p class="fineprint">${esc(HO.notaPrecio)}</p>
        </section>

        ${(HO.servicios || []).length
          ? `<section class="hsec hsec--servicios" aria-labelledby="hServH">
              <header class="hsec__head"><p class="eyebrow">Incluido</p><h2 class="display display--md" id="hServH">Lo que encuentras</h2></header>
              <ul class="servicios">${HO.servicios.map((s) => `<li>${icoCheck}<span>${esc(s)}</span></li>`).join("")}</ul>
            </section>`
          : ""}

        <section class="hsec" aria-labelledby="hCompH">
          <header class="hsec__head"><p class="eyebrow">Complementa tu visita</p><h2 class="display display--md" id="hCompH">Todo el ecosistema a minutos</h2></header>
          <div class="complementos">
            <a class="comp" href="/restaurante">
              ${img(S.restaurante.imagen, "Restaurante")}
              <span class="comp__txt"><small>Restaurante</small><strong>${esc(S.restaurante.titulo)}</strong><em>Ver la carta →</em></span>
            </a>
            <a class="comp" href="/centro-vacacional">
              ${img(S.vacacional.poster, "Centro vacacional")}
              <span class="comp__txt"><small>Centro vacacional</small><strong>${esc(S.vacacional.titulo)}</strong><em>Conocer Alto Tucapel →</em></span>
            </a>
          </div>
        </section>

        <section class="hsec ubicacion" aria-labelledby="hUbiH">
          <div class="ubicacion__txt">
            <p class="eyebrow">Cómo llegar</p>
            <h2 class="display display--md" id="hUbiH">Encuéntranos en ${esc(S.ciudad)}</h2>
            <p class="ubicacion__dir">${icoPin}<span>${esc(HO.direccion || `${S.ciudad}, provincia de Arauco`)}</span></p>
            ${HO.direccion ? "" : `<p class="fineprint">Dirección exacta por confirmar.</p>`}
            <div class="hacciones">
              <a class="hbtn hbtn--line" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapaQ)}" target="_blank" rel="noopener">Ver en Google Maps</a>
              <a class="hbtn hbtn--line" href="https://waze.com/ul?q=${encodeURIComponent(mapaQ)}&navigate=yes" target="_blank" rel="noopener">Abrir en Waze</a>
            </div>
          </div>
          <div class="ubicacion__mapa" id="hMapa" data-q="${esc(mapaQ)}"><span>Cargando mapa…</span></div>
        </section>

        ${(HO.faq || []).length
          ? `<section class="hsec faq" aria-labelledby="hFaqH">
              <header class="hsec__head"><p class="eyebrow">Antes de reservar</p><h2 class="display display--md" id="hFaqH">Preguntas frecuentes</h2></header>
              <div class="faq__list">${HO.faq.map((f) => `<details><summary>${esc(f.p)}</summary><p>${esc(f.r)}</p></details>`).join("")}</div>
            </section>`
          : ""}

        <section class="hcta">
          <h2 class="display display--md">¿Listo para tu estadía?</h2>
          <p>Escríbenos y te ayudamos a elegir la pieza.</p>
          <a class="hbtn hbtn--light" href="${wa(HO.mensaje)}" target="_blank" rel="noopener">${waIcon}<span>Hablar por WhatsApp</span></a>
        </section>
      </div>

      <div class="hbar" id="hBar">
        <span id="hBarTxt">Reserva directa por WhatsApp</span>
        <button type="button" class="hbtn hbtn--sm" id="hBarBtn">Reservar</button>
      </div>
    </div>`;

  const $ = (s) => root.querySelector(s);
  const inp = $("#hIn");
  const out = $("#hOut");
  const sel = $("#hPieza");
  const estado = { ad: 2, ni: 0 };

  /* ---------- Resumen y mensaje ---------- */
  const huespedes = () =>
    `${estado.ad} ${estado.ad === 1 ? "adulto" : "adultos"}` +
    (estado.ni ? `, ${estado.ni} ${estado.ni === 1 ? "niño" : "niños"}` : "");

  function mensaje(pieza) {
    const l = [HO.mensaje];
    if (inp.value && out.value) {
      const n = noches(inp.value, out.value);
      l.push("", `• Llegada: ${bonita(inp.value)}`, `• Salida: ${bonita(out.value)} (${n} ${n === 1 ? "noche" : "noches"})`);
    } else {
      l.push("", "• Fechas: por definir");
    }
    l.push(`• Huéspedes: ${huespedes()}`);
    l.push(`• Pieza: ${pieza || sel.value || "la que mejor nos acomode"}`);
    l.push("", "¿Tienen disponibilidad?");
    return l.join("\n");
  }

  function actualizar() {
    // La salida siempre después de la llegada
    if (inp.value) {
      out.min = masDias(inp.value, 1);
      if (!out.value || out.value <= inp.value) out.value = masDias(inp.value, 1);
    }
    const listo = inp.value && out.value;
    const n = listo ? noches(inp.value, out.value) : 0;
    $("#hResumen").innerHTML = listo
      ? `<strong>${n} ${n === 1 ? "noche" : "noches"}</strong> · ${bonita(inp.value)} → ${bonita(out.value)} · ${huespedes()}`
      : `Elige tus fechas · ${huespedes()}`;
    $("#hBarTxt").textContent = listo ? `${n} ${n === 1 ? "noche" : "noches"} · ${huespedes()}` : "Reserva directa por WhatsApp";

    // Piezas que calzan con la cantidad de huéspedes
    const total = estado.ad + estado.ni;
    let calzan = 0;
    root.querySelectorAll(".pieza").forEach((el) => {
      const ok = total <= +el.dataset.max;
      calzan += ok;
      el.classList.toggle("is-chica", !ok);
      const b = el.querySelector(".pieza__badge");
      b.hidden = ok;
      b.textContent = ok ? "" : `Hasta ${el.dataset.max} ${+el.dataset.max === 1 ? "persona" : "personas"}`;
    });
    $("#hFiltro").textContent = `${calzan} de ${piezas.length} piezas para ${total} ${total === 1 ? "persona" : "personas"}.` +
      (calzan ? "" : " Escríbenos y combinamos piezas para tu grupo.");
  }

  /* ---------- Eventos ---------- */
  [inp, out, sel].forEach((el) => el.addEventListener("change", actualizar));

  root.querySelectorAll(".stepper").forEach((st) =>
    st.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      const k = st.dataset.step;
      const min = k === "ad" ? 1 : 0;
      estado[k] = Math.max(min, Math.min(8, estado[k] + +b.dataset.d));
      st.querySelector("output").textContent = estado[k];
      actualizar();
    })
  );

  $("#hReserva").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!inp.value || !out.value) {
      $("#hResumen").innerHTML = `<span class="reserva__error">Elige la fecha de llegada y de salida.</span>`;
      (inp.value ? out : inp).focus();
      return;
    }
    window.open(wa(mensaje()), "_blank", "noopener");
  });

  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-pieza]");
    if (!b) return;
    sel.value = b.dataset.pieza;
    window.open(wa(mensaje(b.dataset.pieza)), "_blank", "noopener");
  });

  $("#hBarBtn").addEventListener("click", () => {
    $("#hReserva").scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => (inp.value ? $("#hReserva .hbtn") : inp).focus({ preventScroll: true }), 500);
  });

  // Barra inferior (celular) visible cuando el buscador sale de pantalla
  const bar = $("#hBar");
  new IntersectionObserver(([en]) => bar.classList.toggle("is-on", !en.isIntersecting && en.boundingClientRect.top < 0)).observe($("#hReserva"));

  // Mapa embebido (carga diferida)
  const mapa = $("#hMapa");
  const mio = new IntersectionObserver((ents) => {
    if (!ents[0].isIntersecting) return;
    mio.disconnect();
    mapa.innerHTML = `<iframe title="Mapa de ubicación" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${encodeURIComponent(mapa.dataset.q)}&output=embed"></iframe>`;
  }, { rootMargin: "300px" });
  mio.observe(mapa);

  actualizar();
})();

/* Renderiza el sitio a partir de window.SITE (assets/config.js). */
(function () {
  const S = window.SITE;
  const $ = (sel, root = document) => root.querySelector(sel);

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const wa = (num, msg) => `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
  const img = (src, alt, cls = "", sizes = "100vw", eager = false) =>
    `<img class="${cls}" src="${esc(src)}" alt="${esc(alt)}" sizes="${sizes}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" onerror="this.classList.add('is-broken')">`;

  const waIcon =
    '<svg viewBox="0 0 24 24" aria-hidden="true" class="ico"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>';
  const btnWa = (num, msg, label, variant = "gold") =>
    `<a class="btn btn--${variant}" href="${wa(num, msg)}" target="_blank" rel="noopener">${waIcon}<span>${esc(label)}</span></a>`;

  const PAGE = document.body.dataset.page || "inicio";
  const UNIDADES = [
    { id: "ferreteria", ruta: "/ferreteria", n: "01", nombre: "Ferretería", img: S.ferreteria.imagenVisita || S.ferreteria.imagen, texto: "Cotiza stock y precios al instante." },
    { id: "vacacional", ruta: "/centro-vacacional", n: "02", nombre: "Centro Vacacional", img: S.vacacional.poster, texto: "Cabañas, piscina y naturaleza." },
    { id: "restaurante", ruta: "/restaurante", n: "03", nombre: "Restaurante", img: S.restaurante.imagen, texto: "Colación diaria, platos y tragos." },
    { id: "hoteleria", ruta: "/hoteleria", n: "04", nombre: "Hotelería", img: S.hoteleria.piezas[0].imagen, texto: "Piezas para tu estadía." },
  ];
  const tarjetas = (lista) => lista
    .map((u) => `<a class="unit reveal" href="${u.ruta}">
        <figure class="unit__img">${img(u.img, u.nombre, "", "(min-width: 960px) 25vw, 100vw")}</figure>
        <span class="unit__num">${u.n}</span>
        <span class="unit__name">${esc(u.nombre)}</span>
        <span class="unit__text">${esc(u.texto)}</span>
        <span class="unit__go">Entrar →</span>
      </a>`).join("");

  /* ---------- Hero ---------- */
  const H = S.hero;
  if ($("#inicio")) $("#inicio").innerHTML = `
    <div class="hero__media">${img(H.imagen, "", "hero__img", "100vw", true)}</div>
    <div class="hero__veil"></div>
    <div class="hero__content">
      <p class="eyebrow reveal">${esc(H.eyebrow)}</p>
      <h1 class="display reveal">${H.titulo}</h1>
      <p class="lead reveal">${esc(H.bajada)}</p>
      <ul class="hero__index reveal">
        ${UNIDADES.map((u) => `<li><a href="${u.ruta}"><span>${u.n}</span>${esc(u.nombre)}</a></li>`).join("")}
      </ul>
    </div>
    <a href="#hub" class="hero__scroll" aria-label="Bajar"><span></span></a>`;

  /* ---------- Hub de unidades (solo inicio) ---------- */
  if ($("#hub")) $("#hub").innerHTML = `
    <div class="container">
      <header class="section__head">
        <p class="eyebrow reveal">El ecosistema</p>
        <h2 class="display display--md reveal">Elige tu experiencia</h2>
      </header>
      <div class="units">${tarjetas(UNIDADES)}</div>
    </div>`;

  /* ---------- Otras unidades (páginas internas) ---------- */
  if ($("#crosslinks")) {
    if (PAGE === "inicio") $("#crosslinks").remove();
    else $("#crosslinks").innerHTML = `
      <div class="container">
        <p class="eyebrow reveal">Sigue explorando el ecosistema</p>
        <div class="units units--3">${tarjetas(UNIDADES.filter((u) => u.id !== PAGE))}</div>
        <p class="crosslinks__back reveal"><a href="/">← Volver al inicio</a></p>
      </div>`;
  }

  /* ---------- 1. Ferretería: la renderiza assets/ferreteria.js ---------- */

  /* ---------- 2. Centro Vacacional ---------- */
  const V = S.vacacional;
  const media = V.video
    ? `<video class="vac__video" autoplay muted loop playsinline preload="none" poster="${esc(V.poster)}"><source src="${esc(V.video)}" type="video/mp4"></video>`
    : `${img(V.poster, "", "vac__video")}<span class="video-tag">Espacio para video de fondo</span>`;
  if ($("#vacacional")) $("#vacacional").innerHTML = `
    <div class="vac__hero">
      <div class="vac__media">${media}</div>
      <div class="hero__veil"></div>
      <div class="vac__content container">
        <p class="eyebrow reveal"><span class="num">02</span>${esc(V.eyebrow)}</p>
        <h2 class="display display--md reveal">${esc(V.titulo)}</h2>
        <p class="lead reveal">${esc(V.texto)}</p>
        <div class="actions reveal">${btnWa(V.whatsapp, V.mensaje, "Revisar disponibilidad")}</div>
      </div>
    </div>
    <div class="section section--tight">
      <div class="container gallery">
        ${V.galeria
          .map(
            (g, i) => `<figure class="gallery__item gallery__item--${i} reveal">
              ${img(g.src, g.alt, "", "(min-width: 960px) 40vw, 100vw")}
              <figcaption>${esc(g.pie)}</figcaption>
            </figure>`
          )
          .join("")}
      </div>
    </div>`;

  /* ---------- 3. Restaurante: lo renderiza assets/restaurante.js ---------- */
  const R = S.restaurante;

  /* ---------- 4. Hotelería: la renderiza assets/hoteleria.js ---------- */

  /* ---------- Footer ---------- */
  $("#footer").innerHTML = `
    <div class="container footer__inner">
      <a href="/" class="nav__brand">${esc(S.marca)}<span>${esc(S.ciudad)}</span></a>
      <p>${esc(S.pie)}</p>
    </div>`;

  /* ---------- Navegación ---------- */
  const nav = $("#nav");
  const toggle = $("#navToggle");
  // En páginas sin portada oscura la barra va siempre sólida
  const siempreSolida = !["inicio", "vacacional", "hoteleria"].includes(PAGE);
  const onScroll = () => nav.classList.toggle("is-solid", siempreSolida || window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open);
    document.body.classList.toggle("no-scroll", open);
  });
  document.querySelectorAll('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("no-scroll");
    })
  );

  // Página activa en la navegación
  const actual = UNIDADES.find((u) => u.id === PAGE);
  document.querySelectorAll(".nav__links a").forEach((l) =>
    l.classList.toggle("is-active", !!actual && l.getAttribute("href") === actual.ruta)
  );

  /* ---------- Animaciones de entrada ---------- */
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      }),
    { rootMargin: "0px 0px -8% 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  requestAnimationFrame(() => document.body.classList.add("is-ready"));

  /* ---------- QR del menú (carga diferida) ---------- */
  const qrBox = $("#menuQr");
  if (!qrBox) return;
  const qrIo = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    qrIo.disconnect();
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js";
    s.onload = () => {
      const url = new URL(R.menuPdf, location.href).href;
      const qr = qrcode(0, "M");
      qr.addData(url);
      qr.make();
      qrBox.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
    };
    document.head.appendChild(s);
  }, { rootMargin: "400px" });
  qrIo.observe(qrBox);
})();

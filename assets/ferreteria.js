/* Página /ferreteria — vitrina tipo tienda de Ferretería La Italiana.
   Usa window.SITE.ferreteria (assets/config.js) y window.CATALOGO (assets/catalogo.js).
   El asistente de cotización (assets/cotizador.js) se monta en #chat-widget-slot,
   dentro del panel lateral que se abre con «Mi cotización» o el botón flotante. */
(function () {
  const root = document.getElementById("ferreteria");
  const F = window.SITE && window.SITE.ferreteria;
  const CAT = window.CATALOGO;
  if (!root || !F || !CAT) return;

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const clp = (n) => "$" + Math.round(n).toLocaleString("es-CL");
  const norm = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const fecha = (iso) => iso.split("-").reverse().join("-");
  const wa = (msg) => `https://wa.me/${F.whatsapp}?text=${encodeURIComponent(msg)}`;
  const img = (src, alt, cls = "") =>
    `<img class="${cls}" src="${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async" onerror="this.classList.add('is-broken')">`;

  const productos = CAT.productos.map((p, id) => ({ ...p, id }));
  const categorias = [...new Set(productos.map((p) => p.cat))];
  const fotoCat = (c) => (F.categoriasImg || {})[c] || F.imagen;
  const corto = (c) => c.split(" ")[0];

  // Ícono por categoría para las fichas de producto (si un producto trae "img" en el catálogo, se usa la foto)
  const S = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
  const ICONOS = {
    "Construcción": `<path ${S} d="M4 20h16M5 20V9h14v11M5 14.5h14M9 9v5.5M15 9v5.5M12 14.5V20M8 9l4-5 4 5"/>`,
    "Madera": `<path ${S} d="M3 8h15l3 2-3 2H3zM3 14h15l3 2-3 2H3zM7 8v4M11 14v4"/>`,
    "Pintura": `<path ${S} d="M5 4h12v5H5zM17 6.5h2v5h-7v3M11 14.5h2V21h-2z"/>`,
    "Fijaciones": `<path ${S} d="M8 4h8l-1.5 3h-5zM10 7v10l2 3 2-3V7M10 10l4 1.5M10 13l4 1.5"/>`,
    "Electricidad y gasfitería": `<path ${S} d="M13 3 6 13h5l-1 8 7-10h-5z"/>`,
    "Herramientas": `<path ${S} d="M14 4l6 6-2 2-2-2-9 9-2-2 9-9-2-2zM14 4l-3 0"/>`,
  };
  const ficha = (p) =>
    p.img
      ? img(p.img, p.nombre)
      : `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONOS[p.cat] || ICONOS["Herramientas"]}</svg>`;
  const POR_PAGINA = 8;
  let mostrar = POR_PAGINA;

  const icoBuscar = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m20 20-4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  const icoCot = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l5 5v13H7z M14 3v5h5 M10 13h6 M10 17h6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  const icoChat = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M8 10h8M8 13h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
  const icoPin = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="9.5" r="2.4" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>';

  /* ---------- Estructura ---------- */
  root.innerHTML = `
    <div class="tienda">
      <div class="tienda__bar">
        <div class="tienda__inner tienda__bar-in">
          <a class="tienda__marca" href="/ferreteria" aria-label="Ferretería ${esc(F.nombre)}">
            <span class="tienda__flag" aria-hidden="true"><i></i><i></i><i></i></span>
            <span><small>Ferretería</small>${esc(F.nombre)}</span>
          </a>
          <form class="tienda__buscar" id="tBuscar" role="search" autocomplete="off">
            <label class="sr-only" for="tQ">Buscar en la ferretería</label>
            <input id="tQ" type="search" placeholder="Buscar: cemento, fierro 10 mm, látex…" enterkeyhint="search">
            <button type="submit" aria-label="Buscar">${icoBuscar}</button>
          </form>
          <button class="tienda__cot" id="tAbrirCot" type="button" aria-controls="tPanel" aria-expanded="false">
            ${icoCot}<span>Mi cotización</span><b id="tCount" hidden>0</b>
          </button>
        </div>
        <div class="tienda__inner">
          <nav class="tienda__cats" aria-label="Categorías">
            ${categorias.map((c) => `<button type="button" data-cat="${esc(c)}">${esc(c)}</button>`).join("")}
          </nav>
        </div>
      </div>

      <div class="tienda__strip">
        <div class="tienda__inner">
          <span>${icoPin} ${esc(F.direccion)}</span>
          <span>Stock y precios al <strong>${fecha(CAT.actualizado)}</strong> · IVA incluido</span>
        </div>
      </div>

      <div class="tienda__inner">
        <div class="slider" id="tSlider" aria-roledescription="carrusel">
          ${(F.slides || [])
            .map(
              (s, i) => `<article class="slide${i ? "" : " is-on"}" aria-roledescription="diapositiva" aria-label="${i + 1} de ${F.slides.length}">
                ${img(s.imagen, s.titulo, "slide__img")}
                <div class="slide__txt">
                  <p class="slide__eyebrow">${esc(s.eyebrow)}</p>
                  <h2>${esc(s.titulo)}</h2>
                  <p>${esc(s.texto)}</p>
                  <button type="button" class="tbtn" data-cat="${esc(s.categoria)}">Ver ${esc(s.categoria.toLowerCase())}</button>
                </div>
              </article>`
            )
            .join("")}
          <button class="slider__nav slider__nav--prev" type="button" aria-label="Anterior">‹</button>
          <button class="slider__nav slider__nav--next" type="button" aria-label="Siguiente">›</button>
          <div class="slider__dots">${(F.slides || []).map((_, i) => `<button type="button" data-dot="${i}" aria-label="Ir a ${i + 1}"${i ? "" : ' class="is-on"'}></button>`).join("")}</div>
        </div>

        <ul class="beneficios">
          ${(F.beneficios || []).map((b) => `<li><strong>${esc(b.t)}</strong><span>${esc(b.d)}</span></li>`).join("")}
        </ul>

        <section class="tsec" aria-labelledby="tCatsH">
          <header class="tsec__head">
            <h2 id="tCatsH">Categorías destacadas</h2>
            <p>Todo lo que necesitas para tu obra, a un mensaje de distancia.</p>
          </header>
          <div class="circulos">
            ${categorias
              .map(
                (c) => `<button type="button" class="circulo" data-cat="${esc(c)}">
                  <span class="circulo__img">${img(fotoCat(c), c)}</span>
                  <span class="circulo__name">${esc(c)}</span>
                </button>`
              )
              .join("")}
          </div>
        </section>

        <section class="tsec" id="tProductos" aria-labelledby="tProdH">
          <header class="tsec__head tsec__head--row">
            <div>
              <h2 id="tProdH">Productos</h2>
              <p id="tResumen"></p>
            </div>
          </header>
          <div class="tabs" role="tablist" id="tTabs">
            <button type="button" role="tab" data-tab="" class="is-on">Todos</button>
            ${categorias.map((c) => `<button type="button" role="tab" data-tab="${esc(c)}">${esc(corto(c))}</button>`).join("")}
          </div>
          <div class="grid" id="tGrid"></div>
        </section>

        <section class="volumen">
          <div>
            <p class="slide__eyebrow">¿Obra grande?</p>
            <h2>Cotiza por volumen</h2>
            <p>Los precios publicados son de lista. Descuentos y condiciones especiales se confirman directo con nuestro equipo.</p>
          </div>
          <a class="tbtn tbtn--light" href="${wa("Hola, quiero cotizar por volumen para una obra.")}" target="_blank" rel="noopener">Escribir por WhatsApp</a>
        </section>

        <section class="visita">
          <figure>${img(F.imagenVisita || F.imagen, "Martillo sobre mesón de madera")}</figure>
          <div>
            <p class="slide__eyebrow">Visítanos</p>
            <h2>Ferretería ${esc(F.nombre)}</h2>
            <p class="visita__dir">${icoPin} ${esc(F.direccion)}</p>
            <p>${esc(F.texto)}</p>
            <div class="visita__acc">
              <a class="tbtn" href="${wa(F.mensaje)}" target="_blank" rel="noopener">Cotizar por WhatsApp</a>
              <a class="tbtn tbtn--line" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(F.direccion)}" target="_blank" rel="noopener">Cómo llegar</a>
            </div>
          </div>
        </section>
      </div>
    </div>

    <button class="asistente-fab" id="tFab" type="button" aria-controls="tPanel" aria-expanded="false">${icoChat}<span>Asistente</span></button>
    <div class="tpanel__veil" id="tVeil" hidden></div>
    <aside class="tpanel" id="tPanel" aria-label="${esc(F.chatEtiqueta)}" aria-hidden="true">
      <button class="tpanel__close" id="tCerrar" type="button" aria-label="Cerrar">×</button>
      <div class="chat-slot" id="chat-widget-slot" data-widget="ferreteria-bot"></div>
    </aside>`;

  const $ = (s) => root.querySelector(s);
  const grid = $("#tGrid");
  const resumen = $("#tResumen");
  const tabs = $("#tTabs");
  const q = $("#tQ");
  let filtroCat = "";
  let filtroTxt = "";

  /* ---------- Vitrina ---------- */
  function tarjeta(p) {
    const hay = p.stock > 0;
    const estado = hay
      ? p.stock <= 10
        ? `<span class="stock stock--low">Quedan ${p.stock}</span>`
        : `<span class="stock">En stock</span>`
      : `<span class="stock stock--out">Sin stock${p.reposicion ? ` · llega ${esc(p.reposicion)}` : ""}</span>`;
    const accion = hay
      ? `<div class="card__acc">
           <label class="sr-only" for="qt${p.id}">Cantidad</label>
           <input id="qt${p.id}" type="number" min="1" max="${p.stock}" value="1" inputmode="numeric">
           <button type="button" class="tbtn tbtn--sm" data-add="${p.id}">Agregar</button>
         </div>`
      : `<a class="tbtn tbtn--sm tbtn--line" href="${wa(`Hola, ¿me pueden avisar cuando llegue ${p.nombre}?`)}" target="_blank" rel="noopener">Avisarme</a>`;
    return `<article class="card${hay ? "" : " is-out"}">
      <div class="card__img" data-cat-tone="${categorias.indexOf(p.cat) % 6}">${ficha(p)}</div>
      <p class="card__cat">${esc(p.cat)}</p>
      <h3 class="card__name">${esc(p.nombre)}</h3>
      <p class="card__price">${clp(p.precio)}<small>IVA incl.</small></p>
      ${estado}
      ${accion}
    </article>`;
  }

  function pintar(reiniciar = true) {
    if (reiniciar) mostrar = POR_PAGINA;
    const toks = norm(filtroTxt).split(/\s+/).filter((t) => t.length > 1 || /\d/.test(t));
    const lista = productos.filter(
      (p) => (!filtroCat || p.cat === filtroCat) && toks.every((t) => norm(p.nombre + " " + p.cat).includes(t))
    );
    tabs.querySelectorAll("button").forEach((b) => b.classList.toggle("is-on", b.dataset.tab === filtroCat));
    const donde = filtroCat ? ` en ${filtroCat}` : "";
    resumen.innerHTML = filtroTxt
      ? `${lista.length} resultado${lista.length === 1 ? "" : "s"} para «${esc(filtroTxt)}»${esc(donde)} · <button type="button" class="linkbtn" data-limpiar>Ver todo</button>`
      : `${lista.length} productos${esc(donde)}`;
    const visibles = lista.slice(0, mostrar);
    const resto = lista.length - visibles.length;
    grid.innerHTML = lista.length
      ? visibles.map(tarjeta).join("") +
        (resto > 0 ? `<div class="mas"><button type="button" class="tbtn tbtn--line" data-mas>Ver ${Math.min(resto, POR_PAGINA)} más <small>(${resto} restantes)</small></button></div>` : "")
      : `<div class="vacio">
           <p>No encontramos «${esc(filtroTxt)}» en el catálogo publicado.</p>
           <div class="visita__acc">
             <button type="button" class="tbtn" data-preguntar="${esc(filtroTxt)}">Preguntar al asistente</button>
             <a class="tbtn tbtn--line" href="${wa(`Hola, ¿tienen ${filtroTxt}?`)}" target="_blank" rel="noopener">Consultar por WhatsApp</a>
           </div>
         </div>`;
  }

  function irAProductos() {
    $("#tProductos").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ---------- Panel del asistente ---------- */
  const panel = $("#tPanel");
  const veil = $("#tVeil");
  const abridores = [$("#tAbrirCot"), $("#tFab")];
  function panelAbierto(on) {
    panel.classList.toggle("is-open", on);
    panel.setAttribute("aria-hidden", String(!on));
    veil.hidden = !on;
    abridores.forEach((b) => b.setAttribute("aria-expanded", String(on)));
    document.body.classList.toggle("no-scroll", on && innerWidth < 720);
    if (on) setTimeout(() => panel.querySelector("#cotInput")?.focus({ preventScroll: true }), 250);
  }
  abridores.forEach((b) => b.addEventListener("click", () => panelAbierto(!panel.classList.contains("is-open"))));
  $("#tCerrar").addEventListener("click", () => panelAbierto(false));
  veil.addEventListener("click", () => panelAbierto(false));
  document.addEventListener("keydown", (e) => e.key === "Escape" && panelAbierto(false));

  document.addEventListener("cotizacion:cambio", (e) => {
    const n = e.detail.items;
    const b = $("#tCount");
    b.hidden = !n;
    b.textContent = n;
    $("#tFab").classList.toggle("has-items", n > 0);
  });

  /* ---------- Eventos ---------- */
  $("#tBuscar").addEventListener("submit", (e) => {
    e.preventDefault();
    filtroTxt = q.value.trim();
    filtroCat = "";
    pintar();
    irAProductos();
  });
  q.addEventListener("input", () => {
    if (q.value.trim() === "" && filtroTxt) {
      filtroTxt = "";
      pintar();
    }
  });

  root.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b || !root.contains(b)) return;
    if (b.dataset.cat !== undefined) {
      filtroCat = b.dataset.cat;
      filtroTxt = "";
      q.value = "";
      pintar();
      irAProductos();
    } else if (b.dataset.tab !== undefined) {
      filtroCat = b.dataset.tab;
      pintar();
    } else if (b.dataset.limpiar !== undefined) {
      filtroTxt = "";
      filtroCat = "";
      q.value = "";
      pintar();
    } else if (b.dataset.add !== undefined) {
      const id = +b.dataset.add;
      const n = Math.max(1, parseInt(b.parentElement.querySelector("input").value, 10) || 1);
      if (window.Cotizador) {
        window.Cotizador.agregar(id, n);
        b.textContent = "Agregado ✓";
        b.classList.add("is-done");
        setTimeout(() => {
          b.textContent = "Agregar";
          b.classList.remove("is-done");
        }, 1600);
        if (innerWidth >= 720) panelAbierto(true);
      }
    } else if (b.dataset.mas !== undefined) {
      mostrar += POR_PAGINA;
      pintar(false);
    } else if (b.dataset.preguntar !== undefined) {
      panelAbierto(true);
      window.Cotizador && window.Cotizador.preguntar(b.dataset.preguntar);
    }
  });

  /* ---------- Carrusel ---------- */
  const slides = [...root.querySelectorAll(".slide")];
  const dots = [...root.querySelectorAll("[data-dot]")];
  let actual = 0;
  let timer;
  function ir(i) {
    actual = (i + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle("is-on", k === actual));
    dots.forEach((d, k) => d.classList.toggle("is-on", k === actual));
  }
  const reducir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const auto = () => {
    clearInterval(timer);
    if (!reducir && slides.length > 1) timer = setInterval(() => ir(actual + 1), 6000);
  };
  root.querySelector(".slider__nav--prev").addEventListener("click", () => { ir(actual - 1); auto(); });
  root.querySelector(".slider__nav--next").addEventListener("click", () => { ir(actual + 1); auto(); });
  dots.forEach((d) => d.addEventListener("click", () => { ir(+d.dataset.dot); auto(); }));
  let x0 = null;
  const sl = $("#tSlider");
  sl.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
  sl.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) { ir(actual + (dx < 0 ? 1 : -1)); auto(); }
    x0 = null;
  });
  auto();

  pintar();
})();

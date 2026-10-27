/* Página /restaurante — carta navegable con pedido por WhatsApp
   (retiro en local o delivery). Datos: window.SITE.restaurante (assets/config.js)
   y window.CARTA (assets/carta.js). */
(function () {
  const root = document.getElementById("restaurante");
  const S = window.SITE;
  const R = S && S.restaurante;
  const CARTA = window.CARTA;
  if (!root || !R || !CARTA) return;

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const clp = (n) => "$" + Math.round(n).toLocaleString("es-CL");
  const norm = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const slug = (s) => norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const wa = (msg) => `https://wa.me/${R.whatsapp}?text=${encodeURIComponent(msg)}`;
  const img = (src, alt, cls = "") =>
    `<img class="${cls}" src="${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async" onerror="this.parentNode.classList.add('is-empty');this.remove()">`;
  const waIcon =
    '<svg viewBox="0 0 24 24" aria-hidden="true" class="ico"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>';
  const icoBolsa = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>';
  const icoPlato = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="6.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M3 5v5a2 2 0 0 0 2 2V20M5 5v4M21 5c-1.5 0-2.5 2-2.5 4.5S19.5 12 21 12v8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
  const icoBuscar = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m20 20-4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

  /* ---------- Datos ---------- */
  const platos = [];
  const cats = CARTA.categorias.map((c) => ({ ...c, id: "cat-" + slug(c.nombre) }));
  cats.forEach((c) => c.platos.forEach((p) => platos.push({ ...p, cat: c.nombre, id: platos.length })));
  const porCat = (c) => platos.filter((p) => p.cat === c.nombre);

  // Horarios para el pedido: cada 30 min entre 12:30 y 22:30
  const horas = [];
  for (let m = 12 * 60 + 30; m <= 22 * 60 + 30; m += 30) horas.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${m % 60 ? "30" : "00"}`);

  /* ---------- Estructura ---------- */
  root.innerHTML = `
    <div class="resto">
      <div class="resto__bar">
        <div class="resto__inner resto__bar-in">
          <div class="modo" role="radiogroup" aria-label="Tipo de pedido">
            <button type="button" role="radio" aria-checked="true" data-modo="retiro" class="is-on">Retiro en local</button>
            <button type="button" role="radio" aria-checked="false" data-modo="delivery">Delivery</button>
          </div>
          <label class="resto__hora"><span class="sr-only">Hora</span>
            <select id="rHora"><option value="">Lo antes posible</option>${horas.map((h) => `<option>${h}</option>`).join("")}</select>
          </label>
          <button type="button" class="resto__carro" id="rAbrir" aria-controls="rPanel" aria-expanded="false">
            ${icoBolsa}<span>Mi pedido</span><b id="rCount" hidden>0</b><strong id="rTotalBar"></strong>
          </button>
        </div>
      </div>

      <header class="resto__hero">
        <div class="resto__hero-img">${img(R.imagen, "Mesa servida en el restaurante")}</div>
        <div class="resto__hero-txt">
          <p class="eyebrow"><span class="num">03</span>${esc(R.eyebrow)} · ${esc(S.ciudad)}</p>
          <h1>${esc(R.titulo)}</h1>
          <p>${esc(R.texto)}</p>
          <ul class="resto__info">
            ${cats.filter((c) => c.nota).map((c) => `<li><strong>${esc(c.nombre)}</strong> ${esc(c.nota)}</li>`).join("")}
          </ul>
        </div>
      </header>

      <div class="resto__inner resto__layout">
        <aside class="resto__aside">
          <label class="resto__buscar">${icoBuscar}<span class="sr-only">Buscar en la carta</span>
            <input type="search" id="rQ" placeholder="Buscar en la carta" autocomplete="off">
          </label>
          <p class="resto__aside-t">Categorías</p>
          <nav class="resto__cats" id="rCats">
            ${cats.map((c) => `<a href="#${c.id}" data-cat="${c.id}"><span>${esc(c.nombre)}</span><small>${c.platos.length}</small></a>`).join("")}
          </nav>
        </aside>

        <main class="resto__carta" id="rCarta">
          ${cats
            .map(
              (c) => `<section class="rcat" id="${c.id}" aria-labelledby="${c.id}-h">
                <header class="rcat__head"><h2 id="${c.id}-h">${esc(c.nombre)}</h2>${c.nota ? `<p>${esc(c.nota)}</p>` : ""}</header>
                <div class="rgrid">${porCat(c).map(ficha).join("")}</div>
              </section>`
            )
            .join("")}
          <p class="resto__vacio" id="rVacio" hidden></p>
        </main>
      </div>

      <section class="resto__inner resto__visita">
        <div>
          <p class="eyebrow">Visítanos</p>
          <h2>Para comer aquí</h2>
          <p>Te esperamos en ${esc(S.ciudad)}. Si vienes en grupo, reserva tu mesa por WhatsApp.</p>
          <div class="resto__acc">
            <a class="rbtn" href="${wa("Hola, quiero reservar una mesa.")}" target="_blank" rel="noopener">${waIcon}<span>Reservar mesa</span></a>
            <a class="rbtn rbtn--line" href="${esc(R.menuPdf)}" target="_blank" rel="noopener">Carta en PDF</a>
            <a class="rbtn rbtn--line" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(S.ciudad + ", Provincia de Arauco, Chile")}" target="_blank" rel="noopener">Cómo llegar</a>
          </div>
        </div>
        <ul class="resto__horario">
          ${cats.filter((c) => c.nota).map((c) => `<li><span>${esc(c.nombre)}</span><strong>${esc(c.nota)}</strong></li>`).join("")}
        </ul>
      </section>
    </div>

    <button type="button" class="resto__fab" id="rFab" hidden aria-controls="rPanel">${icoBolsa}<span>Ver pedido</span><strong id="rFabTotal"></strong></button>
    <div class="tpanel__veil" id="rVeil" hidden></div>
    <aside class="rpanel" id="rPanel" aria-label="Tu pedido" aria-hidden="true">
      <header class="rpanel__head"><h2>Tu pedido</h2><button type="button" id="rCerrar" aria-label="Cerrar">×</button></header>
      <div class="rpanel__body" id="rLineas"></div>
      <div class="rpanel__form">
        <p class="rpanel__modo" id="rModoTxt"></p>
        <label class="rcampo" id="rDirCampo" hidden><span>Dirección de entrega</span><input id="rDir" type="text" placeholder="Calle, número y referencia" autocomplete="street-address"></label>
        <label class="rcampo"><span>Nombre</span><input id="rNombre" type="text" placeholder="¿A nombre de quién?" autocomplete="name"></label>
        <label class="rcampo"><span>Comentarios</span><textarea id="rNota" rows="2" placeholder="Sin cebolla, punto de la carne, etc."></textarea></label>
      </div>
      <footer class="rpanel__foot">
        <div class="rpanel__total"><span>Total referencial</span><strong id="rTotal">$0</strong></div>
        <p class="rpanel__aviso" id="rAviso">Confirmamos tu pedido y el tiempo de preparación por WhatsApp.</p>
        <button type="button" class="rbtn rbtn--full" id="rEnviar">${waIcon}<span>Enviar pedido por WhatsApp</span></button>
      </footer>
    </aside>`;

  function ficha(p) {
    const tags = (p.etiquetas || []).map((t) => `<li class="tag tag--${slug(t)}">${esc(t)}</li>`).join("");
    const agotado = p.disponible === false;
    return `<article class="plato${agotado ? " is-out" : ""}" data-id="${p.id}" data-txt="${esc(norm(p.nombre + " " + p.detalle + " " + p.cat))}">
      <div class="plato__txt">
        <h3>${esc(p.nombre)}</h3>
        <p class="plato__precio">${clp(p.precio)}</p>
        <p class="plato__det">${esc(p.detalle)}</p>
        ${tags ? `<ul class="plato__tags">${tags}</ul>` : ""}
      </div>
      <div class="plato__img${p.img ? "" : " is-empty"}">
        ${p.img ? img(p.img, p.nombre) : ""}${icoPlato}
        ${agotado ? `<span class="plato__agotado">Agotado hoy</span>` : `<div class="plato__ctrl" data-ctrl="${p.id}"></div>`}
      </div>
    </article>`;
  }

  const $ = (s) => root.querySelector(s);
  const pedido = new Map(); // id -> cantidad
  let modo = "retiro";

  /* ---------- Pedido ---------- */
  const total = () => [...pedido].reduce((s, [id, n]) => s + platos[id].precio * n, 0);
  const items = () => [...pedido].reduce((s, [, n]) => s + n, 0);

  function cambiar(id, d) {
    const n = Math.max(0, (pedido.get(id) || 0) + d);
    n ? pedido.set(id, n) : pedido.delete(id);
    pintar();
  }

  function ctrl(id) {
    const n = pedido.get(id) || 0;
    return n
      ? `<div class="qty"><button type="button" data-menos="${id}" aria-label="Quitar uno">−</button><b>${n}</b><button type="button" data-mas="${id}" aria-label="Agregar uno">+</button></div>`
      : `<button type="button" class="plato__add" data-mas="${id}" aria-label="Agregar ${esc(platos[id].nombre)}">+</button>`;
  }

  function pintar() {
    root.querySelectorAll("[data-ctrl]").forEach((el) => (el.innerHTML = ctrl(+el.dataset.ctrl)));
    const n = items();
    const t = clp(total());
    const cnt = $("#rCount");
    cnt.hidden = !n;
    cnt.textContent = n;
    $("#rTotalBar").textContent = n ? t : "";
    const fab = $("#rFab");
    fab.hidden = !n;
    $("#rFabTotal").textContent = t;
    $("#rTotal").textContent = t;
    $("#rLineas").innerHTML = n
      ? `<ul class="rlineas">${[...pedido]
          .map(([id, q]) => {
            const p = platos[id];
            return `<li><div><strong>${esc(p.nombre)}</strong><small>${clp(p.precio)} c/u</small></div>
              <div class="qty qty--sm"><button type="button" data-menos="${id}" aria-label="Quitar uno">−</button><b>${q}</b><button type="button" data-mas="${id}" aria-label="Agregar uno">+</button></div>
              <span class="rlineas__sub">${clp(p.precio * q)}</span></li>`;
          })
          .join("")}</ul>`
      : `<div class="rpanel__vacio">${icoBolsa}<p>Tu pedido está vacío.</p><small>Agrega platos con el botón +.</small></div>`;
    $("#rEnviar").disabled = !n;
    pintarModo();
  }

  function pintarModo() {
    const hora = $("#rHora").value;
    $("#rModoTxt").innerHTML = `<strong>${modo === "delivery" ? "Delivery" : "Retiro en local"}</strong> · ${hora ? "a las " + hora : "lo antes posible"}`;
    $("#rDirCampo").hidden = modo !== "delivery";
    $("#rAviso").textContent =
      modo === "delivery"
        ? "El delivery está sujeto a cobertura. El costo de despacho y el tiempo de entrega se confirman por WhatsApp."
        : "Confirmamos tu pedido y el tiempo de preparación por WhatsApp.";
  }

  function mensaje() {
    const l = [`Hola, quiero hacer un pedido para ${modo === "delivery" ? "delivery" : "retiro en el local"}:`, ""];
    pedido.forEach((q, id) => l.push(`• ${q} × ${platos[id].nombre} — ${clp(platos[id].precio * q)}`));
    l.push("", `Total referencial: ${clp(total())}`);
    const hora = $("#rHora").value;
    l.push(`Hora: ${hora || "lo antes posible"}`);
    if (modo === "delivery") l.push(`Dirección: ${$("#rDir").value.trim()}`);
    const nombre = $("#rNombre").value.trim();
    if (nombre) l.push(`Nombre: ${nombre}`);
    const nota = $("#rNota").value.trim();
    if (nota) l.push(`Comentarios: ${nota}`);
    return l.join("\n");
  }

  /* ---------- Panel ---------- */
  const panel = $("#rPanel");
  const veil = $("#rVeil");
  function abrir(on) {
    panel.classList.toggle("is-open", on);
    panel.setAttribute("aria-hidden", String(!on));
    veil.hidden = !on;
    $("#rAbrir").setAttribute("aria-expanded", String(on));
    document.body.classList.toggle("no-scroll", on && innerWidth < 720);
  }
  $("#rAbrir").addEventListener("click", () => abrir(!panel.classList.contains("is-open")));
  $("#rFab").addEventListener("click", () => abrir(true));
  $("#rCerrar").addEventListener("click", () => abrir(false));
  veil.addEventListener("click", () => abrir(false));
  document.addEventListener("keydown", (e) => e.key === "Escape" && abrir(false));

  $("#rEnviar").addEventListener("click", () => {
    if (!pedido.size) return;
    if (modo === "delivery" && !$("#rDir").value.trim()) {
      $("#rDir").focus();
      $("#rDirCampo").classList.add("is-error");
      return;
    }
    window.open(wa(mensaje()), "_blank", "noopener");
  });
  $("#rDir").addEventListener("input", () => $("#rDirCampo").classList.remove("is-error"));

  /* ---------- Eventos de la carta ---------- */
  root.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.mas !== undefined) cambiar(+b.dataset.mas, 1);
    else if (b.dataset.menos !== undefined) cambiar(+b.dataset.menos, -1);
    else if (b.dataset.modo) {
      modo = b.dataset.modo;
      root.querySelectorAll("[data-modo]").forEach((x) => {
        const on = x === b;
        x.classList.toggle("is-on", on);
        x.setAttribute("aria-checked", String(on));
      });
      pintarModo();
    }
  });
  $("#rHora").addEventListener("change", pintarModo);

  // Buscador
  const q = $("#rQ");
  q.addEventListener("input", () => {
    const t = norm(q.value.trim());
    let visibles = 0;
    root.querySelectorAll(".plato").forEach((el) => {
      const ok = !t || t.split(/\s+/).every((w) => el.dataset.txt.includes(w));
      el.hidden = !ok;
      visibles += ok;
    });
    root.querySelectorAll(".rcat").forEach((s) => (s.hidden = ![...s.querySelectorAll(".plato")].some((p) => !p.hidden)));
    const v = $("#rVacio");
    v.hidden = visibles > 0;
    v.innerHTML = visibles ? "" : `No encontramos «${esc(q.value)}» en la carta. <a href="${wa(`Hola, ¿tienen ${q.value}?`)}" target="_blank" rel="noopener">Pregúntanos por WhatsApp</a>.`;
  });

  // Categoría activa al hacer scroll
  const links = [...root.querySelectorAll("#rCats a")];
  const spy = new IntersectionObserver(
    (ents) =>
      ents.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((a) => {
          const on = a.dataset.cat === en.target.id;
          a.classList.toggle("is-on", on);
          if (on && innerWidth < 960) a.scrollIntoView({ block: "nearest", inline: "center" });
        });
      }),
    { rootMargin: "-35% 0px -60% 0px" }
  );
  root.querySelectorAll(".rcat").forEach((s) => spy.observe(s));

  pintar();
})();

/* Asistente de cotización de Ferretería La Italiana.
   Corre en el navegador sobre window.CATALOGO (assets/catalogo.js) y se monta
   en #chat-widget-slot. Si más adelante se conecta el bot real, basta con no
   cargar este script en index.html. */
(function () {
  const slot = document.getElementById("chat-widget-slot");
  const CAT = window.CATALOGO;
  const F = window.SITE && window.SITE.ferreteria;
  if (!slot || !CAT || !F) return;

  /* ---------- Utilidades ---------- */
  const clp = (n) => "$" + Math.round(n).toLocaleString("es-CL");
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) =>
    String(s)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/(\d)([a-z])/g, "$1 $2") // 10mm -> 10 mm
      .replace(/[^a-z0-9/,.\s]/g, " ")
      .replace(/(?<!\d)[,.]|[,.](?!\d)/g, " ") // conserva 2,5 y 1.5
      .replace(/\s+/g, " ")
      .trim();
  const fecha = (iso) => iso.split("-").reverse().join("-");
  // Demo: todos los botones de WhatsApp abren la simulación con la cotización actual.
  const wa = () => "/demo-whatsapp";

  const productos = CAT.productos.map((p, i) => ({ ...p, id: i, texto: norm(p.nombre + " " + p.cat) }));
  const categorias = [...new Set(CAT.productos.map((p) => p.cat))];

  const STOP = new Set(
    ("de del la las el los un una unos unas y o a al en con para por que me se mi tu su lo le " +
      "hola quiero necesito busco buscando cotizar cotizacion cotiza precio precios valor cuanto " +
      "cuesta sale vale stock hay tienen tiene tienes queda quedan disponible favor porfa dame " +
      "ver saber consultar consulta algo buenas buenos dias tardes noches alo mas esos esas eso ese esa nomas")
      .split(" ")
  );
  const SINONIMOS = { kilo: "kg", kilos: "kg", galones: "galon" };
  const UNIDADES = "unidades|unidad|un|sacos|saco|barras|barra|planchas|plancha|rollos|rollo|cajas|caja|galones|galon|pares|par|tubos|tubo|kilos|kilo";

  const UNITSET = new Set(UNIDADES.split("|"));
  /* Separa la cantidad pedida del texto de búsqueda. */
  function parse(q) {
    let t = norm(q);
    // Muletillas de maestro antes de la cantidad: «buenas necesito 12 sacos…», «dame 8 pinos…», «y 40 barras…»
    t = t.replace(/^(?:(?:y|e|tambien|ademas|agrega|agregame|suma|sumale|ponme|pon|dame|deme|necesito|quiero|busco|hola|buenas|buenos|dias|tardes|noches|maestro|oye|amigo|porfa|favor|por|me|puede|pueden|podria|podrian|cotizame|cotiza|cotizar|un|una|mejor|solo|nomas|cambialo|cambiala|cambia|que|sean|ya|dale|ok|llevo|llevar|ponle|mandame|queria|llevaria|seria|esos|esas|eso)\s+)+(?=\d)/, "");
    let cantidad = null;
    let m;
    if ((m = t.match(/^(\d{1,4})$/))) {
      cantidad = +m[1]; // solo un número: «dame 10»
      t = "";
    } else if ((m = t.match(new RegExp(`(^|\\s)(\\d{1,4})\\s+(${UNIDADES})\\b`)))) {
      cantidad = +m[2];
      t = t.replace(m[0], `${m[1]}${m[3]}`);
    } else if ((m = t.match(/^(\d{1,4})\s+(?!(mm|cm|m|kg|w|oz|pulgadas?)\b)/))) {
      cantidad = +m[1];
      t = t.slice(m[0].length);
    } else if ((m = t.match(/(?<!\d)\s(?:x|por)\s*(\d{1,4})$/))) {
      cantidad = +m[1];
      t = t.slice(0, m.index);
    }
    const tokens = t
      .split(" ")
      .filter((w) => w && !STOP.has(w) && (w.length > 1 || /\d/.test(w)))
      .map((w) => SINONIMOS[w] || w);
    // «cajas», «sacos»… son unidad de medida, no el producto: no deben bloquear la búsqueda («10 cajas de clavos de 3»).
    const sinUn = tokens.filter((w) => !UNITSET.has(w));
    const cant = cantidad && cantidad > 0 ? cantidad : null;
    return { cantidad: cant, tokens: sinUn.length ? sinUn : tokens, soloCantidad: !!cant && !sinUn.length };
  }

  const coincide = (texto, tk) =>
    texto.includes(tk) ||
    (tk.length > 4 && tk.endsWith("es") && texto.includes(tk.slice(0, -2))) ||
    (tk.length > 3 && tk.endsWith("s") && texto.includes(tk.slice(0, -1)));

  function buscar(tokens) {
    if (!tokens.length) return { lista: [], exacto: false };
    const puntaje = productos.map((p) => ({ p, s: tokens.filter((tk) => coincide(p.texto, tk)).length }));
    const max = Math.max(...puntaje.map((x) => x.s));
    if (!max) return { lista: [], exacto: false };
    return { lista: puntaje.filter((x) => x.s === max).map((x) => x.p), exacto: max === tokens.length };
  }

  /* ---------- Estado de la cotización ---------- */
  const cot = new Map(); // id -> cantidad
  let ctx = null; // producto del que se está hablando: «dame 10» se refiere a ese
  /* Cotización compartida entre /ferreteria y /demo-whatsapp (mismo navegador). */
  const CLAVE = "ld-cotizacion-demo";
  function cargarCot(cot, productos) {
    try {
      const raw = JSON.parse(localStorage.getItem(CLAVE) || "[]");
      cot.clear();
      (Array.isArray(raw) ? raw : []).forEach(([id, c]) => {
        const p = productos[id];
        if (p && p.stock > 0 && c > 0) cot.set(id, Math.min(Math.floor(c), p.stock));
      });
    } catch (_) {}
  }
  function guardarCot(cot) {
    try {
      if (cot.size) localStorage.setItem(CLAVE, JSON.stringify([...cot]));
      else localStorage.removeItem(CLAVE);
    } catch (_) {}
  }
  cargarCot(cot, productos);
  const total = () => [...cot].reduce((s, [id, c]) => s + productos[id].precio * c, 0);
  const items = () => [...cot].reduce((s, [, c]) => s + c, 0);

  function agregar(id, cant) {
    const p = productos[id];
    const ya = cot.get(id) || 0;
    const libre = p.stock - ya;
    ctx = p.stock > 0 ? id : null;
    if (p.stock <= 0) return sinStock(p);
    if (libre <= 0) return bot(`Ya tienes en tu cotización todo el stock disponible de <strong>${esc(p.nombre)}</strong> (${p.stock}).`);
    const n = Math.min(cant, libre);
    cot.set(id, ya + n);
    pintarCot();
    const aviso = n < cant ? `Pediste ${cant}, pero hay ${libre} disponibles. ` : "";
    bot(`${aviso}Agregué <strong>${n} × ${esc(p.nombre)}</strong> (${clp(p.precio * n)}). ¿Algo más?`);
  }

  /* «Dame 10», «y 5 más», «mejor 20»: la cantidad se aplica al producto del que se venía hablando. */
  function cantidadSuelta(n, t) {
    if (ctx === null)
      return bot(
        `Dime de qué producto son esos ${n}: toca «Agregar» en uno de la lista o escribe el nombre (por ejemplo <em>«clavos de 3 pulgadas»</em>).`
      );
    const p = productos[ctx];
    if (/\b(mejor|cambia|cambialo|cambiala|que sean|solo|nomas)\b/.test(t) && cot.has(ctx)) {
      const nuevo = Math.min(n, p.stock);
      cot.set(ctx, nuevo);
      pintarCot();
      return bot(`Listo, dejé <strong>${nuevo} × ${esc(p.nombre)}</strong> (${clp(p.precio * nuevo)}). ¿Algo más?`);
    }
    agregar(ctx, n);
  }

  /* Pedido de varios productos en un solo mensaje: «10 sacos cemento melón y 8 fierros de 10».
     Solo se aplica si cada parte trae cantidad y calza con un único producto; si no, se responde como siempre. */
  function pedirVarios(q) {
    const partes = q.split(/\s*(?:,|\by\b|\be\b|\bmas\b|\bmás\b|\+)\s+(?=\d)/i).filter(Boolean);
    if (partes.length < 2) return false;
    const res = partes.map((txt) => {
      const { cantidad, tokens } = parse(txt);
      const { lista, exacto } = buscar(tokens);
      return { cantidad, lista, exacto };
    });
    if (!res.every((r) => r.cantidad && r.exacto && r.lista.length === 1)) return false;
    ctx = null;
    const filas = res.map((r) => {
      const p = r.lista[0];
      const ya = cot.get(p.id) || 0;
      const libre = Math.max(0, p.stock - ya);
      const n = Math.min(r.cantidad, libre);
      if (n > 0) cot.set(p.id, ya + n);
      return { p, n, pedido: r.cantidad, libre };
    });
    pintarCot();
    const lineas = filas
      .map(({ p, n, pedido, libre }) =>
        n
          ? `• <strong>${n} × ${esc(p.nombre)}</strong> (${clp(p.precio * n)})${n < pedido ? ` — pediste ${pedido}, solo hay ${libre}` : ""}`
          : `• ${esc(p.nombre)}: sin stock disponible`
      )
      .join("<br>");
    bot(`Listo, agregué a tu cotización:<br>${lineas}<br>¿Algo más?`);
    return true;
  }

  function mensajeWA() {
    const lineas = [...cot].map(([id, c]) => {
      const p = productos[id];
      return `• ${c} × ${p.nombre} — ${clp(p.precio * c)}`;
    });
    return (
      `Hola, quiero confirmar esta cotización en Ferretería ${F.nombre}:\n\n${lineas.join("\n")}\n\n` +
      `Total referencial: ${clp(total())} (IVA incluido, precios de lista).`
    );
  }

  /* ---------- Interfaz ---------- */
  slot.innerHTML = `
    <div class="chat-slot__head">
      <span class="dot"></span>
      <span class="chat-slot__titles">
        <span class="chat-slot__label">${esc(F.chatEtiqueta)}</span>
        <span class="chat-slot__stamp">Stock y precios al ${fecha(CAT.actualizado)}</span>
      </span>
    </div>
    <div class="chat-slot__body" id="cotLog" role="log" aria-live="polite"></div>
    <div class="cot" id="cotPanel" hidden>
      <button class="cot__bar" id="cotToggle" aria-expanded="false" aria-controls="cotDetalle">
        <span>Tu cotización · <b id="cotCount">0</b></span><strong id="cotTotal">$0</strong>
      </button>
      <div class="cot__detalle" id="cotDetalle" hidden></div>
    </div>
    <form class="cot-form" id="cotForm" autocomplete="off">
      <label class="sr-only" for="cotInput">Escribe un producto</label>
      <input id="cotInput" type="text" placeholder="Ej: 3 sacos cemento melón" enterkeyhint="send">
      <button type="submit" aria-label="Enviar">→</button>
    </form>
    <p class="chat-slot__note">Precios de lista con IVA incluido. Descuentos y condiciones especiales se confirman con nuestro equipo.</p>`;

  const log = slot.querySelector("#cotLog");
  const form = slot.querySelector("#cotForm");
  const input = slot.querySelector("#cotInput");
  const panel = slot.querySelector("#cotPanel");
  const toggle = slot.querySelector("#cotToggle");
  const detalle = slot.querySelector("#cotDetalle");

  function bot(html) {
    const el = document.createElement("div");
    el.className = "bubble bubble--in";
    el.innerHTML = html;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }
  function yo(texto) {
    const el = document.createElement("div");
    el.className = "bubble bubble--out";
    el.textContent = texto;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
  }

  function fichas(lista, cantidad) {
    return `<ul class="cot-list">${lista
      .map((p) => {
        const hay = p.stock > 0;
        const libre = p.stock - (cot.get(p.id) || 0); // el stock se descuenta de lo que ya cotizó el cliente
        const estado = hay
          ? libre > 0
            ? `${libre} disponibles`
            : "Todo el stock ya está en tu cotización"
          : `Sin stock${p.reposicion ? ` · reposición estimada: ${esc(p.reposicion)}` : ""}`;
        const accion = hay
          ? libre > 0
            ? `<input type="number" min="1" max="${libre}" value="${Math.min(cantidad || 1, libre)}" aria-label="Cantidad de ${esc(p.nombre)}">
             <button type="button" data-add="${p.id}">Agregar</button>`
            : ""
          : `<a href="${wa(`Hola, ¿me pueden avisar cuando llegue ${p.nombre}?`)}" target="_blank" rel="noopener">Avisarme</a>`;
        return `<li class="${hay ? "" : "is-out"}">
          <div class="cot-list__info"><span>${esc(p.nombre)}</span><small>${clp(p.precio)} · ${estado}</small></div>
          <div class="cot-list__act">${accion}</div>
        </li>`;
      })
      .join("")}</ul>`;
  }

  function sinStock(p) {
    const alt = productos.filter((x) => x.cat === p.cat && x.stock > 0 && x.id !== p.id && sharesWord(x, p));
    bot(
      `<strong>${esc(p.nombre)}</strong> está sin stock${p.reposicion ? `; la reposición estimada es <strong>${esc(p.reposicion)}</strong>` : ""}.` +
        (alt.length ? ` Te puedo ofrecer estas alternativas disponibles hoy:${fichas(alt)}` : "")
    );
  }
  const sharesWord = (a, b) => b.texto.split(" ")[0] === a.texto.split(" ")[0];

  function chipsCategorias() {
    return `<div class="cot-chips">${categorias
      .map((c) => `<button type="button" data-cat="${esc(c)}">${esc(c)}</button>`)
      .join("")}</div>`;
  }

  function pintarCot() {
    guardarCot(cot);
    document.dispatchEvent(new CustomEvent("cotizacion:cambio", { detail: { items: items(), total: total() } }));
    panel.hidden = cot.size === 0;
    slot.querySelector("#cotCount").textContent = `${items()} ${items() === 1 ? "unidad" : "unidades"}`;
    slot.querySelector("#cotTotal").textContent = clp(total());
    detalle.innerHTML = `
      <ul class="cot__lineas">${[...cot]
        .map(([id, c]) => {
          const p = productos[id];
          return `<li><span>${c} × ${esc(p.nombre)}</span><span>${clp(p.precio * c)}</span>
            <button type="button" data-del="${id}" aria-label="Quitar ${esc(p.nombre)}">×</button></li>`;
        })
        .join("")}</ul>
      <div class="cot__total"><span>Total referencial · IVA incl.</span><strong>${clp(total())}</strong></div>
      <div class="cot__acciones">
        <a class="btn btn--gold" href="${wa(mensajeWA())}" target="_blank" rel="noopener">Confirmar por WhatsApp</a>
        <button type="button" class="cot__vaciar" data-vaciar>Vaciar</button>
      </div>`;
  }

  function responder(q) {
    const t = norm(q);
    if (!t) return;
    if (/^(hola|buenas|buenos|alo)\b/.test(t) && !parse(q).tokens.length)
      return bot(`¡Hola! Dime qué producto necesitas o elige una categoría:${chipsCategorias()}`);
    if (/\bgracias\b/.test(t)) return bot("¡De nada! Si quieres confirmar, usa el botón de WhatsApp de tu cotización.");
    if (/\b(descuento|descuentos|rebaja|oferta|mayorista|por mayor|precio especial|volumen)\b/.test(t))
      return bot(
        `Los precios que te muestro son de lista. Descuentos y condiciones especiales se confirman directo con nuestro equipo: ` +
          `<a href="${wa(cot.size ? mensajeWA() + "\n\n¿Hay algún descuento posible?" : "Hola, quiero consultar por descuentos.")}" target="_blank" rel="noopener">escríbenos por WhatsApp</a>.`
      );
    if (/\b(direccion|donde|ubicacion|ubicados|local|horario|horarios)\b/.test(t))
      return bot(`Estamos en <strong>${esc(F.direccion)}</strong>. Para horarios y despacho, escríbenos por <a href="${wa("Hola, ¿cuál es el horario de atención?")}" target="_blank" rel="noopener">WhatsApp</a>.`);
    if (/\b(cotizacion|resumen|total|carrito|mi pedido)\b/.test(t) && !buscar(parse(q).tokens).exacto) {
      if (!cot.size) return bot("Tu cotización está vacía. Escribe un producto para empezar.");
      abrirDetalle(true);
      return bot(`Llevas ${items()} ${items() === 1 ? "unidad" : "unidades"} por <strong>${clp(total())}</strong>. Puedes revisarla arriba del buscador.`);
    }

    const cat = categorias.find((c) => norm(c) === t || norm(c).split(" ")[0] === t);
    if (cat) { ctx = null; }
    if (cat) return bot(`Esto tenemos en <strong>${esc(cat)}</strong>:${fichas(productos.filter((p) => p.cat === cat))}`);

    if (pedirVarios(q)) return;

    const { cantidad, tokens, soloCantidad } = parse(q);
    if (soloCantidad) return cantidadSuelta(cantidad, t);
    const { lista, exacto } = buscar(tokens);
    ctx = lista.length === 1 && lista[0].stock > 0 ? lista[0].id : null; // «Lo tenemos»: lo que siga se refiere a este producto
    if (!lista.length)
      return bot(
        `No encontré «${esc(q)}» en el catálogo. Prueba con otra palabra o elige una categoría:${chipsCategorias()}` +
          `<span class="cot-hint">O pregúntanos directo por <a href="${wa(`Hola, ¿tienen ${q}?`)}" target="_blank" rel="noopener">WhatsApp</a>.</span>`
      );
    if (lista.length === 1 && exacto) {
      const p = lista[0];
      if (p.stock <= 0) return sinStock(p);
      if (cantidad) return agregar(p.id, cantidad);
    }
    const top = lista.slice(0, 6);
    const intro = exacto
      ? lista.length === 1
        ? "Lo tenemos:"
        : `Encontré ${lista.length} opciones:`
      : "Esto es lo más parecido que encontré:";
    bot(`${intro}${fichas(top, cantidad)}${lista.length > top.length ? `<span class="cot-hint">Afina la búsqueda para ver más.</span>` : ""}`);
  }

  function abrirDetalle(abrir) {
    detalle.hidden = !abrir;
    toggle.setAttribute("aria-expanded", String(abrir));
  }

  /* ---------- Eventos ---------- */
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    yo(q);
    input.value = "";
    responder(q);
  });

  slot.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b || !slot.contains(b)) return;
    if (b.dataset.add !== undefined) {
      const fila = b.closest("li");
      const n = parseInt(fila.querySelector("input").value, 10);
      yo(`Agregar ${n > 0 ? n : 1}`);
      agregar(+b.dataset.add, n > 0 ? n : 1);
    } else if (b.dataset.cat) {
      yo(b.dataset.cat);
      responder(b.dataset.cat);
    } else if (b.dataset.del !== undefined) {
      cot.delete(+b.dataset.del);
      pintarCot();
    } else if (b.dataset.vaciar !== undefined) {
      cot.clear();
      pintarCot();
      abrirDetalle(false);
      bot("Vacié tu cotización. ¿Qué producto buscas?");
    } else if (b === toggle) {
      abrirDetalle(detalle.hidden);
    }
  });

  // API para la vitrina de productos (assets/ferreteria.js)
  window.Cotizador = {
    agregar: (id, cant) => { yo(`Agregar ${cant} × ${productos[id].nombre}`); agregar(id, cant); },
    preguntar: (q) => { yo(q); responder(q); },
    stockLibre: (id) => productos[id].stock - (cot.get(id) || 0),
  };

  if (cot.size) pintarCot();
  window.addEventListener("pageshow", (e) => { if (e.persisted) location.reload(); });

  bot(
    `Hola, ¿qué producto necesitas cotizar? Escribe, por ejemplo, <em>«3 sacos cemento melón»</em> o <em>«fierro 10 mm»</em>, o elige una categoría:${chipsCategorias()}`
  );
})();

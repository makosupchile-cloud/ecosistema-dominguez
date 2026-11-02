/* Simulación tipo mensajería de la cotización de Ferretería La Italiana.
   Usa el mismo catálogo (assets/catalogo.js) y las mismas reglas que el asistente de /ferreteria,
   pero NO se conecta a WhatsApp ni a ningún servicio: el cierre es simulado dentro de la página.
   No hay IA ni servidor; es lógica de búsqueda sobre el catálogo de prueba. */
(function () {
  const CAT = window.CATALOGO;
  const F = window.SITE && window.SITE.ferreteria;
  const chat = document.getElementById("waChat");
  const form = document.getElementById("waForm");
  const input = document.getElementById("waInput");
  const quick = document.getElementById("waQuick");
  const playBtn = document.getElementById("waPlay");
  const resetBtn = document.getElementById("waReset");
  if (!CAT || !F || !chat) return;

  // Número que recibe las cotizaciones de esta demo (solo se usa aquí; el resto del sitio usa números de prueba).
  const DEMO_WHATSAPP = "56979692379";

  document.getElementById("waNombre").textContent = `Ferretería ${F.nombre}`;

  /* ---------- Utilidades ---------- */
  const clp = (n) => "$" + Math.round(n).toLocaleString("es-CL");
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) =>
    String(s)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/(\d)([a-z])/g, "$1 $2")
      .replace(/[^a-z0-9/,.\s]/g, " ")
      .replace(/(?<!\d)[,.]|[,.](?!\d)/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
  const sinMov = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hora = () => new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", hour12: false });
  const texto = (html) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  const productos = CAT.productos.map((p, i) => ({ ...p, id: i, texto: norm(p.nombre + " " + p.cat) }));
  const categorias = [...new Set(CAT.productos.map((p) => p.cat))];

  /* ---------- Búsqueda (misma lógica que assets/cotizador.js) ---------- */
  const STOP = new Set(
    ("de del la las el los un una unos unas y o a al en con para por que me se mi tu su lo le " +
      "hola quiero necesito busco buscando cotizar cotizacion cotiza precio precios valor cuanto " +
      "cuesta sale vale stock hay tienen tiene tienes queda quedan disponible favor porfa dame " +
      "ver saber consultar consulta algo buenas buenos dias tardes noches alo")
      .split(" ")
  );
  const SINONIMOS = { kilo: "kg", kilos: "kg", galones: "galon" };
  // Palabras de uso común que apuntan a un producto del catálogo.
  const ALIAS = {
    tablas: "pino", tabla: "pino", listones: "pino", liston: "pino",
    techo: "zinc", techar: "zinc", techumbre: "zinc",
    ladrillo: "cemento", ladrillos: "cemento", pegar: "cemento", mortero: "cemento", hormigon: "cemento", concreto: "cemento",
    pintar: "pintura", perforar: "taladro", taladrar: "taladro",
    caneria: "tubo", canerias: "tubo", fierros: "fierro",
  };
  const UNIDADES = "unidades|unidad|un|sacos|saco|barras|barra|planchas|plancha|rollos|rollo|cajas|caja|galones|galon|pares|par|tubos|tubo|kilos|kilo";

  function parse(q) {
    let t = norm(q);
    let cantidad = null;
    let m;
    if ((m = t.match(new RegExp(`(^|\\s)(\\d{1,4})\\s+(${UNIDADES})\\b`)))) {
      cantidad = +m[2];
      t = t.replace(m[0], `${m[1]}${m[3]}`);
    } else if ((m = t.match(/^(\d{1,4})\s+(?!(mm|cm|m|kg|w|oz|pulgadas?)\b)/))) {
      cantidad = +m[1];
      t = t.slice(m[0].length);
    } else if ((m = t.match(/\s(?:x|por)\s*(\d{1,4})$/))) {
      cantidad = +m[1];
      t = t.slice(0, m.index);
    }
    const tokens = t
      .split(" ")
      .filter((w) => w && !STOP.has(w) && (w.length > 1 || /\d/.test(w)))
      .map((w) => SINONIMOS[w] || ALIAS[w] || w);
    return { cantidad: cantidad && cantidad > 0 ? cantidad : null, tokens };
  }
  const coincide = (txt, tk) =>
    txt.includes(tk) ||
    (tk.length > 4 && tk.endsWith("es") && txt.includes(tk.slice(0, -2))) ||
    (tk.length > 3 && tk.endsWith("s") && txt.includes(tk.slice(0, -1)));
  function buscar(tokens) {
    if (!tokens.length) return { lista: [], exacto: false };
    const puntaje = productos.map((p) => ({ p, s: tokens.filter((tk) => coincide(p.texto, tk)).length }));
    const max = Math.max(...puntaje.map((x) => x.s));
    if (!max) return { lista: [], exacto: false };
    return { lista: puntaje.filter((x) => x.s === max).map((x) => x.p), exacto: max === tokens.length };
  }

  /* ---------- Estado ---------- */
  const cot = new Map(); // id -> cantidad
  const total = () => [...cot].reduce((s, [id, c]) => s + productos[id].precio * c, 0);
  let nCot = 0;
  let gen = 0; // se incrementa al reiniciar para descartar mensajes pendientes
  let cola = Promise.resolve();
  let jugando = false;

  /* ---------- Mensajes ---------- */
  function pintar(tipo, html) {
    const el = document.createElement("div");
    el.className = `msg msg--${tipo}`;
    el.innerHTML =
      `<div class="msg__body">${html}</div>` +
      `<span class="msg__meta">${hora()}${tipo === "out" ? '<span class="msg__tick" aria-label="entregado">✓✓</span>' : ""}</span>`;
    chat.appendChild(el);
    chat.scrollTop = chat.scrollHeight;
    return el;
  }
  function escribiendo() {
    const el = document.createElement("div");
    el.className = "msg msg--in";
    el.innerHTML = '<span class="typing" aria-label="escribiendo"><i></i><i></i><i></i></span>';
    chat.appendChild(el);
    chat.scrollTop = chat.scrollHeight;
    return el;
  }
  function enc(fn) {
    const g = gen;
    cola = cola.then(() => (g === gen ? fn(g) : null)).catch(() => {});
    return cola;
  }
  function bot(html) {
    return enc(async (g) => {
      const t = escribiendo();
      if (!sinMov) await esperar(Math.min(1100, Math.max(600, 400 + texto(html).length * 6)));
      t.remove();
      if (g !== gen) return;
      pintar("in", html);
    });
  }
  function yo(txt) {
    return enc(async () => {
      pintar("out", esc(txt));
      if (!sinMov) await esperar(250);
    });
  }

  /* ---------- Piezas de interfaz ---------- */
  const chips = () =>
    `<div class="chips">${categorias.map((c) => `<button type="button" data-cat="${esc(c)}">${esc(c)}</button>`).join("")}</div>`;
  const qr = (...botones) =>
    `<div class="qr">${botones.map(([act, label]) => `<button type="button" data-act="${act}">${esc(label)}</button>`).join("")}</div>`;

  function fichas(lista, cantidad) {
    return `<ul class="items">${lista
      .map((p) => {
        const hay = p.stock > 0;
        const estado = hay
          ? `${p.stock} disponibles`
          : `Sin stock${p.reposicion ? ` · reposición: ${esc(p.reposicion)}` : ""}`;
        const accion = hay
          ? `<input type="number" inputmode="numeric" min="1" max="${p.stock}" value="${Math.min(cantidad || 1, p.stock)}" aria-label="Cantidad de ${esc(p.nombre)}">
             <button type="button" data-add="${p.id}">Agregar</button>`
          : `<button type="button" data-avisar="${p.id}">Avisarme</button>`;
        return `<li class="${hay ? "" : "is-out"}">
          <div class="items__info"><span class="items__name">${esc(p.nombre)}</span><small>${clp(p.precio)} · ${estado}</small></div>
          <div class="items__act">${accion}</div>
        </li>`;
      })
      .join("")}</ul>`;
  }
  const lineasCot = (conQuitar) =>
    `<ul class="lines">${[...cot]
      .map(
        ([id, c]) =>
          `<li><span>${c} × ${esc(productos[id].nombre)}</span><span>${clp(productos[id].precio * c)}${
            conQuitar ? `<button type="button" class="lines__del" data-quitar="${id}" aria-label="Quitar ${esc(productos[id].nombre)}">✕</button>` : ""
          }</span></li>`
      )
      .join("")}</ul>
     <div class="lines__total"><span>Total · IVA incl.</span><span>${clp(total())}</span></div>`;

  /* ---------- Acciones ---------- */
  const sharesWord = (a, b) => b.texto.split(" ")[0] === a.texto.split(" ")[0];
  function sinStock(p) {
    const alt = productos.filter((x) => x.cat === p.cat && x.stock > 0 && x.id !== p.id && sharesWord(x, p));
    bot(
      `<strong>${esc(p.nombre)}</strong> está sin stock${p.reposicion ? `; la reposición estimada es <strong>${esc(p.reposicion)}</strong>` : ""}.` +
        (alt.length ? ` Te puedo ofrecer estas alternativas disponibles hoy:${fichas(alt)}` : "")
    );
  }

  function agregar(id, cant) {
    const p = productos[id];
    const ya = cot.get(id) || 0;
    const libre = p.stock - ya;
    if (p.stock <= 0) return sinStock(p);
    if (libre <= 0)
      return bot(`Ya tienes en tu cotización todo el stock disponible de <strong>${esc(p.nombre)}</strong> (${p.stock}).`);
    const n = Math.min(cant, libre);
    cot.set(id, ya + n);
    const aviso = n < cant ? `Pediste ${cant}, pero hay ${libre} disponibles. ` : "";
    bot(
      `${aviso}Agregué <strong>${n} × ${esc(p.nombre)}</strong> (${clp(p.precio * n)}). ¿Algo más?` +
        qr(["ver", "Ver mi cotización"], ["seguir", "Seguir buscando"])
    );
  }

  function verCotizacion() {
    if (!cot.size) return bot("Tu cotización está vacía por ahora. Escribe un producto para empezar.");
    bot(
      `Esta es tu cotización (${cot.size} ${cot.size === 1 ? "producto" : "productos"}):${lineasCot(true)}` +
        `<span class="msg__note">Precios de lista con IVA incluido. Toca ✕ o escribe «quita el cemento» para sacar un producto.</span>` +
        qr(["enviar", "Enviar a la tienda"], ["seguir", "Seguir agregando"], ["vaciar", "Vaciar cotización"])
    );
  }

  function enviarATienda() {
    if (!cot.size) return bot("Tu cotización está vacía. Agrega un producto y la enviamos.");
    nCot += 1;
    const num = String(nCot).padStart(4, "0");
    const monto = clp(total());
    const lineas = [...cot].map(([id, c]) => `• ${c} × ${productos[id].nombre} — ${clp(productos[id].precio * c)}`).join("\n");
    const msg =
      `[DEMO] Cotización N° ${num} — Ferretería ${F.nombre}\n\n${lineas}\n\n` +
      `Total referencial: ${monto} (IVA incluido, precios de lista).`;
    const enlace = `https://wa.me/${DEMO_WHATSAPP}?text=${encodeURIComponent(msg)}`;
    cot.clear();
    if (jugando) {
      // Ejemplo guiado: todo simulado, no se abre WhatsApp.
      return bot(
        `✅ Listo. Registré tu cotización <strong>N° ${num}</strong> por <strong>${monto}</strong> (IVA incluido).<br><br>` +
          `Pásate por <strong>${esc(F.direccion)}</strong> para confirmarla y retirar. Nuestro equipo revisa contigo descuentos y condiciones.` +
          `<span class="msg__note">Ejemplo: aquí se enviaría la cotización a la tienda.</span>`
      );
    }
    bot(
      `✅ Listo. Armé tu cotización <strong>N° ${num}</strong> por <strong>${monto}</strong> (IVA incluido).<br><br>` +
        `Toca el botón para enviarla por WhatsApp a la tienda. Después te esperamos en <strong>${esc(F.direccion)}</strong> para confirmarla y retirar.` +
        `<div class="qr"><a href="${enlace}" target="_blank" rel="noopener">Enviar por WhatsApp</a></div>` +
        `<span class="msg__note">Demo: se abrirá tu WhatsApp con la cotización lista para enviar.</span>`
    );
  }

  function quitar(id, cant) {
    const p = productos[id];
    const ya = cot.get(id) || 0;
    if (!ya) return;
    if (cant && cant < ya) {
      cot.set(id, ya - cant);
      return bot(`Listo, saqué ${cant} × <strong>${esc(p.nombre)}</strong>. Quedan ${ya - cant}.${cot.size ? lineasCot(true) : ""}`);
    }
    cot.delete(id);
    bot(
      `Listo, quité <strong>${esc(p.nombre)}</strong> de tu cotización.` +
        (cot.size ? `${lineasCot(true)}${qr(["enviar", "Enviar a la tienda"], ["seguir", "Seguir agregando"])}` : " Quedó vacía; escribe un producto para empezar.")
    );
  }
  function quitarPorTexto(q) {
    if (!cot.size) return bot("Tu cotización está vacía, no hay nada que quitar.");
    const sin = q.replace(/\b(quita|quitar|quitame|quítame|elimina|eliminar|saca|sacar|sácame|borra|borrar|remueve|remover|el|la|los|las|del|de|un|una|unos|unas|por favor|porfa)\b/gi, " ");
    const { cantidad, tokens } = parse(sin);
    if (/\b(todo|todos|todas|cotizacion|carrito|pedido)\b/.test(norm(sin)) && !tokens.some((k) => [...cot.keys()].some((id) => coincide(productos[id].texto, k))))
      return vaciar();
    const pts = [...cot.keys()]
      .map((id) => [id, tokens.filter((k) => coincide(productos[id].texto, k)).length])
      .filter(([, n]) => n > 0)
      .sort((a, b) => b[1] - a[1]);
    if (!pts.length || (pts.length > 1 && pts[0][1] === pts[1][1]))
      return bot(`¿Cuál quieres quitar? Toca ✕ en el producto:${lineasCot(true)}`);
    quitar(pts[0][0], cantidad && /\d/.test(sin) ? cantidad : 0);
  }

  function vaciar() {
    cot.clear();
    bot("Vacié tu cotización. ¿Qué producto buscas?");
  }

  const saludo = () =>
    bot(
      `¡Hola! Soy el asistente de cotización de <strong>Ferretería ${esc(F.nombre)}</strong>. ` +
        `Dime qué producto necesitas, por ejemplo <em>«12 sacos cemento melón»</em>, o elige una categoría:${chips()}`
    );

  function responder(q) {
    const t = norm(q);
    if (!t) return;
    const { cantidad, tokens } = parse(q);
    const res = buscar(tokens);

    if (/^(hola|buenas|buenos|alo)\b/.test(t) && !tokens.length) return saludo();
    if (/\bgracias\b/.test(t)) return bot("¡De nada! Cuando quieras, te dejo la cotización registrada para que la confirmes en tienda.");
    if (/\b(descuento|descuentos|rebaja|oferta|mayorista|por mayor|precio especial)\b/.test(t))
      return bot("Los precios que te muestro son de lista. Descuentos y condiciones especiales los confirma directamente nuestro equipo en tienda.");
    if (/\b(despacho|despachos|envio|envios|delivery|reparto)\b/.test(t))
      return bot(`El despacho lo confirma nuestro equipo en tienda (<strong>${esc(F.direccion)}</strong>). Si quieres, deja tu cotización armada y la revisan contigo.`);
    if (/\b(direccion|donde|ubicacion|ubicados|local|horario|horarios)\b/.test(t))
      return bot(`Estamos en <strong>${esc(F.direccion)}</strong>. Los horarios te los confirma nuestro equipo en tienda.`);
    if (/\b(enviar|envia|mandar|manda|confirmar|confirmo)\b/.test(t) && !res.exacto) return enviarATienda();
    if (/\b(quita|quitar|quitame|elimina|eliminar|saca|sacar|borra|borrar|remueve|remover)\b/.test(t) && cot.size) return quitarPorTexto(q);
    if (/\b(vaciar|borrar|limpiar)\b/.test(t) && !res.exacto) return vaciar();
    if (/\b(cotizacion|resumen|total|carrito|mi pedido)\b/.test(t) && !res.exacto) return verCotizacion();

    const cat = categorias.find((c) => norm(c) === t || norm(c).split(" ")[0] === t);
    if (cat) return bot(`Esto tenemos en <strong>${esc(cat)}</strong>:${fichas(productos.filter((p) => p.cat === cat))}`);

    const { lista, exacto } = res;
    if (!lista.length)
      return bot(
        `No encontré «${esc(q)}» en el catálogo. Prueba con otra palabra o elige una categoría:${chips()}` +
          `<span class="msg__note">Si no lo ves, nuestro equipo en tienda puede revisarlo contigo.</span>`
      );
    if (lista.length === 1) {
      const p = lista[0];
      if (p.stock <= 0) return sinStock(p);
      if (exacto && cantidad) return agregar(p.id, cantidad);
    }
    const top = lista.slice(0, 6);
    const intro = exacto ? (lista.length === 1 ? "Lo tenemos:" : `Encontré ${lista.length} opciones:`) : "Esto es lo más parecido que encontré:";
    bot(`${intro}${fichas(top, cantidad)}${lista.length > top.length ? '<span class="msg__note">Afina la búsqueda para ver más.</span>' : ""}`);
  }

  function procesar(q) {
    const txt = q.trim();
    if (!txt) return;
    yo(txt);
    responder(txt);
  }

  /* ---------- Eventos ---------- */
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (jugando) return;
    const q = input.value;
    input.value = "";
    procesar(q);
  });

  quick.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b || jugando) return;
    if (b === playBtn) return ejemplo();
    if (b.dataset.q) procesar(b.dataset.q);
  });

  chat.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b || jugando) return;
    if (b.dataset.add !== undefined) {
      const n = parseInt(b.closest("li").querySelector("input").value, 10);
      const cant = n > 0 ? n : 1;
      yo(`Agregar ${cant} × ${productos[+b.dataset.add].nombre}`);
      agregar(+b.dataset.add, cant);
    } else if (b.dataset.quitar !== undefined) {
      const id = +b.dataset.quitar;
      if (!cot.has(id)) return;
      yo(`Quitar ${productos[id].nombre}`);
      quitar(id, 0);
    } else if (b.dataset.cat) {
      procesar(b.dataset.cat);
    } else if (b.dataset.avisar !== undefined) {
      const p = productos[+b.dataset.avisar];
      yo(`Avísenme cuando llegue ${p.nombre}`);
      bot(`Anotado. Dejé el aviso por <strong>${esc(p.nombre)}</strong>.<span class="msg__note">Simulación: en la versión conectada, la tienda recibiría este aviso.</span>`);
    } else if (b.dataset.act) {
      const a = b.dataset.act;
      if (a === "ver") { yo("Ver mi cotización"); verCotizacion(); }
      else if (a === "seguir") { yo("Seguir buscando"); bot(`Dime qué otro producto necesitas o elige una categoría:${chips()}`); }
      else if (a === "enviar") { yo("Enviar a la tienda"); enviarATienda(); }
      else if (a === "vaciar") { yo("Vaciar cotización"); vaciar(); }
    }
  });

  /* ---------- Reinicio y ejemplo guiado ---------- */
  function reiniciar() {
    gen += 1;
    cola = Promise.resolve();
    chat.innerHTML = "";
    cot.clear();
    nCot = 0;
    const dia = document.createElement("div");
    dia.className = "wa__day";
    dia.textContent = "Hoy";
    chat.appendChild(dia);
    saludo();
  }
  resetBtn.addEventListener("click", () => {
    if (jugando) return;
    reiniciar();
  });

  function bloquear(si) {
    jugando = si;
    input.disabled = si;
    quick.querySelectorAll("button").forEach((b) => (b.disabled = si));
    playBtn.textContent = si ? "Reproduciendo…" : "▶ Ver ejemplo";
  }
  async function teclear(txt) {
    input.value = "";
    if (sinMov) { input.value = txt; return; }
    for (const ch of txt) {
      input.value += ch;
      await esperar(34);
    }
  }
  async function ejemplo() {
    if (jugando) return;
    reiniciar();
    bloquear(true);
    const g = gen;
    const pasos = [
      "Necesito 12 sacos de cemento melón",
      "Y 40 barras de fierro 10 mm",
      "Ver mi cotización",
      "Enviar a la tienda",
    ];
    await cola;
    for (const paso of pasos) {
      if (g !== gen) break;
      await esperar(sinMov ? 0 : 900);
      await teclear(paso);
      await esperar(sinMov ? 0 : 350);
      input.value = "";
      procesar(paso);
      await cola;
    }
    bloquear(false);
  }

  reiniciar();
})();

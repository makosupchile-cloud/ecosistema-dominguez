/* ==========================================================================
   CONFIGURACIÓN EDITABLE — Ecosistema Domínguez (propuesta conceptual)
   Todo el contenido del sitio sale de este archivo: textos, teléfonos,
   precios y rutas de imágenes. Edita aquí y vuelve a publicar.
   - Teléfonos WhatsApp: solo dígitos, con código país (56) y sin "+".
   - Imágenes: URL absoluta (Unsplash) o ruta local, ej. "assets/img/cabana.jpg".
   ========================================================================== */

const U = (id, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;

window.SITE = {
  marca: "Domínguez",
  ciudad: "Cañete",

  hero: {
    eyebrow: "Cañete · Provincia de Arauco",
    titulo: "Cuatro experiencias,<br><em>un mismo anfitrión</em>",
    bajada: "Ferretería, centro vacacional, restaurante y hotelería. Todo a un mensaje de distancia.",
    imagen: U("photo-1542314831-068cd1dbfeeb", 2000),
  },

  ferreteria: {
    nav: "Ferretería",
    eyebrow: "Desde Cañete",
    nombre: "La Italiana",
    subtitulo: "Ferretería",
    // Si tienes el logo real, pon la ruta aquí (ej. "assets/logo-la-italiana.svg").
    // Vacío = se usa el wordmark tipográfico provisional.
    logo: "",
    direccion: "Uribe 406, Cañete",
    texto:
      "Consulta stock y cotiza al instante por WhatsApp, con precios de lista actualizados. Descuentos y condiciones especiales se confirman directo con nuestro equipo.",
    imagen: U("photo-1504148455328-c376907d081c", 1400),
    chatEtiqueta: "Cotiza con nuestro asistente",
    whatsapp: "56900000000",
    mensaje: "Hola, quiero cotizar en Ferretería La Italiana.",
  },

  vacacional: {
    nav: "Centro Vacacional",
    eyebrow: "Centro Vacacional · Alto Tucapel",
    titulo: "Desconéctate sin salir de Cañete",
    texto:
      "Cabañas equipadas, piscina y naturaleza a minutos del centro. Revisa disponibilidad y reserva directo por WhatsApp.",
    // Video de fondo: deja "" para usar solo la imagen. Ej: "assets/video/alto-tucapel.mp4"
    video: "",
    poster: U("photo-1449158743715-0a90ebb6d2d8", 2000),
    galeria: [
      { src: U("photo-1510798831971-661eb04b3739"), alt: "Cabaña de madera rodeada de bosque", pie: "Cabañas" },
      { src: U("photo-1571896349842-33c89424de2d"), alt: "Piscina al aire libre", pie: "Piscina" },
      { src: U("photo-1441974231531-c6227db76b6e"), alt: "Bosque nativo con luz de tarde", pie: "Naturaleza" },
    ],
    whatsapp: "56900000001", // placeholder A
    mensaje: "Hola, quiero consultar disponibilidad en el Centro Vacacional Alto Tucapel.",
  },

  restaurante: {
    nav: "Restaurante",
    eyebrow: "Restaurante",
    titulo: "Sabor casero en Cañete",
    texto:
      "Colación diaria, platos de la casa y buena carta de tragos. Consulta el menú del día por WhatsApp.",
    imagen: U("photo-1414235077428-338989a2e8c0", 2000),
    menuPdf: "assets/menu-placeholder.pdf",
    secciones: [
      {
        titulo: "Colación del día",
        nota: "Lunes a viernes · 13:00 a 15:30",
        imagen: U("photo-1546069901-ba9599a7e63c", 900),
        items: [
          { nombre: "Entrada del día", detalle: "Ensalada de estación", precio: "Incluido" },
          { nombre: "Plato de fondo", detalle: "Preparación casera, cambia a diario", precio: "Incluido" },
          { nombre: "Colación completa", detalle: "Entrada, fondo, postre y bebida", precio: "$ 0.000" },
        ],
      },
      {
        titulo: "Platos de la casa",
        nota: "Todos los días",
        imagen: U("photo-1544025162-d76694265947", 900),
        items: [
          { nombre: "Plato de la casa I", detalle: "Descripción breve del plato", precio: "$ 00.000" },
          { nombre: "Plato de la casa II", detalle: "Descripción breve del plato", precio: "$ 00.000" },
          { nombre: "Plato de la casa III", detalle: "Descripción breve del plato", precio: "$ 00.000" },
        ],
      },
      {
        titulo: "Tragos",
        nota: "Barra abierta desde las 18:00",
        imagen: U("photo-1514362545857-3bc16c4c7d1b", 900),
        items: [
          { nombre: "Cóctel de autor", detalle: "Receta de la casa", precio: "$ 0.000" },
          { nombre: "Pisco sour", detalle: "Clásico o de sabores", precio: "$ 0.000" },
          { nombre: "Copa de vino", detalle: "Selección del valle", precio: "$ 0.000" },
        ],
      },
    ],
    whatsapp: "56900000002", // placeholder B
    mensaje: "Hola, ¿cuál es el menú del día?",
  },

  hoteleria: {
    nav: "Hotelería",
    eyebrow: "Hotelería",
    titulo: "Tu descanso en Cañete",
    texto: "Piezas disponibles para tu estadía. Revisa disponibilidad y reserva por WhatsApp.",
    moneda: "CLP",
    notaPrecio: "Precios referenciales por noche. Sujetos a disponibilidad y temporada.",
    piezas: [
      {
        tipo: "Simple",
        imagen: U("photo-1631049307264-da0ec9d70304", 1000),
        capacidad: "1 persona",
        caracteristicas: ["Cama de 1,5 plazas", "Baño privado", "Wi-Fi", "Escritorio"],
        precio: "$ 000.000",
      },
      {
        tipo: "Doble",
        imagen: U("photo-1590490360182-c33d57733427", 1000),
        capacidad: "2 personas",
        caracteristicas: ["Dos camas individuales", "Baño privado", "Wi-Fi", "TV"],
        precio: "$ 000.000",
      },
      {
        tipo: "Matrimonial",
        imagen: U("photo-1611892440504-42a792e24d32", 1000),
        capacidad: "2 personas",
        caracteristicas: ["Cama de 2 plazas", "Baño privado", "Wi-Fi", "Ropa de cama premium"],
        precio: "$ 000.000",
      },
      {
        tipo: "Cuatro personas",
        imagen: U("photo-1618773928121-c32242e63f39", 1000),
        capacidad: "4 personas",
        caracteristicas: ["Cama de 2 plazas + 2 individuales", "Baño privado", "Wi-Fi", "Amplio espacio"],
        precio: "$ 000.000",
      },
    ],
    whatsapp: "56900000003", // placeholder C
    mensaje: "Hola, quiero reservar una pieza.",
  },

  pie: "Propuesta conceptual — Reanimasem Agencia",
};

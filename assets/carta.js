/* ==========================================================================
   CARTA DEL RESTAURANTE — DATOS DE PRUEBA (propuesta conceptual)
   Platos, descripciones y precios de ejemplo para mostrar el funcionamiento
   de la página /restaurante. Reemplazar por la carta real antes de usarla.
   - precio: pesos chilenos (número, sin puntos)
   - etiquetas: "Picante", "Vegetariano", "Para 2", "Frío", "Caliente", "Sin alcohol"
   - img: id de Unsplash o ruta local; vacío = ícono de la categoría
   - disponible: false = se muestra como agotado hoy
   ========================================================================== */

(function () {
  const F = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=640&q=70`;

  window.CARTA = {
    actualizado: "2026-10-27",
    categorias: [
      {
        nombre: "Colación del día",
        nota: "Lunes a viernes · 13:00 a 15:30",
        platos: [
          { nombre: "Colación completa", detalle: "Entrada del día, plato de fondo, postre y bebida.", precio: 7990, img: F("photo-1547592180-85f173990554"), etiquetas: ["Caliente"] },
          { nombre: "Plato de fondo del día", detalle: "Preparación casera que cambia a diario. Pregunta por el de hoy.", precio: 5990, img: F("photo-1504674900247-0877df9cc836"), etiquetas: ["Caliente"] },
        ],
      },
      {
        nombre: "Platos de la casa",
        platos: [
          { nombre: "Costillar BBQ", detalle: "Costillas de cerdo en cocción lenta con salsa barbacoa de la casa y papas fritas.", precio: 16900, img: F("photo-1544025162-d76694265947"), etiquetas: ["Caliente"] },
          { nombre: "Lomo con papas fritas", detalle: "Lomo a la plancha, jugoso, con papas fritas caseras.", precio: 15900, img: F("photo-1600891964092-4316c288032e"), etiquetas: ["Caliente"] },
          { nombre: "Pollo crispy", detalle: "Trutros de pollo apanados y crujientes, con acompañamiento a elección.", precio: 11900, img: F("photo-1626082927389-6cd097cdc6ec"), etiquetas: ["Caliente"] },
          { nombre: "Penne arrabbiata", detalle: "Pasta corta en salsa de tomate con ají y parmesano.", precio: 9900, img: F("photo-1621996346565-e3dbc646d9a9"), etiquetas: ["Picante", "Vegetariano"] },
        ],
      },
      {
        nombre: "Del mar",
        platos: [
          { nombre: "Ceviche de reineta", detalle: "Reineta fresca en jugo de limón con cebolla morada, cilantro y camote.", precio: 10900, img: F("photo-1535399831218-d5bd36d1a6b3"), etiquetas: ["Frío"] },
          { nombre: "Camarones al pil pil con arroz", detalle: "Camarones salteados en aceite de oliva, ajo y ají, con arroz graneado.", precio: 11900, img: F("photo-1559847844-5315695dadae"), etiquetas: ["Picante", "Caliente"] },
        ],
      },
      {
        nombre: "Sándwiches y hamburguesas",
        platos: [
          { nombre: "Hamburguesa de la casa", detalle: "Carne casera de 200 g, queso fundido, cebolla caramelizada y salsa de la casa.", precio: 9900, img: F("photo-1568901346375-23c9450c58cd") },
          { nombre: "Hamburguesa clásica", detalle: "Carne casera, lechuga, tomate, queso cheddar y mayonesa.", precio: 8900, img: F("photo-1571091718767-18b5b1457add") },
          { nombre: "Barros Luco", detalle: "Carne a la plancha con queso fundido en pan frica.", precio: 7900, img: F("photo-1528735602780-2552fd46c7af") },
        ],
      },
      {
        nombre: "Ensaladas",
        platos: [
          { nombre: "Ensalada de la casa", detalle: "Hojas verdes, palta, tomate, garbanzos y vegetales de estación.", precio: 7900, img: F("photo-1512621776951-a57141f2eefd"), etiquetas: ["Vegetariano", "Frío"] },
          { nombre: "Bowl proteico", detalle: "Hojas verdes, huevo, pollo a la plancha, choclo, pepino y aderezo de la casa.", precio: 8900, img: F("photo-1546069901-ba9599a7e63c"), etiquetas: ["Frío"] },
        ],
      },
      {
        nombre: "Para compartir",
        platos: [
          { nombre: "Parrillada para dos", detalle: "Selección de carnes y brochetas a la parrilla con salsas de la casa.", precio: 24900, img: F("photo-1555939594-58d7cb561ad1"), etiquetas: ["Para 2", "Caliente"] },
          { nombre: "Papas fritas", detalle: "Porción de papas fritas caseras con salsas.", precio: 4900, img: F("photo-1630384060421-cb20d0e0649d"), etiquetas: ["Vegetariano"] },
        ],
      },
      {
        nombre: "Postres",
        platos: [
          { nombre: "Torta de chocolate", detalle: "Trozo de torta casera de chocolate.", precio: 4500, img: F("photo-1578985545062-69928b1d9587") },
          { nombre: "Copa de helado", detalle: "Helado con salsa de chocolate y galleta.", precio: 3990, img: F("photo-1563805042-7684c019e1cb") },
        ],
      },
      {
        nombre: "Tragos",
        nota: "Barra abierta desde las 18:00",
        platos: [
          { nombre: "Pisco sour", detalle: "Clásico, preparado al momento.", precio: 4900, img: F("photo-1544145945-f90425340c7e") },
          { nombre: "Mojito", detalle: "Ron, menta, limón y soda.", precio: 5900, img: F("photo-1551538827-9c037cb4f32a") },
          { nombre: "Cóctel de autor", detalle: "Receta de la casa. Pregunta por el de la temporada.", precio: 6900, img: F("photo-1514362545857-3bc16c4c7d1b") },
        ],
      },
      {
        nombre: "Bebidas y jugos",
        platos: [
          { nombre: "Limonada menta jengibre", detalle: "Limonada natural con menta y jengibre.", precio: 3500, img: F("photo-1621263764928-df1444c5e859"), etiquetas: ["Sin alcohol"] },
          { nombre: "Jugo natural", detalle: "Sabor de temporada.", precio: 3200, etiquetas: ["Sin alcohol"] },
          { nombre: "Bebida en lata", detalle: "350 ml.", precio: 1800, etiquetas: ["Sin alcohol"] },
        ],
      },
    ],
  };
})();

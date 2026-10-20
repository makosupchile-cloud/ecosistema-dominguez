/* ==========================================================================
   CATÁLOGO FERRETERÍA LA ITALIANA — DATOS DE PRUEBA
   Precios en pesos chilenos, IVA incluido. Lo usa el asistente de cotización
   (assets/cotizador.js). Para actualizar: edita stock/precio y vuelve a publicar.
   - stock: unidades disponibles (0 = sin stock)
   - reposicion: texto opcional que se muestra cuando no hay stock
   ========================================================================== */

window.CATALOGO = {
  actualizado: "2026-10-20", // fecha del stock (AAAA-MM-DD)
  productos: [
    // CONSTRUCCIÓN
    { cat: "Construcción", nombre: "Cemento Melón 25 kg (saco)", stock: 20, precio: 7990 },
    { cat: "Construcción", nombre: "Cemento Polpaico 25 kg (saco)", stock: 35, precio: 7490 },
    { cat: "Construcción", nombre: "Arena fina (saco 25 kg)", stock: 60, precio: 2490 },
    { cat: "Construcción", nombre: "Gravilla (saco 25 kg)", stock: 45, precio: 2690 },
    { cat: "Construcción", nombre: "Yeso cartón 25 kg (saco)", stock: 18, precio: 6990 },
    { cat: "Construcción", nombre: "Fierro estriado 8 mm x 12 m (barra)", stock: 80, precio: 5490 },
    { cat: "Construcción", nombre: "Fierro estriado 10 mm x 12 m (barra)", stock: 55, precio: 8290 },
    { cat: "Construcción", nombre: "Malla acma C-92 (unidad)", stock: 12, precio: 38990 },
    { cat: "Construcción", nombre: "Plancha OSB 11,1 mm 1,22 x 2,44 m", stock: 25, precio: 16990 },
    { cat: "Construcción", nombre: "Plancha zinc acanalada 0,35 mm 3,66 m", stock: 40, precio: 14490 },
    { cat: "Construcción", nombre: "Cemento Bio Bío 25 kg", stock: 0, precio: 7790, reposicion: "la próxima semana" },

    // MADERA
    { cat: "Madera", nombre: "Pino bruto 2x2 x 3,2 m", stock: 120, precio: 2190 },
    { cat: "Madera", nombre: "Pino bruto 2x3 x 3,2 m", stock: 90, precio: 3390 },
    { cat: "Madera", nombre: "Pino cepillado 2x4 x 3,2 m", stock: 70, precio: 5990 },
    { cat: "Madera", nombre: "Terciado estructural 15 mm 1,22 x 2,44 m", stock: 14, precio: 28990 },

    // PINTURA
    { cat: "Pintura", nombre: "Látex interior blanco Ceresita 1 galón", stock: 22, precio: 17990 },
    { cat: "Pintura", nombre: "Látex exterior blanco Sherwin 1 galón", stock: 16, precio: 24990 },
    { cat: "Pintura", nombre: "Esmalte al agua negro mate 1 galón", stock: 9, precio: 21490 },
    { cat: "Pintura", nombre: "Rodillo 23 cm con bandeja", stock: 30, precio: 4990 },
    { cat: "Pintura", nombre: "Brocha 3 pulgadas", stock: 48, precio: 2490 },

    // FIJACIONES Y FERRETERÍA
    { cat: "Fijaciones", nombre: "Clavos 2 pulgadas (kg)", stock: 75, precio: 2990 },
    { cat: "Fijaciones", nombre: "Clavos 3 pulgadas (kg)", stock: 60, precio: 2890 },
    { cat: "Fijaciones", nombre: "Tornillo volcanita 6x1 pulgada (caja 100 un.)", stock: 40, precio: 3490 },
    { cat: "Fijaciones", nombre: "Tornillo autoperforante 8x1 1/2 (caja 100 un.)", stock: 28, precio: 4990 },
    { cat: "Fijaciones", nombre: "Pernos coche 3/8 x 3 pulgadas (unidad)", stock: 150, precio: 390 },

    // ELECTRICIDAD Y GASFITERÍA
    { cat: "Electricidad y gasfitería", nombre: "Cable 2,5 mm (rollo 100 m)", stock: 10, precio: 42990 },
    { cat: "Electricidad y gasfitería", nombre: "Tubo PVC sanitario 110 mm x 3 m", stock: 26, precio: 9990 },
    { cat: "Electricidad y gasfitería", nombre: "Llave de paso 1/2 pulgada", stock: 35, precio: 4490 },
    { cat: "Electricidad y gasfitería", nombre: "Cinta teflón (unidad)", stock: 200, precio: 490 },

    // HERRAMIENTAS
    { cat: "Herramientas", nombre: "Martillo carpintero 16 oz", stock: 15, precio: 7990 },
    { cat: "Herramientas", nombre: "Taladro percutor 650 W", stock: 6, precio: 39990 },
    { cat: "Herramientas", nombre: "Disco corte metal 4 1/2 pulgadas", stock: 100, precio: 1490 },
    { cat: "Herramientas", nombre: "Guantes de cuero (par)", stock: 50, precio: 3490 },
  ],
};

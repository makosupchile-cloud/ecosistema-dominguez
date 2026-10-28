# Estado del proyecto — Ecosistema Domínguez

Actualizado: 2026-10-28 · Propuesta conceptual — Reanimasem Agencia

## Publicación
- **URL:** https://ecosistema-dominguez.vercel.app
- **Repo:** https://github.com/makosupchile-cloud/ecosistema-dominguez (rama `main`)
- **Vercel:** proyecto `ecosistema-dominguez`, equipo `reanimasem`, conectado a GitHub.
  Cada push a `main` se publica solo en producción.
- **Último deploy revisado:** commit `fca658c` (PR #5, caché), estado READY.
- **Acceso:** producción pública (sin login de Vercel); los previews siguen protegidos.
- Sitio estático (HTML + CSS + JS), sin build, servidor ni base de datos.

## Qué está construido
Una portada y **una página por unidad**, con rutas limpias (`cleanUrls` en `vercel.json`).
Diseño negro, blanco y carbón con dorado champán solo en botones y detalles;
Cormorant Garamond (títulos) e Inter (texto); mobile-first.

| Ruta | Contenido |
|---|---|
| `/` | Hero, índice hacia las 4 unidades y enlaces cruzados |
| `/ferreteria` | Tienda de Ferretería La Italiana (Uribe 406): carrusel por categoría, fichas de producto con stock y precio, filtros. Panel «Mi cotización» con el asistente (ver abajo) y botón de WhatsApp. |
| `/centro-vacacional` | Hero «Desconéctate sin salir de Cañete», galería (cabañas, piscina, naturaleza), espacio para video de fondo, WhatsApp A |
| `/restaurante` | «Sabor casero en Cañete»: carta navegable (colación, platos de la casa, tragos) con pedido por WhatsApp (retiro o delivery); botón y QR al PDF del menú; WhatsApp B |
| `/hoteleria` | «Tu descanso en Cañete»: buscador de fechas y huéspedes, 4 tipos de pieza (simple, doble, matrimonial, cuatro personas) con capacidad, características y precio referencial, servicios, ubicación y preguntas frecuentes; la solicitud sale por WhatsApp con fechas y pieza; WhatsApp C |

Pie en todas las páginas: «Propuesta conceptual — Reanimasem Agencia».
Todo termina en WhatsApp: no hay pagos ni reservas en línea.

## Asistente de cotización (única automatización)
`assets/cotizador.js`, montado en el panel lateral de `/ferreteria`.
- Corre en el navegador sobre `assets/catalogo.js` (catálogo de prueba, 33 productos).
- Busca por texto (sin tildes, plurales, «10mm») y entiende cantidades («3 sacos cemento melón»).
- Controla stock: limita la cantidad, avisa si no hay y ofrece alternativas.
- Arma la cotización con total (IVA incluido) y la envía por WhatsApp.
- **No es un bot con IA**: no hay servidor, base de datos ni modelo detrás. No hay otras automatizaciones.

## Dónde se edita (carpeta `assets/`)
- `config.js`: textos, teléfonos, precios, rutas de imágenes, logo y video.
- `catalogo.js`: stock y precios de la ferretería (y fecha `actualizado`).
- `carta.js`: carta del restaurante (platos, precios, etiquetas, disponibilidad).
- `menu-placeholder.pdf`: reemplazar por la carta real; el QR se actualiza solo.
- Scripts por página: `app.js` (portada, centro vacacional, navegación), `ferreteria.js`,
  `restaurante.js`, `hoteleria.js`, `cotizador.js`. Las versiones de los archivos van como
  `?v=AAAAMMDD` en cada HTML para evitar caché viejo; al cambiar un archivo, subir ese número.

## Pendientes
**Datos reales (hoy son de prueba)**
1. Los 4 números de WhatsApp: ferretería `56900000000`, centro vacacional `56900000001`,
   restaurante `56900000002`, hotelería `56900000003`.
2. Catálogo de la ferretería (stock del 2026-10-20) y carta del restaurante (2026-10-27).
3. Precios de hotelería (genéricos).
4. PDF del menú (provisional).

**Piezas que faltan**
5. Logo real de La Italiana: `ferreterialaitaliana.cl` no respondía al intentar descargarlo; hay un
   wordmark tipográfico. Poner el archivo en `assets/` y su ruta en `ferreteria.logo`.
6. Video de fondo del centro vacacional (`vacacional.video`); hoy es una foto con la etiqueta
   «Espacio para video de fondo».
7. Bot real de la ferretería, que reemplazaría al cotizador (se monta en `#chat-widget-slot`).
8. Dirección exacta del hotel (`hoteleria.direccion`, vacía): el mapa apunta a «Cañete».

**Verificación y cierre**
9. Revisar el sitio publicado en un celular real: desde las sesiones de desarrollo no se pudo abrir.
10. Las fotos son de Unsplash, enlazadas por identificador; no se comprobó cada una
    (si una falla se ve un fondo carbón).
11. Sin dominio propio (subdominio gratuito de Vercel), sin analítica y sin formulario fuera de WhatsApp.

## Historial
1. `ed190ba` Landing conceptual inicial (una sola página)
2. `0973083` QR desde CDN y PDF liviano
3. `5e3bdf1` Verificación de conexión Git ↔ Vercel
4. `e89751e` Asistente de cotización con catálogo de prueba
5. `c18f5ed` ESTADO.md (primera versión)
6. PR #1 `rutas-por-unidad`: portada y una página por unidad
7. PR #2 `ferreteria-tienda`: vitrina de tienda en `/ferreteria`
8. PR #3 `hoteleria-reservas`: buscador de fechas y solicitud por WhatsApp en `/hoteleria`
9. PR #4 `restaurante-pedidos`: carta navegable y pedido por WhatsApp en `/restaurante`
10. PR #5 `cache-assets`: versionado de archivos para evitar caché viejo (`fca658c`)

# Estado del proyecto — Ecosistema Domínguez

Actualizado: 2026-10-26 · Propuesta conceptual — Reanimasem Agencia

## Publicación
- **URL:** https://ecosistema-dominguez.vercel.app
- **Repo:** https://github.com/makosupchile-cloud/ecosistema-dominguez (rama `main`)
- **Vercel:** proyecto `ecosistema-dominguez`, equipo `reanimasem`, conectado a GitHub.
  Cada push a `main` se publica solo en producción.
- **Último deploy:** commit `e89751e`, estado READY (revisado el 2026-10-26).
- **Acceso:** producción pública (sin login de Vercel); los previews siguen protegidos.
- Sitio estático (HTML + CSS + JS), sin build ni servidor.

## Qué está construido
Una sola página con menú fijo por anclas y scroll suave:

| Sección | Contenido |
|---|---|
| Inicio | Portada a pantalla completa, índice de las 4 secciones |
| 01 Ferretería La Italiana | Wordmark provisional, texto pedido, dirección (Uribe 406), asistente de cotización, botón WhatsApp |
| 02 Centro Vacacional | Hero "Desconéctate sin salir de Cañete", galería (cabañas, piscina, naturaleza), espacio para video, WhatsApp A |
| 03 Restaurante | "Sabor casero en Cañete", colación / platos de la casa / tragos, botón + QR al PDF del menú, WhatsApp B |
| 04 Hotelería | "Tu descanso en Cañete", 4 tipos de pieza (simple, doble, matrimonial, cuatro personas) con capacidad, características y precio referencial, WhatsApp C |
| Pie | "Propuesta conceptual — Reanimasem Agencia" |

Diseño: negro, blanco y carbón, con dorado champán solo en botones de reserva y detalles. Cormorant Garamond (títulos) e Inter (texto). Mobile-first, animaciones suaves (se desactivan con "reducir movimiento").

## Automatizaciones / "agentes"
Hay **una**: el **asistente de cotización** de la ferretería (`assets/cotizador.js`).
- Corre en el navegador sobre `assets/catalogo.js` (catálogo de prueba: 32 productos).
- Busca por texto (sin tildes, plurales, "10mm"), entiende cantidades ("3 sacos cemento melón").
- Controla stock (limita la cantidad, avisa si no hay, ofrece alternativas).
- Arma la cotización con total (IVA incluido) y la envía por WhatsApp.
- **No es un bot con IA**: no hay servidor, base de datos ni modelo detrás. No hay otros agentes ni automatizaciones.

## Dónde se edita (todo en `assets/`)
- `config.js`: textos, teléfonos, precios de hotelería/restaurante, rutas de imágenes, PDF, video, logo.
- `catalogo.js`: stock y precios de la ferretería (y fecha `actualizado`).
- `menu-placeholder.pdf`: reemplazar por la carta real; el QR se actualiza solo.

## Qué falta (placeholders)
- **Logo real de la ferretería:** `ferreterialaitaliana.cl` no respondía al intentar descargarlo; hay wordmark tipográfico. Poner el archivo en `assets/` y su ruta en `ferreteria.logo`.
- **WhatsApp** (números de prueba): ferretería `56900000000`, centro vacacional `56900000001`, restaurante `56900000002`, hotelería `56900000003`.
- **Precios:** hotelería y restaurante en "$ 000.000" / genéricos.
- **Menú PDF:** provisional.
- **Video de fondo** del centro vacacional: hoy es foto con etiqueta "Espacio para video de fondo" (`vacacional.video`).
- **Catálogo:** datos de prueba con fecha 2026-10-20; hay que cargar el real y mantenerlo al día.
- **Bot real** de la ferretería: reemplaza al cotizador (quitar `cotizador.js` de `index.html` y montar el widget en `#chat-widget-slot`).
- **Fotos:** de Unsplash, enlazadas por identificador; no se verificó cada una desde la sesión (si una falla se ve fondo carbón).
- **Pruebas pendientes:** el sitio publicado no se pudo abrir desde la sesión de desarrollo (red bloqueada); revisarlo en un celular real. Sin dominio propio (usa subdominio gratuito de Vercel).
- Sin analítica, sin formularios ni reservas en línea: todo es por WhatsApp.

## Historial
1. `ed190ba` Landing conceptual inicial
2. `0973083` QR desde CDN y PDF liviano
3. `5e3bdf1` Verificación de conexión Git ↔ Vercel
4. `e89751e` Asistente de cotización con catálogo de prueba

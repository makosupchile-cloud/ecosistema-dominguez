# Ecosistema Domínguez — landing conceptual

Sitio estático (HTML + CSS + JS, sin build). Publicado en Vercel.

## Editar contenido
Todo está en **`assets/config.js`**: textos, números de WhatsApp, precios, rutas de imágenes, PDF del menú y video de fondo.

- Logo real de la ferretería: súbelo a `assets/` y pon su ruta en `ferreteria.logo`.
- Video del centro vacacional: súbelo (mp4) y pon su ruta en `vacacional.video`.
- Menú: reemplaza `assets/menu-placeholder.pdf` (el QR se genera solo con la URL del PDF).
- Catálogo de la ferretería (stock y precios): **`assets/catalogo.js`**. Lo usa el asistente de cotización (`assets/cotizador.js`), que corre en el navegador y se monta en `#chat-widget-slot`.
  Para reemplazarlo por un bot externo, quita `assets/cotizador.js` de `index.html` y monta el widget en ese mismo elemento.

Propuesta conceptual — Reanimasem Agencia.

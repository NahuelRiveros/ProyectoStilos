# Cambio: home más comercial (portada, beneficios, marcas, categorías con foto)

| Estado | Pedido por | Fecha | Spec del módulo |
| --- | --- | --- | --- |
| Hecho | Dueño del proyecto | 2026-11-13 | [tienda_ropa/catalogo.md](../tienda_ropa/catalogo.md) |

## Por qué

Sin banners cargados, el home arranca con texto sobre fondo crema; las marcas (el fuerte de Stilos) están al
final; no se ve el envío gratis ni el pedido por WhatsApp; las categorías son botones sin imagen; y la serif
fina (Cormorant) da un aire de boutique que no acompaña a jeans, zapatillas y marcas urbanas.

## Requisitos

| Código | Requisito | Estado |
| --- | --- | --- |
| ROP-68 | **Tipografía.** Títulos de la tienda en Archivo (sans fuerte); los del home, en mayúsculas. El texto sigue en DM Sans. | ✅ |
| ROP-69 | **Portada propia.** Si no hay banners del carrusel vigentes, el home abre con una portada: título grande, las marcas, botones "Ver colección" y "Ofertas" (si hay) y hasta 3 fotos de las últimas prendas. Con banners, manda el carrusel. | ✅ |
| ROP-70 | **Beneficios.** Debajo de la portada: envío gratis desde el mínimo configurado (si hay), pedido por WhatsApp y retiro en el local. Salen de `proyecto/client_config.js`. | ✅ |
| ROP-71 | **Marcas arriba y marca destacada.** La cinta de marcas va debajo de los beneficios. Un bloque destaca la primera marca de `MARCAS_DESTACADAS` (`proyecto/config/marcas_config.js`) que tenga prendas a la vista: logo, hasta 4 prendas y "Ver todo {marca}". Sin ninguna, no se muestra. | ✅ |
| ROP-72 | **Categorías con foto.** Las categorías principales se muestran como tarjetas con la foto de la prenda más nueva que tengan a la vista (sin foto, el nombre sobre color). | ✅ |
| ROP-73 | **Ofertas deslizables e Instagram.** Las ofertas van en una fila que se desliza, con el % de descuento. Al final, "Seguinos en Instagram" solo si el usuario está cargado en `home_config.js` (hoy `[COMPLETAR]`). | ✅ |

**Fuera de alcance:** banners por marca subidos desde el panel (los banners del core ya permiten cargar
publicidad de marcas en el carrusel), newsletter, videos.

## Diseño

- **API:** `GET /ropa/catalogo/categorias` suma `foto` a las categorías principales (la de la prenda visible más
  nueva de esa rama). Sin cambios en la base.
- **Pantallas:** `tienda/inicio_tienda.jsx` (orden nuevo) y secciones en `tienda/inicio_secciones.jsx`. Fuentes en
  `frontend/index.html` y `proyecto/config/brand_config.js`. Funciones puras (beneficios, % de descuento, marca
  destacada) en `utils/home_tienda.js`, probadas en `ropa_web.test.mjs`. Pensado para celular.

## Tareas

1. [x] Servidor: foto de las categorías principales (test de integración).
2. [x] Frontend: fuentes, secciones y funciones puras (tests).
3. [x] `node scripts/verificar.mjs --completo` en verde y capturas en escritorio y celular.
4. [x] Pasar las reglas a la spec del módulo y marcar este cambio como hecho.

## Decisiones

| Fecha | Regla | Decisión | Quién |
| --- | --- | --- | --- |
| 2026-11-13 | ROP-68 | Títulos en una sans fuerte (Archivo) en vez de Cormorant Garamond. | Dueño del proyecto |
| 2026-11-13 | ROP-69 a ROP-73 | Portada propia + beneficios, marcas arriba + marca destacada, categorías con foto, ofertas deslizables + Instagram. | Dueño del proyecto |

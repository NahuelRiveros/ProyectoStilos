# Cambio: catálogo de ejemplo para probar la tienda en tu PC

| Estado | Pedido por | Fecha | Spec del módulo |
| --- | --- | --- | --- |
| Hecha | Dueño del proyecto | 2026-11-11 | [tienda_ropa/catalogo.md](../tienda_ropa/catalogo.md) |

## Por qué

Para probar la tienda (catálogo, ficha, pedido) hace falta tener prendas cargadas. Este script carga en
la base **local** unas pocas prendas de ejemplo de una marca que vende Stilos, sin tener que cargarlas
a mano desde el panel.

## Requisitos

| Código | Requisito | Estado |
| --- | --- | --- |
| ROP-32 | `node src/modulos/tienda_ropa/seed_catalogo_ejemplo.js` (desde `servidor/`) carga 3 prendas de ejemplo de Taverniti (zapatilla, remera lisa, jean), **ocultas**, pasando por los mismos servicios y reglas que el panel (un color por prenda, talles del grupo, slug con el color). Primero carga los sugeridos (marcas, categorías, colores, talles y diseños) sin duplicar. Volver a correrlo no duplica nada. | ✅ revisado a mano contra la base local |
| ROP-33 | No corre contra producción: se niega con `NODE_ENV=production` o con una `BD_URL` configurada (la base remota). | ✅ revisado a mano |
| ROP-34 | Las fotos se bajan a `frontend/public/catalogo-inicial/`, que **no va a git** (son de otras tiendas: solo para probar). Las fotos de prenda aceptan esas rutas locales además de URLs https. | ✅ `ropa_reglas.test.mjs` › "ROP-34…" |

**Fuera de alcance:** logos de marcas (los favicons de los sitios no sirven como logo: sin logo, el inicio
muestra el nombre), publicar las prendas de ejemplo (el negocio confirma precio, talles y stock y las
activa desde el panel).

## Riesgos

- **Derechos de las fotos y precios:** son de otras tiendas. Por eso no se suben al repo ni a la web
  publicada, y las prendas quedan ocultas. Para la tienda real, fotos propias.
- **Necesita internet** para bajar las fotos; si una falla, esa prenda se omite y el resto sigue.

## Decisiones

| Fecha | Regla | Decisión | Quién |
| --- | --- | --- | --- |
| 2026-11-11 | ROP-32 a ROP-34 | Se arregla el script de otra sesión (duplicaba "Maycla"/"MAYCLA" y desordenaba los talles) y sus fotos no van a git. | Dueño del proyecto |

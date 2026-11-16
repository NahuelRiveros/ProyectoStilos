# Cambio: tienda de demostración completa para la base local

| Estado | Pedido por | Fecha | Spec del módulo |
| --- | --- | --- | --- |
| Hecho | Dueño del proyecto | 2026-11-13 | [tienda_ropa/catalogo.md](../tienda_ropa/catalogo.md) |

## Por qué

Para ver y mostrar la tienda con datos (home, catálogo, filtros, marcas, ofertas) hace falta un catálogo
completo. Cargarlo a mano lleva horas, y las fotos de otras tiendas no se pueden usar.

## Requisitos

| Código | Requisito | Estado |
| --- | --- | --- |
| ROP-74 | `npm --prefix servidor run demo:tienda` carga en la base **local** 36 prendas **visibles** (3 por cada una de las 12 marcas) en todas las categorías principales, con talles del grupo de su categoría (alguno agotado), precio, algunas ofertas y características. Antes carga los sugeridos (marcas, categorías, colores, talles y características) sin duplicar. Pasa por los mismos servicios y reglas que el panel. Correrlo de nuevo no duplica. | ✅ |
| ROP-75 | Las fotos son **ficticias y propias**: una por prenda, con la silueta de la prenda en su color, el nombre de la marca y la leyenda "Foto de muestra". Se generan en `frontend/public/catalogo-inicial/` (no va a git). | ✅ |
| ROP-76 | No corre contra producción (`NODE_ENV=production` o con base remota configurada). `-- --borrar` saca las prendas de demostración y sus fotos. Precios, nombres y descripciones son ficticios y lo dicen. | ✅ |

**Fuera de alcance:** banners del carrusel (se cargan desde el panel), pedidos de prueba.

## Diseño

- Script `servidor/src/modulos/tienda_ropa/seed_tienda_demo.js`; las fotos se dibujan con el Chromium de
  Playwright (dependencia del frontend), sin internet.
- Las prendas llevan en la descripción "Prenda de demostración (datos ficticios)": así se reconocen para borrarlas.

## Tareas

1. [x] Script, fotos y borrado.
2. [x] Correrlo contra la base local, revisar el home, el catálogo y una ficha (capturas).
3. [x] Pasar las reglas a la spec del módulo y marcar este cambio como hecho.

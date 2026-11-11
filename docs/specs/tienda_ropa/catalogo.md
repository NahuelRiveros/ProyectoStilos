# Módulo: tienda de ropa (`ROP`)

## Objetivo

Que el negocio publique sus prendas con fotos por color, talles y precio, y que el visitante arme un
pedido y lo envíe por WhatsApp, sin pagar online ni crear cuenta.

## Actores

| Quién | Qué puede hacer |
| --- | --- |
| Visitante | Ver la colección, filtrar, armar el pedido y enviarlo por WhatsApp. |
| Encargado (o rol con "Editar productos") | Prendas, fotos, categorías, marcas, colores y talles. |
| Vendedor (o rol con "Ver pedidos") | Ver los pedidos; con "Gestionar pedidos", marcarlos atendidos o cancelados. |
| Gerente general / Administrador del sistema | Todo. |

## Reglas

| Código | Regla | Estado |
| --- | --- | --- |
| ROP-01 | Categorías en árbol; la URL no se repite; no se puede mover una adentro de sí misma; no se borra con subcategorías o prendas. Ocultar una oculta las de adentro. | ✅ `ropa_reglas.test.mjs`; `ropa.integration.mjs` › "ROP-01…" |
| ROP-02 | Marcas: opcionales en cada prenda; nombre único; no se borra si la usa una prenda. | ✅ `ropa.integration.mjs` › "ROP-20 por HTTP…" (nombre único) |
| ROP-03 | Colores con muestra #RRGGBB; "Cargar sugeridos" agrega la paleta de Stilos sin duplicar. | ✅ `ropa_reglas.test.mjs`; `ropa.integration.mjs` › "ROP-03 y ROP-04…" |
| ROP-04 | Grupos de talles (Ropa, Jeans, Calzado sugeridos); no se saca un talle que usa una prenda. | ✅ `ropa.integration.mjs` › "ROP-04…" |
| ROP-05 | Prenda: nombre, descripción, categoría, marca, grupo de talles, precio y si se ve; al menos un talle × color. | ✅ `ropa_reglas.test.mjs`; `ropa.integration.mjs` |
| ROP-06 | Hasta 3 fotos por color y 10 generales, solo de colores que tiene la prenda. | ✅ `ropa_reglas.test.mjs` › "ROP-06…" |
| ROP-07 | Un solo precio por prenda. | ✅ `ropa_reglas.test.mjs` |
| ROP-08 | Cada talle × color está "hay" o "agotado"; lo agotado no se puede pedir. Al editar, las variantes que siguen conservan su id. | ✅ `ropa.integration.mjs` › "ROP-05 a ROP-08…" y "ROP-14 y ROP-15…" |
| ROP-09 | Listado del panel con búsqueda, categoría, estado, foto y agotadas. | ⚠️ sin test (revisado en capturas) |
| ROP-10 | Inicio: carrusel (core), nombre, categorías principales y novedades. | ⚠️ sin test (revisado en capturas) |
| ROP-11 | Catálogo con búsqueda, categorías por niveles con migas, color y talle (en la misma variante y disponible) y marca; filtros en la URL. | ✅ `ropa.integration.mjs` › "ROP-10 a ROP-12…" (pantalla: capturas) |
| ROP-12 | Ficha: fotos del color elegido más las generales, talles agotados tachados, migas. | ✅ `ropa.integration.mjs` (datos); pantalla: capturas |
| ROP-13 | El pedido vive en el navegador 15 días, sin cuenta; máximos de líneas y unidades. | ✅ `ropa_web.test.mjs` › "ROP-13…" |
| ROP-14 | Al enviar, el servidor calcula precios y total con la base y devuelve el número; WhatsApp se abre con el mensaje armado. | ✅ `ropa.integration.mjs`; `ropa_web.test.mjs` › "ROP-14…" |
| ROP-15 | El pedido queda en el panel (Nuevo / Atendido / Cancelado) con copia de la prenda: borrarla no lo cambia. | ✅ `ropa.integration.mjs` › "ROP-14 y ROP-15…" |
| ROP-16 | Se piden nombre y celular (8 a 15 números). Enviar pedidos se limita a 10 por hora por IP. | ✅ `ropa_reglas.test.mjs`; `ropa_api.test.mjs` (el límite: ⚠️) |
| ROP-20 | Permisos: "Editar productos" (Encargado), "Ver pedidos" y "Gestionar pedidos" (Encargado y Vendedor). El panel pide ingresar. | ✅ `ropa_api.test.mjs`; `ropa.integration.mjs` › "ROP-20 por HTTP…" |
| ROP-21 | Registro público apagado: solo el equipo ingresa. | ⚠️ sin test (configuración en `proyecto/client_config.js`) |

## Configuración

| Qué | Dónde | Valor actual |
| --- | --- | --- |
| WhatsApp del negocio | `proyecto/client_config.js` › `whatsapp` | 5493704784641 |
| Máximos del pedido y vencimiento | `proyecto/client_config.js` › `tienda` | 50 prendas distintas · 99 unidades c/u · 15 días |
| Colores y grupos sugeridos | `servidor/src/modulos/tienda_ropa/sugeridos.js` | Paleta de Stilos |
| Marca, paleta y tipografías | `frontend/src/proyecto/config/` | Stilos · navy, crema, siena · Cormorant + DM Sans |

## Decisiones

Ver [la spec del cambio](../cambios/2026-11-catalogo-ropa.md).

# Módulo: tienda de ropa (`ROP`)

## Objetivo

Que el negocio publique sus prendas (un color por prenda, con talles, precio y ofertas) y que el visitante
arme un pedido y lo envíe por WhatsApp sin cuenta, o con su cuenta lo confirme, pague por transferencia y
siga su estado. Sin pagos con tarjeta dentro de la web.

## Actores

| Quién | Qué puede hacer |
| --- | --- |
| Visitante | Ver la colección, filtrar, armar el pedido y enviarlo por WhatsApp. Registrarse o ingresar. |
| Cliente (con cuenta) | Lo mismo, y además: guardar sus datos, confirmar pedidos con forma de pago, subir el comprobante, ver y cancelar sus pedidos. |
| Encargado (o rol con "Editar productos") | Prendas, fotos, categorías, marcas, diseños, colores y talles. |
| Vendedor (o rol con "Ver pedidos") | Ver los pedidos y comprobantes; con "Gestionar pedidos", cambiar su estado. |
| Encargado (o rol con "Registrar pagos") | Aceptar o rechazar comprobantes y marcar pedidos pagados. |
| Gerente general / Administrador del sistema | Todo. |

## Reglas

### Catálogo (panel)

| Código | Regla | Estado |
| --- | --- | --- |
| ROP-01 | Categorías en árbol; la URL no se repite; no se puede mover una adentro de sí misma; no se borra con subcategorías o prendas. Ocultar una oculta las de adentro. | ✅ `ropa_reglas.test.mjs`; `ropa.integration.mjs` › "ROP-01…" |
| ROP-02 | Marcas: opcionales en cada prenda; nombre único; no se borra si la usa una prenda. | ✅ `ropa.integration.mjs` › "ROP-20 por HTTP…" (nombre único) |
| ROP-03 | Colores con muestra #RRGGBB; "Cargar sugeridos" agrega la paleta de Stilos sin duplicar. | ✅ `ropa_reglas.test.mjs`; `ropa.integration.mjs` › "ROP-03 y ROP-04…" |
| ROP-04 | Grupos de talles (Ropa, Jeans, Calzado, Niños 8 a 16 y Talle único sugeridos); no se saca un talle que usa una prenda. | ✅ `ropa.integration.mjs` › "ROP-03 y ROP-04…" y "ROP-04…" |
| ROP-05 | Prenda: nombre, descripción, categoría, marca, diseño, grupo de talles, precio y si se ve; al menos un talle. | ✅ `ropa_reglas.test.mjs`; `ropa.integration.mjs` |
| ROP-06 | Reemplazada por ROP-29. | — |
| ROP-07 | Un solo precio por prenda. | ✅ `ropa_reglas.test.mjs` |
| ROP-08 | Cada talle está "hay" o "agotado"; lo agotado no se puede pedir. Al editar, las variantes que siguen conservan su id. | ✅ `ropa.integration.mjs` › "ROP-05 a ROP-08…" y "ROP-14 y ROP-15…" |
| ROP-09 | Listado del panel con búsqueda, categoría, estado, foto y agotadas. | ⚠️ sin test (revisado en capturas) |
| ROP-17 | Precio anterior opcional, mayor que el precio: la tarjeta y la ficha lo muestran tachado con "Oferta". El pedido cobra el precio. | ✅ `ropa_reglas.test.mjs` › "ROP-17…"; `ropa.integration.mjs` › "ROP-17…" |
| ROP-23 | ~~Diseños~~: reemplazada por ROP-37 a ROP-58 ([cambio](../cambios/2026-11-caracteristicas.md)). | — |
| ROP-37 | Características por grupo (Estampa, Material, Calce, Tiro, Manga, Cuello, Detalles, Calzado), editables como los grupos de talles: no se saca un valor ni se borra un grupo que usa una prenda. "Cargar características sugeridas" suma grupos y valores sin duplicar. | ✅ `ropa.integration.mjs` › "ROP-24 a ROP-39…" |
| ROP-59 | Cada grupo de características elige en qué categorías se usa (vale para las de adentro); sin elegir, en todas ([cambio](../cambios/2026-11-caracteristicas-por-categoria.md)). | ✅ `ropa.integration.mjs` › "ROP-24 a ROP-39…"; `ropa_reglas.test.mjs` › "ROP-37 a ROP-39…" |
| ROP-60 | Formulario de prenda por pasos: primero la categoría (botones), después datos, color y talles (cada talle se toca: Hay → Agotado → No se vende), características y fotos. Se ven solo los grupos de su categoría y los que ya tienen algo tildado; "Ver todas las características" muestra el resto. | ✅ `ropa_web.test.mjs` › "ROP-59 y ROP-60…"; `panel_pedidos.spec.js` › "prenda nueva…" |
| ROP-61 | "Cargar características sugeridas" relaciona los grupos sin categorías con las del panel que se llamen como la lista sugerida; no cambia lo ya elegido. | ✅ `ropa.integration.mjs` › "ROP-24 a ROP-39…" |
| ROP-38 | Varias características por prenda, de cualquier grupo; al editar se reemplazan. | ✅ `ropa.integration.mjs` › "ROP-24 a ROP-39…"; `panel_pedidos.spec.js` › "prenda nueva…" |
| ROP-24 | "Cargar marcas sugeridas": Taverniti, Bando, Raiders, Bravo, BBN, Panther, AFF, MAYCLA, Isostasia, Cataleia, Mistral y US Amerika, sin duplicar. | ✅ `ropa.integration.mjs` › "ROP-24 a ROP-39…" |
| ROP-25 | Logo opcional por marca (https, Cloudinary). | ✅ `ropa_reglas.test.mjs` › "ROP-25…" |
| ROP-27 | "Cargar categorías sugeridas" arma el árbol de una tienda de ropa: Mujer, Hombre, Niños, Calzado y Accesorios con sus tipos de prenda (remeras, chombas, camisas, jeans, pantalones › gabardina / cargo / satén…, polleras, vestidos, zapatillas, gorras…), sin duplicar (mismo nombre bajo la misma categoría). Lista en `servidor/src/modulos/tienda_ropa/sugeridos.js`. | ✅ `ropa.integration.mjs` › "ROP-24 a ROP-39…" |
| ROP-29 | Un color por prenda (los otros colores, prendas aparte) y hasta 3 fotos. La URL lleva el color. | ✅ `ropa_reglas.test.mjs` › "ROP-29…"; `ropa.integration.mjs` › "ROP-05 a ROP-08…" |
| ROP-36 | Cada categoría puede tener "talles sugeridos" (un grupo de talles); si no tiene, usa los de la categoría de arriba. Al cargar una prenda **nueva**, elegir la categoría preselecciona ese grupo (al editar no cambia solo). Los sugeridos traen: Jeans y Pantalones → Jeans, Calzado → Calzado, Niños → Niños, Accesorios → Talle único, el resto → Ropa. | ✅ `ropa.integration.mjs` › "ROP-24 a ROP-39…"; `ropa_web.test.mjs` › "ROP-36…"; `panel_pedidos.spec.js` › "prenda nueva…" |

### Tienda

| Código | Regla | Estado |
| --- | --- | --- |
| ROP-10 | Inicio: carrusel (core), nombre, categorías principales y novedades. | ⚠️ sin test (revisado en capturas) |
| ROP-11 | Catálogo con búsqueda, categorías por niveles con migas, color y talle (en la misma variante y disponible), marca, diseño, "Solo ofertas" y orden (novedades, menor o mayor precio); todo en la URL. | ✅ `ropa_reglas.test.mjs` › "ROP-11…"; `ropa.integration.mjs` › "ROP-10 a ROP-12…" y "ROP-17…" |
| ROP-12 | Ficha: fotos, marca y diseño, talles agotados tachados, migas y "También en:" (ROP-30). | ✅ `ropa.integration.mjs` (datos); pantalla: capturas |
| ROP-19 | "También te puede gustar": hasta 4 de la misma categoría, sin la prenda ni sus otros colores. | ✅ `ropa.integration.mjs` › "ROP-17…" |
| ROP-22 | "Compartir": menú del teléfono o copiar el link. | ✅ `ropa_web.test.mjs` › "ROP-22…"; `tienda.spec.js` › "ficha…" |
| ROP-31 | Al compartir el link de una prenda, WhatsApp y las redes muestran su nombre, marca, precio y foto (`frontend/middleware.js`, solo para esos bots). Si la API no responde, la vista previa de la tienda. | ✅ `ropa_web.test.mjs` › "ROP-31…" (2) |
| ROP-26 | Inicio con "Ofertas" (hasta 8, si hay) y "Nuestras marcas" (con prendas a la vista, logo o nombre). | ✅ `ropa.integration.mjs` › "ROP-24 a ROP-39…" (marcas); pantalla: capturas |
| ROP-28 | Las opciones de filtro salen de la categoría elegida; los talles, agrupados por grupo. | ✅ `ropa.integration.mjs` › "ROP-24 a ROP-39…" |
| ROP-39 | Filtro por características (`car=1,7` en la URL), un bloque por grupo con solo las que se usan en la categoría; dentro de un grupo, una u otra; entre grupos, todas. | ✅ `ropa.integration.mjs` › "ROP-24 a ROP-39…"; `tienda.spec.js` › "catálogo…" |
| ROP-58 | La ficha muestra las características agrupadas (Material: Cuero). | ✅ `ropa.integration.mjs` › "ROP-24 a ROP-39…"; `tienda.spec.js` › "ficha…" |
| ROP-35 | Logos de marcas: el subido en el panel; si no, el de `frontend/src/proyecto/config/marcas_config.js` (imágenes en `proyecto/assets/marcas/`, con color de fondo para logos claros); si no, el nombre. En el inicio, "Nuestras marcas" es una cinta que se desplaza sola (con 5 o más), se frena al pasar el mouse y respeta "reducir movimiento". | ✅ `ropa_web.test.mjs` › "ROP-35…"; `tienda.spec.js` › "inicio: la cinta de marcas…" |
| ROP-30 | "También en:": otras prendas visibles del mismo modelo (mismo nombre sin importar mayúsculas ni espacios, y misma marca). El panel muestra con cuáles quedó agrupada. | ✅ `ropa.integration.mjs` › "ROP-10 a ROP-12…" y "ROP-05 a ROP-08…" |

### Pedido

| Código | Regla | Estado |
| --- | --- | --- |
| ROP-13 | El pedido vive en el navegador 15 días, sin cuenta; máximos de líneas y unidades. | ✅ `ropa_web.test.mjs` › "ROP-13…" |
| ROP-14 | Al enviar, el servidor calcula precios y total con la base y devuelve el número; WhatsApp se abre con el mensaje armado. | ✅ `ropa.integration.mjs`; `ropa_web.test.mjs` › "ROP-14…" |
| ROP-15 | El pedido queda en el panel con copia de la prenda (borrarla no lo cambia). Estados: Recibido → Confirmado → Listo para retirar / Enviado → Entregado, y Cancelado. | ✅ `ropa.integration.mjs` › "ROP-14 y ROP-15…" |
| ROP-16 | Sin cuenta se piden nombre y celular (8 a 15 números). Enviar pedidos se limita a 10 por hora por IP. | ✅ `ropa_reglas.test.mjs`; `ropa_api.test.mjs` (el límite: ⚠️) |
| ROP-18 | Retiro o envío (dirección y localidad obligatorias). El envío se coordina; es gratis desde el mínimo, según el total de la base. | ✅ `ropa_reglas.test.mjs`, `ropa_web.test.mjs` y `ropa.integration.mjs` › "ROP-18…" |
| ROP-62 | Seguimiento sin cuenta: link secreto `/seguimiento/<clave>` en el mensaje de WhatsApp y en "pedido registrado"; muestra estado, prendas, total y pago, sin nombre, celular ni dirección ([cambio](../cambios/2026-11-seguimiento-y-avisos.md)). | ✅ `ropa.integration.mjs` › "ROP-14 y ROP-15…"; `tienda.spec.js` › "seguimiento sin cuenta…" |
| ROP-63 | Mail al cliente con cuenta solo al confirmar, listo para retirar, enviado, entregado o cancelado; volver atrás no avisa. | ✅ `ropa_reglas.test.mjs` › "ROP-62 y ROP-63…" |
| ROP-64 | "Avisarle por WhatsApp" en el panel: mensaje según el estado, con el link de seguimiento. | ✅ `ropa_web.test.mjs` › "ROP-62, ROP-64 y ROP-67…"; `panel_pedidos.spec.js` › "encargado…" |
| ROP-65 | "Completar mis datos" desde el pedido vuelve al pedido al guardar. | ✅ `cuenta.spec.js` › "con datos incompletos…" |
| ROP-66 | "Mi pedido" y el seguimiento se actualizan al volver a la pestaña (sin consultas periódicas). | ✅ prueba de punta a punta 2026-11-12 |
| ROP-67 | La pantalla del pedido dice qué sigue y ofrece consultar por WhatsApp. | ✅ `ropa_web.test.mjs` › "ROP-62, ROP-64 y ROP-67…"; `tienda.spec.js` › "seguimiento sin cuenta…" |
| ROP-40 a ROP-57 | Cuentas de cliente, pedido con forma de pago, transferencia con comprobante, "Mis pedidos", historial, avisos por correo y permiso "Registrar pagos". | ✅ ver [la spec del cambio](../cambios/2026-11-cuentas-y-transferencias.md) |

### Equipo

| Código | Regla | Estado |
| --- | --- | --- |
| ROP-20 | Permisos: "Editar productos" (Encargado), "Ver pedidos" y "Gestionar pedidos" (Encargado y Vendedor), "Registrar pagos" (Encargado). El panel pide ingresar. | ✅ `ropa_api.test.mjs`; `ropa.integration.mjs` › "ROP-20 por HTTP…" |
| ROP-21 | Registro público prendido para clientes (ROP-40); el personal sigue entrando con su usuario. | ✅ `ropa.integration.mjs` › "ROP-20 por HTTP…" (cliente) |

## Pruebas de navegador

`frontend/tests/browser/` (Playwright, API simulada, escritorio y dos celulares): `tienda.spec.js` (catálogo, ficha, pedido
por WhatsApp), `cuenta.spec.js` (checkout con cuenta, Mis datos, comprobante, cancelar) y `panel_pedidos.spec.js`
(próximo paso, comprobantes, cambios simultáneos, permisos en pantalla). Corren con `node scripts/verificar.mjs --completo`.

## Configuración

| Qué | Dónde | Valor actual |
| --- | --- | --- |
| WhatsApp del negocio | `proyecto/client_config.js` › `whatsapp` | 5493704784641 |
| Máximos del pedido y vencimiento | `proyecto/client_config.js` › `tienda` | 50 prendas distintas · 99 unidades c/u · 15 días |
| Envío gratis y dirección del local | `proyecto/client_config.js` › `entrega` | Desde $150.000 · dirección `[COMPLETAR]` |
| Datos bancarios | `proyecto/client_config.js` › `datosBancarios` | `[COMPLETAR]` (sin ellos no se ofrece transferencia) |
| Registro de clientes | `proyecto/client_config.js` › `auth.publicRegistration` | Prendido |
| Colores, talles, marcas, características y categorías sugeridos | `servidor/src/modulos/tienda_ropa/sugeridos.js` | Ver ROP-03, ROP-04, ROP-24, ROP-27, ROP-37 |
| Marca, paleta y tipografías | `frontend/src/proyecto/config/` | Stilos · navy, crema, siena · Cormorant + DM Sans |

## Decisiones

Ver las specs de los cambios: [catálogo](../cambios/2026-11-catalogo-ropa.md), [ofertas, entrega y ficha](../cambios/2026-11-ofertas-entrega-ficha.md),
[marcas y diseño](../cambios/2026-11-tienda-marcas-diseno.md) y [cuentas y transferencias](../cambios/2026-11-cuentas-y-transferencias.md).

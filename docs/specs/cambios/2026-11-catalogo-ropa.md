# Cambio: catálogo de ropa con pedido por WhatsApp (rubro `tienda_ropa`)

| Estado | Pedido por | Fecha | Spec del módulo |
| --- | --- | --- | --- |
| Hecha | Dueño del proyecto | 2026-11-10 | [tienda_ropa/catalogo.md](../tienda_ropa/catalogo.md) |

## Por qué

Stilos vende ropa. Necesita una página donde el negocio **sube sus prendas** (fotos por color, talles,
precio) y el visitante **arma un pedido y lo manda por WhatsApp**. Sin pagos online ni cuentas de
cliente. Se rehace sobre CoreSistem (ingreso, personal, roles, banners y seguridad ya resueltos),
tomando lo que funcionaba del proyecto viejo `MI_eccomerce - Stilos` y del panel de DistribuCG.

## Requisitos

### Panel (quien tiene "Editar productos")

| Código | Requisito | Estado |
| --- | --- | --- |
| ROP-01 | Categorías en árbol (ej. Mujer › Remeras): alta, edición, mover y borrar si no tiene prendas. | ✅ |
| ROP-02 | Marcas: lista simple; la marca de una prenda es opcional. | ✅ |
| ROP-03 | Colores (nombre + muestra de color). Botón "Cargar colores sugeridos" con la paleta de Stilos, sin duplicar. | ✅ |
| ROP-04 | Grupos de talles (Ropa S–XXXL, Jeans 36–56, Calzado 35–45) con "Cargar grupos sugeridos"; se pueden editar. | ✅ |
| ROP-05 | Prenda: nombre, descripción, categoría, marca, precio, activa. Sus variantes son los talles × colores que se tilden. | ✅ |
| ROP-06 | Fotos: hasta 3 por color y hasta 10 generales (sin color). En la tienda, al elegir un color se ven sus fotos. | ✅ |
| ROP-07 | Un solo precio por prenda: todos sus talles y colores valen lo mismo. | ✅ |
| ROP-08 | Disponibilidad por variante con un tilde "hay / agotado" (sin contar unidades); lo agotado no se puede agregar al pedido. | ✅ |
| ROP-09 | Listado de prendas con búsqueda, filtro por categoría y estado, y foto chica (pantalla de artículos de DistribuCG). | ✅ |

### Tienda (cualquiera, sin ingresar)

| Código | Requisito | Estado |
| --- | --- | --- |
| ROP-10 | Inicio: carrusel de banners (core) + categorías + últimas prendas. | ✅ |
| ROP-11 | Catálogo con búsqueda y filtros por categoría (por niveles, con migas), marca, color y talle; paginado; pensado para celular. | ✅ |
| ROP-12 | Ficha: fotos del color elegido, selector de color y de talle (los agotados se ven tachados), "Agregar al pedido". | ✅ |
| ROP-13 | El pedido se arma en el navegador sin cuenta y se conserva al volver (15 días). | ✅ |
| ROP-14 | "Enviar por WhatsApp" abre WhatsApp al número del negocio con el mensaje armado: prendas, color, talle, cantidad, subtotales y total. | ✅ |
| ROP-15 | El pedido queda guardado en el panel con número, nombre y celular del cliente y estado Nuevo / Atendido / Cancelado; el mensaje de WhatsApp lleva ese número. | ✅ |
| ROP-16 | Al enviar se piden nombre y celular, los dos obligatorios. | ✅ |

### Equipo

| Código | Requisito | Estado |
| --- | --- | --- |
| ROP-20 | Permisos nuevos: "Editar productos" (`productos.editar`) y "Ver pedidos" y "Gestionar pedidos". El Encargado los tiene de entrada; el Vendedor solo pedidos. | ✅ |
| ROP-21 | Registro público apagado: los clientes no crean cuenta (solo el personal ingresa). | ✅ |

**Fuera de alcance (v1):** pagos online, cuentas de cliente, envíos y costos de envío, caja, listas de
precio, importación desde Excel, stock con movimientos. Se pueden sumar después como cambios propios.

## Qué se toma de dónde

| De | Qué | Cómo |
| --- | --- | --- |
| CoreSistem | Ingreso, personal, roles, permisos, banners, home, RLS, `validar` + `ErrorApp`, subida a Cloudinary, carrito de invitado (`controls/carrito/guest_storage`) | Ya está: es la base |
| DistribuCG (panel) | Categorías en árbol, marcas, listado y formulario de artículos con pestañas, inicio de tienda (buscador, familias, productos), tarjeta de producto, catálogo con filtros y paginación | Se copian y se adaptan a talle/color; no se importan de DistribuCG |
| Stilos viejo | Colores, grupos de talles y paletas sugeridas, variantes talle × color, fotos por color, selector de talle/color, mensaje de WhatsApp | Se reescriben con el patrón del core (otra arquitectura: Umzug, `compartido/`) |

## Diseño

- **Carpetas:** `servidor/src/modulos/tienda_ropa/`, `frontend/src/modules/tienda_ropa/`, `rubros/tienda_ropa/`
  (config compartida), registrado en `proyecto/gate_config.js` y los registros de `proyecto/`.
- **Tablas:** `categoria_ropa`, `marca_ropa`, `color`, `grupo_talle`, `talle`, `prenda`, `prenda_variante`
  (prenda, color, talle, disponible), `prenda_imagen` (prenda, color opcional, orden),
  `pedido_whatsapp` + `pedido_whatsapp_item` (copian nombre, color, talle y precio al momento del pedido).
- **API:** `/api/ropa/...` con `validar` (Zod) y `ErrorApp`; lecturas del catálogo públicas; el resto con permiso.
- **Configuración** (`proyecto/client_config.js`): número de WhatsApp del negocio `[COMPLETAR]`, marca, colores.
  No se inventan datos reales.

## Tareas (cada etapa con tests y capturas en escritorio y celular)

1. [x] Datos del cliente (`[COMPLETAR]`), `CLAUDE.md` del proyecto, dependencias y base local.
2. [x] Listas del panel: categorías, marcas, colores, talles (ROP-01 a ROP-04).
3. [x] Prendas, variantes y fotos (ROP-05 a ROP-09).
4. [x] Tienda: inicio, catálogo, ficha y pedido local (ROP-10 a ROP-13).
5. [x] WhatsApp y pedidos en el panel (ROP-14 a ROP-16, ROP-20).
6. [x] `node scripts/verificar.mjs --completo` en verde y spec del módulo.

## Notas de la implementación

- Probado de punta a punta contra el PostgreSQL local: el servidor crea las 23 tablas con RLS, se
  cargaron prendas por la API, un visitante envió un pedido y se abrió WhatsApp con el mensaje armado.
- El core ganó `tienda.llamado` (texto de la franja del pie, por rubro): antes prometía "stock siempre
  al día", que no aplica acá. Hecho también en DistribuCG, con su texto de siempre.

## Riesgos

- **Fotos:** muchas prendas × colores × 3 fotos. Se piden a Cloudinary al tamaño en que se muestran (ya lo hace el core).
- **Mensajes largos:** WhatsApp corta enlaces muy largos; el mensaje puede ir resumido porque lleva el número de pedido.
- **Proyecto viejo:** `MI_eccomerce - Stilos` tiene 5 archivos sin commitear; antes de borrarlo, decidir si se guardan.

## Decisiones

| Fecha | Regla | Decisión | Quién |
| --- | --- | --- | --- |
| 2026-11-10 | — | Catálogo con pedido por WhatsApp, ropa con talle y color, proyecto "Stilos" en `PROYECYOS_MEJORAODS\Stilos`. | Dueño del proyecto |
| 2026-11-10 | ROP-07, ROP-08 | Un precio por prenda; disponibilidad "hay / agotado". | Dueño del proyecto |
| 2026-11-10 | ROP-15, ROP-16 | El pedido se guarda en el panel; se piden nombre y celular. | Dueño del proyecto |
| 2026-11-10 | — | Se sube al repo `ProyectoStilos` reemplazando su historia (force push). Se confirma de nuevo antes de hacerlo. | Dueño del proyecto |

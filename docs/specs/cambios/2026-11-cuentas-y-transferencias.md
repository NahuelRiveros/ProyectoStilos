# Cambio: cuentas de cliente, seguimiento del pedido y pago por transferencia

| Estado | Pedido por | Fecha | Spec del módulo |
| --- | --- | --- | --- |
| Hecha | Dueño del proyecto | 2026-11-11 | [tienda_ropa/catalogo.md](../tienda_ropa/catalogo.md) |

## Por qué

Hoy el visitante manda el pedido por WhatsApp y el negocio lo sigue a mano. Stilos quiere que el cliente
**pueda** tener una cuenta: guardar sus datos y su domicilio, ver en qué estado está su pedido, ver los datos
bancarios de Stilos y subir el comprobante de la transferencia, sin tener que mandarlo por WhatsApp.
Quien no quiera registrarse puede seguir pidiendo por WhatsApp como hasta ahora.

Se toma de DistribuCG lo que ya funciona (reglas PED y COB de `eccomerce_distribuidora`), adaptado y
simplificado para una tienda de ropa: sin stock con unidades, sin listas de precio, sin cobros parciales.

## Qué ya está hecho (core) y qué se trae de DistribuCG

| Qué | De dónde | Cómo |
| --- | --- | --- |
| Registro, ingreso con email o Google, sesión de 30 días del cliente, carrito que se conserva al ingresar | Core (USU-10 a USU-24, USU-16) | Se prende: `publicRegistration: true`. Google necesita su Client ID `[COMPLETAR]` |
| Archivo privado con enlace de 5 minutos | Core (`upload_service`, archivo privado) | Se usa tal cual |
| Datos del cliente, "Mis pedidos", estados con historial, comprobantes, avisos por correo | DistribuCG (PED-04, 05, 10–13, 30–33, 50–53; COB-10–17) | Se copian al rubro `tienda_ropa` y se adaptan (no se importa código de DistribuCG) |

## Estados del pedido

| Estado | Puede pasar a | Pide motivo |
| --- | --- | --- |
| Recibido | Confirmado · Cancelado | Al cancelar |
| Confirmado | Listo para retirar · Enviado · Recibido · Cancelado | Al volver o cancelar |
| Listo para retirar | Entregado · Confirmado · Cancelado | Al volver o cancelar |
| Enviado | Entregado · Confirmado · Cancelado | Al volver o cancelar |
| Entregado | (final; "Reabrir" vuelve a Confirmado) | Al reabrir |
| Cancelado | Recibido (reabrir) | Al reabrir |

"Listo para retirar" es para pedidos con retiro en el local y "Enviado", para los de envío a domicilio.

El **pago** va aparte del estado: **Pendiente**, **Comprobante en revisión** o **Pagado**.

## Requisitos

### Cuenta y datos del cliente

| Código | Requisito | Estado |
| --- | --- | --- |
| ROP-40 | Registro público prendido (cambia ROP-21): el cliente se registra o ingresa con email o Google. El personal sigue ingresando igual. | ✅ `ropa.integration.mjs` › "ROP-20 por HTTP…" (cliente) |
| ROP-41 | "Mis datos": nombre, apellido, celular, dirección, localidad y código postal. En el primer pedido con cuenta se piden los que falten, sin perder el pedido armado. | ✅ `ropa_reglas.test.mjs` › "ROP-41 a ROP-44…"; `ropa.integration.mjs` › "ROP-40 a ROP-57…" |
| ROP-42 | Lo armado como invitado se conserva al ingresar o registrarse (core USU-16). | ✅ core USU-16 |

### Enviar el pedido con cuenta

| Código | Requisito | Estado |
| --- | --- | --- |
| ROP-43 | Con cuenta, "Confirmar pedido" lo crea en el sistema (no abre WhatsApp). El servidor vuelve a calcular precios y revisa que nada esté agotado (como ROP-14). Reintentos o doble clic crean un solo pedido. | ✅ `ropa.integration.mjs` › "ROP-40 a ROP-57…" |
| ROP-44 | Se elige entrega (retiro o envío, con envío gratis desde $150.000: ROP-18) y forma de pago: **Transferencia**, **Efectivo al retirar** (solo si es retiro) o **A coordinar por WhatsApp**. | ✅ `ropa_reglas.test.mjs` › "ROP-41 a ROP-44…"; `ropa_web.test.mjs` › "ROP-44 a ROP-48…" |
| ROP-45 | El pedido guarda una copia de prendas, color, talle, precios y datos de entrega: no cambia si después se edita la prenda o el perfil. | ✅ `ropa.integration.mjs` › "ROP-14 y ROP-15…" |
| ROP-46 | Sin cuenta, todo sigue como hoy: el pedido se manda por WhatsApp (ROP-14 a ROP-16) y queda en el panel en estado Recibido. | ✅ `ropa.integration.mjs` › "ROP-14 y ROP-15…" |

### Transferencia y comprobante

| Código | Requisito | Estado |
| --- | --- | --- |
| ROP-47 | Con pago por transferencia, el pedido enviado y "Mis pedidos" muestran titular, banco, CBU, alias y CUIT de Stilos, con botón para copiar el CBU y el alias. Los datos salen de `proyecto/client_config.js` (`[COMPLETAR]`). | ✅ `ropa_reglas.test.mjs` › "ROP-47 y ROP-48…"; `ropa.integration.mjs` › "ROP-40 a ROP-57…" |
| ROP-48 | El cliente sube el comprobante (JPG, PNG, WEBP o PDF, hasta 5 MB, máximo 3 por pedido) desde el pedido enviado o "Mis pedidos". El formato se reconoce por el contenido. No se puede en pedidos cancelados o ya pagados. | ✅ `ropa_reglas.test.mjs` › "ROP-47 y ROP-48…"; `ropa.integration.mjs` › "ROP-40 a ROP-57…" |
| ROP-49 | El comprobante se guarda privado: solo lo ven el dueño del pedido y el equipo, con un enlace que dura 5 minutos. | ✅ `ropa.integration.mjs` › "ROP-40 a ROP-57…" |
| ROP-50 | El equipo **acepta** o **rechaza** el comprobante (el rechazo lleva motivo y se le avisa al cliente). Aceptar marca el pedido **Pagado** y, si estaba Recibido, lo pasa a Confirmado en el mismo paso. | ✅ `ropa.integration.mjs` › "ROP-40 a ROP-57…" |
| ROP-51 | Con efectivo o "a coordinar", el equipo marca el pedido como **Pagado** a mano. | ✅ `ropa.integration.mjs` › "ROP-40 a ROP-57…" |

### Seguimiento

| Código | Requisito | Estado |
| --- | --- | --- |
| ROP-52 | "Mis pedidos": el cliente ve solo los suyos, con número, fecha, total, estado, pago y el historial de pasos. | ✅ `ropa.integration.mjs` › "ROP-40 a ROP-57…" |
| ROP-53 | El cliente puede cancelar su pedido solo en Recibido, con un motivo. Para cambiar un pedido enviado, lo cancela y arma otro. | ✅ `ropa.integration.mjs` › "ROP-40 a ROP-57…" |
| ROP-54 | Cada cambio de estado queda en el historial (antes, después, fecha, quién y motivo). Si dos personas cambian el mismo pedido a la vez, la segunda recibe un aviso y no pisa el cambio. | ✅ `ropa_reglas.test.mjs` › "Estados del pedido…"; `ropa.integration.mjs` › "ROP-40 a ROP-57…" |
| ROP-55 | Avisos por correo: pedido nuevo (al equipo y al cliente), cambio de estado y comprobante rechazado (al cliente). Un correo que falla no frena el pedido. Lo que escribe el cliente va escapado. | ✅ ⚠️ sin test (sin correo configurado no se envía; escapado como en DistribuCG) |

### Panel

| Código | Requisito | Estado |
| --- | --- | --- |
| ROP-56 | La lista de pedidos junta los de WhatsApp y los de cuenta (con su origen), filtra por estado y por pago ("Comprobante para revisar") y busca por número, nombre o celular. Cada pedido muestra un botón con el próximo paso. | ✅ `ropa.integration.mjs` › "ROP-14 y ROP-15…" y "ROP-40 a ROP-57…" (pantalla: capturas) |
| ROP-57 | Permiso nuevo **"Registrar pagos"** (aceptar o rechazar comprobantes, marcar pagado). Lo tiene el Encargado; el Vendedor ve los comprobantes pero no marca pagos (como DistribuCG). | ✅ `ropa.integration.mjs` › "ROP-20 por HTTP…" |

**Fuera de alcance:** pagos con tarjeta o Mercado Pago dentro de la web, cobros parciales, stock con
unidades (sigue "hay / agotado": el equipo confirma), costo de envío calculado, facturación.

## Diseño

- **Base de datos:**
  - La tabla de pedidos (`pedido_whatsapp`, se mantiene el nombre para no migrar) pasa a servir para los dos orígenes. Se suman `origen` ("whatsapp" | "cuenta"),
    `usuario_id` (null para invitados), los datos de entrega, `forma_pago`, `estado_pago` y `version`
    (para el control de cambios a la vez).
  - Los estados nuevos reemplazan a Nuevo / Atendido / Cancelado. Hoy no hay pedidos reales en producción,
    así que no se migran.
  - Tablas nuevas: `pedido_ropa_historial`, `pedido_ropa_comprobante` y los datos del cliente
    (en el perfil del core si ya los tiene; si no, `cliente_ropa`).
  - Se crean con el `sync({alter:true})` del core. Si hace falta renombrar la tabla de pedidos, se hace
    con un ajuste puntual en el bootstrap, probado en una base local.
- **API:**
  - Cliente con sesión: `/ropa/mi-cuenta/datos`, `/ropa/mi-cuenta/pedidos` (crear, listar, ver, cancelar,
    subir comprobante, ver comprobante).
  - Panel: `/ropa/pedidos` suma cambiar estado con motivo y versión, aceptar o rechazar comprobante,
    y marcar pagado.
  - Todo con `validar` (Zod) y `ErrorApp`. El dueño del pedido se controla en el servidor (un cliente
    nunca ve pedidos ajenos).
- **Pantallas:** "Mi pedido" (con o sin cuenta), "Mis datos", "Mis pedidos" y detalle con datos bancarios y
  comprobante, y en el panel, pedidos con próximo paso, historial y comprobantes. Pensado para celular.
- **Configuración** (`proyecto/client_config.js`): `publicRegistration: true`;
  `datosBancarios: { titular, banco, cbu, alias, cuit }` todos `[COMPLETAR]`; correo del equipo `[COMPLETAR]`.

## Tareas

1. [x] Tests de los requisitos (fallan al principio).
2. [x] Pedido unificado: estados, historial, origen, entrega y forma de pago (ROP-43 a ROP-46, ROP-54).
3. [x] Cuenta: registro, "Mis datos" y conservar el pedido al ingresar (ROP-40 a ROP-42).
4. [x] "Mis pedidos" y cancelar (ROP-52, ROP-53).
5. [x] Datos bancarios y comprobantes, cliente y panel (ROP-47 a ROP-51, ROP-57).
6. [x] Panel de pedidos y avisos por correo (ROP-55, ROP-56).
7. [x] `node scripts/verificar.mjs --completo` en verde y capturas en escritorio y celular.
8. [x] Pasar las reglas a la spec del módulo y marcar este cambio como hecho.

## Riesgos

- **Datos bancarios reales:** nunca van en el repo con valores inventados; se completan en
  `client_config.js` antes de publicar. Si faltan, la opción "Transferencia" no se ofrece.
- **Comprobantes:** tienen datos bancarios del cliente: privados, enlace corto y solo para quien corresponde.
- **Neon y Render:** "Mis pedidos" se consulta al abrirla (sin actualizar solo cada X segundos). El panel
  refresca al volver a la pestaña, no en un intervalo fijo.
- **Correo:** si el SMTP no está configurado, los pedidos funcionan igual y los avisos se omiten.
- **Tamaño:** es el cambio más grande hasta ahora. Va por etapas, cada una con sus tests y capturas.

## Decisiones

| Fecha | Regla | Decisión | Quién |
| --- | --- | --- | --- |
| 2026-11-11 | ROP-40, ROP-46 | Las cuentas conviven con el pedido por WhatsApp sin registro. | Dueño del proyecto |
| 2026-11-11 | ROP-44 | Formas de pago: transferencia con comprobante, efectivo al retirar y a coordinar por WhatsApp. | Dueño del proyecto |
| 2026-11-11 | — | Estados: Recibido → Confirmado → Listo para retirar / Enviado → Entregado, y Cancelado. | Dueño del proyecto |
| 2026-11-11 | — | Orden: terminar ofertas, entrega y ficha (etapas 3 y 4), después un color por prenda y marcas, después este cambio. | Dueño del proyecto |
| 2026-11-11 | ROP-57 | "Registrar pagos" solo para el Encargado (recomendación aceptada al pedir seguir con todo). | Dueño del proyecto |
| 2026-11-11 | ROP-48 | Hasta 3 comprobantes por pedido (recomendación aceptada). | Dueño del proyecto |
| 2026-11-11 | — | Los pedidos Nuevo / Atendido de antes no se migran: no hay datos reales en producción. | Dueño del proyecto |
| 2026-11-11 | ROP-55 | Los correos al equipo van a quienes tienen "Ver pedidos" (no hace falta un correo aparte). | Implementación |

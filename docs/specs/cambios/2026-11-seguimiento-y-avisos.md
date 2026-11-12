# Cambio: seguimiento del pedido y avisos al cliente

| Estado | Pedido por | Fecha | Spec del módulo |
| --- | --- | --- | --- |
| Hecho | Dueño del proyecto | 2026-11-12 | [tienda_ropa/catalogo.md](../tienda_ropa/catalogo.md) |

## Por qué

Prueba de punta a punta del 2026-11-12 (carrito → pedido → panel → "Mis pedidos"): el circuito funciona,
pero el que pide sin cuenta no puede ver cómo va su pedido, el cliente no se entera de los cambios
salvo que entre a mirar, y al completar "Mis datos" desde el pedido queda en otra pantalla sin volver.

## Requisitos

| Código | Requisito | Estado |
| --- | --- | --- |
| ROP-62 | **Seguimiento sin cuenta.** Cada pedido nuevo tiene un link secreto (`/seguimiento/<clave>`, imposible de adivinar). Va en el mensaje de WhatsApp del cliente y en la pantalla de "pedido registrado". Muestra número, pasos del estado, prendas, total, retiro o envío, forma y estado del pago, y el motivo si se canceló. **No** muestra nombre, celular ni dirección (el link se puede reenviar). | ✅ |
| ROP-63 | **Mail solo en los cambios importantes.** Al cliente con cuenta le llega un mail cuando su pedido pasa a Confirmado (desde Recibido), Listo para retirar, Enviado, Entregado o Cancelado (con el motivo). Volver un paso atrás no avisa. | ✅ |
| ROP-64 | **Avisar por WhatsApp desde el panel.** El botón del pedido abre el chat con el cliente y un mensaje según el estado (ej. "Tu pedido #00012 está listo para retirar"), con el link de seguimiento. Lo manda la persona del local. | ✅ |
| ROP-65 | **Completar datos y volver.** "Completar mis datos" desde el pedido, al guardar, vuelve al pedido. | ✅ |
| ROP-66 | **Estado al día.** "Mi pedido" y el seguimiento se actualizan al volver a la pestaña (sin consultas periódicas). | ✅ |
| ROP-67 | **Qué sigue.** La pantalla del pedido (con cuenta y seguimiento) dice en una línea qué pasa ahora (ej. "Te avisamos cuando esté listo para retirar") y ofrece escribirle a la tienda por WhatsApp. | ✅ |

**Fuera de alcance:** WhatsApp automático (API paga de Meta), notificaciones push, avisos por SMS.

## Diseño

- **Base de datos:** `pedido_whatsapp.clave_seguimiento` (texto único, 22 caracteres aleatorios; los pedidos
  viejos quedan sin link).
- **API (pública):** `GET /ropa/catalogo/seguimiento/:clave`. Una clave que no existe responde "No encontramos
  ese pedido" (igual que uno ajeno).
- **Reglas puras:** `avisaAlCliente(desde, hacia)` (ROP-63) en `reglas.js`; mensajes de WhatsApp y "qué sigue"
  en el frontend (`pedido/mensajes_estado.js`).
- **Pantallas:** `/seguimiento/:clave` (misma presentación que "Mi pedido"); botón del panel con el mensaje;
  `/mi-cuenta?volver=/pedido`.

## Tareas

1. [x] Clave de seguimiento, endpoint público y regla de avisos (tests de reglas e integración).
2. [x] Página de seguimiento, link en WhatsApp y en la confirmación; botón del panel; volver al pedido.
3. [x] `node scripts/verificar.mjs --completo` en verde, prueba de punta a punta y capturas.
4. [x] Pasar las reglas a la spec del módulo y marcar este cambio como hecho.

## Encontrado en la prueba

- **Índice con nombre largo (arreglado):** el índice único de `grupo_caracteristica_categoria` tenía un nombre
  automático de más de 63 caracteres; PostgreSQL lo corta y el siguiente `sync({ alter: true })` intentaba
  crearlo de nuevo: el servidor no arrancaba. Ahora tiene nombre explícito (el mismo cortado, así sirve en
  bases nuevas y existentes) y el test "Arranque: sincronizar dos veces…" lo cubre.
- **Transferencia:** no aparece mientras `proyecto/client_config.js` tenga los datos bancarios en `[COMPLETAR]`
  (esperado, ROP-47).

## Decisiones

| Fecha | Regla | Decisión | Quién |
| --- | --- | --- | --- |
| 2026-11-12 | ROP-63, ROP-64 | Botón de WhatsApp (lo manda el local) y mail automático a clientes con cuenta; solo en los cambios importantes. | Dueño del proyecto |
| 2026-11-12 | ROP-62 | El seguimiento sin cuenta muestra estado y prendas, sin datos personales. | Dueño del proyecto |

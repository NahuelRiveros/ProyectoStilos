# Cambio: código de Lince Indumentaria en cada prenda

| Estado | Pedido por | Fecha | Spec del módulo |
| --- | --- | --- | --- |
| Hecho | Dueño del proyecto | 2026-11-13 | [tienda_ropa/prendas_datos.md](../tienda_ropa/prendas_datos.md) |

## Por qué

El local maneja su stock en **Lince Indumentaria** (sistema externo). Para preparar un pedido o controlar una
prenda, el equipo necesita el código con el que esa prenda está en Lince, sin buscarla por nombre.

## Requisitos

| Código | Requisito | Estado |
| --- | --- | --- |
| ROP-77 | **Código en la prenda.** Cada prenda (modelo + color) puede tener un "Código Lince", **opcional**. Se carga en el formulario del panel (paso "Datos") y se ve en la lista de Prendas. Se **puede repetir** entre prendas (decidido el 2026-11-13). No se muestra en la tienda. | ✅ |
| ROP-78 | **Buscar por código.** En Panel → Prendas, la búsqueda encuentra por nombre **o** por código Lince (parte del código, sin distinguir mayúsculas). | ✅ |
| ROP-79 | **En el pedido.** Cada línea del pedido guarda una **copia** del código (como guarda nombre, color y talle): si después se cambia en la prenda, el pedido no cambia. Se ve en el detalle del pedido del panel y va en el mensaje de WhatsApp del cliente ("Lince: …") para encontrarla al prepararla. No se muestra en las pantallas del cliente. | ✅ |
| ROP-81 | **Mismo código para los colores de un modelo.** Lo normal es que todos los colores de un modelo (mismo nombre y marca, ROP-30) compartan el código de Lince. Al cargar una prenda **nueva** cuyo nombre y marca coinciden con otra que ya tiene código, el formulario lo **propone** (se puede cambiar o borrar). Al editar, no se cambia solo. | ✅ |
| ROP-80 | **Formato.** Cualquier texto de hasta 40 caracteres, sin espacios a los costados; vacío = sin código. Sin restricción de caracteres hasta conocer los códigos reales. | ✅ |

**Fuera de alcance:** conectarse con Lince (importar o sincronizar stock y precios), código por talle,
importar códigos en masa desde un archivo.

## Diseño

- **Base de datos** (la crea el arranque, `sync({ alter: true })`; no hay datos que migrar):
  - `prenda.codigo_lince` varchar(40), nulo. Índice simple (no único) con **nombre fijo**, para la búsqueda.
  - `pedido_whatsapp_item.codigo_lince` varchar(40), nulo: copia al momento del pedido.
- **API (panel):** `POST/PUT /ropa/panel/prendas` reciben `codigo_lince`; `GET /ropa/panel/prendas?q=` busca también
  por código. La tienda (`/ropa/catalogo/…`) **no** lo devuelve.
- **Validación (`esquemaPrenda`):** texto opcional, `trim`, vacío → `null`, máximo 40 (y el formato de ROP-80).
- **Propuesta del código (ROP-81):** `GET /ropa/panel/prendas/codigo-lince?nombre=&marca_id=` devuelve el código del
  modelo (la prenda más reciente con ese nombre normalizado y marca que tenga código), o vacío.
- **Pantallas:** campo "Código Lince (opcional)" en el paso "Datos" (en una prenda nueva, al completar nombre y marca
  se propone el del modelo); columna en la lista de Prendas; el código en
  el detalle del pedido del panel; línea "Lince: …" en el mensaje de WhatsApp.

## Tareas

1. [x] Responder la pregunta 1 (2026-11-16). [x] Aprobar esta spec.
2. [x] Tests: esquema (vacío, largo, formato), búsqueda por código, copia en el pedido, que la tienda no lo devuelva,
   propuesta del código del modelo (mismo nombre y marca; otra marca no).
3. [x] Servidor: columnas, esquema, búsqueda, copia en el pedido.
4. [x] Frontend: formulario, lista, detalle del pedido, mensaje de WhatsApp.
5. [x] `node scripts/verificar.mjs --completo` en verde y capturas.
6. [x] Pasar las reglas a `prendas_datos.md` / `catalogo.md` y marcar este cambio como hecho.

## Riesgos

- **Mensaje de WhatsApp:** el cliente ve el código en el mensaje que manda (no es un dato sensible, pero es
  interno). Si molesta, se puede dejar solo en el panel.

## Decisiones

| Fecha | Regla | Decisión | Quién |
| --- | --- | --- | --- |
| 2026-11-13 | ROP-77 a ROP-79 | Un código por prenda (modelo + color), opcional, se puede repetir; búsqueda en el panel; copia en el pedido y en el mensaje de WhatsApp. | Dueño del proyecto |
| 2026-11-16 | ROP-80 | Cualquier texto de hasta 40 caracteres: no hay códigos reales de ejemplo todavía. | Dueño del proyecto |
| 2026-11-16 | ROP-81 | Los colores de un mismo modelo pueden (y suelen) tener el mismo código; el formulario lo propone al cargar otro color. | Dueño del proyecto |

## Preguntas abiertas

1. **[ROP-80] — ¿Cómo son los códigos de Lince?** No conocemos el formato que usa Lince Indumentaria. Opciones:
   (a) aceptar cualquier texto de hasta 40 caracteres; (b) solo letras, números y `- . / _` (sin espacios
   internos), para evitar errores de tipeo. Recomendación: pasar 2 o 3 códigos reales de ejemplo y elegir con
   eso; mientras tanto, (a).
   **Respuesta:** (a). Todavía no hay códigos reales para tomar de ejemplo (2026-11-16).

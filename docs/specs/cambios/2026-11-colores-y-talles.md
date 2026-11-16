# Cambio: elegir colores y talles más fácil (bitonos y estampados)

| Estado | Pedido por | Fecha | Spec del módulo |
| --- | --- | --- | --- |
| Hecho | Dueño del proyecto | 2026-11-16 | [tienda_ropa/catalogo.md](../tienda_ropa/catalogo.md) |

## Por qué

- **Talles:** la categoría del paso 1 ya dice qué talles lleva (una remera, S a XXXL), pero el formulario
  igual muestra la lista con todos los grupos. Falta tener "Talle único" siempre a mano.
- **Hay / Agotado / No se vende:** hay que tocar el mismo talle varias veces y adivinar qué pasa. Alcanza
  con "Hay" o "No hay".
- **Colores:** cada color tiene un solo tono. No se puede cargar una remera bitono (negro y blanco) ni un
  animal print.

## Requisitos

| Código | Requisito | Estado |
| --- | --- | --- |
| ROP-83 | **Grupo de talles automático.** En el formulario, los talles son los del grupo de la categoría (ROP-36), con "Talle único" siempre como segunda opción. Los demás grupos quedan en "Usar otro grupo", por si una prenda no encaja. Al editar, la prenda sigue con su grupo. | ✅ |
| ROP-84 | **Marcar los talles que hay.** Los talles del grupo se muestran uno por uno, sin marcar: se tocan los que hay ("Marcar todos" / "Desmarcar todos"); los que quedan sin marcar son "No hay" (agotado, no se puede pedir). Un grupo de un solo talle (Talle único) ya viene marcado. Una prenda nueva necesita al menos uno marcado. Se guardan todos los talles del grupo. Reemplaza "Hay → Agotado → No se vende" (ROP-60) y ajusta ROP-08. | ✅ |
| ROP-85 | **Ficha con todos los talles.** La tienda muestra todos los talles del grupo de la prenda; los que no hay, tachados. Vale también para las prendas ya cargadas (un talle que antes era "No se vende" se ve tachado). Ajusta ROP-12. | ✅ |
| ROP-86 | **Colores liso, bitono o estampado.** Liso: un tono. Bitono: dos tonos (la muestra es un círculo partido). Estampado: un dibujo (Animal print, Camuflado o Multicolor) con sus dos tonos. Se ven así en el panel, en el formulario, en la tienda (tarjeta, ficha y filtro). En el formulario de prenda, los colores van separados en Básicos, Bitonos y Estampados. Ajusta ROP-03. | ✅ |
| ROP-87 | **Sugeridos.** "Cargar sugeridos" de colores suma los bitonos y estampados de la lista. "Animal print" y "Camuflado" pasan a ser colores: "Cargar características sugeridas" los saca de Estampa si ninguna prenda los usa (si alguna los usa, quedan). | ✅ |

### Colores sugeridos nuevos (editables o borrables desde el panel)

| Tipo | Colores |
| --- | --- |
| Bitono | Negro y blanco, Azul marino y blanco, Gris y negro, Rojo y negro, Celeste y blanco, Beige y marrón |
| Estampado | Animal print (camel y chocolate), Camuflado (verde militar y marrón), Multicolor |

**Fuera de alcance:** subir una foto como muestra de color, dibujos distintos de los tres de arriba,
stock con cantidades (sigue siendo hay / no hay).

## Diseño

- **Base de datos:** `color_ropa` suma dos columnas opcionales: `hex2` (segundo tono, `#RRGGBB`) y
  `patron` (`animal_print`, `camuflado` o `multicolor`). Sin `hex2` ni `patron` el color es liso.
  Son columnas nuevas que pueden quedar vacías: no se borra ni se cambia ningún dato.
- **Validación (Zod):** Animal print y Camuflado necesitan `hex2` (Multicolor no usa tonos propios); `patron` solo de la lista.
- **API:** los colores devuelven `hex2` y `patron` donde hoy devuelven `hex`.
- **Pantallas:**
  - Un solo componente `MuestraColor` dibuja el círculo (liso, partido o con dibujo, con CSS) y reemplaza
    los 6 lugares que hoy pintan `hex`.
  - Panel → Colores: "Tipo" (Liso / Bitono / Estampado), segundo tono y dibujo.
  - Formulario de prenda, paso 4: colores en Básicos / Bitonos / Estampados; talles del grupo de la
    categoría con "Talle único" al lado y "Usar otro grupo"; cada talle Hay / No hay.
- **Prendas ya cargadas:** no se tocan en la base. La ficha las muestra con todos los talles (ROP-85); al
  editarlas y guardar, quedan guardados todos los talles del grupo.

## Tareas

1. [x] Base, validación, servicios y sugeridos (tests de reglas e integración).
2. [x] `MuestraColor` (test de la función pura) y los 6 lugares que la usan.
3. [x] Formulario de prenda (talles y colores) y Panel → Colores (tests de navegador).
4. [x] `node scripts/verificar.mjs --completo` en verde y capturas en escritorio y celular.
5. [x] Pasar las reglas a la spec del módulo y marcar este cambio como hecho.

## Decisiones

| Fecha | Regla | Decisión | Quién |
| --- | --- | --- | --- |
| 2026-11-16 | ROP-83 | Grupo automático según la categoría + "Talle único" siempre; los demás grupos escondidos en "Usar otro grupo". | Dueño del proyecto |
| 2026-11-16 | ROP-84 y ROP-85 | Solo "Hay / No hay"; "No hay" se ve tachado en la tienda. Lo que antes era "No se vende" pasa a "No hay". | Dueño del proyecto |
| 2026-11-16 | ROP-86 | Colores liso, bitono y estampado, separados en el formulario. | Dueño del proyecto |
| 2026-11-16 | ROP-87 | Animal print y Camuflado salen de Estampa (si nadie los usa) y quedan como colores. | Dueño del proyecto |
| 2026-11-16 | ROP-84 | Mejor marcar solo los talles que hay (arrancan sin marcar) que tocar cada uno entre Hay y No hay. Sin el rango "S a XXXL" en el botón del grupo. | Dueño del proyecto |

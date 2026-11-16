# Cambio: el material, según el tipo de prenda

| Estado | Pedido por | Fecha | Spec del módulo |
| --- | --- | --- | --- |
| Hecho | Dueño del proyecto | 2026-11-16 | [tienda_ropa/catalogo.md](../tienda_ropa/catalogo.md) |

## Por qué

"Material" (algodón, lino, cuero…) aparecía en todas las prendas. En un pantalón lo que importa es
calce, tiro y detalles; en una zapatilla, el cuero o la lona; en una remera, la tela. Cada tipo de
prenda tiene que ofrecer el material que le corresponde.

## Requisitos

| Código | Requisito | Estado |
| --- | --- | --- |
| ROP-82 | Material separado por tipo de prenda (árbol de abajo) y reorganización de lo ya cargado desde "Cargar características sugeridas". | ✅ |
| ROP-61 | (ajuste) Un grupo que solo tiene categorías de la lista sugerida se considera sin tocar y pasa al árbol nuevo. | ✅ |

### Árbol aprobado

| Tipo de prenda | Grupos |
| --- | --- |
| Remeras, Musculosas, Chombas, Camisas, Tops, Blusas, Bodys | Estampa, Tela, Manga, Cuello, Detalles |
| Buzos, Sweaters, Camperas, Chalecos, Sacos | Estampa, Material, Cuello, Detalles |
| Vestidos, Polleras, Monos y enteritos, Vestidos y polleras | Estampa, Tela, Manga, Detalles |
| Jeans, Pantalones, Bermudas, Shorts, Bermudas y shorts, Calzas | Calce, Tiro, Detalles |
| Calzado | Calzado, Material del calzado |
| Accesorios | Material del accesorio |

- **Tela:** Algodón, Lino, Modal, Viscosa, Seda, Satén, Tejido de punto, Deportivo (dry fit).
- **Material (abrigos):** Frisa, Polar, Lana, Algodón, Tejido de punto, Denim, Gabardina, Cuero, Eco cuero, Sintético.
- **Material del calzado:** Cuero, Eco cuero, Gamuza, Lona, Sintético.
- **Material del accesorio:** Cuero, Eco cuero, Lona, Sintético, Algodón.

## Reorganización de lo ya cargado

Al tocar "Cargar características sugeridas":

1. Se crean los grupos nuevos y los que no tocó el negocio quedan con las categorías del árbol.
2. Cada prenda con un valor de "Material" que ya no corresponde a su categoría lo pasa al grupo de
   material de su categoría con el mismo nombre (remera con Algodón → Tela: Algodón). Si ningún grupo
   de su categoría lo tiene (jean con Denim), se le saca.
3. "Material" pierde los valores de la lista vieja que ya no le corresponden y nadie usa. Los que
   agregó el negocio a mano quedan.

Se puede tocar varias veces: la segunda no cambia nada.

## Tareas

1. [x] Lista sugerida, reorganización y tests de integración.
2. [x] Datos de la tienda de demostración con los grupos nuevos.
3. [x] Reorganización probada en la base local, `verificar.mjs --completo` en verde y capturas.
4. [ ] En producción: Panel → Características → "Cargar características sugeridas".

## Decisiones

| Fecha | Regla | Decisión | Quién |
| --- | --- | --- | --- |
| 2026-11-16 | ROP-82 | Separar el material por tipo (Tela, Material, del calzado, del accesorio) en vez de un solo grupo. Accesorios solo con material. El resto de los grupos, como el árbol. | Dueño del proyecto |

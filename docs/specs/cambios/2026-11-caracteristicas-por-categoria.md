# Cambio: cada grupo de características, en sus categorías

| Estado | Pedido por | Fecha | Spec del módulo |
| --- | --- | --- | --- |
| Hecho | Dueño del proyecto | 2026-11-12 | [tienda_ropa/catalogo.md](../tienda_ropa/catalogo.md) |

## Por qué

Al cargar una prenda aparecían los 8 grupos con todos sus valores (más de 60 botones). A una remera
no le sirve "Tiro" ni "Caña alta"; a una zapatilla no le sirve "Cuello". El formulario tiene que
mostrar solo lo que corresponde a la categoría elegida.

## Requisitos

| Código | Requisito | Estado |
| --- | --- | --- |
| ROP-59 | **Grupo en sus categorías.** Cada grupo de características puede elegir en qué categorías se usa; vale también para las de adentro (Remeras incluye Hombre › Remeras › lo que haya debajo). Sin categorías elegidas, se usa en todas. | ✅ |
| ROP-60 | **Formulario de prenda por pasos.** 1) ¿Qué vas a cargar? (categoría con botones, bajando por el árbol; hasta elegirla no aparece el resto), 2) Datos, 3) Color y talles (talles del grupo de la categoría; cada talle se toca: Hay → Agotado → No se vende), 4) Características, 5) Fotos; abajo, barra fija con el resumen y Guardar. Características: muestra solo los grupos de la categoría elegida, más los que ya tengan algo tildado (no se esconde lo cargado). Sin categoría, pide elegirla. "Ver todas las características" muestra el resto. | ✅ |
| ROP-61 | **Relación sugerida.** "Cargar características sugeridas" deja relacionados los grupos que todavía no tienen categorías, con las categorías del panel que se llamen como la lista (sin importar mayúsculas). No cambia lo que el negocio ya eligió. | ✅ |

### Relación sugerida (aprobada)

| Grupo | Categorías |
| --- | --- |
| Estampa, Manga, Cuello | Remeras, Musculosas, Chombas, Camisas, Tops, Blusas, Bodys, Buzos, Sweaters, Vestidos, Vestidos y polleras, Conjuntos |
| Calce, Tiro | Jeans, Pantalones, Bermudas, Shorts, Bermudas y shorts |
| Detalles | Mujer, Hombre, Niños (toda la ropa) |
| Calzado | Calzado |
| Material | Todas (sin categorías) |

**Fuera de alcance:** obligar a cargar características, validar en el servidor que la característica
"corresponda" a la categoría (es una ayuda para cargar, no una regla de negocio). El filtro de la
tienda no cambia: ya muestra solo lo que tienen las prendas de la categoría (ROP-39).

## Diseño

- **Base de datos:** tabla `grupo_caracteristica_categoria` (grupo, categoría; única). Si se borra la
  categoría o el grupo, se borra la relación.
- **API (panel):** el grupo recibe y devuelve `categorias: [ids]`.
- **Pantallas:** Panel → Características: al editar un grupo, el árbol de categorías para tildar; cada
  fila dice dónde se usa. Formulario de prenda: según la categoría elegida (función pura
  `grupos_de_categoria.js`).

## Tareas

1. [x] Tabla, esquema, servicio y sugeridos (tests de reglas e integración).
2. [x] Panel: categorías del grupo y formulario de prenda (tests de la función y de navegador).
3. [x] `node scripts/verificar.mjs --completo` en verde y capturas en escritorio y celular.
4. [x] Pasar las reglas a la spec del módulo y marcar este cambio como hecho.

## Decisiones

| Fecha | Regla | Decisión | Quién |
| --- | --- | --- | --- |
| 2026-11-12 | ROP-60 | Rediseño del formulario: primero la categoría y de ahí talles y características, en una sola pantalla por pasos (sin "Siguiente"). | Dueño del proyecto |
| 2026-11-12 | ROP-59 a ROP-61 | Relacionar grupos con categorías (en vez de solo acortar la lista), con "Ver todas" y la relación sugerida de arriba. | Dueño del proyecto |

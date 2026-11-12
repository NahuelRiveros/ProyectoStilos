# Cambio: características de las prendas (reemplaza "Diseños")

| Estado | Pedido por | Fecha | Spec del módulo |
| --- | --- | --- | --- |
| Hecho | Dueño del proyecto | 2026-11-12 | [tienda_ropa/catalogo.md](../tienda_ropa/catalogo.md) |

## Por qué

"Diseño" admitía un solo valor por prenda (lisa, rayada o estampada). Una prenda tiene varias
características de distinto tipo: una zapatilla es "de cuero" y "con cordones"; un jean es "mom",
"tiro alto" y "con roturas". El cliente quiere filtrar por ellas.

## Requisitos

| Código | Requisito | Estado |
| --- | --- | --- |
| ROP-37 | **Características por grupo.** Grupos (nombre único, orden) con sus valores (únicos dentro del grupo, en orden). Se editan desde el panel como los grupos de talles: un valor que usa una prenda no se puede sacar, y un grupo con valores en uso no se borra. "Cargar sugeridas" suma los grupos y valores de la lista sin duplicar (sin importar mayúsculas). | ✅ |
| ROP-38 | **Varias por prenda.** Al cargar una prenda se tildan sus características (las que correspondan, de cualquier grupo). Al editarla se reemplazan. | ✅ |
| ROP-39 | **Filtro en el catálogo.** Un bloque por grupo, solo con los valores que tienen las prendas a la vista de la categoría elegida (en Calzado aparecen "Cuero" o "Con cordones", no "Tiro alto"). Dentro de un grupo se suman (Rayado **o** Floreado); entre grupos se combinan (Rayado **y** Algodón). Queda en la URL. | ✅ |
| ROP-58 | **Ficha.** Muestra las características agrupadas (ej. "Material: Cuero · Calzado: Con cordones"). | ✅ |
| ROP-23 | Reemplazada por ROP-37 a ROP-58: los valores de antes (Lisa, Rayada, Estampada) quedan como Liso, Rayado y Estampado del grupo **Estampa**. | ✅ |

### Lista sugerida

| Grupo | Valores |
| --- | --- |
| Estampa | Liso, Rayado, A cuadros, Estampado, Floreado, Animal print, Camuflado, Batik / tie-dye, Con logo, Bordado |
| Material | Algodón, Lino, Denim, Gabardina, Satén, Seda, Lana, Tejido de punto, Frisa, Polar, Modal, Viscosa, Cuero, Eco cuero, Gamuza, Lona, Sintético, Deportivo (dry fit) |
| Calce | Slim, Regular, Oversize, Chupín, Recto, Mom, Wide leg, Oxford, Baggy |
| Tiro | Alto, Medio, Bajo |
| Manga | Sin mangas, Corta, 3/4, Larga |
| Cuello | Redondo, En V, Polo, Camisero, Mao, Polera, Con capucha |
| Detalles | Elastizado, Con roturas, Con bolsillos, Con cierre, Con botones, Con brillos |
| Calzado | Con cordones, Con abrojo, Sin cordones, Caña baja, Caña media, Caña alta, Plataforma |

**Fuera de alcance:** limitar qué grupos se ofrecen según la categoría (el filtro ya muestra solo lo
que existe en ella), características con precio distinto, imágenes por característica.

## Diseño

- **Base de datos:** tablas `grupo_caracteristica`, `caracteristica` (grupo, nombre, orden; única por
  grupo) y `prenda_caracteristica` (prenda, característica; única). Se retira `diseno_ropa`
  (`proyecto/tablas_retiradas.js`) y la columna `prenda.diseno_id`. No se migra nada: ninguna prenda tenía
  diseño (ni en producción, sin datos, ni en la base local; revisado el 2026-11-12).
- **API (panel, "Editar productos"):** `/ropa/panel/caracteristicas` (grupos con sus valores: listar, crear,
  editar, borrar) y `/ropa/panel/caracteristicas/sugeridos`. La prenda recibe `caracteristicas: [ids]`.
- **API (tienda):** `GET /ropa/catalogo/prendas?car=1,7` filtra (ROP-39); `/filtros` devuelve los grupos con
  los valores en uso; la ficha devuelve `caracteristicas` agrupadas.
- **Pantallas:** Panel → "Características" (reemplaza "Diseños"); formulario de prenda con un bloque por grupo
  para tildar; filtro del catálogo por grupo; la ficha las muestra. Pensado para celular.

## Tareas

1. [x] Modelos, reglas, servicios y rutas (con tests de reglas e integración).
2. [x] Panel: Características y formulario de prenda.
3. [x] Tienda: filtro y ficha.
4. [x] `node scripts/verificar.mjs --completo` en verde y capturas en escritorio y celular.
5. [x] Pasar las reglas a la spec del módulo y marcar este cambio como hecho.

## Riesgos

- **Filtros largos en el celular:** muchos grupos; el panel de filtros ya es plegable.

## Decisiones

| Fecha | Regla | Decisión | Quién |
| --- | --- | --- | --- |
| 2026-11-12 | ROP-37 a ROP-58 | Características por grupo, varias por prenda; "Diseños" pasa al grupo Estampa. Lista sugerida aprobada. | Dueño del proyecto |

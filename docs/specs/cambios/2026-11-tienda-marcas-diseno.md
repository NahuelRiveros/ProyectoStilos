# Cambio: tienda online — marcas, diseño de la prenda y home

| Estado | Pedido por | Fecha | Spec del módulo |
| --- | --- | --- | --- |
| Hecha | Dueño del proyecto | 2026-11-11 | [tienda_ropa/catalogo.md](../tienda_ropa/catalogo.md) |

## Por qué

Stilos vende ropa y zapatillas de marcas conocidas (Taverniti, Bando, Raiders, Bravo, BBN, Panther, AFF,
MAYCLA, Isostasia, Cataleia, Mistral y US Amerika). El cliente busca por marca y por tipo de prenda
(lisa, rayada, estampada), y la ropa, el calzado y la ropa de niños usan talles distintos. La tienda tiene
que mostrar las marcas con su logo, dejar filtrar por diseño y no mezclar talles de ropa con números de calzado.

El negocio carga **cada color como un producto aparte** (ej. "Remera Taverniti" roja y "Remera Taverniti"
negra son dos prendas), con hasta 3 fotos. Así cada color tiene su propia tarjeta en el catálogo, y la ficha
avisa en qué otros colores viene.

## Requisitos

| Código | Requisito | Estado |
| --- | --- | --- |
| ROP-23 | **Diseño de la prenda.** Lista editable en el panel (nombre único, orden) con "Cargar sugeridos": Lisa, Rayada, Estampada. Cada prenda tiene un diseño opcional. No se borra un diseño que usa una prenda. El catálogo filtra por diseño (solo los que tienen prendas disponibles) y la ficha lo muestra. Si el mismo modelo viene liso y estampado, se carga como dos prendas. | ✅ `ropa_reglas.test.mjs` › "ROP-23 y ROP-25…"; `ropa.integration.mjs` › "ROP-23 a ROP-28…" |
| ROP-24 | **Marcas sugeridas.** Botón "Cargar marcas sugeridas" con las 12 marcas (Taverniti, Bando, Raiders, Bravo, BBN, Panther, AFF, MAYCLA, Isostasia, Cataleia, Mistral, US Amerika), sin duplicar (compara sin mayúsculas). Los nombres se pueden corregir después en el panel. | ✅ `ropa.integration.mjs` › "ROP-23 a ROP-28…" |
| ROP-25 | **Logo por marca.** Cada marca puede tener un logo (subido a Cloudinary, en la carpeta del proyecto: `stilos`), pedido al tamaño en que se muestra. Sin logo, se muestra el nombre. | ✅ `ropa_reglas.test.mjs` › "ROP-23 y ROP-25…" (pantalla: capturas) |
| ROP-26 | **Home.** Además del carrusel, las categorías y las novedades: sección "Marcas" (marcas activas con prendas visibles; al tocar una abre el catálogo filtrado por esa marca) y sección "Ofertas" (hasta 8 prendas en oferta; si no hay ninguna, la sección no aparece). | ✅ `ropa.integration.mjs` › "ROP-23 a ROP-28…" (marcas); pantalla: capturas |
| ROP-27 | **Categorías sugeridas.** Botón "Cargar categorías sugeridas": Mujer, Hombre, Niños y Calzado (sin duplicar). Las subcategorías (Remeras, Jeans, Zapatillas…) las arma el negocio. | ✅ `ropa.integration.mjs` › "ROP-23 a ROP-28…" |
| ROP-28 | **Filtros según la categoría.** Las opciones de marca, color, talle y diseño salen de las prendas de la categoría elegida (en Calzado solo aparecen números de calzado). Los talles se muestran agrupados por grupo (Ropa, Jeans, Calzado, Niños). | ✅ `ropa.integration.mjs` › "ROP-23 a ROP-28…" (pantalla: capturas) |
| ROP-29 | **Un color por prenda** (reemplaza ROP-06). Cada prenda tiene un solo color, con sus talles en "hay / agotado", y hasta 3 fotos en total. La URL lleva el color (`remera-taverniti-roja`), así dos colores del mismo modelo no chocan. | ✅ `ropa_reglas.test.mjs` › "ROP-29…"; `ropa.integration.mjs` › "ROP-05 a ROP-08…" |
| ROP-30 | **Otros colores** (cambia ROP-12). La ficha muestra "También en:" con la muestra de color de las otras prendas visibles del mismo modelo (mismo nombre y misma marca, sin importar mayúsculas ni espacios) y lleva a cada una. Si no hay otros colores, no aparece. | ✅ `ropa.integration.mjs` › "ROP-10 a ROP-12…" y "ROP-05 a ROP-08…" (panel) |
| ROP-04 (amplía) | Grupo de talles sugerido **Niños**: 8, 10, 12, 14, 16 (se agrega con "Cargar grupos sugeridos" sin tocar los que ya existen). | ✅ `ropa.integration.mjs` › "ROP-03 y ROP-04…" |

**Fuera de alcance:** página propia por marca (alcanza con el catálogo filtrado), varias marcas por
prenda, un campo "modelo" aparte para agrupar colores (se agrupa por nombre y marca).

## Diseño

- **Base de datos** (columnas y tabla nuevas, opcionales; las crea el `sync({alter:true})` del core):
  tabla `diseno_ropa` (nombre único, orden); `prenda.diseno_id` null → `diseno_ropa`;
  `marca_ropa.logo_url` null (https).
- **API:**
  - Panel (permiso "Editar productos"): `/ropa/panel/disenos` (listar, crear, editar, borrar) y
    `/ropa/panel/disenos/sugeridos`; `/ropa/panel/marcas/sugeridos`; `/ropa/panel/categorias/sugeridos`.
    La marca acepta `logo_url`; la prenda acepta `diseno_id`.
  - Tienda (pública): `GET /ropa/catalogo/marcas` (marcas para el home, con logo);
    `GET /ropa/catalogo/filtros?categoria=` (opciones de la categoría, talles con su grupo);
    `GET /ropa/catalogo/prendas` suma el filtro `diseno`. Las ofertas del home usan `?ofertas=1`.
    La ficha devuelve `otros_colores` ([{ slug, color }]) en la misma respuesta (sin otra consulta del navegador).
  - El esquema de la prenda rechaza variantes de más de un color y más de 3 fotos (ROP-29).
- **Pantallas:**
  - Panel: lista "Diseños" (igual que Marcas), logo en el formulario de marca, campo "Diseño" en la prenda,
    botones "Cargar sugeridos" en marcas, categorías y diseños. En la prenda se elige **un** color
    (no varios) y se suben hasta 3 fotos, sin separar "generales" y "por color".
  - Tienda: secciones "Marcas" y "Ofertas" en el inicio; filtro "Diseño" y talles agrupados en el catálogo;
    en la ficha, diseño y "También en:" en lugar del selector de color. Estados de carga, error con
    reintentar y vacío; pensado para celular.
- **Base (Supabase):** marcas y filtros cambian poco: caché de TanStack Query (5 minutos) para no consultar de más.

## Tareas

1. [x] Tests de los requisitos (fallan al principio).
2. [x] Un color por prenda, 3 fotos y "También en:" (ROP-29, ROP-30); grupo de talles Niños (ROP-04).
3. [x] Diseños: tabla, panel, prenda, filtro y ficha (ROP-23).
4. [x] Marcas: sugeridas, logo, sección del home (ROP-24 a ROP-26).
5. [x] Categorías sugeridas y ofertas en el home (ROP-26, ROP-27).
6. [x] Filtros según la categoría y talles agrupados (ROP-28).
7. [x] `node scripts/verificar.mjs --completo` en verde y capturas en escritorio y celular.
8. [x] Pasar las reglas a la spec del módulo y marcar este cambio como hecho.

## Riesgos

- **Logos:** formatos y tamaños muy distintos entre marcas; se muestran en una caja fija (contenidos, sin recortar).
- **Filtros por categoría:** una consulta más por cambio de categoría; se cachea.
- **Prendas ya cargadas:** quedan sin diseño hasta que el negocio lo elija (el filtro solo muestra las que tienen).
  Una prenda vieja con varios colores sigue viéndose, pero al editarla el panel pide dejar un solo color
  (los otros se cargan como prendas nuevas). Hoy no hay datos reales en producción, así que no se migran.
- **"También en:" por nombre:** si una prenda se carga como "Remera Taverniti" y otra como "Remera Tavernitti",
  no se vinculan. El panel muestra en la prenda con qué otros colores quedó agrupada, para detectarlo.
- **Pedidos guardados en el navegador:** las variantes conservan su id, así que los pedidos armados no se rompen.

## Decisiones

| Fecha | Regla | Decisión | Quién |
| --- | --- | --- | --- |
| 2026-11-11 | ROP-23 | Lisa / rayada / estampada es un dato de la prenda, filtrable (no un color). | Dueño del proyecto |
| 2026-11-11 | ROP-24 | Mistral es la marca; lo de niños va por la categoría Niños. | Dueño del proyecto |
| 2026-11-11 | ROP-24 a ROP-26 | Marcas sugeridas, logo por marca y sección de marcas en el home. | Dueño del proyecto |
| 2026-11-11 | ROP-27 | Categorías principales: Mujer, Hombre, Niños y Calzado. | Dueño del proyecto |
| 2026-11-11 | ROP-24 | Marcas: se suma US Amerika; "Niños" no es marca (es categoría). | Dueño del proyecto |
| 2026-11-11 | ROP-29, ROP-30 | Cada color es una prenda aparte con hasta 3 fotos; la ficha muestra "También en:" con los otros colores (mismo nombre y marca). | Dueño del proyecto |
| 2026-11-11 | ROP-04 | Talles de niños: 8, 10, 12, 14, 16. | Dueño del proyecto |

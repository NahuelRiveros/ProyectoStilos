// Lo que ofrecen los botones "Cargar sugeridos" del panel (ROP-03 y ROP-04). Datos del proyecto
// anterior de Stilos; se pueden editar o borrar después de cargarlos.
export const COLORES_SUGERIDOS = [
  ["Negro", "#111111"], ["Blanco", "#FFFFFF"], ["Crudo", "#F2EDE3"], ["Gris claro", "#D1D5DB"],
  ["Gris melange", "#A7A9AC"], ["Gris oscuro", "#4B5563"], ["Azul marino", "#1F2A44"], ["Azul", "#1D4ED8"],
  ["Celeste", "#93C5FD"], ["Azul petróleo", "#1E5162"], ["Jean claro", "#8BA7C7"], ["Jean oscuro", "#2E4057"],
  ["Verde militar", "#4B5320"], ["Verde oliva", "#708238"], ["Verde botella", "#0B4F3C"], ["Verde agua", "#A7D8C8"],
  ["Beige", "#D8C3A5"], ["Camel", "#C19A6B"], ["Marrón", "#6B4226"], ["Chocolate", "#3F2A1D"],
  ["Bordó", "#6D1A2B"], ["Rojo", "#C62828"], ["Rosa", "#F4A6B8"], ["Fucsia", "#D6247B"],
  ["Lila", "#B9A3D6"], ["Violeta", "#6B3FA0"], ["Amarillo", "#F2C94C"], ["Mostaza", "#C99A2E"],
  ["Naranja", "#EA7A2A"], ["Terracota", "#B5573A"],
].map(([nombre, hex], orden) => ({ nombre, hex, orden }));

// ROP-24: marcas que vende Stilos (decididas por el dueño, 2026-11-11).
export const MARCAS_SUGERIDAS = ["Taverniti", "Bando", "Raiders", "Bravo", "BBN", "Panther", "AFF", "MAYCLA", "Isostasia", "Cataleia", "Mistral", "US Amerika"];
export const DISENOS_SUGERIDOS = ["Lisa", "Rayada", "Estampada"]; // ROP-23
// ROP-27 y ROP-36: árbol de una tienda de ropa. `grupo`: grupo de talles sugerido (las subcategorías
// sin grupo propio usan el de arriba). Se puede editar todo después desde el panel.
const hojas = (...nombres) => nombres.map((nombre) => ({ nombre }));
const pantalones = (...tipos) => ({ nombre: "Pantalones", grupo: "Jeans", hijas: hojas("Gabardina", "Cargo", "Satén", ...tipos) });
export const CATEGORIAS_SUGERIDAS = [
  {
    nombre: "Mujer", grupo: "Ropa",
    hijas: [
      ...hojas("Remeras", "Musculosas", "Tops", "Blusas", "Camisas", "Bodys", "Buzos", "Sweaters", "Camperas", "Sacos", "Vestidos", "Polleras", "Monos y enteritos"),
      { nombre: "Jeans", grupo: "Jeans" },
      pantalones("Palazzo", "Jogging", "De vestir"),
      ...hojas("Calzas", "Shorts", "Mallas y bikinis", "Ropa interior"),
    ],
  },
  {
    nombre: "Hombre", grupo: "Ropa",
    hijas: [
      ...hojas("Remeras", "Musculosas", "Chombas", "Camisas", "Buzos", "Sweaters", "Camperas", "Chalecos", "Sacos"),
      { nombre: "Jeans", grupo: "Jeans" },
      pantalones("Jogging", "De vestir"),
      ...hojas("Bermudas", "Shorts", "Mallas", "Ropa interior"),
    ],
  },
  {
    nombre: "Niños", grupo: "Niños",
    hijas: hojas("Remeras", "Buzos", "Camperas", "Jeans", "Pantalones", "Bermudas y shorts", "Conjuntos", "Vestidos y polleras"),
  },
  { nombre: "Calzado", grupo: "Calzado", hijas: hojas("Zapatillas", "Zapatos", "Botas y borcegos", "Sandalias", "Ojotas") },
  { nombre: "Accesorios", grupo: "Talle único", hijas: hojas("Gorras", "Cinturones", "Medias", "Bolsos y mochilas", "Billeteras", "Bufandas y gorros") },
];

export const GRUPOS_TALLE_SUGERIDOS = [
  { nombre: "Ropa", talles: ["S", "M", "L", "XL", "XXL", "XXXL"] },
  { nombre: "Jeans", talles: ["36", "38", "40", "42", "44", "46", "48", "50", "52", "54", "56"] },
  { nombre: "Calzado", talles: ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45"] },
  { nombre: "Niños", talles: ["8", "10", "12", "14", "16"] },
  { nombre: "Talle único", talles: ["Único"] },
];

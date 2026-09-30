// Indumentaria (catalogo.variantes: "talle_color"): cada variante es una combinación color + talle
// de las listas del panel (ej. Remera Taverniti · Negro · M), con su propio código y stock.
// El producto guarda de qué grupo son sus talles (Ropa, Jeans, Calzado). Todo opcional: las
// distribuidoras siguen con presentaciones de nombre libre.

export async function up({ queryInterface, DataTypes, sequelize, schema }) {
  const ref = (tabla) => ({
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: { tableName: tabla, schema }, key: "id" },
    onDelete: "RESTRICT",
  });
  const sql = (texto) => sequelize.query(texto);

  await queryInterface.addColumn({ tableName: "producto", schema }, "grupo_talle_id", ref("grupo_talle"));
  await sql(`CREATE INDEX producto_grupo_talle_id ON ${schema}.producto (grupo_talle_id)`);

  await queryInterface.addColumn({ tableName: "variante", schema }, "color_id", ref("color"));
  await queryInterface.addColumn({ tableName: "variante", schema }, "talle_id", ref("talle"));
  await sql(`CREATE INDEX variante_color_id ON ${schema}.variante (color_id)`);
  await sql(`CREATE INDEX variante_talle_id ON ${schema}.variante (talle_id)`);
  // Una misma combinación no puede estar dos veces en el producto (COALESCE: sin color o sin talle también cuenta).
  await sql(`CREATE UNIQUE INDEX variante_combinacion_unica ON ${schema}.variante (producto_id, COALESCE(color_id, 0), COALESCE(talle_id, 0))
    WHERE eliminado_en IS NULL AND (color_id IS NOT NULL OR talle_id IS NOT NULL)`);
}

export async function down({ queryInterface, schema }) {
  await queryInterface.removeColumn({ tableName: "variante", schema }, "talle_id");
  await queryInterface.removeColumn({ tableName: "variante", schema }, "color_id");
  await queryInterface.removeColumn({ tableName: "producto", schema }, "grupo_talle_id");
}

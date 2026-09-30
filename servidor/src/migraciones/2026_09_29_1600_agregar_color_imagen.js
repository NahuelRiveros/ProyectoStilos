// Indumentaria: cada foto del producto puede ser de un color (ej. las 15 fotos de una remera, cada
// una con su color). En la tienda, al elegir un color se ven sus fotos. Vacío = foto general.

export async function up({ queryInterface, DataTypes, sequelize, schema }) {
  await queryInterface.addColumn({ tableName: "producto_imagen", schema }, "color_id", {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: { tableName: "color", schema }, key: "id" },
    onDelete: "RESTRICT",
  });
  await sequelize.query(`CREATE INDEX producto_imagen_color_id ON ${schema}.producto_imagen (color_id)`);
}

export async function down({ queryInterface, schema }) {
  await queryInterface.removeColumn({ tableName: "producto_imagen", schema }, "color_id");
}

// Paso 2 de 2: la marca ya vive en producto.marca_id (migración anterior); se borra la columna de texto.

export async function up({ queryInterface, schema }) {
  await queryInterface.removeColumn({ tableName: "producto", schema }, "marca");
}

// Vuelve la columna de texto con el nombre de la marca elegida.
export async function down({ queryInterface, DataTypes, sequelize, schema }) {
  await queryInterface.addColumn({ tableName: "producto", schema }, "marca", { type: DataTypes.STRING(80), allowNull: true });
  await sequelize.query(`UPDATE ${schema}.producto p SET marca = m.nombre FROM ${schema}.marca m WHERE m.id = p.marca_id`);
}

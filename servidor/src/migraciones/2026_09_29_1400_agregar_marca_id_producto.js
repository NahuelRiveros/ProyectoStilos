// La marca del producto pasa a elegirse de la lista de Marcas (para filtrar y no escribirla
// distinta cada vez). Paso 1 de 2: se agrega marca_id y se pasan las marcas escritas a mano a
// la tabla marca ("Oreo" y "oreo" quedan como una sola). La columna de texto se borra en la siguiente.

export async function up({ queryInterface, DataTypes, sequelize, schema }) {
  await queryInterface.addColumn({ tableName: "producto", schema }, "marca_id", {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: { tableName: "marca", schema }, key: "id" },
    onDelete: "RESTRICT",
  });
  await sequelize.query(`CREATE INDEX producto_marca_id ON ${schema}.producto (marca_id)`);

  await sequelize.query(`
    INSERT INTO ${schema}.marca (nombre)
    SELECT DISTINCT ON (lower(trim(p.marca))) trim(p.marca)
    FROM ${schema}.producto p
    WHERE p.marca IS NOT NULL AND trim(p.marca) <> ''
      AND NOT EXISTS (SELECT 1 FROM ${schema}.marca m WHERE m.eliminado_en IS NULL AND lower(m.nombre) = lower(trim(p.marca)))
    ORDER BY lower(trim(p.marca)), trim(p.marca)`);
  await sequelize.query(`
    UPDATE ${schema}.producto p SET marca_id = m.id
    FROM ${schema}.marca m
    WHERE m.eliminado_en IS NULL AND lower(m.nombre) = lower(trim(p.marca))`);
}

export async function down({ queryInterface, schema }) {
  // Las marcas creadas quedan en la lista (pueden estar en uso por productos nuevos).
  await queryInterface.removeColumn({ tableName: "producto", schema }, "marca_id");
}

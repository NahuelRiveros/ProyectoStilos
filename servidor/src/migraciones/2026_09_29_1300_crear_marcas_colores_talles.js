// Listas del catálogo que se cargan en el panel: marcas (para todos los rubros), colores y
// grupos de talles (indumentaria: "Ropa" S…XXXL, "Jeans" 36…56, "Calzado" 35…45).
// Los productos y variantes las usan desde la migración siguiente (etapa 2).

export async function up({ queryInterface, DataTypes, sequelize, schema }) {
  const ahora = sequelize.literal("CURRENT_TIMESTAMP");
  const tiempos = () => ({
    creado_en: { type: DataTypes.DATE, allowNull: false, defaultValue: ahora },
    actualizado_en: { type: DataTypes.DATE, allowNull: false, defaultValue: ahora },
    eliminado_en: { type: DataTypes.DATE, allowNull: true },
  });
  const id = () => ({ type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true });
  const orden = () => ({ type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 });
  const sql = (texto) => sequelize.query(texto);

  await queryInterface.createTable({ tableName: "marca", schema }, {
    id: id(),
    nombre: { type: DataTypes.STRING(80), allowNull: false },
    ...tiempos(),
  });
  await sql(`CREATE UNIQUE INDEX marca_nombre_unico ON ${schema}.marca (lower(nombre)) WHERE eliminado_en IS NULL`);

  await queryInterface.createTable({ tableName: "color", schema }, {
    id: id(),
    nombre: { type: DataTypes.STRING(40), allowNull: false },
    hex: { type: DataTypes.STRING(7), allowNull: false }, // #RRGGBB, para la muestra redonda
    orden: orden(),
    ...tiempos(),
  });
  await sql(`ALTER TABLE ${schema}.color ADD CONSTRAINT color_hex_valido CHECK (hex ~ '^#[0-9A-Fa-f]{6}$')`);
  await sql(`CREATE UNIQUE INDEX color_nombre_unico ON ${schema}.color (lower(nombre)) WHERE eliminado_en IS NULL`);

  await queryInterface.createTable({ tableName: "grupo_talle", schema }, {
    id: id(),
    nombre: { type: DataTypes.STRING(40), allowNull: false },
    orden: orden(),
    ...tiempos(),
  });
  await sql(`CREATE UNIQUE INDEX grupo_talle_nombre_unico ON ${schema}.grupo_talle (lower(nombre)) WHERE eliminado_en IS NULL`);

  // El orden importa: S, M, L, XL (no alfabético).
  await queryInterface.createTable({ tableName: "talle", schema }, {
    id: id(),
    grupo_talle_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: { tableName: "grupo_talle", schema }, key: "id" }, onDelete: "RESTRICT" },
    nombre: { type: DataTypes.STRING(20), allowNull: false },
    orden: orden(),
    ...tiempos(),
  });
  await sql(`CREATE INDEX talle_grupo_orden ON ${schema}.talle (grupo_talle_id, orden)`);
  await sql(`CREATE UNIQUE INDEX talle_nombre_unico ON ${schema}.talle (grupo_talle_id, lower(nombre)) WHERE eliminado_en IS NULL`);
}

export async function down({ queryInterface, schema }) {
  await queryInterface.dropTable({ tableName: "talle", schema });
  await queryInterface.dropTable({ tableName: "grupo_talle", schema });
  await queryInterface.dropTable({ tableName: "color", schema });
  await queryInterface.dropTable({ tableName: "marca", schema });
}

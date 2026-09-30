// Módulo pagos_online (Mercado Pago u otro proveedor):
//   pago_online → cada intento de pago de un pedido (el link que se le da al cliente) y su resultado.
//   aviso_pago  → cada aviso (webhook) ya procesado: el proveedor puede mandar el mismo varias veces.
// Y pedido_cobro acepta cobros que entran solos: sin usuario (registrado_por null), con origen
// "online" y a lo sumo UN cobro por pago (el índice único impide cobrarlo dos veces).

export async function up({ queryInterface, DataTypes, sequelize, schema }) {
  const ahora = sequelize.literal("CURRENT_TIMESTAMP");
  const sql = (texto) => sequelize.query(texto);

  await queryInterface.createTable({ tableName: "pago_online", schema }, {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    pedido_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: { tableName: "pedido", schema }, key: "id" }, onDelete: "RESTRICT" },
    proveedor: { type: DataTypes.STRING(30), allowNull: false }, // "mercado_pago"
    // iniciado → el cliente tiene el link · aprobado / pendiente / rechazado / reembolsado → lo que informa el proveedor
    // revisar → el proveedor aprobó algo que no cierra (otro monto, pedido cancelado): lo mira una persona
    estado: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "iniciado" },
    monto: { type: DataTypes.DECIMAL(12, 2), allowNull: false }, // saldo del pedido al iniciar (nunca lo manda el navegador)
    referencia_externa: { type: DataTypes.STRING(120), allowNull: true }, // id de la preferencia / sesión de cobro
    pago_externo_id: { type: DataTypes.STRING(120), allowNull: true }, // id del pago en el proveedor
    url_pago: { type: DataTypes.STRING(500), allowNull: true },
    detalle: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} }, // último estado informado (sin datos de tarjeta)
    creado_en: { type: DataTypes.DATE, allowNull: false, defaultValue: ahora },
    actualizado_en: { type: DataTypes.DATE, allowNull: false, defaultValue: ahora },
  });
  await sql(`ALTER TABLE ${schema}.pago_online
    ADD CONSTRAINT pago_online_monto_valido CHECK (monto > 0),
    ADD CONSTRAINT pago_online_estado_valido CHECK (estado IN ('iniciado', 'pendiente', 'aprobado', 'rechazado', 'reembolsado', 'revisar', 'error'))`);
  await sql(`CREATE INDEX pago_online_pedido ON ${schema}.pago_online (pedido_id, creado_en DESC)`);
  await sql(`CREATE UNIQUE INDEX pago_online_pago_externo_unico ON ${schema}.pago_online (proveedor, pago_externo_id) WHERE pago_externo_id IS NOT NULL`);

  await queryInterface.createTable({ tableName: "aviso_pago", schema }, {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    proveedor: { type: DataTypes.STRING(30), allowNull: false },
    id_evento: { type: DataTypes.STRING(200), allowNull: false },
    recibido_en: { type: DataTypes.DATE, allowNull: false, defaultValue: ahora },
  });
  await sql(`CREATE UNIQUE INDEX aviso_pago_unico ON ${schema}.aviso_pago (proveedor, id_evento)`);

  const cobro = { tableName: "pedido_cobro", schema };
  // SQL directo: changeColumn con `references` solo recrea la clave foránea y no quita el NOT NULL.
  await sql(`ALTER TABLE ${schema}.pedido_cobro ALTER COLUMN registrado_por DROP NOT NULL`);
  await queryInterface.addColumn(cobro, "origen", { type: DataTypes.STRING(20), allowNull: false, defaultValue: "manual" });
  await queryInterface.addColumn(cobro, "pago_online_id", {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: { tableName: "pago_online", schema }, key: "id" },
    onDelete: "RESTRICT",
  });
  await sql(`ALTER TABLE ${schema}.pedido_cobro
    ADD CONSTRAINT pedido_cobro_origen_valido CHECK (origen IN ('manual', 'online')),
    ADD CONSTRAINT pedido_cobro_origen_coherente CHECK ((origen = 'manual' AND registrado_por IS NOT NULL) OR (origen = 'online' AND pago_online_id IS NOT NULL))`);
  await sql(`CREATE UNIQUE INDEX pedido_cobro_un_cobro_por_pago ON ${schema}.pedido_cobro (pago_online_id) WHERE pago_online_id IS NOT NULL`);
}

export async function down({ queryInterface, sequelize, schema }) {
  const cobro = { tableName: "pedido_cobro", schema };
  await sequelize.query(`ALTER TABLE ${schema}.pedido_cobro DROP CONSTRAINT pedido_cobro_origen_coherente, DROP CONSTRAINT pedido_cobro_origen_valido`);
  await queryInterface.removeColumn(cobro, "pago_online_id");
  await queryInterface.removeColumn(cobro, "origen");
  // Solo se puede volver atrás si no quedan cobros automáticos (sin usuario).
  await sequelize.query(`ALTER TABLE ${schema}.pedido_cobro ALTER COLUMN registrado_por SET NOT NULL`);
  await queryInterface.dropTable({ tableName: "aviso_pago", schema });
  await queryInterface.dropTable({ tableName: "pago_online", schema });
}

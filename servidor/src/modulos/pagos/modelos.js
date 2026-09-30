// Modelos del módulo de pagos online. Tablas: migraciones/2026_09_30_1200_crear_pagos_online.js
import { DataTypes } from "sequelize";
import { defineModel } from "../../nucleo/db/define_model.js";

export const PagoOnline = defineModel("pago_online", {
  pedido_id: { type: DataTypes.INTEGER, allowNull: false },
  proveedor: { type: DataTypes.STRING(30), allowNull: false },
  estado: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "iniciado" },
  monto: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  referencia_externa: { type: DataTypes.STRING(120), allowNull: true },
  pago_externo_id: { type: DataTypes.STRING(120), allowNull: true },
  url_pago: { type: DataTypes.STRING(500), allowNull: true },
  detalle: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
});

// Avisos ya procesados: un aviso repetido no se procesa dos veces.
export const AvisoPago = defineModel(
  "aviso_pago",
  {
    proveedor: { type: DataTypes.STRING(30), allowNull: false },
    id_evento: { type: DataTypes.STRING(200), allowNull: false },
  },
  { createdAt: "recibido_en", updatedAt: false },
);

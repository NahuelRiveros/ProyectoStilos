import { DataTypes } from "sequelize";
import { sequelize } from "../../database/sequelize.js";
import { BASE_MODEL_OPTIONS } from "../_base.js";

export const Ord02CondicionIva = sequelize.define(
  "Ord02CondicionIva",
  {
    ID_ORD02: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // Código AFIP: "RI", "CF", "MT", "EX", "MO", "PCE", etc.
    ORD02_CODIGO: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
    },
    ORD02_NOMBRE: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    ORD02_FECHAALTA: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    ORD02_FECHABAJA: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    ...BASE_MODEL_OPTIONS,
    tableName: "ORD_02_CONDICION_IVA",
  }
);

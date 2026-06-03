import { DataTypes } from "sequelize";
import { sequelize } from "../../database/sequelize.js";
import { BASE_MODEL_OPTIONS } from "../_base.js";

// Condiciones frente al IVA (AFIP)
export const Ord02CondicionIva = sequelize.define(
  "Ord02CondicionIva",
  {
    ID_ORD02: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // "RI" | "CF" | "MT" | "EX" | "SS"
    ORD02_CODIGO: {
      type: DataTypes.STRING(5),
      allowNull: false,
      unique: true,
    },

    // "Responsable Inscripto", "Consumidor Final", etc.
    ORD02_NOMBRE: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },

    ORD02_FECHAALTA: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    ...BASE_MODEL_OPTIONS,
    tableName: "ORD_02_CONDICION_IVA",
  }
);

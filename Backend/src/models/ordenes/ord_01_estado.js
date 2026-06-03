import { DataTypes } from "sequelize";
import { sequelize } from "../../database/sequelize.js";
import { BASE_MODEL_OPTIONS } from "../_base.js";

// Catálogo de estados posibles de una orden
export const Ord01Estado = sequelize.define(
  "Ord01Estado",
  {
    ID_ORD01: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // código interno: "pendiente", "pago_pendiente", "pagado",
    //                 "preparando", "enviado", "entregado", "cancelado"
    ORD01_CODIGO: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },

    // etiqueta visible al usuario
    ORD01_ETIQUETA: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },

    ORD01_FECHAALTA: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    ...BASE_MODEL_OPTIONS,
    tableName: "ORD_01_ESTADO",
  }
);

import { DataTypes } from "sequelize";
import { sequelize } from "../../database/sequelize.js";
import { BASE_MODEL_OPTIONS } from "../_base.js";

export const Carr01Carrito = sequelize.define(
  "Carr01Carrito",
  {
    ID_CARR01: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // FK → AUTH_02_USUARIO
    RELA_AUTH02: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // un carrito activo por usuario
    },

    CARR01_FECHAALTA: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    CARR01_FECHAMOD: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    ...BASE_MODEL_OPTIONS,
    tableName: "CARR_01_CARRITO",
  }
);

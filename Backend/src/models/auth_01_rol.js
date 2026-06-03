import { DataTypes } from "sequelize";
import { sequelize } from "../database/sequelize.js";
import { BASE_MODEL_OPTIONS } from "./_base.js";

export const Auth01Rol = sequelize.define(
  "Auth01Rol",
  {
    ID_AUTH01: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    AUTH01_NOMBRE: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    AUTH01_ABREVIATURA: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
    },

    AUTH01_FECHAALTA: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    AUTH01_FECHABAJA: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    ...BASE_MODEL_OPTIONS,
    tableName: "AUTH_01_ROL",
  }
);

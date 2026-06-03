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

    // Nivel de privilegio del rol (0-100).
    // Permite requireNivel(min) sin listar cada abreviatura individualmente.
    // Convención: ADMIN=100, STAFF=50, USR=10. Cada proyecto define los suyos.
    AUTH01_NIVEL: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },

    AUTH01_FECHAALTA: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
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

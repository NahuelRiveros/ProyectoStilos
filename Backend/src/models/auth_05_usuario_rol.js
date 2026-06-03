import { DataTypes } from "sequelize";
import { sequelize } from "../database/sequelize.js";
import { BASE_MODEL_OPTIONS } from "./_base.js";

// Tabla junction N:N entre AUTH_02_USUARIO y AUTH_01_ROL.
// Permite que un usuario tenga múltiples roles simultáneos y mantiene
// historial de asignaciones mediante soft delete en AUTH05_FECHABAJA.
export const Auth05UsuarioRol = sequelize.define(
  "Auth05UsuarioRol",
  {
    ID_AUTH05: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    RELA_AUTH02: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    RELA_AUTH01: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    AUTH05_FECHAALTA: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    // null = asignación activa | fecha = rol revocado
    AUTH05_FECHABAJA: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    ...BASE_MODEL_OPTIONS,
    tableName: "AUTH_05_USUARIO_ROL",
  }
);

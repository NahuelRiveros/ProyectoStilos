import { DataTypes } from "sequelize";
import { sequelize } from "../database/sequelize.js";
import { BASE_MODEL_OPTIONS } from "./_base.js";

// Auditoría de intentos de login (exitosos y fallidos).
// RELA_AUTH02 puede ser null si el email no corresponde a ningún usuario.
export const Auth04LogSesion = sequelize.define(
  "Auth04LogSesion",
  {
    ID_AUTH04: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // FK → AUTH_02_USUARIO (null si el email no existe)
    RELA_AUTH02: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    // Email intentado (útil aunque el usuario no exista)
    AUTH04_EMAIL: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    AUTH04_IP: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    // "OK" | "FAIL_PASS" | "FAIL_INACTIVO" | "FAIL_NOT_FOUND"
    AUTH04_RESULTADO: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },

    AUTH04_FECHAALTA: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    ...BASE_MODEL_OPTIONS,
    tableName: "AUTH_04_LOG_SESION",
  }
);

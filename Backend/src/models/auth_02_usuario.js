import { DataTypes } from "sequelize";
import { sequelize } from "../database/sequelize.js";
import { BASE_MODEL_OPTIONS } from "./_base.js";

export const Auth02Usuario = sequelize.define(
  "Auth02Usuario",
  {
    ID_AUTH02: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // FK → AUTH_01_ROL
    RELA_AUTH01: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    AUTH02_NOMBRE: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    AUTH02_APELLIDO: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    AUTH02_EMAIL: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },

    AUTH02_CONTRASENA: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    // Nombre de usuario opcional, derivado del email si no se provee
    AUTH02_USERNAME: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },

    // URL de avatar (S3, CDN, etc.) — null si no tiene
    AUTH02_AVATAR: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    AUTH02_FECHAALTA: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    // Soft delete: null = activo, fecha = dado de baja
    AUTH02_FECHABAJA: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    ...BASE_MODEL_OPTIONS,
    tableName: "AUTH_02_USUARIO",
  }
);

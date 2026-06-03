import { DataTypes } from "sequelize";
import { sequelize } from "../database/sequelize.js";
import { BASE_MODEL_OPTIONS } from "./_base.js";

// Tokens de recuperación de contraseña.
// Se guarda el hash SHA-256 del token (el token plano solo viaja por email).
export const Auth03ResetToken = sequelize.define(
  "Auth03ResetToken",
  {
    ID_AUTH03: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // FK → AUTH_02_USUARIO
    RELA_AUTH02: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // SHA-256 del token plano enviado por email
    AUTH03_TOKEN: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    AUTH03_EXPIRA: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    AUTH03_USADO: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    AUTH03_FECHAALTA: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    ...BASE_MODEL_OPTIONS,
    tableName: "AUTH_03_RESET_TOKEN",
  }
);

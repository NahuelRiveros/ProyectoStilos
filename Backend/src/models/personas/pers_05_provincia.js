import { DataTypes } from "sequelize";
import { sequelize } from "../../database/sequelize.js";
import { BASE_MODEL_OPTIONS } from "../_base.js";

export const pers_05_provincia = sequelize.define(
  "pers_05_provincia",
  {
    ID_PERS_05: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    PERS_05_NOMBRE: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },

    PERS_05_CODIGO: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
    },

    PERS_05_ISO: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },

    PERS_05_NOMBRE_COMPLETO: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    PERS_05_CATEGORIA: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    PERS_05_FUENTE: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    PERS_05_ACTIVA: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    PERS_05_CREATED_AT: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    PERS_05_UPDATED_AT: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    ...BASE_MODEL_OPTIONS,
    tableName: "PERS_05_PROVINCIA",
  }
);
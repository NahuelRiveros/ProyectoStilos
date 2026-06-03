import { DataTypes } from "sequelize";
import { sequelize } from "../../database/sequelize.js";
import { BASE_MODEL_OPTIONS } from "../_base.js";

export const pers_02_tipo_documento = sequelize.define(
  "pers_02_tipo_documento",
  {
    ID_PERS_02: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // FK → AUTH_01_ROL
    PERS_02_DESCRIPCION: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    PERS_02_ABREVIATURA: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    PERS_02_CODIGO: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    PERS_02_FECHAALTA: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    // Soft delete: null = activo, fecha = dado de baja
    PERS_02_FECHABAJA: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    ...BASE_MODEL_OPTIONS,
    tableName: "PERS_02_TIPO_DOCUMENTO",
  }
);

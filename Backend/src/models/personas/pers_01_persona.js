import { DataTypes } from "sequelize";
import { sequelize } from "../../database/sequelize.js";
import { BASE_MODEL_OPTIONS } from "../_base.js";

export const pers_01_persona = sequelize.define(
  "pers_01_persona",
  {
    ID_PERS_01: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // FK → AUTH_01_ROL
    
    RELA_PERS_02_TIPO_DOCUMENTO: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    RELA_PERS_03_SEXO: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    RELA_PERS_04_ESTADO_CIVIL: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    RELA_PERS_06_LOCALIDAD: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    PERS_01_NOMBRE: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    PERS_01_APELLIDO: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    PERS_01_DOMICILIO: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    PERS_01_FECHAALTA: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    // Soft delete: null = activo, fecha = dado de baja
    PERS_01_FECHABAJA: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    ...BASE_MODEL_OPTIONS,
    tableName: "PERS_01_PERSONA",
  }
);

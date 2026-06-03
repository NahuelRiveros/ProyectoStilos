import { DataTypes } from "sequelize";
import { sequelize } from "../../database/sequelize.js";
import { BASE_MODEL_OPTIONS } from "../_base.js";

export const pers_06_localidad = sequelize.define(
  "pers_06_localidad",
  {
    ID_PERS_06: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    RELA_PERS_05_PROVINCIA: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    PERS_06_LOCALIDAD_CODIGO: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },

    PERS_06_LOCALIDAD: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    PERS_06_LOCALIDAD_CATEGORIA: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },

    PERS_06_DEPTO_CODIGO: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    PERS_06_LOCALIDAD_DEPARTAMENTO: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    PERS_06_LOCALIDAD_GOB_LOCAL_CODIGO: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    PERS_06_LOCALIDAD_GOB_LOCAL: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    PERS_06_CENSAL_CODIGO: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    PERS_06_LOCALIDAD_CENSAL: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    PERS_06_LOCALIDAD_ACTIVA: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    PERS_06_LOCALIDAD_CREATED_AT: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    PERS_06_LOCALIDAD_UPDATED_AT: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    ...BASE_MODEL_OPTIONS,
    tableName: "PERS_06_LOCALIDAD",
    indexes: [
      {
        name: "idx_pers_06_localidad_codigo_unique",
        unique: true,
        fields: ["PERS_06_LOCALIDAD_CODIGO"],
      },
      {
        name: "idx_pers_06_localidad_provincia",
        fields: ["RELA_PERS_05_PROVINCIA"],
      },
      {
        name: "idx_pers_06_localidad_nombre",
        fields: ["PERS_06_LOCALIDAD"],
      },
    ],
  },
);

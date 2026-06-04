import { DataTypes } from "sequelize";
import { sequelize } from "../../database/sequelize.js";
import { BASE_MODEL_OPTIONS } from "../_base.js";

export const Prod02Genero = sequelize.define(
  "Prod02Genero",
  {
    ID_PROD02: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    PROD02_NOMBRE: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    // slug para URL: "damas", "hombre", "calzado"
    PROD02_SLUG: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },

    PROD02_FECHAALTA: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    PROD02_FECHABAJA: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    ...BASE_MODEL_OPTIONS,
    tableName: "PROD_02_GENERO",
    indexes: [
      {
        unique: true,
        fields: ["PROD02_SLUG"],
        where: { PROD02_FECHABAJA: null },
        name: "PROD_02_GENERO_slug_activo_unique",
      },
    ],
  }
);

import { DataTypes } from "sequelize";
import { sequelize } from "../../database/sequelize.js";
import { BASE_MODEL_OPTIONS } from "../_base.js";

export const Prod08CategoriaGenero = sequelize.define(
  "Prod08CategoriaGenero",
  {
    ID_PROD08: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // FK → PROD_01_CATEGORIA (solo categorías raíz, RELA_PARENT IS NULL)
    RELA_PROD01: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // FK → PROD_02_GENERO
    RELA_PROD02: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // Orden de la categoría dentro del dropdown del género
    PROD08_ORDEN: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    ...BASE_MODEL_OPTIONS,
    tableName: "PROD_08_CATEGORIA_GENERO",
    indexes: [
      {
        unique: true,
        fields: ["RELA_PROD01", "RELA_PROD02"],
        name: "uq_categoria_genero",
      },
    ],
  }
);

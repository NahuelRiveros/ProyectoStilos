import { DataTypes } from "sequelize";
import { sequelize } from "../../database/sequelize.js";
import { BASE_MODEL_OPTIONS } from "../_base.js";

export const Prod01Categoria = sequelize.define(
  "Prod01Categoria",
  {
    ID_PROD01: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    PROD01_NOMBRE: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },

    // slug para URL: "remeras", "pantalones", "vestidos"
    PROD01_SLUG: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },

    // null = categoría raíz; número = es subcategoría de ese ID
    RELA_PARENT: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    PROD01_FECHAALTA: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    PROD01_FECHABAJA: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    ...BASE_MODEL_OPTIONS,
    tableName: "PROD_01_CATEGORIA",
    indexes: [
      {
        unique: true,
        fields: ["PROD01_SLUG"],
        where: { PROD01_FECHABAJA: null },
        name: "PROD_01_CATEGORIA_slug_activo_unique",
      },
    ],
  }
);

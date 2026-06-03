import { DataTypes } from "sequelize";
import { sequelize } from "../../database/sequelize.js";
import { BASE_MODEL_OPTIONS } from "../_base.js";

export const Prod07Marca = sequelize.define(
  "Prod07Marca",
  {
    ID_PROD07: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    PROD07_NOMBRE: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    // slug para URL: "lacoste", "adidas", "zara"
    PROD07_SLUG: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    // URL o path del logo
    PROD07_LOGO: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    PROD07_DESCRIPCION: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // Para ordenar en listados y selectores
    PROD07_ORDEN: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    PROD07_ACTIVO: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    PROD07_FECHAALTA: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    PROD07_FECHABAJA: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    ...BASE_MODEL_OPTIONS,
    tableName: "PROD_07_MARCA",
    indexes: [
      {
        unique: true,
        fields: ["PROD07_SLUG"],
        where: { PROD07_FECHABAJA: null },
        name: "PROD_07_MARCA_slug_activo_unique",
      },
    ],
  }
);

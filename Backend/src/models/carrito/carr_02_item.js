import { DataTypes } from "sequelize";
import { sequelize } from "../../database/sequelize.js";
import { BASE_MODEL_OPTIONS } from "../_base.js";

export const Carr02Item = sequelize.define(
  "Carr02Item",
  {
    ID_CARR02: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // FK → CARR_01_CARRITO
    RELA_CARR01: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // FK → PROD_03_PRODUCTO
    RELA_PROD03: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // FK → PROD_04_TALLE (null = sin talle)
    RELA_PROD04: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    CARR02_CANTIDAD: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    // snapshot del precio al momento de agregar
    CARR02_PRECIO_UNIDAD: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    CARR02_FECHAALTA: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    ...BASE_MODEL_OPTIONS,
    tableName: "CARR_02_ITEM",
    indexes: [
      {
        unique: true,
        fields: ["RELA_CARR01", "RELA_PROD03", "RELA_PROD04"],
        name: "uq_carrito_producto_talle",
      },
    ],
  }
);

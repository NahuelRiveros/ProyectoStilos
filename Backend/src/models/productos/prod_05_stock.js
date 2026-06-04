import { DataTypes } from "sequelize";
import { sequelize } from "../../database/sequelize.js";
import { BASE_MODEL_OPTIONS } from "../_base.js";

export const Prod05Stock = sequelize.define(
  "Prod05Stock",
  {
    ID_PROD05: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // FK → PROD_03_PRODUCTO
    RELA_PROD03: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // FK → PROD_04_TALLE (null = producto sin talles)
    RELA_PROD04: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    // FK → PROD_06_COLOR (null = producto sin variante de color)
    RELA_PROD06: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    PROD05_STOCK: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    PROD05_FECHAALTA: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    PROD05_FECHABAJA: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    ...BASE_MODEL_OPTIONS,
    tableName: "PROD_05_STOCK",
    indexes: [
      {
        unique: true,
        fields: ["RELA_PROD03", "RELA_PROD04", "RELA_PROD06"],
        where: { PROD05_FECHABAJA: null },
        name: "uq_stock_producto_talle_color",
      },
    ],
  }
);

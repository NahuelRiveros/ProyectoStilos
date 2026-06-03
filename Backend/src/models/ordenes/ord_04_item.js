import { DataTypes } from "sequelize";
import { sequelize } from "../../database/sequelize.js";
import { BASE_MODEL_OPTIONS } from "../_base.js";

export const Ord04Item = sequelize.define(
  "Ord04Item",
  {
    ID_ORD04: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // FK → ORD_03_ORDEN
    RELA_ORD03: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // FK → PROD_03_PRODUCTO (nullable: el producto puede eliminarse)
    RELA_PROD03: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    // snapshots al momento de la compra (para historiales correctos)
    ORD04_NOMBRE: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    ORD04_CATEGORIA: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },

    // null = producto sin talle
    ORD04_TALLE: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },

    ORD04_PRECIO_UNIDAD: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    ORD04_CANTIDAD: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    ORD04_SUBTOTAL: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    ...BASE_MODEL_OPTIONS,
    tableName: "ORD_04_ITEM",
  }
);

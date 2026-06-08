import { DataTypes } from "sequelize";
import { sequelize } from "../../database/sequelize.js";
import { BASE_MODEL_OPTIONS } from "../_base.js";

export const Prod03Producto = sequelize.define(
  "Prod03Producto",
  {
    ID_PROD03: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // FK → PROD_01_CATEGORIA
    RELA_PROD01: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // FK → PROD_02_GENERO
    RELA_PROD02: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // FK → PROD_07_MARCA (opcional — un producto puede no tener marca asignada)
    RELA_PROD07: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    PROD03_NOMBRE: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    PROD03_DESCRIPCION: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    PROD03_PRECIO: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    // null = sin precio anterior / sin oferta
    PROD03_PRECIO_ANTERIOR: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    // etiqueta de descuento visible: "-20%", "2x1", etc.
    PROD03_DESCUENTO: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    // null | "nuevo" | "vuelve" | "agotado"
    PROD03_BADGE: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },

    // null | "carousel" | "novedades"
    // Controla en qué sección del home aparece el producto
    PROD03_HOME_SECCION: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    // Código de referencia interno (SKU, código de proveedor, etc.)
    PROD03_COD_REF: {
      type: DataTypes.STRING(60),
      allowNull: true,
    },

    // Array JSON: [{ src: string, alt?: string }]
    PROD03_IMAGENES: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },

    // Array JSON: IDs de colores asociados al producto [ 1, 3, 5 ]
    PROD03_COLORES: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },

    PROD03_ACTIVO: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    PROD03_FECHAALTA: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    PROD03_FECHABAJA: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    ...BASE_MODEL_OPTIONS,
    tableName: "PROD_03_PRODUCTO",
  }
);

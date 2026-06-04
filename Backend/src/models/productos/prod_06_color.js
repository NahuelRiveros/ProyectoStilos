import { DataTypes } from "sequelize";
import { sequelize } from "../../database/sequelize.js";
import { BASE_MODEL_OPTIONS } from "../_base.js";

export const Prod06Color = sequelize.define(
  "Prod06Color",
  {
    ID_PROD06: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // Ej: "Negro", "Blanco", "Rojo", "Azul marino"
    PROD06_NOMBRE: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    // Valor hexadecimal para mostrar swatch: "#1F2937"
    PROD06_HEX: {
      type: DataTypes.STRING(7),
      allowNull: true,
    },

    // Para ordenar en selectores y grillas
    PROD06_ORDEN: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    PROD06_FECHAALTA: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    PROD06_FECHABAJA: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    ...BASE_MODEL_OPTIONS,
    tableName: "PROD_06_COLOR",
  }
);

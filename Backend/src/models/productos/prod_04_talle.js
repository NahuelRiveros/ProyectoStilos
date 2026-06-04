import { DataTypes } from "sequelize";
import { sequelize } from "../../database/sequelize.js";
import { BASE_MODEL_OPTIONS } from "../_base.js";

export const Prod04Talle = sequelize.define(
  "Prod04Talle",
  {
    ID_PROD04: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // "XS", "S", "M", "L", "XL", "XXL", "36", "37", "38", "U" (único entre activos)
    PROD04_NOMBRE: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },

    // para ordenar la visualización del selector de talles
    PROD04_ORDEN: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    PROD04_FECHAALTA: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    PROD04_FECHABAJA: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    ...BASE_MODEL_OPTIONS,
    tableName: "PROD_04_TALLE",
    indexes: [
      {
        unique: true,
        fields: ["PROD04_NOMBRE"],
        where: { PROD04_FECHABAJA: null },
        name: "PROD_04_TALLE_nombre_activo_unique",
      },
    ],
  }
);

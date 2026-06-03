import { DataTypes } from "sequelize";
import { sequelize } from "../../database/sequelize.js";
import { BASE_MODEL_OPTIONS } from "../_base.js";

export const pers_04_estado_civil = sequelize.define(
  "pers_04_estado_civil",
  {
    ID_PERS_04: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // FK → AUTH_01_ROL
    PERS_04_DESCRIPCION: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    PERS_04_FECHAALTA: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    // Soft delete: null = activo, fecha = dado de baja
    PERS_04_FECHABAJA: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    ...BASE_MODEL_OPTIONS,
    tableName: "PERS_04_ESTADO_CIVIL",
  }
);

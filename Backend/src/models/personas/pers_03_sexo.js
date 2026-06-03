import { DataTypes } from "sequelize";
import { sequelize } from "../../database/sequelize.js";
import { BASE_MODEL_OPTIONS } from "../_base.js";

export const pers_03_sexo = sequelize.define(
  "pers_03_sexo",
  {
    ID_PERS_03: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // FK → AUTH_01_ROL
    PERS_03_DESCRIPCION: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    
    PERS_03_FECHAALTA: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    // Soft delete: null = activo, fecha = dado de baja
    PERS_03_FECHABAJA: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    ...BASE_MODEL_OPTIONS,
    tableName: "PERS_03_SEXO",
  }
);

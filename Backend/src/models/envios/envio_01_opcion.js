import { DataTypes } from "sequelize";
import { sequelize } from "../../database/sequelize.js";
import { BASE_MODEL_OPTIONS } from "../_base.js";

// Opciones de envío disponibles (Correo Argentino, OCA, retiro, etc.)
export const Envio01Opcion = sequelize.define(
  "Envio01Opcion",
  {
    ID_ENVIO01: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    ENVIO01_NOMBRE: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    ENVIO01_DESCRIPCION: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },

    ENVIO01_PRECIO: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    // "3-5 días hábiles", "24 hs", "Retiro inmediato"
    ENVIO01_TIEMPO_ESTIMADO: {
      type: DataTypes.STRING(60),
      allowNull: true,
    },

    // monto de compra desde el cual el envío es gratis (null = nunca gratis)
    ENVIO01_GRATIS_DESDE: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    ENVIO01_ACTIVO: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    ENVIO01_FECHAALTA: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    ENVIO01_FECHABAJA: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    ...BASE_MODEL_OPTIONS,
    tableName: "ENVIO_01_OPCION",
  }
);

import { DataTypes } from "sequelize";
import { sequelize } from "../database/sequelize.js";
import { BASE_MODEL_OPTIONS } from "./_base.js";

// Registro de cada acción sobre la suscripción del sistema.
// Se inserta un log en cada activación, renovación, cambio de gracia y eliminación.
export const Auth07SuscripcionLog = sequelize.define(
  "Auth07SuscripcionLog",
  {
    ID_AUTH07: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // ACTIVAR | RENOVAR | GRACIA | ELIMINAR
    AUTH07_ACCION: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    // Días aplicados (para ACTIVAR/RENOVAR), null para otras acciones
    AUTH07_DIAS: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    // Fecha de fin resultante después de la acción
    AUTH07_FECHA_FIN_RESULT: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    // Nota libre del SADM
    AUTH07_NOTAS: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // Email del SADM que realizó la acción
    AUTH07_EMAIL: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    AUTH07_FECHA: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    ...BASE_MODEL_OPTIONS,
    tableName: "AUTH_07_SUSCRIPCION_LOG",
  }
);

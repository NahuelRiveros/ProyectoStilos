import { DataTypes } from "sequelize";
import { sequelize } from "../database/sequelize.js";
import { BASE_MODEL_OPTIONS } from "./_base.js";

// Registro único de suscripción del sistema.
// Se actualiza en cada renovación (no se crean registros nuevos).
// El estado se calcula dinámicamente en suscripcion_service.js:
//   ACTIVO  → fecha_fin >= hoy
//   GRACIA  → fecha_fin < hoy AND día_del_mes <= AUTH06_DIAS_GRACIA
//   VENCIDO → fecha_fin < hoy AND día_del_mes >  AUTH06_DIAS_GRACIA
export const Auth06Suscripcion = sequelize.define(
  "Auth06Suscripcion",
  {
    ID_AUTH06: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    AUTH06_FECHA_INICIO: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    AUTH06_FECHA_FIN: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    // Hasta qué día del mes se considera "período de gracia" (default: 10)
    AUTH06_DIAS_GRACIA: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },

    // Cuántas renovaciones se realizaron
    AUTH06_RENOVACIONES: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    // Nota libre del admin (ej: "Pagó el 5 de junio vía transferencia")
    AUTH06_NOTAS: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    AUTH06_FECHAALTA: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    ...BASE_MODEL_OPTIONS,
    tableName: "AUTH_06_SUSCRIPCION",
  }
);

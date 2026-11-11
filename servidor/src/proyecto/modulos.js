import { projectModules } from "../core/configuracion_servidor/gate_config.js";
import { moduloTiendaRopa } from "../modulos/tienda_ropa/modulo.js";

// Módulos de rubro instalados en este proyecto. El core (rutas, bootstrap, seed) solo recorre
// esta lista: para sumar un rubro se crea su carpeta con su modulo.js y se agrega acá y en
// proyecto/gate_config.js.
const INSTALADOS = [moduloTiendaRopa];

export const modulosActivos = INSTALADOS.filter((modulo) => projectModules[modulo.codigo]);

import { projectModules } from "../core/config/gate_config.js";
import { moduloTiendaRopa } from "../modules/tienda_ropa/modulo.js";

// Rubros instalados (sus datos: menús, footer, login). Para sumar uno, se crea su carpeta con
// modulo.js y modulo_pantallas.jsx y se agrega acá, en pantallas_modulos.jsx y en gate_config.js.
const INSTALADOS = [moduloTiendaRopa];

export const modulosActivos = INSTALADOS.filter((modulo) => projectModules[modulo.codigo]);

// El primer módulo activo con tienda decide catálogo, footer y destino después del login.
export const tiendaActiva = modulosActivos.find((modulo) => modulo.tienda)?.tienda ?? null;

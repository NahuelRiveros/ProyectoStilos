import { modulosActivos } from "./modulos_activos.js";
import { pantallasTiendaRopa } from "../modules/tienda_ropa/modulo_pantallas.jsx";

// Pantallas de cada rubro instalado (ver modulos_activos.js).
const INSTALADAS = [pantallasTiendaRopa];

const activos = new Set(modulosActivos.map((modulo) => modulo.codigo));
export const pantallasActivas = INSTALADAS.filter((pantallas) => activos.has(pantallas.codigo));

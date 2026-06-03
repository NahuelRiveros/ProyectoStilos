// Las opciones de envío se exponen como catálogo desde el backend.
// Este archivo re-exporta desde catalogo_api para compatibilidad
// con los componentes que importen desde "envio_api".
export type { OpcionEnvio } from "./catalogo_api";
export { getOpcionesEnvio } from "./catalogo_api";

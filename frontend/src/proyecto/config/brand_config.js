/**
 * Identidad del cliente: nombre, logo y fuentes. La paleta está en theme_config.js.
 * Se elige con `id` de proyecto/client_config.js.
 */
import { clientConfig } from "../../../../proyecto/client_config.js";

export const clientes = {
  stilos: {
    nombre: "Stilo's",
    nombreCorto: "Stilo's",
    rubro: "Indumentaria",
    tagline: "Moda y estilo",
    razonSocial: null, // [COMPLETAR] razón social para el pie de página
    // "gc-mark" muestra las imágenes de logo_config.js.
    logo: { tipo: "gc-mark", texto: "Stilo's", ariaLabel: "Stilo's" },
    // Tipografías del manual de marca (se cargan en index.html).
    fuentes: {
      // ROP-68: títulos en una sans fuerte (decidido el 2026-11-13; antes Cormorant Garamond).
      display: "'Archivo', 'DM Sans', ui-sans-serif, system-ui, sans-serif",
      body: "'DM Sans', ui-sans-serif, system-ui, sans-serif",
    },
  },
};

export const clienteActivo = clientConfig.id;
export const brandConfig = clientes[clienteActivo];

/**
 * Identidad del cliente: nombre, logo y fuentes. La paleta está en theme_config.js.
 * Se elige con `id` de proyecto/client_config.js.
 */
import { clientConfig } from "../../../../proyecto/client_config.js";

export const clientes = {
  stilos: {
    nombre: "Stilos",
    nombreCorto: "Stilos",
    rubro: "Indumentaria",
    tagline: "Moda y estilo",
    razonSocial: null, // [COMPLETAR] razón social para el pie de página
    // "gc-mark" muestra las imágenes de logo_config.js.
    logo: { tipo: "gc-mark", texto: "Stilos", ariaLabel: "Stilos" },
    // Tipografías del manual de marca (se cargan en index.html).
    fuentes: {
      display: "'Cormorant Garamond', Georgia, serif",
      body: "'DM Sans', ui-sans-serif, system-ui, sans-serif",
    },
  },
};

export const clienteActivo = clientConfig.id;
export const brandConfig = clientes[clienteActivo];

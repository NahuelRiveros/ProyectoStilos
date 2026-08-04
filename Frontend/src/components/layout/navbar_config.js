// ================================================================
// NAVBAR CONFIG — links del menú principal
//
// FLUJO PARA UNA PÁGINA NUEVA:
//   1. routes_config.jsx  → agregar la ruta + importar el componente
//   2. navbar_config.js   → agregar el link acá para que aparezca en el menú
//
// CUÁNDO USAR CADA FORMATO:
//
//   LINK SIMPLE (siempre visible):
//   { label: "Mi Página", to: "/mi-pagina", icon: MiIcono }
//
//   LINK CONDICIONAL (se muestra solo si una config lo habilita):
//   ...(miConfig.mostrar ? [{ label: "...", to: "...", icon: ... }] : [])
//
//   LINK PRIVADO (requiere login):
//   { label: "...", to: "...", icon: ..., requiereAuth: true }
//
//   LINK DE ROL (solo para ciertos roles):
//   { label: "...", to: "...", icon: ..., requiereAuth: true, roles: ["ADM"] }
//
// NOTA: los géneros (Damas, Hombre, etc.) y sus categorías NO van acá.
// Se cargan automáticamente desde la base de datos en navbar.jsx.
// Gestionarlos desde el panel admin → Catalogos.
// ================================================================

import {
  Settings2,
  ShoppingBag,
  HomeIcon,
  Info,
  Mail,
  FileText,
} from "lucide-react";

import { adminConfig, brandConfig, catalogConfig } from "../../config/app_config";

export const navbar_config = {
  brand: {
    titulo:         brandConfig.name,
    subtitulo:      brandConfig.tagline,
    logoUrl:        brandConfig.logoUrl,
    linkTo:         brandConfig.homePath,
    fallbackLetter: brandConfig.shortName,
  },

  links: [
    // ── Links condicionales (activados desde catalog_config.js) ──
    ...(catalogConfig.showHomeLink ? [{
      label: catalogConfig.navHomeLabel,
      to:    brandConfig.homePath,
      icon:  HomeIcon,
    }] : []),

    ...(catalogConfig.showProductsLink ? [{
      label: catalogConfig.navProductsLabel,
      to:    catalogConfig.basePath,
      icon:  ShoppingBag,
    }] : []),

    ...(catalogConfig.showAboutLink ? [{
      label: catalogConfig.navAboutLabel,
      to:    "/nosotros",
      icon:  Info,
    }] : []),

    ...(catalogConfig.showContactLink ? [{
      label: catalogConfig.navContactLabel,
      to:    "/contacto",
      icon:  Mail,
    }] : []),

    // ── Links simples (siempre visibles) ─────────────────────────
    // {
    //   label: "Test2",
    //   to:    "/test",
    //   icon:  FileText,
    // },

    // ── Links privados (requieren rol específico) ─────────────────
    ...(adminConfig.enabled ? [{
      label:        adminConfig.navLabel,
      to:           "/admin",
      icon:         Settings2,
      requiereAuth: true,
      roles:        ["ADM", "SADM", "VND"],
    }] : []),
  ],

  dropdowns: [],
};

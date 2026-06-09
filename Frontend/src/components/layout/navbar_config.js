import {
  Settings2,
  ShoppingBag,
  HomeIcon,
  Info,
  Mail,
} from "lucide-react";

import { adminConfig, brandConfig, catalogConfig } from "../../config/app_config";

export const navbar_config = {
  brand: {
    titulo:        brandConfig.name,
    subtitulo:     brandConfig.tagline,
    logoUrl:       brandConfig.logoUrl,
    linkTo:        brandConfig.homePath,
    fallbackLetter: brandConfig.shortName,
  },

  links: [
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

    // El link de Admin es privado — va al final, después de los géneros del catálogo.
    // Visible para ADM y SADM (ambas abreviaturas incluidas).
    ...(adminConfig.enabled ? [{
      label:       adminConfig.navLabel,
      to:          "/admin",
      icon:        Settings2,
      requiereAuth: true,
      roles:       ["ADM", "SADM"],
    }] : []),
  ],

  dropdowns: [],
};

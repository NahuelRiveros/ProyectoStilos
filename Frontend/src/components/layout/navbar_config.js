import {
  Settings2,
  ShoppingBag,
  HomeIcon
} from "lucide-react";

import { adminConfig, brandConfig, catalogConfig } from "../../config/app_config";

export const navbar_config = {
  brand: {
    titulo: brandConfig.name,
    subtitulo: brandConfig.tagline,
    logoUrl: brandConfig.logoUrl,
    linkTo: brandConfig.homePath,
    fallbackLetter: brandConfig.shortName,
  },

  links: [
    ...(catalogConfig.showHomeLink ? [{
      label: catalogConfig.navHomeLabel,
      to: brandConfig.homePath,
      icon: HomeIcon,
    }] : []),
    ...(catalogConfig.showProductsLink ? [{
      label: catalogConfig.navProductsLabel,
      to: catalogConfig.basePath,
      icon: ShoppingBag,
    }] : []),
    ...(adminConfig.enabled ? [{
      label: adminConfig.navLabel,
      to: "/admin",
      icon: Settings2,
      requiereAuth: true,
      roles: ["ADM"],
    }] : []),
  ],
  dropdowns: [],
};

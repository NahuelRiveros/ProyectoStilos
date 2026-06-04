import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { UI_PRICING } from "../styles/ui_pricing_style";
const DEFAULT_TIERS = [
  {
    name: "Est\xE1ndar",
    price: "Gratis",
    description: "Acceso completo a nuestra tienda, historial de pedidos y atenci\xF3n b\xE1sica.",
    features: [
      "Cat\xE1logo completo",
      "Carrito de compras",
      "Historial de pedidos",
      "Atenci\xF3n por e-mail"
    ],
    cta: { label: "Crear cuenta", to: "/register" }
  },
  {
    name: "Premium",
    price: "$2.990",
    period: "/ mes",
    description: "La experiencia completa de Stilo's con beneficios exclusivos cada mes.",
    features: [
      "Todo lo de Est\xE1ndar",
      "Env\xEDo gratis ilimitado",
      "10% de descuento permanente",
      "Acceso anticipado a colecciones",
      "Devoluciones prioritarias",
      "Atenci\xF3n personalizada 24 hs"
    ],
    cta: { label: "Suscribirse", to: "/premium" },
    highlighted: true,
    badge: "M\xE1s popular"
  },
  {
    name: "\xC9lite",
    price: "$5.990",
    period: "/ mes",
    description: "Membres\xEDa VIP con acceso a eventos exclusivos y servicio de personal shopper.",
    features: [
      "Todo lo de Premium",
      "20% de descuento permanente",
      "Env\xEDo express sin cargo",
      "Personal shopper dedicado",
      "Acceso a eventos de temporada",
      "Regalos exclusivos de marca"
    ],
    cta: { label: "Unirme al VIP", to: "/elite" }
  }
];
function PricingSection({
  eyebrow = "Membres\xEDas",
  title = "Eleg\xED tu plan",
  subtitle = "Beneficios pensados para que siempre est\xE9s a la moda sin complicaciones.",
  tiers = DEFAULT_TIERS
}) {
  return <section className={UI_PRICING.section}>
      <div className={UI_PRICING.container}>

        {
    /* Encabezado */
  }
        <div className={UI_PRICING.header}>
          <p className={UI_PRICING.eyebrow}>{eyebrow}</p>
          <h2 className={UI_PRICING.title}>{title}</h2>
          <p className={UI_PRICING.subtitle}>{subtitle}</p>
        </div>

        {
    /* Cards */
  }
        <div className={UI_PRICING.grid}>
          {tiers.map((tier) => {
    const hl = Boolean(tier.highlighted);
    return <div
      key={tier.name}
      className={hl ? UI_PRICING.cardHighlighted : UI_PRICING.card}
    >
                {tier.badge && <span className={UI_PRICING.badge}>{tier.badge}</span>}

                <p className={hl ? UI_PRICING.tierNameHighlighted : UI_PRICING.tierName}>
                  {tier.name}
                </p>

                <div className={hl ? UI_PRICING.priceRowHighlighted : UI_PRICING.priceRow}>
                  <span className={hl ? UI_PRICING.priceAmountHighlighted : UI_PRICING.priceAmount}>
                    {tier.price}
                  </span>
                  {tier.period && <span className={hl ? UI_PRICING.pricePeriodHighlighted : UI_PRICING.pricePeriod}>
                      {tier.period}
                    </span>}
                </div>

                <p className={hl ? UI_PRICING.descriptionHighlighted : UI_PRICING.description}>
                  {tier.description}
                </p>

                <ul className={UI_PRICING.featureList}>
                  {tier.features.map((feat) => <li
      key={feat}
      className={hl ? UI_PRICING.featureHighlighted : UI_PRICING.feature}
    >
                      <Check
      size={14}
      className={hl ? UI_PRICING.featureCheckHighlighted : UI_PRICING.featureCheck}
    />
                      {feat}
                    </li>)}
                </ul>

                <div className={UI_PRICING.ctaWrap}>
                  <Link
      to={tier.cta.to}
      className={hl ? UI_PRICING.ctaHighlighted : UI_PRICING.cta}
    >
                    {tier.cta.label}
                  </Link>
                </div>
              </div>;
  })}
        </div>

      </div>
    </section>;
}
export {
  PricingSection as default
};

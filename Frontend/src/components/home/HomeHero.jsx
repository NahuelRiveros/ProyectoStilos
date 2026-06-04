import { UI_HOME } from "../styles_components/ui_home_style";
import { UI_CARD } from "../styles_components/ui_card_style";

import HomeCarousel from "./homeCarousel";
import Card from "../form/card";

const STATS = [
  { dot: "bg-orange-400",  label: "6 módulos de cálculo" },
  { dot: "bg-cyan-400",    label: "Informes en PDF" },
  { dot: "bg-emerald-400", label: "Gestión de siniestros" },
  // { dot: "bg-fuchsia-400", label: "Control de roles" },
];

export default function HomeHero({
  badge = "Sistema RAV",
  title = "",
  accent = "",
  description = "",

  showCarousel = false,
  slides = [],
  autoPlay = true,
  intervalMs = 5000,

  showCards = false,
  cards = [],
}) {
  return (
    <section className={UI_HOME.screen}>
      <div className={UI_HOME.glow} />
      <div className={UI_HOME.gridOverlay} />

      <div className={UI_HOME.container}>
        <div className={UI_HOME.heroWrap}>

          {/* Badge con punto de estado pulsante */}
          {badge ? (
            <span className={UI_HOME.badge}>
              <span className={UI_HOME.badgePulseWrap}>
                <span className={UI_HOME.badgePulseOuter} />
                <span className={UI_HOME.badgePulseInner} />
              </span>
              {badge}
            </span>
          ) : null}

          {/* Título principal */}
          {(title || accent) && (
            <h1 className={UI_HOME.heroTitleLarge}>
              {title}
              {accent ? (
                <span className={UI_HOME.heroAccentOrange}>{accent}</span>
              ) : null}
            </h1>
          )}

          {description ? (
            <p className={UI_HOME.heroDescription}>{description}</p>
          ) : null}

          {/* Strip de capacidades */}
          <div className={UI_HOME.statsStrip}>
            {STATS.map((stat, i) => (
              <span key={stat.label} className={UI_HOME.statItem}>
                <span className={[UI_HOME.statDot, stat.dot].join(" ")} />
                {stat.label}
                {i < STATS.length - 1 && (
                  <span className={UI_HOME.statSep}>·</span>
                )}
              </span>
            ))}
          </div>

          {/* Carousel */}
          {showCarousel && slides?.length > 0 ? (
            <div className={UI_HOME.carouselWrap}>
              <HomeCarousel
                slides={slides}
                autoPlay={autoPlay}
                intervalMs={intervalMs}
              />
            </div>
          ) : null}

          {/* Cards con separador de sección */}
          {showCards && cards?.length > 0 ? (
            <div className={UI_HOME.cardsSectionWrap}>
              <div className={UI_HOME.cardsSectionLabel}>
                <span className={UI_HOME.cardsSectionLine} />
                <span className={UI_HOME.cardsSectionText}>Módulos principales</span>
                <span className={UI_HOME.cardsSectionLine} />
              </div>

              <div className={UI_CARD.CardsGrid}>
                {cards.map((item, index) => (
                  <Card
                    key={index}
                    image={item.image}
                    imageAlt={item.imageAlt}
                    title={item.title}
                    subtitle={item.subtitle}
                    phrase={item.phrase}
                    linkLabel={item.linkLabel}
                    to={item.to}
                    tone={item.tone}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { UI_CAROUSEL } from "../styles/ui_carousel_style";
function HomeCarousel({
  slides,
  autoPlay = true,
  intervalMs = 6e3
}) {
  const [current, setCurrent] = useState(0);
  const [barWidth, setBarWidth] = useState(0);
  const safe = useMemo(() => slides.filter(Boolean), [slides]);
  const total = safe.length;
  const goNext = () => setCurrent((p) => (p + 1) % total);
  const goPrev = () => setCurrent((p) => (p - 1 + total) % total);
  const goTo = (i) => setCurrent(i);
  useEffect(() => {
    if (!autoPlay || total <= 1) return;
    const t = setInterval(goNext, intervalMs);
    return () => clearInterval(t);
  }, [autoPlay, intervalMs, total, current]);
  useEffect(() => {
    if (!autoPlay || total <= 1) return;
    setBarWidth(0);
    const raf = requestAnimationFrame(() => setBarWidth(100));
    return () => cancelAnimationFrame(raf);
  }, [current, autoPlay, total]);
  if (!total) return null;
  return <div className={UI_CAROUSEL.shell}>

      {
    /* ── Slides ── */
  }
      <div className={UI_CAROUSEL.viewport}>
        <div
    className={UI_CAROUSEL.track}
    style={{ transform: `translateX(-${current * 100}%)` }}
  >
          {safe.map((slide, si) => <div key={si} className={UI_CAROUSEL.slide}>
              <div className={UI_CAROUSEL.grid}>

                {
    /* Columna texto */
  }
                <div className={UI_CAROUSEL.content}>
                  {slide.badge && <span className={UI_CAROUSEL.badge}>{slide.badge}</span>}

                  <h2 className={UI_CAROUSEL.title}>
                    {slide.title}
                    {slide.titleAccent && <span className={[UI_CAROUSEL.titleAccent, "block"].join(" ")}>
                        {slide.titleAccent}
                      </span>}
                  </h2>

                  {slide.subtitle && <p className={UI_CAROUSEL.subtitle}>{slide.subtitle}</p>}
                  {slide.description && <p className={UI_CAROUSEL.description}>{slide.description}</p>}

                  {slide.tags && slide.tags.length > 0 && <div className={UI_CAROUSEL.tags}>
                      {slide.tags.map((tag) => <span key={tag} className={UI_CAROUSEL.tag}>
                          {tag}
                        </span>)}
                    </div>}

                  <div className={UI_CAROUSEL.ctaRow}>
                    {slide.primaryCta && <Link
    to={slide.primaryCta.to}
    className={UI_CAROUSEL.ctaPrimary}
  >
                        <ShoppingBag size={14} />
                        {slide.primaryCta.label}
                      </Link>}
                    {slide.secondaryCta && <Link
    to={slide.secondaryCta.to}
    className={UI_CAROUSEL.ctaSecondary}
  >
                        {slide.secondaryCta.label}
                        <ArrowRight size={13} className={UI_CAROUSEL.ctaArrow} />
                      </Link>}
                  </div>
                </div>

                {
    /* Columna imagen */
  }
                <div className={UI_CAROUSEL.imageWrap}>
                  {
    /* Marco decorativo offset */
  }
                  <div className={UI_CAROUSEL.imageFrameAccent} />
                  <div className={UI_CAROUSEL.imageFrame}>
                    {slide.image ? <img
    src={slide.image}
    alt={slide.imageAlt ?? slide.title}
    className={UI_CAROUSEL.image}
  /> : <div className={UI_CAROUSEL.imagePlaceholder}>
                        <ShoppingBag size={72} />
                      </div>}
                  </div>
                </div>

              </div>
            </div>)}
        </div>
      </div>

      {
    /* ── Barra de progreso ── */
  }
      {autoPlay && total > 1 && <div className={UI_CAROUSEL.progressTrack}>
          <div
    className={UI_CAROUSEL.progressBar}
    style={{
      width: `${barWidth}%`,
      transition: barWidth === 0 ? "none" : `width ${intervalMs}ms linear`
    }}
  />
        </div>}

      {
    /* ── Controles ── */
  }
      {total > 1 && <div className={UI_CAROUSEL.controlsOuter}>
          <div className={UI_CAROUSEL.controlsInner}>

            {
    /* Dots */
  }
            <div className={UI_CAROUSEL.dotsWrap}>
              {safe.map((_, i) => <button
    key={i}
    type="button"
    onClick={() => goTo(i)}
    className={[
      UI_CAROUSEL.dot,
      i === current ? UI_CAROUSEL.dotActive : ""
    ].join(" ")}
    aria-label={`Ir al slide ${i + 1}`}
  />)}
            </div>

            {
    /* Flechas + contador */
  }
            <div className={UI_CAROUSEL.arrowsWrap}>
              <button
    type="button"
    onClick={goPrev}
    className={UI_CAROUSEL.arrowBtn}
    aria-label="Anterior"
  >
                <ChevronLeft size={15} strokeWidth={2} />
              </button>
              <span className={UI_CAROUSEL.counter}>
                {current + 1} / {total}
              </span>
              <button
    type="button"
    onClick={goNext}
    className={UI_CAROUSEL.arrowBtn}
    aria-label="Siguiente"
  >
                <ChevronRight size={15} strokeWidth={2} />
              </button>
            </div>

          </div>
        </div>}

    </div>;
}
export {
  HomeCarousel as default
};

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { UI_HOME } from "../styles_components/ui_home_style";
import SubmitButton from "../form/submit_button";

const HIGHLIGHT_TONE = {
  cyan:   { card: UI_HOME.highlightCardCyan,   title: UI_HOME.highlightTitleCyan   },
  orange: { card: UI_HOME.highlightCardOrange, title: UI_HOME.highlightTitleOrange },
  purple: { card: UI_HOME.highlightCardPurple, title: UI_HOME.highlightTitlePurple },
  green:  { card: UI_HOME.highlightCardGreen,  title: UI_HOME.highlightTitleGreen  },
};

const VISUAL_TONE = {
  cyan:   { card: UI_HOME.visualCardCyan,   label: UI_HOME.visualCardLabelCyan,   stripe: UI_HOME.visualCardStripeCyan   },
  orange: { card: UI_HOME.visualCardOrange, label: UI_HOME.visualCardLabelOrange, stripe: UI_HOME.visualCardStripeOrange },
  purple: { card: UI_HOME.visualCardPurple, label: UI_HOME.visualCardLabelPurple, stripe: UI_HOME.visualCardStripePurple },
  green:  { card: UI_HOME.visualCardGreen,  label: UI_HOME.visualCardLabelGreen,  stripe: UI_HOME.visualCardStripeGreen  },
};

export default function HomeCarousel({
  slides = [],
  autoPlay = true,
  intervalMs = 5000,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [barWidth, setBarWidth] = useState(0);

  const safeSlides = useMemo(
    () => (Array.isArray(slides) ? slides.filter(Boolean) : []),
    [slides]
  );

  const totalSlides = safeSlides.length;

  // Auto-advance
  useEffect(() => {
    if (!autoPlay || totalSlides <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [autoPlay, intervalMs, totalSlides]);

  // Guard against out-of-range index
  useEffect(() => {
    if (currentIndex > totalSlides - 1) setCurrentIndex(0);
  }, [currentIndex, totalSlides]);

  // Progress bar: reset to 0, then animate to 100 over intervalMs
  useEffect(() => {
    if (!autoPlay || totalSlides <= 1) return;
    setBarWidth(0);
    const raf = requestAnimationFrame(() => setBarWidth(100));
    return () => cancelAnimationFrame(raf);
  }, [currentIndex, autoPlay, totalSlides, intervalMs]);

  if (!totalSlides) return null;

  const goTo   = (i) => setCurrentIndex(i);
  const goNext = () => setCurrentIndex((p) => (p + 1) % totalSlides);
  const goPrev = () => setCurrentIndex((p) => (p - 1 + totalSlides) % totalSlides);

  return (
    <div className={UI_HOME.carouselShell}>

      {/* Slides */}
      <div className={UI_HOME.carouselViewport}>
        <div
          className={UI_HOME.carouselTrack}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {safeSlides.map((slide, si) => (
            <div key={si} className={UI_HOME.carouselSlide}>
              <div className={UI_HOME.carouselGrid}>

                {/* ── Left: text content ── */}
                <div className={UI_HOME.slideContent}>
                  {slide.titleBadge && (
                    <div className={UI_HOME.titleBadge}>{slide.titleBadge}</div>
                  )}

                  <h2 className={UI_HOME.slideTitle}>{slide.title}</h2>

                  {slide.subtitle && (
                    <p className={UI_HOME.subtitle}>{slide.subtitle}</p>
                  )}

                  {slide.description && (
                    <p className={UI_HOME.descriptionSmall}>{slide.description}</p>
                  )}

                  <div className={UI_HOME.ctaRow}>
                    {slide.primaryCta && (
                      <Link to={slide.primaryCta.to}>
                        <SubmitButton
                          label={slide.primaryCta.label}
                          variant="cyan"
                          hideWrapper
                        />
                      </Link>
                    )}
                    {slide.secondaryCta && (
                      <Link to={slide.secondaryCta.to}>
                        <SubmitButton
                          label={slide.secondaryCta.label}
                          variant="yellow"
                          hideWrapper
                        />
                      </Link>
                    )}
                  </div>

                  {slide.highlights?.length > 0 && (
                    <div className={UI_HOME.highlightsGrid}>
                      {slide.highlights.map((item, i) => {
                        const tone = HIGHLIGHT_TONE[item.tone] || HIGHLIGHT_TONE.cyan;
                        return (
                          <div
                            key={i}
                            className={[UI_HOME.highlightCardBase, tone.card].join(" ")}
                          >
                            <div className={[UI_HOME.highlightTitleBase, tone.title].join(" ")}>
                              {item.title}
                            </div>
                            <div className={UI_HOME.highlightText}>{item.text}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ── Right: visual cards panel ── */}
                <div className={UI_HOME.visualWrap}>
                  <div className={UI_HOME.visualPanel}>
                    <div className={UI_HOME.visualGlow} />
                    <div className={UI_HOME.visualGrid}>
                      {slide.visualCards?.map((item, i) => {
                        const tone = VISUAL_TONE[item.tone] || VISUAL_TONE.cyan;
                        return (
                          <div
                            key={i}
                            className={[UI_HOME.visualCardBase, tone.card].join(" ")}
                          >
                            {/* Franja de color superior */}
                            <div
                              className={[
                                "absolute inset-x-0 top-0 h-0.5",
                                tone.stripe,
                              ].join(" ")}
                            />
                            <div className={[UI_HOME.visualCardLabelBase, tone.label].join(" ")}>
                              {item.label}
                            </div>
                            <div className={UI_HOME.visualValue}>{item.value}</div>
                            <div className={UI_HOME.visualText}>{item.text}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      {totalSlides > 1 && (
        <div className={UI_HOME.controlsWrap}>
          <div className={UI_HOME.controlsLeft}>
            <button
              type="button"
              onClick={goPrev}
              className={UI_HOME.arrowButton}
              aria-label="Slide anterior"
            >
              <ChevronLeft size={16} strokeWidth={2.5} />
            </button>

            <span className={UI_HOME.counter}>
              {currentIndex + 1} / {totalSlides}
            </span>

            <button
              type="button"
              onClick={goNext}
              className={UI_HOME.arrowButton}
              aria-label="Slide siguiente"
            >
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </div>

          <div className={UI_HOME.dotsWrap}>
            {safeSlides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className={[UI_HOME.dot, i === currentIndex ? UI_HOME.dotActive : ""].join(" ")}
                aria-label={`Ir al slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Barra de progreso autoplay */}
      {autoPlay && totalSlides > 1 && (
        <div className={UI_HOME.progressTrack}>
          <div
            className="h-full bg-orange-400"
            style={{
              width: `${barWidth}%`,
              transition: barWidth === 0
                ? "none"
                : `width ${intervalMs}ms linear`,
            }}
          />
        </div>
      )}
    </div>
  );
}

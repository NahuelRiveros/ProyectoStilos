import type { ReactNode } from "react";
import {
  UI_CONTAINER,
  type ContainerMaxWidth,
  type ContainerLayout,
  type ContainerPanel,
  type ContainerHeaderAlign,
} from "../styles/ui_page_container_style";

interface Feature {
  title: string;
  text?: string;
}

interface ContainerProps {
  children?: ReactNode;
  badge?: string;
  title?: string;
  accent?: string;
  subtitle?: string;
  actions?: ReactNode;
  maxWidth?: ContainerMaxWidth;
  headerAlign?: ContainerHeaderAlign;
  layout?: ContainerLayout;
  panel?: ContainerPanel;
  aside?: ReactNode;
  asideTitle?: string;
  asideText?: string;
  features?: Feature[];
  showGlow?: boolean;
  showGrid?: boolean;
  className?: string;
  contentClassName?: string;
}

export default function Container({
  children,
  badge,
  title,
  accent,
  subtitle,
  actions,
  maxWidth = "xl",
  headerAlign = "left",
  layout = "single",
  panel = "card",
  aside,
  asideTitle,
  asideText,
  features = [],
  showGlow = true,
  showGrid = false,
  className = "",
  contentClassName = "",
}: ContainerProps) {
  const widthClass = UI_CONTAINER.widths[maxWidth] ?? UI_CONTAINER.widths.xl;
  const layoutClass = UI_CONTAINER.layouts[layout] ?? UI_CONTAINER.layouts.single;
  const panelClass = UI_CONTAINER.panel[panel] ?? UI_CONTAINER.panel.card;

  const hasHeader = badge || title || accent || subtitle || actions;
  const hasAside = aside || asideTitle || asideText || features.length > 0;

  function renderHeader() {
    if (!hasHeader) return null;

    return (
      <header
        className={[
          UI_CONTAINER.header.base,
          UI_CONTAINER.header[headerAlign] ?? UI_CONTAINER.header.left,
        ].join(" ")}
      >
        <div>
          {badge && <div className={UI_CONTAINER.badge}>{badge}</div>}

          {(title || accent) && (
            <h1 className={UI_CONTAINER.title}>
              {title}
              {accent && <span className={UI_CONTAINER.accent}>{accent}</span>}
            </h1>
          )}

          {subtitle && <p className={UI_CONTAINER.subtitle}>{subtitle}</p>}
        </div>

        {actions && <div className={UI_CONTAINER.actions}>{actions}</div>}
      </header>
    );
  }

  function renderAside() {
    if (!hasAside) return null;

    return (
      <aside className={UI_CONTAINER.aside}>
        {aside ?? (
          <>
            {asideTitle && (
              <h2 className={UI_CONTAINER.asideTitle}>{asideTitle}</h2>
            )}

            {asideText && (
              <p className={UI_CONTAINER.asideText}>{asideText}</p>
            )}

            {features.length > 0 && (
              <div className={UI_CONTAINER.features}>
                {features.map((item, index) => (
                  <div key={`${item.title}-${index}`} className={UI_CONTAINER.feature}>
                    <h3 className={UI_CONTAINER.featureTitle}>{item.title}</h3>
                    {item.text && (
                      <p className={UI_CONTAINER.featureText}>{item.text}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </aside>
    );
  }

  const mainPanel = (
    <main className={[panelClass, contentClassName].join(" ")}>
      {children}
    </main>
  );

  return (
    <section className={[UI_CONTAINER.screen, className].join(" ")}>
      {showGlow && <div className={UI_CONTAINER.glow} />}
      {showGrid && <div className={UI_CONTAINER.grid} />}

      <div className={[UI_CONTAINER.inner, widthClass].join(" ")}>
        {renderHeader()}

        <div className={layoutClass}>
          {layout === "reverse" ? (
            <>
              {mainPanel}
              {renderAside()}
            </>
          ) : (
            <>
              {renderAside()}
              {mainPanel}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

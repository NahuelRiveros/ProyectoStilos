import { Code2, Github, Instagram, Linkedin, ShieldCheck, Lock } from "lucide-react";
import { brandConfig, businessConfig, cartConfig } from "../../config/app_config";

const year = new Date().getFullYear();

// ── SVG logos de tarjetas ─────────────────────────────────────────────────
// Los colores de estos logos son marcas registradas de cada empresa
// y no deben conectarse al sistema de temas del proyecto.

function LogoVisa() {
  return (
    <svg viewBox="0 0 38 24" className="h-6 w-auto" aria-label="Visa">
      <rect width="38" height="24" rx="3" fill="#1A1F71" />
      <text x="19" y="17" textAnchor="middle" fill="white"
        fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="13" fontStyle="italic">
        VISA
      </text>
    </svg>
  );
}

function LogoMastercard() {
  return (
    <svg viewBox="0 0 38 24" className="h-6 w-auto" aria-label="Mastercard">
      <rect width="38" height="24" rx="3" fill="#252525" />
      <circle cx="15" cy="12" r="7" fill="#EB001B" />
      <circle cx="23" cy="12" r="7" fill="#F79E1B" />
      <path d="M19 6.27a7 7 0 0 1 0 11.46A7 7 0 0 1 19 6.27z" fill="#FF5F00" />
    </svg>
  );
}

// function LogoAmex() {
//   return (
//     <svg viewBox="0 0 38 24" className="h-6 w-auto" aria-label="American Express">
//       <rect width="38" height="24" rx="3" fill="#2E77BC" />
//       <text x="19" y="16" textAnchor="middle" fill="white"
//         fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="8.5">
//         AMEX
//       </text>
//     </svg>
//   );
// }

function LogoNaranja() {
  return (
    <svg viewBox="0 0 38 24" className="h-6 w-auto" aria-label="Naranja">
      <rect width="38" height="24" rx="3" fill="#FF6600" />
      <text x="19" y="15.5" textAnchor="middle" fill="white"
        fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="7.5">
        NARANJA
      </text>
    </svg>
  );
}

function LogoCabal() {
  return (
    <svg viewBox="0 0 38 24" className="h-6 w-auto" aria-label="Cabal">
      <rect width="38" height="24" rx="3" fill="#003082" />
      <text x="19" y="15.5" textAnchor="middle" fill="white"
        fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="9">
        CABAL
      </text>
    </svg>
  );
}

function LogoMercadoPago() {
  return (
    <svg viewBox="0 0 110 32" className="h-6 w-auto" aria-label="Mercado Pago">
      <rect width="110" height="32" rx="4" fill="#009EE3" />
      <circle cx="16" cy="16" r="8"   fill="white" opacity="0.22" />
      <circle cx="16" cy="16" r="5"   fill="white" opacity="0.45" />
      <circle cx="16" cy="16" r="2.5" fill="white" />
      <text x="29" y="13" fill="white" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="7">mercado</text>
      <text x="29" y="23" fill="white" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="7">pago</text>
    </svg>
  );
}

const LOGOS_TARJETAS = {
  visa:       LogoVisa,
  mastercard: LogoMastercard,
  // amex:       LogoAmex,
  naranja:    LogoNaranja,
  cabal:      LogoCabal,
};

// ── Sección de sellos de confianza ────────────────────────────────────────
// Solo se renderiza si enableCart: true en cart_config.js
// Todas las clases usan tokens de index.css — se adaptan automáticamente al tema del shell

function SellosConfianza() {
  const mostrarMP       = cartConfig.mostrarLogoMercadoPago && cartConfig.metodosHabilitados.includes("mercadopago");
  const mostrarTarjetas = cartConfig.mostrarLogosTarjetas   && cartConfig.tarjetasAceptadas.length > 0;
  const mostrarSegura   = cartConfig.mostrarSellosCompraSegura;
  const mostrarDefensa  = cartConfig.mostrarDefensaConsumidor;
  const mostrarAFIP     = cartConfig.mostrarDataFiscal       && businessConfig.dataFiscalUrl;

  if (!mostrarMP && !mostrarTarjetas && !mostrarSegura && !mostrarDefensa && !mostrarAFIP) return null;

  return (
    <div className="footer-trust-divider">

      {/* Fila de sellos: MP · tarjetas · compra segura · SSL */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">

        {mostrarMP && (
          <div className="footer-badge footer-badge-mp">
            <LogoMercadoPago />
            <div className="leading-tight">
              <p className="footer-badge-mp-text">Pagá con</p>
              <p className="footer-badge-mp-text">Mercado Pago</p>
            </div>
          </div>
        )}

        {mostrarTarjetas && (
          <div className="flex items-center gap-1.5">
            {cartConfig.tarjetasAceptadas.map((tarjeta) => {
              const Logo = LOGOS_TARJETAS[tarjeta];
              return Logo ? <Logo key={tarjeta} /> : null;
            })}
          </div>
        )}

        {mostrarSegura && (
          <div className="footer-badge footer-badge-secure">
            <ShieldCheck size={13} className="shrink-0" />
            <div className="leading-tight">
              <p className="footer-badge-secure-text">Compra</p>
              <p className="footer-badge-secure-text">Segura</p>
            </div>
          </div>
        )}

        {mostrarSegura && (
          <div className="footer-badge footer-badge-ssl">
            <Lock size={11} className="shrink-0" />
            <span>SSL / HTTPS</span>
          </div>
        )}

        {mostrarAFIP && (
          <a
            href={businessConfig.dataFiscalUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Datos Fiscales AFIP"
            className="shrink-0"
          >
            <img
              src={businessConfig.dataFiscalUrl}
              alt="Datos Fiscales AFIP"
              className="h-10 w-auto rounded"
            />
          </a>
        )}

      </div>

      {/* Fila legal — Defensa del Consumidor */}
      {mostrarDefensa && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <a
            href="https://www.argentina.gob.ar/produccion/defensaconsumidor/formulario"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-legal-text footer-legal-link"
          >
            Defensa del Consumidor · Ley 24.240
          </a>
          <span className="footer-legal-text hidden sm:inline opacity-40">·</span>
          <span className="footer-legal-text">
            Botón de arrepentimiento disponible al finalizar la compra
          </span>
        </div>
      )}

    </div>
  );
}

// ── Footer principal ──────────────────────────────────────────────────────

export default function Footer() {
  const socials = [
    { href: brandConfig.social.instagram, label: "Instagram", Icon: Instagram },
    { href: brandConfig.social.linkedin,  label: "LinkedIn",  Icon: Linkedin  },
    { href: brandConfig.social.github,    label: "GitHub",    Icon: Github    },
  ].filter((s) => s.href);

  const mostrarSellos = cartConfig.enableCart && cartConfig.mostrarSellosConfianza;

  return (
    <footer className="relative w-full overflow-hidden bg-footer">
      {/* Línea superior — usa var(--color-footer-text) */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-footer-text/20 to-transparent" />

      {/* Patrón de puntos — usa var(--color-accent) del tema */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "radial-gradient(circle, var(--color-accent) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* Glow decorativo — usa var(--color-accent) del tema */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 bottom-0 h-40 w-72 rounded-full bg-accent/6 blur-3xl" />

      <div className="relative mx-auto max-w-360 px-6 py-8 lg:px-10">

        {/* Fila principal: brand | copyright | redes */}
        <div className="flex flex-col items-center justify-between gap-5 sm:flex-row sm:items-center">

          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="nav-brand-mark shrink-0">
              {brandConfig.shortName}
            </div>
            <div className="leading-tight">
              <p className="text-[14px] font-bold tracking-tight text-footer-text/85">
                {brandConfig.footerName}
              </p>
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-footer-text-dim">
                {brandConfig.footerSubtitle}
              </p>
            </div>
          </div>

          {/* Copyright */}
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-footer-text/10 bg-footer-text/5 px-3 py-1.5">
            <Code2 size={11} className="shrink-0 text-footer-text-dim/60" />
            <span className="text-[11px] font-medium text-footer-text-dim">
              {brandConfig.footerLicense} © {year}
            </span>
          </div>

          {/* Redes sociales */}
          {socials.length > 0 && (
            <div className="flex items-center gap-1">
              {socials.map(({ href, label, Icon }, index) => (
                <div key={label} className="flex items-center gap-1">
                  {index > 0 && <div className="h-3 w-px bg-footer-text/10" />}
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-footer-text-dim transition-all duration-150 hover:bg-footer-text/8 hover:text-footer-text"
                  >
                    <Icon size={14} />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sellos de confianza — solo si enableCart: true en cart_config.js */}
        {mostrarSellos && <SellosConfianza />}

      </div>
    </footer>
  );
}

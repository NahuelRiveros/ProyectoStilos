import { Code2, Github, Instagram, Linkedin } from "lucide-react";
import { brandConfig } from "../../config/app_config";

const year = new Date().getFullYear();

export default function Footer() {
  const socials = [
    { href: brandConfig.social.instagram, label: "Instagram", Icon: Instagram },
    { href: brandConfig.social.linkedin, label: "LinkedIn", Icon: Linkedin },
    { href: brandConfig.social.github, label: "GitHub", Icon: Github },
  ].filter((item) => item.href);

  return (
    <footer className="relative w-full overflow-hidden bg-shell">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-shell-text/20 to-transparent" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "radial-gradient(circle, var(--color-accent) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 bottom-0 h-40 w-72 rounded-full bg-accent/6 blur-3xl" />

      <div className="relative mx-auto max-w-360 px-6 py-8 lg:px-10">
        <div className="flex flex-col items-center justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <div className="nav-brand-mark shrink-0">
              {brandConfig.shortName}
            </div>
            <div className="leading-tight">
              <p className="text-[14px] font-bold tracking-tight text-shell-text/85">
                {brandConfig.footerName}
              </p>
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-shell-text-dim">
                {brandConfig.footerSubtitle}
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-lg border border-shell-text/10 bg-shell-text/5 px-3 py-1.5">
            <Code2 size={11} className="shrink-0 text-shell-text-dim/60" />
            <span className="text-[11px] font-medium text-shell-text-dim">
              {brandConfig.footerLicense} © {year}
            </span>
          </div>

          {socials.length > 0 && (
            <div className="flex items-center gap-1">
              {socials.map(({ href, label, Icon }, index) => (
                <div key={label} className="flex items-center gap-1">
                  {index > 0 && <div className="h-3 w-px bg-shell-text/10" />}
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-shell-text-dim transition-all duration-150 hover:bg-shell-text/8 hover:text-shell-text"
                  >
                    <Icon size={14} />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

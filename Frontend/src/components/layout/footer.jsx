import { Github, Linkedin, Code2 } from "lucide-react";

const year = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="relative w-full overflow-hidden bg-[#060d1f]">

      {/* Amber hairline gradient */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-amber-400/35 to-transparent" />

      {/* Dot grid atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "radial-gradient(circle, #fbbf24 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* Ambient left glow */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 bottom-0 h-40 w-72 rounded-full bg-amber-400/6 blur-3xl" />

      <div className="relative mx-auto max-w-360 px-6 py-8 lg:px-10">
        <div className="flex flex-col items-center justify-between gap-5 sm:flex-row sm:items-center">

          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-400 text-[11px] font-black text-slate-950 shadow-sm shadow-amber-400/30">
              NR
            </div>
            <div className="leading-tight">
              <p className="text-[14px] font-bold tracking-tight text-white/85">
                Proyectos Nahuel Riveros
              </p>
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-600">
                Base · Arquitectura modular
              </p>
            </div>
          </div>

          {/* License */}
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-white/6 bg-white/2 px-3 py-1.5">
            <Code2 size={11} className="shrink-0 text-amber-400/50" />
            <span className="text-[11px] font-medium text-slate-500">
              MIT License © {year} Nahuel Riveros
            </span>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-1">
            <a
              href="https://www.linkedin.com/in/nahuelriveros"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition-all duration-150 hover:bg-white/5 hover:text-amber-400"
            >
              <Linkedin size={14} />
            </a>
            <div className="h-3 w-px bg-white/10" />
            <a
              href="https://github.com/nahuelriveros"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition-all duration-150 hover:bg-white/5 hover:text-amber-400"
            >
              <Github size={14} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

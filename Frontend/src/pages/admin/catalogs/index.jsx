import { useState } from "react";
import { Tag, Ruler, Palette, Truck, Users, Crown } from "lucide-react";
import MarcasTab     from "./MarcasTab";
import CategoriasTab from "./CategoriasTab";
import ColoresTab    from "./ColoresTab";
import TallesTab     from "./TallesTab";
import GenerosTab    from "./GenerosTab";
import EnvioTab      from "./EnvioTab";

const TABS = [
  { id: "marcas",     label: "Marcas",     icon: Crown,   desc: "Marcas disponibles en la tienda" },
  { id: "categorias", label: "Categorías", icon: Tag,     desc: "Tipos de prenda y subcategorías" },
  { id: "colores",    label: "Colores",    icon: Palette, desc: "Paleta de colores disponible" },
  { id: "talles",     label: "Talles",     icon: Ruler,   desc: "Guía de talles de la tienda" },
  { id: "generos",    label: "Géneros",    icon: Users,   desc: "Damas, Hombre, Calzado…" },
  { id: "envio",      label: "Envío",      icon: Truck,   desc: "Opciones y tarifas de envío" },
];

export default function AdminCatalogsPage() {
  const [tab, setTab] = useState("marcas");
  const active = TABS.find((t) => t.id === tab);

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">

      {/* Encabezado */}
      <div className="mb-6 flex items-start gap-3">
        <div className="mt-1 h-8 w-1 shrink-0 rounded-full" style={{ background: "var(--color-accent)" }} />
        <div>
          <h1 className="font-display text-2xl font-black text-ink">Catálogos</h1>
          <p className="mt-0.5 text-sm text-muted">
            Tipos de prenda, colores, talles y opciones de envío de tu tienda.
          </p>
        </div>
      </div>

      {/* Navegación tipo pill */}
      <div className="mb-5 overflow-x-auto">
        <div className="inline-flex gap-1 rounded-xl border border-line bg-surface p-1 min-w-max">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={[
                "flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all whitespace-nowrap",
                tab === id
                  ? "bg-navy text-surface shadow-sm"
                  : "text-muted hover:text-ink hover:bg-card/70",
              ].join(" ")}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Descripción del tab activo */}
      <p className="mb-4 text-xs font-medium text-muted">{active?.desc}</p>

      {/* Contenido */}
      <div className="rounded-2xl bg-card p-5 shadow-sm">
        {tab === "marcas"     && <MarcasTab />}
        {tab === "categorias" && <CategoriasTab />}
        {tab === "colores"    && <ColoresTab />}
        {tab === "talles"     && <TallesTab />}
        {tab === "generos"    && <GenerosTab />}
        {tab === "envio"      && <EnvioTab />}
      </div>
    </div>
  );
}

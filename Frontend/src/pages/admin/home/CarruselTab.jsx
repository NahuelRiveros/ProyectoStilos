import { SlideEditor } from "../../../components/admin/home_config";
import { SectionToggle } from "./home_shared";

export default function CarruselTab({ config, setFlag, updateSlide }) {
  const activo = config.carousel_activo !== false;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 rounded-xl border border-line bg-card px-4 py-3">
        <p className="text-xs text-muted leading-relaxed">
          Hasta 3 slides. Si la imagen está vacía se usa la foto del producto marcado como{" "}
          <strong className="font-bold text-ink">Carrusel</strong>.
        </p>
        <SectionToggle activo={activo} onChange={(v) => setFlag("carousel_activo", v)} />
      </div>

      <div className={activo ? "" : "pointer-events-none opacity-40"}>
        {config.carousel.map((slide, i) => (
          <div key={i} className="mb-3">
            <SlideEditor slide={slide} index={i} onChange={(u) => updateSlide(i, u)} />
          </div>
        ))}
      </div>
    </div>
  );
}

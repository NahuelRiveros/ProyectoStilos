import { useRef, useState } from "react";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { subirImagen, eliminarImagen } from "../../api/upload_api";

export default function ImageUploader({ value, onChange, max = 10 }) {
  const inputRef                    = useRef(null);
  const [uploading, setUploading]   = useState(false);
  const [error,     setError]       = useState(null);

  async function handleFiles(files) {
    if (!files || files.length === 0) return;
    if (value.length >= max) {
      setError(`Máximo ${max} imágenes permitidas`);
      return;
    }

    setError(null);
    setUploading(true);

    const nuevas = [];
    const pendientes = Array.from(files).slice(0, max - value.length);

    for (const file of pendientes) {
      try {
        const resultado = await subirImagen(file);
        nuevas.push({
          src:       resultado.url,
          alt:       file.name.replace(/\.[^.]+$/, ""),
          public_id: resultado.public_id,
        });
      } catch {
        setError("Error al subir una o más imágenes. Intentá de nuevo.");
      }
    }

    onChange([...value, ...nuevas]);
    setUploading(false);
  }

  async function handleRemove(index) {
    const item = value[index];
    try {
      await eliminarImagen(item.public_id);
    } catch {
      // Si falla el delete en Cloudinary, igual la removemos del state
    }
    onChange(value.filter((_, i) => i !== index));
  }

  function handleAltChange(index, alt) {
    const updated = value.map((img, i) => (i === index ? { ...img, alt } : img));
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      {/* Grilla de imágenes cargadas */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {value.map((img, i) => (
            <div key={img.public_id} className="group relative">
              <div className="relative aspect-square overflow-hidden rounded-xl border border-line bg-surface">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-navy/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              </div>
              {/* Botón eliminar */}
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-white opacity-0 shadow-lg transition-all duration-150 group-hover:opacity-100 hover:scale-110 hover:bg-rose-600"
              >
                <X size={13} />
              </button>
              {/* Alt text */}
              <input
                value={img.alt}
                onChange={(e) => handleAltChange(i, e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-line bg-surface px-2 py-1 text-xs text-muted placeholder:text-muted/50 focus:border-navy focus:outline-none"
                placeholder="Texto alternativo"
              />
            </div>
          ))}
        </div>
      )}

      {/* Zona de drop / botón subir */}
      {value.length < max && (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
          className={[
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-10 transition-all duration-200",
            uploading
              ? "cursor-default border-navy/30 bg-navy/5"
              : "border-line bg-white/50 hover:border-navy/50 hover:bg-navy/5 hover:shadow-sm",
          ].join(" ")}
        >
          {uploading ? (
            <>
              <Loader2 size={22} className="animate-spin text-navy" />
              <p className="text-sm font-semibold text-navy">Subiendo…</p>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy/10 ring-4 ring-navy/5">
                {value.length === 0 ? (
                  <ImageIcon size={20} className="text-navy" />
                ) : (
                  <Upload size={20} className="text-navy" />
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-ink">
                  {value.length === 0 ? "Subir imágenes" : "Agregar más"}
                </p>
                <p className="text-xs text-muted">
                  JPG, PNG o WEBP · máx 5 MB · arrastrá o hacé click
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && (
        <p className="text-xs text-rose-500">{error}</p>
      )}
    </div>
  );
}

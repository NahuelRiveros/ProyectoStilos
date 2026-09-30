import { useRef, useState } from "react";
import { ImagePlus, Link2, Trash2 } from "lucide-react";
import { logoMarcaUrlSchema } from "compartido/schemas/atributos.js";
import { mensajeDeError } from "@/api/http.js";
import Boton from "@/componentes/ui/boton.jsx";
import FormError from "@/componentes/ui/form_error.jsx";
import InputField from "@/componentes/ui/input_field.jsx";
import { ANCHOS, urlImagen } from "@/utils/imagenes.js";
import { useLogoMarcaPorUrl, useQuitarLogoMarca, useSubirLogoMarca } from "../hooks/use_catalogo.js";

const MAX_MB = 2;

/**
 * Logo de una marca ya creada: subir un archivo, pegar una dirección https o quitarlo.
 * Va afuera del formulario de la marca (no hay formularios adentro de otros).
 */
export default function LogoMarcaEditor({ marca, onCambio }) {
  const entrada = useRef(null);
  const subir = useSubirLogoMarca();
  const porUrl = useLogoMarcaPorUrl();
  const quitar = useQuitarLogoMarca();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const ocupado = subir.isPending || porUrl.isPending || quitar.isPending;

  async function aplicar(accion) {
    setError("");
    try {
      onCambio(await accion());
    } catch (e) {
      setError(mensajeDeError(e));
    }
  }

  function elegirArchivo(archivo) {
    if (!archivo) return;
    if (archivo.size > MAX_MB * 1024 * 1024) return setError(`El logo supera ${MAX_MB} MB.`);
    aplicar(() => subir.mutateAsync({ id: marca.id, archivo }));
  }

  function pegarUrl() {
    const validacion = logoMarcaUrlSchema.safeParse({ url });
    if (!validacion.success) return setError(validacion.error.issues[0].message);
    aplicar(async () => {
      const actualizada = await porUrl.mutateAsync({ id: marca.id, url: validacion.data.url });
      setUrl("");
      return actualizada;
    });
  }

  return (
    <section className="mt-6 space-y-3 border-t border-borde pt-4" aria-label="Logo de la marca">
      <h3 className="text-sm font-semibold">Logo</h3>
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-24 items-center justify-center rounded-xl border border-borde bg-fondo p-2">
          {marca.logo_url ? (
            <img src={urlImagen(marca.logo_url, ANCHOS.miniatura)} alt={`Logo de ${marca.nombre}`} className="max-h-full max-w-full object-contain" />
          ) : (
            <span className="text-xs text-texto-suave">Sin logo</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Boton variante="secundario" tamano="chico" onClick={() => entrada.current?.click()} disabled={ocupado}>
            <ImagePlus className="h-4 w-4" aria-hidden="true" /> {subir.isPending ? "Subiendo..." : marca.logo_url ? "Cambiar logo" : "Subir logo"}
          </Boton>
          {marca.logo_url && (
            <Boton variante="fantasma" tamano="chico" onClick={() => aplicar(() => quitar.mutateAsync(marca.id))} disabled={ocupado} className="text-peligro">
              <Trash2 className="h-4 w-4" aria-hidden="true" /> Quitar
            </Boton>
          )}
        </div>
        <input
          ref={entrada}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          aria-label="Elegir logo"
          onChange={(e) => {
            elegirArchivo(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1">
          <InputField label="O pegá la dirección del logo" name="logo_url" icon={Link2} placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>
        <Boton variante="secundario" onClick={pegarUrl} disabled={!url.trim() || ocupado} className="mb-px">
          Usar
        </Boton>
      </div>
      <p className="text-xs text-texto-suave">PNG con fondo transparente, hasta {MAX_MB} MB. Se ve en la ficha del producto y en los filtros de la tienda.</p>
      <FormError mensaje={error} />
    </section>
  );
}

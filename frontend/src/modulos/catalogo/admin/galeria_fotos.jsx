import { useRef, useState } from "react";
import { ImagePlus, Link2 } from "lucide-react";
import { lugarImagenes, maximoImagenes } from "compartido/reglas/imagenes_producto.js";
import { mensajeDeError } from "@/api/http.js";
import { useToast } from "@/componentes/toast/toast_context.jsx";
import Boton from "@/componentes/ui/boton.jsx";
import ConfirmDialog from "@/componentes/ui/confirm_dialog.jsx";
import InputField from "@/componentes/ui/input_field.jsx";
import { cn } from "@/utils/cn.js";
import { useAgregarImagenUrl, useCambiarColorImagen, useEliminarImagen, useOrdenarImagenes, useSubirImagen } from "../hooks/use_catalogo.js";
import { coloresDelProducto } from "../utils/galeria.js";
import ImagenTarjeta from "./imagen_tarjeta.jsx";

export const TODAS = "todas";
export const MAX_MB = 5;

/**
 * Fotos de un producto: subir (eligiendo o arrastrando), pegar una dirección, ordenar, elegir la principal y quitar.
 * `fotosDe`: TODAS (producto sin colores), null (fotos generales) o el id de un color (las fotos de ese color,
 * dentro de su tarjeta en "Talles y colores"). Va dentro del formulario del producto: no usa <form> propio.
 */
export default function GaleriaFotos({ producto, fotosDe = TODAS }) {
  const toast = useToast();
  const entrada = useRef(null);
  const subir = useSubirImagen();
  const porUrl = useAgregarImagenUrl();
  const ordenar = useOrdenarImagenes();
  const cambiarColor = useCambiarColorImagen();
  const eliminar = useEliminarImagen();
  const [progreso, setProgreso] = useState(null); // "Subiendo 1 de 3..."
  const [arrastrando, setArrastrando] = useState(false);
  const [url, setUrl] = useState("");
  const [aEliminar, setAEliminar] = useState(null);

  const colores = coloresDelProducto(producto);
  const imagenes = producto.imagenes;
  const color_id = fotosDe === TODAS ? null : fotosDe;
  const visibles = fotosDe === TODAS ? imagenes : imagenes.filter((img) => (img.color_id ?? null) === color_id);
  const lugar = lugarImagenes(imagenes, color_id);
  const maximo = maximoImagenes(color_id);
  const nombreColor = colores.find((c) => c.id === color_id)?.nombre;
  const de = fotosDe === TODAS ? "imágenes" : nombreColor ? `fotos de ${nombreColor}` : "fotos generales";
  const ocupado = Boolean(progreso) || porUrl.isPending || ordenar.isPending || cambiarColor.isPending;

  // Cada acción avisa si falla; el listado se actualiza solo (la mutación invalida el producto).
  async function intentar(accion) {
    try {
      await accion();
      return true;
    } catch (error) {
      toast.error(mensajeDeError(error));
      return false;
    }
  }

  async function subirArchivos(lista) {
    const archivos = [...lista].slice(0, lugar);
    if (lista.length > lugar) {
      const limite = fotosDe === TODAS ? `${maximo} imágenes` : color_id ? `${maximo} fotos por color` : `${maximo} fotos generales`;
      toast.info(`Se ${lugar === 1 ? "sube solo 1" : `suben solo ${lugar}`}: el máximo es ${limite}.`);
    }
    for (const [i, archivo] of archivos.entries()) {
      if (archivo.size > MAX_MB * 1024 * 1024) {
        toast.error(`"${archivo.name}" supera ${MAX_MB} MB.`);
        continue;
      }
      setProgreso(`Subiendo ${i + 1} de ${archivos.length}...`);
      // si el servicio falla, no seguir intentando con el resto
      if (!(await intentar(() => subir.mutateAsync({ productoId: producto.id, archivo, color_id })))) break;
    }
    setProgreso(null);
  }

  async function agregarUrl() {
    if (!url.trim()) return;
    if (await intentar(() => porUrl.mutateAsync({ productoId: producto.id, url, color_id }))) setUrl("");
  }

  const reordenar = (ids) => intentar(() => ordenar.mutateAsync({ productoId: producto.id, ids }));

  // Se intercambia con la vecina que se ve acá (la del mismo color); el resto queda en su lugar.
  function mover(imagen, delta) {
    const vecina = visibles[visibles.indexOf(imagen) + delta];
    const ids = imagenes.map((img) => img.id);
    const [a, b] = [ids.indexOf(imagen.id), ids.indexOf(vecina.id)];
    [ids[a], ids[b]] = [ids[b], ids[a]];
    return reordenar(ids);
  }

  // La principal es la primera de todas: la que muestra el listado de la tienda sin filtro de color.
  const hacerPrincipal = (imagen) => reordenar([imagen.id, ...imagenes.filter((img) => img.id !== imagen.id).map((img) => img.id)]);

  // En el selector de color de cada foto: los colores (o las generales, null) que ya no tienen lugar.
  const completos = new Set([...colores.map((c) => c.id), null].filter((id) => lugarImagenes(imagenes, id) === 0));

  return (
    <div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5" aria-label={fotosDe === TODAS ? "Imágenes del producto" : `Fotos: ${de}`}>
        {visibles.map((img, i) => (
          <ImagenTarjeta
            key={img.id}
            imagen={img}
            numero={imagenes.indexOf(img) + 1}
            principal={img === imagenes[0]}
            colores={colores}
            completos={completos}
            puedeAntes={i > 0}
            puedeDespues={i < visibles.length - 1}
            ocupado={ocupado}
            onMover={(delta) => mover(img, delta)}
            onPrincipal={() => hacerPrincipal(img)}
            onQuitar={() => setAEliminar(img)}
            onCambiarColor={(nuevo) => intentar(() => cambiarColor.mutateAsync({ productoId: producto.id, imagenId: img.id, color_id: nuevo }))}
          />
        ))}

        {lugar > 0 ? (
          <li>
            <button
              type="button"
              onClick={() => entrada.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setArrastrando(true);
              }}
              onDragLeave={() => setArrastrando(false)}
              onDrop={(e) => {
                e.preventDefault();
                setArrastrando(false);
                subirArchivos(e.dataTransfer.files);
              }}
              disabled={ocupado}
              className={cn(
                "flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed p-2 text-center text-xs text-texto-suave transition",
                arrastrando ? "border-primario bg-primario/10" : "border-borde hover:border-primario",
              )}
            >
              <ImagePlus className="h-6 w-6" aria-hidden="true" />
              {progreso ?? `Subir ${de}`}
              {!progreso && <span>Quedan {lugar} de {maximo}</span>}
            </button>
            <input
              ref={entrada}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
              multiple
              className="hidden"
              aria-label={`Elegir ${de}`}
              onChange={(e) => {
                subirArchivos(e.target.files);
                e.target.value = "";
              }}
            />
          </li>
        ) : (
          <li className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-borde p-3 text-center text-xs text-texto-suave" role="status">
            Ya están las {maximo} {de} (el máximo). Quitá una para subir otra.
          </li>
        )}
      </ul>

      {lugar > 0 && (
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <div className="min-w-60 flex-1">
            <InputField
              label={fotosDe === TODAS ? "O pegá la dirección de una imagen" : `O pegá la dirección de una foto (${nombreColor ?? "general"})`}
              name={`url_imagen_${color_id ?? "general"}`}
              icon={Link2}
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              // Está dentro del formulario del producto: Enter agrega la foto en vez de guardar el producto.
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                agregarUrl();
              }}
            />
          </div>
          <Boton variante="secundario" onClick={agregarUrl} disabled={!url.trim() || ocupado}>
            Agregar
          </Boton>
        </div>
      )}

      <ConfirmDialog
        abierto={Boolean(aEliminar)}
        titulo="Quitar foto"
        mensaje="La foto se quita del producto."
        textoConfirmar="Quitar"
        cargando={eliminar.isPending}
        onConfirmar={async () => {
          await intentar(() => eliminar.mutateAsync({ productoId: producto.id, imagenId: aEliminar.id }));
          setAEliminar(null);
        }}
        onCerrar={() => setAEliminar(null)}
      />
    </div>
  );
}

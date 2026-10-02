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
import FiltroFotosColor, { GENERALES, TODAS } from "./filtro_fotos_color.jsx";
import ImagenTarjeta from "./imagen_tarjeta.jsx";

const MAX_MB = 5;

/**
 * Galería del producto: subir (arrastrando o eligiendo), pegar URL, ordenar y quitar.
 * En prendas con colores, cada foto se marca con su color (y se puede ver la galería de un solo color).
 */
export default function ImagenesProducto({ producto }) {
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
  const [filtro, setFiltro] = useState(TODAS);

  const colores = coloresDelProducto(producto);
  const imagenes = producto.imagenes;
  // Con un color elegido en el filtro, lo que se sube queda con ese color.
  const colorSubida = typeof filtro === "number" ? filtro : null;
  const visibles = filtro === TODAS ? imagenes : imagenes.filter((img) => (filtro === GENERALES ? img.color_id == null : img.color_id === filtro));
  // El límite es por color (las generales tienen el suyo): lo que queda para lo que se está por subir.
  const lugar = lugarImagenes(imagenes, colorSubida);
  const maximo = maximoImagenes(colorSubida);
  const nombreSubida = colores.find((c) => c.id === colorSubida)?.nombre;
  const ocupado = Boolean(progreso) || porUrl.isPending || ordenar.isPending || cambiarColor.isPending;

  async function subirArchivos(lista) {
    const archivos = [...lista].slice(0, lugar);
    if (lista.length > lugar) {
      const limite = colorSubida ? `${maximo} fotos por color` : `${maximo} fotos generales`;
      toast.info(`Se ${lugar === 1 ? "sube solo 1" : `suben solo ${lugar}`}: el máximo es ${limite}.`);
    }
    for (const [i, archivo] of archivos.entries()) {
      if (archivo.size > MAX_MB * 1024 * 1024) {
        toast.error(`"${archivo.name}" supera ${MAX_MB} MB.`);
        continue;
      }
      setProgreso(`Subiendo ${i + 1} de ${archivos.length}...`);
      try {
        await subir.mutateAsync({ productoId: producto.id, archivo, color_id: colorSubida });
      } catch (error) {
        toast.error(mensajeDeError(error));
        break; // si el servicio falla, no seguir intentando con el resto
      }
    }
    setProgreso(null);
  }

  async function agregarUrl(e) {
    e.preventDefault();
    try {
      await porUrl.mutateAsync({ productoId: producto.id, url, color_id: colorSubida });
      setUrl("");
    } catch (error) {
      toast.error(mensajeDeError(error));
    }
  }

  // Mueve entre las fotos que se ven (con un color filtrado, se intercambia con la vecina de ese color).
  async function mover(imagen, delta) {
    const vecina = visibles[visibles.indexOf(imagen) + delta];
    const ids = imagenes.map((img) => img.id);
    const [a, b] = [ids.indexOf(imagen.id), ids.indexOf(vecina.id)];
    [ids[a], ids[b]] = [ids[b], ids[a]];
    try {
      await ordenar.mutateAsync({ productoId: producto.id, ids });
    } catch (error) {
      toast.error(mensajeDeError(error));
    }
  }

  async function asignarColor(imagen, color_id) {
    try {
      await cambiarColor.mutateAsync({ productoId: producto.id, imagenId: imagen.id, color_id });
    } catch (error) {
      toast.error(mensajeDeError(error));
    }
  }

  async function confirmarEliminar() {
    try {
      await eliminar.mutateAsync({ productoId: producto.id, imagenId: aEliminar.id });
    } catch (error) {
      toast.error(mensajeDeError(error));
    } finally {
      setAEliminar(null);
    }
  }

  // En el selector de cada foto: a qué colores ya no se le pueden pasar más fotos.
  const completos = new Set([...colores.filter((c) => lugarImagenes(imagenes, c.id) === 0).map((c) => c.id), ...(lugarImagenes(imagenes, null) === 0 ? [null] : [])]);
  const textoSubir = colores.length === 0 ? "Subir imágenes (o arrastralas acá)" : colorSubida ? `Subir fotos de ${nombreSubida}` : "Subir fotos generales";

  return (
    <section className="rounded-2xl border border-borde bg-superficie p-5" aria-labelledby="titulo-imagenes">
      <h2 id="titulo-imagenes" className="text-lg font-bold">
        Imágenes
      </h2>
      <p className="text-sm text-texto-suave">
        La primera es la principal (la que se ve en el listado de la tienda). Cada imagen, hasta {MAX_MB} MB. Usá fotos cuadradas: en el listado se
        muestran así y las verticales se recortan arriba y abajo. Con las flechas cambiás el orden.
      </p>
      <FiltroFotosColor imagenes={imagenes} colores={colores} filtro={filtro} onFiltrar={setFiltro} />

      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5" aria-label="Imágenes del producto">
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
            onQuitar={() => setAEliminar(img)}
            onCambiarColor={(color_id) => asignarColor(img, color_id)}
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
              {progreso ?? textoSubir}
              {!progreso && <span>Quedan {lugar} de {maximo}</span>}
            </button>
            <input
              ref={entrada}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
              multiple
              className="hidden"
              aria-label="Elegir imágenes"
              onChange={(e) => {
                subirArchivos(e.target.files);
                e.target.value = "";
              }}
            />
          </li>
        ) : (
          <li className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-borde p-3 text-center text-xs text-texto-suave" role="status">
            {colorSubida ? `${nombreSubida} ya tiene sus ${maximo} fotos.` : `Ya hay ${maximo} fotos generales.`} Quitá una para subir otra.
          </li>
        )}
      </ul>

      {lugar > 0 && (
        <form onSubmit={agregarUrl} className="mt-4 flex flex-wrap items-end gap-2">
          <div className="min-w-60 flex-1">
            <InputField label="O pegá la dirección de una imagen" name="url_imagen" icon={Link2} placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
          <Boton type="submit" variante="secundario" disabled={!url.trim() || ocupado}>
            Agregar
          </Boton>
        </form>
      )}

      <ConfirmDialog
        abierto={Boolean(aEliminar)}
        titulo="Quitar imagen"
        mensaje="La imagen se quita del producto."
        textoConfirmar="Quitar"
        cargando={eliminar.isPending}
        onConfirmar={confirmarEliminar}
        onCerrar={() => setAEliminar(null)}
      />
    </section>
  );
}

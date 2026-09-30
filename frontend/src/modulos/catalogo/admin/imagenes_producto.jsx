import { useRef, useState } from "react";
import { ImagePlus, Link2 } from "lucide-react";
import { proyecto } from "compartido/proyecto.js";
import { mensajeDeError } from "@/api/http.js";
import { useToast } from "@/componentes/toast/toast_context.jsx";
import Boton from "@/componentes/ui/boton.jsx";
import ConfirmDialog from "@/componentes/ui/confirm_dialog.jsx";
import InputField from "@/componentes/ui/input_field.jsx";
import { cn } from "@/utils/cn.js";
import { useAgregarImagenUrl, useCambiarColorImagen, useEliminarImagen, useOrdenarImagenes, useSubirImagen } from "../hooks/use_catalogo.js";
import { coloresDelProducto } from "../utils/galeria.js";
import ImagenTarjeta from "./imagen_tarjeta.jsx";

const MAXIMO = proyecto.catalogo.max_imagenes_producto;
const MAX_MB = 5;
const TODAS = "todas";
const GENERALES = "generales";

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
  const lugar = MAXIMO - imagenes.length;
  const ocupado = Boolean(progreso) || porUrl.isPending || ordenar.isPending || cambiarColor.isPending;

  async function subirArchivos(lista) {
    const archivos = [...lista].slice(0, lugar);
    if (lista.length > lugar) toast.info(`Se suben solo ${lugar}: el máximo es ${MAXIMO} imágenes.`);
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

  const cuantas = (id) => imagenes.filter((img) => (id === GENERALES ? img.color_id == null : img.color_id === id)).length;
  const opcionesFiltro = [
    { id: TODAS, nombre: `Todas (${imagenes.length})` },
    { id: GENERALES, nombre: `Generales (${cuantas(GENERALES)})` },
    ...colores.map((c) => ({ id: c.id, nombre: `${c.nombre} (${cuantas(c.id)})`, hex: c.hex })),
  ];

  return (
    <section className="rounded-2xl border border-borde bg-superficie p-5" aria-labelledby="titulo-imagenes">
      <h2 id="titulo-imagenes" className="text-lg font-bold">
        Imágenes
      </h2>
      <p className="text-sm text-texto-suave">
        La primera es la principal (la que se ve en el catálogo). Hasta {MAXIMO} imágenes de {MAX_MB} MB.
        {colores.length > 0 && " Elegí un color abajo para subir sus fotos: en la tienda, al elegir ese color se ven esas fotos."}
      </p>

      {colores.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Ver fotos de">
          {opcionesFiltro.map((o) => (
            <button
              key={o.id}
              type="button"
              aria-pressed={filtro === o.id}
              onClick={() => setFiltro(o.id)}
              className={cn("flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm", filtro === o.id ? "border-primario bg-primario/10 font-semibold" : "border-borde hover:border-primario")}
            >
              {o.hex && <span className="h-3.5 w-3.5 rounded-full border border-borde" style={{ backgroundColor: o.hex }} aria-hidden="true" />}
              {o.nombre}
            </button>
          ))}
        </div>
      )}

      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5" aria-label="Imágenes del producto">
        {visibles.map((img, i) => (
          <ImagenTarjeta
            key={img.id}
            imagen={img}
            numero={imagenes.indexOf(img) + 1}
            principal={img === imagenes[0]}
            colores={colores}
            puedeAntes={i > 0}
            puedeDespues={i < visibles.length - 1}
            ocupado={ocupado}
            onMover={(delta) => mover(img, delta)}
            onQuitar={() => setAEliminar(img)}
            onCambiarColor={(color_id) => asignarColor(img, color_id)}
          />
        ))}

        {lugar > 0 && (
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
              {progreso ?? (colorSubida ? `Subir fotos de ${colores.find((c) => c.id === colorSubida)?.nombre}` : "Subir imágenes (o arrastralas acá)")}
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

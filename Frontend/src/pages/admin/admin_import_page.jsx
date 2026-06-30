import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Upload, Download, CheckCircle2, XCircle,
  FileSpreadsheet, AlertTriangle, RotateCcw, ChevronDown,
} from "lucide-react";
import { importarProductosCSV, getCatalogoCSV } from "../../api/producto_api";

// ── Parser CSV mínimo para preview client-side ──────────────────────────────
function parseCSVClient(text) {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return { headers: [], rows: [] };

  function parseRow(line) {
    const result = [];
    let cur = "";
    let inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; }
      else if (ch === "," && !inQ) { result.push(cur.trim()); cur = ""; }
      else { cur += ch; }
    }
    result.push(cur.trim());
    return result;
  }

  const headers = parseRow(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const vals = parseRow(line);
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""]));
  });
  return { headers, rows };
}

function contarProductosUnicos(rows) {
  const claves = new Set(rows.map((r) => r.cod_ref?.trim() || r.nombre?.trim()).filter(Boolean));
  return claves.size;
}

// ── Descarga de plantilla CSV ────────────────────────────────────────────────
const TEMPLATE_HEADERS =
  "nombre,cod_ref,descripcion,precio,precio_anterior,descuento_etiqueta,categoria_slug,genero_slug,marca_nombre,badge,home_seccion,talle,color,cantidad";

function descargarPlantilla(catalogo) {
  const cat0   = catalogo?.categorias?.[0]?.slug    ?? "remeras";
  const gen0   = catalogo?.generos?.[0]?.slug       ?? "damas";
  const marca0 = catalogo?.marcas?.[0]              ?? "";
  const t0     = catalogo?.talles?.[0]              ?? "S";
  const t1     = catalogo?.talles?.[1]              ?? "M";
  const c0     = catalogo?.colores?.[0]?.nombre     ?? "Negro";
  const c1     = catalogo?.colores?.[1]?.nombre     ?? "Blanco";

  const ejemplos = [
    `Remera Básica,REM-001,Remera de algodón premium,15000,,,${cat0},${gen0},${marca0},nuevo,,${t0},${c0},10`,
    `Remera Básica,REM-001,,,,,,,,,,${t0},${c1},5`,
    `Remera Básica,REM-001,,,,,,,,,,${t1},${c0},8`,
    `Jean Skinny,JEA-002,Jean elastizado,22000,28000,20% OFF,pantalones,${gen0},${marca0},,,36,Azul,3`,
    `Jean Skinny,JEA-002,,,,,,,,,,,38,Azul,4`,
  ].join("\n");

  const csv = TEMPLATE_HEADERS + "\n" + ejemplos;
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "plantilla_productos.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ── Referencia de campos ─────────────────────────────────────────────────────
const CAMPOS_GUIA = [
  { campo: "nombre",             req: true,  desc: "Nombre del producto.",                                     ej: "Remera Básica"  },
  { campo: "cod_ref",            req: false, desc: "Código de referencia. Agrupa variantes del mismo producto.", ej: "REM-001"        },
  { campo: "descripcion",        req: false, desc: "Descripción. Solo completar en la primera fila del grupo.", ej: "Algodón premium" },
  { campo: "precio",             req: true,  desc: "Precio actual en pesos.",                                   ej: "15000"          },
  { campo: "precio_anterior",    req: false, desc: "Precio tachado si hay oferta.",                             ej: "20000"          },
  { campo: "descuento_etiqueta", req: false, desc: "Texto de la etiqueta de descuento.",                        ej: "20% OFF"        },
  { campo: "categoria_slug",     req: true,  desc: "Slug de la categoría (ver tabla de abajo).",                ej: "remeras"        },
  { campo: "genero_slug",        req: true,  desc: "Slug del género (ver tabla de abajo).",                     ej: "damas"          },
  { campo: "marca_nombre",       req: false, desc: "Nombre exacto de la marca (ver tabla de abajo).",           ej: "Zara"           },
  { campo: "badge",              req: false, desc: "Etiqueta del producto: nuevo · vuelve · agotado",           ej: "nuevo"          },
  { campo: "home_seccion",       req: false, desc: "Sección del home: carousel · novedades",                    ej: "novedades"      },
  { campo: "talle",              req: false, desc: "Nombre exacto del talle (ver tabla de abajo).",             ej: "S"              },
  { campo: "color",              req: false, desc: "Nombre exacto del color (ver tabla de abajo).",             ej: "Negro"          },
  { campo: "cantidad",           req: false, desc: "Stock para esta combinación talle + color.",                 ej: "10"             },
];

// ── Acordeón de sección ──────────────────────────────────────────────────────
function Seccion({ titulo, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-line last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-3 text-left text-sm font-semibold text-ink hover:bg-surface/60"
      >
        {titulo}
        <ChevronDown size={14} className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-5 pb-4 pt-1">{children}</div>}
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function AdminImportPage() {
  const [step, setStep] = useState("idle"); // idle | preview | importing | done
  const [archivo, setArchivo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [apiError, setApiError] = useState("");
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);

  const { data: catalogo } = useQuery({
    queryKey: ["catalogo-csv"],
    queryFn: getCatalogoCSV,
    staleTime: 5 * 60_000,
  });

  function procesarArchivo(file) {
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      setApiError("Solo se permiten archivos .csv");
      return;
    }
    setApiError("");
    setArchivo(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const { headers, rows } = parseCSVClient(e.target.result);
      setPreview({ headers, rows, totalProductos: contarProductosUnicos(rows) });
      setStep("preview");
    };
    reader.readAsText(file, "UTF-8");
  }

  function onDrop(e) {
    e.preventDefault();
    setDrag(false);
    procesarArchivo(e.dataTransfer.files[0]);
  }

  async function confirmar() {
    setStep("importing");
    setApiError("");
    try {
      const res = await importarProductosCSV(archivo);
      setResultado(res.data);
      setStep("done");
    } catch (err) {
      setApiError(err?.response?.data?.mensaje || "Error al importar el archivo.");
      setStep("preview");
    }
  }

  function reiniciar() {
    setStep("idle");
    setArchivo(null);
    setPreview(null);
    setResultado(null);
    setApiError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="admin-page max-w-4xl">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="admin-page-title">Importar productos</h1>
          <p className="admin-page-desc">Subí un archivo CSV para cargar muchos productos a la vez.</p>
        </div>
        <button
          onClick={() => descargarPlantilla(catalogo)}
          className="btn btn-ghost btn-sm shrink-0 gap-1.5"
        >
          <Download size={14} />
          Descargar plantilla
        </button>
      </div>

      {/* ── STEP: IDLE ────────────────────────────────────────────────────── */}
      {step === "idle" && (
        <div className="space-y-5">

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors
              ${drag
                ? "border-accent bg-accent/10"
                : "border-line hover:border-accent/50 hover:bg-accent/5"
              }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/15">
              <Upload size={22} className="text-accent" />
            </div>
            <div>
              <p className="font-semibold text-ink">Arrastrá tu archivo CSV aquí</p>
              <p className="mt-0.5 text-sm text-muted">o hacé click para seleccionarlo · máx. 2 MB</p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => procesarArchivo(e.target.files[0])}
            />
          </div>

          {apiError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertTriangle size={14} className="shrink-0" />
              {apiError}
            </div>
          )}

          {/* Referencia */}
          <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">

            <div className="border-b border-line px-5 py-3.5">
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={14} className="text-accent" />
                <h2 className="text-sm font-semibold text-ink">Cómo armar el CSV</h2>
              </div>
              <p className="mt-0.5 text-xs text-muted">
                Una fila por variante (talle + color). Misma <code className="rounded bg-surface px-1 py-0.5 font-mono">cod_ref</code> agrupa las variantes de un mismo producto.
              </p>
            </div>

            {/* Tabla de campos */}
            <Seccion titulo="Columnas del CSV" defaultOpen>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="py-2 pr-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted">Campo</th>
                      <th className="py-2 pr-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted">Descripción</th>
                      <th className="py-2 pr-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted">Ejemplo</th>
                      <th className="py-2 text-left text-[10px] font-bold uppercase tracking-widest text-muted">Requerido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {CAMPOS_GUIA.map(({ campo, req, desc, ej }) => (
                      <tr key={campo}>
                        <td className="py-2.5 pr-4">
                          <code className="font-mono text-xs text-accent">{campo}</code>
                        </td>
                        <td className="py-2.5 pr-4 text-muted">{desc}</td>
                        <td className="py-2.5 pr-4">
                          <code className="font-mono text-xs text-ink/70">{ej}</code>
                        </td>
                        <td className="py-2.5">
                          {req
                            ? <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">Sí</span>
                            : <span className="text-xs text-muted">—</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Seccion>

            {/* Valores disponibles */}
            {catalogo && (
              <>
                <Seccion titulo={`Categorías disponibles (${catalogo.categorias.length})`}>
                  <div className="flex flex-wrap gap-2">
                    {catalogo.categorias.map(({ slug, nombre }) => (
                      <div key={slug} className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs">
                        <span className="font-medium text-ink">{nombre}</span>
                        <span className="text-muted">→</span>
                        <code className="font-mono text-accent">{slug}</code>
                      </div>
                    ))}
                  </div>
                </Seccion>

                <Seccion titulo={`Géneros disponibles (${catalogo.generos.length})`}>
                  <div className="flex flex-wrap gap-2">
                    {catalogo.generos.map(({ slug, nombre }) => (
                      <div key={slug} className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs">
                        <span className="font-medium text-ink">{nombre}</span>
                        <span className="text-muted">→</span>
                        <code className="font-mono text-accent">{slug}</code>
                      </div>
                    ))}
                  </div>
                </Seccion>

                <Seccion titulo={`Talles disponibles (${catalogo.talles.length})`}>
                  <div className="flex flex-wrap gap-2">
                    {catalogo.talles.map((t) => (
                      <code key={t} className="rounded-lg border border-line bg-surface px-2.5 py-1.5 font-mono text-xs font-semibold text-ink">
                        {t}
                      </code>
                    ))}
                  </div>
                </Seccion>

                <Seccion titulo={`Colores disponibles (${catalogo.colores.length})`}>
                  <div className="flex flex-wrap gap-2">
                    {catalogo.colores.map(({ nombre, hex }) => (
                      <div key={nombre} className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs">
                        {hex && (
                          <span
                            className="h-3 w-3 shrink-0 rounded-full ring-1 ring-black/10"
                            style={{ backgroundColor: hex }}
                          />
                        )}
                        <code className="font-mono font-semibold text-ink">{nombre}</code>
                      </div>
                    ))}
                  </div>
                </Seccion>

                <Seccion titulo={`Marcas disponibles (${catalogo.marcas.length})`}>
                  <div className="flex flex-wrap gap-2">
                    {catalogo.marcas.map((m) => (
                      <code key={m} className="rounded-lg border border-line bg-surface px-2.5 py-1.5 font-mono text-xs text-ink">
                        {m}
                      </code>
                    ))}
                  </div>
                </Seccion>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── STEP: PREVIEW ─────────────────────────────────────────────────── */}
      {step === "preview" && preview && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-line bg-accent/10 px-5 py-4">
            <FileSpreadsheet size={20} className="text-accent shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="truncate font-semibold text-ink">{archivo?.name}</p>
              <p className="text-sm text-muted">
                {preview.rows.length} fila(s) ·{" "}
                <strong className="text-ink">{preview.totalProductos} producto(s)</strong> detectados
              </p>
            </div>
            <button onClick={reiniciar} className="btn btn-ghost btn-sm shrink-0 gap-1">
              <RotateCcw size={13} /> Cambiar
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
            <div className="border-b border-line px-5 py-3">
              <p className="text-sm font-semibold text-ink">Vista previa (primeras 5 filas)</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line bg-surface/50">
                    {preview.headers.map((h) => (
                      <th key={h} className="whitespace-nowrap px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-muted">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {preview.rows.slice(0, 5).map((row, i) => (
                    <tr key={i} className="hover:bg-surface/60">
                      {preview.headers.map((h) => (
                        <td key={h} className="max-w-40 truncate whitespace-nowrap px-3 py-2.5 text-ink/80">
                          {row[h] || <span className="text-muted">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {apiError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertTriangle size={14} className="shrink-0" />
              {apiError}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button onClick={reiniciar} className="btn btn-ghost btn-sm">Cancelar</button>
            <button onClick={confirmar} className="btn btn-accent btn-sm gap-2">
              <Upload size={14} />
              Importar {preview.totalProductos} producto(s)
            </button>
          </div>
        </div>
      )}

      {/* ── STEP: IMPORTING ───────────────────────────────────────────────── */}
      {step === "importing" && (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent/20 border-t-accent" />
          <p className="font-semibold text-ink">Importando productos...</p>
          <p className="text-sm text-muted">Esto puede tardar unos segundos.</p>
        </div>
      )}

      {/* ── STEP: DONE ────────────────────────────────────────────────────── */}
      {step === "done" && resultado && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
              <CheckCircle2 size={22} className="shrink-0 text-emerald-600" />
              <div>
                <p className="text-2xl font-black text-emerald-700">{resultado.importados}</p>
                <p className="text-xs text-emerald-600/70">producto(s) importado(s)</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
              <XCircle size={22} className="shrink-0 text-red-600" />
              <div>
                <p className="text-2xl font-black text-red-700">{resultado.fallidos?.length ?? 0}</p>
                <p className="text-xs text-red-600/70">con error(es)</p>
              </div>
            </div>
          </div>

          {resultado.fallidos?.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-line px-5 py-3">
                <XCircle size={14} className="text-red-500" />
                <p className="text-sm font-semibold text-ink">Registros con errores</p>
              </div>
              <div className="divide-y divide-line">
                {resultado.fallidos.map(({ clave, motivo }, i) => (
                  <div key={i} className="flex items-start gap-3 px-5 py-3 text-sm">
                    <code className="shrink-0 pt-0.5 font-mono text-xs text-accent">{clave}</code>
                    <span className="text-red-600">{motivo}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button onClick={reiniciar} className="btn btn-accent btn-sm gap-2">
              <RotateCcw size={14} />
              Importar otro archivo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

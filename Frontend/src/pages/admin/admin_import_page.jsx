import { useState, useRef } from "react";
import { Upload, Download, CheckCircle2, XCircle, FileSpreadsheet, AlertTriangle, RotateCcw } from "lucide-react";
import { importarProductosCSV } from "../../api/producto_api";

// ── Plantilla CSV descargable ───────────────────────────────────────────────
const TEMPLATE_HEADERS =
  "nombre,cod_ref,descripcion,precio,precio_anterior,descuento_etiqueta,categoria_slug,genero_slug,marca_nombre,badge,home_seccion,talle,color,cantidad";

const TEMPLATE_EJEMPLOS = [
  "Remera Básica,REM-001,Remera de algodón premium,15000,,,remeras,damas,Zara,nuevo,,S,Negro,10",
  "Remera Básica,REM-001,,,,,,,,,,,S,Blanco,5",
  "Remera Básica,REM-001,,,,,,,,,,,M,Negro,8",
  "Jean Skinny,JEA-002,Jean elastizado con spandex,22000,28000,20% OFF,pantalones,damas,,oferta,,36,Azul,3",
  "Jean Skinny,JEA-002,,,,,,,,,,,38,Azul,4",
].join("\n");

function descargarPlantilla() {
  const csv = TEMPLATE_HEADERS + "\n" + TEMPLATE_EJEMPLOS;
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "plantilla_productos.csv";
  a.click();
  URL.revokeObjectURL(url);
}

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

// ── Campo de la guía de slugs ───────────────────────────────────────────────
const CAMPOS_GUIA = [
  { campo: "nombre", desc: "Nombre del producto. Obligatorio.", ej: "Remera Básica" },
  { campo: "cod_ref", desc: "Código de referencia. Agrupa variantes del mismo producto.", ej: "REM-001" },
  { campo: "descripcion", desc: "Descripción libre. Solo en la primera fila del grupo.", ej: "Algodón premium" },
  { campo: "precio", desc: "Precio actual en pesos. Obligatorio.", ej: "15000" },
  { campo: "precio_anterior", desc: "Precio tachado (oferta). Opcional.", ej: "20000" },
  { campo: "descuento_etiqueta", desc: "Texto de la etiqueta de descuento.", ej: "20% OFF" },
  { campo: "categoria_slug", desc: "Slug de la categoría (ver Catálogos → Categorías). Obligatorio.", ej: "remeras" },
  { campo: "genero_slug", desc: "Slug del género. Obligatorio.", ej: "damas" },
  { campo: "marca_nombre", desc: "Nombre exacto de la marca (ver Catálogos → Marcas). Opcional.", ej: "Zara" },
  { campo: "badge", desc: "Etiqueta destacada del producto.", ej: "nuevo" },
  { campo: "home_seccion", desc: "Sección del home donde aparece (si aplica).", ej: "novedades" },
  { campo: "talle", desc: "Nombre exacto del talle (ver Catálogos → Talles).", ej: "S" },
  { campo: "color", desc: "Nombre exacto del color (ver Catálogos → Colores).", ej: "Negro" },
  { campo: "cantidad", desc: "Stock para esta combinación talle+color.", ej: "10" },
];

// ── Componente principal ────────────────────────────────────────────────────
export default function AdminImportPage() {
  const [step, setStep] = useState("idle"); // idle | preview | importing | done
  const [archivo, setArchivo] = useState(null);
  const [preview, setPreview] = useState(null); // { headers, rows, totalProductos }
  const [resultado, setResultado] = useState(null); // { importados, fallidos }
  const [apiError, setApiError] = useState("");
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);

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
      const text = e.target.result;
      const { headers, rows } = parseCSVClient(text);
      const totalProductos = contarProductosUnicos(rows);
      setPreview({ headers, rows, totalProductos });
      setStep("preview");
    };
    reader.readAsText(file, "UTF-8");
  }

  function onInputChange(e) {
    procesarArchivo(e.target.files[0]);
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
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Importar productos</h1>
          <p className="admin-page-subtitle">Cargá un archivo CSV para dar de alta muchos productos a la vez.</p>
        </div>
        <button onClick={descargarPlantilla} className="btn btn-ghost btn-sm gap-1.5">
          <Download size={14} />
          Descargar plantilla
        </button>
      </div>

      {/* ── STEP: IDLE ─────────────────────────────────────────────────────── */}
      {step === "idle" && (
        <div className="space-y-6">

          {/* Zona de drop */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors
              ${drag
                ? "border-accent bg-accent/10"
                : "border-admin-raised hover:border-accent/50 hover:bg-accent/5"
              }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
              <Upload size={22} className="text-accent" />
            </div>
            <div>
              <p className="font-semibold text-admin-text">Arrastrá tu archivo CSV aquí</p>
              <p className="mt-0.5 text-sm text-admin-text-dim">o hacé click para seleccionarlo · máx. 2 MB</p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={onInputChange}
            />
          </div>

          {apiError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-900/20 px-4 py-3 text-sm text-red-400">
              <AlertTriangle size={14} className="shrink-0" />
              {apiError}
            </div>
          )}

          {/* Guía de campos */}
          <div className="admin-card">
            <div className="admin-card-header">
              <FileSpreadsheet size={14} className="text-accent" />
              <h2 className="admin-card-title">Referencia de columnas</h2>
            </div>
            <div className="divide-y divide-admin-raised overflow-x-auto">
              <div className="grid grid-cols-[140px_1fr_120px] gap-x-4 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-admin-text-dim">
                <span>Campo</span>
                <span>Descripción</span>
                <span>Ejemplo</span>
              </div>
              {CAMPOS_GUIA.map(({ campo, desc, ej }) => (
                <div key={campo} className="grid grid-cols-[140px_1fr_120px] gap-x-4 px-4 py-2.5 text-sm">
                  <span className="font-mono text-xs text-accent">{campo}</span>
                  <span className="text-admin-text-dim">{desc}</span>
                  <span className="font-mono text-xs text-admin-text/70">{ej}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── STEP: PREVIEW ──────────────────────────────────────────────────── */}
      {step === "preview" && preview && (
        <div className="space-y-4">
          {/* Resumen */}
          <div className="flex items-center gap-3 rounded-xl bg-accent/10 px-5 py-4">
            <FileSpreadsheet size={20} className="text-accent" />
            <div className="flex-1">
              <p className="font-semibold text-admin-text">
                {archivo?.name}
              </p>
              <p className="text-sm text-admin-text-dim">
                {preview.rows.length} fila(s) · <strong className="text-admin-text">{preview.totalProductos} producto(s)</strong> detectados
              </p>
            </div>
            <button onClick={reiniciar} className="btn btn-ghost btn-sm gap-1">
              <RotateCcw size={13} /> Cambiar
            </button>
          </div>

          {/* Primeras 5 filas */}
          <div className="admin-card overflow-hidden">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Vista previa (primeras 5 filas)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-admin-raised">
                    {preview.headers.map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-admin-text-dim whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-raised">
                  {preview.rows.slice(0, 5).map((row, i) => (
                    <tr key={i} className="hover:bg-admin-raised/30">
                      {preview.headers.map((h) => (
                        <td key={h} className="px-3 py-2 text-admin-text/80 whitespace-nowrap max-w-[160px] truncate">
                          {row[h] || <span className="text-admin-text-dim">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {apiError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-900/20 px-4 py-3 text-sm text-red-400">
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

      {/* ── STEP: IMPORTING ────────────────────────────────────────────────── */}
      {step === "importing" && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent/20 border-t-accent" />
          <p className="font-semibold text-admin-text">Importando productos...</p>
          <p className="text-sm text-admin-text-dim">Esto puede tardar unos segundos.</p>
        </div>
      )}

      {/* ── STEP: DONE ─────────────────────────────────────────────────────── */}
      {step === "done" && resultado && (
        <div className="space-y-5">
          {/* Resumen de resultado */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 rounded-xl bg-emerald-900/20 px-5 py-4">
              <CheckCircle2 size={22} className="text-emerald-400 shrink-0" />
              <div>
                <p className="text-2xl font-black text-emerald-400">{resultado.importados}</p>
                <p className="text-xs text-admin-text-dim">producto(s) importado(s)</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-red-900/20 px-5 py-4">
              <XCircle size={22} className="text-red-400 shrink-0" />
              <div>
                <p className="text-2xl font-black text-red-400">{resultado.fallidos?.length ?? 0}</p>
                <p className="text-xs text-admin-text-dim">con error(es)</p>
              </div>
            </div>
          </div>

          {/* Lista de errores */}
          {resultado.fallidos?.length > 0 && (
            <div className="admin-card">
              <div className="admin-card-header">
                <XCircle size={14} className="text-red-400" />
                <h2 className="admin-card-title">Registros con errores</h2>
              </div>
              <div className="divide-y divide-admin-raised">
                {resultado.fallidos.map(({ clave, motivo }, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3 text-sm">
                    <span className="font-mono text-xs text-accent shrink-0 pt-0.5">{clave}</span>
                    <span className="text-red-400/80">{motivo}</span>
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

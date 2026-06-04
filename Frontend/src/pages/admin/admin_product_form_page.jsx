import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check, Package, Palette, Ruler, AlertCircle, Crown,
} from "lucide-react";

import {
  getProducto,
  getProductoStock,
  updateProductoStock,
  crearProducto,
  actualizarProducto,
} from "../../api/producto_api";

import {
  getCategorias,
  getGeneros,
  getTalles,
  getColores,
  getMarcas,
} from "../../api/catalogo_api";
import { AdminSpinner } from "../../components/admin";
import ImageUploader from "../../components/ui/image_uploader";
import { ColoresSection, StockSection } from "../../components/admin/product_form";

const EMPTY_FORM = {
  RELA_PROD01: "", RELA_PROD02: "", RELA_PROD07: "",
  PROD03_NOMBRE: "", PROD03_DESCRIPCION: "",
  PROD03_PRECIO: "", PROD03_PRECIO_ANTERIOR: "",
  PROD03_DESCUENTO: "", PROD03_BADGE: "",
  PROD03_HOME_SECCION: "",
  PROD03_IMAGENES: [],
  PROD03_COLORES: [],
};

const BADGE_OPTS = [
  { value: "",        label: "Activo",   cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "nuevo",   label: "Nuevo",    cls: "bg-navy/10 text-navy border-navy/20" },
  { value: "vuelve",  label: "Vuelve",   cls: "bg-champagne/20 text-ink border-champagne/30" },
  { value: "agotado", label: "Agotado",  cls: "bg-line text-muted border-line" },
];

function productoToForm(p) {
  return {
    RELA_PROD01:            p.categoria_id != null ? String(p.categoria_id) : "",
    RELA_PROD02:            p.genero_id    != null ? String(p.genero_id)    : "",
    RELA_PROD07:            p.marca_id     != null ? String(p.marca_id)     : "",
    PROD03_NOMBRE:          p.nombre,
    PROD03_DESCRIPCION:     p.descripcion ?? "",
    PROD03_PRECIO:          String(p.precio),
    PROD03_PRECIO_ANTERIOR: p.precio_anterior ? String(p.precio_anterior) : "",
    PROD03_DESCUENTO:       p.descuento ? String(p.descuento) : "",
    PROD03_BADGE:           p.badge ?? "",
    PROD03_HOME_SECCION:    p.home_seccion ?? "",
    PROD03_IMAGENES:        p.imagenes.map((img) => {
      if (typeof img === "string") return { src: img, alt: "", public_id: "" };
      return { src: img.src, alt: img.alt ?? "", public_id: "" };
    }),
    PROD03_COLORES: p.colores ?? [],
  };
}

function stockToEdit(rows, talles) {
  if (rows.length > 0) {
    return rows.map((r) => ({
      talle_id: r.talle_id,
      nombre:   r.talle ?? "Sin talle",
      cantidad: String(r.stock),
    }));
  }
  return talles.slice(0, 3).map((t) => ({
    talle_id: t.id,
    nombre:   t.nombre,
    cantidad: "0",
  }));
}

export default function AdminProductFormPage() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const isEditing = !!id;

  const [form,       setForm]       = useState(EMPTY_FORM);
  const [stock,      setStock]      = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [generos,    setGeneros]    = useState([]);
  const [marcas,     setMarcas]     = useState([]);
  const [tallesCat,  setTallesCat]  = useState([]);
  const [coloresCat, setColoresCat] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [errors,     setErrors]     = useState({});
  const [tab,        setTab]        = useState("info");
  const [saveError,  setSaveError]  = useState("");
  const [precioBase,  setPrecioBase]  = useState("");
  const [discountPct, setDiscountPct] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const catalogsPromise = Promise.all([
        getCategorias(), getGeneros(), getMarcas(), getTalles(), getColores(),
      ]);

      const productoPromise = isEditing
        ? Promise.all([getProducto(id), getProductoStock(id)])
        : null;

      const [[cats, gens, marcasList, talles, colores], productoData] =
        await Promise.all([catalogsPromise, productoPromise]);

      if (cancelled) return;

      setCategorias(cats);
      setGeneros(gens);
      setMarcas(marcasList);
      setTallesCat(talles);
      setColoresCat(colores);

      if (productoData) {
        const [p, stockRows] = productoData;
        setForm(productoToForm(p));
        setStock(stockToEdit(stockRows, talles));
        const anterior  = p.precio_anterior ? Number(p.precio_anterior) : 0;
        const precioVal = Number(p.precio);
        if (anterior > 0 && anterior > precioVal) {
          setPrecioBase(String(anterior));
          setDiscountPct(String(Math.round((1 - precioVal / anterior) * 100)));
        } else {
          setPrecioBase(String(precioVal));
        }
      }

      setLoading(false);
    }

    init().catch(() => setLoading(false));
    return () => { cancelled = true; };
  }, [id, isEditing]);

  function setField(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  }

  function toggleColor(c) {
    const already = form.PROD03_COLORES.some((s) => s.id === c.id);
    setField(
      "PROD03_COLORES",
      already
        ? form.PROD03_COLORES.filter((s) => s.id !== c.id)
        : [...form.PROD03_COLORES, { id: c.id, nombre: c.nombre, hex: c.hex }],
    );
  }

  function setStockField(i, field, v) {
    setStock((p) =>
      p.map((row, idx) => {
        if (idx !== i) return row;
        if (field === "talle_id") {
          const t = tallesCat.find((t) => t.id === Number(v));
          return { ...row, talle_id: v ? Number(v) : null, nombre: t?.nombre ?? "Sin talle" };
        }
        return { ...row, cantidad: v };
      }),
    );
  }

  function addStockRow() {
    const used = stock.map((r) => r.talle_id);
    const next = tallesCat.find((t) => !used.includes(t.id));
    setStock((p) => [
      ...p,
      { talle_id: next?.id ?? null, nombre: next?.nombre ?? "Sin talle", cantidad: "0" },
    ]);
  }

  function removeStockRow(i) {
    setStock((p) => p.filter((_, idx) => idx !== i));
  }

  function handlePrecioBaseChange(v) {
    setPrecioBase(v);
    const base = Number(v);
    const pct  = Number(discountPct);
    if (base > 0 && pct > 0 && pct < 100) {
      setField("PROD03_PRECIO",          String(Math.round(base * (1 - pct / 100))));
      setField("PROD03_PRECIO_ANTERIOR", v);
      setField("PROD03_DESCUENTO",       `-${Math.round(pct)}%`);
    } else if (base > 0) {
      setField("PROD03_PRECIO",          v);
      setField("PROD03_PRECIO_ANTERIOR", "");
      setField("PROD03_DESCUENTO",       "");
    } else {
      setField("PROD03_PRECIO",          "");
      setField("PROD03_PRECIO_ANTERIOR", "");
    }
  }

  function handleDiscountPctChange(v) {
    setDiscountPct(v);
    const base = Number(precioBase);
    const pct  = Number(v);
    if (base > 0 && pct > 0 && pct < 100) {
      setField("PROD03_PRECIO",          String(Math.round(base * (1 - pct / 100))));
      setField("PROD03_PRECIO_ANTERIOR", String(base));
      setField("PROD03_DESCUENTO",       `-${Math.round(pct)}%`);
    } else if (base > 0) {
      setField("PROD03_PRECIO",          String(base));
      setField("PROD03_PRECIO_ANTERIOR", "");
      setField("PROD03_DESCUENTO",       "");
    }
  }

  function validate() {
    const errs = {};
    if (!form.PROD03_NOMBRE.trim()) errs.PROD03_NOMBRE  = "El nombre es obligatorio.";
    if (!form.PROD03_PRECIO)        errs.PROD03_PRECIO   = "El precio es obligatorio.";
    if (!form.RELA_PROD01)          errs.RELA_PROD01    = "Seleccioná una categoría.";
    if (!form.RELA_PROD02)          errs.RELA_PROD02    = "Seleccioná un género.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) setTab("info");
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setSaveError("");

    const payload = {
      RELA_PROD01:            Number(form.RELA_PROD01),
      RELA_PROD02:            Number(form.RELA_PROD02),
      ...(form.RELA_PROD07 ? { RELA_PROD07: Number(form.RELA_PROD07) } : {}),
      PROD03_NOMBRE:          form.PROD03_NOMBRE.trim(),
      PROD03_DESCRIPCION:     form.PROD03_DESCRIPCION.trim() || undefined,
      PROD03_PRECIO:          Number(form.PROD03_PRECIO),
      PROD03_PRECIO_ANTERIOR: form.PROD03_PRECIO_ANTERIOR ? Number(form.PROD03_PRECIO_ANTERIOR) : null,
      PROD03_DESCUENTO:       form.PROD03_DESCUENTO.trim() || null,
      PROD03_BADGE:           form.PROD03_BADGE || null,
      PROD03_HOME_SECCION:    form.PROD03_HOME_SECCION || null,
      PROD03_IMAGENES:        form.PROD03_IMAGENES
        .filter((img) => img.src)
        .map(({ src, alt }) => ({ src, alt })),
      PROD03_COLORES:         form.PROD03_COLORES,
    };

    const stockEntries = stock
      .filter((r) => r.cantidad !== "")
      .map((r) => ({ talle_id: r.talle_id, cantidad: Number(r.cantidad) }));

    try {
      let productoId;
      if (isEditing) {
        await actualizarProducto(id, payload);
        productoId = Number(id);
      } else {
        const created = await crearProducto(payload);
        productoId = created.id;
      }

      if (stockEntries.length > 0) {
        await updateProductoStock(productoId, stockEntries);
      }

      navigate("/admin/productos");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo guardar el producto.";
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AdminSpinner fullPage />;

  const hasInfoError = errors.PROD03_NOMBRE || errors.PROD03_PRECIO || errors.RELA_PROD01 || errors.RELA_PROD02;

  const FORM_TABS = [
    { id: "info",     label: "Información", icon: Package,  hasError: !!hasInfoError },
    { id: "imagenes", label: "Imágenes",    icon: Crown,    hasError: false },
    { id: "stock",    label: "Stock",       icon: Ruler,    hasError: false },
    { id: "colores",  label: "Colores",     icon: Palette,  hasError: false },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border-2 border-line text-muted transition-all hover:border-navy/40 hover:bg-navy/5 hover:text-navy"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted/50">
            Admin / Productos / {isEditing ? "Editar" : "Nuevo"}
          </p>
          <h1 className="font-display text-xl font-black text-ink">
            {isEditing ? "Editar producto" : "Nuevo producto"}
          </h1>
          <p className="text-sm text-muted">
            {isEditing ? `ID #${id}` : "Completá los datos para publicar el artículo"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">

          <div className="lg:col-span-2 space-y-5">
            {/* Tabs */}
            <div className="flex gap-0.5 rounded-2xl border border-line bg-surface p-1.5">
              {FORM_TABS.map(({ id: tabId, label, icon: Icon, hasError }) => (
                <button key={tabId} type="button" onClick={() => setTab(tabId)}
                  className={[
                    "flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all",
                    tab === tabId ? "bg-white shadow text-navy font-black" : "text-muted hover:bg-white/60 hover:text-ink",
                  ].join(" ")}>
                  <Icon size={14} />
                  <span className="hidden sm:inline">{label}</span>
                  {hasError && <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />}
                </button>
              ))}
            </div>

            {tab === "info" && (
              <div className="space-y-5">

                {/* Card — Datos básicos */}
                <div className="rounded-2xl bg-card p-6 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-muted">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-navy/40" />
                      Datos básicos
                    </h2>
                    <span className="text-[10px] text-muted/40">
                      <span className="font-bold text-rose-400">*</span> obligatorio
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="label-form">
                        Nombre del artículo
                        <span className="ml-1 font-black text-rose-400">*</span>
                      </label>
                      <input
                        value={form.PROD03_NOMBRE}
                        onChange={(e) => setField("PROD03_NOMBRE", e.target.value)}
                        className="input-form"
                        placeholder="Ej: Camisa Oxford manga larga"
                      />
                      {errors.PROD03_NOMBRE && (
                        <p className="error-form mt-1.5 flex items-center gap-1">
                          <AlertCircle size={11} className="shrink-0" />
                          {errors.PROD03_NOMBRE}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="label-form">
                        Descripción
                        <span className="ml-1.5 text-[10px] font-normal text-muted/50">opcional</span>
                      </label>
                      <textarea
                        value={form.PROD03_DESCRIPCION}
                        onChange={(e) => setField("PROD03_DESCRIPCION", e.target.value)}
                        rows={3}
                        className="w-full resize-none rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 transition focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy/20"
                        placeholder="Descripción del artículo…"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className="label-form">
                          Tipo de prenda
                          <span className="ml-1 font-black text-rose-400">*</span>
                        </label>
                        <select
                          value={form.RELA_PROD01}
                          onChange={(e) => setField("RELA_PROD01", e.target.value)}
                          className="input-form"
                        >
                          <option value="">Seleccionar…</option>
                          {categorias.filter((c) => c.padre_id === null)
                            .sort((a, b) => a.nombre.localeCompare(b.nombre))
                            .map((root) => {
                              const hijos = categorias
                                .filter((c) => c.padre_id === root.id)
                                .sort((a, b) => a.nombre.localeCompare(b.nombre));
                              return hijos.length > 0 ? (
                                <optgroup key={root.id} label={root.nombre}>
                                  {hijos.map((h) => <option key={h.id} value={h.id}>{h.nombre}</option>)}
                                </optgroup>
                              ) : (
                                <option key={root.id} value={root.id}>{root.nombre}</option>
                              );
                            })
                          }
                        </select>
                        {errors.RELA_PROD01 && (
                          <p className="error-form mt-1.5 flex items-center gap-1">
                            <AlertCircle size={11} className="shrink-0" />
                            {errors.RELA_PROD01}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="label-form">
                          Género
                          <span className="ml-1 font-black text-rose-400">*</span>
                        </label>
                        <select
                          value={form.RELA_PROD02}
                          onChange={(e) => setField("RELA_PROD02", e.target.value)}
                          className="input-form"
                        >
                          <option value="">Seleccionar…</option>
                          {generos.map((g) => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                        </select>
                        {errors.RELA_PROD02 && (
                          <p className="error-form mt-1.5 flex items-center gap-1">
                            <AlertCircle size={11} className="shrink-0" />
                            {errors.RELA_PROD02}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="label-form">
                          Marca
                          <span className="ml-1.5 text-[10px] font-normal text-muted/50">opcional</span>
                        </label>
                        <select
                          value={form.RELA_PROD07}
                          onChange={(e) => setField("RELA_PROD07", e.target.value)}
                          className="input-form"
                        >
                          <option value="">Sin marca</option>
                          {marcas.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card — Precio */}
                <div className="rounded-2xl bg-card p-6 shadow-sm">
                  <h2 className="mb-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-muted">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-navy/40" />
                    Precio
                  </h2>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="label-form">
                        Precio original
                        <span className="ml-1 font-black text-rose-400">*</span>
                      </label>
                      <div className="flex overflow-hidden rounded-xl border border-line bg-surface transition focus-within:border-navy focus-within:ring-1 focus-within:ring-navy/20">
                        <span className="flex shrink-0 select-none items-center pl-3 pr-1 text-sm font-bold text-muted">$</span>
                        <input
                          type="number" min="0" step="1"
                          value={precioBase}
                          onChange={(e) => handlePrecioBaseChange(e.target.value)}
                          className="min-w-0 flex-1 bg-transparent py-2.5 pr-3 text-sm text-ink placeholder:text-muted/60 focus:outline-none"
                          placeholder="0"
                        />
                      </div>
                      {errors.PROD03_PRECIO && (
                        <p className="error-form mt-1.5 flex items-center gap-1">
                          <AlertCircle size={11} className="shrink-0" />
                          {errors.PROD03_PRECIO}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="label-form">
                        Descuento
                        <span className="ml-1.5 text-[10px] font-normal text-muted/50">opcional</span>
                      </label>
                      <div className="flex overflow-hidden rounded-xl border border-line bg-surface transition focus-within:border-navy focus-within:ring-1 focus-within:ring-navy/20">
                        <input
                          type="number" min="0" max="99" step="1"
                          value={discountPct}
                          onChange={(e) => handleDiscountPctChange(e.target.value)}
                          className="min-w-0 flex-1 bg-transparent py-2.5 pl-3 text-sm text-ink placeholder:text-muted/60 focus:outline-none"
                          placeholder="0"
                        />
                        <span className="flex shrink-0 select-none items-center pl-1 pr-3 text-sm font-bold text-muted">%</span>
                      </div>
                      <p className="mt-1 text-[11px] text-muted">Dejá en 0 si no tiene oferta</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-navy/20 bg-navy/5 px-4 py-3.5 shadow-sm">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-navy/60">Precio de venta</p>
                      <p className="text-2xl font-black text-navy">
                        {Number(form.PROD03_PRECIO) > 0
                          ? `$${Number(form.PROD03_PRECIO).toLocaleString("es-AR")}`
                          : "—"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-right">
                      {Number(form.PROD03_PRECIO_ANTERIOR) > 0 && Number(discountPct) > 0 && (
                        <>
                          <span className="text-sm text-muted line-through">
                            ${Number(form.PROD03_PRECIO_ANTERIOR).toLocaleString("es-AR")}
                          </span>
                          <span className="rounded-md bg-champagne/30 px-2 py-0.5 text-xs font-black text-ink">
                            -{discountPct}% · Ahorrás ${(Number(form.PROD03_PRECIO_ANTERIOR) - Number(form.PROD03_PRECIO)).toLocaleString("es-AR")}
                          </span>
                        </>
                      )}
                      {Number(form.PROD03_PRECIO) > 0 && (
                        <span className="text-[11px] text-muted">
                          Sin IVA (21%): <strong className="text-ink">
                            ${(Number(form.PROD03_PRECIO) / 1.21).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </strong>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="label-form">
                      Etiqueta de oferta
                      <span className="ml-1.5 text-[10px] font-normal text-muted/50">(badge sobre la imagen)</span>
                    </label>
                    <input
                      value={form.PROD03_DESCUENTO}
                      onChange={(e) => setField("PROD03_DESCUENTO", e.target.value)}
                      className="input-form"
                      placeholder="-20%, 2x1, Liquidación…"
                    />
                  </div>
                </div>
              </div>
            )}

            {tab === "imagenes" && (
              <div className="rounded-2xl bg-card p-6 shadow-sm">
                <h2 className="mb-1 text-[11px] font-black uppercase tracking-widest text-muted">Imágenes del producto</h2>
                <p className="mb-4 text-xs text-muted">Se suben a Cloudinary automáticamente. Podés reordenarlas arrastrando.</p>
                <ImageUploader
                  value={form.PROD03_IMAGENES}
                  onChange={(imgs) => setField("PROD03_IMAGENES", imgs)}
                  max={10}
                />
              </div>
            )}

            {tab === "stock" && (
              <div className="rounded-2xl bg-card p-6 shadow-sm">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h2 className="text-[11px] font-black uppercase tracking-widest text-muted">Stock por talle</h2>
                    <p className="mt-0.5 text-xs text-muted">Dejá un talle en 0 para marcarlo como agotado.</p>
                  </div>
                </div>
                <StockSection
                  rows={stock}
                  tallesCatalogo={tallesCat}
                  onSet={setStockField}
                  onAdd={addStockRow}
                  onRemove={removeStockRow}
                />
              </div>
            )}

            {tab === "colores" && (
              <div className="rounded-2xl bg-card p-6 shadow-sm">
                <h2 className="mb-2 text-[11px] font-black uppercase tracking-widest text-muted">Colores disponibles</h2>
                <p className="mb-4 text-xs text-muted">Seleccioná los colores en que está disponible este artículo.</p>
                <ColoresSection catalogo={coloresCat} selected={form.PROD03_COLORES} onToggle={toggleColor} />
                {form.PROD03_COLORES.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {form.PROD03_COLORES.map((c) => (
                      <span key={c.id} className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-semibold text-ink">
                        <span className="h-3 w-3 rounded-full border border-line/40" style={{ backgroundColor: c.hex ?? "#e5e7eb" }} />
                        {c.nombre}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl bg-card p-5 shadow-sm">
              <h2 className="mb-3 text-[11px] font-black uppercase tracking-widest text-muted">Estado</h2>
              <div className="space-y-2">
                {BADGE_OPTS.map((opt) => (
                  <button key={opt.value} type="button"
                    onClick={() => setField("PROD03_BADGE", opt.value)}
                    className={[
                      "flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all",
                      form.PROD03_BADGE === opt.value
                        ? `${opt.cls} ring-1 ring-current/20`
                        : "border-line bg-surface text-muted hover:border-navy/30 hover:text-ink",
                    ].join(" ")}>
                    {form.PROD03_BADGE === opt.value && <Check size={14} />}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-card p-5 shadow-sm">
              <h2 className="mb-1 text-[11px] font-black uppercase tracking-widest text-muted">Visibilidad en home</h2>
              <p className="mb-3 text-[11px] text-muted">¿En qué sección del home aparece?</p>
              <div className="space-y-2">
                {[
                  { value: "",           label: "Sin destacar",  desc: "No aparece en home" },
                  { value: "carousel",   label: "Carrusel",      desc: "Slide del hero carousel" },
                  { value: "novedades",  label: "Novedades",     desc: "Grilla de productos nuevos" },
                ].map((opt) => (
                  <button key={opt.value} type="button"
                    onClick={() => setField("PROD03_HOME_SECCION", opt.value)}
                    className={[
                      "flex w-full items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all",
                      form.PROD03_HOME_SECCION === opt.value
                        ? "border-navy/30 bg-navy/8 ring-1 ring-navy/20"
                        : "border-line bg-surface hover:border-navy/20 hover:text-ink",
                    ].join(" ")}>
                    <div className={[
                      "mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 transition-colors",
                      form.PROD03_HOME_SECCION === opt.value ? "border-navy bg-navy" : "border-line",
                    ].join(" ")} />
                    <div>
                      <p className={["text-xs font-bold", form.PROD03_HOME_SECCION === opt.value ? "text-navy" : "text-ink"].join(" ")}>
                        {opt.label}
                      </p>
                      <p className="text-[10px] text-muted">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {form.PROD03_IMAGENES.length > 0 && (
              <div className="rounded-2xl bg-card p-5 shadow-sm">
                <h2 className="mb-3 text-[11px] font-black uppercase tracking-widest text-muted">
                  Imágenes ({form.PROD03_IMAGENES.length})
                </h2>
                <div className="grid grid-cols-3 gap-1.5">
                  {form.PROD03_IMAGENES.slice(0, 6).map((img, i) => (
                    <div key={i} className="aspect-square overflow-hidden rounded-lg border border-line bg-surface">
                      <img src={img.src} alt={img.alt} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
                {form.PROD03_IMAGENES.length > 6 && (
                  <p className="mt-1.5 text-center text-xs text-muted">+{form.PROD03_IMAGENES.length - 6} más</p>
                )}
              </div>
            )}

            {stock.length > 0 && (
              <div className="rounded-2xl bg-card p-5 shadow-sm">
                <h2 className="mb-3 text-[11px] font-black uppercase tracking-widest text-muted">Stock</h2>
                <div className="space-y-1.5">
                  {stock.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-ink">{r.nombre}</span>
                      <span className={["font-bold tabular-nums", Number(r.cantidad) === 0 ? "text-rose-500" : "text-emerald-600"].join(" ")}>
                        {r.cantidad || 0}
                      </span>
                    </div>
                  ))}
                  <div className="mt-2 border-t border-line pt-2 flex justify-between text-xs font-bold">
                    <span className="text-muted">Total</span>
                    <span className="text-ink">{stock.reduce((s, r) => s + (Number(r.cantidad) || 0), 0)} uds</span>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-2xl bg-card p-5 shadow-sm">
              {saveError && (
                <div className="mb-3 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5">
                  <AlertCircle size={14} className="shrink-0 text-rose-500" />
                  <p className="text-xs text-rose-600">{saveError}</p>
                </div>
              )}
              <button type="submit" disabled={saving}
                className="w-full rounded-xl bg-navy py-3 text-sm font-black uppercase tracking-widest text-white shadow-md hover:bg-navy/90 hover:shadow-lg disabled:opacity-60 transition-all active:scale-[0.98]">
                {saving ? "Guardando…" : isEditing ? "Guardar cambios" : "Publicar producto"}
              </button>
              <button type="button" onClick={() => navigate(-1)}
                className="mt-2 w-full rounded-xl border border-line py-2.5 text-sm font-semibold text-muted hover:border-navy/30 hover:text-ink transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

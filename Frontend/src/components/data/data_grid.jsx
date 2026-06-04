import { useMemo, useState } from "react";
import { Eye, Pencil, Search, Trash2 } from "lucide-react";
import Button from "../ui/button";
import { UI_TABLE } from "../styles/ui_table_style";

function getValue(row, key) {
  if (!key) return "";
  return String(
    key.split(".").reduce((acc, part) => acc?.[part], row) ?? ""
  );
}

/*
 * ═══════════════════════════════════════════════════════════════
 * DATA GRID  —  Guía de uso
 * ═══════════════════════════════════════════════════════════════
 *
 * Tabla de datos con búsqueda, ordenamiento y acciones por fila.
 *
 * ── USO BÁSICO ──────────────────────────────────────────────────
 *
 *   interface Usuario { ID: number; NOMBRE: string; ROL: string }
 *
 *   <DataGrid<Usuario>
 *     title="Usuarios"
 *     subtitle="Lista de usuarios del sistema"
 *     rows={usuarios}         ← array de objetos que viene de la API
 *     keyField="ID"           ← campo único por fila (default: "id")
 *     loading={cargando}      ← muestra "Cargando registros..." mientras es true
 *     columns={[
 *       { key: "NOMBRE", label: "Nombre", sortable: true },
 *       { key: "ROL",    label: "Rol" },
 *     ]}
 *   />
 *
 * ── DEFINICIÓN DE COLUMNAS ───────────────────────────────────────
 *
 *   columns={[
 *     {
 *       key:             "NOMBRE",       // campo del objeto (puede ser "a.b.c" para anidados)
 *       label:           "Nombre",       // encabezado de la columna
 *       sortable:        true,           // permite ordenar clickeando el header (↑ ↓)
 *       searchable:      true,           // incluido en la búsqueda global (default: true)
 *       headerClassName: "w-48",        // clases CSS para el <th>
 *       className:       "font-bold",   // clases CSS para cada <td>
 *
 *       // render: personaliza cómo se muestra la celda
 *       render: (row, value) => (
 *         <span className="text-blue-600">{value}</span>
 *       ),
 *     },
 *   ]}
 *
 *   Acceso a campos anidados con dot notation:
 *     key: "persona.nombre"  →  row.persona.nombre
 *
 * ── ACCIONES POR FILA ────────────────────────────────────────────
 *
 *   Opción A — acciones rápidas predefinidas (ver / editar / eliminar):
 *
 *     <DataGrid
 *       showDefaultActions
 *       onView={(row)   => console.log("ver", row)}
 *       onEdit={(row)   => console.log("editar", row)}
 *       onDelete={(row) => console.log("eliminar", row)}
 *     />
 *
 *   Opción B — acciones personalizadas:
 *
 *     import { Download, Lock } from "lucide-react"
 *
 *     actions={[
 *       {
 *         key:     "descargar",
 *         label:   "Descargar",
 *         icon:    Download,
 *         variant: "ghost",
 *         iconOnly: true,
 *         onClick: (row) => descargar(row),
 *       },
 *       {
 *         key:      "bloquear",
 *         label:    "Bloquear",
 *         icon:     Lock,
 *         variant:  "danger",
 *         iconOnly: true,
 *         onClick:  (row) => bloquear(row),
 *         hidden:   (row) => row.BLOQUEADO === true,   // oculta si ya está bloqueado
 *         disabled: (row) => row.ROL === "ADM",        // desactiva para administradores
 *       },
 *     ]}
 *
 *   actionsPosition: "end" (default) | "start"  → columna al final o al inicio
 *
 * ── BÚSQUEDA ────────────────────────────────────────────────────
 *
 *   Por defecto busca en todas las columnas donde searchable !== false.
 *   Para restringir a columnas específicas:
 *
 *     searchColumns={["NOMBRE", "EMAIL"]}
 *
 *   Para deshabilitar la búsqueda:
 *
 *     searchable={false}
 *
 *   Para cambiar el placeholder:
 *
 *     searchPlaceholder="Buscar usuario..."
 *
 * ── MENSAJE SIN DATOS ────────────────────────────────────────────
 *
 *   emptyMessage="No se encontraron usuarios"
 *
 * ── VARIANTES DE RENDERIZADO CUSTOM ─────────────────────────────
 *
 *   // Badge de color según estado
 *   render: (row) => (
 *     <span className={row.ACTIVO ? "text-green-600" : "text-red-500"}>
 *       {row.ACTIVO ? "Activo" : "Inactivo"}
 *     </span>
 *   )
 *
 *   // Fecha formateada
 *   render: (_, value) => new Date(value).toLocaleDateString("es-AR")
 *
 *   // Celda vacía con guión
 *   render: (_, value) => value || "—"
 *
 * ═══════════════════════════════════════════════════════════════
 */
export default function DataGrid({
  title,
  subtitle,
  headerExtra,
  columns = [],
  rows = [],
  keyField = "id",
  loading = false,
  emptyMessage = "No hay registros disponibles",
  searchable = true,
  searchPlaceholder = "Buscar...",
  searchColumns = [],
  actions = [],
  actionsPosition = "end",
  showDefaultActions = false,
  onView,
  onEdit,
  onDelete,
  className = "",
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState(null);

  const finalActions = useMemo(() => {
    if (actions.length > 0) return actions;
    if (!showDefaultActions) return [];

    return [
      onView && { key: "view", label: "Ver", icon: Eye, variant: UI_TABLE.actionVariants.view.variant, onClick: onView },
      onEdit && { key: "edit", label: "Editar", icon: Pencil, variant: UI_TABLE.actionVariants.edit.variant, onClick: onEdit },
      onDelete && { key: "delete", label: "Eliminar", icon: Trash2, variant: UI_TABLE.actionVariants.delete.variant, onClick: onDelete },
    ].filter(Boolean);
  }, [actions, showDefaultActions, onView, onEdit, onDelete]);

  const activeSearchColumns = useMemo(() => {
    if (searchColumns.length > 0) return searchColumns;
    return columns.filter((c) => c.searchable !== false).map((c) => c.key);
  }, [columns, searchColumns]);

  const filteredRows = useMemo(() => {
    let result = rows;

    if (query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter((row) =>
        activeSearchColumns.some((key) => getValue(row, key).toLowerCase().includes(q))
      );
    }

    if (sortKey && sortDir) {
      result = [...result].sort((a, b) => {
        const aVal = getValue(a, sortKey);
        const bVal = getValue(b, sortKey);
        const cmp = aVal.localeCompare(bVal, undefined, { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [rows, query, activeSearchColumns, sortKey, sortDir]);

  function handleSort(key) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortKey(null);
      setSortDir(null);
    }
  }

  function renderActions(row) {
    if (finalActions.length === 0) return null;

    return (
      <td className={UI_TABLE.actionsCell}>
        <div className={UI_TABLE.actionsWrap}>
          {finalActions.map((action) => {
            if (action.hidden?.(row)) return null;

            return (
              <Button
                key={action.key ?? action.label}
                type="button"
                variant={action.variant ?? "ghost"}
                size="sm"
                icon={action.icon}
                iconOnly={action.iconOnly ?? true}
                label={action.label}
                ariaLabel={action.label}
                onClick={() => action.onClick?.(row)}
                disabled={action.disabled?.(row)}
                className={action.className ?? ""}
              />
            );
          })}
        </div>
      </td>
    );
  }

  const colSpan = columns.length + (finalActions.length > 0 ? 1 : 0);

  return (
    <section className={[UI_TABLE.wrap, className].join(" ")}>
      {(title || subtitle || searchable || headerExtra) && (
        <div className={UI_TABLE.header}>
          <div className={UI_TABLE.titleBox}>
            {title && <h3 className={UI_TABLE.title}>{title}</h3>}
            {subtitle && <p className={UI_TABLE.subtitle}>{subtitle}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {headerExtra}

            {searchable && (
              <div className={UI_TABLE.searchWrap}>
                <Search size={16} className="text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  autoComplete="off"
                  className={UI_TABLE.searchInput}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <div className={UI_TABLE.tableWrap}>
        <table className={UI_TABLE.table}>
          <thead className={UI_TABLE.thead}>
            <tr>
              {finalActions.length > 0 && actionsPosition === "start" && (
                <th className={UI_TABLE.th}>Acciones</th>
              )}

              {columns.map((col) => (
                <th
                  key={col.key}
                  className={[
                    UI_TABLE.th,
                    col.sortable ? "cursor-pointer select-none" : "",
                    col.headerClassName ?? "",
                  ].join(" ")}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>
                  )}
                </th>
              ))}

              {finalActions.length > 0 && actionsPosition === "end" && (
                <th className={UI_TABLE.th}>Acciones</th>
              )}
            </tr>
          </thead>

          <tbody className={UI_TABLE.tbody}>
            {loading ? (
              <tr>
                <td colSpan={colSpan} className={UI_TABLE.loading}>
                  Cargando registros...
                </td>
              </tr>
            ) : filteredRows.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className={UI_TABLE.empty}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              filteredRows.map((row, rowIndex) => (
                <tr key={String(row[keyField] ?? rowIndex)} className={UI_TABLE.tr}>
                  {finalActions.length > 0 && actionsPosition === "start" && renderActions(row)}

                  {columns.map((col) => {
                    const val = getValue(row, col.key);
                    return (
                      <td
                        key={col.key}
                        className={[UI_TABLE.td, col.className ?? ""].join(" ")}
                      >
                        {col.render
                          ? col.render(row, val)
                          : val || <span className={UI_TABLE.tdMuted}>—</span>}
                      </td>
                    );
                  })}

                  {finalActions.length > 0 && actionsPosition === "end" && renderActions(row)}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={UI_TABLE.footer}>
        <span>Total: {filteredRows.length}</span>
        {query && <span>Filtro activo</span>}
      </div>
    </section>
  );
}

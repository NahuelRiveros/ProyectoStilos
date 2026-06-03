import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Search, FolderTree } from "lucide-react";
import type { KeyboardEvent } from "react";
import { UI_TREE } from "../styles/ui_tree_style";

interface RawNode {
  [key: string]: unknown;
}

interface NormalizedNode {
  _id: unknown;
  _label: string;
  _subtitle: string | null;
  _level: number;
  _children: NormalizedNode[];
  [key: string]: unknown;
}

interface TreeSelectorChangeEvent {
  name?: string;
  value: unknown;
  node: NormalizedNode;
}

interface TreeSelectorProps {
  label?: string;
  name?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  data?: RawNode[];
  value?: unknown;
  onChange?: (event: TreeSelectorChangeEvent) => void;
  levels?: string[];
  idKey?: string;
  labelKey?: string;
  childrenKey?: string;
  subtitleKey?: string;
  searchable?: boolean;
  placeholder?: string;
  emptyMessage?: string;
  collapseOnSelect?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  className?: string;
  wrapperClassName?: string;
}

interface TreeNodeProps {
  node: NormalizedNode;
  selectedId: unknown;
  expanded: Record<string, boolean>;
  onToggle: (id: string) => void;
  onSelect: (node: NormalizedNode) => void;
  levels?: string[];
}

function normalizeNode({
  node,
  idKey,
  labelKey,
  childrenKey,
  subtitleKey,
  level = 0,
}: {
  node: RawNode;
  idKey: string;
  labelKey: string;
  childrenKey: string;
  subtitleKey?: string;
  level?: number;
}): NormalizedNode {
  const children = (node[childrenKey] as RawNode[] | undefined) ?? [];
  return {
    ...node,
    _id: node[idKey],
    _label: String(node[labelKey] ?? ""),
    _subtitle: subtitleKey ? String(node[subtitleKey] ?? "") : null,
    _level: level,
    _children: children.map((child) =>
      normalizeNode({ node: child, idKey, labelKey, childrenKey, subtitleKey, level: level + 1 })
    ),
  };
}

function filterTree(nodes: NormalizedNode[], query: string): NormalizedNode[] {
  if (!query) return nodes;

  const q = query.toLowerCase().trim();

  return nodes
    .map((node) => {
      const children = filterTree(node._children, q);
      const match =
        node._label.toLowerCase().includes(q) ||
        (node._subtitle ?? "").toLowerCase().includes(q);

      if (match || children.length > 0) return { ...node, _children: children };
      return null;
    })
    .filter((n): n is NormalizedNode => n !== null);
}

function TreeNode({ node, selectedId, expanded, onToggle, onSelect, levels }: TreeNodeProps) {
  const hasChildren = node._children.length > 0;
  const isOpen = expanded[String(node._id)];
  const isSelected = selectedId === node._id;
  const levelLabel = levels?.[node._level];

  return (
    <div>
      <button
        type="button"
        onClick={() => onSelect(node)}
        className={[
          UI_TREE.row,
          isSelected ? UI_TREE.rowSelected : UI_TREE.rowDefault,
        ].join(" ")}
      >
        {hasChildren ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(String(node._id));
            }}
            onKeyDown={(e: KeyboardEvent<HTMLSpanElement>) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onToggle(String(node._id));
              }
            }}
            className={[
              UI_TREE.toggle,
              isSelected ? UI_TREE.toggleSelected : UI_TREE.toggleDefault,
            ].join(" ")}
          >
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        ) : (
          <span className={UI_TREE.togglePlaceholder} />
        )}

        <FolderTree className={UI_TREE.icon} />

        <span className={UI_TREE.content}>
          <span className={UI_TREE.title}>{node._label}</span>
          {node._subtitle && (
            <span className={UI_TREE.subtitle}>{node._subtitle}</span>
          )}
        </span>

        {levelLabel && (
          <span
            className={[
              UI_TREE.levelBadge,
              isSelected ? UI_TREE.levelBadgeSelected : "",
            ].join(" ")}
          >
            {levelLabel}
          </span>
        )}
      </button>

      {hasChildren && isOpen && (
        <div className={UI_TREE.children}>
          {node._children.map((child) => (
            <TreeNode
              key={String(child._id)}
              node={child}
              selectedId={selectedId}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
              levels={levels}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/*
 * ═══════════════════════════════════════════════════════════════
 * TREE SELECTOR  —  Guía de uso
 * ═══════════════════════════════════════════════════════════════
 *
 * Selector jerárquico en forma de árbol expandible/colapsable.
 * Ideal para ubicaciones, categorías, organigramas, etc.
 *
 * ── ESTRUCTURA DE DATOS ESPERADA ────────────────────────────────
 *
 *   El array que pasás en "data" debe tener este formato anidado:
 *
 *   [
 *     {
 *       id: 1,
 *       nombre: "Argentina",
 *       hijos: [
 *         { id: 10, nombre: "Córdoba", hijos: [] },
 *         { id: 11, nombre: "Buenos Aires", hijos: [] },
 *       ],
 *     },
 *   ]
 *
 *   Luego le indicás al componente cómo se llaman tus campos:
 *
 *     idKey="id"           ← campo que identifica cada nodo (default: "id")
 *     labelKey="nombre"    ← campo que se muestra como texto (default: "label")
 *     childrenKey="hijos"  ← campo con el array de hijos (default: "children")
 *
 * ── USO BÁSICO ──────────────────────────────────────────────────
 *
 *   const [ubicacionId, setUbicacionId] = useState<unknown>(null)
 *
 *   <TreeSelector
 *     label="Ubicación"
 *     data={ubicaciones}
 *     idKey="ID_ZONUBIC01"
 *     labelKey="ZONUBIC01_DESCRI"
 *     childrenKey="hijos"
 *     value={ubicacionId}
 *     onChange={({ value }) => setUbicacionId(value)}
 *   />
 *
 *   El evento onChange devuelve: { name, value, node }
 *     value → el _id del nodo seleccionado (el que guardarías en la BD)
 *     node  → el objeto completo del nodo (si necesitás más datos)
 *
 * ── ETIQUETAS POR NIVEL (levels) ────────────────────────────────
 *
 *   Muestra un badge al costado de cada nodo indicando su nivel.
 *   El índice del array corresponde al nivel de profundidad (0, 1, 2…):
 *
 *     levels={["País", "Provincia", "Ciudad"]}
 *
 *   Nivel 0 → "País"     Nivel 1 → "Provincia"    Nivel 2 → "Ciudad"
 *
 * ── SUBTÍTULO POR NODO ───────────────────────────────────────────
 *
 *   Muestra una segunda línea de texto más pequeña bajo el label:
 *
 *     subtitleKey="CODIGO_POSTAL"
 *
 * ── INTEGRACIÓN CON FORM (sin react-hook-form nativo) ───────────
 *
 *   El componente es controlado (no usa register).
 *   Guardá el valor en estado y pasalo al form manualmente:
 *
 *   const [ubic, setUbic] = useState<unknown>(null)
 *
 *   async function onSubmit(data: MiForm) {
 *     const payload = { ...data, ubicacion_id: ubic }
 *     await guardar(payload)
 *   }
 *
 *   // En el JSX:
 *   <TreeSelector
 *     label="Ubicación"
 *     required
 *     error={!ubic ? "Seleccioná una ubicación" : undefined}
 *     data={ubicaciones}
 *     idKey="ID"
 *     labelKey="NOMBRE"
 *     childrenKey="HIJOS"
 *     value={ubic}
 *     onChange={({ value }) => setUbic(value)}
 *   />
 *
 * ── COMPORTAMIENTO AL SELECCIONAR ───────────────────────────────
 *
 *   collapseOnSelect={true}   → colapsa el árbol y limpia la búsqueda (default)
 *   collapseOnSelect={false}  → el árbol queda abierto tras seleccionar
 *
 * ── BÚSQUEDA ────────────────────────────────────────────────────
 *
 *   searchable={true}           → barra de búsqueda visible (default)
 *   searchable={false}          → sin barra de búsqueda
 *   placeholder="Buscar zona…"  → texto del input de búsqueda
 *
 *   La búsqueda filtra por label Y subtítulo en todos los niveles.
 *   Los nodos padre se mantienen visibles si algún hijo coincide.
 *
 * ── OTROS FLAGS ÚTILES ───────────────────────────────────────────
 *
 *   required      → agrega * al label
 *   error="Msg"   → muestra texto de error en rojo debajo
 *   helperText="" → muestra texto de ayuda gris debajo
 *   disabled      → árbol visible pero no interactuable
 *   hidden        → no renderiza nada
 *
 * ═══════════════════════════════════════════════════════════════
 */
export default function TreeSelector({
  label,
  name,
  required = false,
  error,
  helperText,
  data = [],
  value,
  onChange,
  levels = [],
  idKey = "id",
  labelKey = "label",
  childrenKey = "children",
  subtitleKey,
  searchable = true,
  placeholder = "Buscar...",
  emptyMessage = "No hay opciones disponibles",
  collapseOnSelect = true,
  disabled = false,
  hidden = false,
  className = "",
  wrapperClassName = "",
}: TreeSelectorProps) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const normalizedData = useMemo(
    () => data.map((node) => normalizeNode({ node, idKey, labelKey, childrenKey, subtitleKey })),
    [data, idKey, labelKey, childrenKey, subtitleKey]
  );

  const filteredData = useMemo(
    () => filterTree(normalizedData, query),
    [normalizedData, query]
  );

  const selectedNode = useMemo(() => {
    let found: NormalizedNode | null = null;

    function walk(nodes: NormalizedNode[]) {
      for (const node of nodes) {
        if (node._id === value) { found = node; return; }
        if (node._children.length) walk(node._children);
      }
    }

    walk(normalizedData);
    return found;
  }, [normalizedData, value]);

  function toggleNode(id: string) {
    if (disabled) return;
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function selectNode(node: NormalizedNode) {
    if (disabled) return;
    onChange?.({ name, value: node._id, node });
    if (collapseOnSelect) { setExpanded({}); setQuery(""); }
  }

  if (hidden) return null;

  const message = error ?? helperText;

  return (
    <div className={[UI_TREE.fieldWrap, wrapperClassName].join(" ")}>
      {label && (
        <label className={UI_TREE.label}>
          {label}
          {required && <span className={UI_TREE.requiredMark}>*</span>}
        </label>
      )}

      <div
        className={[
          UI_TREE.shell,
          disabled ? "pointer-events-none opacity-60" : "",
          className,
        ].join(" ")}
      >
        {searchable && (
          <div className={UI_TREE.searchBox}>
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className={UI_TREE.searchInput}
            />
          </div>
        )}

        <div className={UI_TREE.tree}>
          {filteredData.length > 0 ? (
            filteredData.map((node) => (
              <TreeNode
                key={String(node._id)}
                node={node}
                selectedId={value}
                expanded={expanded}
                onToggle={toggleNode}
                onSelect={selectNode}
                levels={levels}
              />
            ))
          ) : (
            <div className={UI_TREE.empty}>{emptyMessage}</div>
          )}
        </div>

        {selectedNode && (
          <div className={UI_TREE.footer}>
            Seleccionado:{" "}
            <span className={UI_TREE.selectedValue}>
              {(selectedNode as NormalizedNode)._label}
            </span>
          </div>
        )}
      </div>

      {message && (
        <p className={error ? UI_TREE.errorText : UI_TREE.helperText}>{message}</p>
      )}
    </div>
  );
}

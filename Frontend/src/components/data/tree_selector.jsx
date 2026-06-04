import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Search, FolderTree } from "lucide-react";
import { UI_TREE } from "../styles/ui_tree_style";
function normalizeNode({
  node,
  idKey,
  labelKey,
  childrenKey,
  subtitleKey,
  level = 0
}) {
  const children = node[childrenKey] ?? [];
  return {
    ...node,
    _id: node[idKey],
    _label: String(node[labelKey] ?? ""),
    _subtitle: subtitleKey ? String(node[subtitleKey] ?? "") : null,
    _level: level,
    _children: children.map(
      (child) => normalizeNode({ node: child, idKey, labelKey, childrenKey, subtitleKey, level: level + 1 })
    )
  };
}
function filterTree(nodes, query) {
  if (!query) return nodes;
  const q = query.toLowerCase().trim();
  return nodes.map((node) => {
    const children = filterTree(node._children, q);
    const match = node._label.toLowerCase().includes(q) || (node._subtitle ?? "").toLowerCase().includes(q);
    if (match || children.length > 0) return { ...node, _children: children };
    return null;
  }).filter((n) => n !== null);
}
function TreeNode({ node, selectedId, expanded, onToggle, onSelect, levels }) {
  const hasChildren = node._children.length > 0;
  const isOpen = expanded[String(node._id)];
  const isSelected = selectedId === node._id;
  const levelLabel = levels?.[node._level];
  return <div>
      <button
    type="button"
    onClick={() => onSelect(node)}
    className={[
      UI_TREE.row,
      isSelected ? UI_TREE.rowSelected : UI_TREE.rowDefault
    ].join(" ")}
  >
        {hasChildren ? <span
    role="button"
    tabIndex={0}
    onClick={(e) => {
      e.stopPropagation();
      onToggle(String(node._id));
    }}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        onToggle(String(node._id));
      }
    }}
    className={[
      UI_TREE.toggle,
      isSelected ? UI_TREE.toggleSelected : UI_TREE.toggleDefault
    ].join(" ")}
  >
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span> : <span className={UI_TREE.togglePlaceholder} />}

        <FolderTree className={UI_TREE.icon} />

        <span className={UI_TREE.content}>
          <span className={UI_TREE.title}>{node._label}</span>
          {node._subtitle && <span className={UI_TREE.subtitle}>{node._subtitle}</span>}
        </span>

        {levelLabel && <span
    className={[
      UI_TREE.levelBadge,
      isSelected ? UI_TREE.levelBadgeSelected : ""
    ].join(" ")}
  >
            {levelLabel}
          </span>}
      </button>

      {hasChildren && isOpen && <div className={UI_TREE.children}>
          {node._children.map((child) => <TreeNode
    key={String(child._id)}
    node={child}
    selectedId={selectedId}
    expanded={expanded}
    onToggle={onToggle}
    onSelect={onSelect}
    levels={levels}
  />)}
        </div>}
    </div>;
}
function TreeSelector({
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
  wrapperClassName = ""
}) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState({});
  const normalizedData = useMemo(
    () => data.map((node) => normalizeNode({ node, idKey, labelKey, childrenKey, subtitleKey })),
    [data, idKey, labelKey, childrenKey, subtitleKey]
  );
  const filteredData = useMemo(
    () => filterTree(normalizedData, query),
    [normalizedData, query]
  );
  const selectedNode = useMemo(() => {
    let found = null;
    function walk(nodes) {
      for (const node of nodes) {
        if (node._id === value) {
          found = node;
          return;
        }
        if (node._children.length) walk(node._children);
      }
    }
    walk(normalizedData);
    return found;
  }, [normalizedData, value]);
  function toggleNode(id) {
    if (disabled) return;
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }
  function selectNode(node) {
    if (disabled) return;
    onChange?.({ name, value: node._id, node });
    if (collapseOnSelect) {
      setExpanded({});
      setQuery("");
    }
  }
  if (hidden) return null;
  const message = error ?? helperText;
  return <div className={[UI_TREE.fieldWrap, wrapperClassName].join(" ")}>
      {label && <label className={UI_TREE.label}>
          {label}
          {required && <span className={UI_TREE.requiredMark}>*</span>}
        </label>}

      <div
    className={[
      UI_TREE.shell,
      disabled ? "pointer-events-none opacity-60" : "",
      className
    ].join(" ")}
  >
        {searchable && <div className={UI_TREE.searchBox}>
            <Search size={16} className="text-slate-400" />
            <input
    type="text"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    placeholder={placeholder}
    className={UI_TREE.searchInput}
  />
          </div>}

        <div className={UI_TREE.tree}>
          {filteredData.length > 0 ? filteredData.map((node) => <TreeNode
    key={String(node._id)}
    node={node}
    selectedId={value}
    expanded={expanded}
    onToggle={toggleNode}
    onSelect={selectNode}
    levels={levels}
  />) : <div className={UI_TREE.empty}>{emptyMessage}</div>}
        </div>

        {selectedNode && <div className={UI_TREE.footer}>
            Seleccionado:{" "}
            <span className={UI_TREE.selectedValue}>
              {selectedNode._label}
            </span>
          </div>}
      </div>

      {message && <p className={error ? UI_TREE.errorText : UI_TREE.helperText}>{message}</p>}
    </div>;
}
export {
  TreeSelector as default
};

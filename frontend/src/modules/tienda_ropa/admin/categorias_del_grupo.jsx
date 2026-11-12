import { useLista } from "../hooks/use_ropa.js";

const aplanar = (nodos, nivel = 0) => nodos.flatMap((n) => [{ ...n, nivel }, ...aplanar(n.hijas ?? [], nivel + 1)]);

/** ROP-59: en qué categorías se usa un grupo de características. Guarda ids en el campo "categorias". */
export default function CategoriasDelGrupo({ watch, setValue }) {
  const categorias = useLista("categorias");
  const elegidas = new Set(watch("categorias") ?? []);

  function alternar(id) {
    const nuevas = new Set(elegidas);
    if (nuevas.has(id)) nuevas.delete(id); else nuevas.add(id);
    setValue("categorias", [...nuevas], { shouldDirty: true });
  }

  return (
    <fieldset>
      <legend className="text-sm font-semibold text-gray-700">Se usa en</legend>
      <p className="mb-2 text-xs text-gray-500">
        {elegidas.size ? `${elegidas.size} ${elegidas.size === 1 ? "categoría" : "categorías"} (y las de adentro).` : "Todas las categorías. Tildá algunas para que solo aparezca al cargar esas prendas."}
      </p>
      {categorias.isPending ? <p className="text-sm text-gray-500">Cargando categorías…</p>
        : categorias.isError ? <p className="text-sm text-red-600">No se pudieron cargar las categorías.</p>
        : (
          <div className="max-h-60 overflow-y-auto rounded-xl border border-gray-200 p-2">
            {aplanar(categorias.data).map((c) => (
              <label key={c.id} className="flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm hover:bg-slate-50" style={{ paddingLeft: `${0.5 + c.nivel * 1.25}rem` }}>
                <input type="checkbox" checked={elegidas.has(c.id)} onChange={() => alternar(c.id)} className="h-5 w-5" />
                {c.nombre}
              </label>
            ))}
          </div>
        )}
    </fieldset>
  );
}

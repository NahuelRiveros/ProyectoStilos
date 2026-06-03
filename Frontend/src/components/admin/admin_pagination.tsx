interface AdminPaginationProps {
  pagina:    number;
  totalPags: number;
  onPrev:    () => void;
  onNext:    () => void;
}

export function AdminPagination({ pagina, totalPags, onPrev, onNext }: AdminPaginationProps) {
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-muted">
      <span>Página {pagina} de {totalPags}</span>
      <div className="flex gap-2">
        <button
          disabled={pagina <= 1}
          onClick={onPrev}
          className="rounded-lg border border-line px-3 py-1.5 transition-colors disabled:opacity-40 hover:border-navy"
        >
          Anterior
        </button>
        <button
          disabled={pagina >= totalPags}
          onClick={onNext}
          className="rounded-lg border border-line px-3 py-1.5 transition-colors disabled:opacity-40 hover:border-navy"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

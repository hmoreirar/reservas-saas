import Button from "./Button";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, total, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return (
    <p className="text-sm text-text-muted">{total} reserva{total !== 1 ? "s" : ""}</p>
  );

  return (
    <div className="flex items-center justify-between pt-2">
      <p className="text-sm text-text-muted">{total} reserva{total !== 1 ? "s" : ""}</p>
      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          &larr; Anterior
        </Button>
        <span className="text-sm text-text-secondary">{page} / {totalPages}</span>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Siguiente &rarr;
        </Button>
      </div>
    </div>
  );
}

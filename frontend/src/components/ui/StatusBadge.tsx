const STATUS_DOTS: Record<string, { label: string; dot: string }> = {
  pending: { label: "Pendiente", dot: "bg-warning" },
  confirmed: { label: "Confirmada", dot: "bg-accent" },
  completed: { label: "Completada", dot: "bg-info" },
  cancelled: { label: "Cancelada", dot: "bg-danger" },
  "no-show": { label: "No asistio", dot: "bg-text-muted" },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const st = STATUS_DOTS[status] || { label: status, dot: "bg-text-muted" };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs text-text-secondary ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
      {st.label}
    </span>
  );
}

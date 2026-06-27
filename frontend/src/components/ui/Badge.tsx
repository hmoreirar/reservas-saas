interface BadgeProps {
  count: number;
  variant?: "accent" | "danger" | "warning";
}

const variantStyles: Record<string, string> = {
  accent: "bg-accent text-accent-text",
  danger: "bg-danger text-white",
  warning: "bg-warning text-white",
};

export default function Badge({ count, variant = "accent" }: BadgeProps) {
  if (count <= 0) return null;
  return (
    <span className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold leading-none ${variantStyles[variant]}`}>
      {count > 99 ? "99+" : count}
    </span>
  );
}

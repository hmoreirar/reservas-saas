import type { ReactNode } from "react";

type AlertVariant = "error" | "success" | "warning" | "info";

interface AlertProps {
  variant: AlertVariant;
  children: ReactNode;
}

const variantStyles: Record<AlertVariant, { border: string; text: string; bg: string }> = {
  error: { border: "border-l-danger", text: "text-danger", bg: "bg-danger-bg" },
  success: { border: "border-l-accent", text: "text-accent-text", bg: "bg-accent-bg" },
  warning: { border: "border-l-warning", text: "text-warning", bg: "bg-warning-bg" },
  info: { border: "border-l-info", text: "text-info", bg: "bg-info-bg" },
};

export default function Alert({ variant, children }: AlertProps) {
  const styles = variantStyles[variant];
  return (
    <div className={`mb-4 border-l-4 px-4 py-3 text-sm ${styles.border} ${styles.text} ${styles.bg}`}>
      {children}
    </div>
  );
}

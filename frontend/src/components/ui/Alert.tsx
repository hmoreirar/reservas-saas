import type { ReactNode } from "react";

type AlertVariant = "error" | "success";

interface AlertProps {
  variant?: AlertVariant;
  children: ReactNode;
}

const styles: Record<AlertVariant, string> = {
  error: "bg-red-100 text-red-700 border-red-200 border-l-4 border-l-red-500",
  success: "bg-green-100 text-green-700 border-green-200 border-l-4 border-l-green-500",
};

export default function Alert({ variant = "error", children }: AlertProps) {
  return (
    <div className={`animate-slide-up mb-4 rounded-lg border px-4 py-3 text-sm ${styles[variant]}`}>
      {children}
    </div>
  );
}

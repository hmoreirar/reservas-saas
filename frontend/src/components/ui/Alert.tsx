import type { ReactNode } from "react";

type AlertVariant = "error" | "success";

interface AlertProps {
  variant?: AlertVariant;
  children: ReactNode;
}

export default function Alert({ variant = "error", children }: AlertProps) {
  return (
    <div
      className={`border-l-4 px-4 py-3 text-sm ${
        variant === "error"
          ? "border-l-danger text-danger"
          : "border-l-accent text-accent-text"
      }`}
    >
      {children}
    </div>
  );
}

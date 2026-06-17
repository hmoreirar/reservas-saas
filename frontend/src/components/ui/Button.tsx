import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary: "bg-accent text-white hover:bg-accent-hover disabled:bg-border",
  secondary: "text-text-secondary hover:text-text",
  danger: "text-danger hover:text-danger-hover",
  ghost: "text-text-muted hover:text-text",
};

export default function Button({
  variant = "primary",
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150 disabled:cursor-not-allowed cursor-pointer ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

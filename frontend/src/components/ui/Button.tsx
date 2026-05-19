import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary: "bg-amber-500 text-white hover:bg-amber-600 disabled:bg-stone-400",
  secondary: "bg-stone-200 text-stone-800 hover:bg-stone-300",
  danger: "bg-orange-500 text-white hover:bg-orange-600",
  ghost: "bg-transparent text-stone-600 hover:bg-stone-100",
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
      className={`
        inline-flex items-center justify-center rounded-lg px-4 py-2.5
        text-sm font-medium transition-all duration-200
        disabled:cursor-not-allowed cursor-pointer
        ${variantStyles[variant]}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

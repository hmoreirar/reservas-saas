import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary: "bg-indigo-500 text-white hover:bg-indigo-600 disabled:bg-gray-400",
  secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  danger: "bg-red-500 text-white hover:bg-red-600",
  ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
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

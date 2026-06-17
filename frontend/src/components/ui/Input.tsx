import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Input({ label, className = "", ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-text">
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-lg border border-border px-3 py-2.5 text-sm text-text transition-colors placeholder:text-text-muted focus:border-accent focus:outline-none ${className}`}
        {...props}
      />
    </div>
  );
}

import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Input({ label, className = "", ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-stone-700">
          {label}
        </label>
      )}
      <input
        className={`
          w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm
          placeholder-stone-400 transition-colors
          focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200
          ${className}
        `}
        {...props}
      />
    </div>
  );
}

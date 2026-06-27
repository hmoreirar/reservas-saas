import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function Input({ label, error, helperText, className = "", id: externalId, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = externalId || generatedId;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-text">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={errorId}
        className={`w-full rounded-lg border px-3 py-2.5 text-sm text-text transition-colors placeholder:text-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
          error
            ? "border-danger focus-visible:ring-danger"
            : "border-border focus:border-accent"
        } ${className}`}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-xs text-text-muted">{helperText}</p>
      )}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

Input.Textarea = function Textarea({ label, error, className = "", id: externalId, ...props }: TextareaProps) {
  const generatedId = useId();
  const textareaId = externalId || generatedId;
  const errorId = error ? `${textareaId}-error` : undefined;

  return (
    <div>
      {label && (
        <label htmlFor={textareaId} className="mb-1.5 block text-sm font-medium text-text">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={errorId}
        className={`w-full rounded-lg border px-3 py-2.5 text-sm text-text transition-colors placeholder:text-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
          error
            ? "border-danger focus-visible:ring-danger"
            : "border-border focus:border-accent"
        } min-h-[80px] resize-y ${className}`}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

Input.Select = function Select({ label, error, options, placeholder, className = "", id: externalId, ...props }: SelectProps) {
  const generatedId = useId();
  const selectId = externalId || generatedId;
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <div>
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-text">
          {label}
        </label>
      )}
      <select
        id={selectId}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={errorId}
        className={`w-full rounded-lg border px-3 py-2.5 text-sm text-text transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
          error
            ? "border-danger focus-visible:ring-danger"
            : "border-border focus:border-accent"
        } ${className}`}
        {...props}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && (
        <p id={errorId} className="mt-1 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
}

Input.Checkbox = function Checkbox({ label, className = "", id: externalId, ...props }: CheckboxProps) {
  const generatedId = useId();
  const checkboxId = externalId || generatedId;

  return (
    <label htmlFor={checkboxId} className={`flex cursor-pointer items-center gap-2 text-sm text-text ${className}`}>
      <input
        id={checkboxId}
        type="checkbox"
        className="h-4 w-4 cursor-pointer rounded border-border accent-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        {...props}
      />
      {label}
    </label>
  );
};

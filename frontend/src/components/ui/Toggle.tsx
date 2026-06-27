import { useId } from "react";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

export default function Toggle({ checked, onChange, label, description }: ToggleProps) {
  const id = useId();

  return (
    <label htmlFor={id} className="flex cursor-pointer items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-text">{label}</p>
        {description && (
          <p className="text-xs text-text-muted">{description}</p>
        )}
      </div>
      <div className="relative">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <div className="h-6 w-11 rounded-full border-2 border-border bg-surface transition-colors peer-checked:border-accent peer-checked:bg-accent peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2" />
        <div className="pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-text shadow-sm transition-all peer-checked:translate-x-5 peer-checked:bg-white" />
      </div>
    </label>
  );
}

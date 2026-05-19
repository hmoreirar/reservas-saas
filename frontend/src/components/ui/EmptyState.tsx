import type { ReactNode } from "react";

interface EmptyStateProps {
  variant: "services" | "bookings" | "slots";
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

const icons: Record<EmptyStateProps["variant"], ReactNode> = {
  services: (
    <svg className="h-16 w-16 text-stone-300" fill="none" viewBox="0 0 64 64" stroke="currentColor" strokeWidth={1}>
      <rect x="8" y="12" width="48" height="44" rx="6" />
      <path d="M8 24h48" />
      <circle cx="32" cy="36" r="4" />
      <circle cx="32" cy="36" r="8" strokeWidth={0.8} />
    </svg>
  ),
  bookings: (
    <svg className="h-16 w-16 text-stone-300" fill="none" viewBox="0 0 64 64" stroke="currentColor" strokeWidth={1}>
      <rect x="8" y="8" width="48" height="48" rx="6" />
      <path d="M16 8v8M48 8v8M8 24h48" />
      <circle cx="24" cy="38" r="2" />
      <circle cx="34" cy="38" r="2" />
      <circle cx="44" cy="38" r="2" />
    </svg>
  ),
  slots: (
    <svg className="h-16 w-16 text-stone-300" fill="none" viewBox="0 0 64 64" stroke="currentColor" strokeWidth={1}>
      <circle cx="32" cy="32" r="24" />
      <path d="M32 20v12h10" strokeLinecap="round" />
      <circle cx="32" cy="32" r="3" fill="currentColor" stroke="none" opacity={0.3} />
    </svg>
  ),
};

export default function EmptyState({ variant, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      {icons[variant]}
      <div>
        <h3 className="text-base font-semibold text-stone-600">{title}</h3>
        <p className="mt-1 text-sm text-stone-400">{description}</p>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 cursor-pointer rounded-lg bg-amber-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-600"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

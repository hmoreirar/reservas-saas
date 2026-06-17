interface EmptyStateProps {
  variant: "services" | "bookings" | "slots";
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <div>
        <h3 className="text-base font-semibold text-text">{title}</h3>
        <p className="mt-1.5 text-sm text-text-secondary">{description}</p>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="cursor-pointer text-sm font-medium text-accent hover:text-accent-hover"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

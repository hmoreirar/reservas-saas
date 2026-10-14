import { useState } from "react";

export interface MenuItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
}

// Acciones secundarias tras "···": la pantalla solo muestra las
// acciones principales para no abrumar al usuario.
export default function OverflowMenu({ items }: { items: MenuItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Mas acciones"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="cursor-pointer rounded-md px-2 py-1.5 text-text-muted transition-colors hover:bg-accent-bg hover:text-text"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="19" cy="12" r="1.8" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 min-w-[180px] rounded-lg border border-border bg-surface py-1 shadow-md">
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
                className={`block w-full cursor-pointer px-4 py-2 text-left text-sm transition-colors hover:bg-accent-bg ${
                  item.danger ? "text-danger" : "text-text"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

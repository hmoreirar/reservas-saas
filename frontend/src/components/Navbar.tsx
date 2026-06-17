import { useState } from "react";
import Logo from "./ui/Logo";

interface NavbarProps {
  view: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  pendingCount?: number;
}

export default function Navbar({ view, onViewChange, onLogout, pendingCount = 0 }: NavbarProps) {
  const [open, setOpen] = useState(false);

  const linkClass = (v: string) =>
    `cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
      view === v
        ? "text-accent"
        : "text-text-secondary hover:text-text"
    }`;

  const badge = pendingCount > 0 && (
    <span className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-white">
      {pendingCount}
    </span>
  );

  return (
    <nav className="flex items-center justify-between border-b border-border bg-bg px-4 py-4 md:px-10">
      <Logo />
      <button
        className="cursor-pointer md:hidden"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
      >
        <svg className="h-6 w-6 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {open ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>
      <div className="hidden items-center gap-5 md:flex">
        <button onClick={() => onViewChange("dashboard")} className={linkClass("dashboard")}>
          Dashboard
        </button>
        <button onClick={() => onViewChange("bookings")} className={linkClass("bookings")}>
          Mis Reservas{badge}
        </button>
        <button onClick={onLogout} className="cursor-pointer text-sm text-text-muted hover:text-text">
          Cerrar Sesion
        </button>
      </div>
      {open && (
        <div className="absolute left-0 top-16 z-40 flex w-full flex-col gap-2 border-b border-border bg-bg p-4 md:hidden">
          <button onClick={() => { onViewChange("dashboard"); setOpen(false); }} className={linkClass("dashboard")}>
            Dashboard
          </button>
          <button onClick={() => { onViewChange("bookings"); setOpen(false); }} className={linkClass("bookings")}>
            Mis Reservas{badge}
          </button>
          <button onClick={onLogout} className="cursor-pointer text-left text-sm text-text-muted hover:text-text">
            Cerrar Sesion
          </button>
        </div>
      )}
    </nav>
  );
}

import { useState } from "react";
import Button from "./ui/Button";
import Logo from "./ui/Logo";

interface NavbarProps {
  view: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}

export default function Navbar({ view, onViewChange, onLogout }: NavbarProps) {
  const [open, setOpen] = useState(false);

  const linkClass = (v: string) =>
    `cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
      view === v
        ? "border-2 border-amber-500 text-amber-500"
        : "border-none text-stone-500 hover:text-stone-700"
    }`;

  return (
    <nav className="flex items-center justify-between bg-white px-4 py-4 shadow-sm md:px-10">
      <Logo />
      <button
        className="cursor-pointer md:hidden"
        onClick={() => setOpen(!open)}
        aria-label="Menú"
      >
        <svg className="h-6 w-6 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
          Mis Reservas
        </button>
        <Button variant="danger" onClick={onLogout}>
          Cerrar Sesión
        </Button>
      </div>
      {open && (
        <div className="absolute left-0 top-16 z-40 flex w-full flex-col gap-2 border-t border-stone-200 bg-white p-4 shadow-lg md:hidden">
          <button onClick={() => { onViewChange("dashboard"); setOpen(false); }} className={linkClass("dashboard")}>
            Dashboard
          </button>
          <button onClick={() => { onViewChange("bookings"); setOpen(false); }} className={linkClass("bookings")}>
            Mis Reservas
          </button>
          <Button variant="danger" onClick={onLogout}>
            Cerrar Sesión
          </Button>
        </div>
      )}
    </nav>
  );
}

import Button from "./ui/Button";

interface NavbarProps {
  view: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}

export default function Navbar({ view, onViewChange, onLogout }: NavbarProps) {
  return (
    <nav className="flex items-center justify-between bg-white px-10 py-4 shadow-sm">
      <h1 className="m-0 text-2xl font-bold text-gray-800">Reservas SaaS</h1>
      <div className="flex items-center gap-5">
        <button
          onClick={() => onViewChange("dashboard")}
          className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            view === "dashboard"
              ? "border-2 border-indigo-500 text-indigo-500"
              : "border-none text-gray-500 hover:text-gray-700"
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onViewChange("bookings")}
          className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            view === "bookings"
              ? "border-2 border-indigo-500 text-indigo-500"
              : "border-none text-gray-500 hover:text-gray-700"
          }`}
        >
          Mis Reservas
        </button>
        <Button variant="danger" onClick={onLogout}>
          Cerrar Sesión
        </Button>
      </div>
    </nav>
  );
}

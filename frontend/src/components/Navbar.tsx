import Logo from "./ui/Logo";

interface NavbarProps {
  view: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}

const TABS = [
  { key: "agenda", label: "Agenda", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { key: "reservas", label: "Reservas", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { key: "servicios", label: "Servicios", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
  { key: "configuracion", label: "Config", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

export default function Navbar({ view, onViewChange, onLogout }: NavbarProps) {
  const linkClass = (v: string) =>
    `cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
      view === v
        ? "text-accent"
        : "text-text-secondary hover:text-text"
    }`;

  return (
    <>
      {/* Desktop navbar */}
      <nav className="hidden items-center justify-between border-b border-border bg-bg px-4 py-4 md:flex md:px-10">
        <Logo />
        <div className="flex items-center gap-5">
          {TABS.map((tab) => (
            <button key={tab.key} onClick={() => onViewChange(tab.key)} className={linkClass(tab.key)}>
              {tab.label}
            </button>
          ))}
          <button onClick={onLogout} className="cursor-pointer text-sm text-text-muted hover:text-text">
            Cerrar Sesion
          </button>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-bg px-2 pb-safe pt-2 md:hidden">
        {TABS.map((tab) => {
          const isActive = view === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onViewChange(tab.key)}
              className={`flex flex-1 cursor-pointer flex-col items-center gap-1 py-1 text-xs font-medium transition-colors ${
                isActive ? "text-accent" : "text-text-muted"
              }`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 2 : 1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Spacer for mobile bottom nav */}
      <div className="h-16 md:hidden" />
    </>
  );
}

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const THEME_OPTIONS: { value: "system" | "light" | "dark"; label: string }[] = [
  { value: "system", label: "Sistema" },
  { value: "light", label: "Claro" },
  { value: "dark", label: "Oscuro" },
];

export default function ConfiguracionPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <div className="animate-fade-in">
      <h2 className="mb-8 text-xl font-semibold text-text">Configuracion</h2>

      <div className="mb-6 rounded-xl border border-border bg-surface p-6 md:p-8">
        <h3 className="mb-4 text-base font-semibold text-text">Perfil</h3>
        <div className="space-y-3 text-sm text-text-secondary">
          <p><span className="font-medium text-text">Nombre:</span> {user?.name}</p>
          <p><span className="font-medium text-text">Email:</span> {user?.email}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6 md:p-8">
        <h3 className="mb-1 text-base font-semibold text-text">Apariencia</h3>
        <p className="mb-4 text-sm text-text-secondary">
          Tema de la interfaz. "Sistema" sigue la preferencia de tu dispositivo.
        </p>
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Tema de la interfaz">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              role="radio"
              aria-checked={theme === opt.value}
              onClick={() => setTheme(opt.value)}
              className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                theme === opt.value
                  ? "bg-accent text-accent-text"
                  : "text-text-secondary hover:text-text"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

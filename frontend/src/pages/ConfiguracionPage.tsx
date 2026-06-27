import { useAuth } from "../context/AuthContext";

export default function ConfiguracionPage() {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in">
      <h2 className="mb-8 text-xl font-semibold text-text">Configuracion</h2>

      <div className="rounded-xl border border-border bg-surface p-6 md:p-8">
        <h3 className="mb-4 text-base font-semibold text-text">Perfil</h3>
        <div className="space-y-3 text-sm text-text-secondary">
          <p><span className="font-medium text-text">Nombre:</span> {user?.name}</p>
          <p><span className="font-medium text-text">Email:</span> {user?.email}</p>
        </div>
      </div>
    </div>
  );
}

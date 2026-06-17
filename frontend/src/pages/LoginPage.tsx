import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/ui/Alert";
import Button from "../components/ui/Button";
import Logo from "../components/ui/Logo";

export default function LoginPage() {
  const { login, register } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const err = await login(email, password);
    if (err) setError(err);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const err = await register(name, email, password);
    if (err) {
      setError(err);
    } else {
      setSuccess("Cuenta creada. Inicia sesion.");
      setShowRegister(false);
      setName("");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg font-sans">
      <div className="mx-4 w-full max-w-[400px] rounded-2xl border border-border bg-surface p-8 md:p-10">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Logo />
          <h1 className="text-center text-2xl font-bold text-text">
            {showRegister ? "Crear Cuenta" : "Reservas SaaS"}
          </h1>
        </div>

        {error && <Alert variant="error">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <form onSubmit={showRegister ? handleRegister : handleLogin}>
          {showRegister && (
            <div className="mb-4">
              <label className="mb-1 block text-sm text-text-secondary">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-3 text-sm text-text transition-colors placeholder:text-text-muted focus:border-accent focus:outline-none"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="mb-1 block text-sm text-text-secondary">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-3 text-sm text-text transition-colors placeholder:text-text-muted focus:border-accent focus:outline-none"
            />
          </div>

          <div className="mb-5">
            <label className="mb-1 block text-sm text-text-secondary">Contrasena</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-3 text-sm text-text transition-colors placeholder:text-text-muted focus:border-accent focus:outline-none"
            />
          </div>

          <Button type="submit" className="w-full">
            {showRegister ? "Crear Cuenta" : "Ingresar"}
          </Button>

          <p className="mt-4 text-center text-sm text-text-secondary">
            {showRegister ? (
              <>
                Ya tienes cuenta?{" "}
                <span
                  className="cursor-pointer text-accent hover:underline"
                  onClick={() => { setShowRegister(false); setError(""); }}
                >
                  Ingresar
                </span>
              </>
            ) : (
              <>
                No tienes cuenta?{" "}
                <span
                  className="cursor-pointer text-accent hover:underline"
                  onClick={() => { setShowRegister(true); setError(""); }}
                >
                  Crear cuenta
                </span>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}

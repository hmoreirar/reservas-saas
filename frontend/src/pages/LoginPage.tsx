import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/ui/Alert";

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
      setSuccess("Cuenta creada. Inicia sesión.");
      setShowRegister(false);
      setName("");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 font-sans">
      <div className="w-[400px] rounded-2xl bg-white p-10 shadow-2xl">
        <h1 className="mb-8 text-center text-2xl font-bold text-gray-800">
          {showRegister ? "Crear Cuenta" : "Reservas SaaS"}
        </h1>

        {error && <Alert variant="error">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <form onSubmit={showRegister ? handleRegister : handleLogin}>
          {showRegister && (
            <div className="mb-4">
              <label className="mb-1 block text-sm text-gray-600">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="mb-1 block text-sm text-gray-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div className="mb-5">
            <label className="mb-1 block text-sm text-gray-600">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <button
            type="submit"
            className="w-full cursor-pointer rounded-lg bg-indigo-500 px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600"
          >
            {showRegister ? "Crear Cuenta" : "Ingresar"}
          </button>

          <p className="mt-4 text-center text-sm text-gray-500">
            {showRegister ? (
              <>
                ¿Ya tienes cuenta?{" "}
                <span
                  className="cursor-pointer text-indigo-500 hover:underline"
                  onClick={() => { setShowRegister(false); setError(""); }}
                >
                  Ingresar
                </span>
              </>
            ) : (
              <>
                ¿No tienes cuenta?{" "}
                <span
                  className="cursor-pointer text-indigo-500 hover:underline"
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

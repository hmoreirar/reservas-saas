import { Outlet, useNavigate, useLocation } from "react-router";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import Navbar from "./components/Navbar";
import ToastContainer from "./components/ui/Toast";

export default function Dashboard() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!token) return <LoginPage />;

  const currentView = location.pathname === "/" ? "agenda" : location.pathname.slice(1);

  const handleNavigate = (view: string) => {
    navigate(view === "agenda" ? "/" : `/${view}`);
  };

  return (
    <div className="min-h-screen bg-bg font-sans">
      <Navbar view={currentView} onViewChange={handleNavigate} onLogout={logout} />
      <ToastContainer />
      <div id="main-content" role="main" className="mx-auto max-w-[1200px] px-4 py-6 md:px-10 md:py-10">
        <Outlet />
      </div>
    </div>
  );
}

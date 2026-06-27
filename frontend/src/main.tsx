import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Dashboard from "./Dashboard";
import AgendaPage from "./pages/AgendaPage";
import ReservasPage from "./pages/ReservasPage";
import ServiciosPage from "./pages/ServiciosPage";
import ConfiguracionPage from "./pages/ConfiguracionPage";
import BookingPage from "./BookingPage";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
        <Routes>
          <Route path="/" element={<Dashboard />}>
            <Route index element={<AgendaPage />} />
            <Route path="reservas" element={<ReservasPage />} />
            <Route path="servicios" element={<ServiciosPage />} />
            <Route path="configuracion" element={<ConfiguracionPage />} />
          </Route>
          <Route path="/book/:slug" element={<BookingPage />} />
        </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);

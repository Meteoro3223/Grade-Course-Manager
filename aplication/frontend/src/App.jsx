import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Inicio from "./pages/Inicio";
import Detalle from "./pages/Detalle";
import Profesores from "./pages/Profesores";
import DetalleProfesor from "./pages/DetalleProfesor";
import Calendario from "./pages/Calendario";
import Login from "./pages/Login";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/asignaturas/:codigo" element={<Detalle />} />

          <Route path="/profesores" element={<Profesores />} />
          <Route path="/profesores/:id" element={<DetalleProfesor />} />

          <Route path="/calendario" element={<Calendario />} /> 

          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  // extraemos el usuario logueado y la función de logout del contexto de autenticación
  const { usuario, logout } = useAuth();
  // hook para redirigir al usuario a otra página tras cerrar sesión
  const navigate = useNavigate();

  // manejador del botón de cerrar sesión.
  // primero limpia el estado y el localstorage, luego redirige al login
  const handleLogout = () => {
    logout();          // borra el usuario del contexto y del localstorage
    navigate("/login"); // manda al usuario a la página de inicio de sesión
  };

  return (
    <header className="navbar">
      <div className="navbar-marca">
        <Link to="/">Gestor de Asignaturas</Link>
      </div>
      <nav className="navbar-links">
        <Link to="/">Asignaturas</Link>
        <Link to="/calendario">Calendario</Link>
        <Link to="/profesores">Profesores</Link>
      </nav>
      <div className="navbar-usuario">
        {usuario ? (
          <>
            <span className="navbar-nombre">{usuario.nombre}</span>
            <button onClick={handleLogout} className="boton-secundario">
              Cerrar sesión
            </button>
          </>
        ) : (
          <Link to="/login" className="boton-secundario">
            Iniciar sesión
          </Link>
        )}
      </div>
    </header>
  );
}

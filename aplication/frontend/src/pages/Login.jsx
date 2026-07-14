import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  // funciones de login y registro del contexto de autenticación
  const { login, registrar } = useAuth();
  // hook para redirigir al usuario a otra página tras hacer login o registrarse
  const navigate = useNavigate();

  // controla qué pestaña está activa, "login" para iniciar sesión, "registro" para crear cuenta
  const [tab, setTab] = useState("login");
  // estado del formulario con el nombre y la contraseña introducidos por el usuario
  const [form, setForm] = useState({ nombre: "", contrasena: "" });
  // mensaje de error que se muestra bajo el formulario si algo falla
  const [error, setError] = useState(null);
  // controla si el botón está deshabilitado mientras se espera respuesta del backend
  const [cargando, setCargando] = useState(false);

  // manejador del envío del formulario, funciona tanto para login como para registro
  const handleSubmit = async (ev) => {
    ev.preventDefault(); // evitamos que el formulario recargue la página

    // validación básica: ambos campos son obligatorios
    if (!form.nombre.trim() || !form.contrasena.trim()) {
      setError("Rellena todos los campos.");
      return;
    }

    setCargando(true);
    setError(null);

    try {
      if (tab === "login") {
        // POST /api/usuarios/login si las credenciales son correctas devuelve el usuario
        await login(form.nombre, form.contrasena);
      } else {
        // POST /api/usuarios/registrar crea el usuario y lo deja logueado directamente
        await registrar(form.nombre, form.contrasena);
      }
      // si todo fue bien redirigimos a la página principal
      navigate("/");
    } catch (err) {
      // el mensaje de error depende de si estábamos en login o en registro
      setError(
        tab === "login"
          ? "usuario o contraseña incorrectos."
          : "error al registrar el usuario."
      );
    } finally {
      // tanto si hubo error como si no, volvemos a habilitar el botón
      setCargando(false);
    }
  };

  return (
    <main>
      <div className="login-caja">
        <div className="tabs">
          <button
            className={tab === "login" ? "tab activo" : "tab"}
            onClick={() => { setTab("login"); setError(null); }}
          >
            Iniciar sesión
          </button>
          <button
            className={tab === "registro" ? "tab activo" : "tab"}
            onClick={() => { setTab("registro"); setError(null); }}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="campo">
            <label>Nombre de usuario</label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej. pepito123"
            />
          </div>

          <div className="campo">
            <label>Contraseña</label>
            <input
              type="password"
              value={form.contrasena}
              onChange={(e) => setForm({ ...form, contrasena: e.target.value })}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={cargando} className="boton-principal">
            {cargando
              ? "Cargando..."
              : tab === "login"
              ? "Entrar"
              : "Crear cuenta"}
          </button>
        </form>
      </div>
    </main>
  );
}

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiAsignaturas } from "../api/asignaturas";
import FormularioAsignatura from "../components/FormularioAsignatura";
import { useAuth } from "../context/AuthContext";

export default function Inicio() {
  const { usuario } = useAuth();

  const [asignaturas, setAsignaturas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const getUsuarioId = () => {
    return usuario?._id || usuario?.id || usuario?.nombre || "";
  };

  useEffect(() => {
    if (usuario) {
      cargar();
    } else {
      setAsignaturas([]);
      setCargando(false);
    }
  }, [usuario]);

  const cargar = async () => {
    const usuarioId = getUsuarioId();

    if (!usuarioId) {
      setAsignaturas([]);
      return;
    }

    setCargando(true);

    try {
      const data = await apiAsignaturas.getAll(usuarioId);
      setAsignaturas(data);
      setError(null);
    } catch (err) {
      console.error(err.response?.data || err);
      setError(
        err.response?.data?.message || "No se pudo conectar con el servidor."
      );
    } finally {
      setCargando(false);
    }
  };

  const handleCrear = async (nueva) => {
    const usuarioId = getUsuarioId();

    if (!usuarioId) {
      setError("Debes iniciar sesión para crear asignaturas.");
      return;
    }

    try {
      await apiAsignaturas.registrar({
        ...nueva,
        usuario: usuarioId,
      });

      await cargar();
    } catch (err) {
      console.error(err.response?.data || err);
      setError(err.response?.data?.message || "No se pudo crear la asignatura.");
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm("¿Eliminar esta asignatura?")) return;

    const usuarioId = getUsuarioId();

    if (!usuarioId) {
      setError("Debes iniciar sesión para eliminar asignaturas.");
      return;
    }

    try {
      await apiAsignaturas.eliminar(id, usuarioId);
      setAsignaturas((prev) => prev.filter((a) => a._id !== id));
      setError(null);
    } catch (err) {
      console.error(err.response?.data || err);
      setError(
        err.response?.data?.message || "No se pudo eliminar la asignatura."
      );
    }
  };

  if (!usuario) {
    return (
      <main>
        <h2>Asignaturas</h2>
        <p>
          <Link to="/login">Inicia sesión</Link> para ver y crear tus
          asignaturas.
        </p>
      </main>
    );
  }

  return (
    <main>
      <h2>Asignaturas</h2>

      {cargando && <p>Cargando...</p>}
      {error && <p className="error">{error}</p>}

      {!cargando && !error && !asignaturas.length && (
        <p>No tienes asignaturas todavía.</p>
      )}

      {!cargando && !error && asignaturas.length > 0 && (
        <div className="tarjetas">
          {asignaturas.map((a) => (
            <div key={a._id} className="tarjeta-wrapper">
              <Link to={`/asignaturas/${a.codigo}`} className="tarjeta">
                <p className="tarjeta-nombre">{a.nombre}</p>

                <p className="tarjeta-curso">
                  Cód. {a.codigo}
                  {a.curso ? ` · ${a.curso}º curso` : ""}
                </p>

                <p className="tarjeta-profesores">
                  {a.profesores?.length || 0}{" "}
                  {a.profesores?.length === 1 ? "profesor" : "profesores"}
                </p>
              </Link>

              <button
                className="boton-eliminar"
                onClick={() => handleEliminar(a._id)}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}

      <FormularioAsignatura onCrear={handleCrear} />
    </main>
  );
}
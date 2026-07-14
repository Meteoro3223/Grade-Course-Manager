import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiProfesores } from "../api/profesores";

export default function Profesores() {
  // lista de profesores cargados desde el backend
  const [profesores, setProfesores] = useState([]);

  // texto introducido en el buscador.
  // se usa para filtrar por nombre o departamento
  const [busqueda, setBusqueda] = useState("");

  // controla si se muestra el mensaje "cargando..."
  const [cargando, setCargando] = useState(true);

  // mensaje de error general de la página
  const [error, setError] = useState(null);

  // al montar el componente cargamos la lista de profesores.
  // el array vacío hace que solo se ejecute una vez
  useEffect(() => {
    cargar();
  }, []);

  // pide al backend la lista completa de profesores y la guarda en el estado
  const cargar = async () => {
    setCargando(true);

    try {
      // GET /api/profesores devuelve todos los profesores registrados
      const data = await apiProfesores.getAll();

      setProfesores(data);
      setError(null);
    } catch (err) {
      console.error(err.response?.data || err);
      setError("No se pudo cargar la lista de profesores.");
    } finally {
      // tanto si hay error como si no, quitamos el estado de carga
      setCargando(false);
    }
  };

  // lista filtrada según el texto de búsqueda.
  // se compara en minúsculas para que no importe si se escribe con mayúsculas
  const profesoresFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) return profesores;

    return profesores.filter((p) => {
      const nombre = p.nombre?.toLowerCase() || "";
      const departamento = p.departamento?.toLowerCase() || "";

      return nombre.includes(texto) || departamento.includes(texto);
    });
  }, [profesores, busqueda]);

  return (
    <main>
      <h2>Profesores</h2>

      <div className="campo">
        <label>Buscar profesor o departamento</label>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Ej. Ana, Matemáticas, Informática..."
        />
      </div>

      {cargando && <p>Cargando...</p>}
      {error && <p className="error">{error}</p>}

      {!cargando && !error && profesoresFiltrados.length === 0 && (
        <p>No hay profesores que coincidan con la búsqueda.</p>
      )}

      {!cargando && !error && profesoresFiltrados.length > 0 && (
        <ul>
          {profesoresFiltrados.map((p) => (
            <li key={p._id} className="item-con-boton">
              <Link to={`/profesores/${p._id}`}>
                <strong>{p.nombre}</strong>
                {" — "}
                {p.departamento}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
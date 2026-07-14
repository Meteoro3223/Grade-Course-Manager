import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiProfesores } from "../api/profesores";
import { apiAsignaturas } from "../api/asignaturas";
import { apiReviews } from "../api/reviews";
import { useAuth } from "../context/AuthContext";

export default function DetalleProfesor() {
  // id del profesor de la url
  const { id } = useParams();

  // obtenemos el usuario logueado desde el contexto de autenticación
  const { usuario } = useAuth();

  // datos del profesor que se está visualizando
  const [profesor, setProfesor] = useState(null);

  // lista de reviews que tiene este profesor
  const [reviews, setReviews] = useState([]);

  // lista de asignaturas del usuario que tienen este profesor
  // si está vacía, el usuario no puede dejar review
  const [asignaturas, setAsignaturas] = useState([]);

  // controla si se muestra el mensaje "cargando..."
  const [cargando, setCargando] = useState(true);

  // mensaje de error general de la página
  const [error, setError] = useState(null);

  // estado del formulario para enviar una nueva review
  const [form, setForm] = useState({
    asignatura: "",   // _id de la asignatura sobre la que se deja la review
    puntuacion: "",   // valor numérico del 1 al 5
    comentarios: "",  // texto libre opcional
  });

  // mensaje de error específico del formulario de reviews
  const [errorForm, setErrorForm] = useState(null);

  // obtiene el identificador del usuario. usamos id si existe y si no nombre como fallback
  const getUsuarioId = () => {
    return usuario?._id || usuario?.id || usuario?.nombre || "";
  };
  const esReviewDelUsuario = (review) => {
    const usuarioId = getUsuarioId();

    return (
      usuarioId &&
      (String(review.usuario?._id) === String(usuarioId) ||
        String(review.usuario) === String(usuarioId) ||
        review.usuario?.nombre === usuario?.nombre)
    );
  };

  const yaTieneReview = reviews.some(esReviewDelUsuario);
  // cada vez que cambia el id del profesor o el usuario, recargamos todos los datos
  useEffect(() => {
    cargar();
  }, [id, usuario]);

  // carga en paralelo el profesor, sus reviews y las asignaturas del usuario
  const cargar = async () => {
    setCargando(true);

    try {
      if (!id) {
        setError("Id de profesor no válido.");
        setProfesor(null);
        setReviews([]);
        setAsignaturas([]);
        return;
      }

      const usuarioId = getUsuarioId();

      const [profesorData, reviewsData, asignaturasData] = await Promise.all([
        apiProfesores.getById(id),
        apiReviews.getPorProfesor(id),
        usuarioId ? apiAsignaturas.getAll(usuarioId) : Promise.resolve([]),
      ]);

      const asignaturasConEsteProfesor = asignaturasData.filter((asignatura) =>
        asignatura.profesores?.some((p) => String(p._id) === String(id))
      );

      setProfesor(profesorData);
      setReviews(reviewsData);
      setAsignaturas(asignaturasConEsteProfesor);
      setError(null);
    } catch (err) {
      console.error(err.response?.data || err);
      setError(
        err.response?.data?.message || "No se pudo cargar el profesor."
      );
    } finally {
      setCargando(false);
    }
  };

  // manejador del formulario de enviar review
  const handleEnviarReview = async (ev) => {
    ev.preventDefault(); // evitamos que el formulario recargue la página

    // solo los usuarios logueados pueden dejar reviews
    if (!usuario) {
      setErrorForm("Debes iniciar sesión para dejar una review.");
      return;
    }
    if (yaTieneReview) {
      setErrorForm(
        "Ya has dejado una review para este profesor. Elimínala antes de crear otra."
      );
      return;
    }

    // si no tiene ninguna asignatura con este profesor, no puede dejar review
    if (!asignaturas.length) {
      setErrorForm(
        "Solo puedes dejar una review si tienes este profesor en alguna asignatura."
      );
      return;
    }

    // asignatura y puntuación son obligatorias
    if (!form.asignatura || !form.puntuacion) {
      setErrorForm("Selecciona asignatura y puntuación.");
      return;
    }

    try {
      // POST /api/reviews/registrar crea la review o la actualiza si ya existe
      // el backend valida usuario + profesor + asignatura
      const nueva = await apiReviews.registrar({
        usuario: getUsuarioId(),
        profesor: {
          nombre: profesor.nombre,
          departamento: profesor.departamento,
        },
        asignatura: form.asignatura,
        puntuacion: Number(form.puntuacion), // convertimos string del select a número
        comentarios: form.comentarios.trim(),
      });

      // si la review ya existía en el estado local la reemplazamos; si es nueva la añadimos
      setReviews((prev) => {
        const existe = prev.find((r) => r._id === nueva._id);

        return existe
          ? prev.map((r) => (r._id === nueva._id ? nueva : r))
          : [nueva, ...prev];
      });

      // limpiamos el formulario tras enviar
      setForm({
        asignatura: "",
        puntuacion: "",
        comentarios: "",
      });

      setErrorForm(null);
    } catch (err) {
      console.error(err.response?.data || err);
      setErrorForm(
        err.response?.data?.message || "Error al enviar la review."
      );
    }
  };

  // elimina una review por su id tras confirmación del usuario
  const handleEliminarReview = async (rid) => {
    if (!confirm("¿Eliminar esta review?")) return;

    try {
      // DELETE /api/reviews/eliminar/:id?usuario=...
      // el backend comprueba que la review sea del usuario actual
      await apiReviews.eliminar(rid, getUsuarioId());

      setReviews((prev) => prev.filter((r) => r._id !== rid));
    } catch (err) {
      console.error(err.response?.data || err);
      setErrorForm(
        err.response?.data?.message || "Error al eliminar la review."
      );
    }
  };

  // mientras se cargan los datos mostramos un mensaje de espera
  if (cargando) {
    return (
      <main>
        <p>Cargando...</p>
      </main>
    );
  }

  // si hubo error o el profesor no existe, mostramos el mensaje y un enlace para volver
  if (error || !profesor) {
    return (
      <main>
        <p>{error || "Profesor no encontrado."}</p>
        <Link to="/profesores" className="volver">
          Volver
        </Link>
      </main>
    );
  }

  // calculamos la media de puntuaciones de todas las reviews.
  // si no hay reviews, mediaReviews queda como null y no se muestra
  const mediaReviews = reviews.length
    ? (
        reviews.reduce((s, r) => s + Number(r.puntuacion || 0), 0) /
        reviews.length
      ).toFixed(1)
    : null;

  return (
    <main>
      <Link to="/profesores" className="volver">
        ← Volver
      </Link>

      <h2>{profesor.nombre}</h2>
      <p className="subtitulo">Departamento: {profesor.departamento}</p>

      {mediaReviews && (
        <p className="media-puntuacion">
          ⭐ {mediaReviews} / 5 ({reviews.length} reviews)
        </p>
      )}

      {/* ── REVIEWS ── */}
      <section className="seccion">
        <h3>Reviews</h3>

        {!reviews.length ? (
          <p>Este profesor todavía no tiene reviews.</p>
        ) : (
          <ul>
            {reviews.map((r) => (
              <li key={r._id} className="review-item">
                <div className="review-cabecera">
                  <span className="review-puntuacion">
                    {"⭐".repeat(Number(r.puntuacion || 0))}
                  </span>

                  <span className="review-asignatura">
                    {r.asignatura?.nombre || "Asignatura"}
                  </span>
                </div>

                {r.comentarios && (
                  <p className="review-comentario">{r.comentarios}</p>
                )}

                <div className="review-pie">
                  <span>{r.usuario?.nombre || "Usuario"}</span>

                  {/* DELETE /api/reviews/eliminar/:id */}
                  {esReviewDelUsuario(r) && (
                    <button
                      className="boton-eliminar"
                      onClick={() => handleEliminarReview(r._id)}
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* POST /api/reviews/registrar */}
        {!usuario ? (
          <p>
            <Link to="/login">Inicia sesión</Link> para dejar una review.
          </p>
        ) : asignaturas.length === 0 ? (
          <p className="aviso-nota">
            Solo puedes dejar una review si tienes este profesor en alguna de
            tus asignaturas.
          </p>
        ) : yaTieneReview ? (
          <p className="aviso-nota">
            Ya has dejado una review para este profesor. Puedes eliminar tu review y
            crear otra si quieres cambiarla.
          </p>
        ) : (
          <form onSubmit={handleEnviarReview} className="form-inline">
            <h4>Dejar una review</h4>

            <div className="campo">
              <label>Asignatura</label>
              <select
                value={form.asignatura}
                onChange={(e) =>
                  setForm({ ...form, asignatura: e.target.value })
                }
              >
                <option value="">Selecciona</option>

                {asignaturas.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="campo">
              <label>Puntuación (1-5)</label>
              <select
                value={form.puntuacion}
                onChange={(e) =>
                  setForm({ ...form, puntuacion: e.target.value })
                }
              >
                <option value="">Selecciona</option>

                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {"⭐".repeat(n)} ({n})
                  </option>
                ))}
              </select>
            </div>

            <div className="campo">
              <label>Comentarios (opcional)</label>
              <textarea
                value={form.comentarios}
                onChange={(e) =>
                  setForm({ ...form, comentarios: e.target.value })
                }
                placeholder="Tu opinión sobre este profesor..."
                rows={3}
              />
            </div>

            {errorForm && <p className="error">{errorForm}</p>}

            <button type="submit" className="boton-principal">
              Enviar review
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
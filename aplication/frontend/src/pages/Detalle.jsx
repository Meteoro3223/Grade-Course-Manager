import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiAsignaturas } from "../api/asignaturas";
import { apiProfesores } from "../api/profesores";
import { apiNotas } from "../api/notas";
import { apiGuias } from "../api/guias";
import { useAuth } from "../context/AuthContext";

export default function Detalle() {
  const { codigo } = useParams();
  const { usuario } = useAuth();

  const [asignatura, setAsignatura] = useState(null);
  const [notas, setNotas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [formProf, setFormProf] = useState({ nombre: "", departamento: "" });
  const [errorProf, setErrorProf] = useState(null);

  // Empieza vacío: se rellena desde guía, MongoDB o modo manual.
  const [evaluaciones, setEvaluaciones] = useState([]);

  const [errorNota, setErrorNota] = useState(null);

  const [cargandoGuia, setCargandoGuia] = useState(false);
  const [errorGuia, setErrorGuia] = useState(null);
  const [nombreArchivoGuia, setNombreArchivoGuia] = useState("");

  const [modoManual, setModoManual] = useState(false);
  const [formManual, setFormManual] = useState({
    nombre: "",
    porcentaje: "",
  });
  const [errorManual, setErrorManual] = useState(null);

  useEffect(() => {
    cargar();
  }, [codigo, usuario]);

  const getUsuarioId = () => {
    return String(usuario?._id || usuario?.id || usuario?.nombre || "");
  };

  const getClaveGuiaStorage = (asignaturaId) => {
    const usuarioId = getUsuarioId() || "anonimo";
    return `guia-${asignaturaId}-${usuarioId}`;
  };

  const getPesoTotal = (lista = evaluaciones) => {
    return lista.reduce((total, e) => {
      const porcentaje = Number(e.porcentaje);
      return Number.isNaN(porcentaje) ? total : total + porcentaje;
    }, 0);
  };

  const getMiNota = (notasData) => {
    const usuarioId = getUsuarioId();

    return notasData.find((n) => {
      return (
        String(n.usuario || "") === usuarioId ||
        String(n.usuario?._id || "") === usuarioId ||
        n.usuario?.nombre === usuario?.nombre
      );
    });
  };

  const cargarEvaluacionesGuardadas = (asig, notasData) => {
    const miNota = getMiNota(notasData);

    // Prioridad 1: si ya existe una nota guardada en MongoDB, se carga esa.
    if (miNota?.evaluaciones?.length) {
      setEvaluaciones(
        miNota.evaluaciones.map((e) => ({
          nombre: e.nombre,
          porcentaje: String(e.porcentaje),
          nota: e.nota === null || e.nota === undefined ? "" : String(e.nota)
        }))
      );

      setModoManual(false);
      return;
    }

    // Prioridad 2: si se cargó guía/formato manual sin guardar, se recupera.
    const claveStorage = getClaveGuiaStorage(asig._id);
    const guiaGuardada = localStorage.getItem(claveStorage);

    if (guiaGuardada) {
      try {
        const evaluacionesStorage = JSON.parse(guiaGuardada);

        if (Array.isArray(evaluacionesStorage) && evaluacionesStorage.length) {
          setEvaluaciones(evaluacionesStorage);
          setModoManual(false);
          return;
        }
      } catch {
        localStorage.removeItem(claveStorage);
      }
    }

    setEvaluaciones([]);
    setModoManual(false);
  };

  const cargar = async () => {
    setCargando(true);

    try {
      const usuarioId = getUsuarioId();
      if (!usuarioId) {
        setError("Debes iniciar sesión para ver esta asignatura.");
        return;
      }

      const asig = await apiAsignaturas.getByCodigo(codigo, usuarioId);
      setAsignatura(asig);

      const notasData = await apiNotas.getPorAsignatura(asig._id);
      setNotas(notasData);

      cargarEvaluacionesGuardadas(asig, notasData);

      setError(null);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la asignatura.");
    } finally {
      setCargando(false);
    }
  };

  const handleAnadirProfesor = async (ev) => {
    ev.preventDefault();

    if (!formProf.nombre.trim() || !formProf.departamento.trim()) {
      setErrorProf("Rellena nombre y departamento.");
      return;
    }

    try {
      const nuevo = await apiProfesores.registrar({
        nombre: formProf.nombre.trim(),
        departamento: formProf.departamento.trim(),
      });

      const profesoresActualizados = [
        ...asignatura.profesores.map((p) => p._id),
        nuevo._id,
      ];

      const asigActualizada = await apiAsignaturas.actualizarProfesores(
        asignatura._id,
        profesoresActualizados,
        getUsuarioId()
      );

      setAsignatura(asigActualizada);
      setFormProf({ nombre: "", departamento: "" });
      setErrorProf(null);
    } catch (err) {
      console.error(err);
      setErrorProf("Error al añadir el profesor.");
    }
  };

  const handleQuitarProfesor = async (profId) => {
    if (!confirm("¿Quitar este profesor de la asignatura?")) return;

    try {
      const profesoresActualizados = asignatura.profesores
        .map((p) => p._id)
        .filter((id) => id !== profId);

      const asigActualizada = await apiAsignaturas.actualizarProfesores(
        asignatura._id,
        profesoresActualizados,
        getUsuarioId()
      );

      setAsignatura(asigActualizada);
      setErrorProf(null);
    } catch (err) {
      console.error(err);
      setErrorProf("Error al quitar el profesor.");
    }
  };

  const guardarEvaluacionesLocal = (nuevas) => {
    if (!asignatura?._id) return;

    if (nuevas.length) {
      localStorage.setItem(
        getClaveGuiaStorage(asignatura._id),
        JSON.stringify(nuevas)
      );
    } else {
      localStorage.removeItem(getClaveGuiaStorage(asignatura._id));
    }
  };

  const updateEvaluacion = (i, campo, valor) => {
    setEvaluaciones((prev) => {
      const nuevas = prev.map((e, idx) =>
        idx === i ? { ...e, [campo]: valor } : e
      );

      guardarEvaluacionesLocal(nuevas);
      return nuevas;
    });
  };

  const activarModoManual = () => {
    setModoManual(true);
    setErrorManual(null);
    setErrorGuia(null);
  };

  const cancelarModoManual = () => {
    if (
      evaluaciones.length &&
      !confirm(
        "¿Cancelar la creación manual? Se perderán las evaluaciones no guardadas."
      )
    ) {
      return;
    }

    setModoManual(false);
    setFormManual({ nombre: "", porcentaje: "" });
    setErrorManual(null);
    setEvaluaciones([]);
    guardarEvaluacionesLocal([]);
  };

  const addEvaluacionManual = () => {
    const nombre = formManual.nombre.trim();
    const porcentaje = Number(formManual.porcentaje);

    if (!nombre) {
      setErrorManual("Introduce el nombre de la entrega.");
      return;
    }

    if (
      formManual.porcentaje === "" ||
      Number.isNaN(porcentaje) ||
      porcentaje <= 0 ||
      porcentaje > 100
    ) {
      setErrorManual("Introduce un peso válido entre 0 y 100.");
      return;
    }

    const pesoActual = getPesoTotal();
    const nuevoTotal = pesoActual + porcentaje;

    if (nuevoTotal > 100) {
      setErrorManual(
        `No puedes superar el 100%. Ahora mismo llevas ${pesoActual.toFixed(
          2
        )}%.`
      );
      return;
    }

    const nuevas = [
      ...evaluaciones,
      {
        nombre,
        porcentaje: String(porcentaje),
        nota: "",
      },
    ];

    setEvaluaciones(nuevas);
    guardarEvaluacionesLocal(nuevas);

    setFormManual({ nombre: "", porcentaje: "" });
    setErrorManual(null);
  };

  const quitarEvaluacionManual = (i) => {
    const nuevas = evaluaciones.filter((_, idx) => idx !== i);

    setEvaluaciones(nuevas);
    guardarEvaluacionesLocal(nuevas);
  };

  const guardarFormatoManual = () => {
    const pesoTotal = getPesoTotal();

    if (!evaluaciones.length) {
      setErrorManual("Añade al menos una entrega.");
      return;
    }

    if (Math.abs(pesoTotal - 100) > 0.001) {
      setErrorManual(
        `Los pesos deben sumar exactamente 100%. Ahora mismo suman ${pesoTotal.toFixed(
          2
        )}%.`
      );
      return;
    }

    setModoManual(false);
    setErrorManual(null);
    guardarEvaluacionesLocal(evaluaciones);
  };

  const handleCargarGuiaDocente = async (ev) => {
    const archivo = ev.target.files?.[0];

    if (!archivo) return;

    if (archivo.type !== "application/pdf") {
      setErrorGuia("La guía docente debe ser un archivo PDF.");
      ev.target.value = "";
      return;
    }

    setCargandoGuia(true);
    setErrorGuia(null);
    setErrorManual(null);
    setNombreArchivoGuia(archivo.name);

    try {
      const evaluacionGuia = await apiGuias.procesar(archivo);

      if (!evaluacionGuia.length) {
        setErrorGuia(
          "No se han encontrado evaluaciones en la guía docente. Puedes crear los pesos manualmente."
        );
        setModoManual(true);
        return;
      }

      const evaluacionesDesdeGuia = evaluacionGuia.map((item) => ({
        nombre: item.descripcion,
        porcentaje: String(Number(item.peso)),
        nota: "",
      }));

      setEvaluaciones(evaluacionesDesdeGuia);
      guardarEvaluacionesLocal(evaluacionesDesdeGuia);
      setModoManual(false);
    } catch (err) {
      console.error(err);
      setErrorGuia(
        "Error al procesar la guía docente. Puedes crear los pesos manualmente."
      );
      setModoManual(true);
    } finally {
      setCargandoGuia(false);
      ev.target.value = "";
    }
  };

  const calcularNotaFinal = (evaluacionesNota = []) => {
    return evaluacionesNota.reduce((total, e) => {
      const notaVacia =
        e.nota === "" || e.nota === null || e.nota === undefined;

      if (notaVacia) return total;

      const nota = Number(e.nota);
      const porcentaje = Number(e.porcentaje);

      if (
        Number.isNaN(nota) ||
        Number.isNaN(porcentaje) ||
        nota < 0 ||
        nota > 10
      ) {
        return total;
      }

      return total + (nota * porcentaje) / 100;
    }, 0);
  };

  const resumenNotas = useMemo(() => {
    let notaPonderada = 0;
    let porcentajeEvaluado = 0;
    let porcentajeTotal = 0;

    for (const evaluacion of evaluaciones) {
      const porcentaje = Number(evaluacion.porcentaje);
      const nota = Number(evaluacion.nota);

      if (!Number.isNaN(porcentaje) && porcentaje > 0) {
        porcentajeTotal += porcentaje;
      }

      const tieneNota =
        evaluacion.nota !== "" &&
        !Number.isNaN(nota) &&
        nota >= 0 &&
        nota <= 10;

      if (tieneNota && !Number.isNaN(porcentaje) && porcentaje > 0) {
        notaPonderada += (nota * porcentaje) / 100;
        porcentajeEvaluado += porcentaje;
      }
    }

    return {
      notaPonderada,
      porcentajeEvaluado,
      porcentajeTotal,
    };
  }, [evaluaciones]);

  const getNombreNota = (nota, index) => {
    const usuarioId = getUsuarioId();

    const esMia =
      usuarioId &&
      (String(nota.usuario || "") === usuarioId ||
        String(nota.usuario?._id || "") === usuarioId ||
        nota.usuario?.nombre === usuario?.nombre);

    if (esMia) return "Mi nota";

    const nombreUsuario = nota.usuario?.nombre;

    if (nombreUsuario && !/^[a-f\d]{24}$/i.test(nombreUsuario)) {
      return nombreUsuario;
    }

    return `Nota publicada ${index + 1}`;
  };
  const handleGuardarNota = async () => {
    if (!usuario) {
      setErrorNota("Debes iniciar sesión para guardar tus notas.");
      return;
    }

    if (!evaluaciones.length) {
      setErrorNota("Primero carga una guía docente o crea los pesos manualmente.");
      return;
    }

    const pesoTotal = getPesoTotal();

    if (Math.abs(pesoTotal - 100) > 0.001) {
      setErrorNota("Los porcentajes deben sumar 100% antes de guardar.");
      return;
    }

    const evaluacionesPreparadas = evaluaciones.map((e) => {
      const notaVacia =
        e.nota === "" || e.nota === null || e.nota === undefined;

      return {
        nombre: String(e.nombre || "").trim(),
        porcentaje: Number(e.porcentaje),
        nota: notaVacia ? null : Number(e.nota),
      };
    });

    const hayEvaluacionInvalida = evaluacionesPreparadas.some((e) => {
      const nombreValido = e.nombre.length > 0;

      const porcentajeValido =
        !Number.isNaN(e.porcentaje) &&
        e.porcentaje >= 0 &&
        e.porcentaje <= 100;

      const notaValida =
        e.nota === null ||
        (!Number.isNaN(e.nota) && e.nota >= 0 && e.nota <= 10);

      return !nombreValido || !porcentajeValido || !notaValida;
    });

    if (hayEvaluacionInvalida) {
      setErrorNota("Revisa las evaluaciones. Las notas deben estar entre 0 y 10.");
      return;
    }

    try {
      const usuarioId = getUsuarioId();

      const notaGuardada = await apiNotas.registrar({
        asignatura: asignatura._id,
        usuario: usuarioId,
        evaluaciones: evaluacionesPreparadas,
      });

      const evaluacionesGuardadas = notaGuardada.evaluaciones.map((e) => ({
        nombre: e.nombre,
        porcentaje: String(e.porcentaje),
        nota: e.nota === null || e.nota === undefined ? "" : String(e.nota),
      }));

      setEvaluaciones(evaluacionesGuardadas);
      guardarEvaluacionesLocal(evaluacionesGuardadas);

      setNotas((prev) => {
        const sinNotaAnterior = prev.filter((n) => {
          const usuarioNota = n.usuario;

          return !(
            String(usuarioNota?._id) === String(usuarioId) ||
            String(usuarioNota) === String(usuarioId) ||
            usuarioNota?.nombre === usuario?.nombre
          );
        });

        return [notaGuardada, ...sinNotaAnterior];
      });

      setModoManual(false);
      setErrorNota(null);
    } catch (err) {
      console.error(err.response?.data || err);
      setErrorNota(err.response?.data?.message || "No se pudo guardar la nota.");
    }
  };

  const handleEliminarNota = async (id) => {
    if (!confirm("¿Eliminar esta nota?")) return;

    try {
      await apiNotas.eliminar(id);

      setNotas((prev) => prev.filter((n) => n._id !== id));
      setEvaluaciones([]);
      guardarEvaluacionesLocal([]);

      setNombreArchivoGuia("");
      setModoManual(false);
      setFormManual({ nombre: "", porcentaje: "" });
      setErrorManual(null);
      setErrorNota(null);
    } catch (err) {
      console.error(err.response?.data || err);
      setErrorNota(
        err.response?.data?.message ||
          "Error al eliminar la nota de la base de datos."
      );
    }
  };

  if (cargando) {
    return (
      <main>
        <p>Cargando...</p>
      </main>
    );
  }

  if (error || !asignatura) {
    return (
      <main>
        <p>{error || "Asignatura no encontrada."}</p>
        <Link to="/" className="volver">
          Volver
        </Link>
      </main>
    );
  }

  return (
    <main>
      <Link to="/" className="volver">
        ← Volver
      </Link>

      <h2>{asignatura.nombre}</h2>

      <div className="info-asignatura">
        <span>Código: {asignatura.codigo}</span>
        {asignatura.curso && <span>Curso: {asignatura.curso}º</span>}
        {asignatura.cuatrimestre && (
          <span>Cuatrimestre: {asignatura.cuatrimestre}</span>
        )}
        {asignatura.creditos && <span>Créditos: {asignatura.creditos}</span>}
      </div>

      <section className="seccion">
        <h3>Profesores</h3>

        {!asignatura.profesores?.length ? (
          <p>No hay profesores asignados.</p>
        ) : (
          <ul>
            {asignatura.profesores.map((p, idx) => (
              <li key={p._id} className="item-con-boton">
                <span>
                  <Link to={`/profesores/${p._id}`}>{p.nombre}</Link>
                  {" — "}
                  {p.departamento}
                  {idx === 0 && <span className="badge">Principal</span>}
                </span>

                <button
                  className="boton-eliminar"
                  onClick={() => handleQuitarProfesor(p._id)}
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleAnadirProfesor} className="form-inline">
          <h4>Añadir profesor</h4>

          <div className="fila-campos">
            <input
              type="text"
              placeholder="Nombre"
              value={formProf.nombre}
              onChange={(e) =>
                setFormProf({ ...formProf, nombre: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Departamento"
              value={formProf.departamento}
              onChange={(e) =>
                setFormProf({ ...formProf, departamento: e.target.value })
              }
            />

            <button type="submit" className="boton-principal">
              Añadir
            </button>
          </div>

          {errorProf && <p className="error">{errorProf}</p>}
        </form>
      </section>

      <section className="seccion">
        <h3>Notas</h3>

        {!notas.length ? (
          <p>No hay notas registradas para esta asignatura.</p>
        ) : (
          <ul className="lista-notas-publicadas">
            {notas.map((n, index) => (
              <li key={n._id} className="nota-publicada">
                <div className="nota-publicada-cabecera">
                  <div>
                    <strong>{getNombreNota(n, index)}</strong>
                    <p>
                      Nota calculada:{" "}
                      {calcularNotaFinal(n.evaluaciones).toFixed(2)} / 10
                    </p>
                  </div>

                  <button
                    className="boton-eliminar"
                    onClick={() => handleEliminarNota(n._id)}
                  >
                    Eliminar
                  </button>
                </div>

                <ul className="evaluaciones">
                  {n.evaluaciones?.map((e, i) => (
                    <li key={i}>
                      {e.nombre}: {e.nota} / 10 ({e.porcentaje}%)
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}

        {usuario ? (
          <form onSubmit={handleGuardarNota} className="form-inline bloque-notas">
            <h4>Añadir / actualizar mis notas</h4>

            <div className="acciones-carga-notas">
              <label className="selector-archivo">
                {cargandoGuia ? "Procesando guía..." : "Cargar guía docente"}
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleCargarGuiaDocente}
                  disabled={cargandoGuia}
                />
              </label>

              <button
                type="button"
                className="boton-secundario"
                onClick={activarModoManual}
              >
                Crear pesos manualmente
              </button>
            </div>

            {nombreArchivoGuia && (
              <p className="archivo-seleccionado">
                Archivo seleccionado: {nombreArchivoGuia}
              </p>
            )}

            {errorGuia && <p className="error">{errorGuia}</p>}

            {modoManual && (
              <div className="bloque-manual">
                <h4>Crear pesos manualmente</h4>

                <p className="texto-ayuda">
                  Añade las entregas una a una. La suma total debe llegar
                  exactamente al 100%.
                </p>

                <div className="fila-campos fila-manual">
                  <input
                    type="text"
                    placeholder="Nombre de la entrega"
                    value={formManual.nombre}
                    onChange={(ev) =>
                      setFormManual({
                        ...formManual,
                        nombre: ev.target.value,
                      })
                    }
                  />

                  <input
                    type="number"
                    placeholder="Peso (%)"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formManual.porcentaje}
                    onChange={(ev) =>
                      setFormManual({
                        ...formManual,
                        porcentaje: ev.target.value,
                      })
                    }
                  />

                  <button
                    type="button"
                    className="boton-secundario"
                    onClick={addEvaluacionManual}
                  >
                    Añadir peso
                  </button>
                </div>

                <div className="progreso-pesos">
                  <span>Peso total introducido</span>
                  <strong>{getPesoTotal().toFixed(2)}%</strong>
                </div>

                {Math.abs(getPesoTotal() - 100) <= 0.001 && (
                  <p className="mensaje-ok">
                    Los pesos suman 100%. Ya puedes guardar este formato.
                  </p>
                )}

                {getPesoTotal() > 0 && getPesoTotal() < 100 && (
                  <p className="aviso-nota">
                    Faltan {(100 - getPesoTotal()).toFixed(2)}% para llegar al
                    100%.
                  </p>
                )}

                {errorManual && <p className="error">{errorManual}</p>}

                <div className="acciones-notas">
                  <button
                    type="button"
                    className="boton-principal"
                    onClick={guardarFormatoManual}
                    disabled={Math.abs(getPesoTotal() - 100) > 0.001}
                  >
                    Guardar formato de pesos
                  </button>

                  <button
                    type="button"
                    className="boton-secundario"
                    onClick={cancelarModoManual}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {!modoManual && (
              <div className="resumen-nota">
                <div className="resumen-nota-item destacado">
                  <span>Nota actual</span>
                  <strong>{resumenNotas.notaPonderada.toFixed(2)} / 10</strong>
                </div>

                <div className="resumen-nota-item">
                  <span>Porcentaje rellenado</span>
                  <strong>{resumenNotas.porcentajeEvaluado.toFixed(2)}%</strong>
                </div>

                <div className="resumen-nota-item">
                  <span>Peso total</span>
                  <strong>{resumenNotas.porcentajeTotal.toFixed(2)}%</strong>
                </div>
              </div>
            )}

            {!modoManual &&
              evaluaciones.length > 0 &&
              Math.abs(resumenNotas.porcentajeTotal - 100) > 0.001 && (
                <p className="aviso-nota">
                  Aviso: los porcentajes suman{" "}
                  {resumenNotas.porcentajeTotal.toFixed(2)}%, no 100%.
                </p>
              )}

            {!evaluaciones.length ? (
              <p className="aviso-nota">
                Carga la guía docente o crea los pesos manualmente para rellenar
                tus notas.
              </p>
            ) : (
              <div className="tabla-contenedor">
                <table className="tabla-evaluacion">
                  <thead>
                    <tr>
                      <th>Evaluación</th>
                      <th>Peso</th>
                      <th>Nota</th>
                      {modoManual && <th></th>}
                    </tr>
                  </thead>

                  <tbody>
                    {evaluaciones.map((e, i) => (
                      <tr key={i}>
                        <td>
                          <input
                            value={e.nombre}
                            readOnly
                            className="input-readonly"
                          />
                        </td>

                        <td>
                          <input
                            type="number"
                            value={e.porcentaje}
                            readOnly
                            className="input-readonly"
                          />
                        </td>

                        <td>
                          <input
                            type="number"
                            value={e.nota}
                            min="0"
                            max="10"
                            step="0.01"
                            placeholder="0-10"
                            onChange={(ev) =>
                              updateEvaluacion(i, "nota", ev.target.value)
                            }
                          />
                        </td>

                        {modoManual && (
                          <td>
                            <button
                              type="button"
                              className="boton-eliminar"
                              onClick={() => quitarEvaluacionManual(i)}
                            >
                              Quitar
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="acciones-notas">
              <button
                type="submit"
                className="boton-principal"
                disabled={
                  !evaluaciones.length ||
                  Math.abs(getPesoTotal() - 100) > 0.001
                }
              >
                Guardar notas
              </button>
            </div>

            {errorNota && <p className="error">{errorNota}</p>}
          </form>
        ) : (
          <p>
            <Link to="/login">Inicia sesión</Link> para registrar tus notas.
          </p>
        )}
      </section>
    </main>
  );
}
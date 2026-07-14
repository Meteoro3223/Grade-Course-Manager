import React, { useState } from "react";

// objeto con todos los campos del formulario vacíos.
const FORM_VACIO = {
  nombre: "",
  codigo: "",
  curso: "",
  cuatrimestre: "",
  creditos: "",
  profesorNombre: "",
  profesorDepartamento: "",
};

// componente del formulario para crear una nueva asignatura.
// recibe onCrear como prop: la función que se llama cuando el formulario se envía correctamente
export default function FormularioAsignatura({ onCrear }) {

  // estado con los valores actuales de cada campo del formulario
  const [form, setForm] = useState(FORM_VACIO);
  // objeto que acumula los mensajes de error de validación por campo
  const [errores, setErrores] = useState({});
  // controla si el botón de envío está deshabilitado mientras se procesa la petición
  const [enviando, setEnviando] = useState(false);

  // comprueba que todos los campos obligatorios estén rellenos.
  // devuelve un objeto con los errores encontrados (vacío si todo es correcto)
  const validar = () => {
    const e = {};
    if (!form.nombre.trim())               e.nombre               = "indica el nombre de la asignatura";
    if (!form.codigo.trim())               e.codigo               = "indica el código";
    if (!form.curso.trim())                e.curso                = "indica el curso";
    if (!form.cuatrimestre.trim())         e.cuatrimestre         = "indica el cuatrimestre";
    if (!form.creditos.trim())             e.creditos             = "indica los créditos";
    if (!form.profesorNombre.trim())       e.profesorNombre       = "indica el profesor principal";
    if (!form.profesorDepartamento.trim()) e.profesorDepartamento = "indica su departamento";
    return e;
  };

  // manejador del envío del formulario
  const handleSubmit = async (ev) => {
    ev.preventDefault(); // evitamos que el formulario recargue la página

    // ejecutamos la validación y guardamos los errores en el estado para mostrarlos
    const e = validar();
    setErrores(e);

    // si hay algún error no continuamos con el envío
    if (Object.keys(e).length > 0) return;

    setEnviando(true);
    try {
      // llamamos a onCrear con el objeto formateado listo para enviar al backend.
      // los campos numéricos se convierten de string (valor del input) a number
      // y el profesor se mete en un array porque el modelo acepta varios profesores
      await onCrear({
        nombre:       form.nombre.trim(),
        codigo:       Number(form.codigo),
        curso:        Number(form.curso),
        cuatrimestre: Number(form.cuatrimestre),
        creditos:     Number(form.creditos),
        profesores: [
          {
            nombre:       form.profesorNombre.trim(),
            departamento: form.profesorDepartamento.trim(),
          },
        ],
      });

      // si onCrear no lanzó error, limpiamos el formulario dejándolo vacío de nuevo
      setForm(FORM_VACIO);
    } finally {
      // tanto si hubo error como si no, volvemos a habilitar el botón
      setEnviando(false);
    }
  };

  return (
    <section className="formulario">
      <h2>Añadir asignatura</h2>
      <form onSubmit={handleSubmit}>
        <div className="campo">
          <label>Nombre</label>
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            placeholder="Ej. Lengua y Literatura"
          />
          {errores.nombre && <p className="error">{errores.nombre}</p>}
        </div>

        <div className="campo">
          <label>Código</label>
          <input
            type="number"
            value={form.codigo}
            onChange={(e) => setForm({ ...form, codigo: e.target.value })}
            placeholder="Ej. 1234"
          />
          {errores.codigo && <p className="error">{errores.codigo}</p>}
        </div>

        <div className="campo">
          <label>Curso</label>
          <input
            type="number"
            min="1"
            value={form.curso}
            onChange={(e) => setForm({ ...form, curso: e.target.value })}
            placeholder="Ej. 2"
          />
          {errores.curso && <p className="error">{errores.curso}</p>}
        </div>

        <div className="campo">
          <label>Cuatrimestre</label>
          <input
            type="number"
            min="1"
            value={form.cuatrimestre}
            onChange={(e) => setForm({ ...form, cuatrimestre: e.target.value })}
            placeholder="Ej. 1"
          />
          {errores.cuatrimestre && <p className="error">{errores.cuatrimestre}</p>}
        </div>

        <div className="campo">
          <label>Créditos</label>
          <input
            type="number"
            min="0"
            value={form.creditos}
            onChange={(e) => setForm({ ...form, creditos: e.target.value })}
            placeholder="Ej. 6"
          />
          {errores.creditos && <p className="error">{errores.creditos}</p>}
        </div>

        <div className="campo">
          <label>Profesor principal</label>
          <input
            type="text"
            value={form.profesorNombre}
            onChange={(e) => setForm({ ...form, profesorNombre: e.target.value })}
            placeholder="Ej. Ana López"
          />
          {errores.profesorNombre && <p className="error">{errores.profesorNombre}</p>}
        </div>

        <div className="campo">
          <label>Departamento del profesor</label>
          <input
            type="text"
            value={form.profesorDepartamento}
            onChange={(e) => setForm({ ...form, profesorDepartamento: e.target.value })}
            placeholder="Ej. Lengua y Literatura"
          />
          {errores.profesorDepartamento && (
            <p className="error">{errores.profesorDepartamento}</p>
          )}
        </div>

        <button type="submit" disabled={enviando} className="boton-principal">
          {enviando ? "Añadiendo..." : "Añadir asignatura"}
        </button>
      </form>
    </section>
  );
}

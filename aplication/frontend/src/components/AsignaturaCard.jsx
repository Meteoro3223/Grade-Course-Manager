import React from "react";
import { Link } from "react-router-dom";

export default function AsignaturaCard({ asignatura }) {
  return (
    <Link to={`/asignaturas/${asignatura.codigo}`} className="tarjeta">
      <p className="tarjeta-nombre">{asignatura.nombre}</p>
      <p className="tarjeta-curso">
        Código {asignatura.codigo}
        {asignatura.curso !== undefined && asignatura.curso !== null
          ? ` · ${asignatura.curso}º curso`
          : ""}
      </p>
      <p className="tarjeta-profesores">
        {asignatura.profesores?.length || 0}{" "}
        {asignatura.profesores?.length === 1 ? "profesor" : "profesores"}
      </p>
    </Link>
  );
}

import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../index.css";
import { apiCalendario } from "../api/calendario";

export default function Calendario() {

  const [fecha, setFecha] = useState(new Date());
  const [evento, setEvento] = useState("");
  const [eventos, setEventos] = useState([]);

  // Cargar todos los eventos al abrir la página
  useEffect(() => {
    cargarEventos();
  }, []);

  const cargarEventos = async () => {
    try {
      const datos = await apiCalendario.getAll();
      setEventos(datos);
    } catch (error) {
      console.error(error);
    }
  };

  // Guardar un nuevo evento
  const guardarEvento = async () => {

    if (!evento.trim()) return;

    try {

      await apiCalendario.registrar({
        fecha: fecha.toISOString().split("T")[0],
        texto: evento.trim()
      });

      await cargarEventos();

      setEvento("");

    } catch (error) {
      console.error(error);
    }
  };

  // Fecha seleccionada con el mismo formato que MongoDB
  const fechaSeleccionada = fecha.toISOString().split("T")[0];

  return (

    <main className="calendario-container">

      <h2>Calendario</h2>

      <Calendar onChange={setFecha} value={fecha}/>

      <h3 className="fecha-seleccionada">
        {fecha.toDateString()}
      </h3>

      <div className="evento-formulario">

        <input
          type="text"
          placeholder="Añadir evento"
          value={evento}
          onChange={(e) => setEvento(e.target.value)}
        />

        <button onClick={guardarEvento}>
          Guardar
        </button>

      </div>

      <ul>
        {eventos
          .filter((e) => e.fecha === fechaSeleccionada)
          .map((e) => (
            <li key={e._id}>
              {e.texto}
            </li>
          ))}
      </ul>
    </main>
  )
}
import axios from "axios";

// Rutas definidas en server.js:
// app.use("/api/profesores", conexionProfesores)
// que a su vez define en conexionProfesores.js:
//   POST   /registrar           -> controlProfesores.registrar
//   GET    /                    -> controlProfesores.obtenerProfesores
//   GET    /:id                 -> controlProfesores.obtenerProfesorPorId
//   DELETE /eliminar/:id        -> controlProfesores.eliminar

const BASE = "http://localhost:3000/api/profesores";

export const apiProfesores = {
  getAll: () => axios.get(BASE).then((r) => r.data),

  getById: (id) => axios.get(`${BASE}/${id}`).then((r) => r.data),

  registrar: (body) =>
    axios.post(`${BASE}/registrar`, body).then((r) => r.data),

  eliminar: (id) =>
    axios.delete(`${BASE}/eliminar/${id}`).then((r) => r.data),
};
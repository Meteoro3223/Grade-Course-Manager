import axios from "axios";

// Rutas definidas en server.js:
// app.use("/api/asignaturas", conexionAsignaturas)
// que a su vez define en conexionAsignaturas.js:
//   POST   /registrar           -> controlAsignaturas.registrar
//   GET    /                    -> controlAsignaturas.obtenerAsignaturas
//   GET    /:codigo             -> controlAsignaturas.obtenerAsignaturaPorCodigo
//   DELETE /eliminar/:id        -> controlAsignaturas.eliminar

const BASE = "http://localhost:3000/api/asignaturas";

export const apiAsignaturas = {
  getAll: (usuario) =>
    axios.get(BASE, { params: { usuario } }).then((r) => r.data),

  getByCodigo: (codigo, usuario) =>
    axios.get(`${BASE}/${codigo}`, { params: { usuario } }).then((r) => r.data),

  registrar: (body) =>
    axios.post(`${BASE}/registrar`, body).then((r) => r.data),

  eliminar: (id, usuario) =>
    axios
      .delete(`${BASE}/eliminar/${id}`, { params: { usuario } })
      .then((r) => r.data),

  actualizarProfesores: (id, profesores, usuario) =>
    axios
      .patch(`${BASE}/actualizar/${id}`, { profesores, usuario })
      .then((r) => r.data),
};
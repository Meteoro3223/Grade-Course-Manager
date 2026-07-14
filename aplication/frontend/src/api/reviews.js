import axios from "axios";

const BASE = "http://localhost:3000/api/reviews";

export const apiReviews = {
  registrar: (body) =>
    axios.post(`${BASE}/registrar`, body).then((r) => r.data),

  getAll: () =>
    axios.get(BASE).then((r) => r.data),

  getPorProfesor: (id) =>
    axios.get(`${BASE}/profesor/${id}`).then((r) => r.data),

  eliminar: (id, usuario) =>
    axios
      .delete(`${BASE}/eliminar/${id}`, { params: { usuario } })
      .then((r) => r.data),
};
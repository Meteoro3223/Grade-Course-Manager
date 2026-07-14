import axios from "axios";

const BASE = "http://localhost:3000/api/notas";

export const apiNotas = {
  registrar: (body) => axios.post(`${BASE}/registrar`, body).then(r => r.data),
  getAll: () => axios.get(BASE).then(r => r.data),
  getPorAsignatura: (id) => axios.get(`${BASE}/asignatura/${id}`).then(r => r.data),
  eliminar: (id) => axios.delete(`${BASE}/eliminar/${id}`).then(r => r.data),
};

import axios from "axios";

const BASE = "http://localhost:3000/api/usuarios";

export const apiUsuarios = {
  registrar: (body) => axios.post(`${BASE}/registrar`, body).then(r => r.data),
  login: (body) => axios.post(`${BASE}/login`, body).then(r => r.data),
  getAll: () => axios.get(BASE).then(r => r.data),
  eliminar: (id) => axios.delete(`${BASE}/eliminar/${id}`).then(r => r.data),
};

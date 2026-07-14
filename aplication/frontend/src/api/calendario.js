import axios from "axios";

const BASE = "http://localhost:3000/api/calendario";

export const apiCalendario = {

  getAll: () =>
    axios.get(BASE).then((r) => r.data),

  registrar: (body) =>
    axios.post(`${BASE}/registrar`, body).then((r) => r.data),

  eliminar: (id) =>
    axios.delete(`${BASE}/eliminar/${id}`).then((r) => r.data),

};
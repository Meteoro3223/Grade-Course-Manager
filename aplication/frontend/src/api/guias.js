import axios from "axios";

const API_URL = "http://localhost:3000/api/guias";

export const apiGuias = {
  procesar: async (archivo) => {
    const formData = new FormData();

    formData.append("guia", archivo);

    const res = await axios.post(`${API_URL}/procesar`, formData);

    return res.data;
  },
};
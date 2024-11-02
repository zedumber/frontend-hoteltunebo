// src/plugins/axios.js
import axios from "axios";

//export const DEFAULT_CUSTOMER_NAME = "ClientePorDefecto";

const instance = axios.create({
  baseURL: "http://172.233.174.221:8001/api", // Asegúrate de que esta URL sea correcta
  // baseURL: 'http://194.195.210.164:8000/api', // Asegúrate de que esta URL sea correcta
  timeout: 11000, // Aumenta el tiempo de espera para evitar problemas de red lentos
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Añadir un interceptor para incluir el token en cada solicitud
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;

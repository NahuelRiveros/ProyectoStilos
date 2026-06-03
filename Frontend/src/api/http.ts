import axios from "axios";
import { authConfig } from "../config/auth_config";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  withCredentials: true,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(authConfig.storageKey);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el servidor devuelve 401 y el usuario tenía token → sesión expirada
http.interceptors.response.use(
  (res) => res,
  (error) => {
    const status      = error.response?.status;
    const tokenExists = !!localStorage.getItem(authConfig.storageKey);
    if (status === 401 && tokenExists) {
      window.dispatchEvent(new CustomEvent("session:expired"));
    }
    return Promise.reject(error);
  },
);

// Tipo envelope que usa el backend en todas las respuestas (okResponse / createdResponse)
export interface ApiResponse<T> {
  ok:          boolean;
  mensaje:     string;
  data:        T;
  pagination?: Pagination;
}

export interface Pagination {
  total:        number;
  pagina:       number;
  total_paginas: number;
}

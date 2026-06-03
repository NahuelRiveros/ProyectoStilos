import { http } from "./http";

export const getUsuarios        = (params)        => http.get("/usuarios", { params });
export const getUsuario         = (id)            => http.get(`/usuarios/${id}`);
export const createUsuario      = (data)          => http.post("/usuarios", data);
export const updateUsuario      = (id, data)      => http.put(`/usuarios/${id}`, data);
export const deleteUsuario      = (id)            => http.delete(`/usuarios/${id}`);
export const reactivarUsuario   = (id)            => http.put(`/usuarios/${id}/reactivar`);
export const asignarRoles       = (id, roles)     => http.put(`/usuarios/${id}/roles`, { roles });
export const agregarRol         = (id, abr)       => http.post(`/usuarios/${id}/roles/${abr}`);
export const quitarRol          = (id, abr)       => http.delete(`/usuarios/${id}/roles/${abr}`);
export const resetPasswordAdmin = (id, password)  => http.put(`/usuarios/${id}/password`, { password });
export const getPerfil          = ()              => http.get("/usuarios/perfil");

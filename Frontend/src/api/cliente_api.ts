import { http, type ApiResponse } from "./http";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface CondicionIvaPerfil {
  id:     number;
  codigo: string;
  nombre: string;
}

export interface Direccion {
  id:            number;
  alias:         string;
  calle:         string;
  numero:        string;
  piso:          string | null;
  depto:         string | null;
  codigo_postal: string;
  localidad:     string;
  provincia:     string;
  es_default:    boolean;
}

export interface PerfilCliente {
  id:            number;
  telefono:      string | null;
  dni:           string | null;
  cuit:          string | null;
  razon_social:  string | null;
  condicion_iva: CondicionIvaPerfil | null;
  direcciones:   Direccion[];
}

export interface UpdatePerfilPayload {
  telefono?:        string;
  dni?:             string;
  cuit?:            string;
  razon_social?:    string;
  condicion_iva_id?: number | null;
}

export interface CrearDireccionPayload {
  alias?:         string;
  calle:          string;
  numero:         string;
  piso?:          string;
  depto?:         string;
  codigo_postal:  string;
  localidad:      string;
  provincia:      string;
  es_default?:    boolean;
}

export type UpdateDireccionPayload = Partial<Omit<CrearDireccionPayload, "es_default">>;

// ─── Perfil ───────────────────────────────────────────────────────────────────

/**
 * GET /clientes/perfil
 * Obtiene el perfil extendido del usuario (se crea automáticamente si no existe).
 */
export async function getPerfil(): Promise<PerfilCliente> {
  const r = await http.get<ApiResponse<PerfilCliente>>("/clientes/perfil");
  return r.data.data;
}

/**
 * PUT /clientes/perfil
 * Actualiza los campos que se envíen (parcial — solo los presentes en el body).
 */
export async function updatePerfil(data: UpdatePerfilPayload): Promise<PerfilCliente> {
  const r = await http.put<ApiResponse<PerfilCliente>>("/clientes/perfil", data);
  return r.data.data;
}

// ─── Direcciones ──────────────────────────────────────────────────────────────

/** GET /clientes/direcciones — lista las direcciones activas del usuario */
export async function getDirecciones(): Promise<Direccion[]> {
  const r = await http.get<ApiResponse<Direccion[]>>("/clientes/direcciones");
  return r.data.data;
}

/** POST /clientes/direcciones — guarda una nueva dirección */
export async function crearDireccion(data: CrearDireccionPayload): Promise<Direccion> {
  const r = await http.post<ApiResponse<Direccion>>("/clientes/direcciones", data);
  return r.data.data;
}

/** PUT /clientes/direcciones/:id — edita una dirección existente */
export async function updateDireccion(id: number, data: UpdateDireccionPayload): Promise<Direccion> {
  const r = await http.put<ApiResponse<Direccion>>(`/clientes/direcciones/${id}`, data);
  return r.data.data;
}

/** DELETE /clientes/direcciones/:id — elimina (soft delete) una dirección */
export async function deleteDireccion(id: number): Promise<void> {
  await http.delete(`/clientes/direcciones/${id}`);
}

/** PUT /clientes/direcciones/:id/default — marca la dirección como predeterminada */
export async function setDireccionDefault(id: number): Promise<Direccion> {
  const r = await http.put<ApiResponse<Direccion>>(`/clientes/direcciones/${id}/default`);
  return r.data.data;
}

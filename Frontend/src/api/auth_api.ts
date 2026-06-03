import { http } from "./http";
import { authConfig } from "../config/auth_config";

export interface LoginPayload {
  email: string;
  password: string;
  [key: string]: unknown;
}

export interface RegisterPayload {
  nombre?: string;
  apellido?: string;
  email: string;
  password: string;
  [key: string]: unknown;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
  [key: string]: unknown;
}

export interface AuthApiResponse {
  token?: string;
  usuario?: Record<string, unknown>;
  user?: Record<string, unknown>;
  [key: string]: unknown;
}

export async function authLogin(payload: LoginPayload): Promise<AuthApiResponse> {
  const r = await http.post<AuthApiResponse>(authConfig.endpoints.login, payload);
  return r.data;
}

export async function authMe(): Promise<AuthApiResponse> {
  const r = await http.get<AuthApiResponse>(authConfig.endpoints.me);
  return r.data;
}

export async function authLogout(): Promise<void> {
  await http.post(authConfig.endpoints.logout);
}

export async function authForgotPassword(payload: ForgotPasswordPayload): Promise<AuthApiResponse> {
  const r = await http.post<AuthApiResponse>(authConfig.endpoints.forgotPassword, payload);
  return r.data;
}

export async function authResetPassword(payload: ResetPasswordPayload): Promise<AuthApiResponse> {
  const r = await http.post<AuthApiResponse>(authConfig.endpoints.resetPassword, payload);
  return r.data;
}

export async function authRegister(payload: RegisterPayload): Promise<AuthApiResponse> {
  const r = await http.post<AuthApiResponse>(authConfig.endpoints.register, payload);
  return r.data;
}

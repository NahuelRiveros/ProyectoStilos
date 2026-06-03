import { http } from "./http";
import { authConfig } from "../config/auth_config";

export async function authLogin(payload) {
  const r = await http.post(authConfig.endpoints.login, payload);
  return r.data;
}

export async function authMe() {
  const r = await http.get(authConfig.endpoints.me);
  return r.data;
}

export async function authLogout() {
  await http.post(authConfig.endpoints.logout);
}

export async function authForgotPassword(payload) {
  const r = await http.post(authConfig.endpoints.forgotPassword, payload);
  return r.data;
}

export async function authResetPassword(payload) {
  const r = await http.post(authConfig.endpoints.resetPassword, payload);
  return r.data;
}

export async function authRegister(payload) {
  const r = await http.post(authConfig.endpoints.register, payload);
  return r.data;
}

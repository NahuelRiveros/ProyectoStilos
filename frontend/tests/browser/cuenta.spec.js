import { Buffer } from "node:buffer";
import { test, expect } from "@playwright/test";
import { PEDIDO_CUENTA, conPedidoLocal, simularApi, sinDesborde } from "./api_simulada.js";

// Cuenta del cliente (ROP-40 a ROP-53). La API simulada no prueba dueños ni transacciones: eso lo
// cubre servidor/tests/ropa.integration.mjs.

test("checkout con cuenta: sin datos bancarios no ofrece transferencia y un reintento no duplica el pedido", async ({ page }) => {
  const api = await simularApi(page, { rol: "cliente" });
  await conPedidoLocal(page);
  // El primer envío "se corta" (sin respuesta del servidor); el segundo entra.
  let intentos = 0;
  api.responder("POST", "/ropa/mi-cuenta/pedidos", () => (++intentos === 1
    ? { status: 503, json: { ok: false, mensaje: "El servidor está despertando. Probá de nuevo." } }
    : { json: { ok: true, mensaje: "Pedido #00013 recibido.", data: PEDIDO_CUENTA } }));

  await page.goto("/pedido");
  await expect(page.getByText("A nombre de")).toContainText("Ana Gómez");
  await page.getByText("Retiro en el local").click();
  // ROP-47: los datos bancarios de Stilos están [COMPLETAR]: no se ofrece transferencia.
  await expect(page.getByText("Transferencia", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Efectivo al retirar")).toBeVisible();
  await page.getByText("Envío a domicilio").click();
  await expect(page.getByText("Efectivo al retirar"), "efectivo solo al retirar").toHaveCount(0);
  await expect(page.getByRole("textbox", { name: "Dirección" }), "trae el domicilio de Mis datos").toHaveValue("Belgrano 50");
  await page.getByText("A coordinar por WhatsApp").click();

  await page.getByRole("button", { name: "Confirmar pedido" }).click();
  await expect(page.getByText("El servidor está despertando. Probá de nuevo.")).toBeVisible();
  await page.getByRole("button", { name: "Confirmar pedido" }).click();
  await expect(page).toHaveURL(/\/mis-pedidos\/13$/);
  await expect(page.getByRole("heading", { name: "Pedido #00013" })).toBeVisible();

  const envios = api.pedidos.filter((p) => p.metodo === "POST" && p.ruta === "/ropa/mi-cuenta/pedidos");
  expect(envios).toHaveLength(2);
  // ROP-43: los dos intentos con la misma clave: el servidor devuelve el mismo pedido.
  expect(envios[1].cuerpo.clave_envio).toBe(envios[0].cuerpo.clave_envio);
  expect(envios[1].cuerpo).toMatchObject({ entrega: "envio", direccion: "Belgrano 50", localidad: "Formosa", forma_pago: "coordinar", items: [{ variante_id: 12, cantidad: 2 }] });
});

test("con datos incompletos pide completarlos antes de confirmar y los guarda", async ({ page }) => {
  const api = await simularApi(page, { rol: "cliente", datosCompletos: false });
  await conPedidoLocal(page);
  await page.goto("/pedido");
  await expect(page.getByRole("button", { name: "Confirmar pedido" })).toHaveCount(0);
  await page.getByRole("link", { name: "Completar mis datos" }).click();

  await expect(page.getByRole("heading", { name: "Mis datos" })).toBeVisible();
  await page.getByLabel("Celular").fill("3704 555555");
  await page.getByRole("button", { name: "Guardar mis datos" }).click();
  await expect(page.getByText("Guardamos tus datos.")).toBeVisible();
  expect(api.ultimo("PUT", "/ropa/mi-cuenta/datos").cuerpo).toMatchObject({ nombre: "Ana", apellido: "Gómez", celular: "3704 555555", direccion: "Belgrano 50" });
  // ROP-65: al guardar vuelve al pedido para confirmarlo.
  await expect(page).toHaveURL(/\/pedido$/);
  await sinDesborde(page);
});

test("mi pedido: avance, subir el comprobante y cancelar con motivo", async ({ page }) => {
  const api = await simularApi(page, { rol: "cliente" });
  await page.goto("/mis-pedidos");
  await page.getByRole("link", { name: /#00013/ }).click();

  await expect(page.getByRole("list", { name: "Avance del pedido" }).getByText("Recibido")).toBeVisible();
  await page.getByLabel("¿Ya transferiste? Subí el comprobante").setInputFiles({ name: "comprobante.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.7 comprobante de prueba") });
  await page.getByRole("button", { name: "Enviar comprobante" }).click();
  await expect(page.getByText("Recibimos tu comprobante. Lo revisamos y te avisamos.")).toBeVisible();
  expect(api.ultimo("POST", "/ropa/mi-cuenta/pedidos/13/comprobantes").cuerpo.archivo).toContain("%PDF-1.7 comprobante de prueba");

  await page.getByRole("button", { name: "Cancelar pedido" }).click();
  const dialogo = page.getByRole("dialog");
  await dialogo.getByLabel("¿Por qué lo cancelás?").fill("no");
  await dialogo.getByRole("button", { name: "Cancelar pedido" }).click();
  await expect(dialogo.getByText("Contanos el motivo (al menos 3 letras).")).toBeVisible();
  expect(api.ultimo("POST", "/ropa/mi-cuenta/pedidos/13/cancelar")).toBeUndefined();
  await dialogo.getByLabel("¿Por qué lo cancelás?").fill("Me equivoqué de talle");
  await dialogo.getByRole("button", { name: "Cancelar pedido" }).click();
  await expect(page.getByText("Cancelaste el pedido.")).toBeVisible();
  expect(api.ultimo("POST", "/ropa/mi-cuenta/pedidos/13/cancelar").cuerpo).toEqual({ motivo: "Me equivoqué de talle" });
  await sinDesborde(page);
});

test("sin sesión, Mis pedidos lleva a ingresar con la vuelta a Mis pedidos", async ({ page }) => {
  await simularApi(page);
  await page.goto("/mis-pedidos");
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fmis-pedidos/);
});

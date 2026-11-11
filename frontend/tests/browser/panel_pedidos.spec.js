import { test, expect } from "@playwright/test";
import { simularApi, sinDesborde } from "./api_simulada.js";

// Panel de pedidos (ROP-54 a ROP-57). Los permisos los vuelve a controlar el servidor
// (servidor/tests/ropa.integration.mjs › "ROP-20 por HTTP…"); acá, que la pantalla no ofrezca lo que no corresponde.

test("encargado: busca, confirma con la versión que vio y revisa el comprobante", async ({ page }) => {
  const api = await simularApi(page, { rol: "encargado" });
  await page.goto("/admin/ropa/pedidos");
  await page.getByLabel("Buscar pedidos").fill("ana");
  await page.getByLabel("Buscar pedidos").press("Enter");
  await expect.poll(() => api.ultimo("GET", "/ropa/pedidos")?.query).toMatchObject({ q: "ana", estado: "recibido" });
  await page.getByLabel("Pago").selectOption("en_revision");
  await expect.poll(() => api.ultimo("GET", "/ropa/pedidos")?.query.pago).toBe("en_revision");

  await page.getByRole("button", { name: /#00013/ }).click();
  const dialogo = page.getByRole("dialog");
  await expect(dialogo.getByText("Comprobante en revisión")).toBeVisible();

  // ROP-50: rechazar pide motivo (lo lee el cliente).
  await dialogo.getByRole("button", { name: "Rechazar" }).click();
  const confirmarRechazo = dialogo.getByRole("button", { name: "Confirmar rechazo" });
  await expect(confirmarRechazo).toBeDisabled();
  await dialogo.getByLabel("Motivo del rechazo").fill("No se lee el importe");
  await confirmarRechazo.click();
  await expect(page.getByText("Comprobante rechazado. Le avisamos al cliente.")).toBeVisible();
  expect(api.ultimo("POST", "/ropa/pedidos/13/comprobantes/4/rechazar").cuerpo).toEqual({ motivo: "No se lee el importe" });

  await dialogo.getByRole("button", { name: "Aceptar" }).click();
  await expect(page.getByText("Pago aceptado: el pedido quedó Confirmado.")).toBeVisible();

  // ROP-54: el próximo paso viaja con la versión que se vio.
  await dialogo.getByRole("button", { name: "Confirmar pedido" }).click();
  await expect(page.getByText("Pedido #00013: Confirmado.")).toBeVisible();
  expect(api.ultimo("PATCH", "/ropa/pedidos/13/estado").cuerpo).toEqual({ estado: "confirmado", version: 2 });
  await sinDesborde(page);
});

test("si otra persona cambió el pedido, se avisa y no se pisa", async ({ page }) => {
  const api = await simularApi(page, { rol: "encargado" });
  api.responder("PATCH", "/ropa/pedidos/13/estado", () => ({ status: 409, json: { ok: false, codigo: "CAMBIO_SIMULTANEO", mensaje: "Otra persona cambió este pedido recién. Actualizá para ver cómo quedó." } }));
  await page.goto("/admin/ropa/pedidos");
  await page.getByRole("button", { name: /#00013/ }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Confirmar pedido" }).click();
  await expect(page.getByRole("dialog").getByText("Otra persona cambió este pedido recién. Actualizá para ver cómo quedó.")).toBeVisible();
});

test("vendedor: ve el comprobante pero no mueve dinero; cancelar pide motivo", async ({ page }) => {
  const api = await simularApi(page, { rol: "vendedor" });
  await page.goto("/admin/ropa/pedidos");
  await page.getByRole("button", { name: /#00013/ }).click();
  const dialogo = page.getByRole("dialog");
  await expect(dialogo.getByRole("button", { name: "Ver" })).toBeVisible();
  await expect(dialogo.getByRole("button", { name: "Aceptar" })).toHaveCount(0);
  await expect(dialogo.getByRole("button", { name: "Rechazar" })).toHaveCount(0);

  await dialogo.getByLabel("Otro cambio de estado").selectOption("cancelado");
  const aplicar = dialogo.getByRole("button", { name: "Aplicar" });
  await expect(aplicar).toBeDisabled();
  await dialogo.getByLabel("Motivo").fill("Sin stock del talle");
  await aplicar.click();
  await expect.poll(() => api.ultimo("PATCH", "/ropa/pedidos/13/estado")?.cuerpo).toEqual({ estado: "cancelado", motivo: "Sin stock del talle", version: 2 });
});

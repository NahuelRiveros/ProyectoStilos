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

test("prenda nueva: elegir la categoría propone sus talles (ROP-36)", async ({ page }) => {
  const api = await simularApi(page, { rol: "encargado" });
  const talles = (...nombres) => nombres.map((nombre, orden) => ({ id: 100 + orden + nombres.length * 10, nombre, orden }));
  const grupos = [
    { id: 1, nombre: "Ropa", orden: 0, talles: talles("S", "M", "L") },
    { id: 2, nombre: "Jeans", orden: 1, talles: talles("38", "40", "42") },
  ];
  const categorias = [{ id: 10, nombre: "Hombre", padre_id: null, grupo_talle_id: 1, orden: 0, activo: true, hijas: [
    { id: 11, nombre: "Remeras", padre_id: 10, grupo_talle_id: null, orden: 0, activo: true, hijas: [] },
    { id: 12, nombre: "Pantalones", padre_id: 10, grupo_talle_id: 2, orden: 1, activo: true, hijas: [
      { id: 13, nombre: "Cargo", padre_id: 12, grupo_talle_id: null, orden: 0, activo: true, hijas: [] },
    ] },
  ] }];
  const lista = (datos) => () => ({ json: { ok: true, data: datos } });
  api.responder("GET", "/ropa/panel/categorias", lista(categorias));
  api.responder("GET", "/ropa/panel/talles", lista(grupos));
  api.responder("GET", "/ropa/panel/colores", lista([{ id: 1, nombre: "Negro", hex: "#111111", orden: 0 }]));
  api.responder("GET", "/ropa/panel/marcas", lista([]));
  api.responder("GET", "/ropa/panel/caracteristicas", lista([{ id: 3, nombre: "Material", orden: 0, caracteristicas: [{ id: 31, nombre: "Cuero", orden: 0 }, { id: 32, nombre: "Lona", orden: 1 }] }]));
  api.responder("POST", "/ropa/panel/prendas", () => ({ status: 201, json: { ok: true, mensaje: "Prenda creada.", data: { id: 50 } } }));

  await page.goto("/admin/ropa/prendas/nueva");
  const grupo = page.getByLabel("Grupo de talles");
  await expect(grupo).toHaveValue("1");
  await page.getByLabel("Categoría").selectOption("13");
  await expect(grupo, "Cargo usa los talles de Pantalones").toHaveValue("2");
  await page.getByLabel("Categoría").selectOption("11");
  await expect(grupo, "Remeras usa los de Hombre").toHaveValue("1");

  // ROP-38: las características se tildan y viajan como ids.
  const cuero = page.getByRole("button", { name: "Cuero" });
  await cuero.click();
  await expect(cuero).toHaveAttribute("aria-pressed", "true");
  await page.getByLabel("Nombre").fill("Zapatilla urbana");
  await page.getByLabel("Precio ($)").fill("50000");
  await page.getByRole("button", { name: "Negro" }).click();
  await page.getByRole("button", { name: "Guardar prenda" }).click();
  await expect.poll(() => api.ultimo("POST", "/ropa/panel/prendas")?.cuerpo.caracteristicas).toEqual([31]);
});

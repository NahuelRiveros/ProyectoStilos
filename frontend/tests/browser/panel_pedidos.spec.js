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

test("prenda nueva: primero la categoría, que propone talles y características (ROP-36, ROP-60)", async ({ page }) => {
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
  api.responder("GET", "/ropa/panel/caracteristicas", lista([
    { id: 3, nombre: "Material", orden: 0, categorias: [], caracteristicas: [{ id: 31, nombre: "Cuero", orden: 0 }, { id: 32, nombre: "Lona", orden: 1 }] },
    { id: 4, nombre: "Manga", orden: 1, categorias: [11], caracteristicas: [{ id: 41, nombre: "Corta", orden: 0 }] },
    { id: 5, nombre: "Tiro", orden: 2, categorias: [12], caracteristicas: [{ id: 51, nombre: "Alto", orden: 0 }] },
  ]));
  api.responder("POST", "/ropa/panel/prendas", () => ({ status: 201, json: { ok: true, mensaje: "Prenda creada.", data: { id: 50 } } }));

  await page.goto("/admin/ropa/prendas/nueva");
  const boton = (name) => page.getByRole("button", { name, exact: true });
  // Primero la categoría: hasta elegirla, el resto no aparece.
  await expect(page.getByText("Elegí la categoría para seguir", { exact: false })).toBeVisible();
  await expect(page.getByLabel("Nombre")).toHaveCount(0);
  await boton("Hombre").click();
  await boton("Pantalones").click();
  await boton("Cargo").click();
  await expect(page.getByRole("status").filter({ hasText: "Vas a cargar en" })).toContainText("Hombre");
  const grupo = page.getByLabel("Grupo de talles");
  await expect(grupo, "ROP-36: Cargo usa los talles de Pantalones").toHaveValue("2");
  // ROP-60: solo los grupos de la categoría; Cargo hereda los de Pantalones.
  await expect(boton("Alto")).toBeVisible();
  await expect(boton("Corta")).toHaveCount(0);

  await boton("Remeras").click();
  await expect(grupo, "Remeras usa los de Hombre").toHaveValue("1");
  await expect(boton("Corta")).toBeVisible();
  await expect(boton("Alto")).toHaveCount(0);
  await page.getByRole("button", { name: /Ver todas las características/ }).click();
  await expect(boton("Alto")).toBeVisible();

  // ROP-38: las características se tildan y viajan como ids.
  await boton("Cuero").click();
  await expect(boton("Cuero")).toHaveAttribute("aria-pressed", "true");
  await page.getByLabel("Nombre").fill("Remera urbana");
  await page.getByLabel("Precio ($)").fill("50000");
  await boton("Negro").click();
  // Cada talle se toca para pasar de Hay a Agotado y a No se vende.
  await page.getByRole("button", { name: "Talle M: hay" }).click();
  await page.getByRole("button", { name: "Talle L: hay" }).click();
  await page.getByRole("button", { name: "Talle L: agotado" }).click();
  await expect(page.getByRole("button", { name: "Talle L: no se vende" })).toBeVisible();
  await page.getByRole("button", { name: "Guardar prenda" }).click();
  await expect.poll(() => api.ultimo("POST", "/ropa/panel/prendas")?.cuerpo).toMatchObject({
    categoria_id: 11, grupo_talle_id: 1, caracteristicas: [31],
    variantes: [{ color_id: 1, talle_id: 130, disponible: true }, { color_id: 1, talle_id: 131, disponible: false }],
  });
});

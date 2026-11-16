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
  // ROP-64: el aviso por WhatsApp lleva el estado y el link de seguimiento.
  const aviso = dialogo.getByRole("link", { name: "Avisarle por WhatsApp: Recibido" });
  const texto = decodeURIComponent(await aviso.getAttribute("href"));
  expect(texto).toContain("¡Hola Ana! Te escribimos de");
  expect(texto).toContain("por tu pedido #00013: lo recibimos y lo estamos revisando.");
  expect(texto).toMatch(/Podés seguirlo acá: http:\/\/[^/]+\/seguimiento\/k7Qx2abcdefghijklmnopq/);

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

test("prenda nueva: primero la categoría, que propone talles y características (ROP-36, ROP-60, ROP-83, ROP-84, ROP-86)", async ({ page }) => {
  const api = await simularApi(page, { rol: "encargado" });
  const talles = (...nombres) => nombres.map((nombre, orden) => ({ id: 100 + orden + nombres.length * 10, nombre, orden }));
  const grupos = [
    { id: 1, nombre: "Ropa", orden: 0, talles: talles("S", "M", "L") },
    { id: 2, nombre: "Jeans", orden: 1, talles: talles("38", "40", "42") },
    { id: 3, nombre: "Talle único", orden: 2, talles: [{ id: 200, nombre: "Único", orden: 0 }] },
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
  api.responder("GET", "/ropa/panel/colores", lista([
    { id: 1, nombre: "Negro", hex: "#111111", hex2: null, patron: null, orden: 0 },
    { id: 2, nombre: "Negro y blanco", hex: "#111111", hex2: "#FFFFFF", patron: null, orden: 1 },
    { id: 3, nombre: "Animal print", hex: "#C19A6B", hex2: "#3F2A1D", patron: "animal_print", orden: 2 },
  ]));
  api.responder("GET", "/ropa/panel/marcas", lista([]));
  api.responder("GET", "/ropa/panel/caracteristicas", lista([
    { id: 3, nombre: "Material", orden: 0, categorias: [], caracteristicas: [{ id: 31, nombre: "Cuero", orden: 0 }, { id: 32, nombre: "Lona", orden: 1 }] },
    { id: 4, nombre: "Manga", orden: 1, categorias: [11], caracteristicas: [{ id: 41, nombre: "Corta", orden: 0 }] },
    { id: 5, nombre: "Tiro", orden: 2, categorias: [12], caracteristicas: [{ id: 51, nombre: "Alto", orden: 0 }] },
  ]));
  api.responder("POST", "/ropa/panel/prendas", () => ({ status: 201, json: { ok: true, mensaje: "Prenda creada.", data: { id: 50 } } }));
  // ROP-81: otro color del mismo modelo ya tiene código Lince.
  api.responder("GET", "/ropa/panel/prendas/codigo-lince", ({ query }) => ({ json: { ok: true, data: { codigo_lince: query.get("nombre") === "Remera urbana" ? "TV-777" : null } } }));

  await page.goto("/admin/ropa/prendas/nueva");
  const boton = (name) => page.getByRole("button", { name, exact: true });
  // Primero la categoría: hasta elegirla, el resto no aparece.
  await expect(page.getByText("Elegí la categoría para seguir", { exact: false })).toBeVisible();
  await expect(page.getByLabel("Nombre")).toHaveCount(0);
  await boton("Hombre").click();
  await boton("Pantalones").click();
  await boton("Cargo").click();
  await expect(page.getByRole("status").filter({ hasText: "Vas a cargar en" })).toContainText("Hombre");
  // ROP-83: a la vista, el grupo de la categoría y Talle único; los demás, en "Usar otro grupo".
  const grupoTalles = (nombre) => page.getByRole("group", { name: "Grupo de talles" }).getByRole("button", { name: nombre, exact: true });
  await expect(grupoTalles("Jeans"), "ROP-36: Cargo usa los talles de Pantalones").toHaveAttribute("aria-pressed", "true");
  await expect(grupoTalles("Talle único")).toHaveAttribute("aria-pressed", "false");
  await expect(grupoTalles("Ropa")).toHaveCount(0);
  await expect(page.getByLabel("Otro grupo de talles")).toHaveCount(0);
  await boton("Usar otro grupo").click();
  await expect(page.getByLabel("Otro grupo de talles")).toHaveValue("2");
  // ROP-60: solo los grupos de la categoría; Cargo hereda los de Pantalones.
  await expect(boton("Alto")).toBeVisible();
  await expect(boton("Corta")).toHaveCount(0);

  await boton("Remeras").click();
  await expect(grupoTalles("Ropa"), "Remeras usa los de Hombre").toHaveAttribute("aria-pressed", "true");
  await expect(boton("Corta")).toBeVisible();
  await expect(boton("Alto")).toHaveCount(0);
  await page.getByRole("button", { name: /Ver todas las características/ }).click();
  await expect(boton("Alto")).toBeVisible();

  // ROP-38: las características se tildan y viajan como ids.
  await boton("Cuero").click();
  await expect(boton("Cuero")).toHaveAttribute("aria-pressed", "true");
  await page.getByLabel("Nombre").fill("Remera urbana");
  await expect(page.getByLabel(/Código Lince/)).toHaveValue("TV-777");
  await expect(page.getByText("Propuesto: es el código de otro color de este modelo.", { exact: false })).toBeVisible();
  await page.getByLabel("Precio ($)").fill("50000");
  // ROP-86: colores en Básicos, Bitonos y Estampados.
  await expect(page.getByRole("group", { name: "Bitonos" }).getByRole("button")).toHaveText(["Negro y blanco"]);
  await expect(page.getByRole("group", { name: "Estampados" }).getByRole("button")).toHaveText(["Animal print"]);
  await boton("Negro").click();
  // ROP-84: se marcan los que hay (arrancan sin marcar); los demás se guardan como "no hay".
  const talle = (nombre) => page.getByRole("group", { name: "Talles que hay" }).getByRole("button", { name: nombre, exact: true });
  await expect(talle("S")).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "Guardar prenda" }).click();
  await expect(page.getByText("Marcá al menos un talle que haya.")).toBeVisible();
  await talle("S").click();
  await talle("M").click();
  await expect(talle("M")).toHaveAttribute("aria-pressed", "true");
  await expect(talle("L")).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "Guardar prenda" }).click();
  await expect.poll(() => api.ultimo("POST", "/ropa/panel/prendas")?.cuerpo).toMatchObject({
    categoria_id: 11, grupo_talle_id: 1, caracteristicas: [31], codigo_lince: "TV-777",
    variantes: [{ color_id: 1, talle_id: 130, disponible: true }, { color_id: 1, talle_id: 131, disponible: true }, { color_id: 1, talle_id: 132, disponible: false }],
  });
});

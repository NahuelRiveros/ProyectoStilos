import { test, expect } from "@playwright/test";
import { abrirFiltros, simularApi, sinDesborde } from "./api_simulada.js";

// Tienda sin cuenta (ROP-11 a ROP-30): catálogo, ficha y pedido por WhatsApp.

test("catálogo: filtros de la categoría, talles agrupados, características, ofertas y orden quedan en la URL", async ({ page }, info) => {
  const api = await simularApi(page);
  await page.goto("/catalogo?categoria=1");
  await expect(page.getByRole("heading", { name: "Mujer", level: 1 })).toBeVisible();
  // ROP-28: las opciones se piden para la categoría elegida.
  await expect.poll(() => api.ultimo("GET", "/ropa/catalogo/filtros")?.query.categoria).toBe("1");
  await abrirFiltros(page, info);
  await expect(page.getByText("Niños", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Talle 8 (Niños)" })).toBeVisible();

  // ROP-39: varias características a la vez, juntas en la URL; tocar una elegida la saca.
  await page.getByRole("button", { name: "Liso" }).click();
  await page.getByRole("button", { name: "Algodón" }).click();
  await expect(page).toHaveURL(/car=1%2C5/);
  await expect(page.getByRole("button", { name: "Algodón" })).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => api.ultimo("GET", "/ropa/catalogo/prendas")?.query.car).toBe("1,5");
  await page.getByRole("button", { name: "Liso" }).click();
  await expect(page).toHaveURL(/car=5(&|$)/);

  // El tilde sigue a la URL (se marca cuando termina la navegación): se toca y se espera.
  await page.getByLabel("Solo ofertas").click();
  await expect(page.getByLabel("Solo ofertas")).toBeChecked();
  await expect(page).toHaveURL(/ofertas=1/);
  await page.getByLabel("Ordenar").selectOption("menor_precio");
  await expect(page).toHaveURL(/orden=menor_precio/);
  await expect.poll(() => api.ultimo("GET", "/ropa/catalogo/prendas")?.query).toMatchObject({ categoria: "1", ofertas: "1", orden: "menor_precio" });

  // Quitar filtros saca las ofertas pero conserva el orden y la categoría.
  await page.getByRole("button", { name: "Quitar filtros" }).click();
  await expect(page).toHaveURL(/orden=menor_precio/);
  await expect(page).not.toHaveURL(/ofertas=1/);
  await expect(page.getByText("Oferta", { exact: true }).first()).toBeVisible();
  await sinDesborde(page);
});

test("ficha: oferta, características, talle agotado, \"También en\" y compartir copia el link", async ({ page, context }) => {
  await simularApi(page);
  // Sin menú de compartir (como en la computadora): se copia el link.
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
    window.__copiado = null;
    Object.defineProperty(navigator, "clipboard", { value: { writeText: async (t) => { window.__copiado = t; } }, configurable: true });
  });
  await context.grantPermissions(["clipboard-write"]).catch(() => {});
  await page.goto("/catalogo/remera-taverniti-negro");
  await expect(page.getByRole("heading", { name: "Remera Taverniti", level: 1 })).toBeVisible();
  await expect(page.getByText("Taverniti", { exact: true })).toBeVisible();
  // ROP-58: agrupadas.
  const caracteristicas = page.getByRole("definition");
  await expect(caracteristicas).toHaveText(["Liso", "Algodón"]);
  await expect(page.getByRole("term")).toHaveText(["Estampa", "Material"]);
  await expect(page.getByText("Antes:", { exact: false })).toBeAttached();
  await expect(page.getByRole("button", { name: "Talle L, agotado" })).toBeDisabled();

  await page.getByRole("button", { name: "Compartir" }).click();
  await expect(page.getByText("Copiamos el link de la prenda.")).toBeVisible();
  expect(await page.evaluate(() => window.__copiado)).toMatch(/\/catalogo\/remera-taverniti-negro$/);

  // ROP-30: el otro color es otra prenda, con su propia dirección.
  await page.getByRole("link", { name: "Ver en Rojo" }).click();
  await expect(page).toHaveURL(/\/catalogo\/remera-taverniti-rojo$/);
  await expect(page.getByText("Color: Rojo")).toBeVisible();
  await expect(page.getByRole("heading", { name: "También te puede gustar" })).toBeVisible();
  await sinDesborde(page);
});

test("pedido sin cuenta: se arma en la ficha, pide dirección para envío y se envía una sola vez", async ({ page }) => {
  const api = await simularApi(page);
  await page.goto("/catalogo/remera-taverniti-negro");
  await page.getByRole("button", { name: "Talle M" }).click();
  await page.getByRole("button", { name: "Una más" }).click();
  await page.getByRole("button", { name: "Agregar al pedido" }).click();
  await page.getByRole("link", { name: /Ver mi pedido \(2\)/ }).click();

  await expect(page.getByRole("heading", { name: "Mi pedido" })).toBeVisible();
  await expect(page.getByText(/Te faltan \$ 113\.000 para el envío gratis/)).toBeVisible();
  await page.getByLabel("Tu nombre").fill("Ana");
  await page.getByLabel("Tu celular").fill("3704 123456");
  await page.getByText("Envío a domicilio").click();
  await page.getByRole("button", { name: "Enviar pedido" }).click();
  await expect(page.getByText("Escribí la dirección de entrega (calle y número).")).toBeVisible();
  expect(api.ultimo("POST", "/ropa/catalogo/pedidos")).toBeUndefined();

  await page.getByRole("textbox", { name: "Dirección" }).fill("San Martín 123");
  await page.getByLabel("Localidad").fill("Formosa");
  await page.getByRole("button", { name: "Enviar pedido" }).click();
  await expect(page.getByRole("heading", { name: "Pedido #00007 registrado" })).toBeVisible();

  const enviados = api.pedidos.filter((p) => p.metodo === "POST" && p.ruta === "/ropa/catalogo/pedidos");
  expect(enviados).toHaveLength(1);
  // ROP-14: el navegador manda variante y cantidad, nunca precios.
  expect(enviados[0].cuerpo).toEqual({ nombre: "Ana", celular: "3704 123456", entrega: "envio", direccion: "San Martín 123", localidad: "Formosa", items: [{ variante_id: 12, cantidad: 2 }] });
  const whatsapp = await page.getByRole("link", { name: "Abrir WhatsApp" }).getAttribute("href");
  expect(decodeURIComponent(whatsapp)).toContain("Entrega: Envío a San Martín 123, Formosa");
  // ROP-62: el mensaje y la pantalla llevan el link de seguimiento.
  expect(decodeURIComponent(whatsapp)).toMatch(/Sigo mi pedido acá: http:\/\/[^/]+\/seguimiento\/k7Qx2abcdefghijklmnopq/);
  await expect(page.getByRole("link", { name: "seguir mi pedido" })).toHaveAttribute("href", "/seguimiento/k7Qx2abcdefghijklmnopq");
  // El pedido del navegador se vació.
  await page.goto("/pedido");
  await expect(page.getByRole("heading", { name: "Tu pedido está vacío" })).toBeVisible();
});

test("seguimiento sin cuenta: estado, qué sigue y prendas, sin datos personales; un link inventado no muestra nada (ROP-62, ROP-67)", async ({ page }) => {
  const api = await simularApi(page);
  const inventada = "z".repeat(22);
  api.responder("GET", `/ropa/catalogo/seguimiento/${inventada}`, () => ({ status: 404, json: { ok: false, codigo: "NO_EXISTE", mensaje: "No encontramos ese pedido." } }));
  await page.goto("/seguimiento/k7Qx2abcdefghijklmnopq");
  await expect(page.getByRole("heading", { name: "Pedido #00013", level: 1 })).toBeVisible();
  await expect(page.getByText("Está confirmado. Te avisamos cuando esté listo para retirar.")).toBeVisible();
  await expect(page.getByText("Remera Taverniti")).toBeVisible();
  await expect(page.getByRole("link", { name: "Consultar por WhatsApp" })).toHaveAttribute("href", /wa\.me\/.+%2300013/);
  await expect(page.getByText("3704123456")).toHaveCount(0);
  await sinDesborde(page);

  await page.goto(`/seguimiento/${inventada}`);
  await expect(page.getByRole("heading", { name: "No encontramos ese pedido" })).toBeVisible();
});

test("inicio: la cinta de marcas usa los logos de la configuración y lleva al catálogo de cada marca", async ({ page }) => {
  const api = await simularApi(page);
  const marcas = ["Taverniti", "MAYCLA", "Bando", "Mistral", "Raiders", "Marca Nueva"].map((nombre, i) => ({ id: i + 1, nombre, logo_url: null }));
  api.responder("GET", "/ropa/catalogo/marcas", () => ({ json: { ok: true, data: marcas } }));
  await page.goto("/");
  const cinta = page.getByRole("heading", { name: "Nuestras marcas" }).locator("..");
  // Las de proyecto/config/marcas_config.js se ven con su logo; una sin logo, con su nombre en negrita.
  await expect(cinta.getByRole("img", { name: "Taverniti" })).toBeVisible();
  await expect(cinta.getByRole("img", { name: "MAYCLA" })).toHaveAttribute("src", /maycla/);
  await expect(cinta.getByRole("img", { name: "Raiders" })).toHaveAttribute("src", /raiders/);
  const sinLogo = cinta.getByRole("link", { name: "Ver Marca Nueva" });
  await expect(sinLogo).toContainText("Marca Nueva");
  await expect(sinLogo.locator("span")).toHaveCSS("font-weight", "800");
  // La copia que hace girar la cinta no se lee ni se enfoca: cada marca aparece una sola vez.
  await expect(cinta.getByRole("link", { name: "Ver Taverniti" })).toHaveCount(1);
  await expect(cinta.getByRole("link", { name: "Ver Bando" })).toHaveAttribute("href", "/catalogo?marca=3");
  await sinDesborde(page);
});

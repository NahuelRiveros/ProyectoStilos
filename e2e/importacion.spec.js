import { expect, test } from "@playwright/test";
import { proyecto } from "../compartido/proyecto.js";
import { ingresarComoAdmin } from "./ayudantes.js";

// De a uno por proyecto: el servidor limita cuántos archivos se leen a la vez ("Hay otros archivos
// leyéndose") y escritorio + celular ya importan en paralelo.
test.describe.configure({ mode: "default" });

test("el admin importa una lista de precios en CSV y los productos aparecen en la tienda", async ({ page }, testInfo) => {
  // Códigos y nombres distintos por proyecto: escritorio y celular corren en paralelo sobre la misma base.
  const p = testInfo.project.name;
  const csv = [
    "Código;Producto;Presentación;Categoría;Precio;IVA",
    `YER-${p}-1;Yerba ${p};500 g;Almacén ${p} > Infusiones;1.000,00;21`,
    `YER-${p}-2;Yerba ${p};1 kg;Almacén ${p} > Infusiones;1.800,00;21`,
    `MAL-${p};Fila con error ${p};;Almacén ${p};sin precio;21`,
  ].join("\n");

  await ingresarComoAdmin(page);
  await page.goto("/admin/catalogo/importar");

  // Paso 1: archivo
  await page.getByLabel("Archivo a importar").setInputFiles({ name: `lista-${p}.csv`, mimeType: "text/csv", buffer: Buffer.from(csv) });
  await page.getByRole("button", { name: "Leer archivo" }).click();

  // Paso 2: las columnas se reconocen solas por sus títulos
  await expect(page.getByText("3 filas encontradas.", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Revisar sin cargar nada" }).click();

  // Paso 3: revisión y carga
  await expect(page.getByRole("heading", { name: "3. Revisá y confirmá" })).toBeVisible();
  await page.getByLabel(/Importar solo las filas correctas/).check();
  await page.getByRole("button", { name: "Confirmar e importar" }).click();
  await expect(page.getByText("Listo. Productos nuevos: 1 · Categorías nuevas: 2.")).toBeVisible();

  // En la tienda, con el precio con IVA y sus dos presentaciones
  await page.goto(`/catalogo?q=${encodeURIComponent(`Yerba ${p}`)}`);
  const tarjeta = page.getByRole("link", { name: new RegExp(`Yerba ${p}`) });
  await expect(tarjeta).toContainText("Desde");
  await expect(tarjeta).toContainText("1.210,00");
});

test("indumentaria: importa prendas con Color y Talle de las listas del panel", async ({ page }, testInfo) => {
  test.skip(proyecto.catalogo.variantes !== "talle_color", "Solo para catálogos de indumentaria");
  const p = testInfo.project.name;
  // Nombres propios de este test: otros (ej. el del catálogo) crean colores en la misma base.
  const [color, grupo, prenda] = [`Negro importado ${p}`, `Ropa importada ${p}`, `Remera importada ${p}`];

  await ingresarComoAdmin(page);
  // El color y el grupo de talles tienen que existir antes de importar.
  await page.goto("/admin/catalogo/colores");
  await page.getByRole("button", { name: "Nuevo color" }).click();
  const dialogoColor = page.getByRole("dialog", { name: "Nuevo color" });
  await dialogoColor.getByLabel("Nombre").fill(color);
  await dialogoColor.getByLabel("Código").fill("#111111");
  await dialogoColor.getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByText("Color creado")).toBeVisible();

  await page.goto("/admin/catalogo/talles");
  await page.getByRole("button", { name: "Nuevo grupo" }).click();
  const dialogoGrupo = page.getByRole("dialog", { name: "Nuevo grupo de talles" });
  await dialogoGrupo.getByLabel("Nombre del grupo").fill(grupo);
  await dialogoGrupo.getByLabel("Agregar talles").fill("S, M");
  await dialogoGrupo.getByLabel("Agregar talles").press("Enter");
  await dialogoGrupo.getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByText("Grupo creado")).toBeVisible();

  const csv = [
    "SKU;Producto;Categoría;Color;Talle;Grupo de talles;Precio",
    `REM-${p}-S;${prenda};Hombres ${p} > Remeras;${color};S;${grupo};10.000`,
    `REM-${p}-M;${prenda};Hombres ${p} > Remeras;${color};M;${grupo};10.000`,
    `REM-${p}-V;${prenda};Hombres ${p} > Remeras;Verde que no existe;S;${grupo};10.000`,
  ].join("\n");
  await page.goto("/admin/catalogo/importar");
  await page.getByLabel("Archivo a importar").setInputFiles({ name: `prendas-${p}.csv`, mimeType: "text/csv", buffer: Buffer.from(csv) });
  await page.getByRole("button", { name: "Leer archivo" }).click();
  await expect(page.getByText("3 filas encontradas.", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Revisar sin cargar nada" }).click();

  // La fila con el color que no está en la lista queda con error y se explica por qué.
  await expect(page.getByText('El color "Verde que no existe" no existe. Cargalo en Catálogo → Colores.').first()).toBeVisible();
  await page.getByLabel(/Importar solo las filas correctas/).check();
  await page.getByRole("button", { name: "Confirmar e importar" }).click();
  await expect(page.getByText("Listo. Productos nuevos: 1 · Categorías nuevas: 2.")).toBeVisible();

  // En la tienda: una sola prenda, con su color y sus dos talles.
  await page.goto(`/catalogo?q=${encodeURIComponent(prenda)}`);
  await page.getByRole("link", { name: new RegExp(prenda) }).click();
  await expect(page.getByRole("heading", { level: 1, name: prenda })).toBeVisible();
  await expect(page.getByRole("radio", { name: color })).toBeChecked();
  const talles = page.getByRole("group", { name: "Talle" });
  await expect(talles.getByRole("radio")).toHaveCount(2);
});

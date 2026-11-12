import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

// Contra el PostgreSQL LOCAL (.env.local), en un schema nuevo que se borra al terminar.
// Nunca usa la base remota ni corre el bootstrap. Spec: docs/specs/cambios/2026-11-catalogo-ropa.md.
dotenv.config({ path: fileURLToPath(new URL("../.env.local", import.meta.url)), quiet: true });
process.env.NODE_ENV = "test";
process.env.BD_URL = "";
process.env.BD_URL_SUPABASE = "";
process.env.DB_HOST = "127.0.0.1";
process.env.DB_SSL = "false";
for (const clave of ["SMTP_USER", "SMTP_PASS"]) process.env[clave] = "";
const schema = "stilos_test_" + randomUUID().replaceAll("-", "");
process.env.DB_SCHEMA = schema;
process.env.BD_ESQUEMA = schema;
process.env.ESQUEMA_SUSCRIPCION = schema;

const { sequelize, DB_SCHEMA } = await import("../src/core/database/sequelize.js");
const core = await import("../src/core/models/index.js");
const ropa = await import("../src/modulos/tienda_ropa/models/index.js");
const listas = await import("../src/modulos/tienda_ropa/services/listas_service.js");
const prendas = await import("../src/modulos/tienda_ropa/services/prendas_service.js");
const catalogo = await import("../src/modulos/tienda_ropa/services/catalogo_service.js");
const pedidos = await import("../src/modulos/tienda_ropa/services/pedidos_service.js");
const comprobantes = await import("../src/modulos/tienda_ropa/services/comprobantes_service.js");
const cuenta = await import("../src/modulos/tienda_ropa/services/cuenta_service.js");
const { clientConfig } = await import("../../proyecto/client_config.js");
const { moduloTiendaRopa } = await import("../src/modulos/tienda_ropa/modulo.js");
const { esquemaPrenda } = await import("../src/modulos/tienda_ropa/reglas.js");
const { CARACTERISTICAS_SUGERIDAS, CATEGORIAS_SUGERIDAS } = await import("../src/modulos/tienda_ropa/sugeridos.js");
const { sincronizarPermisos } = await import("../src/core/services/usuarios/permisos_service.js");
const { sembrarRolesDelSistema } = await import("../src/core/database/seed/seed_rbac.js");
const { seed_super_admin } = await import("../src/core/database/seed/seed_super_admin.js");
const { diagnosticarSuperAdmin } = await import("../src/core/services/common/diagnostico_super_admin.js");
const { SUPERADMIN_EMAIL_FIJO } = await import("../src/core/configuracion_servidor/env.js");
const { createApp } = await import("../src/core/app.js");
const bcrypt = (await import("bcrypt")).default;

// Como la ruta: la prenda llega validada por el esquema.
const prendaValida = (datos) => esquemaPrenda.parse(datos);
// Cambio de estado como lo hace el panel: con la versión que vio.
const cambiarA = async (id, estado, motivo, usuario_id = null) =>
  pedidos.cambiarEstadoPedido(id, { estado, motivo, version: (await pedidos.obtenerPedido(id)).version }, usuario_id);

test("PostgreSQL: catálogo de ropa, tienda y pedidos por WhatsApp", async (t) => {
  let creado = false;
  try {
    await sequelize.authenticate();
    assert.equal(DB_SCHEMA, schema);
    await sequelize.query(`CREATE SCHEMA "${DB_SCHEMA}"`);
    creado = true;
    for (const modelo of [core.Sexo, core.TipoDocumento, core.TipoPersona, core.Rol, core.Modulo, core.Permiso, core.Persona, core.RolPermiso, core.Usuario, core.UsuarioRol, ...moduloTiendaRopa.modelos]) {
      await modelo.sync();
    }
    await sembrarRolesDelSistema();
    await sincronizarPermisos();

    await t.test("Super admin (core): solo usuario y contraseña, email fijo y no pisa la contraseña", async () => {
      assert.equal(await seed_super_admin({ config: { SUPERADMIN_USUARIO: "", SUPERADMIN_CONTRASENA: "x" } }), null, "sin usuario no se crea");
      assert.equal(await seed_super_admin({ config: { SUPERADMIN_USUARIO: "con@arroba", SUPERADMIN_CONTRASENA: "x" } }), null, "usuario inválido");
      const admin = await seed_super_admin({ config: { SUPERADMIN_USUARIO: " Dueño.Admin ".replace("ñ", "n"), SUPERADMIN_CONTRASENA: "Clave-1234" } });
      assert.equal(admin.nombre_usuario, "dueno.admin", "se guarda en minúsculas");
      const persona = await core.Persona.findByPk(admin.persona_id);
      assert.equal(persona.email, SUPERADMIN_EMAIL_FIJO);
      const roles = (await admin.getRoles()).map((r) => r.codigo).sort();
      assert.deepEqual(roles, ["admin", "super_admin"]);
      // Un deploy con otra contraseña no pisa la que ya tiene la cuenta.
      const otraVez = await seed_super_admin({ config: { SUPERADMIN_USUARIO: "dueno.admin", SUPERADMIN_CONTRASENA: "Otra-5678" } });
      assert.equal(otraVez.id, admin.id);
      assert.equal(await core.Persona.count({ where: { email: SUPERADMIN_EMAIL_FIJO } }), 1, "no duplica la persona");
      const ok = await diagnosticarSuperAdmin({ config: { SUPERADMIN_USUARIO: "dueno.admin", SUPERADMIN_CONTRASENA: "Clave-1234" }, Usuario: core.Usuario });
      assert.equal(ok.codigo, "CREDENCIALES_CORRECTAS");
      const mal = await diagnosticarSuperAdmin({ config: { SUPERADMIN_USUARIO: "dueno.admin", SUPERADMIN_CONTRASENA: "Otra-5678" }, Usuario: core.Usuario });
      assert.equal(mal.codigo, "CONTRASENA_DIFERENTE");
      const falta = await diagnosticarSuperAdmin({ config: { SUPERADMIN_USUARIO: "", SUPERADMIN_CONTRASENA: "" }, Usuario: core.Usuario });
      assert.equal(falta.codigo, "CONFIGURACION_INCOMPLETA");
    });

    const mujer = await listas.crearCategoria({ nombre: "Mujer", padre_id: null, orden: 0, activo: true });
    const remeras = await listas.crearCategoria({ nombre: "Remeras", padre_id: mujer.id, orden: 0, activo: true });
    const hombre = await listas.crearCategoria({ nombre: "Hombre", padre_id: null, orden: 1, activo: true });

    await t.test("ROP-01: árbol, URL sin repetir, sin ciclos y sin borrar lo que se usa", async () => {
      const otra = await listas.crearCategoria({ nombre: "Remeras", padre_id: hombre.id, orden: 0, activo: true });
      assert.equal(otra.slug, "remeras-2");
      const arbol = await listas.listarCategorias();
      assert.deepEqual(arbol.map((c) => [c.nombre, c.hijas.map((h) => h.nombre)]), [["Mujer", ["Remeras"]], ["Hombre", ["Remeras"]]]);
      await assert.rejects(listas.actualizarCategoria(mujer.id, { nombre: "Mujer", padre_id: remeras.id, orden: 0, activo: true }), { codigo: "CATEGORIA_CICLO" });
      await assert.rejects(listas.eliminarCategoria(mujer.id), { codigo: "EN_USO", estado: 409 });
      await listas.eliminarCategoria(otra.id);
    });

    await t.test("ROP-03 y ROP-04: sugeridos sin duplicar y nombres únicos", async () => {
      assert.equal(await listas.cargarColoresSugeridos(), 30);
      assert.equal(await listas.cargarColoresSugeridos(), 0, "la segunda vez no agrega nada");
      assert.equal(await listas.cargarGruposSugeridos(), 5, "Ropa, Jeans, Calzado, Niños y Talle único");
      const ninos = (await listas.listarGruposTalle()).find((g) => g.nombre === "Niños");
      assert.deepEqual(ninos.talles.map((x) => x.nombre), ["8", "10", "12", "14", "16"]);
      assert.equal(await listas.cargarGruposSugeridos(), 0);
      await assert.rejects(listas.crearColor({ nombre: "Negro", hex: "#000000", orden: 0 }), { codigo: "NOMBRE_DUPLICADO" });
      const ropaGrupo = (await listas.listarGruposTalle()).find((g) => g.nombre === "Ropa");
      assert.deepEqual(ropaGrupo.talles.map((x) => x.nombre), ["S", "M", "L", "XL", "XXL", "XXXL"]);
    });

    const colores = Object.fromEntries((await listas.listarColores()).map((c) => [c.nombre, c.id]));
    const grupoRopa = (await listas.listarGruposTalle()).find((g) => g.nombre === "Ropa");
    const talles = Object.fromEntries(grupoRopa.talles.map((x) => [x.nombre, x.id]));
    const marca = await listas.crearMarca({ nombre: "Stilos", activo: true });
    // ROP-29: cada color es una prenda aparte; las dos son del mismo modelo (ROP-30).
    const remera = await prendas.crearPrenda(prendaValida({
      nombre: "Remera lisa", descripcion: "Algodón", categoria_id: remeras.id, marca_id: marca.id, grupo_talle_id: grupoRopa.id, precio: 15000.5,
      variantes: [{ color_id: colores.Negro, talle_id: talles.S }, { color_id: colores.Negro, talle_id: talles.M }],
      imagenes: [{ url: "https://x.test/general.jpg", color_id: null }, { url: "https://x.test/negro-1.jpg", color_id: colores.Negro }],
    }));
    const remeraRoja = await prendas.crearPrenda(prendaValida({
      nombre: "  remera  LISA ", categoria_id: remeras.id, marca_id: marca.id, grupo_talle_id: grupoRopa.id, precio: 16000,
      variantes: [{ color_id: colores.Rojo, talle_id: talles.S, disponible: false }, { color_id: colores.Rojo, talle_id: talles.M }],
      imagenes: [{ url: "https://x.test/rojo-1.jpg", color_id: colores.Rojo }],
    }));
    const variante = (color, talle) => [...remera.variantes, ...remeraRoja.variantes].find((v) => v.color_id === colores[color] && v.talle_id === talles[talle]);

    await t.test("ROP-04: no se saca un talle que usa una prenda", async () => {
      await assert.rejects(listas.actualizarGrupoTalle(grupoRopa.id, { nombre: "Ropa", orden: 0, talles: ["M", "L"] }), { codigo: "EN_USO" });
      await listas.actualizarGrupoTalle(grupoRopa.id, { nombre: "Ropa", orden: 0, talles: ["S", "M", "L"] });
    });

    await t.test("ROP-05 a ROP-08: al editar, las variantes que siguen conservan su id", async () => {
      const negroS = variante("Negro", "S").id;
      const editada = await prendas.actualizarPrenda(remera.id, prendaValida({
        nombre: "Remera lisa", categoria_id: remeras.id, marca_id: marca.id, grupo_talle_id: grupoRopa.id, precio: 16000,
        variantes: [
          { color_id: colores.Negro, talle_id: talles.S }, { color_id: colores.Negro, talle_id: talles.M },
          { color_id: colores.Negro, talle_id: talles.L },
        ],
        imagenes: [{ url: "https://x.test/general.jpg", color_id: null }, { url: "https://x.test/negro-1.jpg", color_id: colores.Negro }],
      }));
      assert.equal(editada.variantes.find((v) => v.color_id === colores.Negro && v.talle_id === talles.S).id, negroS);
      assert.equal(editada.variantes.length, 3);
      assert.equal(editada.imagenes.length, 2);
      assert.equal(editada.slug, "remera-lisa-negro", "ROP-29: la URL lleva el color y no cambia si nombre y color siguen igual");
      assert.equal(remeraRoja.slug, "remera-lisa-rojo");
      assert.deepEqual(editada.otros_colores.map((o) => o.color.nombre), ["Rojo"], "ROP-30: el panel muestra con quién quedó agrupada");
      assert.equal(Number(editada.precio), 16000);
      await assert.rejects(prendas.crearPrenda(prendaValida({
        nombre: "Jean", categoria_id: remeras.id, grupo_talle_id: grupoRopa.id, precio: 1,
        variantes: [{ color_id: colores.Negro, talle_id: 999999 }],
      })), { codigo: "DATOS_INVALIDOS" });
    });

    await t.test("ROP-10 a ROP-12: la tienda muestra solo lo visible y filtra color y talle en la misma variante", async () => {
      const lista = await catalogo.listarCatalogo({ pagina: 1, categoria: mujer.id });
      assert.deepEqual(lista.items.map((p) => p.slug), ["remera-lisa-rojo", "remera-lisa-negro"], "Mujer incluye Mujer › Remeras; cada color es una tarjeta");
      assert.equal(lista.items[1].foto, "https://x.test/general.jpg");
      assert.equal((await catalogo.listarCatalogo({ pagina: 1, color: colores.Rojo, talle: talles.S })).items.length, 0, "rojo S está agotado");
      assert.equal((await catalogo.listarCatalogo({ pagina: 1, color: colores.Rojo, talle: talles.M })).items.length, 1);
      assert.equal((await catalogo.listarCatalogo({ pagina: 1, categoria: hombre.id })).items.length, 0);

      const ficha = await catalogo.detallePrenda(remera.slug);
      assert.deepEqual(ficha.migas.map((m) => m.nombre), ["Mujer", "Remeras"]);
      assert.deepEqual(ficha.talles.map((x) => x.nombre), ["S", "M", "L"]);
      assert.equal(ficha.precio, 16000);
      assert.equal(ficha.precio_anterior, null);
      // ROP-30: "También en:" con el rojo; desde el rojo, el negro.
      assert.deepEqual(ficha.otros_colores, [{ slug: "remera-lisa-rojo", color: { id: colores.Rojo, nombre: "Rojo", hex: "#C62828", orden: 21 } }]);
      assert.deepEqual((await catalogo.detallePrenda(remeraRoja.slug)).otros_colores.map((o) => o.slug), ["remera-lisa-negro"]);
      await prendas.cambiarEstadoPrenda(remeraRoja.id, false);
      assert.deepEqual((await catalogo.detallePrenda(remera.slug)).otros_colores, [], "la tienda no muestra colores ocultos");
      await prendas.cambiarEstadoPrenda(remeraRoja.id, true);
      const filtros = await catalogo.opcionesDeFiltro();
      assert.deepEqual(filtros.marcas.map((m) => m.nombre), ["Stilos"]);

      // Ocultar la categoría de arriba oculta todo lo de abajo.
      await listas.actualizarCategoria(mujer.id, { nombre: "Mujer", padre_id: null, orden: 0, activo: false });
      assert.equal((await catalogo.listarCatalogo({ pagina: 1 })).items.length, 0);
      await assert.rejects(catalogo.detallePrenda(remera.slug), { codigo: "NO_EXISTE" });
      await listas.actualizarCategoria(mujer.id, { nombre: "Mujer", padre_id: null, orden: 0, activo: true });
    });

    await t.test("ROP-24 a ROP-39: características, marcas y categorías sugeridas, marcas del inicio y filtros por categoría", async () => {
      // ROP-37: sugeridas sin duplicar; a un grupo que ya existía (en minúsculas) solo se le suma lo que falta, al final.
      await listas.crearGrupoCaracteristica({ nombre: "material", orden: 0, valores: ["Algodón", "Bambú"] });
      const total = CARACTERISTICAS_SUGERIDAS.reduce((n, g) => n + g.valores.length, 0);
      assert.equal(await listas.cargarCaracteristicasSugeridas(), total - 1, "Algodón ya estaba");
      assert.equal(await listas.cargarCaracteristicasSugeridas(), 0, "la segunda vez no agrega nada");
      const gruposCar = await listas.listarCaracteristicas();
      assert.equal(gruposCar.length, CARACTERISTICAS_SUGERIDAS.length);
      const material = gruposCar.find((g) => g.nombre === "material");
      // ROP-61: relación sugerida con las categorías que ya hay (Mujer, Mujer › Remeras y Hombre).
      const deGrupo = (nombre) => gruposCar.find((g) => g.nombre === nombre).categorias;
      assert.deepEqual(deGrupo("Estampa"), [remeras.id]);
      assert.deepEqual(deGrupo("Detalles"), [mujer.id, hombre.id].sort((a, b) => a - b));
      assert.deepEqual([deGrupo("Calzado"), deGrupo("material")], [[], []], "todavía no hay Calzado; Material, en todas");
      // ROP-59: se eligen, se reemplazan y tienen que existir.
      const tiro = gruposCar.find((g) => g.nombre === "Tiro");
      const valoresTiro = tiro.caracteristicas.map((c) => c.nombre);
      await listas.actualizarGrupoCaracteristica(tiro.id, { nombre: "Tiro", orden: 3, valores: valoresTiro, categorias: [hombre.id] });
      assert.deepEqual((await listas.listarCaracteristicas()).find((g) => g.id === tiro.id).categorias, [hombre.id]);
      await assert.rejects(listas.actualizarGrupoCaracteristica(tiro.id, { nombre: "Tiro", orden: 3, valores: valoresTiro, categorias: [999999] }), { codigo: "DATOS_INVALIDOS" });
      assert.deepEqual(material.caracteristicas.slice(0, 3).map((c) => c.nombre), ["Algodón", "Bambú", "Lino"]);
      const car = (grupo, valor) => gruposCar.find((g) => g.nombre.toLowerCase() === grupo).caracteristicas.find((c) => c.nombre === valor).id;
      const [liso, rayado, algodon, lino] = [car("estampa", "Liso"), car("estampa", "Rayado"), car("material", "Algodón"), car("material", "Lino")];

      // ROP-38: varias por prenda; al editar se reemplazan.
      await prendas.actualizarPrenda(remera.id, prendaValida({
        nombre: "Remera lisa", categoria_id: remeras.id, marca_id: marca.id, grupo_talle_id: grupoRopa.id, precio: 16000, caracteristicas: [liso, algodon, liso],
        variantes: [{ color_id: colores.Negro, talle_id: talles.S }, { color_id: colores.Negro, talle_id: talles.M }, { color_id: colores.Negro, talle_id: talles.L }],
        imagenes: [{ url: "https://x.test/general.jpg", color_id: null }, { url: "https://x.test/negro-1.jpg", color_id: colores.Negro }],
      }));
      assert.deepEqual((await prendas.obtenerPrenda(remera.id)).caracteristicas.sort(), [liso, algodon].sort());
      const rayada = await prendas.crearPrenda(prendaValida({
        nombre: "Remera rayada", categoria_id: remeras.id, grupo_talle_id: grupoRopa.id, precio: 17000, caracteristicas: [rayado, lino],
        variantes: [{ color_id: colores.Negro, talle_id: talles.M }],
      }));
      await assert.rejects(prendas.crearPrenda(prendaValida({
        nombre: "X", categoria_id: remeras.id, grupo_talle_id: grupoRopa.id, precio: 1, caracteristicas: [999999], variantes: [{ color_id: colores.Negro, talle_id: talles.M }],
      })), { codigo: "DATOS_INVALIDOS" });

      // ROP-39: dentro de un grupo, una u otra; entre grupos, las dos.
      const slugs = async (ids) => (await catalogo.listarCatalogo({ pagina: 1, car: ids })).items.map((p) => p.slug).sort();
      assert.deepEqual(await slugs([liso, rayado]), ["remera-lisa-negro", "remera-rayada-negro"]);
      assert.deepEqual(await slugs([liso, algodon]), ["remera-lisa-negro"]);
      assert.deepEqual(await slugs([rayado, algodon]), []);
      assert.deepEqual(await slugs([999999]), [], "una que no existe no muestra todo");

      // ROP-58: la ficha las muestra agrupadas, en el orden del panel.
      const agrupadas = (grupos) => grupos.map((g) => [g.nombre, g.caracteristicas.map((c) => c.nombre)]);
      assert.deepEqual(agrupadas((await catalogo.detallePrenda(remera.slug)).caracteristicas), [["Estampa", ["Liso"]], ["material", ["Algodón"]]]);

      // ROP-37: no se saca un valor ni se borra un grupo que usa una prenda; los que siguen conservan su id.
      await assert.rejects(listas.actualizarGrupoCaracteristica(material.id, { nombre: "material", orden: 0, valores: ["Bambú"] }), { codigo: "EN_USO" });
      await assert.rejects(listas.eliminarGrupoCaracteristica(material.id), { codigo: "EN_USO" });
      await prendas.eliminarPrenda(rayada.id);
      await listas.actualizarGrupoCaracteristica(material.id, { nombre: "Material", orden: 0, valores: ["Algodón", "Lino", "Lona"] });
      assert.deepEqual((await listas.listarCaracteristicas()).find((g) => g.id === material.id).caracteristicas.map((c) => [c.nombre, c.id === algodon]),
        [["Algodón", true], ["Lino", false], ["Lona", false]]);

      // ROP-24 y ROP-25: las 12 marcas sin duplicar (sin importar mayúsculas) y logo opcional.
      await listas.crearMarca({ nombre: "taverniti", activo: true, logo_url: "https://x.test/taverniti.png" });
      assert.equal(await listas.cargarMarcasSugeridas(), 11, "Taverniti ya estaba en minúsculas");
      assert.equal(await listas.cargarMarcasSugeridas(), 0);

      // ROP-26: el inicio solo muestra marcas con prendas a la vista.
      assert.deepEqual((await catalogo.marcasTienda()).map((m) => m.nombre), ["Stilos"]);
      const conLogo = await prendas.crearPrenda(prendaValida({
        nombre: "Jean Taverniti", categoria_id: remeras.id, grupo_talle_id: grupoRopa.id, precio: 30000,
        marca_id: (await listas.listarMarcas()).find((m) => m.nombre === "taverniti").id,
        variantes: [{ color_id: colores.Azul, talle_id: talles.M }],
      }));
      assert.deepEqual((await catalogo.marcasTienda()).map((m) => [m.nombre, m.logo_url]), [["Stilos", null], ["taverniti", "https://x.test/taverniti.png"]]);
      await prendas.eliminarPrenda(conLogo.id);

      // ROP-27: suma Niños y Calzado (Mujer y Hombre ya estaban).
      // ROP-27 y ROP-36: el árbol completo; Mujer, Hombre y Mujer › Remeras ya estaban y no se duplican.
      const contar = (nodos) => nodos.reduce((n, c) => n + 1 + contar(c.hijas ?? []), 0);
      assert.equal(await listas.cargarCategoriasSugeridas(), contar(CATEGORIAS_SUGERIDAS) - 3);
      assert.equal(await listas.cargarCategoriasSugeridas(), 0, "la segunda vez no agrega nada");
      // ROP-61: con el árbol cargado, las sugeridas relacionan a los que no tenían; lo ya elegido no se toca.
      assert.equal(await listas.cargarCaracteristicasSugeridas(), 15, "vuelven los 15 materiales que se sacaron más arriba");
      const gruposAhora = await listas.listarCaracteristicas();
      const nombresDe = async (grupo) => [...new Set((await ropa.CategoriaRopa.findAll({
        where: { id: gruposAhora.find((g) => g.nombre === grupo).categorias }, raw: true,
      })).map((c) => c.nombre))].sort();
      assert.deepEqual(await nombresDe("Calzado"), ["Calzado"]);
      assert.deepEqual(await nombresDe("Calce"), ["Bermudas", "Bermudas y shorts", "Jeans", "Pantalones", "Shorts"]);
      assert.deepEqual(await nombresDe("Estampa"), ["Remeras"]);
      assert.deepEqual(gruposAhora.find((g) => g.nombre === "Estampa").categorias, [remeras.id], "ya tenía: no se le suman las Remeras nuevas");
      assert.deepEqual(gruposAhora.find((g) => g.nombre === "Tiro").categorias, [hombre.id], "elegida por el negocio");
      const arbol = await listas.listarCategorias();
      const buscar = (nodos, ...camino) => camino.reduce((nivel, nombre) => (nivel?.hijas ?? nivel).find((c) => c.nombre === nombre), nodos);
      assert.deepEqual(arbol.map((c) => c.nombre).slice(-3), ["Niños", "Calzado", "Accesorios"]);
      assert.equal(buscar(arbol, "Mujer").hijas.filter((c) => c.nombre === "Remeras").length, 1);
      const grupos = Object.fromEntries((await listas.listarGruposTalle()).map((g) => [g.nombre, g.id]));
      const cargo = buscar(arbol, "Hombre", "Pantalones", "Cargo");
      assert.ok(cargo, "Hombre › Pantalones › Cargo");
      assert.equal(cargo.grupo_talle_id, null, "hereda los talles de Pantalones");
      assert.equal(buscar(arbol, "Hombre", "Pantalones").grupo_talle_id, grupos.Jeans);
      assert.equal(buscar(arbol, "Mujer").grupo_talle_id, grupos.Ropa, "a la que ya existía se le completan los talles");
      assert.equal(buscar(arbol, "Accesorios").grupo_talle_id, grupos["Talle único"]);
      assert.ok(buscar(arbol, "Mujer", "Polleras"));
      await assert.rejects(listas.crearCategoria({ nombre: "X", padre_id: null, grupo_talle_id: 999999, orden: 0, activo: true }), { codigo: "DATOS_INVALIDOS" });

      // ROP-28: las opciones salen de la categoría y los talles vienen agrupados.
      const deMujer = await catalogo.opcionesDeFiltro({ categoria: mujer.id });
      assert.deepEqual(deMujer.grupos_talle.map((g) => [g.nombre, g.talles.map((x) => x.nombre)]), [["Ropa", ["S", "M", "L"]]]);
      assert.deepEqual(deMujer.colores.map((c) => c.nombre), ["Negro", "Rojo"]);
      assert.deepEqual(agrupadas(deMujer.caracteristicas), [["Estampa", ["Liso"]], ["Material", ["Algodón"]]], "ROP-39: solo las que se usan");
      const deHombre = await catalogo.opcionesDeFiltro({ categoria: hombre.id });
      assert.deepEqual([deHombre.colores, deHombre.grupos_talle, deHombre.marcas, deHombre.caracteristicas], [[], [], [], []]);
    });

    await t.test("ROP-17: el precio anterior se guarda y se muestra, pero el pedido cobra el precio", async () => {
      const oferta = await prendas.crearPrenda(prendaValida({
        nombre: "Remera oferta", categoria_id: remeras.id, grupo_talle_id: grupoRopa.id, precio: 10000, precio_anterior: 14000,
        variantes: [{ color_id: colores.Negro, talle_id: talles.S }],
      }));
      const enLista = (await catalogo.listarCatalogo({ pagina: 1 })).items.find((p) => p.id === oferta.id);
      assert.equal(enLista.precio_anterior, 14000);
      assert.equal((await catalogo.detallePrenda(oferta.slug)).precio_anterior, 14000);
      // ROP-11: orden por precio y "Solo ofertas" (la remera lisa vale 16000, la oferta 10000).
      const nombres = async (filtros) => (await catalogo.listarCatalogo({ pagina: 1, ...filtros })).items.map((p) => p.nombre);
      assert.deepEqual(await nombres({ orden: "menor_precio" }), ["Remera oferta", "remera  LISA", "Remera lisa"]);
      assert.deepEqual(await nombres({ orden: "mayor_precio" }), ["remera  LISA", "Remera lisa", "Remera oferta"]);
      assert.deepEqual(await nombres({ ofertas: true }), ["Remera oferta"]);
      assert.deepEqual(await nombres({ ofertas: true, color: colores.Rojo }), [], "las ofertas se combinan con los otros filtros");
      // ROP-19: las relacionadas son de la misma categoría, nunca la propia prenda ni sus otros colores.
      assert.deepEqual((await catalogo.detallePrenda(remera.slug)).relacionadas.map((p) => p.nombre), ["Remera oferta"]);
      assert.deepEqual((await catalogo.detallePrenda(oferta.slug)).relacionadas.map((p) => p.slug), ["remera-lisa-rojo", "remera-lisa-negro"]);
      assert.equal((await catalogo.detallePrenda(oferta.slug)).relacionadas[0].precio_anterior, null, "vienen como tarjeta de la grilla");
      const pedido = await pedidos.crearPedido({ nombre: "Ana", celular: "3704123456", items: [{ variante_id: oferta.variantes[0].id, cantidad: 2 }] });
      assert.equal(pedido.total, "20000.00");
      // Sacar la oferta al editar: el campo vacío la borra.
      const sinOferta = await prendas.actualizarPrenda(oferta.id, prendaValida({
        nombre: "Remera oferta", categoria_id: remeras.id, grupo_talle_id: grupoRopa.id, precio: 10000, precio_anterior: "",
        variantes: [{ color_id: colores.Negro, talle_id: talles.S }],
      }));
      assert.equal(sinOferta.precio_anterior, null);
      await cambiarA(pedido.id, "cancelado", "prueba");
      await prendas.eliminarPrenda(oferta.id);
    });

    await t.test("ROP-18: la entrega se guarda en el pedido y el envío gratis lo decide el total de la base", async () => {
      const negroM = variante("Negro", "M").id;
      // 10 × 16000 = 160000: llega al mínimo de 150000 aunque el navegador no mande precios.
      const gratis = await pedidos.crearPedido({ nombre: "Ana", celular: "3704123456", entrega: "envio", direccion: "San Martín 123", localidad: "Formosa", items: [{ variante_id: negroM, cantidad: 10 }] });
      assert.equal(gratis.envio_gratis, true);
      const conCosto = await pedidos.crearPedido({ nombre: "Ana", celular: "3704123456", entrega: "envio", direccion: "San Martín 123", localidad: "Formosa", items: [{ variante_id: negroM, cantidad: 1 }] });
      assert.equal(conCosto.envio_gratis, false);
      const retiro = await pedidos.crearPedido({ nombre: "Ana", celular: "3704123456", entrega: "retiro", items: [{ variante_id: negroM, cantidad: 10 }] });
      assert.equal(retiro.envio_gratis, false, "retirando no hay envío");

      const guardado = await pedidos.obtenerPedido(gratis.id);
      assert.deepEqual([guardado.entrega, guardado.direccion, guardado.localidad, guardado.envio_gratis], ["envio", "San Martín 123", "Formosa", true]);
      assert.equal((await pedidos.obtenerPedido(retiro.id)).direccion, null);
      for (const p of [gratis, conCosto, retiro]) await cambiarA(p.id, "cancelado", "prueba");
    });

    await t.test("ROP-40 a ROP-57: cuenta del cliente, estados con historial, comprobantes y pagos", async () => {
      const crearCliente = async (email) => {
        const persona = await core.Persona.create({ nombre: "Ana", apellido: "Cliente", email });
        const usuario = await core.Usuario.create({ persona_id: persona.id, contrasena: await bcrypt.hash("Clave1234", 4) });
        return { usuario_id: usuario.id, persona_id: persona.id, roles: ["cliente"], permisos: [] };
      };
      const ana = await crearCliente("ana@cliente.test");
      const otro = await crearCliente("otro@cliente.test");
      const negroM = variante("Negro", "M").id;
      const pedirCon = (usuario, extra) => pedidos.crearPedidoCuenta(usuario, {
        items: [{ variante_id: negroM, cantidad: 2 }], entrega: "retiro", direccion: null, localidad: null, forma_pago: "transferencia", ...extra,
      });

      // ROP-41: sin celular no se puede pedir; con "Mis datos" completos, sí.
      assert.equal((await cuenta.misDatos(ana)).completos, false);
      await assert.rejects(pedirCon(ana, { clave_envio: "clave-ana-0001" }), { codigo: "FALTAN_DATOS" });
      const datos = await cuenta.guardarMisDatos(ana, { nombre: "Ana", apellido: "Gómez", celular: "3704123456", direccion: "Belgrano 50", localidad: "Formosa", codigo_postal: "3600" });
      assert.deepEqual([datos.completos, datos.direccion], [true, "Belgrano 50"]);
      await cuenta.guardarMisDatos(otro, { nombre: "Otro", apellido: "Cliente", celular: "3704999999", direccion: "", localidad: "", codigo_postal: "" });

      // ROP-47: sin datos bancarios completos no se ofrece transferencia.
      await assert.rejects(pedirCon(ana, { clave_envio: "clave-ana-0001" }), { codigo: "SIN_TRANSFERENCIA" });
      Object.assign(clientConfig.datosBancarios, { titular: "EJEMPLO", banco: "EJEMPLO", cbu: "0000000000000000000000", alias: "EJEMPLO", cuit: "20-00000000-0" });

      // ROP-43: misma clave = mismo pedido (reintento o doble clic); otra persona con esa clave, no.
      const pedido = await pedirCon(ana, { clave_envio: "clave-ana-0001" });
      assert.deepEqual([pedido.origen, pedido.nombre, pedido.total, pedido.estado, pedido.estado_pago], ["cuenta", "Ana Gómez", "32000.00", "recibido", "pendiente"]);
      assert.equal((await pedirCon(ana, { clave_envio: "clave-ana-0001" })).id, pedido.id);
      await assert.rejects(pedirCon(otro, { clave_envio: "clave-ana-0001" }), { codigo: "CLAVE_USADA" });

      // ROP-52: cada uno ve solo los suyos; uno ajeno responde como inexistente.
      assert.deepEqual((await pedidos.misPedidos(ana.usuario_id)).map((p) => p.id), [pedido.id]);
      assert.equal((await pedidos.misPedidos(otro.usuario_id)).length, 0);
      await assert.rejects(pedidos.miPedido(otro.usuario_id, pedido.id), { codigo: "NO_EXISTE" });

      // ROP-48 y ROP-49: el formato se reconoce por el contenido; el enlace es solo del dueño o del equipo.
      const subidos = [];
      const nube = { subir: async (_b, { public_id }) => { subidos.push(public_id); return { public_id }; }, borrar: async () => {} };
      await assert.rejects(comprobantes.subirComprobante(ana.usuario_id, pedido.id, { buffer: Buffer.from("MZ esto no es un pdf") }, nube), { codigo: "ARCHIVO_INVALIDO" });
      await assert.rejects(comprobantes.subirComprobante(otro.usuario_id, pedido.id, { buffer: Buffer.from("%PDF-1.7 comprobante") }, nube), { codigo: "NO_EXISTE" });
      await comprobantes.subirComprobante(ana.usuario_id, pedido.id, { buffer: Buffer.from("%PDF-1.7 comprobante") }, nube);
      let visto = await pedidos.miPedido(ana.usuario_id, pedido.id);
      assert.equal(visto.estado_pago, "en_revision");
      assert.equal(visto.comprobantes[0].public_id, undefined, "el id privado de Cloudinary no sale de la API");
      const firmar = (publicId, formato) => `https://firmado.test/${publicId}.${formato}`;
      const enlace = await comprobantes.enlaceComprobante(ana, pedido.id, visto.comprobantes[0].id, firmar);
      assert.equal(enlace.url, `https://firmado.test/${subidos[0]}.pdf`);
      await assert.rejects(comprobantes.enlaceComprobante(otro, pedido.id, visto.comprobantes[0].id, firmar), { codigo: "NO_EXISTE" });
      assert.ok(await comprobantes.enlaceComprobante({ usuario_id: 0, permisos: ["pedidos.ver"] }, pedido.id, visto.comprobantes[0].id, firmar));

      // ROP-50: aceptar marca Pagado y confirma en el mismo paso; no se acepta dos veces.
      assert.equal(await comprobantes.aceptarComprobante(pedido.id, visto.comprobantes[0].id, null), true);
      visto = await pedidos.obtenerPedido(pedido.id);
      assert.deepEqual([visto.estado, visto.estado_pago, visto.historial.at(-1).motivo], ["confirmado", "pagado", "Pago aceptado"]);
      await assert.rejects(comprobantes.aceptarComprobante(pedido.id, visto.comprobantes[0].id, null), { codigo: "COMPROBANTE_REVISADO" });
      await assert.rejects(comprobantes.subirComprobante(ana.usuario_id, pedido.id, { buffer: Buffer.from("%PDF-1.7 otro") }, nube), { codigo: "COMPROBANTE_NO_ADMITIDO" });

      // ROP-54: pasos válidos, motivo al volver y aviso si otro cambió antes.
      await assert.rejects(cambiarA(pedido.id, "enviado"), { codigo: "CAMBIO_NO_VALIDO" }, "es retiro, no envío");
      await assert.rejects(pedidos.cambiarEstadoPedido(pedido.id, { estado: "listo_retirar", version: visto.version - 1 }, null), { codigo: "CAMBIO_SIMULTANEO" });
      await assert.rejects(cambiarA(pedido.id, "recibido"), { codigo: "FALTA_MOTIVO" });
      assert.equal((await cambiarA(pedido.id, "listo_retirar")).proximo, "entregado");

      // ROP-53: el cliente cancela solo en Recibido. ROP-50: rechazar deja el pago Pendiente.
      await assert.rejects(pedidos.cancelarMiPedido(ana.usuario_id, pedido.id, "me arrepentí"), { codigo: "NO_CANCELABLE" });
      const segundo = await pedirCon(ana, { clave_envio: "clave-ana-0002" });
      await comprobantes.subirComprobante(ana.usuario_id, segundo.id, { buffer: Buffer.from("%PDF-1.7 borroso") }, nube);
      const comprobante = (await pedidos.miPedido(ana.usuario_id, segundo.id)).comprobantes[0];
      await comprobantes.rechazarComprobante(segundo.id, comprobante.id, null, "No se lee el importe");
      visto = await pedidos.miPedido(ana.usuario_id, segundo.id);
      assert.deepEqual([visto.estado_pago, visto.comprobantes[0].estado, visto.comprobantes[0].motivo_rechazo], ["pendiente", "rechazado", "No se lee el importe"]);
      const cancelado = await pedidos.cancelarMiPedido(ana.usuario_id, segundo.id, "me arrepentí");
      assert.deepEqual([cancelado.estado, cancelado.historial.at(-1).motivo], ["cancelado", "Cancelado por el cliente: me arrepentí"]);

      // ROP-51: efectivo al retirar: el equipo marca Pagado a mano.
      const efectivo = await pedirCon(otro, { clave_envio: "clave-otro-0001", forma_pago: "efectivo" });
      assert.equal((await pedidos.marcarPagado(efectivo.id, null)).estado_pago, "pagado");
      await assert.rejects(pedidos.marcarPagado(efectivo.id, null), { codigo: "YA_PAGADO" });
      assert.deepEqual((await pedidos.listarPedidos({ estado: "todos", pago: "pagado", pagina: 1 })).items.map((p) => p.id).sort(), [pedido.id, efectivo.id].sort());
      await cambiarA(efectivo.id, "cancelado", "prueba");
      await cambiarA(pedido.id, "entregado");
    });

    await t.test("ROP-14 y ROP-15: el pedido usa el precio de la base, rechaza lo agotado y queda en el panel", async () => {
      const negroM = variante("Negro", "M").id;
      const pedido = await pedidos.crearPedido({ nombre: "Ana", celular: "3704123456", items: [{ variante_id: negroM, cantidad: 3 }] });
      assert.match(pedido.numero, /^#\d{5}$/);
      assert.equal(pedido.total, "48000.00");
      assert.deepEqual(pedido.items[0], { nombre_prenda: "Remera lisa", color: "Negro", talle: "M", cantidad: 3, precio_unitario: "16000.00", subtotal: "48000.00" });
      await assert.rejects(
        pedidos.crearPedido({ nombre: "Ana", celular: "3704123456", items: [{ variante_id: variante("Rojo", "S").id, cantidad: 1 }] }),
        (error) => error.codigo === "NO_DISPONIBLE" && /Rojo, talle S/.test(error.message),
      );
      assert.equal(await pedidos.contarNuevos(), 1);
      assert.equal(pedido.envio_gratis, false);
      const confirmado = await cambiarA(pedido.id, "confirmado");
      assert.equal(confirmado.estado, "confirmado");
      assert.deepEqual(confirmado.historial.map((h) => h.estado_nuevo), ["recibido", "confirmado"]);
      assert.equal((await pedidos.listarPedidos({ estado: "recibido", pago: "todos", pagina: 1 })).items.length, 0);
      assert.deepEqual((await pedidos.listarPedidos({ estado: "todos", pago: "todos", q: "ana", pagina: 1 })).items.map((p) => p.id).includes(pedido.id), true, "ROP-56: busca por nombre");
      // Borrar la prenda no borra el pedido: guarda su copia.
      await prendas.eliminarPrenda(remera.id);
      const guardado = await pedidos.obtenerPedido(pedido.id);
      assert.equal(guardado.items[0].nombre_prenda, "Remera lisa");
      assert.equal(guardado.items[0].prenda_id, null);
    });

    await t.test("ROP-20 por HTTP: el Encargado edita el catálogo; el Vendedor solo ve pedidos", async () => {
      const crearPersonal = async (email, rol) => {
        const persona = await core.Persona.create({ nombre: "Prueba", apellido: rol, email });
        const usuario = await core.Usuario.create({ persona_id: persona.id, contrasena: await bcrypt.hash("Clave1234", 4) });
        await core.UsuarioRol.create({ usuario_id: usuario.id, rol_id: (await core.Rol.findOne({ where: { codigo: rol } })).id });
      };
      await crearPersonal("encargado@stilos.test", "supervisor");
      await crearPersonal("vendedor@stilos.test", "vendedor");
      const servidor = createApp().listen(0);
      await new Promise((listo) => servidor.once("listening", listo));
      const base = `http://127.0.0.1:${servidor.address().port}/api`;
      try {
        const token = async (identificador) => (await (await fetch(base + "/auth/login", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identificador, password: "Clave1234" }),
        })).json()).token;
        const conToken = (tk) => ({ Authorization: "Bearer " + tk, "Content-Type": "application/json" });
        const encargado = conToken(await token("encargado@stilos.test"));
        const vendedor = conToken(await token("vendedor@stilos.test"));

        const nueva = await fetch(base + "/ropa/panel/marcas", { method: "POST", headers: encargado, body: JSON.stringify({ nombre: "Otra" }) });
        assert.equal(nueva.status, 201);
        assert.equal((await nueva.json()).mensaje, "Marca creada.");
        assert.equal((await fetch(base + "/ropa/panel/marcas", { headers: vendedor })).status, 403);
        assert.equal((await fetch(base + "/ropa/pedidos", { headers: vendedor })).status, 200);
        const repetida = await fetch(base + "/ropa/panel/marcas", { method: "POST", headers: encargado, body: JSON.stringify({ nombre: "Otra" }) });
        assert.deepEqual([repetida.status, (await repetida.json()).codigo], [409, "NOMBRE_DUPLICADO"]);

        // ROP-40 y ROP-57: el cliente ve lo suyo y no el panel; el Vendedor no mueve dinero.
        await crearPersonal("cliente@stilos.test", "cliente");
        const cliente = conToken(await token("cliente@stilos.test"));
        assert.equal((await fetch(base + "/ropa/mi-cuenta/pedidos", { headers: cliente })).status, 200);
        assert.equal((await fetch(base + "/ropa/mi-cuenta/pedidos")).status, 401, "sin ingresar no hay cuenta");
        assert.equal((await fetch(base + "/ropa/pedidos", { headers: cliente })).status, 403);
        assert.equal((await fetch(base + "/ropa/pedidos/1/pagado", { method: "POST", headers: vendedor })).status, 403);
        const sinVersion = await fetch(base + "/ropa/pedidos/1/estado", { method: "PATCH", headers: encargado, body: JSON.stringify({ estado: "confirmado" }) });
        assert.equal(sinVersion.status, 400);
      } finally { await new Promise((listo) => servidor.close(listo)); }
    });
  } finally {
    if (creado) {
      assert.match(DB_SCHEMA, /^stilos_test_[a-f0-9]{32}$/);
      await sequelize.query(`DROP SCHEMA "${DB_SCHEMA}" CASCADE`);
    }
    await sequelize.close();
  }
});

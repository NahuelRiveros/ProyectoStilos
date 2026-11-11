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
process.env.DB_HOST = "127.0.0.1";
process.env.DB_SSL = "false";
for (const clave of ["SMTP_USER", "SMTP_PASS"]) process.env[clave] = "";
const schema = "stilos_test_" + randomUUID().replaceAll("-", "");
process.env.DB_SCHEMA = schema;
process.env.ESQUEMA_SUSCRIPCION = schema;

const { sequelize, DB_SCHEMA } = await import("../src/core/database/sequelize.js");
const core = await import("../src/core/models/index.js");
const ropa = await import("../src/modulos/tienda_ropa/models/index.js");
const listas = await import("../src/modulos/tienda_ropa/services/listas_service.js");
const prendas = await import("../src/modulos/tienda_ropa/services/prendas_service.js");
const catalogo = await import("../src/modulos/tienda_ropa/services/catalogo_service.js");
const pedidos = await import("../src/modulos/tienda_ropa/services/pedidos_service.js");
const { moduloTiendaRopa } = await import("../src/modulos/tienda_ropa/modulo.js");
const { esquemaPrenda } = await import("../src/modulos/tienda_ropa/reglas.js");
const { sincronizarPermisos } = await import("../src/core/services/usuarios/permisos_service.js");
const { sembrarRolesDelSistema } = await import("../src/core/database/seed/seed_rbac.js");
const { createApp } = await import("../src/core/app.js");
const bcrypt = (await import("bcrypt")).default;

// Como la ruta: la prenda llega validada por el esquema.
const prendaValida = (datos) => esquemaPrenda.parse(datos);

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
      assert.equal(await listas.cargarGruposSugeridos(), 3);
      assert.equal(await listas.cargarGruposSugeridos(), 0);
      await assert.rejects(listas.crearColor({ nombre: "Negro", hex: "#000000", orden: 0 }), { codigo: "NOMBRE_DUPLICADO" });
      const ropaGrupo = (await listas.listarGruposTalle()).find((g) => g.nombre === "Ropa");
      assert.deepEqual(ropaGrupo.talles.map((x) => x.nombre), ["S", "M", "L", "XL", "XXL", "XXXL"]);
    });

    const colores = Object.fromEntries((await listas.listarColores()).map((c) => [c.nombre, c.id]));
    const grupoRopa = (await listas.listarGruposTalle()).find((g) => g.nombre === "Ropa");
    const talles = Object.fromEntries(grupoRopa.talles.map((x) => [x.nombre, x.id]));
    const marca = await listas.crearMarca({ nombre: "Stilos", activo: true });
    const remera = await prendas.crearPrenda(prendaValida({
      nombre: "Remera lisa", descripcion: "Algodón", categoria_id: remeras.id, marca_id: marca.id, grupo_talle_id: grupoRopa.id, precio: 15000.5,
      variantes: [
        { color_id: colores.Negro, talle_id: talles.S }, { color_id: colores.Negro, talle_id: talles.M },
        { color_id: colores.Rojo, talle_id: talles.S, disponible: false }, { color_id: colores.Rojo, talle_id: talles.M },
      ],
      imagenes: [
        { url: "https://x.test/general.jpg", color_id: null },
        { url: "https://x.test/negro-1.jpg", color_id: colores.Negro },
        { url: "https://x.test/rojo-1.jpg", color_id: colores.Rojo },
      ],
    }));
    const variante = (color, talle) => remera.variantes.find((v) => v.color_id === colores[color] && v.talle_id === talles[talle]);

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
          { color_id: colores.Rojo, talle_id: talles.S, disponible: false }, { color_id: colores.Rojo, talle_id: talles.M },
          { color_id: colores.Negro, talle_id: talles.L },
        ],
        imagenes: [{ url: "https://x.test/general.jpg", color_id: null }, { url: "https://x.test/negro-1.jpg", color_id: colores.Negro }],
      }));
      assert.equal(editada.variantes.find((v) => v.color_id === colores.Negro && v.talle_id === talles.S).id, negroS);
      assert.equal(editada.variantes.length, 5);
      assert.equal(editada.imagenes.length, 2);
      assert.equal(Number(editada.precio), 16000);
      await assert.rejects(prendas.crearPrenda(prendaValida({
        nombre: "Jean", categoria_id: remeras.id, grupo_talle_id: grupoRopa.id, precio: 1,
        variantes: [{ color_id: colores.Negro, talle_id: 999999 }],
      })), { codigo: "DATOS_INVALIDOS" });
    });

    await t.test("ROP-10 a ROP-12: la tienda muestra solo lo visible y filtra color y talle en la misma variante", async () => {
      const lista = await catalogo.listarCatalogo({ pagina: 1, categoria: mujer.id });
      assert.deepEqual(lista.items.map((p) => p.nombre), ["Remera lisa"], "Mujer incluye Mujer › Remeras");
      assert.equal(lista.items[0].foto, "https://x.test/general.jpg");
      assert.equal((await catalogo.listarCatalogo({ pagina: 1, color: colores.Rojo, talle: talles.S })).items.length, 0, "rojo S está agotado");
      assert.equal((await catalogo.listarCatalogo({ pagina: 1, color: colores.Rojo, talle: talles.M })).items.length, 1);
      assert.equal((await catalogo.listarCatalogo({ pagina: 1, categoria: hombre.id })).items.length, 0);

      const ficha = await catalogo.detallePrenda(remera.slug);
      assert.deepEqual(ficha.migas.map((m) => m.nombre), ["Mujer", "Remeras"]);
      assert.deepEqual(ficha.talles.map((x) => x.nombre), ["S", "M", "L"]);
      assert.equal(ficha.precio, 16000);
      const filtros = await catalogo.opcionesDeFiltro();
      assert.deepEqual(filtros.marcas.map((m) => m.nombre), ["Stilos"]);

      // Ocultar la categoría de arriba oculta todo lo de abajo.
      await listas.actualizarCategoria(mujer.id, { nombre: "Mujer", padre_id: null, orden: 0, activo: false });
      assert.equal((await catalogo.listarCatalogo({ pagina: 1 })).items.length, 0);
      await assert.rejects(catalogo.detallePrenda(remera.slug), { codigo: "NO_EXISTE" });
      await listas.actualizarCategoria(mujer.id, { nombre: "Mujer", padre_id: null, orden: 0, activo: true });
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
      const atendido = await pedidos.cambiarEstadoPedido(pedido.id, "atendido");
      assert.equal(atendido.estado, "atendido");
      assert.equal((await pedidos.listarPedidos({ estado: "nuevo", pagina: 1 })).items.length, 0);
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

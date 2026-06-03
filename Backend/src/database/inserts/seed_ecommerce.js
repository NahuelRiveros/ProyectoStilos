// =============================================================
// seed_ecommerce.js
// Datos base para los catálogos del módulo de ecommerce.
// Usa findOrCreate → idempotente, se puede ejecutar N veces.
// =============================================================

import {
  Ord01Estado,
  Ord02CondicionIva,
  Fact01TipoComp,
  Fact02PuntoVenta,
  Envio01Opcion,
  Prod02Genero,
  Prod01Categoria,
} from "../../models/index.js";

const HOY = new Date().toISOString().split("T")[0];

// ── Estados de orden ──────────────────────────────────────────

async function seed_estados_orden() {
  const estados = [
    { ORD01_CODIGO: "pendiente",     ORD01_ETIQUETA: "Pendiente de pago" },
    { ORD01_CODIGO: "pago_pendiente",ORD01_ETIQUETA: "Pago en revisión" },
    { ORD01_CODIGO: "pagado",        ORD01_ETIQUETA: "Pago confirmado" },
    { ORD01_CODIGO: "preparando",    ORD01_ETIQUETA: "Preparando pedido" },
    { ORD01_CODIGO: "enviado",       ORD01_ETIQUETA: "En camino" },
    { ORD01_CODIGO: "entregado",     ORD01_ETIQUETA: "Entregado" },
    { ORD01_CODIGO: "cancelado",     ORD01_ETIQUETA: "Cancelado" },
  ];

  for (const e of estados) {
    await Ord01Estado.findOrCreate({
      where:    { ORD01_CODIGO: e.ORD01_CODIGO },
      defaults: { ...e, ORD01_FECHAALTA: HOY },
    });
  }
  console.log("✅ Estados de orden verificados");
}

// ── Condiciones IVA (AFIP) ────────────────────────────────────

async function seed_condiciones_iva() {
  const condiciones = [
    { ORD02_CODIGO: "RI",  ORD02_NOMBRE: "Responsable Inscripto" },
    { ORD02_CODIGO: "CF",  ORD02_NOMBRE: "Consumidor Final" },
    { ORD02_CODIGO: "MT",  ORD02_NOMBRE: "Monotributista" },
    { ORD02_CODIGO: "EX",  ORD02_NOMBRE: "Exento" },
    { ORD02_CODIGO: "SS",  ORD02_NOMBRE: "Sujeto No Categorizado" },
  ];

  for (const c of condiciones) {
    await Ord02CondicionIva.findOrCreate({
      where:    { ORD02_CODIGO: c.ORD02_CODIGO },
      defaults: { ...c, ORD02_FECHAALTA: HOY },
    });
  }
  console.log("✅ Condiciones IVA verificadas");
}

// ── Tipos de comprobante AFIP ─────────────────────────────────

async function seed_tipos_comprobante() {
  const tipos = [
    {
      FACT01_LETRA:               "A",
      FACT01_NOMBRE:              "Factura A",
      FACT01_CONDICION_RECEPTOR:  "Responsable Inscripto",
    },
    {
      FACT01_LETRA:               "B",
      FACT01_NOMBRE:              "Factura B",
      FACT01_CONDICION_RECEPTOR:  "Consumidor Final / Monotributista / Exento",
    },
    {
      FACT01_LETRA:               "C",
      FACT01_NOMBRE:              "Factura C",
      FACT01_CONDICION_RECEPTOR:  "Emitida por Monotributista",
    },
  ];

  for (const t of tipos) {
    await Fact01TipoComp.findOrCreate({
      where:    { FACT01_LETRA: t.FACT01_LETRA },
      defaults: { ...t, FACT01_FECHAALTA: HOY },
    });
  }
  console.log("✅ Tipos de comprobante verificados");
}

// ── Punto de venta por defecto ────────────────────────────────

async function seed_punto_venta() {
  await Fact02PuntoVenta.findOrCreate({
    where:    { FACT02_NUMERO: 1 },
    defaults: {
      FACT02_NUMERO:   1,
      FACT02_NOMBRE:   "Punto de Venta 0001 - Stilos",
      FACT02_ACTIVO:   true,
      FACT02_FECHAALTA: HOY,
    },
  });
  console.log("✅ Punto de venta verificado");
}

// ── Opciones de envío ─────────────────────────────────────────

async function seed_opciones_envio() {
  const opciones = [
    {
      ENVIO01_NOMBRE:          "Retiro en local",
      ENVIO01_DESCRIPCION:     "Retirá tu pedido en nuestra tienda",
      ENVIO01_PRECIO:          0,
      ENVIO01_TIEMPO_ESTIMADO: "Inmediato",
      ENVIO01_GRATIS_DESDE:    null,
      ENVIO01_ACTIVO:          true,
      ENVIO01_FECHAALTA:       HOY,
    },
    {
      ENVIO01_NOMBRE:          "Correo Argentino",
      ENVIO01_DESCRIPCION:     "Envío a domicilio por Correo Argentino",
      ENVIO01_PRECIO:          1500,
      ENVIO01_TIEMPO_ESTIMADO: "5-7 días hábiles",
      ENVIO01_GRATIS_DESDE:    20000,
      ENVIO01_ACTIVO:          true,
      ENVIO01_FECHAALTA:       HOY,
    },
    {
      ENVIO01_NOMBRE:          "OCA",
      ENVIO01_DESCRIPCION:     "Envío a domicilio por OCA",
      ENVIO01_PRECIO:          1800,
      ENVIO01_TIEMPO_ESTIMADO: "3-5 días hábiles",
      ENVIO01_GRATIS_DESDE:    20000,
      ENVIO01_ACTIVO:          true,
      ENVIO01_FECHAALTA:       HOY,
    },
    {
      ENVIO01_NOMBRE:          "Andreani",
      ENVIO01_DESCRIPCION:     "Envío express por Andreani",
      ENVIO01_PRECIO:          2200,
      ENVIO01_TIEMPO_ESTIMADO: "24-48 hs hábiles",
      ENVIO01_GRATIS_DESDE:    30000,
      ENVIO01_ACTIVO:          true,
      ENVIO01_FECHAALTA:       HOY,
    },
  ];

  for (const o of opciones) {
    await Envio01Opcion.findOrCreate({
      where:    { ENVIO01_NOMBRE: o.ENVIO01_NOMBRE },
      defaults: o,
    });
  }
  console.log("✅ Opciones de envío verificadas");
}

// ── Géneros ───────────────────────────────────────────────────

async function seed_generos() {
  const generos = [
    { PROD02_NOMBRE: "Damas",   PROD02_SLUG: "damas" },
    { PROD02_NOMBRE: "Hombre",  PROD02_SLUG: "hombre" },
    { PROD02_NOMBRE: "Calzado", PROD02_SLUG: "calzado" },
  ];

  for (const g of generos) {
    await Prod02Genero.findOrCreate({
      where:    { PROD02_SLUG: g.PROD02_SLUG },
      defaults: { ...g, PROD02_FECHAALTA: HOY },
    });
  }
  console.log("✅ Géneros verificados");
}

// ── Categorías ────────────────────────────────────────────────

async function seed_categorias() {
  const categorias = [
    { PROD01_NOMBRE: "Remeras",    PROD01_SLUG: "remeras" },
    { PROD01_NOMBRE: "Pantalones", PROD01_SLUG: "pantalones" },
    { PROD01_NOMBRE: "Vestidos",   PROD01_SLUG: "vestidos" },
    { PROD01_NOMBRE: "Faldas",     PROD01_SLUG: "faldas" },
    { PROD01_NOMBRE: "Abrigos",    PROD01_SLUG: "abrigos" },
    { PROD01_NOMBRE: "Calzado",    PROD01_SLUG: "calzado" },
    { PROD01_NOMBRE: "Accesorios", PROD01_SLUG: "accesorios" },
  ];

  for (const c of categorias) {
    await Prod01Categoria.findOrCreate({
      where:    { PROD01_SLUG: c.PROD01_SLUG },
      defaults: { ...c, PROD01_FECHAALTA: HOY },
    });
  }
  console.log("✅ Categorías verificadas");
}

// ── Export principal ──────────────────────────────────────────

export async function seed_ecommerce() {
  console.log("🌱 Iniciando seeds de ecommerce...");
  await seed_generos();
  await seed_categorias();
  await seed_estados_orden();
  await seed_condiciones_iva();
  await seed_tipos_comprobante();
  await seed_punto_venta();
  await seed_opciones_envio();
  console.log("✅ Seeds de ecommerce verificados");
}

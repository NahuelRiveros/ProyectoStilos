// =============================================================
// services/pdf_service.js
//
// Genera el PDF de un comprobante usando Puppeteer.
// Los datos de empresa se leen desde variables de entorno:
//   EMPRESA_NOMBRE, EMPRESA_CUIT, EMPRESA_DIRECCION,
//   EMPRESA_CONDICION_IVA, EMPRESA_INICIO_ACT, EMPRESA_TEL
// =============================================================

import puppeteer from "puppeteer";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n) {
  return `$ ${Number(n).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtFecha(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function empresaEnv() {
  return {
    nombre:        process.env.EMPRESA_NOMBRE        ?? "Stylos",
    cuit:          process.env.EMPRESA_CUIT           ?? "30-00000000-0",
    direccion:     process.env.EMPRESA_DIRECCION      ?? "",
    condicionIva:  process.env.EMPRESA_CONDICION_IVA  ?? "Responsable Inscripto",
    inicioAct:     process.env.EMPRESA_INICIO_ACT     ?? "",
    tel:           process.env.EMPRESA_TEL             ?? "",
    email:         process.env.EMPRESA_EMAIL           ?? "",
  };
}

// ─── Template HTML ────────────────────────────────────────────────────────────

function buildHtml(data) {
  const emp = empresaEnv();

  const {
    letra,
    tipo,
    numero_formateado,
    fecha,
    cuit_receptor,
    orden,
  } = data;

  const facturacion = orden.facturacion ?? {};
  const direccion   = orden.direccion   ?? {};

  const dirStr = [
    direccion.calle,
    direccion.numero && `N° ${direccion.numero}`,
    direccion.piso   && `Piso ${direccion.piso}`,
    direccion.depto  && `Dto ${direccion.depto}`,
    direccion.localidad,
    direccion.provincia,
    direccion.codigo_postal && `CP ${direccion.codigo_postal}`,
  ].filter(Boolean).join(", ");

  const receptorNombre = facturacion.razon_social ?? orden.usuario_email ?? "Consumidor Final";
  const receptorCuit   = cuit_receptor ?? facturacion.cuit ?? "—";
  const receptorIva    = facturacion.condicion_iva ?? "Consumidor Final";

  const itemsHtml = (orden.items ?? []).map((item) => `
    <tr>
      <td class="center">${item.cantidad}</td>
      <td>${item.nombre}${item.talle ? ` — Talle ${item.talle}` : ""}${item.categoria ? `<br><small>${item.categoria}</small>` : ""}</td>
      <td class="right">${fmt(item.precio_unidad)}</td>
      <td class="right">${fmt(item.subtotal)}</td>
    </tr>
  `).join("");

  const total    = parseFloat(orden.total ?? 0);
  const envio    = parseFloat(orden.costo_envio ?? 0);
  const subtotal = parseFloat(orden.subtotal ?? 0);
  const ahora    = new Date().toLocaleString("es-AR");

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 11px;
    color: #1a1a2e;
    background: #fff;
    padding: 32px 36px;
  }

  /* ── HEADER ── */
  .header {
    display: grid;
    grid-template-columns: 1fr 80px 1fr;
    gap: 0;
    border: 2px solid #2C3750;
    margin-bottom: 14px;
  }
  .col-empresa, .col-comp {
    padding: 14px 16px;
  }
  .col-empresa {
    border-right: 1px solid #2C3750;
  }
  .col-comp {
    border-left: 1px solid #2C3750;
  }
  .col-letra {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #2C3750;
    padding: 10px 0;
    gap: 6px;
  }
  .letra-char {
    font-size: 48px;
    font-weight: 900;
    color: #fff;
    line-height: 1;
  }
  .letra-sub {
    font-size: 7px;
    font-weight: 700;
    color: #C7A98B;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .empresa-nombre {
    font-size: 17px;
    font-weight: 900;
    color: #2C3750;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 6px;
  }
  .empresa-data {
    font-size: 10px;
    color: #444;
    line-height: 1.7;
  }
  .comp-tipo {
    font-size: 13px;
    font-weight: 800;
    color: #2C3750;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }
  .comp-numero {
    font-size: 15px;
    font-weight: 700;
    color: #2C3750;
    font-family: 'Courier New', monospace;
    margin-bottom: 8px;
  }
  .comp-data {
    font-size: 10px;
    color: #444;
    line-height: 1.8;
  }
  .original-badge {
    display: inline-block;
    margin-top: 8px;
    background: #C7A98B;
    color: #fff;
    font-size: 8px;
    font-weight: 900;
    letter-spacing: 2px;
    padding: 2px 7px;
    border-radius: 2px;
    text-transform: uppercase;
  }

  /* ── RECEPTOR ── */
  .section-title {
    font-size: 8px;
    font-weight: 800;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #2C3750;
    border-bottom: 2px solid #C7A98B;
    padding-bottom: 3px;
    margin-bottom: 8px;
  }
  .receptor-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px 24px;
    border: 1px solid #ddd;
    padding: 10px 14px;
    margin-bottom: 14px;
    border-radius: 2px;
  }
  .receptor-row {
    display: flex;
    gap: 6px;
    font-size: 10px;
    line-height: 1.6;
  }
  .receptor-label {
    color: #888;
    white-space: nowrap;
    min-width: 80px;
  }
  .receptor-val {
    font-weight: 600;
    color: #1a1a2e;
  }

  /* ── ITEMS TABLE ── */
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 4px;
  }
  thead tr {
    background: #2C3750;
    color: #fff;
  }
  thead th {
    padding: 7px 10px;
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  tbody tr {
    border-bottom: 1px solid #ebebeb;
  }
  tbody tr:nth-child(even) {
    background: #f9f9fb;
  }
  tbody td {
    padding: 7px 10px;
    font-size: 10px;
    vertical-align: top;
    line-height: 1.5;
  }
  tbody td small {
    font-size: 8.5px;
    color: #888;
    display: block;
  }
  .center { text-align: center; }
  .right  { text-align: right; font-family: 'Courier New', monospace; }

  /* ── TOTALES ── */
  .totales-wrap {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
    margin-bottom: 18px;
  }
  .totales-box {
    width: 260px;
    border: 1px solid #ddd;
    border-radius: 2px;
    overflow: hidden;
  }
  .totales-row {
    display: flex;
    justify-content: space-between;
    padding: 5px 12px;
    font-size: 10px;
    border-bottom: 1px solid #ebebeb;
  }
  .totales-row:last-child {
    border-bottom: none;
    background: #2C3750;
    color: #fff;
    font-weight: 800;
    font-size: 12px;
    padding: 8px 12px;
  }
  .totales-row .lbl { color: inherit; }
  .totales-row .val { font-family: 'Courier New', monospace; font-weight: 700; }

  /* ── FOOTER ── */
  .footer {
    border-top: 1px dashed #bbb;
    padding-top: 10px;
    font-size: 8.5px;
    color: #aaa;
    text-align: center;
    line-height: 1.7;
  }
  .footer strong { color: #888; }
</style>
</head>
<body>

  <!-- ═══ HEADER ═══ -->
  <div class="header">
    <div class="col-empresa">
      <p class="empresa-nombre">${emp.nombre}</p>
      <div class="empresa-data">
        <div><strong>CUIT:</strong> ${emp.cuit}</div>
        ${emp.condicionIva ? `<div><strong>IVA:</strong> ${emp.condicionIva}</div>` : ""}
        ${emp.inicioAct    ? `<div><strong>Inicio de actividades:</strong> ${emp.inicioAct}</div>` : ""}
        ${emp.direccion    ? `<div>${emp.direccion}</div>` : ""}
        ${emp.tel          ? `<div><strong>Tel:</strong> ${emp.tel}</div>` : ""}
        ${emp.email        ? `<div>${emp.email}</div>` : ""}
      </div>
    </div>

    <div class="col-letra">
      <span class="letra-char">${letra ?? "B"}</span>
      <span class="letra-sub">LETRA</span>
    </div>

    <div class="col-comp">
      <p class="comp-tipo">${tipo ?? "Comprobante"}</p>
      <p class="comp-numero">${numero_formateado}</p>
      <div class="comp-data">
        <div><strong>Fecha:</strong> ${fmtFecha(fecha)}</div>
      </div>
      <span class="original-badge">Original</span>
    </div>
  </div>

  <!-- ═══ RECEPTOR ═══ -->
  <p class="section-title">Datos del receptor</p>
  <div class="receptor-grid">
    <div class="receptor-row">
      <span class="receptor-label">Señor(es):</span>
      <span class="receptor-val">${receptorNombre}</span>
    </div>
    <div class="receptor-row">
      <span class="receptor-label">CUIT / DNI:</span>
      <span class="receptor-val">${receptorCuit}</span>
    </div>
    <div class="receptor-row">
      <span class="receptor-label">Cond. IVA:</span>
      <span class="receptor-val">${receptorIva}</span>
    </div>
    ${dirStr ? `
    <div class="receptor-row">
      <span class="receptor-label">Domicilio:</span>
      <span class="receptor-val">${dirStr}</span>
    </div>
    ` : ""}
  </div>

  <!-- ═══ ITEMS ═══ -->
  <p class="section-title">Detalle</p>
  <table>
    <thead>
      <tr>
        <th class="center" style="width:6%">Cant.</th>
        <th style="width:54%">Descripción</th>
        <th class="right" style="width:20%">Precio unit.</th>
        <th class="right" style="width:20%">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml || '<tr><td colspan="4" class="center">Sin ítems</td></tr>'}
    </tbody>
  </table>

  <!-- ═══ TOTALES ═══ -->
  <div class="totales-wrap">
    <div class="totales-box">
      <div class="totales-row">
        <span class="lbl">Subtotal productos</span>
        <span class="val">${fmt(subtotal)}</span>
      </div>
      ${envio > 0 ? `
      <div class="totales-row">
        <span class="lbl">Costo de envío</span>
        <span class="val">${fmt(envio)}</span>
      </div>
      ` : ""}
      <div class="totales-row">
        <span class="lbl">TOTAL</span>
        <span class="val">${fmt(total)}</span>
      </div>
    </div>
  </div>

  <!-- ═══ FOOTER ═══ -->
  <div class="footer">
    <strong>Comprobante generado el ${ahora}</strong><br>
    Este documento es un comprobante interno del sistema.<br>
    No es válido como factura electrónica AFIP ni como tícket fiscal.
  </div>

</body>
</html>`;
}

// ─── Generador principal ──────────────────────────────────────────────────────

export async function generarPdfComprobante(data) {
  const html = buildHtml(data);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format:          "A4",
      printBackground: true,
      margin: { top: "0.8cm", bottom: "0.8cm", left: "0", right: "0" },
    });
    return pdf;
  } finally {
    await browser.close();
  }
}

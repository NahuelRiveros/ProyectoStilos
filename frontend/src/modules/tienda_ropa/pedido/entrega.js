// ROP-18: entrega del pedido. Funciones puras (las prueban servidor/tests/ropa_web.test.mjs).

/** "Retiro en el local", "Envío a San Martín 123, Formosa" o, sin la dirección (seguimiento, ROP-62), "Envío a domicilio". */
export function textoEntrega(pedido) {
  if (pedido.entrega !== "envio") return "Retiro en el local";
  return pedido.direccion ? `Envío a ${pedido.direccion}, ${pedido.localidad}` : "Envío a domicilio";
}

/**
 * Cuánto falta para el envío gratis con el total estimado del navegador (el que vale es el del servidor).
 * `desde` null = el negocio no tiene envío gratis.
 */
export function avisoEnvioGratis(totalPesos, desde) {
  if (desde === null || desde === undefined) return null;
  const falta = Math.max(0, Math.round(desde * 100) - Math.round(Number(totalPesos) * 100)) / 100;
  return { gratis: falta === 0, falta };
}

const FORMATO = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0, maximumFractionDigits: 2 });

/** 16000 → "$ 16.000"; 1500.5 → "$ 1.500,5". Intl separa con espacios duros: se pasan a espacios comunes. */
/** ROP-17: el panel solo acepta un precio anterior mayor que el precio; si viene, la prenda está en oferta. */
export const enOferta = (prenda) => prenda.precio_anterior !== null && prenda.precio_anterior !== undefined;

export const formatearPrecio = (monto) => FORMATO.format(Number(monto) || 0).replace(/[\u00a0\u202f]/g, " ");

const FORMATO = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0, maximumFractionDigits: 2 });

/** 16000 → "$ 16.000"; 1500.5 → "$ 1.500,5". Intl separa con espacios duros: se pasan a espacios comunes. */
export const formatearPrecio = (monto) => FORMATO.format(Number(monto) || 0).replace(/[\u00a0\u202f]/g, " ");

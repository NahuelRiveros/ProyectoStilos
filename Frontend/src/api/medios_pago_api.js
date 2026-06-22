import { http } from "./http";
import { paymentLogos } from "../assets";

export const TARJETAS_WEB = ["Visa", "Mastercard", "Cabal"];

// Grupos por defecto para tarjeta_credito
const DEFAULT_GRUPOS_TARJETA = [
  {
    tarjetas:    ["Visa", "Mastercard"],
    descripcion: "",
    cuotas:      [],
  },
  {
    tarjetas:    ["Cabal"],
    descripcion: "",
    cuotas:      [],
  },
];

export const DEFAULT_MEDIOS_PAGO = {
  habilitado: true,
  nota: "",
  tarjetasConfig: [
    { nombre: "Visa",       logo: paymentLogos.visa },
    { nombre: "Mastercard", logo: paymentLogos.mastercard },
    { nombre: "Cabal",      logo: paymentLogos.cabal },
  ],
  metodos: [
    {
      id: "mercadopago", nombre: "Mercado Pago",
      logo: paymentLogos.mercadopago,
      habilitado: true, descripcion: "", cuotas: [],
    },
    {
      id: "tarjeta_credito", nombre: "Tarjeta de crédito",
      logo: "",
      habilitado: true, descripcion: "",
      grupos: DEFAULT_GRUPOS_TARJETA,
    },
    {
      id: "go_cuotas", nombre: "Go Cuotas",
      logo: paymentLogos.go_cuotas,
      habilitado: false,
      descripcion: "Banco Nación — hasta 24 cuotas. Consultá en el local.",
      cuotas: [{ cantidad: 24, sinInteres: true, tarjetas: ["Banco Nación"] }],
    },
    {
      id: "efectivo", nombre: "Efectivo",
      logo: "", habilitado: true, descripcion: "", cuotas: [],
    },
  ],
};

const DEFAULT_TARJETA_LOGO = Object.fromEntries(
  DEFAULT_MEDIOS_PAGO.tarjetasConfig.map(t => [t.nombre, t.logo])
);
const DEFAULT_METODO_LOGO = Object.fromEntries(
  DEFAULT_MEDIOS_PAGO.metodos.map(m => [m.id, m.logo])
);

// Migra el viejo formato flat cuotas[] → grupos[] para tarjeta_credito
function migrarCuotasAGrupos(cuotas) {
  const map = new Map();
  for (const c of cuotas) {
    const key = [...(c.tarjetas ?? [])].sort().join("|");
    if (!map.has(key)) {
      map.set(key, { tarjetas: c.tarjetas ?? [], descripcion: "", cuotas: [] });
    }
    map.get(key).cuotas.push({ cantidad: c.cantidad, sinInteres: c.sinInteres ?? false });
  }
  return map.size > 0 ? [...map.values()] : DEFAULT_GRUPOS_TARJETA;
}

function mergeLogos(data) {
  return {
    ...data,
    tarjetasConfig: (data.tarjetasConfig?.length
      ? data.tarjetasConfig
      : DEFAULT_MEDIOS_PAGO.tarjetasConfig
    ).map(t => ({
      ...t,
      logo: t.logo || DEFAULT_TARJETA_LOGO[t.nombre] || "",
    })),
    metodos: (data.metodos ?? DEFAULT_MEDIOS_PAGO.metodos).map(m => {
      const base = { ...m, logo: m.logo || DEFAULT_METODO_LOGO[m.id] || "" };

      // Para tarjeta_credito: asegurar que tenga grupos (migrar si viene en formato viejo)
      if (m.id === "tarjeta_credito") {
        if (!base.grupos?.length) {
          base.grupos = base.cuotas?.length
            ? migrarCuotasAGrupos(base.cuotas)
            : DEFAULT_GRUPOS_TARJETA;
        }
      }

      return base;
    }),
  };
}

export async function getMediosPago() {
  const res = await http.get("/config/medios-pago");
  const data = res.data?.data;
  return data ? mergeLogos(data) : DEFAULT_MEDIOS_PAGO;
}

export async function saveMediosPago(config) {
  const res = await http.put("/config/medios-pago", config);
  return res.data?.data ?? config;
}

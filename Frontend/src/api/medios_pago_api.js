import { http } from "./http";
import { paymentLogos } from "../assets";

export const DEFAULT_MEDIOS_PAGO = {
  habilitado: true,
  nota: "",
  tarjetasConfig: [
    { nombre: "Visa",       logo: paymentLogos.visa },
    { nombre: "Mastercard", logo: paymentLogos.mastercard },
    { nombre: "Naranja X",  logo: paymentLogos.naranjax },
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
      cuotas: [
        { cantidad: 1,  sinInteres: true,  tarjetas: ["Visa", "Mastercard", "Naranja X", "Cabal"] },
        { cantidad: 3,  sinInteres: false, tarjetas: [] },
        { cantidad: 6,  sinInteres: false, tarjetas: [] },
        { cantidad: 12, sinInteres: false, tarjetas: [] },
      ],
    },
    {
      id: "go_cuotas", nombre: "Go Cuotas",
      logo: paymentLogos.go_cuotas,
      habilitado: false, descripcion: "Banco Nación — hasta 24 cuotas. Consultá en el local.",
      cuotas: [{ cantidad: 24, sinInteres: true, tarjetas: ["Banco Nación"] }],
    },
    {
      id: "efectivo", nombre: "Efectivo",
      logo: "",
      habilitado: true, descripcion: "", cuotas: [],
    },
  ],
};

const DEFAULT_TARJETA_LOGO = Object.fromEntries(
  DEFAULT_MEDIOS_PAGO.tarjetasConfig.map(t => [t.nombre, t.logo])
);
const DEFAULT_METODO_LOGO = Object.fromEntries(
  DEFAULT_MEDIOS_PAGO.metodos.map(m => [m.id, m.logo])
);

function mergeLogos(data) {
  return {
    ...data,
    tarjetasConfig: (data.tarjetasConfig?.length ? data.tarjetasConfig : DEFAULT_MEDIOS_PAGO.tarjetasConfig).map(t => ({
      ...t,
      logo: t.logo || DEFAULT_TARJETA_LOGO[t.nombre] || "",
    })),
    metodos: (data.metodos ?? DEFAULT_MEDIOS_PAGO.metodos).map(m => ({
      ...m,
      logo: m.logo || DEFAULT_METODO_LOGO[m.id] || "",
    })),
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

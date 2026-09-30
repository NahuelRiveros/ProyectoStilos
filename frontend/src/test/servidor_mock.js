import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { proyecto } from "compartido/proyecto.js";

export const API = "http://localhost:3001/api";

// Cada test declara las respuestas que necesita con servidorMock.use(...). Excepciones: la config de
// pagos, que la piden la ficha, las tarjetas y el checkout (valores iniciales del proyecto), y qué pagos
// online hay (el detalle del pedido lo pregunta): por defecto ninguno, como sin credenciales.
export const servidorMock = setupServer(
  http.get(`${API}/configuracion/pagos`, () => HttpResponse.json({ ok: true, data: proyecto.pagos })),
  http.get(`${API}/pagos/disponibles`, () => HttpResponse.json({ ok: true, data: { mercado_pago: false } })),
  http.get(`${API}/pagos/pedidos/:id`, () => HttpResponse.json({ ok: true, data: [] })),
);

import { UniqueConstraintError } from "sequelize";
import { proyecto } from "compartido/proyecto.js";
import { aCentavos, desdeCentavos } from "compartido/reglas/dinero.js";
import { env } from "../../nucleo/env.js";
import { sequelize } from "../../nucleo/db/sequelize.js";
import { Conflicto, ErrorApp, NoAutorizado, NoEncontrado } from "../../nucleo/errores.js";
import { Pedido } from "../tienda/modelos.js";
import { registrarCobroOnline } from "../tienda/cobro_servicio.js";
import { avanzarEstadoAutomatico } from "../tienda/pedido_servicio.js";
import { AvisoPago, PagoOnline } from "./modelos.js";
import { proveedores as PROVEEDORES } from "./proveedores/index.js";

// Pagos online: el cliente paga el SALDO de su pedido con un proveedor (Mercado Pago) y, cuando el
// proveedor avisa que se aprobó, el cobro entra solo (igual que uno cargado a mano) y el pedido pasa
// a "Pago recibido". Cada función recibe `proveedores` para poder probarse sin llamar al proveedor real.

const CONFIG = proyecto.pagos_online ?? {};
const numeroPedido = (id) => `#${String(id).padStart(6, "0")}`;
// A dónde vuelve el cliente después de pagar: la tienda (Vercel) o, en local, Vite.
const urlTienda = () => env.origenesPermitidos[0] ?? "http://localhost:5173";

/** { mercado_pago: true/false }: la tienda muestra el botón solo si el proveedor tiene credenciales. */
export function disponibles(proveedores = PROVEEDORES) {
  return Object.fromEntries(Object.entries(proveedores).map(([clave, p]) => [clave, p.configurado]));
}

function proveedorConfigurado(proveedores, clave) {
  const proveedor = proveedores[clave];
  if (!proveedor?.configurado) {
    throw new ErrorApp(503, "PAGOS_NO_DISPONIBLES", "El pago online todavía no está disponible. Coordiná el pago con el negocio.");
  }
  return proveedor;
}

/**
 * Link para que el cliente pague el saldo de SU pedido. Si ya tiene uno vigente por el mismo monto
 * (doble click, volvió a entrar) se reutiliza: no se crean cobros de más en el proveedor.
 */
export async function iniciarPago({ pedido_id, usuario, proveedor: clave = "mercado_pago" }, { proveedores = PROVEEDORES } = {}) {
  const proveedor = proveedorConfigurado(proveedores, clave);
  const pedido = await Pedido.findByPk(pedido_id);
  if (!pedido || pedido.usuario_id !== usuario.id) throw new NoEncontrado("El pedido no existe.", "PEDIDO_NO_ENCONTRADO");
  if (pedido.estado === "cancelado") throw new Conflicto("El pedido está cancelado.", "PEDIDO_CANCELADO");
  if (!(CONFIG.medios ?? []).includes(pedido.medio_pago)) {
    throw new Conflicto("Este pedido se paga con otro medio: coordiná el pago con el negocio.", "MEDIO_SIN_PAGO_ONLINE");
  }
  const saldo = desdeCentavos(aCentavos(pedido.total) - aCentavos(pedido.monto_cobrado));
  if (saldo <= 0) throw new Conflicto("El pedido ya está pagado.", "PEDIDO_PAGADO");

  const vigente = await PagoOnline.findOne({ where: { pedido_id, proveedor: clave, estado: "iniciado", monto: saldo }, order: [["id", "DESC"]] });
  if (vigente?.url_pago) return { url: vigente.url_pago, pago_online_id: vigente.id };

  const pago = await PagoOnline.create({ pedido_id, proveedor: clave, monto: saldo });
  try {
    const cobro = await proveedor.crearCobro({
      pago_online_id: pago.id,
      pedido_id,
      monto: saldo,
      titulo: `Pedido ${numeroPedido(pedido_id)}`,
      email: pedido.entrega?.email,
      urlRetorno: `${urlTienda()}/mis-pedidos/${pedido_id}`,
      urlAviso: env.urlApiPublica ? `${env.urlApiPublica}/api/pagos/aviso/${clave}` : null,
    });
    await pago.update({ referencia_externa: cobro.referencia_externa, url_pago: cobro.url });
    return { url: cobro.url, pago_online_id: pago.id };
  } catch (error) {
    await pago.update({ estado: "error", detalle: { error: String(error.message).slice(0, 300) } });
    throw new ErrorApp(502, "PROVEEDOR_NO_RESPONDE", `No pudimos conectar con ${proveedor.nombre}. Probá de nuevo en unos minutos.`);
  }
}

/**
 * Aviso (webhook) del proveedor. Se verifica la firma, se consulta el estado REAL del pago (el
 * contenido del aviso no se usa) y, en una transacción: se marca el aviso como procesado, se
 * actualiza el pago y, si se aprobó por el monto esperado, se registra el cobro y avanza el pedido.
 */
export async function procesarAviso({ proveedor: clave, headers, query, body }, { proveedores = PROVEEDORES } = {}) {
  const proveedor = proveedores[clave];
  if (!proveedor?.configurado) throw new NoEncontrado("Proveedor de pagos desconocido.", "PROVEEDOR_DESCONOCIDO");
  const aviso = proveedor.verificarAviso({ headers, query, body });
  if (!aviso.valido) throw new NoAutorizado("Aviso de pago con firma inválida.", "FIRMA_INVALIDA");
  if (!aviso.esPago || !aviso.idPago) return { procesado: false };
  if (await AvisoPago.findOne({ where: { proveedor: clave, id_evento: aviso.idEvento } })) return { procesado: false, repetido: true };

  const real = await proveedor.consultarPago(aviso.idPago);
  const [pedido_id, pago_online_id] = real.referencia.split(":").map(Number);

  try {
    return await sequelize.transaction(async (transaction) => {
      await AvisoPago.create({ proveedor: clave, id_evento: aviso.idEvento }, { transaction });
      const pago = await PagoOnline.findOne({ where: { id: pago_online_id || 0, pedido_id: pedido_id || 0, proveedor: clave }, transaction, lock: transaction.LOCK.UPDATE });
      if (!pago) return { procesado: false }; // un pago que no es de esta tienda

      let estado = real.estado;
      if (["aprobado", "revisar"].includes(pago.estado) && estado !== "reembolsado") {
        estado = pago.estado; // ya se procesó la aprobación (otro aviso del mismo pago)
      } else if (estado === "aprobado") {
        const montoEsperado = real.moneda === "ARS" && aCentavos(real.monto) === aCentavos(pago.monto);
        const cobrado =
          montoEsperado &&
          (await registrarCobroOnline(
            { pedido_id, monto: pago.monto, metodo: proveedor.metodo, pago_online_id: pago.id, nota: `${proveedor.nombre} · pago ${real.id}` },
            { transaction },
          ));
        // Aprobado pero no cierra (otro monto, pedido cancelado o ya cobrado): lo revisa una persona.
        if (!cobrado) estado = "revisar";
        else if (CONFIG.estado_al_aprobar) {
          await avanzarEstadoAutomatico({ pedido_id, desde: "pendiente", hacia: CONFIG.estado_al_aprobar, motivo: `Pago aprobado por ${proveedor.nombre}` }, { transaction });
        }
      }
      await pago.update({ estado, pago_externo_id: real.id, detalle: real.detalle }, { transaction });
      return { procesado: true, estado };
    });
  } catch (error) {
    // Otro aviso igual entró al mismo tiempo y ya lo procesó.
    if (error instanceof UniqueConstraintError) return { procesado: false, repetido: true };
    throw error;
  }
}

/** Para el panel: los intentos de pago online de un pedido (incluidos los que hay que revisar). */
export async function pagosDelPedido(pedido_id) {
  const pagos = await PagoOnline.findAll({
    where: { pedido_id },
    attributes: ["id", "proveedor", "estado", "monto", "pago_externo_id", "detalle", "creado_en", "actualizado_en"],
    order: [["id", "DESC"]],
  });
  return pagos.map((p) => p.get({ plain: true }));
}

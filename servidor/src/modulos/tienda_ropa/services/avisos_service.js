import { QueryTypes } from "sequelize";
import { sequelize } from "../../../core/database/sequelize.js";
import { enviarEmail, mailConfigured } from "../../../core/services/common/mail_service.js";
import { Persona, Usuario } from "../../../core/models/index.js";
import { permisosConfig } from "../../../../../core/permisos_config.js";
import { deploymentConfig } from "../../../../../proyecto/deployment_config.js";
import { PedidoWhatsapp, PedidoWhatsappItem } from "../models/index.js";
import { ETIQUETA_ESTADO } from "../reglas.js";

/**
 * ROP-55: avisos por correo de los pedidos (adaptado de DistribuCG). Se disparan después de confirmar
 * y nunca propagan errores: un correo que falla queda en el log y el pedido sigue. Sin correo
 * configurado no hacen nada (ni consultan la base).
 */

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" };
// Lo que escribe el cliente (nombre, motivo, dirección) va escapado: no puede meter HTML en el correo.
export const escapar = (valor) => String(valor ?? "").replace(/[&<>"']/g, (c) => ESCAPES[c]);
const dinero = (monto) => `$ ${Number(monto).toLocaleString("es-AR", { maximumFractionDigits: 2 })}`;
const numero = (id) => `#${String(id).padStart(5, "0")}`;

/** Correos de quienes pueden ver pedidos (con "Ver pedidos" o un rol con todos los permisos), sin repetir. */
async function correosEquipo() {
  const filas = await sequelize.query(`
    SELECT DISTINCT lower(trim(pe.email)) AS email
    FROM usuario u
    JOIN persona pe ON pe.id = u.persona_id
    JOIN usuario_rol ur ON ur.usuario_id = u.id
    JOIN rol r ON r.id = ur.rol_id
    WHERE u.activo AND u.eliminado_en IS NULL AND trim(coalesce(pe.email, '')) <> ''
      AND (r.codigo IN (:totales) OR EXISTS (
        SELECT 1 FROM rol_permiso rp JOIN permiso p ON p.id = rp.permiso_id
        WHERE rp.rol_id = r.id AND p.codigo = 'pedidos.ver'))
    ORDER BY email`, { replacements: { totales: permisosConfig.rolesTotales }, type: QueryTypes.SELECT });
  return filas.map((f) => f.email);
}

async function cargar(id) {
  const pedido = await PedidoWhatsapp.findByPk(id, { include: [{ model: PedidoWhatsappItem, as: "items" }] });
  if (!pedido) return null;
  const usuario = pedido.usuario_id ? await Usuario.findByPk(pedido.usuario_id, { attributes: ["persona_id"] }) : null;
  const persona = usuario ? await Persona.findByPk(usuario.persona_id, { attributes: ["email"] }) : null;
  return { pedido, emailCliente: persona?.email ?? null };
}

function plantilla(titulo, cuerpo, { url, boton }) {
  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#1e2d3d">
  <h1 style="font-size:20px">${escapar(titulo)}</h1>${cuerpo}
  <p style="margin:24px 0"><a href="${escapar(url)}" style="background:#7a4f35;color:#fff;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:bold">${escapar(boton)}</a></p>
  <p style="font-size:12px;color:#64748b">Este correo lo envió automáticamente ${escapar(deploymentConfig.nombre)}.</p></div>`;
}

function detalle(pedido) {
  const filas = pedido.items.map((i) => `<tr><td style="padding:4px 0">${escapar(i.cantidad)} × ${escapar(i.nombre_prenda)} (${escapar(i.color)}, talle ${escapar(i.talle)})</td><td style="text-align:right">${escapar(dinero(i.subtotal))}</td></tr>`).join("");
  const entrega = pedido.entrega === "envio" ? `Envío a ${pedido.direccion}, ${pedido.localidad}` : "Retiro en el local";
  return `<table style="width:100%;font-size:14px;border-collapse:collapse">${filas}
  <tr><td style="padding-top:8px;border-top:1px solid #e2e8f0;font-weight:bold">Total</td><td style="padding-top:8px;border-top:1px solid #e2e8f0;text-align:right;font-weight:bold">${escapar(dinero(pedido.total))}</td></tr></table>
  <p style="font-size:14px">Entrega: ${escapar(entrega)}</p>`;
}

/** Corre el aviso sin frenar a quien lo llama ni romper si el correo falla. */
function enSegundoPlano(tarea) {
  if (!mailConfigured()) return;
  tarea().catch((error) => console.error("No se pudo enviar el aviso por correo:", error.message));
}

const urlCliente = (id) => `${deploymentConfig.frontendUrl}/mis-pedidos/${id}`;
const urlPanel = () => `${deploymentConfig.frontendUrl}/admin/ropa/pedidos`;

export const avisarPedidoNuevo = (id) => enSegundoPlano(async () => {
  const datos = await cargar(id);
  if (!datos) return;
  const { pedido, emailCliente } = datos;
  const equipo = await correosEquipo();
  if (equipo.length) {
    await enviarEmail({ to: equipo, subject: `Pedido nuevo ${numero(id)} de ${pedido.nombre}`,
      html: plantilla(`Pedido nuevo ${numero(id)}`, `<p>De ${escapar(pedido.nombre)} (${escapar(pedido.celular)}).</p>${detalle(pedido)}`, { url: urlPanel(), boton: "Ver pedidos" }) });
  }
  if (emailCliente) {
    await enviarEmail({ to: emailCliente, subject: `Recibimos tu pedido ${numero(id)}`,
      html: plantilla(`¡Recibimos tu pedido ${numero(id)}!`, `<p>Te avisamos por acá cada vez que avance.</p>${detalle(pedido)}`, { url: urlCliente(id), boton: "Ver mi pedido" }) });
  }
});

/** Al cliente solo le llega el motivo cuando se cancela; los otros motivos son internos. */
export const avisarCambioEstado = (id, estado, motivo) => enSegundoPlano(async () => {
  const datos = await cargar(id);
  if (!datos?.emailCliente) return;
  const extra = estado === "cancelado" && motivo ? `<p>Motivo: ${escapar(motivo)}</p>` : "";
  await enviarEmail({ to: datos.emailCliente, subject: `Tu pedido ${numero(id)}: ${ETIQUETA_ESTADO[estado]}`,
    html: plantilla(`Tu pedido ${numero(id)} está: ${ETIQUETA_ESTADO[estado]}`, extra, { url: urlCliente(id), boton: "Ver mi pedido" }) });
});

export const avisarCancelacionCliente = (id, motivo) => enSegundoPlano(async () => {
  const equipo = await correosEquipo();
  if (!equipo.length) return;
  await enviarEmail({ to: equipo, subject: `El cliente canceló el pedido ${numero(id)}`,
    html: plantilla(`Pedido ${numero(id)} cancelado por el cliente`, `<p>Motivo: ${escapar(motivo)}</p>`, { url: urlPanel(), boton: "Ver pedidos" }) });
});

export const avisarComprobanteNuevo = (id) => enSegundoPlano(async () => {
  const equipo = await correosEquipo();
  if (!equipo.length) return;
  await enviarEmail({ to: equipo, subject: `Comprobante para revisar: pedido ${numero(id)}`,
    html: plantilla(`Llegó un comprobante del pedido ${numero(id)}`, "<p>Revisalo y aceptalo o rechazalo desde el panel.</p>", { url: urlPanel(), boton: "Revisar" }) });
});

export const avisarComprobanteRechazado = (id, motivo) => enSegundoPlano(async () => {
  const datos = await cargar(id);
  if (!datos?.emailCliente) return;
  await enviarEmail({ to: datos.emailCliente, subject: `Revisá el comprobante de tu pedido ${numero(id)}`,
    html: plantilla(`No pudimos validar tu comprobante`, `<p>Motivo: ${escapar(motivo)}</p><p>Podés subir otro desde tu pedido.</p>`, { url: urlCliente(id), boton: "Ver mi pedido" }) });
});

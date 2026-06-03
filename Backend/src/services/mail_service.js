import nodemailer from "nodemailer";
import { env } from "../configuracion_servidor/env.js";

export function crearMailer() {
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

export async function probarSMTP() {
  const transporter = crearMailer();

  await transporter.verify();

  console.log("✅ SMTP OK");
}

export async function enviarMailRecuperacionPassword({
  to,
  nombre,
  resetUrl,
}) {
  const mailer = crearMailer();

  await mailer.sendMail({
    from: env.SMTP_FROM,
    to,
    subject: "Recuperación de contraseña - Sistema RAV",
    html: `
      <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
        <h2>Recuperación de contraseña</h2>

        <p>Hola ${nombre || "usuario"},</p>

        <p>
          Se recibió una solicitud para restablecer la contraseña de tu cuenta.
        </p>

        <p>
          Para continuar, hacé clic en el siguiente enlace:
        </p>

        <p>
          <a 
            href="${resetUrl}"
            style="
              display:inline-block;
              padding:10px 16px;
              background:#2563eb;
              color:white;
              text-decoration:none;
              border-radius:8px;
            "
          >
            Restablecer contraseña
          </a>
        </p>

        <p>
          Este enlace es temporal y vencerá en 15 minutos.
        </p>

        <p>
          Si no solicitaste este cambio, podés ignorar este correo.
        </p>
      </div>
    `,
  });
}
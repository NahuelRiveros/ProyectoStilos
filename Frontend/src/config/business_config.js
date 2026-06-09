// DATOS DEL NEGOCIO
// Información legal y de contacto que aparece en el footer.

export const businessConfig = {

  // ── Datos legales ──────────────────────────────────────────────────────────
  legalName: "",  // Razón social (ej: "Juan Pérez Accesorios S.R.L.")
  taxId: "",      // CUIT (ej: "20-12345678-9")

  // ── Dirección ─────────────────────────────────────────────────────────────
  address: "",    // Calle y número (ej: "San Martín 1234, Local 5")
  city: "",
  province: "",
  country: "Argentina",

  // ── Contacto visible al cliente ────────────────────────────────────────────
  // Teléfono general (ej: "+54 9 11 1234-5678") — puede ser un fijo o un celular de contacto
  // Distinto del número de WhatsApp de consultas que está en whatsapp_config.js
  phone: "",
  // Email de contacto (ej: "hola@mitienda.com")
  supportEmail: "",

  // ── Horarios ──────────────────────────────────────────────────────────────
  openingHours: "", // Ej: "Lunes a viernes de 9 a 18 hs"

  // ── Políticas — dejar vacío ("") para ocultar el link en el footer ─────────
  policies: {
    exchanges: "", // Cambios y devoluciones
    privacy:   "", // Política de privacidad
    terms:     "", // Términos y condiciones
    shipping:  "", // Envíos
  },

  // ── AFIP ──────────────────────────────────────────────────────────────────
  // Widget Data Fiscal (QR de AFIP). Solo se muestra si cartConfig.mostrarDataFiscal: true
  // Generar en: https://www.afip.gob.ar/fe/qr/
  dataFiscalUrl: "",
};

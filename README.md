# Angar — Plataforma de tienda web modular

Sistema de e-commerce y catálogo configurable, diseñado para replicarse rápidamente en diferentes clientes sin tocar el código base. Cada cliente se configura desde archivos de configuración centralizados.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + Vite, JavaScript puro |
| Estilos | Tailwind CSS v4, CSS custom properties |
| Routing | React Router v7 |
| Server state | TanStack Query v5 |
| Formularios | react-hook-form |
| HTTP | axios |
| Backend | Node.js + Express |
| Base de datos | PostgreSQL + Sequelize |
| Imágenes | Cloudinary |
| Pagos | MercadoPago (Checkout Pro) |

---

## Modos de tienda

El sistema soporta tres modos que se configuran con una sola línea:

```js
// src/config/store_config.js
mode: STORE_MODES.CATALOG_WHATSAPP   // catálogo + botón de consulta por WhatsApp
mode: STORE_MODES.CATALOG_ONLY       // solo catálogo informativo, sin acciones
mode: STORE_MODES.ECOMMERCE          // carrito + checkout + MercadoPago
```

---

## Configurar para un nuevo cliente

Todo lo que cambia de cliente en cliente vive en `Frontend/src/config/`. No hace falta tocar código:

### 1. Marca y redes (`brand_config.js`)
```js
export const brandConfig = {
  name:           "Nombre del negocio",
  shortName:      "N",
  tagline:        "Descripción breve",
  logoUrl:        null,           // URL del logo o null para usar texto
  footerName:     "Nombre del negocio",
  footerSubtitle: "Tagline footer",
  social: {
    instagram: "https://instagram.com/...",
    facebook:  "",
  },
};
```

### 2. Colores y tipografía (`theme_config.js`)
```js
export const themeConfig = {
  accent: "#fbbf24",      // botones, badges, hovers
  content: {
    navy:    "#060d1f",   // botón primario
    surface: "#f8fafc",   // fondo de página
  },
  navbar: {
    bg:   "#fef3c7",      // fondo del navbar
    text: "#1c0f00",
  },
  footer: {
    bg:   "#060d1f",      // footer independiente del navbar
    text: "#ffffff",
  },
};
```

### 3. Tienda y carrito (`store_config.js` + `cart_config.js`)
```js
// store_config.js
mode:                    STORE_MODES.CATALOG_WHATSAPP,
enablePrices:            true,
enableStockVisibility:   true,
enableWhatsAppConsultation: true,

// cart_config.js
enableCart:     false,     // true → activa carrito completo
enableCheckout: false,     // true → activa checkout
enablePayments: false,     // true → activa MercadoPago
productDetailCta: "whatsapp",   // "whatsapp" | "cart" | "none"
```

### 4. Panel admin (`admin_config.js`)
```js
modules: {
  dashboard: true,
  products:  true,
  orders:    false,   // activar cuando sea modo ecommerce
  payments:  false,
}
```

### 5. Datos legales y contacto (`business_config.js`)
```js
legalName:     "Razón social S.A.",
taxId:         "30-12345678-9",
supportEmail:  "contacto@negocio.com",
policies: {
  exchanges: "https://...",  // URL de política de cambios
  privacy:   "",
},
dataFiscalUrl: "",   // URL del QR AFIP (activar con mostrarDataFiscal: true)
```

### 6. WhatsApp (`whatsapp_config.js`)
```js
export const WHATSAPP_NUMBER = "5493704123456";  // código de país + número sin +
```

### 7. MercadoPago (`.env`)
```
VITE_MP_PUBLIC_KEY=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

## Instalación y desarrollo

```bash
# Frontend
cd Frontend
npm install
cp .env.example .env     # completar VITE_MP_PUBLIC_KEY
npm run dev              # :5173

# Backend
cd Backend
npm install
# configurar .env con DB, JWT_SECRET, MP_SECRET_KEY, CLOUDINARY_*
npm run dev
```

---

## Estructura del proyecto

```
Angar/
├── Frontend/
│   ├── src/
│   │   ├── config/              ← ÚNICO lugar donde se configura por cliente
│   │   │   ├── theme_config.js  ← colores y tipografía
│   │   │   ├── brand_config.js  ← nombre, logo, redes
│   │   │   ├── store_config.js  ← modo de tienda
│   │   │   ├── cart_config.js   ← carrito y ecommerce
│   │   │   ├── admin_config.js  ← módulos del backoffice
│   │   │   ├── business_config.js ← datos legales
│   │   │   ├── whatsapp_config.js ← integración WhatsApp
│   │   │   ├── auth_config.js   ← endpoints de auth
│   │   │   ├── mp_config.js     ← clave pública MercadoPago
│   │   │   └── catalog_config.js ← labels del catálogo
│   │   ├── app/
│   │   │   ├── router.jsx       ← rutas protegidas
│   │   │   └── theme_provider.jsx ← inyecta CSS vars desde theme_config
│   │   ├── cart/                ← sistema de carrito completo
│   │   │   ├── cart_context.jsx ← estado global (solo usuarios auth)
│   │   │   ├── cart_page.jsx
│   │   │   ├── cart_icon.jsx
│   │   │   ├── cart_api.js
│   │   │   └── validations/     ← sanitización y detección de alertas
│   │   ├── pages/
│   │   │   ├── admin/           ← backoffice completo
│   │   │   └── productos/       ← catálogo público + detalle
│   │   ├── components/
│   │   │   ├── layout/          ← navbar, footer con sellos de confianza
│   │   │   └── home/            ← product card
│   │   └── index.css            ← tokens y clases semánticas (NO editar colores acá)
│   └── .env.example
└── Backend/
    └── src/
        └── ...                  ← API REST Express + PostgreSQL
```

---

## Carrito y validaciones

El sistema de carrito solo funciona para usuarios registrados. Al abrir el carrito se detectan automáticamente:

- Productos desactivados → se eliminan automáticamente del servidor
- Precios cambiados → se muestra aviso con precio anterior vs actual
- Variantes inexistentes (talle/color) → se bloquea el checkout
- Stock insuficiente → se deshabilita el botón `+`
- Cantidades inválidas → se sanitizan al rango `[1, 99]`
- El precio **nunca** se envía desde el frontend — el backend lo obtiene siempre de la base de datos

---

## Sellos de confianza (e-commerce Argentina)

Cuando `cartConfig.enableCart: true` aparece automáticamente en el footer:

- Logo de **MercadoPago**
- Logos de tarjetas (Visa, Mastercard, AMEX, Naranja, Cabal)
- Sello **Compra Segura** + SSL/HTTPS
- Link a **Defensa del Consumidor** (Ley 24.240) — obligatorio en Argentina
- Widget **Data Fiscal AFIP** (opcional, requiere URL de AFIP)

Todos controlables desde `cart_config.js`:
```js
mostrarSellosConfianza:    true,
mostrarLogoMercadoPago:    true,
mostrarLogosTarjetas:      true,
mostrarDefensaConsumidor:  true,
mostrarDataFiscal:         false,
tarjetasAceptadas: ["visa", "mastercard", "amex"],
```

---

## Formulario de relevamiento de cliente

En la raíz del proyecto existe `client_intake_form.html` — un formulario para completar junto al cliente antes de configurar el sitio. Cubre marca, modo de tienda, WhatsApp, catálogo, footer, panel admin y colores. Al completarlo se puede pasar directamente al asistente de IA para aplicar la configuración automáticamente.

---

## Scripts

```bash
npm run dev      # servidor de desarrollo (Vite :5173)
npm run build    # build de producción en dist/
npm run preview  # preview del build
npm run lint     # ESLint
```

---

## Variables de entorno requeridas

### Frontend (`.env`)
```
VITE_MP_PUBLIC_KEY=     # Public key de MercadoPago (safe para el cliente)
```

### Backend (`.env`)
```
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=
JWT_SECRET=
MP_ACCESS_TOKEN=        # Secret key de MercadoPago (SOLO en el servidor)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

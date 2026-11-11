# Despliegue de Stilos: Supabase + Render + Vercel

Tres servicios, en este orden: la **base** (Supabase), la **API** (Render, carpeta `servidor/`) y la
**tienda** (Vercel, carpeta `frontend/`). Las variables se preparan en `servidor/.env.produccion` y
`frontend/.env.produccion` (fuera de git) a partir de sus `.example`, que explican cada una.

## 1. Supabase (base de datos)

1. Creá el proyecto y guardá la contraseña de la base.
2. **Connect → Session pooler** (puerto 5432): copiá la dirección completa. Es `BD_URL_SUPABASE`.
   Si la contraseña tiene `@ # / ?` u otros símbolos, codificalos dentro de la dirección.
3. Las tablas las crea la API sola al arrancar, en el schema `BD_ESQUEMA` (`stilos`). No crees nada a mano.

## 2. Render (API)

| Opción | Valor |
| --- | --- |
| Root Directory | `servidor` |
| Build Command | `npm ci` |
| Start Command | `npm start` |
| Health Check Path | `/api/health` (no consulta la base: no la despierta) |
| Node | 22 |

**Environment → "Add from .env"** con el contenido de `servidor/.env.produccion`:

| Variable | Qué va |
| --- | --- |
| `NODE_ENV` | `production` |
| `CLAVE_SESIONES` | Larga y al azar (botón "Generate") |
| `URL_FRONTEND_VERCEL` | Dirección de la tienda (`https://…vercel.app`), sin barra final. También es el único origen que acepta la API (CORS) |
| `URL_API_RENDER` | Dirección de esta API (`https://…onrender.com`), sin `/api` |
| `BD_URL_SUPABASE` | La del Session pooler (paso 1) |
| `BD_ESQUEMA` | `stilos` (no cambiarlo después) |
| `SUPERADMIN_USUARIO`, `SUPERADMIN_CONTRASENA` | Usuario y contraseña del administrador. Se crea una sola vez; su email es fijo |
| `CLOUDINARY_NOMBRE_CUENTA`, `CLOUDINARY_CLAVE_API`, `CLOUDINARY_SECRETO_API` | Cloudinary → API Keys (una clave propia de Stilos, Key y Secret de la misma fila) |
| `CLAVE_API_BREVO`, `CORREO_REMITENTE` | Opcionales: sin ellas no salen los correos de avisos |
| `GOOGLE_ID_CLIENTE` | Opcional: sin él no hay botón de Google |

Al desplegar, el log tiene que mostrar el schema `stilos`, "Super admin listo" y el origen permitido.
Para revisar el administrador sin mostrar la contraseña: `npm run admin:verificar` en la Shell de Render.

## 3. Vercel (tienda)

| Opción | Valor |
| --- | --- |
| Root Directory | `frontend` |
| Include files outside the Root Directory | **Activada** (la web usa `../proyecto/` y `../core/`) |
| Framework | Vite (los comandos vienen de `frontend/vercel.json`) |
| Node | 22 |

**Settings → Environment Variables → "Import .env"** con `frontend/.env.produccion`:

| Variable | Qué va |
| --- | --- |
| `VITE_API_URL` | `URL_API_RENDER` + `/api` |
| `VITE_GOOGLE_ID_CLIENTE` | El mismo valor que `GOOGLE_ID_CLIENTE` (o vacío) |

Después: **Redeploy** (Vite toma las variables al compilar). La vista previa al compartir una prenda
(`frontend/middleware.js`) funciona solo con Root Directory = `frontend`.

## 4. Al final

- Completá las URLs reales también en `proyecto/deployment_config.js` (`backendUrl`, `frontendUrl`).
- Probá: abrir la tienda, ingresar con el super admin, cargar una prenda con foto.
- Nombres o faltantes de variables, sin mostrar valores: `npm --prefix servidor run env:verificar`.

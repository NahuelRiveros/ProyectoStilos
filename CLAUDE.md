# Stilos

Tienda de ropa: el negocio sube sus prendas (fotos por color, talles, un precio) y el visitante arma un
pedido y lo envía por WhatsApp. Sin pagos online ni cuentas de cliente. Hecho sobre **CoreSistem**
(ingreso, personal, roles y permisos, banners, RLS); el negocio vive en el rubro `tienda_ropa`.

## Dónde está cada cosa

| Qué | Dónde |
| --- | --- |
| Core (no se toca acá: se mejora en DistribuCG y se trae) | `core/`, `frontend/src/core/`, `servidor/src/core/` |
| Datos del cliente: marca, paleta, WhatsApp, textos | `proyecto/`, `frontend/src/proyecto/` |
| Rubro: servidor | `servidor/src/modulos/tienda_ropa/` (reglas.js → routes → controllers → services → models) |
| Rubro: web | `frontend/src/modules/tienda_ropa/` (tienda/, pedido/, admin/, hooks/, api/) |
| Specs | `docs/specs/tienda_ropa/catalogo.md` (reglas ROP-xx) y `docs/specs/core/` |

## Reglas

- JavaScript ESM, nunca TypeScript. Archivos `snake_case`, componentes `PascalCase`, dominio en español.
- Patrón del core: router con `requirePermiso` + `validar` (Zod, mensajes en español); controller
  delgado sin try/catch; service lanza `ErrorApp`. Esquemas y reglas puras en `tienda_ropa/reglas.js`.
- El navegador nunca manda precios: el pedido se calcula con los de la base (ROP-14).
- Al editar una prenda, las variantes que siguen conservan su id (el pedido guardado en el
  navegador las usa).
- Estética de la marca: Cormorant Garamond (títulos, clase `kt-display`) y DM Sans; paleta navy,
  crema y siena en `frontend/src/proyecto/config/theme_config.js`. Botones de compra con
  `--kt-accent-comercial` (siena oscura: contraste correcto con texto blanco).
- No inventar datos del negocio: lo que falta queda `[COMPLETAR]` (razón social, dirección, Instagram, URLs).

## Verificar

- `node scripts/verificar.mjs` → tests del servidor, lint y build.
- `npm --prefix servidor run test:integration` → contra el PostgreSQL local, en un schema temporal que se borra.
- No leer `.env*`. No commitear ni pushear sin confirmación.

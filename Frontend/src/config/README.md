# Configuracion base

Esta carpeta concentra los cambios habituales para reutilizar la tienda con otros clientes.

## Archivos

- `brand_config.js`: nombre, logo, textos de marca, footer y redes sociales.
- `store_config.js`: modo de tienda, precios, stock, WhatsApp y lista de deseos.
- `cart_config.js`: habilita/deshabilita carrito, checkout, pagos y boton CTA en producto.
- `catalog_config.js`: labels y rutas publicas del catalogo.
- `admin_config.js`: habilita/deshabilita el admin y sus modulos internos.
- `business_config.js`: datos legales, contacto y politicas del negocio.
- `whatsapp_config.js`: telefono, mensaje de consulta y helpers de apertura.
- `auth_config.js`: storage, endpoints y labels del formulario de login.
- `app_config.js`: barrel — re-exporta todo lo anterior desde un unico punto.

## Leyenda de prefijos

Cada variable lleva un prefijo entre corchetes que indica en que parte de la UI se usa:

| Prefijo             | Area                                                       |
|---------------------|------------------------------------------------------------|
| `[NAVBAR]`          | Menu de navegacion principal (desktop y movil)             |
| `[FOOTER]`          | Pie de pagina                                              |
| `[CARRITO]`         | Icono de carrito, panel lateral y resumen de items         |
| `[CHECKOUT]`        | Flujo de pago y confirmacion de pedido                     |
| `[PRODUCTO]`        | Pagina de detalle y cards de producto                      |
| `[ADMIN]`           | Panel backoffice en general                                |
| `[ADMIN / SIDEBAR]` | Menu lateral del backoffice                                |
| `[WHATSAPP]`        | Boton flotante y mensajes generados para WhatsApp          |
| `[AUTH]`            | Login, registro y manejo de sesion                         |
| `[LOGIN PAGE]`      | Formulario visible en la pagina de inicio de sesion        |
| `[ROUTER]`          | Rutas de React Router                                      |
| `[HOME]`            | Pagina principal / landing                                 |
| `[FILTROS]`         | Filtros laterales y breadcrumbs del catalogo               |
| `[LEGAL]`           | Datos legales y de compliance                              |
| `[SEO]`             | Metadatos y titulos para buscadores                        |

## Colores y tipografias

Para cambiar colores, tipografias y botones, usar los tokens y clases semanticas de `../index.css`.

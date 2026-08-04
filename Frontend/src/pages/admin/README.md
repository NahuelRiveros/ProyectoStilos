# Panel de Administración — Stylos

Acceso: `/admin` (requiere rol `ADM` o `SADM`)  
Layout: sidebar fijo en desktop · barra horizontal scrolleable en mobile

---

## Módulos

### Dashboard `/admin`
Resumen del sistema: total de usuarios, activos e inactivos, tu nivel de acceso y estado de la suscripción. Accesos rápidos a usuarios y suscripción.

---

### Productos `/admin/productos`
Lista de productos del catálogo con búsqueda, filtros y paginación.  
Desde acá se accede al formulario de creación/edición.

### Formulario de producto `/admin/productos/nuevo` · `/admin/productos/:id`
Carga completa de un producto: nombre, descripción, precio, imágenes, categoría, marca, género, talles, colores y stock por variante. También permite marcar un producto como **Carrusel** (aparece en el slider del home si el slide no tiene imagen propia).

---

### Catálogos `/admin/catalogos`
Tablas maestras que alimentan los selectores del formulario de producto.

| Tab | Qué gestiona |
|---|---|
| **Marcas** | Nombre + logo (drag & drop o URL via Cloudinary) |
| **Categorías** | Árbol jerárquico padre → hijo con collapse/expand |
| **Colores** | Nombre + valor hex + orden visual |
| **Talles** | Chips de talle (XS, S, M, 38, 40…) |
| **Géneros** | Damas, Hombre, Unisex, etc. |
| **Envío** | Rangos de precio de envío y umbral de envío gratis |

---

### Stock `/admin/stock-alertas`
Alertas de productos con stock bajo o agotado.

---

### Home `/admin/home`
Configuración visual de la página de inicio. Botón **Guardar** único al final aplica todos los cambios.

| Tab | Qué configura |
|---|---|
| **Carrusel** | Hasta 3 slides: imagen, etiqueta, título + palabra destacada, temporada, descripción, chips, botones de destino. Incluye **vista previa en tiempo real** del slide |
| **Categorías** | Qué categorías se muestran en la sección de categorías del home |
| **Novedades** | Productos destacados en la sección de novedades |
| **Secciones** | Bloques de contenido adicionales |
| **Anuncios** | Ticker superior del sitio: ícono + texto + texto en acento. Admite emojis |
| **Beneficios** | Barra de 4 íconos de confianza: ícono + título + descripción. Admite emojis |

Cada tab tiene un toggle **Activo/Inactivo** para mostrar u ocultar la sección sin borrar el contenido.

---

### WhatsApp `/admin/whatsapp`
Configuración del botón flotante de WhatsApp: número, mensaje predeterminado y visibilidad.

---

### Medios de pago `/admin/medios-pago`
Logos y métodos de pago aceptados que se muestran en el footer y checkout.

---

### Usuarios `/admin/usuarios`
Alta, edición, asignación de roles y baja lógica de usuarios del sistema.  
Roles disponibles: `ADM` (administrador) · `SADM` (super admin, ve módulo Suscripción)

---

### Suscripción `/admin/suscripcion` _(solo SADM)_
Estado de la suscripción del sistema (Activa / Gracia / Vencida), fecha de vencimiento y días restantes. Cuando vence, las operaciones de escritura quedan bloqueadas en todo el panel.

---

## Componentes reutilizables (`components/admin/`)

| Componente | Uso |
|---|---|
| `AdminSpinner` | Spinner de carga, `fullPage` para pantalla completa |
| `AdminPageHeader` | Título + descripción de página |
| `AdminStatCard` | Tarjeta de estadística con ícono y color semántico |
| `StatusBadge` | Badge de estado de orden (colores por `ORDEN_ESTADO_COLORS`) |
| `AdminPagination` | Paginación estándar de listas |
| `AdminEmptyState` | Estado vacío cuando no hay resultados |

Importar desde `"../../../components/admin"` (barrel export).

---

## Roles y acceso

```
ADM  → acceso a todos los módulos excepto Suscripción
SADM → acceso completo incluyendo Suscripción
```

Si la suscripción está vencida, un banner de advertencia aparece en todas las páginas del panel y las operaciones de escritura (crear/editar/eliminar) quedan deshabilitadas.

import { ClipboardList, FolderTree, ListChecks, Package, Palette, Phone, Ruler, Shirt, ShoppingBag, Tag, UserCircle } from "lucide-react";

// Lo que el core (menús, footer, panel, login) necesita saber de este rubro. Solo datos, sin
// pantallas: también lo leen los tests de Node (ver modulo_pantallas.jsx).
const CATALOGO = { requiereAuth: true, permisos: ["productos.editar"] };

export const moduloTiendaRopa = {
  codigo: "tienda_ropa",
  icono: Shirt,

  menu: {
    links: [
      { label: "Colección", to: "/catalogo", icon: Shirt },
      { label: "Contacto", to: "/#contacto", icon: Phone },
    ],
    cuenta: [
      { label: "Mis pedidos", to: "/mis-pedidos", requiereAuth: true, icon: Package },
      { label: "Mis datos", to: "/mi-cuenta", requiereAuth: true, icon: UserCircle },
    ],
    panel: [{
      id: "tienda",
      titulo: "Tienda",
      items: [
        { label: "Pedidos", to: "/admin/ropa/pedidos", requiereAuth: true, permisos: ["pedidos.ver"], icon: ClipboardList },
        { label: "Prendas", to: "/admin/ropa/prendas", ...CATALOGO, icon: Shirt },
        { label: "Categorías", to: "/admin/ropa/categorias", ...CATALOGO, icon: FolderTree },
        { label: "Colores", to: "/admin/ropa/colores", ...CATALOGO, icon: Palette },
        { label: "Talles", to: "/admin/ropa/talles", ...CATALOGO, icon: Ruler },
        { label: "Marcas", to: "/admin/ropa/marcas", ...CATALOGO, icon: Tag },
        { label: "Características", to: "/admin/ropa/caracteristicas", ...CATALOGO, icon: ListChecks },
      ],
    }],
  },

  // Un rubro con tienda decide el destino después del login, el llamado del home y del footer.
  tienda: {
    catalogo: "/catalogo",
    aviso: "Los pedidos se confirman por WhatsApp según disponibilidad.",
    llamado: { titulo: "¿Ya elegiste tu próxima prenda?", texto: "Armá tu pedido y envialo por WhatsApp." },
    textoLogin: "Ingresá para seguir tus pedidos y pagar por transferencia.",
    linksFooter: [
      { label: "Colección", to: "/catalogo", icon: Shirt },
      { label: "Mi pedido", to: "/pedido", icon: ShoppingBag },
    ],
  },
};

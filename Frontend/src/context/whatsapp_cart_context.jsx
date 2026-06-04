import { createContext, useContext, useState, useCallback } from "react";

const WhatsAppCartContext = createContext(null);

export function WhatsAppCartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);

  const addItem = useCallback((producto, talle = null, color = null) => {
    const key = `${producto.id}__${talle ?? ""}__${color ?? ""}`;
    setItems((prev) => {
      const existe = prev.find((i) => i.key === key);
      if (existe) {
        return prev.map((i) => i.key === key ? { ...i, cantidad: i.cantidad + 1 } : i);
      }
      return [...prev, {
        key,
        id:       producto.id,
        nombre:   producto.nombre,
        precio:   producto.precio,
        imagen:   producto.imagenes?.[0],
        categoria: producto.categoria,
        talle,
        color,
        cantidad: 1,
      }];
    });
    setPanelOpen(true);
  }, []);

  const removeItem = useCallback((key) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setPanelOpen(false);
  }, []);

  const total = items.reduce((s, i) => s + i.precio * i.cantidad, 0);

  return (
    <WhatsAppCartContext.Provider value={{
      items, total, panelOpen, setPanelOpen,
      addItem, removeItem, clearCart,
    }}>
      {children}
    </WhatsAppCartContext.Provider>
  );
}

export function useWhatsAppCart() {
  const ctx = useContext(WhatsAppCartContext);
  if (!ctx) throw new Error("useWhatsAppCart must be inside WhatsAppCartProvider");
  return ctx;
}

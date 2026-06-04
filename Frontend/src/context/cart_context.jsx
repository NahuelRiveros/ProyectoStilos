import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "../auth/auth_context";
import { syncCarrito } from "../api/carrito_api";

const CartContext = createContext(null);

const STORAGE_KEY = "angar_cart";

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function makeKey(producto_id, talle) {
  return `${producto_id}-${talle ?? "u"}`;
}

export function CartProvider({ children }) {
  const { isAuth } = useAuth();
  const [items, setItems] = useState(loadFromStorage);

  useEffect(() => {
    saveToStorage(items);
  }, [items]);

  // Sincroniza el carrito local con el servidor al autenticarse
  useEffect(() => {
    if (!isAuth || items.length === 0) return;

    const payload = items.map((i) => ({
      producto_id:  i.producto_id,
      talle_id:     null,
      cantidad:     i.cantidad,
      precio_unidad: i.precio,
    }));

    syncCarrito(payload).catch(() => {});
  }, [isAuth]); // solo al cambiar de no-auth a auth

  const addItem = useCallback(({ producto_id, nombre, categoria, precio, imagen, talle, cantidad = 1 }) => {
    const key = makeKey(producto_id, talle);
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, cantidad: i.cantidad + cantidad } : i
        );
      }
      return [...prev, { key, producto_id, nombre, categoria, precio, imagen, talle, cantidad }];
    });
  }, []);

  const removeItem = useCallback((key) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const setCantidad = useCallback((key, cantidad) => {
    if (cantidad <= 0) {
      removeItem(key);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, cantidad } : i))
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, setCantidad, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}

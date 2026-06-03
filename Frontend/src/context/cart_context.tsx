import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";

import {
  syncCarrito,
  getCarrito,
  type CarritoItem,
  type SyncItem,
} from "../api/carrito_api";
import { useAuth } from "../auth/auth_context";

export type { CarritoItem };

interface CartContextValue {
  items:         CarritoItem[];
  total:         number;
  cantidadItems: number;
  addItem:       (data: Omit<CarritoItem, "key" | "item_id">) => void;
  removeItem:    (key: string) => void;
  setCantidad:   (key: string, cantidad: number) => void;
  clearCart:     () => void;
  isInCart:      (key: string) => boolean;
  setItems:      (items: CarritoItem[]) => void;
}

const STORAGE_KEY = "stilos_cart_v1";

function loadItems(): CarritoItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CarritoItem[]) : [];
  } catch {
    return [];
  }
}

function saveItems(items: CarritoItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuth } = useAuth();
  const [items, setItems] = useState<CarritoItem[]>(loadItems);

  useEffect(() => {
    saveItems(items);
  }, [items]);

  // Al loguear: sube el carrito local al servidor y reemplaza con el estado fusionado
  useEffect(() => {
    if (!isAuth) return;

    const localItems = loadItems();

    if (localItems.length > 0) {
      const payload: SyncItem[] = localItems.map((i) => ({
        producto_id:  i.producto_id,
        talle_id:     i.talle_id ?? null,
        cantidad:     i.cantidad,
        precio_unidad: i.precio,
      }));
      syncCarrito(payload)
        .then((serverItems) => setItems(serverItems))
        .catch(() => {});
    } else {
      // carrito local vacío → cargar desde servidor por si hay items previos
      getCarrito()
        .then((serverItems) => { if (serverItems.length > 0) setItems(serverItems); })
        .catch(() => {});
    }
  }, [isAuth]); // eslint-disable-line react-hooks/exhaustive-deps

  const addItem = useCallback((data: Omit<CarritoItem, "key" | "item_id">) => {
    const key = `${data.producto_id}-${data.talle ?? "u"}`;
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, cantidad: i.cantidad + data.cantidad } : i,
        );
      }
      return [...prev, { ...data, key }];
    });
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const setCantidad = useCallback((key: string, cantidad: number) => {
    if (cantidad <= 0) {
      setItems((prev) => prev.filter((i) => i.key !== key));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, cantidad } : i)),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const isInCart = useCallback(
    (key: string) => items.some((i) => i.key === key),
    [items],
  );

  const total         = useMemo(() => items.reduce((s, i) => s + i.precio * i.cantidad, 0), [items]);
  const cantidadItems = useMemo(() => items.reduce((s, i) => s + i.cantidad, 0), [items]);

  const value = useMemo<CartContextValue>(
    () => ({ items, total, cantidadItems, addItem, removeItem, setCantidad, clearCart, isInCart, setItems }),
    [items, total, cantidadItems, addItem, removeItem, setCantidad, clearCart, isInCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}

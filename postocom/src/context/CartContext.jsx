import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const MAX_QUANTITY = 10;

export function CartProvider({ children }) {
  const { isLoggedIn } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  // False until the first load of the cart finishes, so pages do not treat it as empty too early
  const [ready, setReady] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isLoggedIn) {
      setItems([]);
      setReady(true);
      return;
    }
    setLoading(true);
    try {
      const response = await api.get("/cartdata");
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching cart", error);
    } finally {
      setLoading(false);
      setReady(true);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    setReady(false);
    refreshCart();
  }, [refreshCart]);

  const addItem = async (pid, count, size = "") => {
    await api.post("/addtocart", { pid, count, size });
    await refreshCart();
  };

  const updateQuantity = async (cartId, quantity) => {
    const response = await api.patch(`/cart/${cartId}`, { quantity });
    setItems((current) =>
      current.map((item) =>
        item.id === cartId ? { ...item, quantity: response.data.quantity } : item
      )
    );
  };

  const removeItem = async (cartId) => {
    await api.delete(`/cart/${cartId}`);
    setItems((current) => current.filter((item) => item.id !== cartId));
  };

  const placeOrder = async (shipping) => {
    const response = await api.post("/orders", shipping);
    setItems([]);
    return response.data;
  };

  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.sellprice * item.quantity, 0);

  const value = {
    items,
    loading,
    ready,
    count,
    total,
    refreshCart,
    addItem,
    updateQuantity,
    removeItem,
    placeOrder,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);

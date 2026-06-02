import React, { createContext, useContext, useState, useEffect } from "react";
import { OrderItem, DeliveryZone, Order } from "../types";

interface CartContextType {
  cart: OrderItem[];
  addToCart: (item: Omit<OrderItem, "id" | "orderId">) => void;
  removeFromCart: (variantId: string) => void;
  updateQty: (variantId: string, qty: number) => void;
  clearCart: () => void;
  subtotal: number;
  deliveryZone: DeliveryZone | null;
  setDeliveryZone: (zone: DeliveryZone | null) => void;
  deliveryFee: number;
  promoCode: string;
  promoDiscountPercent: number;
  promoError: string;
  promoSuccess: string;
  applyPromo: (code: string) => Promise<boolean>;
  removePromo: () => void;
  total: number;
  isNairobiEligible: boolean;
  freeShippingProgress: number; // Percentage toward KES 2500 free shipping
  currentOrderId: string | null;
  setCurrentOrderId: (id: string | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [deliveryZone, setDeliveryZoneState] = useState<DeliveryZone | null>(null);
  const [promoCode, setPromoCode] = useState<string>("");
  const [promoDiscountPercent, setPromoDiscountPercent] = useState<number>(0);
  const [promoError, setPromoError] = useState<string>("");
  const [promoSuccess, setPromoSuccess] = useState<string>("");
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("mugi_coffee_cart");
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedZone = localStorage.getItem("mugi_coffee_zone");
      if (savedZone) setDeliveryZoneState(JSON.parse(savedZone));

      const savedPromo = localStorage.getItem("mugi_coffee_promo");
      if (savedPromo) {
        const { code, percent } = JSON.parse(savedPromo);
        setPromoCode(code);
        setPromoDiscountPercent(percent);
      }
    } catch (e) {
      console.error("Error reading storage:", e);
    }
  }, []);

  // Save cart to LocalStorage
  useEffect(() => {
    localStorage.setItem("mugi_coffee_cart", JSON.stringify(cart));
  }, [cart]);

  // Save zone to LocalStorage
  const setDeliveryZone = (zone: DeliveryZone | null) => {
    setDeliveryZoneState(zone);
    if (zone) {
      localStorage.setItem("mugi_coffee_zone", JSON.stringify(zone));
    } else {
      localStorage.removeItem("mugi_coffee_zone");
    }
  };

  const addToCart = (item: Omit<OrderItem, "id" | "orderId">) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.variantId === item.variantId);
      if (existing) {
        return prev.map((i) =>
          i.variantId === item.variantId ? { ...i, qty: i.qty + item.qty } : i
        );
      }
      return [
        ...prev,
        {
          ...item,
          id: `item-${Date.now()}-${item.variantId}`,
          orderId: "",
        },
      ];
    });
  };

  const removeFromCart = (variantId: string) => {
    setCart((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  const updateQty = (variantId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(variantId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.variantId === variantId ? { ...i, qty } : i))
    );
  };

  const clearCart = () => {
    setCart([]);
    setPromoCode("");
    setPromoDiscountPercent(0);
    setPromoError("");
    setPromoSuccess("");
    localStorage.removeItem("mugi_coffee_cart");
    localStorage.removeItem("mugi_coffee_promo");
  };

  const applyPromo = async (code: string): Promise<boolean> => {
    if (!code.trim()) return false;
    setPromoError("");
    setPromoSuccess("");
    try {
      const response = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      if (data.valid) {
        setPromoCode(code.toUpperCase().trim());
        setPromoDiscountPercent(data.discountPercent);
        setPromoSuccess(data.message);
        localStorage.setItem(
          "mugi_coffee_promo",
          JSON.stringify({ code: code.toUpperCase().trim(), percent: data.discountPercent })
        );
        return true;
      } else {
        setPromoError(data.message);
        return false;
      }
    } catch (err) {
      setPromoError("Promo validation service down. Please try again.");
      return false;
    }
  };

  const removePromo = () => {
    setPromoCode("");
    setPromoDiscountPercent(0);
    setPromoError("");
    setPromoSuccess("");
    localStorage.removeItem("mugi_coffee_promo");
  };

  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);

  // Delivery Free Threshold of 2,500 KES (covers Nairobi CBD and Nairobi Suburbs)
  const isNairobiEligible = deliveryZone
    ? deliveryZone.id === "zone-cbd" ||
      deliveryZone.id === "zone-suburbs-west" ||
      deliveryZone.id === "zone-suburbs-general"
    : false;

  const isPickup = deliveryZone ? deliveryZone.feeKes === 0 : false;
  const isEligibleForFreeShipping = subtotal >= 2500 && isNairobiEligible;

  const deliveryFee = deliveryZone
    ? isPickup
      ? 0
      : isEligibleForFreeShipping
      ? 0
      : deliveryZone.feeKes
    : 0;

  const discount = Math.round((subtotal * promoDiscountPercent) / 100);
  const total = subtotal - discount + deliveryFee;

  // Percentage of progress toward KES 2500 free shipping
  const freeShippingProgress = Math.min((subtotal / 2500) * 100, 100);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        subtotal,
        deliveryZone,
        setDeliveryZone,
        deliveryFee,
        promoCode,
        promoDiscountPercent,
        promoError,
        promoSuccess,
        applyPromo,
        removePromo,
        total,
        isNairobiEligible,
        freeShippingProgress,
        currentOrderId,
        setCurrentOrderId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used inside a CartProvider");
  }
  return context;
};

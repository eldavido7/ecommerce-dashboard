import { create } from "zustand"
import type { Product, Order, Discount, GiftCard } from "@/types"
import { mockProducts, mockOrders, mockDiscounts, mockGiftCards } from "@/lib/mock-data"

interface StoreState {
  // Products
  products: Product[];
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, "id" | "createdAt">) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Orders
  orders: Order[]
  updateOrderStatus: (id: string, status: string) => void
  addOrder: (order: Order) => void
  deleteOrder: (id: string) => void

  // Discounts
  discounts: Discount[]
  addDiscount: (discount: Discount) => void
  updateDiscount: (id: string, discount: Partial<Discount>) => void
  deleteDiscount: (id: string) => void

  // Gift Cards
  giftCards: GiftCard[]
  addGiftCard: (giftCard: GiftCard) => void
  updateGiftCard: (id: string, giftCard: Partial<GiftCard>) => void
  deleteGiftCard: (id: string) => void
}

export const useStore = create<StoreState>((set) => ({
  // Products
  products: [],

  fetchProducts: async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    set({ products: data });
  },

  addProduct: async (product: Omit<Product, "id" | "createdAt">) => {
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });

      if (!res.ok) throw new Error("Failed to add product");

      // Refetch all products after successful add
      const updatedRes = await fetch("/api/products");
      const updatedProducts = await updatedRes.json();
      set({ products: updatedProducts });
    } catch (error) {
      console.error("[ADD_PRODUCT_STORE]", error);
    }
  },

  updateProduct: async (id, updatedProduct) => {
    await fetch(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(updatedProduct),
      headers: { "Content-Type": "application/json" },
    });
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...updatedProduct } : p
      ),
    }));
  },

  deleteProduct: async (id) => {
    await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    }));
  },

  // Orders
  orders: mockOrders,
  updateOrderStatus: (id, status) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === id ? { ...order, status: status as Order["status"] } : order
      ),
    })),
  addOrder: (order) =>
    set((state) => ({
      orders: [order, ...state.orders],
    })),
  deleteOrder: (id) =>
    set((state) => ({
      orders: state.orders.filter((order) => order.id !== id),
    })),

  // Discounts
  discounts: mockDiscounts,
  addDiscount: (discount) =>
    set((state) => ({
      discounts: [...state.discounts, discount],
    })),
  updateDiscount: (id, updatedDiscount) =>
    set((state) => ({
      discounts: state.discounts.map((discount) =>
        discount.id === id ? { ...discount, ...updatedDiscount } : discount,
      ),
    })),
  deleteDiscount: (id) =>
    set((state) => ({
      discounts: state.discounts.filter((discount) => discount.id !== id),
    })),

  // Gift Cards
  giftCards: mockGiftCards,
  addGiftCard: (giftCard) =>
    set((state) => ({
      giftCards: [...state.giftCards, giftCard],
    })),
  updateGiftCard: (id, updatedGiftCard) =>
    set((state) => ({
      giftCards: state.giftCards.map((giftCard) =>
        giftCard.id === id ? { ...giftCard, ...updatedGiftCard } : giftCard,
      ),
    })),
  deleteGiftCard: (id) =>
    set((state) => ({
      giftCards: state.giftCards.filter((giftCard) => giftCard.id !== id),
    })),
}))

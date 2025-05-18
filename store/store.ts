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
  orders: Order[];
  fetchOrders: () => Promise<void>;
  addOrder: (order: Omit<Order, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
  deleteOrder: (id: string) => Promise<void>;

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
  orders: [],

  fetchOrders: async () => {
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      const rawOrders = await res.json();

      const ordersWithItems = await Promise.all(
        rawOrders.map(async (order: any) => {
          const itemsRes = await fetch(`/api/orders/${order.id}`);
          const orderItems = itemsRes.ok ? await itemsRes.json() : [];

          return {
            id: order.id,
            createdAt: order.createdAt,
            status: order.status,
            customerDetails: {
              firstName: order.firstName,
              lastName: order.lastName,
              email: order.email,
              phone: order.phone,
            },
            address: {
              city: order.city,
              state: order.state,
              postalCode: order.postalCode,
              country: order.country,
            },
            items: orderItems.items ?? [], // ✅ get only the nested items array
          };
        })
      );

      set({ orders: ordersWithItems });
    } catch (error) {
      console.error("[FETCH_ORDERS]", error);
    }
  },

  addOrder: async (order) => {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });

    if (!res.ok) throw new Error("Failed to create order");
    const newOrder = await res.json();
    set((state) => ({ orders: [newOrder, ...state.orders] }));
  },

  updateOrderStatus: async (id, status) => {
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === id ? { ...o, status } : o
      ),
    }));
  },

  deleteOrder: async (id) => {
    await fetch(`/api/orders/${id}`, { method: "DELETE" });
    set((state) => ({
      orders: state.orders.filter((o) => o.id !== id),
    }));
  },

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

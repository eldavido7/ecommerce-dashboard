import { create } from "zustand"
import type { Product, Order, Discount, AnalyticsOrder, OrderWithItems } from "@/types"

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
  updateOrder: (id: string, order: Partial<Order>) => Promise<void>;

  // Discounts
  discounts: Discount[];
  fetchDiscounts: () => Promise<void>;
  addDiscount: (discount: Omit<Discount, "id" | "usageCount" | "createdAt" | "updatedAt">) => Promise<void>;
  updateDiscount: (id: string, discount: Partial<Discount>) => Promise<void>;
  deleteDiscount: (id: string) => Promise<void>;
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
              address: order.address,
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

  updateOrder: async (id, updatedOrder) => {
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updatedOrder),
      headers: { "Content-Type": "application/json" },
    });
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === id ? { ...o, ...updatedOrder } : o
      ),
    }));
  },

  // Discounts
  discounts: [],

  fetchDiscounts: async () => {
    try {
      const res = await fetch("/api/discounts");
      if (!res.ok) throw new Error("Failed to fetch discounts");
      const data = await res.json();
      set({ discounts: data });
    } catch (error) {
      console.error("[FETCH_DISCOUNTS]", error);
    }
  },

  addDiscount: async (discount) => {
    try {
      const res = await fetch("/api/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(discount),
      });
      if (!res.ok) throw new Error("Failed to create discount");
      const newDiscount = await res.json();
      set((state) => ({
        discounts: [newDiscount, ...state.discounts],
      }));
    } catch (error) {
      console.error("[ADD_DISCOUNT]", error);
    }
  },

  updateDiscount: async (id, updatedDiscount) => {
    try {
      const res = await fetch(`/api/discounts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedDiscount),
      });
      if (!res.ok) throw new Error("Failed to update discount");
      const updated = await res.json();

      set((state) => ({
        discounts: state.discounts.map((discount) =>
          discount.id === id ? updated : discount,
        ),
      }));
    } catch (error) {
      console.error("[UPDATE_DISCOUNT]", error);
    }
  },

  deleteDiscount: async (id) => {
    try {
      await fetch(`/api/discounts/${id}`, { method: "DELETE" });
      set((state) => ({
        discounts: state.discounts.filter((d) => d.id !== id),
      }));
    } catch (error) {
      console.error("[DELETE_DISCOUNT]", error);
    }
  },
}))

export function getTopProducts(orders: OrderWithItems[]) {
  const productStats: Record<
    string,
    { title: string; totalSold: number; totalRevenue: number }
  > = {};

  orders.forEach((order) => {
    if (order.status !== "DELIVERED") return;

    order.items.forEach((item) => {
      const id = item.product.id;
      if (!productStats[id]) {
        productStats[id] = {
          title: item.product.title,
          totalSold: 0,
          totalRevenue: 0,
        };
      }

      productStats[id].totalSold += item.quantity;
      productStats[id].totalRevenue += item.subtotal;
    });
  });

  const products = Object.values(productStats);

  const topByRevenue = [...products].sort(
    (a, b) => b.totalRevenue - a.totalRevenue
  );
  const topByQuantity = [...products].sort(
    (a, b) => b.totalSold - a.totalSold
  );

  return {
    topByRevenue,
    topByQuantity,
  };
};

export function getSalesData(orders: AnalyticsOrder[]) {
  const revenueByMonth: Record<string, number> = {};
  const orderCountByMonth: Record<string, number> = {};

  orders.forEach((order) => {
    const date = new Date(order.createdAt);
    const month = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    if (!orderCountByMonth[month]) {
      orderCountByMonth[month] = 0;
    }
    orderCountByMonth[month] += 1;

    if (order.status === "DELIVERED") {
      if (!revenueByMonth[month]) {
        revenueByMonth[month] = 0;
      }
      const orderRevenue = order.items.reduce(
        (sum, item) => sum + item.subtotal,
        0
      );
      revenueByMonth[month] += orderRevenue;
    }
  });

  const months = Object.keys(orderCountByMonth).sort();
  return months.map((month) => ({
    month,
    revenue: revenueByMonth[month] || 0,
    orderCount: orderCountByMonth[month],
  }));
};
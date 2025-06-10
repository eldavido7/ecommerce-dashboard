import { create } from "zustand"
import { persist } from "zustand/middleware";
import type { Product, Order, Discount, AnalyticsOrder, OrderWithItems, User, ShippingOption } from "@/types"

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
  addOrder: (order: Omit<Order, "id" | "createdAt" | "updatedAt" | "subtotal" | "total"> & { items: { productId: string; quantity: number }[] }) => Promise<void>;
  updateOrder: (id: string, order: Partial<Order>) => Promise<void>;

  // Discounts
  discounts: Discount[];
  fetchDiscounts: () => Promise<void>;
  addDiscount: (discount: Omit<Discount, "id" | "usageCount" | "createdAt" | "updatedAt">) => Promise<void>;
  updateDiscount: (id: string, discount: Partial<Discount>) => Promise<void>;
  deleteDiscount: (id: string) => Promise<void>;
}

// Users
interface AuthStore {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export const useStore = create<StoreState>((set, get) => ({
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
      const orders: Order[] = await res.json();
      set({ orders });
    } catch (error) {
      console.error("[FETCH_ORDERS]", error);
    }
  },

  addOrder: async (order) => {
    try {
      const { products, discounts } = get(); // Access products and discounts from the state

      // Calculate subtotal from items
      const itemsWithSubtotal = order.items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) throw new Error(`Product ${item.productId} not found in state`);
        return {
          productId: item.productId,
          product,
          quantity: item.quantity,
          subtotal: product.price * item.quantity,
        };
      });

      const subtotal = itemsWithSubtotal.reduce((sum, item) => sum + item.subtotal, 0);
      let total = subtotal;
      let discount: Discount | null = null;

      // Validate and apply discount
      if (order.discountId) {
        discount = discounts.find((d) => d.id === order.discountId) || null;
        if (!discount) throw new Error("Invalid discount");

        // Check discount constraints
        if (
          !discount.isActive ||
          (discount.usageLimit && discount.usageCount >= discount.usageLimit) ||
          (discount.startsAt && new Date(discount.startsAt) > new Date()) || // Fix comparison
          (discount.endsAt && new Date(discount.endsAt) < new Date()) || // Fix comparison
          (discount.minSubtotal && subtotal < discount.minSubtotal) ||
          (discount.products?.length && !itemsWithSubtotal.some((item) =>
            discount.products.some((p) => p.id === item.productId)
          ))
        ) {
          throw new Error("Discount is not applicable");
        }

        // Apply discount
        if (discount.type === "percentage") {
          total = subtotal * (1 - discount.value / 100);
        } else if (discount.type === "fixed_amount") {
          total = Math.max(0, subtotal - discount.value);
        } else if (discount.type === "free_shipping") {
          total = subtotal;
        }
      }

      const newOrder = {
        ...order,
        items: itemsWithSubtotal,
        subtotal,
        total,
        discount,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      });

      if (!res.ok) throw new Error("Failed to create order");
      const createdOrder = await res.json();
      set((state) => ({ orders: [createdOrder, ...state.orders] }));
    } catch (error) {
      console.error("[ADD_ORDER]", error);
      throw error;
    }
  },

  updateOrder: async (id, updatedOrder) => {
    try {
      const { products, discounts } = get(); // Access products and discounts from the state

      let subtotal = updatedOrder.subtotal;
      let total = updatedOrder.total;
      let discount: Discount | null = updatedOrder.discount || null;

      // Recalculate subtotal if items change
      if (updatedOrder.items) {
        const itemsWithSubtotal = updatedOrder.items.map((item) => {
          const product = products.find((p) => p.id === item.productId);
          if (!product) throw new Error(`Product ${item.productId} not found in state`);
          return {
            ...item,
            product,
            subtotal: product.price * item.quantity,
          };
        });
        subtotal = itemsWithSubtotal.reduce((sum, item) => sum + item.subtotal, 0);
        total = subtotal;
        updatedOrder.items = itemsWithSubtotal;
      }

      // Validate and apply discount if discountId changes
      if (updatedOrder.discountId) {
        discount = discounts.find((d) => d.id === updatedOrder.discountId) ?? null;
        if (!discount) throw new Error("Invalid discount");

        if (
          !discount.isActive ||
          (discount.usageLimit && discount.usageCount >= discount.usageLimit) ||
          (discount.startsAt && new Date() < new Date(discount.startsAt)) ||
          (discount.endsAt && new Date() > new Date(discount.endsAt)) ||
          (discount.minSubtotal && subtotal! < discount.minSubtotal) ||
          (discount.products?.length && !updatedOrder.items?.some((item) =>
            discount?.products?.some((p) => p.id === item.productId)
          ))
        ) {
          throw new Error("Discount is not applicable");
        }

        if (discount.type === "percentage") {
          total = subtotal! * (1 - discount.value / 100);
        } else if (discount.type === "fixed_amount") {
          total = Math.max(0, subtotal! - discount.value);
        } else if (discount.type === "free_shipping") {
          total = subtotal!;
        }
      } else if (updatedOrder.discountId === null) {
        total = subtotal!;
        discount = null;
      }

      const updated = {
        ...updatedOrder,
        subtotal,
        total,
        discount,
      };

      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      if (!res.ok) throw new Error("Failed to update order");
      const updatedOrderResponse = await res.json();
      set((state) => ({
        orders: state.orders.map((o) =>
          o.id === id ? { ...o, ...updatedOrderResponse } : o
        ),
      }));
    } catch (error) {
      console.error("[UPDATE_ORDER]", error);
      throw error;
    }
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
      productStats[id].totalRevenue +=
        (item.quantity / order.items.reduce((sum, i) => sum + i.quantity, 0)) *
        order.total; // Proportionally distribute the order's total
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
}

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
      revenueByMonth[month] += order.total; // Use total instead of subtotal
    }
  });

  const months = Object.keys(orderCountByMonth).sort();
  return months.map((month) => ({
    month,
    revenue: revenueByMonth[month] || 0,
    orderCount: orderCountByMonth[month],
  }));
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });

        try {
          const res = await fetch("/api/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          const data = await res.json();

          if (res.ok && data.success) {
            set({ user: data.user });
            const { updateUserActivity } = useSettingsStore.getState();
            await updateUserActivity(data.user.id); // Update lastActive on login
            return true;
          }

          return false;
        } catch (err) {
          console.error("Login error:", err);
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        set({ user: null });
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth");
        }
        window.location.href = "/login"; // force redirect
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: "auth", // localStorage key
      partialize: (state) => ({ user: state.user }), // only persist user
    }
  )
);

interface SettingsState {
  users: User[];
  shippingOptions: ShippingOption[];
  fetchSettings: () => Promise<void>;
  createUser: (user: Partial<User>) => Promise<void>;
  updateUser: (user: Partial<User> & { id: string }) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  createShipping: (option: Partial<ShippingOption>) => Promise<void>;
  updateShipping: (option: Partial<ShippingOption> & { id: string }) => Promise<void>;
  deleteShipping: (id: string) => Promise<void>;
  updateUserActivity: (userId: string) => Promise<void>; // New function
}

export const useSettingsStore = create<SettingsState>((set) => ({
  users: [],
  shippingOptions: [],

  fetchSettings: async () => {
    const [usersRes, shippingRes] = await Promise.all([
      fetch("/api/settings/users"),
      fetch("/api/settings/shipping-options"),
    ]);

    const [users, shippingOptions] = await Promise.all([
      usersRes.json(),
      shippingRes.json(),
    ]);

    set({ users, shippingOptions });
  },

  createUser: async (user) => {
    const payload = { name: user.name, email: user.email, password: user.password };
    const res = await fetch("/api/settings/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(`Failed to create user: ${res.status} ${res.statusText} - ${JSON.stringify(errorData)}`);
    }
    const newUser = await res.json();
    set((state) => ({ users: [...state.users, newUser] }));
  },

  updateUser: async (user) => {
    await fetch(`/api/settings/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });
    set((state) => ({
      users: state.users.map((u) => (u.id === user.id ? { ...u, ...user } : u)),
    }));
  },

  updateUserActivity: async (userId) => {
    const res = await fetch("/api/settings/users/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(`Failed to update activity: ${res.status} ${res.statusText} - ${JSON.stringify(errorData)}`);
    }
    const updatedUser = await res.json();
    set((state) => ({
      users: state.users.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
    }));
  },

  deleteUser: async (id) => {
    await fetch(`/api/settings/users/${id}`, { method: "DELETE" });
    set((state) => ({
      users: state.users.filter((u) => u.id !== id),
    }));
  },

  createShipping: async (option) => {
    const res = await fetch("/api/settings/shipping-options", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(option),
    });
    if (!res.ok) {
      throw new Error(`Failed to create shipping option: ${res.status} ${res.statusText}`);
    }
    const newOption = await res.json();
    set((state) => ({
      shippingOptions: [...state.shippingOptions, newOption],
    }));
  },

  updateShipping: async (option) => {
    await fetch(`/api/settings/shipping-options/${option.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(option),
    });
    set((state) => ({
      shippingOptions: state.shippingOptions.map((s) =>
        s.id === option.id ? { ...s, ...option } : s
      ),
    }));
  },

  deleteShipping: async (id) => {
    await fetch(`/api/settings/shipping-options/${id}`, { method: "DELETE" });
    set((state) => ({
      shippingOptions: state.shippingOptions.filter((s) => s.id !== id),
    }));
  },
}));

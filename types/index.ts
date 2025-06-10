// Product Types
export interface Product {
  id: string
  title: string
  description: string
  price: number
  inventory: number
  category: string
  tags: string[]
  barcode: String
  createdAt: Date
  updatedAt: Date
}

// Order Types
// export interface Address {
//   address: string;
//   city: string;
//   state: string;
//   postalCode: string;
//   country: string;
// }

// export interface CustomerDetails {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
// }

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  subtotal: number; // product.price * quantity
  total: number;
  orderId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  items: OrderItem[];
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  subtotal: number; // Sum of OrderItem.subtotal
  total: number; // Final total after discount
  discountId?: string | null;
  discount?: Discount | null;
  createdAt: Date;
  updatedAt: Date;
}

// Discount Types
export interface Discount {
  id: string
  code: string
  description?: string | null;
  type: "percentage" | "fixed_amount" | "free_shipping"
  value: number
  usageLimit?: number | null
  usageCount: number
  startsAt: Date
  endsAt?: Date | null
  minSubtotal?: number | null
  products?: Product[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Analytics Types
export interface SalesData {
  date: string
  revenue: number
  orders: number
}

export interface ProductPerformance {
  id: string
  title: string
  sales: number
  revenue: number
}

export type AnalyticsOrder = {
  createdAt: string;
  status: string;
  items: { subtotal: number }[];
  total: number;
};

export type ProductItem = {
  product: {
    id: string;
    title: string;
  };
  quantity: number;
  total: number;
};

export type OrderWithItems = {
  status: string;
  items: ProductItem[];
  total: number;
};

//User Types
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Optional since it may not be returned in GET responses
  lastActive: string;
}

export interface ShippingOption {
  id: string;
  name: string;
  price: number;
  deliveryTime: string;
  status: "ACTIVE" | "CONDITIONAL";
}
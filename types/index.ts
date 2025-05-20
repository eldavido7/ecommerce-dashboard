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
export interface Address {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CustomerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface OrderItem {
  product: any
  id: string;
  productId: string;
  quantity: number;
  subtotal: number;
  orderId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  customerDetails: CustomerDetails;
  items: OrderItem[];
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELED";
  total: number;
  createdAt: Date;
  updatedAt: Date;
  address: Address;
}

// Discount Types
export interface Discount {
  id: string
  code: string
  description?: string
  type: "percentage" | "fixed_amount" | "free_shipping"
  value: number
  usageLimit?: number
  usageCount: number
  startsAt: Date
  endsAt?: Date
  isActive: boolean
  conditions?: {
    minSubtotal?: number
    products?: string[]
  }
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
};

export type ProductItem = {
  product: {
    id: string;
    title: string;
  };
  quantity: number;
  subtotal: number;
};

export type OrderWithItems = {
  status: string;
  items: ProductItem[];
};

//User Types
interface User {
  id: string;
  name: string;
  email: string;
  lastActive: string;
}
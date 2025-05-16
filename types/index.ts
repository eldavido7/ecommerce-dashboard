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
export interface Order {
  id: string
  customerDetails: CustomerDetails
  items: OrderItem[]
  status: "pending" | "processing" | "shipped" | "delivered" | "canceled"
  paymentStatus: "awaiting" | "captured" | "refunded" | "canceled"
  fulfillmentStatus: "not_fulfilled" | "fulfilled" | "shipped" | "canceled"
  total: number
  subtotal: number
  shippingTotal: number
  discountTotal: number
  taxTotal: number
  shippingAddress: Address
  billingAddress: Address
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  title: string
  quantity: number
  unitPrice: number
  thumbnail: string
  variant: {
    id: string
    title: string
  }
}

// Customer Details (embedded in Order)
export interface CustomerDetails {
  email: string
  firstName: string
  lastName: string
  phone: string
}

export interface Address {
  firstName: string
  lastName: string
  address1: string
  address2?: string
  city: string
  province: string
  postalCode: string
  country: string
  phone?: string
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
    collections?: string[]
  }
  createdAt: Date
  updatedAt: Date
}

// Gift Card Types
export interface GiftCard {
  id: string
  code: string
  value: number
  balance: number
  isDisabled: boolean
  expiresAt?: Date
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

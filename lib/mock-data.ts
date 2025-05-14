import type {
  Product,
  Order,
  Discount,
  GiftCard,
  SalesData,
  ProductPerformance,
  CustomerDetails,
  Address,
} from "@/types"

// Helper to generate random dates within a range
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Helper to generate random IDs
const generateId = () => Math.random().toString(36).substring(2, 10)

// Update the mockProducts array with herbal medicine items
export const mockProducts: Product[] = [
  {
    id: "prod_01",
    title: "Immune Boost Herbal Tincture",
    description: "Natural herbal tincture to support immune system function",
    thumbnail: "/plain-white-tshirt.png",
    price: 12999.99,
    inventory: 120,
    category: "Tinctures",
    tags: ["immune", "tincture", "natural"],
    variants: [
      {
        id: "var_01",
        title: "30ml",
        sku: "IMM-TNCT-30",
        price: 10999.99,
        inventory: 45,
        options: [{ name: "Size", value: "30ml" }],
      },
      {
        id: "var_02",
        title: "60ml",
        sku: "IMM-TNCT-60",
        price: 9999.99,
        inventory: 75,
        options: [{ name: "Size", value: "60ml" }],
      },
    ],
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
    updatedAt: randomDate(new Date(2023, 0, 1), new Date()),
  },
  {
    id: "prod_02",
    title: "Digestive Health Capsules",
    description: "Herbal capsules to support digestive health and gut function",
    thumbnail: "/diverse-people-listening-headphones.png",
    price: 12999.99,
    inventory: 78,
    category: "Capsules",
    tags: ["digestive", "capsules", "gut-health"],
    variants: [
      {
        id: "var_03",
        title: "60 Capsules",
        sku: "DIG-CAP-60",
        price: 5999.99,
        inventory: 40,
        options: [{ name: "Count", value: "60 Capsules" }],
      },
      {
        id: "var_04",
        title: "120 Capsules",
        sku: "DIG-CAP-120",
        price: 5999.99,
        inventory: 38,
        options: [{ name: "Count", value: "120 Capsules" }],
      },
    ],
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
    updatedAt: randomDate(new Date(2023, 0, 1), new Date()),
  },
  {
    id: "prod_03",
    title: "Sleep Support Herbal Tea",
    description: "Calming herbal tea blend to promote restful sleep",
    thumbnail: "/modern-smartwatch.png",
    price: 4999.99,
    inventory: 32,
    category: "Teas",
    tags: ["sleep", "tea", "relaxation"],
    variants: [
      {
        id: "var_05",
        title: "Loose Leaf - 50g",
        sku: "SLP-TEA-50",
        price: 4999.99,
        inventory: 15,
        options: [
          { name: "Type", value: "Loose Leaf" },
          { name: "Size", value: "50g" },
        ],
      },
      {
        id: "var_06",
        title: "Tea Bags - 20 Count",
        sku: "SLP-TEA-20",
        price: 4999.99,
        inventory: 17,
        options: [
          { name: "Type", value: "Tea Bags" },
          { name: "Count", value: "20" },
        ],
      },
    ],
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
    updatedAt: randomDate(new Date(2023, 0, 1), new Date()),
  },
  {
    id: "prod_04",
    title: "Joint Support Salve",
    description: "Topical herbal salve for joint and muscle comfort",
    thumbnail: "/plain-white-tshirt.png",
    price: 8999.99,
    inventory: 45,
    category: "Topicals",
    tags: ["joint", "salve", "topical"],
    variants: [
      {
        id: "var_07",
        title: "Regular - 2oz",
        sku: "JNT-SLV-2",
        price: 8999.99,
        inventory: 20,
        options: [
          { name: "Strength", value: "Regular" },
          { name: "Size", value: "2oz" },
        ],
      },
      {
        id: "var_08",
        title: "Extra Strength - 2oz",
        sku: "JNT-SLV-2X",
        price: 8999.99,
        inventory: 25,
        options: [
          { name: "Strength", value: "Extra Strength" },
          { name: "Size", value: "2oz" },
        ],
      },
    ],
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
    updatedAt: randomDate(new Date(2023, 0, 1), new Date()),
  },
  {
    id: "prod_05",
    title: "Stress Relief Herbal Extract",
    description: "Concentrated herbal extract to support stress management",
    thumbnail: "/simple-coffee-mug.png",
    price: 2499.99,
    inventory: 65,
    category: "Extracts",
    tags: ["stress", "extract", "anxiety"],
    variants: [
      {
        id: "var_11",
        title: "30ml Dropper",
        sku: "STR-EXT-30",
        price: 2499.99,
        inventory: 35,
        options: [{ name: "Size", value: "30ml Dropper" }],
      },
      {
        id: "var_12",
        title: "60ml Dropper",
        sku: "STR-EXT-60",
        price: 2499.99,
        inventory: 30,
        options: [{ name: "Size", value: "60ml Dropper" }],
      },
    ],
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
    updatedAt: randomDate(new Date(2023, 0, 1), new Date()),
  },
]

// Sample customer details
const sampleCustomerDetails: CustomerDetails[] = [
  {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "555-123-4567",
  },
  {
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    phone: "555-987-6543",
  },
  {
    firstName: "Robert",
    lastName: "Johnson",
    email: "robert.johnson@example.com",
    phone: "555-456-7890",
  },
  {
    firstName: "Sarah",
    lastName: "Williams",
    email: "sarah.williams@example.com",
    phone: "555-789-0123",
  },
  {
    firstName: "Michael",
    lastName: "Brown",
    email: "michael.brown@example.com",
    phone: "555-234-5678",
  },
]

// Sample addresses
const sampleAddresses: Address[] = [
  {
    firstName: "John",
    lastName: "Doe",
    address1: "123 Main St",
    city: "Anytown",
    province: "CA",
    postalCode: "12345",
    country: "USA",
    phone: "555-123-4567",
  },
  {
    firstName: "Jane",
    lastName: "Smith",
    address1: "456 Oak Ave",
    city: "Somewhere",
    province: "NY",
    postalCode: "67890",
    country: "USA",
    phone: "555-987-6543",
  },
  {
    firstName: "Robert",
    lastName: "Johnson",
    address1: "789 Pine St",
    city: "Elsewhere",
    province: "TX",
    postalCode: "54321",
    country: "USA",
    phone: "555-456-7890",
  },
  {
    firstName: "Sarah",
    lastName: "Williams",
    address1: "321 Elm St",
    city: "Nowhere",
    province: "FL",
    postalCode: "09876",
    country: "USA",
    phone: "555-789-0123",
  },
  {
    firstName: "Michael",
    lastName: "Brown",
    address1: "654 Maple Ave",
    city: "Someplace",
    province: "WA",
    postalCode: "13579",
    country: "USA",
    phone: "555-234-5678",
  },
]

// Update the mockOrders to include herbal medicine products
export const mockOrders: Order[] = [
  {
    id: "order_01",
    customerDetails: sampleCustomerDetails[0],
    items: [
      {
        id: "item_01",
        title: "Immune Boost Herbal Tincture - 30ml",
        quantity: 2,
        unitPrice: 2999.99,
        thumbnail: "/plain-white-tshirt.png",
        variant: {
          id: "var_01",
          title: "30ml",
        },
      },
    ],
    status: "delivered",
    paymentStatus: "captured",
    fulfillmentStatus: "fulfilled",
    total: 7499.98,
    subtotal: 5999.98,
    shippingTotal: 15.0,
    discountTotal: 0,
    taxTotal: 0,
    shippingAddress: sampleAddresses[0],
    billingAddress: sampleAddresses[0],
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
    updatedAt: randomDate(new Date(2023, 0, 1), new Date()),
  },
  {
    id: "order_02",
    customerDetails: sampleCustomerDetails[1],
    items: [
      {
        id: "item_02",
        title: "Digestive Health Capsules - 60 Capsules",
        quantity: 1,
        unitPrice: 5999.99,
        thumbnail: "/diverse-people-listening-headphones.png",
        variant: {
          id: "var_03",
          title: "60 Capsules",
        },
      },
      {
        id: "item_03",
        title: "Stress Relief Herbal Extract - 30ml Dropper",
        quantity: 1,
        unitPrice: 2499.99,
        thumbnail: "/simple-coffee-mug.png",
        variant: {
          id: "var_11",
          title: "30ml Dropper",
        },
      },
    ],
    status: "shipped",
    paymentStatus: "captured",
    fulfillmentStatus: "shipped",
    total: 9999.98,
    subtotal: 8499.98,
    shippingTotal: 1500.0,
    discountTotal: 0,
    taxTotal: 0,
    shippingAddress: sampleAddresses[1],
    billingAddress: sampleAddresses[1],
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
    updatedAt: randomDate(new Date(2023, 0, 1), new Date()),
  },
  {
    id: "order_03",
    customerDetails: sampleCustomerDetails[2],
    items: [
      {
        id: "item_04",
        title: "Sleep Support Herbal Tea - Loose Leaf - 50g",
        quantity: 1,
        unitPrice: 4999.99,
        thumbnail: "/modern-smartwatch.png",
        variant: {
          id: "var_05",
          title: "Loose Leaf - 50g",
        },
      },
    ],
    status: "processing",
    paymentStatus: "captured",
    fulfillmentStatus: "not_fulfilled",
    total: 6499.99,
    subtotal: 4999.99,
    shippingTotal: 1500.0,
    discountTotal: 0,
    taxTotal: 0,
    shippingAddress: sampleAddresses[2],
    billingAddress: sampleAddresses[2],
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
    updatedAt: randomDate(new Date(2023, 0, 1), new Date()),
  },
  {
    id: "order_04",
    customerDetails: sampleCustomerDetails[3],
    items: [
      {
        id: "item_05",
        title: "Joint Support Salve - Regular - 2oz",
        quantity: 1,
        unitPrice: 8999.99,
        thumbnail: "/plain-white-tshirt.png",
        variant: {
          id: "var_07",
          title: "Regular - 2oz",
        },
      },
      {
        id: "item_06",
        title: "Immune Boost Herbal Tincture - 60ml",
        quantity: 2,
        unitPrice: 2999.99,
        thumbnail: "/plain-white-tshirt.png",
        variant: {
          id: "var_02",
          title: "60ml",
        },
      },
    ],
    status: "pending",
    paymentStatus: "awaiting",
    fulfillmentStatus: "not_fulfilled",
    total: 16499.97,
    subtotal: 14999.97,
    shippingTotal: 15000.0,
    discountTotal: 0,
    taxTotal: 0,
    shippingAddress: sampleAddresses[3],
    billingAddress: sampleAddresses[3],
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
    updatedAt: randomDate(new Date(2023, 0, 1), new Date()),
  },
  {
    id: "order_05",
    customerDetails: sampleCustomerDetails[4],
    items: [
      {
        id: "item_07",
        title: "Stress Relief Herbal Extract - 60ml Dropper",
        quantity: 2,
        unitPrice: 2499.99,
        thumbnail: "/simple-coffee-mug.png",
        variant: {
          id: "var_12",
          title: "60ml Dropper",
        },
      },
    ],
    status: "canceled",
    paymentStatus: "canceled",
    fulfillmentStatus: "canceled",
    total: 6499.98,
    subtotal: 4999.98,
    shippingTotal: 1500.0,
    discountTotal: 0,
    taxTotal: 0,
    shippingAddress: sampleAddresses[4],
    billingAddress: sampleAddresses[4],
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
    updatedAt: randomDate(new Date(2023, 0, 1), new Date()),
  },
]

// Mock Discounts
export const mockDiscounts: Discount[] = [
  {
    id: "disc_01",
    code: "SUMMER20",
    description: "Summer sale 20% off",
    type: "percentage",
    value: 20,
    usageLimit: 100,
    usageCount: 45,
    startsAt: new Date(2023, 5, 1), // June 1, 2023
    endsAt: new Date(2023, 7, 31), // August 31, 2023
    isActive: true,
    conditions: {
      minSubtotal: 50,
    },
    createdAt: new Date(2023, 4, 15),
    updatedAt: new Date(2023, 4, 15),
  },
  {
    id: "disc_02",
    code: "FREESHIP",
    description: "Free shipping on all orders",
    type: "free_shipping",
    value: 0,
    usageLimit: 200,
    usageCount: 120,
    startsAt: new Date(2023, 0, 1),
    isActive: true,
    createdAt: new Date(2022, 11, 15),
    updatedAt: new Date(2022, 11, 15),
  },
  {
    id: "disc_03",
    code: "WELCOME10",
    description: "$10 off your first order",
    type: "fixed_amount",
    value: 10,
    usageLimit: 1000,
    usageCount: 358,
    startsAt: new Date(2023, 0, 1),
    isActive: true,
    conditions: {
      minSubtotal: 25,
    },
    createdAt: new Date(2022, 11, 1),
    updatedAt: new Date(2022, 11, 1),
  },
]

// Mock Gift Cards
export const mockGiftCards: GiftCard[] = [
  {
    id: "gift_01",
    code: "GIFT-1234-5678",
    value: 50,
    balance: 50,
    isDisabled: false,
    createdAt: new Date(2023, 1, 15),
    updatedAt: new Date(2023, 1, 15),
  },
  {
    id: "gift_02",
    code: "GIFT-8765-4321",
    value: 100,
    balance: 75.5,
    isDisabled: false,
    createdAt: new Date(2023, 2, 10),
    updatedAt: new Date(2023, 2, 10),
  },
  {
    id: "gift_03",
    code: "GIFT-9876-5432",
    value: 25,
    balance: 0,
    isDisabled: true,
    createdAt: new Date(2023, 0, 5),
    updatedAt: new Date(2023, 0, 5),
  },
]

// Mock Analytics Data
export const mockSalesData: SalesData[] = [
  { date: "2023-01", revenue: 12500, orders: 125 },
  { date: "2023-02", revenue: 15000, orders: 150 },
  { date: "2023-03", revenue: 18500, orders: 185 },
  { date: "2023-04", revenue: 22000, orders: 220 },
  { date: "2023-05", revenue: 20000, orders: 200 },
  { date: "2023-06", revenue: 25000, orders: 250 },
  { date: "2023-07", revenue: 30000, orders: 300 },
  { date: "2023-08", revenue: 27500, orders: 275 },
  { date: "2023-09", revenue: 32000, orders: 320 },
  { date: "2023-10", revenue: 35000, orders: 350 },
  { date: "2023-11", revenue: 40000, orders: 400 },
  { date: "2023-12", revenue: 50000, orders: 500 },
]

// Update the mockProductPerformance to match the new herbal medicine products
export const mockProductPerformance: ProductPerformance[] = [
  { id: "prod_01", title: "Immune Boost Herbal Tincture", sales: 350, revenue: 10496.5 },
  { id: "prod_02", title: "Digestive Health Capsules", sales: 200, revenue: 11998.0 },
  { id: "prod_03", title: "Sleep Support Herbal Tea", sales: 120, revenue: 5998.8 },
  { id: "prod_04", title: "Joint Support Salve", sales: 85, revenue: 7649.15 },
  { id: "prod_05", title: "Stress Relief Herbal Extract", sales: 175, revenue: 4373.25 },
]

"use client"

import { useState } from "react"
import { useStore } from "@/store/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronDown, Eye, Search, ShoppingBag, AlertCircle, Plus } from "lucide-react"
import type { Order, OrderItem, CustomerDetails, Address } from "@/types"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { Label } from "@/components/ui/label"

export default function OrdersPage() {
  const { orders, updateOrderStatus, products, updateProduct, addOrder } = useStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [statusToUpdate, setStatusToUpdate] = useState<string>("")

  // New order creation state
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false)
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })
  const [shippingAddress, setShippingAddress] = useState<Address>({
    firstName: "",
    lastName: "",
    address1: "",
    city: "",
    province: "",
    postalCode: "",
    country: "Nigeria",
  })
  const [selectedItems, setSelectedItems] = useState<
    {
      productId: string
      variantId: string
      quantity: number
    }[]
  >([])

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${order.customerDetails.firstName} ${order.customerDetails.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      order.customerDetails.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter ? order.status === statusFilter : true

    return matchesSearch && matchesStatus
  })

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsViewDialogOpen(true)
  }

  const handleUpdateStatus = (orderId: string, status: string) => {
    // If changing to shipped or delivered, confirm with the user
    if ((status === "shipped" || status === "delivered") && selectedOrder) {
      setStatusToUpdate(status)
      setConfirmDialogOpen(true)
    } else {
      processStatusUpdate(orderId, status)
    }
  }

  const processStatusUpdate = (orderId: string, status: string) => {
    // Update the order status
    updateOrderStatus(orderId, status)

    // If status is shipped or delivered, update inventory
    if ((status === "shipped" || status === "delivered") && selectedOrder) {
      // For each item in the order, reduce inventory
      selectedOrder.items.forEach((item) => {
        // Find the product
        const product = products.find((p) => p.variants.some((v) => v.id === item.variant.id))

        if (product) {
          // Find the variant
          const variantIndex = product.variants.findIndex((v) => v.id === item.variant.id)

          if (variantIndex !== -1) {
            const variant = product.variants[variantIndex]
            const newVariantInventory = Math.max(0, variant.inventory - item.quantity)

            // Update the variant inventory
            const updatedVariants = [...product.variants]
            updatedVariants[variantIndex] = {
              ...variant,
              inventory: newVariantInventory,
            }

            // Calculate new total inventory
            const newTotalInventory = updatedVariants.reduce((sum, v) => sum + v.inventory, 0)

            // Update the product
            updateProduct(product.id, {
              inventory: newTotalInventory,
              variants: updatedVariants,
            })

            // Show toast notification
            if (newVariantInventory < 10) {
              toast({
                title: "Low Stock Alert",
                description: `${product.title} - ${variant.title} is now low in stock (${newVariantInventory} remaining)`,
                action: <ToastAction altText="View Inventory">View Inventory</ToastAction>,
              })
            }
          }
        }
      })
    }

    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: status as any })
    }

    setConfirmDialogOpen(false)

    toast({
      title: "Order Updated",
      description: `Order #${orderId} status changed to ${status}`,
    })
  }

  // Add item to new order
  const addItemToOrder = () => {
    setSelectedItems([...selectedItems, { productId: "", variantId: "", quantity: 1 }])
  }

  // Remove item from new order
  const removeItemFromOrder = (index: number) => {
    const newItems = [...selectedItems]
    newItems.splice(index, 1)
    setSelectedItems(newItems)
  }

  // Update item in new order
  const updateOrderItem = (index: number, field: string, value: string | number) => {
    const newItems = [...selectedItems]
    newItems[index] = { ...newItems[index], [field]: value }

    // If product changed, reset variant
    if (field === "productId") {
      newItems[index].variantId = ""
    }

    setSelectedItems(newItems)
  }

  // Create new order
  const handleCreateOrder = () => {
    // Validate customer details
    if (!customerDetails.firstName || !customerDetails.lastName || !customerDetails.email || !customerDetails.phone) {
      toast({
        title: "Missing Customer Information",
        description: "Please fill in all customer details",
        variant: "destructive",
      })
      return
    }

    // Validate shipping address
    if (
      !shippingAddress.address1 ||
      !shippingAddress.city ||
      !shippingAddress.province ||
      !shippingAddress.postalCode
    ) {
      toast({
        title: "Missing Shipping Information",
        description: "Please fill in all shipping address details",
        variant: "destructive",
      })
      return
    }

    // Validate items
    if (selectedItems.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please add at least one product to the order",
        variant: "destructive",
      })
      return
    }

    // Create order items
    const orderItems: OrderItem[] = []
    let subtotal = 0

    for (const item of selectedItems) {
      const product = products.find((p) => p.id === item.productId)
      if (!product) continue

      const variant = product.variants.find((v) => v.id === item.variantId)
      if (!variant) continue

      const orderItem: OrderItem = {
        id: `item_${Math.random().toString(36).substring(2, 10)}`,
        title: `${product.title} - ${variant.title}`,
        quantity: item.quantity,
        unitPrice: variant.price,
        thumbnail: product.thumbnail,
        variant: {
          id: variant.id,
          title: variant.title,
        },
      }

      orderItems.push(orderItem)
      subtotal += variant.price * item.quantity
    }

    if (orderItems.length === 0) {
      toast({
        title: "Error",
        description: "Please select valid products and variants",
        variant: "destructive",
      })
      return
    }

    // Calculate totals
    const shippingTotal = 1500.0 // Default shipping
    const total = subtotal + shippingTotal

    // Create new order
    const newOrder: Order = {
      id: `order_${Math.random().toString(36).substring(2, 10)}`,
      customerDetails: customerDetails,
      items: orderItems,
      status: "pending",
      paymentStatus: "awaiting",
      fulfillmentStatus: "not_fulfilled",
      total: total,
      subtotal: subtotal,
      shippingTotal: shippingTotal,
      discountTotal: 0,
      taxTotal: 0,
      shippingAddress: {
        ...shippingAddress,
        firstName: customerDetails.firstName,
        lastName: customerDetails.lastName,
      },
      billingAddress: {
        ...shippingAddress,
        firstName: customerDetails.firstName,
        lastName: customerDetails.lastName,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Add order to store
    addOrder(newOrder)

    // Reset form
    setCustomerDetails({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    })
    setShippingAddress({
      firstName: "",
      lastName: "",
      address1: "",
      city: "",
      province: "",
      postalCode: "",
      country: "Nigeria",
    })
    setSelectedItems([])
    setIsCreateOrderOpen(false)

    toast({
      title: "Order Created",
      description: `Order #${newOrder.id} has been created successfully`,
    })
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
        <Dialog open={isCreateOrderOpen} onOpenChange={setIsCreateOrderOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
              <DialogDescription>
                Create a new order by entering customer details and selecting products
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <h3 className="text-lg font-medium">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={customerDetails.firstName}
                      onChange={(e) => setCustomerDetails({ ...customerDetails, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={customerDetails.lastName}
                      onChange={(e) => setCustomerDetails({ ...customerDetails, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerDetails.email}
                      onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={customerDetails.phone}
                      onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <h3 className="text-lg font-medium">Shipping Address</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="address1">Address</Label>
                    <Input
                      id="address1"
                      value={shippingAddress.address1}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, address1: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="province">State/Province</Label>
                      <Input
                        id="province"
                        value={shippingAddress.province}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, province: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        value={shippingAddress.postalCode}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={shippingAddress.country}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Products</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addItemToOrder}>
                    <Plus className="mr-1 h-3 w-3" /> Add Product
                  </Button>
                </div>

                {selectedItems.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No products added. Click "Add Product" to add products to this order.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedItems.map((item, index) => (
                      <div key={index} className="grid gap-4 p-4 border rounded-md">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label>Product</Label>
                            <Select
                              value={item.productId}
                              onValueChange={(value) => updateOrderItem(index, "productId", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid gap-2">
                            <Label>Variant</Label>
                            <Select
                              value={item.variantId}
                              onValueChange={(value) => updateOrderItem(index, "variantId", value)}
                              disabled={!item.productId}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select variant" />
                              </SelectTrigger>
                              <SelectContent>
                                {item.productId &&
                                  products
                                    .find((p) => p.id === item.productId)
                                    ?.variants.map((variant) => (
                                      <SelectItem key={variant.id} value={variant.id}>
                                        {variant.title} - ₦{variant.price.toFixed(2)}
                                      </SelectItem>
                                    ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex items-end gap-4">
                          <div className="grid gap-2 flex-1">
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateOrderItem(index, "quantity", Number.parseInt(e.target.value) || 1)}
                            />
                          </div>

                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => removeItemFromOrder(index)}
                          >
                            <AlertCircle className="h-4 w-4" />
                          </Button>
                        </div>

                        {item.productId && item.variantId && (
                          <div className="text-sm text-muted-foreground">
                            {(() => {
                              const product = products.find((p) => p.id === item.productId)
                              const variant = product?.variants.find((v) => v.id === item.variantId)
                              if (product && variant) {
                                const total = variant.price * item.quantity
                                return `${item.quantity} × ${variant.title} at ₦${variant.price.toFixed(2)} = ₦${total.toFixed(2)}`
                              }
                              return null
                            })()}
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="flex justify-end text-sm font-medium">
                      Total: ₦
                      {selectedItems
                        .reduce((sum, item) => {
                          const product = products.find((p) => p.id === item.productId)
                          const variant = product?.variants.find((v) => v.id === item.variantId)
                          return sum + (variant ? variant.price * item.quantity : 0)
                        }, 0)
                        .toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOrderOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateOrder}>Create Order</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search orders..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-2">
              Status
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setStatusFilter(null)}>All Statuses</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("processing")}>Processing</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("shipped")}>Shipped</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("delivered")}>Delivered</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("canceled")}>Canceled</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {order.customerDetails.firstName} {order.customerDetails.lastName}
                      </span>
                      <span className="text-muted-foreground">{order.customerDetails.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>{format(order.createdAt, "MMM dd, yyyy")}</TableCell>
                  <TableCell>₦{order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        order.status === "delivered"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          : order.status === "shipped"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                            : order.status === "processing"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                              : order.status === "pending"
                                ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleViewOrder(order)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              {selectedOrder && (
                <span>
                  Order #{selectedOrder.id} placed on {format(selectedOrder.createdAt, "MMMM dd, yyyy")}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Order Details</TabsTrigger>
                <TabsTrigger value="shipping">Shipping</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Items</h3>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value) => handleUpdateStatus(selectedOrder.id, value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Variant</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.title}</TableCell>
                          <TableCell>{item.variant.title}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">₦{item.unitPrice.toFixed(2)}</TableCell>
                          <TableCell className="text-right">₦{(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-end">
                  <Card className="w-[300px]">
                    <CardHeader>
                      <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₦{selectedOrder.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>₦{selectedOrder.shippingTotal.toFixed(2)}</span>
                      </div>
                      {selectedOrder.discountTotal > 0 && (
                        <div className="flex justify-between">
                          <span>Discount</span>
                          <span>-₦{selectedOrder.discountTotal.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold border-t pt-2">
                        <span>Total</span>
                        <span>₦{selectedOrder.total.toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium">Contact Details</h4>
                      <div className="text-sm mt-1">
                        <p>
                          {selectedOrder.customerDetails.firstName} {selectedOrder.customerDetails.lastName}
                        </p>
                        <p>{selectedOrder.customerDetails.email}</p>
                        <p>{selectedOrder.customerDetails.phone}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="shipping">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Shipping Address</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm">
                        <p>
                          {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                        </p>
                        <p>{selectedOrder.shippingAddress.address1}</p>
                        {selectedOrder.shippingAddress.address2 && <p>{selectedOrder.shippingAddress.address2}</p>}
                        <p>
                          {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.province}{" "}
                          {selectedOrder.shippingAddress.postalCode}
                        </p>
                        <p>{selectedOrder.shippingAddress.country}</p>
                        {selectedOrder.shippingAddress.phone && <p>{selectedOrder.shippingAddress.phone}</p>}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Billing Address</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm">
                        <p>
                          {selectedOrder.billingAddress.firstName} {selectedOrder.billingAddress.lastName}
                        </p>
                        <p>{selectedOrder.billingAddress.address1}</p>
                        {selectedOrder.billingAddress.address2 && <p>{selectedOrder.billingAddress.address2}</p>}
                        <p>
                          {selectedOrder.billingAddress.city}, {selectedOrder.billingAddress.province}{" "}
                          {selectedOrder.billingAddress.postalCode}
                        </p>
                        <p>{selectedOrder.billingAddress.country}</p>
                        {selectedOrder.billingAddress.phone && <p>{selectedOrder.billingAddress.phone}</p>}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Fulfillment Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <ShoppingBag className="h-5 w-5 mr-2" />
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            selectedOrder.fulfillmentStatus === "fulfilled"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                              : selectedOrder.fulfillmentStatus === "shipped"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                                : selectedOrder.fulfillmentStatus === "not_fulfilled"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                          }`}
                        >
                          {selectedOrder.fulfillmentStatus
                            .split("_")
                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(" ")}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Inventory Update */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Confirm Status Update
            </DialogTitle>
            <DialogDescription>
              Changing the order status to {statusToUpdate} will update inventory levels. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedOrder && processStatusUpdate(selectedOrder.id, statusToUpdate)}
              variant="default"
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

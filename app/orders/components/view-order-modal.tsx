"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingBag } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"
import type { Order } from "@/types"

interface ViewOrderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order | null
  onUpdateStatus: (orderId: string, status: string) => void
}

export function ViewOrderModal({ open, onOpenChange, order, onUpdateStatus }: ViewOrderModalProps) {
  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            Order #{order.id} placed on {format(order.createdAt, "MMMM dd, yyyy")}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Order Details</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Items</h3>
              <Select value={order.status} onValueChange={(value) => onUpdateStatus(order.id, value)}>
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
                  {order.items.map((item) => (
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
                    <span>₦{order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>₦{order.shippingTotal.toFixed(2)}</span>
                  </div>
                  {order.discountTotal > 0 && (
                    <div className="flex justify-between">
                      <span>Discount</span>
                      <span>-₦{order.discountTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Total</span>
                    <span>₦{order.total.toFixed(2)}</span>
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
                      {order.customerDetails.firstName} {order.customerDetails.lastName}
                    </p>
                    <p>{order.customerDetails.email}</p>
                    <p>{order.customerDetails.phone}</p>
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
                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                    </p>
                    <p>{order.shippingAddress.address1}</p>
                    {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                    {order.shippingAddress.phone && <p>{order.shippingAddress.phone}</p>}
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
                      {order.billingAddress.firstName} {order.billingAddress.lastName}
                    </p>
                    <p>{order.billingAddress.address1}</p>
                    {order.billingAddress.address2 && <p>{order.billingAddress.address2}</p>}
                    <p>
                      {order.billingAddress.city}, {order.billingAddress.province} {order.billingAddress.postalCode}
                    </p>
                    <p>{order.billingAddress.country}</p>
                    {order.billingAddress.phone && <p>{order.billingAddress.phone}</p>}
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
                        order.fulfillmentStatus === "fulfilled"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          : order.fulfillmentStatus === "shipped"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                            : order.fulfillmentStatus === "not_fulfilled"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                      }`}
                    >
                      {order.fulfillmentStatus
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
      </DialogContent>
    </Dialog>
  )
}

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import type { Order } from "@/types";
import { useSettingsStore } from "@/store/store";

interface ViewOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onUpdateStatus: (orderId: string, status: string) => void;
}

export function ViewOrderModal({
  open,
  onOpenChange,
  order,
  onUpdateStatus,
}: ViewOrderModalProps) {
  if (!order) return null;

  const [loading, setLoading] = useState(true);

  const { shippingOptions } = useSettingsStore();

  const selectedShippingOption = shippingOptions.find(
    (option) => option.id === order.shippingOptionId
  );

  useEffect(() => {
    const shippingOptions = useSettingsStore.getState().shippingOptions;
    if (!shippingOptions || shippingOptions.length === 0) {
      useSettingsStore
        .getState()
        .fetchSettings()
        .then(() => {
          const updatedShippingOptions =
            useSettingsStore.getState().shippingOptions;
          console.log("[FETCHED_SHIPPING_OPTIONS]", updatedShippingOptions);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const originalTotal = order.items.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );

  let discountedTotal = originalTotal;

  if (order.discount) {
    if (order.discount.type === "percentage") {
      discountedTotal = originalTotal * (1 - order.discount.value / 100);
    } else if (order.discount.type === "fixed_amount") {
      discountedTotal = Math.max(0, originalTotal - order.discount.value);
    }
  }

  const [selectedStatus, setSelectedStatus] = useState<string>(
    order.status ?? "PENDING"
  );

  // Update local state whenever a new order is loaded
  useEffect(() => {
    setSelectedStatus(order.status ?? "PENDING");
  }, [order]);

  const [statusToUpdate, setStatusToUpdate] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            Order #{order.id} placed on{" "}
            {format(new Date(order.createdAt), "MMMM dd, yyyy")}
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
              <Select
                value={selectedStatus}
                onValueChange={(value) => {
                  if (value !== selectedStatus) {
                    setStatusToUpdate(value); // Store the intended new status
                    setIsConfirmModalOpen(true); // Open the confirmation modal
                  }
                }}
                disabled={selectedStatus === "DELIVERED"}
              >
                <SelectTrigger
                  className="w-[180px]"
                  disabled={selectedStatus === "DELIVERED"}
                >
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="SHIPPED">Shipped</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="CANCELED">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.product.title}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        ₦{item.subtotal.toLocaleString()}
                      </TableCell>
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
                  {order.discount && (
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>Discount ({order.discount.code})</span>
                      <span>
                        {order.discount.type === "percentage"
                          ? `${order.discount.value}%`
                          : `₦${order.discount.value.toLocaleString()}`}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Total</span>
                    <span>
                      {order.discount ? (
                        <>
                          <span className="line-through text-gray-500 mr-2">
                            ₦{originalTotal.toLocaleString()}
                          </span>
                          <span className="text-green-600 font-semibold">
                            ₦{Math.round(discountedTotal).toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <>₦{originalTotal.toLocaleString()}</>
                      )}
                    </span>
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
                      {order.firstName} {order.lastName}
                    </p>
                    <p>{order.email}</p>
                    <p>{order.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shipping">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <p>
                    {order.address}, {order.city}, {order.state}{" "}
                    {order.postalCode}
                  </p>
                  <p>{order.country}</p>
                </div>
                <div className="text-sm mt-4">
                  <h4 className="font-medium">Shipping Option</h4>
                  {order.shippingOptionId && selectedShippingOption ? (
                    <p>
                      {selectedShippingOption.name} (₦
                      {order.shippingCost?.toLocaleString() || "0.00"} -{" "}
                      {selectedShippingOption.deliveryTime})
                    </p>
                  ) : (
                    <p>No shipping option selected</p>
                  )}
                  <h4 className="font-medium mt-2">Payment Reference</h4>
                  <p>{order.paymentReference || "N/A"}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        {isConfirmModalOpen && statusToUpdate && (
          <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl space-y-4">
              <h2 className="text-lg font-semibold">Confirm Status Update</h2>
              <p>
                Are you sure you want to update the status to{" "}
                <strong>{statusToUpdate}</strong>?
              </p>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => {
                    setIsConfirmModalOpen(false);
                    setStatusToUpdate(null);
                  }}
                  className="px-4 py-2 text-sm rounded bg-white hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setSelectedStatus(statusToUpdate);
                    onUpdateStatus(order.id, statusToUpdate);
                    setIsConfirmModalOpen(false);
                    setStatusToUpdate(null);
                  }}
                  className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

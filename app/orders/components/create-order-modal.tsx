"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { AlertCircle, Plus } from "lucide-react";
import type { CustomerDetails, Address, Order } from "@/types";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";

interface CreateOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddOrder: (
    order: Omit<Order, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
}

export function CreateOrderModal({
  open,
  onOpenChange,
}: CreateOrderModalProps) {
  const { products, onAddOrder, fetchOrders } = useStore(
    useShallow((state) => ({
      products: state.products,
      onAddOrder: state.addOrder,
      fetchOrders: state.fetchOrders,
    }))
  );

  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [shippingAddress, setShippingAddress] = useState<Address>({
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Nigeria",
  });

  const [selectedItems, setSelectedItems] = useState<
    { productId: string; quantity: number }[]
  >([]);

  // Add item to order
  const addItemToOrder = () => {
    setSelectedItems([...selectedItems, { productId: "", quantity: 1 }]);
  };

  // Remove item from order
  const removeItemFromOrder = (index: number) => {
    const newItems = [...selectedItems];
    newItems.splice(index, 1);
    setSelectedItems(newItems);
  };

  // Update item in order
  const updateOrderItem = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const newItems = [...selectedItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setSelectedItems(newItems);
  };

  // Create order
  const handleCreateOrder = async () => {
    // Validate customer details
    if (
      !customerDetails.firstName ||
      !customerDetails.lastName ||
      !customerDetails.email ||
      !customerDetails.phone
    ) {
      toast({
        title: "Missing Customer Information",
        description: "Please fill in all customer details",
        variant: "destructive",
      });
      return;
    }

    // Validate shipping address
    if (
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.postalCode
    ) {
      toast({
        title: "Missing Shipping Information",
        description: "Please fill in all shipping address details",
        variant: "destructive",
      });
      return;
    }

    // Validate items
    if (
      selectedItems.length === 0 ||
      selectedItems.some((item) => !item.productId)
    ) {
      toast({
        title: "Invalid Order Items",
        description: "Please add at least one valid product to the order",
        variant: "destructive",
      });
      return;
    }

    // Prepare order items
    const items = selectedItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    // Prepare order data for backend
    const orderData = {
      firstName: customerDetails.firstName,
      lastName: customerDetails.lastName,
      email: customerDetails.email,
      phone: customerDetails.phone,
      address: shippingAddress.address,
      city: shippingAddress.city,
      state: shippingAddress.state,
      postalCode: shippingAddress.postalCode,
      country: shippingAddress.country,
      items,
    };

    try {
      await onAddOrder(orderData);
      await fetchOrders(); // 👈 Fetch the latest orders after adding
      setCustomerDetails({ firstName: "", lastName: "", email: "", phone: "" });
      setShippingAddress({
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: "Nigeria",
      });
      setSelectedItems([]);
      onOpenChange(false);
      toast({
        title: "Order Created",
        description: "Order has been created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>
            Create a new order by entering customer details and selecting
            products
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
                  onChange={(e) =>
                    setCustomerDetails({
                      ...customerDetails,
                      firstName: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={customerDetails.lastName}
                  onChange={(e) =>
                    setCustomerDetails({
                      ...customerDetails,
                      lastName: e.target.value,
                    })
                  }
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
                  onChange={(e) =>
                    setCustomerDetails({
                      ...customerDetails,
                      email: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={customerDetails.phone}
                  onChange={(e) =>
                    setCustomerDetails({
                      ...customerDetails,
                      phone: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <h3 className="text-lg font-medium">Shipping Address</h3>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={shippingAddress.address}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      address: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        city: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={shippingAddress.state}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        state: e.target.value,
                      })
                    }
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
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        postalCode: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={shippingAddress.country}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        country: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Products</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItemToOrder}
              >
                <Plus className="mr-1 h-3 w-3" /> Add Product
              </Button>
            </div>

            {selectedItems.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No products added. Click "Add Product" to add products to this
                order.
              </div>
            ) : (
              <div className="space-y-4">
                {selectedItems.map((item, index) => (
                  <div key={index} className="grid gap-4 p-4 border rounded-md">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Product</Label>
                        {products && products.length > 0 ? (
                          <Select
                            onValueChange={(value) =>
                              updateOrderItem(index, "productId", value)
                            }
                            defaultValue={item.productId}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.title} - ₦{product.price.toFixed(2)}{" "}
                                  ({product.inventory} in stock)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            No products available. Please add products to the
                            inventory first.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-end gap-4">
                      <div className="grid gap-2 flex-1">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateOrderItem(
                              index,
                              "quantity",
                              Number.parseInt(e.target.value) || 1
                            )
                          }
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

                    {item.productId && (
                      <div className="text-sm text-muted-foreground">
                        {(() => {
                          const product = products.find(
                            (p) => p.id === item.productId
                          );
                          if (product) {
                            const total = product.price * item.quantity;
                            return `${item.quantity} × ${
                              product.title
                            } at ₦${product.price.toFixed(
                              2
                            )} = ₦${total.toFixed(2)}`;
                          }
                          return null;
                        })()}
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex justify-end text-sm font-medium">
                  Total: ₦
                  {selectedItems
                    .reduce((sum, item) => {
                      const product = products.find(
                        (p) => p.id === item.productId
                      );
                      return (
                        sum + (product ? product.price * item.quantity : 0)
                      );
                    }, 0)
                    .toFixed(2)}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateOrder}>Create Order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

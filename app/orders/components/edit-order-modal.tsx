"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Search, AlertCircle } from "lucide-react";
import { useStore } from "@/store/store";
import { toast } from "@/components/ui/use-toast";
import type { Order, CustomerDetails, Address, OrderItem } from "@/types";

interface EditOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
  onUpdateOrder: (id: string, order: Partial<Order>) => Promise<void>;
}

export function EditOrderModal({
  open,
  onOpenChange,
  order,
  onUpdateOrder,
}: EditOrderModalProps) {
  const { fetchOrders, products } = useStore();

  // Form state
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [address, setAddress] = useState<Address>({
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Nigeria",
  });
  const [status, setStatus] = useState<Order["status"] | undefined>(undefined);
  const [items, setItems] = useState<
    { productId: string; quantity: number; title?: string }[]
  >([]);
  const [searchOpen, setSearchOpen] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof products>([]);

  // Initialize form with order data
  useEffect(() => {
    if (order) {
      setCustomerDetails({
        firstName: order.customerDetails.firstName,
        lastName: order.customerDetails.lastName,
        email: order.customerDetails.email,
        phone: order.customerDetails.phone,
      });
      setAddress({
        address: order.address.address,
        city: order.address.city,
        state: order.address.state,
        postalCode: order.address.postalCode,
        country: order.address.country,
      });
      setStatus(order.status);
      setItems(
        order.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          title: products.find((p) => p.id === item.productId)?.title || "",
        }))
      );
    }
  }, [order, products]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length >= 2) {
      const results = products
        .filter(
          (product) =>
            (product.title.toLowerCase().includes(query.toLowerCase()) ||
              product.description
                ?.toLowerCase()
                .includes(query.toLowerCase()) ||
              product.category?.toLowerCase().includes(query.toLowerCase()) ||
              product.tags?.some((tag) =>
                tag.toLowerCase().includes(query.toLowerCase())
              )) &&
            product.inventory > 0
        )
        .slice(0, 5); // Limit to 5 results
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  // Handle product selection from search
  const handleProductSelect = (
    index: number,
    product: (typeof products)[0]
  ) => {
    setSearchOpen(null);
    setSearchQuery("");
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      productId: product.id,
      title: product.title,
    };
    setItems(updatedItems);
  };

  // Handle quantity change
  const handleQuantityChange = (index: number, quantity: number) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      quantity: Math.max(1, quantity),
    };
    setItems(updatedItems);
  };

  // Add new item to order
  const addOrderItem = () => {
    setItems([
      ...items,
      {
        productId: "",
        quantity: 1,
        title: "",
      },
    ]);
  };

  // Remove item from order
  const removeOrderItem = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  // Handle form submission
  const handleUpdateOrder = async () => {
    if (!order?.id) return;

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

    // Validate address
    if (!address.address || !address.city || !address.postalCode) {
      toast({
        title: "Missing Address Information",
        description: "Please fill in all required address details",
        variant: "destructive",
      });
      return;
    }

    // Validate items
    if (items.length === 0 || items.some((item) => !item.productId)) {
      toast({
        title: "Invalid Order Items",
        description: "Please ensure all items have a valid product",
        variant: "destructive",
      });
      return;
    }

    // Construct payload with changed fields
    const payload: Partial<Order> = {
      firstName: customerDetails.firstName,
      lastName: customerDetails.lastName,
      email: customerDetails.email,
      phone: customerDetails.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      status,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };

    try {
      await onUpdateOrder(order.id, payload);
      await fetchOrders(); // Refresh orders
      onOpenChange(false); // Close modal
      toast({
        title: "Order Updated",
        description: `Order #${order.id} has been updated successfully`,
      });
    } catch (err) {
      console.error("[UPDATE_ORDER]", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update order",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Order #{order.id}</DialogTitle>
          <DialogDescription>
            Update customer details, shipping information, status, and products
            for this order
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Customer Information */}
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

          {/* Shipping Address */}
          <div className="grid gap-2">
            <h3 className="text-lg font-medium">Shipping Address</h3>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={address.address}
                  onChange={(e) =>
                    setAddress({
                      ...address,
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
                    value={address.city}
                    onChange={(e) =>
                      setAddress({
                        ...address,
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
                    value={address.state}
                    onChange={(e) =>
                      setAddress({
                        ...address,
                        state: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={address.postalCode}
                    onChange={(e) =>
                      setAddress({
                        ...address,
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
                    value={address.country}
                    onChange={(e) =>
                      setAddress({
                        ...address,
                        country: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Status */}
          <div className="grid gap-2">
            <h3 className="text-lg font-medium">Order Status</h3>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as Order["status"])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
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

          {/* Order Items */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Products</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOrderItem}
              >
                Add Product
              </Button>
            </div>
            {items.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No products in this order. Click "Add Product" to add products.
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="grid gap-4 p-4 border rounded-md">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Product</Label>
                        {searchOpen === index ? (
                          <div className="relative">
                            <div className="relative">
                              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="search"
                                placeholder="Search products by title, category, or tags..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                autoFocus
                              />
                            </div>
                            {searchQuery.length >= 2 && (
                              <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                                {searchResults.length > 0 ? (
                                  searchResults.map((product) => (
                                    <div
                                      key={product.id}
                                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                      onClick={() =>
                                        handleProductSelect(index, product)
                                      }
                                    >
                                      <div className="font-medium">
                                        {product.title}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        {product.category} • {product.inventory}{" "}
                                        in stock
                                        {product.tags?.length > 0 && (
                                          <span>
                                            {" "}
                                            • Tags: {product.tags.join(", ")}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="px-4 py-2 text-muted-foreground">
                                    No products found matching "{searchQuery}"
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            className="justify-start font-normal"
                            onClick={() => setSearchOpen(index)}
                          >
                            {item.productId
                              ? item.title || "Select product"
                              : "Search products..."}
                          </Button>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              index,
                              parseInt(e.target.value) || 1
                            )
                          }
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeOrderItem(index)}
                      >
                        <AlertCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdateOrder}>Update Order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

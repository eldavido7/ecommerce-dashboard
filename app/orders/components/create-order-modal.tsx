"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
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
import { AlertCircle, Plus, Search } from "lucide-react";
import type {
  Order,
  OrderItem,
  CustomerDetails,
  Address,
  Product,
} from "@/types";
import { useStore } from "@/store/store";

interface CreateOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddOrder: (order: Order) => void;
}

export function CreateOrderModal({
  open,
  onOpenChange,
  onAddOrder,
}: CreateOrderModalProps) {
  // Get products directly from the store
  const products = useStore((state) => state.products);

  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [shippingAddress, setShippingAddress] = useState<Address>({
    firstName: "",
    lastName: "",
    address1: "",
    city: "",
    province: "",
    postalCode: "",
    country: "Nigeria",
  });

  const [selectedItems, setSelectedItems] = useState<
    {
      productId: string;
      variantId: string;
      quantity: number;
    }[]
  >([]);

  // State for product search
  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<Product[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debug: Log products to ensure they're loaded
  useEffect(() => {
    console.log("Products from store:", products);
  }, [products]);

  // Add item to new order
  const addItemToOrder = () => {
    setSelectedItems([
      ...selectedItems,
      {
        productId: "",
        variantId: "",
        quantity: 1,
      },
    ]);
  };

  // Remove item from new order
  const removeItemFromOrder = (index: number) => {
    const newItems = [...selectedItems];
    newItems.splice(index, 1);
    setSelectedItems(newItems);
  };

  // Update item in new order
  const updateOrderItem = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const newItems = [...selectedItems];
    newItems[index] = { ...newItems[index], [field]: value };

    // If product changed, reset variant
    if (field === "productId") {
      newItems[index].variantId = "";
    }

    setSelectedItems(newItems);
  };

  // Handle search input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.length >= 2) {
      // Filter products based on search term
      const suggestions = products
        .filter((product) => {
          const titleMatch = product.title
            .toLowerCase()
            .includes(term.toLowerCase());
          const categoryMatch = product.category
            .toLowerCase()
            .includes(term.toLowerCase());
          const tagsMatch = product.tags.some((tag) =>
            tag.toLowerCase().includes(term.toLowerCase())
          );

          return (
            (titleMatch || categoryMatch || tagsMatch) && product.inventory > 0
          );
        })
        .slice(0, 5); // Limit to 5 suggestions

      setSearchSuggestions(suggestions);
    } else {
      setSearchSuggestions([]);
    }
  };

  // Handle product selection from suggestions
  const handleProductSelect = (product: Product) => {
    if (activeSearchIndex === null) return;

    updateOrderItem(activeSearchIndex, "productId", product.id);
    setSearchTerm("");
    setSearchSuggestions([]);
    setActiveSearchIndex(null);
  };

  // Create new order
  const handleCreateOrder = () => {
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
      !shippingAddress.address1 ||
      !shippingAddress.city ||
      !shippingAddress.province ||
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
    if (selectedItems.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please add at least one product to the order",
        variant: "destructive",
      });
      return;
    }

    // Create order items
    const orderItems: OrderItem[] = [];
    let subtotal = 0;

    for (const item of selectedItems) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) continue;

      const variant = product.variants.find((v) => v.id === item.variantId);
      if (!variant) continue;

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
      };

      orderItems.push(orderItem);
      subtotal += variant.price * item.quantity;
    }

    if (orderItems.length === 0) {
      toast({
        title: "Error",
        description: "Please select valid products and variants",
        variant: "destructive",
      });
      return;
    }

    // Calculate totals
    const shippingTotal = 1500.0; // Default shipping
    const total = subtotal + shippingTotal;

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
    };

    // Add order to store
    onAddOrder(newOrder);

    // Reset form
    setCustomerDetails({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    });
    setShippingAddress({
      firstName: "",
      lastName: "",
      address1: "",
      city: "",
      province: "",
      postalCode: "",
      country: "Nigeria",
    });
    setSelectedItems([]);
    onOpenChange(false);

    toast({
      title: "Order Created",
      description: `Order #${newOrder.id} has been created successfully`,
    });
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
                <Label htmlFor="address1">Address</Label>
                <Input
                  id="address1"
                  value={shippingAddress.address1}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      address1: e.target.value,
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
                  <Label htmlFor="province">State/Province</Label>
                  <Input
                    id="province"
                    value={shippingAddress.province}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        province: e.target.value,
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
                        <div className="relative">
                          {activeSearchIndex === index ? (
                            <>
                              <div className="flex items-center relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                  ref={searchInputRef}
                                  type="search"
                                  placeholder="Search by title, category, or tags..."
                                  className="pl-8"
                                  value={searchTerm}
                                  onChange={handleSearchInputChange}
                                  autoFocus
                                />
                              </div>
                              {searchSuggestions.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                                  {searchSuggestions.map((product) => (
                                    <div
                                      key={product.id}
                                      className="px-4 py-2 hover:bg-white cursor-pointer"
                                      onClick={() =>
                                        handleProductSelect(product)
                                      }
                                    >
                                      <div className="font-medium">
                                        {product.title}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        {product.category} • {product.inventory}{" "}
                                        in stock
                                        {product.tags &&
                                          product.tags.length > 0 &&
                                          ` • ${product.tags.join(", ")}`}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              className="w-full justify-between"
                              onClick={() => {
                                setActiveSearchIndex(index);
                                setSearchTerm("");
                                setSearchSuggestions([]);
                                // Focus the search input after a short delay to ensure it's rendered
                                setTimeout(() => {
                                  searchInputRef.current?.focus();
                                }, 10);
                              }}
                            >
                              {item.productId
                                ? products.find(
                                    (product) => product.id === item.productId
                                  )?.title || "Select product"
                                : "Search products..."}
                              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label>Variant</Label>
                        <Select
                          value={item.variantId}
                          onValueChange={(value) =>
                            updateOrderItem(index, "variantId", value)
                          }
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
                                  <SelectItem
                                    key={variant.id}
                                    value={variant.id}
                                  >
                                    {variant.title} - ₦
                                    {variant.price.toFixed(2)}
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

                    {item.productId && item.variantId && (
                      <div className="text-sm text-muted-foreground">
                        {(() => {
                          const product = products.find(
                            (p) => p.id === item.productId
                          );
                          const variant = product?.variants.find(
                            (v) => v.id === item.variantId
                          );
                          if (product && variant) {
                            const total = variant.price * item.quantity;
                            return `${item.quantity} × ${
                              variant.title
                            } at ₦${variant.price.toFixed(
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
                      const variant = product?.variants.find(
                        (v) => v.id === item.variantId
                      );
                      return (
                        sum + (variant ? variant.price * item.quantity : 0)
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

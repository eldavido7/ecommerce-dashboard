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
import { Search, AlertCircle, Plus } from "lucide-react";
import { useStore } from "@/store/store";
import { toast } from "@/components/ui/use-toast";
import type { Order } from "@/types";
import { useShallow } from "zustand/react/shallow";

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
  const { products, discounts, fetchOrders, fetchProducts, fetchDiscounts } =
    useStore(
      useShallow((state) => ({
        products: state.products,
        discounts: state.discounts,
        fetchOrders: state.fetchOrders,
        fetchProducts: state.fetchProducts,
        fetchDiscounts: state.fetchDiscounts,
      }))
    );

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [status, setStatus] = useState<Order["status"] | null>(null);
  const [items, setItems] = useState<
    { productId: string; quantity: number; title?: string; price?: number }[]
  >([]);
  const [selectedDiscountId, setSelectedDiscountId] = useState<string | null>(
    null
  );
  const [discountError, setDiscountError] = useState<string>("");
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [searchOpen, setSearchOpen] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof products>([]);

  // Initialize form with order data
  useEffect(() => {
    if (order?.id) {
      setFirstName(order.firstName);
      setLastName(order.lastName);
      setEmail(order.email);
      setPhone(order.phone);
      setAddress(order.address);
      setCity(order.city);
      setState(order.state);
      setPostalCode(order.postalCode);
      setCountry(order.country);
      setStatus(order.status);
      setSelectedDiscountId(order.discountId || null);
      setItems(
        order.items.map((item) => {
          const product = products.find((p) => p.id === item.productId);
          return {
            productId: item.productId,
            quantity: item.quantity,
            title: product?.title || "",
            price: product?.price || 0,
          };
        })
      );
      setSubtotal(order.subtotal || 0);
      setTotal(order.total || 0);
    }
  }, [order, products]);

  // Fetch products and discounts if empty
  useEffect(() => {
    if (!products || products.length === 0) {
      fetchProducts().catch((err) => {
        console.error("[FETCH_PRODUCTS]", err);
        toast({
          title: "Error",
          description: "Failed to fetch products.",
          variant: "destructive",
        });
      });
    }
    if (!discounts || discounts.length === 0) {
      fetchDiscounts().catch((err) => {
        console.error("[FETCH_DISCOUNTS]", err);
        toast({
          title: "Error",
          description: "Failed to fetch discounts.",
          variant: "destructive",
        });
      });
    }
  }, [products, discounts, fetchProducts, fetchDiscounts]);

  // Calculate totals and validate discount
  const calculateTotals = async () => {
    let calculatedSubtotal = 0;
    let calculatedTotal = 0;
    let calculatedDiscountAmount = 0;
    let error = "";

    try {
      // Calculate subtotal
      for (const item of items) {
        if (item.productId) {
          const product = products.find((p) => p.id === item.productId);
          if (product) {
            calculatedSubtotal += product.price * item.quantity;
          }
        }
      }

      calculatedTotal = calculatedSubtotal;

      // Validate discount
      if (selectedDiscountId) {
        const discount = discounts.find((d) => d.id === selectedDiscountId);
        if (!discount) {
          error = "Selected discount is invalid.";
        } else if (!discount.isActive) {
          error = `Discount ${discount.code} is not active.`;
        } else if (discount.startsAt > new Date()) {
          error = `Discount ${discount.code} is not yet valid.`;
        } else if (discount.endsAt && discount.endsAt < new Date()) {
          error = `Discount ${discount.code} has expired.`;
        } else if (
          discount.usageLimit &&
          discount.usageCount >= discount.usageLimit
        ) {
          error = `Discount ${discount.code} has reached its usage limit.`;
        } else if (
          discount.minSubtotal &&
          calculatedSubtotal < discount.minSubtotal
        ) {
          error = `Order subtotal (₦${calculatedSubtotal.toFixed(
            2
          )}) is below the minimum required (₦${discount.minSubtotal.toFixed(
            2
          )}) for discount ${discount.code}.`;
        } else if (
          discount.products?.length &&
          !items.some((item) =>
            discount?.products?.some((p) => p.id === item.productId)
          )
        ) {
          error = `Selected products do not qualify for discount ${discount.code}.`;
        } else {
          if (discount.type === "percentage") {
            calculatedDiscountAmount =
              (discount.value / 100) * calculatedSubtotal;
          } else if (discount.type === "fixed_amount") {
            calculatedDiscountAmount = discount.value;
          } else if (discount.type === "free_shipping") {
            calculatedDiscountAmount = 0; // Adjust if shipping costs are added
          }
          calculatedTotal = Math.max(
            0,
            calculatedSubtotal - calculatedDiscountAmount
          );
        }
      }
    } catch (err) {
      error = "Failed to calculate totals.";
      console.error("[CALCULATE_TOTALS]", err);
    }

    setSubtotal(calculatedSubtotal);
    setTotal(calculatedTotal);
    setDiscountAmount(calculatedDiscountAmount);
    setDiscountError(error);
  };

  // Recalculate totals when items or discount change
  useEffect(() => {
    calculateTotals();
  }, [items, selectedDiscountId, products, discounts]);

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
      price: product.price,
    };
    setItems(updatedItems);
  };

  // Handle quantity change
  const handleQuantityChange = (index: number, quantity: number) => {
    const updatedItems = [...items];
    const product = products.find(
      (p) => p.id === updatedItems[index].productId
    );
    if (product && quantity > product.inventory) {
      toast({
        title: "Invalid Quantity",
        description: `Quantity cannot exceed available inventory (${product.inventory}) for ${product.title}.`,
        variant: "destructive",
      });
      return;
    }
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
        price: 0,
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

    // Validate fields
    if (!firstName || !lastName || !email || !phone) {
      toast({
        title: "Missing Customer Information",
        description: "Please fill in all customer details",
        variant: "destructive",
      });
      return;
    }

    if (!address || !city || !postalCode || !country) {
      toast({
        title: "Missing Address Information",
        description: "Please fill in all required address details",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0 || items.some((item) => !item.productId)) {
      toast({
        title: "Invalid Order Items",
        description: "Please ensure all items have a valid product",
        variant: "destructive",
      });
      return;
    }

    if (discountError) {
      toast({
        title: "Invalid Discount",
        description: discountError,
        variant: "destructive",
      });
      return;
    }

    // Construct payload
    const payload: Partial<Order> = {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      postalCode,
      country,
      status: status || "PENDING",
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      subtotal,
      total,
      discountId: selectedDiscountId || null,
    };

    try {
      await onUpdateOrder(order.id, payload);
      await fetchOrders();
      onOpenChange(false);
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
            Update customer details, shipping information, status, products, and
            discount for this order
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
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
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
              value={status || ""}
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

          {/* Discount */}
          <div className="grid gap-2">
            <h3 className="text-lg font-medium">Discount</h3>
            <div className="grid gap-2">
              <Label htmlFor="discount">Discount</Label>
              <Select
                value={selectedDiscountId || "none"}
                onValueChange={(value) =>
                  setSelectedDiscountId(value === "none" ? null : value)
                }
              >
                <SelectTrigger id="discount">
                  <SelectValue placeholder="Select a discount (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Discount</SelectItem>
                  {discounts.map((discount) => (
                    <SelectItem key={discount.id} value={discount.id}>
                      {discount.code} -{" "}
                      {discount.type === "percentage"
                        ? `${discount.value}%`
                        : discount.type === "fixed_amount"
                        ? `₦${discount.value.toFixed(2)}`
                        : "Free Shipping"}{" "}
                      {discount.minSubtotal
                        ? `(Min: ₦${discount.minSubtotal.toFixed(2)})`
                        : ""}{" "}
                      {discount.products?.length
                        ? `(${discount.products.length} products)`
                        : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {discountError && (
                <p className="text-sm text-red-600">{discountError}</p>
              )}
            </div>
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
                <Plus className="mr-1 h-3 w-3" /> Add Product
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
                    {item.productId && item.price && (
                      <div className="text-sm text-muted-foreground">
                        {item.quantity} × {item.title} at ₦
                        {item.price.toFixed(2)} = ₦
                        {(item.price * item.quantity).toFixed(2)}
                      </div>
                    )}
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
                <div className="flex justify-end gap-4 text-sm font-medium">
                  <div>Subtotal: ₦{subtotal.toFixed(2)}</div>
                  {discountAmount > 0 && (
                    <div>Discount: ₦{discountAmount.toFixed(2)}</div>
                  )}
                  <div>Total: ₦{total.toFixed(2)}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateOrder}
            disabled={
              !!discountError ||
              items.length === 0 ||
              items.some((item) => !item.productId)
            }
          >
            Update Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

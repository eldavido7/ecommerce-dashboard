"use client";

import { useState, useEffect } from "react";
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
import type { Order } from "@/types";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";

interface CreateOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddOrder: (
    order: Omit<Order, "id" | "createdAt" | "updatedAt"> & {
      items: { productId: string; quantity: number }[];
    }
  ) => Promise<void>;
}

export function CreateOrderModal({
  open,
  onOpenChange,
  onAddOrder,
}: CreateOrderModalProps) {
  const { products, discounts, fetchProducts, fetchDiscounts, fetchOrders } =
    useStore(
      useShallow((state) => ({
        products: state.products,
        discounts: state.discounts,
        fetchProducts: state.fetchProducts,
        fetchDiscounts: state.fetchDiscounts,
        fetchOrders: state.fetchOrders,
      }))
    );

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [selectedItems, setSelectedItems] = useState<
    { productId: string; quantity: number }[]
  >([]);
  const [selectedDiscountId, setSelectedDiscountId] = useState<string>("none");
  const [discountError, setDiscountError] = useState<string>("");
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Fetch products and discounts on mount if empty
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

  // Calculate totals and validate discount
  const calculateTotals = async () => {
    let calculatedSubtotal = 0;
    let calculatedTotal = 0;
    let calculatedDiscountAmount = 0;
    let error = "";

    try {
      // Calculate subtotal
      for (const item of selectedItems) {
        if (item.productId) {
          const product = products.find((p) => p.id === item.productId);
          if (product) {
            calculatedSubtotal += product.price * item.quantity;
          }
        }
      }

      calculatedTotal = calculatedSubtotal;

      // Validate discount
      if (selectedDiscountId !== "none") {
        const discount = discounts.find((d) => d.id === selectedDiscountId);
        if (!discount) {
          error = "Selected discount is invalid.";
        } else if (!discount.isActive) {
          error = `Discount ${discount.code} is not active.`;
        } else if (
          discount.startsAt &&
          new Date(discount.startsAt) > new Date()
        ) {
          error = `Discount ${discount.code} is not yet valid.`;
        } else if (discount.endsAt && new Date(discount.endsAt) < new Date()) {
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
          !selectedItems.some((item) =>
            discount.products.some((p) => p.id === item.productId)
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
  }, [selectedItems, selectedDiscountId, products, discounts]);

  // Create order
  const handleCreateOrder = async () => {
    // Validate fields
    if (!firstName || !lastName || !email || !phone) {
      toast({
        title: "Missing Customer Information",
        description: "Please fill in all customer details",
        variant: "destructive",
      });
      return;
    }

    if (!address || !city || !state || !postalCode || !country) {
      toast({
        title: "Missing Shipping Information",
        description: "Please fill in all shipping address details",
        variant: "destructive",
      });
      return;
    }

    if (
      selectedItems.length === 0 ||
      selectedItems.some((item) => !item.productId || item.quantity <= 0)
    ) {
      toast({
        title: "Invalid Order Items",
        description:
          "Please add at least one valid product with a quantity greater than 0",
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

    const orderData = {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      postalCode,
      country,
      items: selectedItems,
      discountId:
        selectedDiscountId !== "none" ? selectedDiscountId : undefined,
      subtotal,
      total,
    };

    try {
      await onAddOrder(orderData);
      await fetchOrders();
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setCity("");
      setState("");
      setPostalCode("");
      setCountry("Nigeria");
      setSelectedItems([]);
      setSelectedDiscountId("none");
      setDiscountError("");
      setSubtotal(0);
      setTotal(0);
      setDiscountAmount(0);
      onOpenChange(false);
      toast({
        title: "Order Created",
        description: "Order has been created successfully",
      });
    } catch (error) {
      console.error("[CREATE_ORDER]", error);
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
            Create a new order by entering customer details, selecting products,
            and applying a discount if applicable
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
                    required
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

          <div className="grid gap-2">
            <h3 className="text-lg font-medium">Discount</h3>
            <div className="grid gap-2">
              <Label htmlFor="discount">Discount</Label>
              <Select
                value={selectedDiscountId}
                onValueChange={(value) => {
                  setSelectedDiscountId(value);
                  setDiscountError("");
                }}
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
                            value={item.productId}
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
            onClick={handleCreateOrder}
            disabled={!!discountError || selectedItems.length === 0}
          >
            Create Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

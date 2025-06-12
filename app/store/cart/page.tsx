"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { StoreHeader } from "../components/store-header";
import { useToast } from "@/components/ui/use-toast";
import { useStore, useSettingsStore } from "@/store/store";
import { Discount, ShippingOption } from "@/types";

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export default function CartPage() {
  const router = useRouter();
  const { items, total, removeItem, updateQuantity, clearCart } = useCart();
  const { toast } = useToast();
  const { addOrder, discounts, fetchDiscounts } = useStore();
  const { shippingOptions, fetchSettings } = useSettingsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [discountsLoading, DiscountsSetLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  const [selectedShippingOptionId, setSelectedShippingOptionId] = useState<
    string | null
  >(null);

  // Customer information state
  const [customerInfo, setCustomerInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // Shipping address state
  const [shippingAddress, setShippingAddress] = useState({
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Nigeria",
  });

  // Fetch shipping options and discounts if not loaded
  useEffect(() => {
    const discounts = useStore.getState().discounts;
    if (!discounts || discounts.length === 0) {
      useStore
        .getState()
        .fetchDiscounts()
        .then(() => {
          const updatedDiscounts = useStore.getState().discounts;
          console.log("[FETCHED_DISCOUNTS]", updatedDiscounts);
          DiscountsSetLoading(false);
        });
    } else {
      DiscountsSetLoading(false);
    }
  }, []);

  useEffect(() => {
    if (shippingOptions.length === 0) {
      fetchSettings()
        .then(() => {
          setLoading(false);
        })
        .catch((error) => {
          console.error("Fetch settings error:", error);
          setLoading(false);
          toast({
            title: "Error",
            description: "Failed to fetch settings. Please try again.",
            variant: "destructive",
          });
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Calculate totals (in kobo for Paystack, displayed in Naira)
  const subtotal = total; // In kobo
  const shippingCost = selectedShippingOptionId
    ? shippingOptions
        .filter((s) => s.status === "ACTIVE")
        .find((s) => s.id === selectedShippingOptionId)?.price || 0
    : 0;
  // In kobo
  const discountAmount = appliedDiscount
    ? appliedDiscount.type === "percentage"
      ? Math.round(subtotal * appliedDiscount.value)
      : appliedDiscount.type === "fixed_amount"
      ? appliedDiscount.value
      : appliedDiscount.type === "free_shipping"
      ? shippingCost
      : 0
    : 0; // In kobo
  const finalTotal = Math.max(0, subtotal + shippingCost - discountAmount);

  // Handle discount code application
  const applyDiscount = () => {
    if (!discountCode.trim()) {
      toast({
        title: "Missing discount code",
        description: "Please enter a valid discount code.",
        variant: "destructive",
      });
      return;
    }

    const discount = discounts.find((d) => {
      if (d.code.toLowerCase() !== discountCode.toLowerCase()) return false;
      if (!d.isActive) {
        toast({
          title: "Invalid discount",
          description: `Discount ${d.code} is not active.`,
          variant: "destructive",
        });
        return false;
      }
      if (d.startsAt && new Date() < new Date(d.startsAt)) {
        toast({
          title: "Invalid discount",
          description: `Discount ${d.code} is not yet valid.`,
          variant: "destructive",
        });
        return false;
      }
      if (d.endsAt && new Date() > new Date(d.endsAt)) {
        toast({
          title: "Invalid discount",
          description: `Discount ${d.code} has expired.`,
          variant: "destructive",
        });
        return false;
      }
      if (d.usageLimit && d.usageCount >= d.usageLimit) {
        toast({
          title: "Invalid discount",
          description: `Discount ${d.code} has reached its usage limit.`,
          variant: "destructive",
        });
        return false;
      }
      if (d.minSubtotal && subtotal < d.minSubtotal) {
        toast({
          title: "Invalid discount",
          description: `Subtotal (₦${subtotal.toFixed(
            2
          )}) is below the minimum required (₦${d.minSubtotal.toFixed(
            2
          )}) for discount ${d.code}.`,
          variant: "destructive",
        });
        return false;
      }
      if (
        d.products?.length &&
        !items.some((item) => d.products!.some((p) => p.id === item.product.id))
      ) {
        toast({
          title: "Invalid discount",
          description: `Selected products do not qualify for discount ${d.code}.`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    if (discount) {
      setAppliedDiscount(discount);
      toast({
        title: "Discount applied!",
        description: `${discount.code} has been applied to your order.`,
      });
    } else if (
      !discounts.some(
        (d) => d.code.toLowerCase() === discountCode.toLowerCase()
      )
    ) {
      toast({
        title: "Invalid discount code",
        description: "The discount code you entered does not exist.",
        variant: "destructive",
      });
    }
  };

  // Handle quantity change
  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(productId, newQuantity);
    }
  };

  // Handle form input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    formType: "customer" | "shipping"
  ) => {
    const { name, value } = e.target;
    if (formType === "customer") {
      setCustomerInfo((prev) => ({ ...prev, [name]: value }));
    } else {
      setShippingAddress((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Validate form
  const validateForm = () => {
    // Check if cart is empty
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checking out.",
        variant: "destructive",
      });
      return false;
    }

    // Check customer info
    const requiredCustomerFields = ["firstName", "lastName", "email", "phone"];
    for (const field of requiredCustomerFields) {
      if (!customerInfo[field as keyof typeof customerInfo]) {
        toast({
          title: "Missing information",
          description: `Please fill in your ${field
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()}.`,
          variant: "destructive",
        });
        return false;
      }
    }

    // Check shipping address
    const requiredShippingFields = [
      "address",
      "city",
      "state",
      "postalCode",
      "country",
    ];
    for (const field of requiredShippingFields) {
      if (!shippingAddress[field as keyof typeof shippingAddress]) {
        toast({
          title: "Missing information",
          description: `Please fill in your ${field
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()}.`,
          variant: "destructive",
        });
        return false;
      }
    }

    if (!selectedShippingOptionId) {
      toast({
        title: "Missing shipping option",
        description: "Please select a shipping method.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  // Handle checkout with Paystack
  const handleCheckout = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Prepare metadata with proper structure
      const paystackMetadata = {
        customer: {
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country,
        },
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price, // In Naira
        })),
        shippingOptionId: selectedShippingOptionId || "",
        shippingCost: shippingCost,
        discountId: appliedDiscount?.id || null,
        discountAmount: appliedDiscount ? discountAmount : 0,
        subtotal: subtotal,
        total: finalTotal,
      };

      console.log(
        "Paystack metadata being sent:",
        JSON.stringify(paystackMetadata, null, 2)
      );

      // Initialize Paystack payment
      const handler = window.PaystackPop.setup({
        key:
          process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_default_key",
        amount: finalTotal * 100, // Convert to kobo (multiply by 100)
        currency: "NGN",
        email: customerInfo.email,
        metadata: paystackMetadata,
        callback: (response: { reference: string }) => {
          console.log("Payment callback response:", response);

          // Handle payment verification asynchronously
          (async () => {
            try {
              console.log(
                "Verifying payment with reference:",
                response.reference
              );

              const verifyRes = await fetch("/api/paystack/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reference: response.reference }),
              });

              const verifyData = await verifyRes.json();
              console.log("Payment verification response:", verifyData);

              if (!verifyRes.ok || !verifyData.status) {
                throw new Error(
                  `Payment verification failed: ${
                    verifyData.message || "Unknown error"
                  }`
                );
              }

              // Note: Order creation should be handled by webhook
              // But we can add a fallback mechanism here
              console.log(
                "Payment verified successfully, webhook should create order"
              );

              toast({
                title: "Payment successful",
                description:
                  "Your order is being processed, and we will contact you about it shortly. Thank you for shopping with us!",
              });

              clearCart();
              setTimeout(() => {
                router.push("/store");
              }, 2000);
            } catch (error) {
              console.error("Payment verification failed:", error);
              toast({
                title: "Payment error",
                description:
                  "There was an issue verifying your payment. Please contact support.",
                variant: "destructive",
              });
            } finally {
              setIsSubmitting(false);
            }
          })();
        },
        onClose: () => {
          console.log("Payment popup closed by user");
          toast({
            title: "Payment cancelled",
            description:
              "You cancelled the payment. Your order has not been placed.",
            variant: "destructive",
          });
          setIsSubmitting(false);
        },
      });

      handler.openIframe();
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast({
        title: "Error",
        description:
          "There was a problem initiating your payment. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <StoreHeader />
      <main className="px-4 py-8 md:px-36">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/store")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Button>
          <h1 className="text-3xl font-bold">Your Cart</h1>
        </div>

        {items.length === 0 ? (
          <Card className="py-12 text-center">
            <CardContent>
              <div className="flex flex-col items-center">
                <ShoppingBag className="mb-4 h-16 w-16 text-gray-400" />
                <h2 className="mb-2 text-2xl font-semibold">
                  Your cart is empty
                </h2>
                <p className="mb-6 text-gray-500">
                  Looks like you haven't added any products to your cart yet.
                </p>
                <Button onClick={() => router.push("/store")}>
                  Browse Products
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Cart Items ({items.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center border-b py-4 last:border-0"
                    >
                      <div className="relative mr-4 h-20 w-20 overflow-hidden rounded bg-gray-100">
                        <Image
                          src={
                            item.product.imageUrl ||
                            "/placeholder.svg?height=80&width=80"
                          }
                          alt={item.product.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.product.title}</h3>
                        <p className="text-sm text-gray-500">
                          ₦{item.product.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            handleQuantityChange(
                              item.product.id,
                              item.quantity - 1
                            )
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            handleQuantityChange(
                              item.product.id,
                              item.quantity + 1
                            )
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="w-24 text-right font-medium">
                        ₦{(item.product.price * item.quantity).toFixed(2)}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2"
                        onClick={() => removeItem(item.product.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={clearCart}>
                    Clear Cart
                  </Button>
                </CardFooter>
              </Card>

              {/* Customer Information */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={customerInfo.firstName}
                        onChange={(e) => handleInputChange(e, "customer")}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={customerInfo.lastName}
                        onChange={(e) => handleInputChange(e, "customer")}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => handleInputChange(e, "customer")}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={customerInfo.phone}
                        onChange={(e) => handleInputChange(e, "customer")}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={shippingAddress.address}
                        onChange={(e) => handleInputChange(e, "shipping")}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          value={shippingAddress.city}
                          onChange={(e) => handleInputChange(e, "shipping")}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          name="state"
                          value={shippingAddress.state}
                          onChange={(e) => handleInputChange(e, "shipping")}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                          id="postalCode"
                          name="postalCode"
                          value={shippingAddress.postalCode}
                          onChange={(e) => handleInputChange(e, "shipping")}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          name="country"
                          value={shippingAddress.country}
                          onChange={(e) => handleInputChange(e, "shipping")}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Shipping Option */}
                    <div>
                      <Label htmlFor="shippingOption">Shipping Option</Label>
                      <Select
                        value={selectedShippingOptionId || ""}
                        onValueChange={(value) =>
                          setSelectedShippingOptionId(value)
                        }
                        required
                      >
                        <SelectTrigger id="shippingOption">
                          <SelectValue placeholder="Select shipping option" />
                        </SelectTrigger>
                        <SelectContent>
                          {shippingOptions
                            .filter((option) => option.status === "ACTIVE")
                            .map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.name} (₦{option.price.toFixed(2)} –{" "}
                                {option.deliveryTime})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Discount Code */}
                    <div>
                      <Label htmlFor="discountCode">Discount Code</Label>
                      <div className="mt-1 flex">
                        <Input
                          id="discountCode"
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value)}
                          className="rounded-r-none"
                          placeholder="Enter code"
                          disabled={!!appliedDiscount}
                        />
                        <Button
                          onClick={applyDiscount}
                          className="rounded-l-none bg-green-600 hover:bg-green-700"
                          disabled={!!appliedDiscount}
                        >
                          Apply
                        </Button>
                      </div>
                      {appliedDiscount && (
                        <p className="mt-1 text-sm text-green-600">
                          {appliedDiscount.code} applied!
                        </p>
                      )}
                    </div>

                    <Separator />

                    {/* Totals */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Subtotal</span>
                        <span>₦{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Shipping</span>
                        <span>₦{shippingCost.toFixed(2)}</span>
                      </div>
                      {appliedDiscount && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span>-₦{discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>₦{finalTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleCheckout}
                    disabled={isSubmitting || items.length === 0}
                  >
                    {isSubmitting ? "Processing..." : "Checkout with Paystack"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

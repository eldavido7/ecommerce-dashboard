"use client";

import type React from "react";

import { useState } from "react";
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
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { StoreHeader } from "../components/store-header";
import { useToast } from "@/hooks/use-toast";
import { mockDiscounts } from "@/lib/mock-data";
import { useStore } from "@/store/store";

export default function CartPage() {
  const router = useRouter();
  const { items, total, removeItem, updateQuantity, clearCart } = useCart();
  const { toast } = useToast();
  const { addOrder } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);

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
    country: "USA",
  });

  // Shipping fee
  const shippingFee = 1500; // $15.00

  // Calculate totals
  const subtotal = total;
  const discountAmount = appliedDiscount
    ? appliedDiscount.type === "percentage"
      ? Math.round((subtotal * appliedDiscount.value) / 100)
      : appliedDiscount.value * 100
    : 0;
  const finalTotal = subtotal + shippingFee - discountAmount;

  // Handle quantity change
  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(productId, newQuantity);
    }
  };

  // Handle discount code application
  const applyDiscount = () => {
    if (!discountCode.trim()) return;

    const discount = mockDiscounts.find(
      (d) => d.code.toLowerCase() === discountCode.toLowerCase() && d.isActive
    );

    if (discount) {
      setAppliedDiscount(discount);
      toast({
        title: "Discount applied!",
        description: `${
          discount.description || discount.code
        } has been applied to your order.`,
      });
    } else {
      toast({
        title: "Invalid discount code",
        description: "The discount code you entered is invalid or expired.",
        variant: "destructive",
      });
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

    return true;
  };

  // Handle checkout
  const handleCheckout = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Create order object
      const order = {
        id: `order_${Date.now()}`,
        customerDetails: customerInfo,
        items: items.map((item) => ({
          id: `item_${Date.now()}_${item.product.id}`,
          productId: item.product.id,
          quantity: item.quantity,
          subtotal: item.product.price * item.quantity,
          orderId: `order_${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          product: item.product,
        })),
        status: "PENDING",
        total: finalTotal,
        discountId: appliedDiscount?.id || null,
        discount: appliedDiscount || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        address: shippingAddress,
      };

      // Add order to store
      addOrder(order);

      // Show success message
      toast({
        title: "Order placed successfully!",
        description: "Thank you for your order. We'll process it right away.",
      });

      // Clear cart
      clearCart();

      // Redirect to store page
      setTimeout(() => {
        router.push("/store");
      }, 1500);
    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        title: "Error placing order",
        description:
          "There was a problem processing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StoreHeader />

      <main className="md:px-36 px-4 py-8">
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
          <Card className="text-center py-12">
            <CardContent>
              <div className="flex flex-col items-center">
                <ShoppingBag className="h-16 w-16 text-gray-400 mb-4" />
                <h2 className="text-2xl font-semibold mb-2">
                  Your cart is empty
                </h2>
                <p className="text-gray-500 mb-6">
                  Looks like you haven't added any products to your cart yet.
                </p>
                <Button onClick={() => router.push("/store")}>
                  Browse Products
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                      className="flex items-center py-4 border-b last:border-0"
                    >
                      <div className="relative h-20 w-20 rounded overflow-hidden bg-gray-100 mr-4">
                        <Image
                          src={
                            item.product.thumbnail ||
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
                          ${(item.product.price / 100).toFixed(2)}
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
                        $
                        {((item.product.price * item.quantity) / 100).toFixed(
                          2
                        )}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    {/* Discount Code */}
                    <div>
                      <Label htmlFor="discountCode">Discount Code</Label>
                      <div className="flex mt-1">
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
                          className="rounded-l-none bg-green-600"
                          disabled={!!appliedDiscount}
                        >
                          Apply
                        </Button>
                      </div>
                      {appliedDiscount && (
                        <p className="text-sm text-green-600 mt-1">
                          {appliedDiscount.description || appliedDiscount.code}{" "}
                          applied!
                        </p>
                      )}
                    </div>

                    <Separator />

                    {/* Totals */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Subtotal</span>
                        <span>${(subtotal / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Shipping</span>
                        <span>${(shippingFee / 100).toFixed(2)}</span>
                      </div>
                      {appliedDiscount && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span>-${(discountAmount / 100).toFixed(2)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>${(finalTotal / 100).toFixed(2)}</span>
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
                    {isSubmitting ? "Processing..." : "Place Order"}
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

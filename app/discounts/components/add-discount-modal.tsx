"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/store/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Discount } from "@/types";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface AddDiscountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddDiscount: (discount: Discount) => void;
}

export function AddDiscountModal({
  open,
  onOpenChange,
  onAddDiscount,
}: AddDiscountModalProps) {
  const { products } = useStore();
  const [productSearch, setProductSearch] = useState("");
  const [newDiscount, setNewDiscount] = useState<
    Partial<Discount> & { productIds: string[] }
  >({
    code: "",
    description: "",
    type: "percentage",
    value: 0,
    usageLimit: undefined,
    usageCount: 0,
    startsAt: new Date(),
    endsAt: undefined,
    isActive: true,
    minSubtotal: 0,
    productIds: [], // ✅ replace conditions.products
  });

  const handleAddDiscount = () => {
    // Frontend validation for percentage type
    if (
      newDiscount.type === "percentage" &&
      (typeof newDiscount.value !== "number" ||
        newDiscount.value < 1 ||
        newDiscount.value > 100)
    ) {
      toast({
        title: "Invalid Percentage Value",
        description: "Percentage value must be between 1 and 100.",
        variant: "destructive",
      });
      return;
    }

    // Frontend validation for fixed amount type
    if (
      newDiscount.type === "fixed_amount" &&
      (typeof newDiscount.value !== "number" || newDiscount.value <= 0)
    ) {
      toast({
        title: "Invalid Fixed Amount",
        description: "Fixed amount value must be greater than 0.",
        variant: "destructive",
      });
      return;
    }

    const discountToAdd = {
      id: `disc_${Math.random().toString(36).substring(2, 10)}`,
      code: newDiscount.code!,
      description: newDiscount.description,
      type: newDiscount.type!,
      value: newDiscount.value!,
      usageLimit: newDiscount.usageLimit,
      usageCount: 0,
      startsAt: newDiscount.startsAt!,
      endsAt: newDiscount.endsAt,
      isActive: newDiscount.isActive!,
      minSubtotal: newDiscount.minSubtotal || 0,
      productIds: newDiscount.productIds || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    onAddDiscount(discountToAdd as Discount);
    onOpenChange(false);
    setNewDiscount({
      code: "",
      description: "",
      type: "percentage",
      value: 0,
      usageLimit: undefined,
      usageCount: 0,
      startsAt: new Date(),
      endsAt: undefined,
      isActive: true,
      minSubtotal: 0,
      productIds: [],
    });
    setProductSearch("");
  };

  const filteredProducts = useMemo(() => {
    if (productSearch.length < 2) return [];
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.id.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [productSearch, products]);

  const addProductToList = (productId: string) => {
    if (!newDiscount.productIds?.includes(productId)) {
      setNewDiscount({
        ...newDiscount,
        productIds: [...(newDiscount.productIds || []), productId],
      });
    }
  };

  const removeProductFromList = (productId: string) => {
    setNewDiscount({
      ...newDiscount,
      productIds:
        newDiscount.productIds?.filter((id) => id !== productId) || [],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Discount</DialogTitle>
          <DialogDescription>
            Create a new discount code for your customers.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Basic Fields */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="code" className="text-right">
              Code
            </Label>
            <Input
              id="code"
              value={newDiscount.code}
              onChange={(e) =>
                setNewDiscount({
                  ...newDiscount,
                  code: e.target.value.toUpperCase(),
                })
              }
              className="col-span-3"
              placeholder="SUMMER20"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={newDiscount.description ?? ""}
              onChange={(e) =>
                setNewDiscount({ ...newDiscount, description: e.target.value })
              }
              className="col-span-3"
              placeholder="Summer sale 20% off"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select
              onValueChange={(
                value: "percentage" | "fixed_amount"
                // | "free_shipping"
              ) => setNewDiscount({ ...newDiscount, type: value })}
              defaultValue={newDiscount.type}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select discount type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                {/* <SelectItem value="free_shipping">Free Shipping</SelectItem> */}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="value" className="text-right">
              Value
            </Label>
            <Input
              id="value"
              type="number"
              value={newDiscount.value}
              min={newDiscount.type === "percentage" ? 1 : undefined}
              max={newDiscount.type === "percentage" ? 100 : undefined}
              onChange={(e) => {
                let value = parseFloat(e.target.value);
                if (newDiscount.type === "percentage") {
                  if (value > 100) value = 100;
                  if (value < 1) value = 1;
                }
                setNewDiscount({
                  ...newDiscount,
                  value,
                });
              }}
              className="col-span-3"
              placeholder={newDiscount.type === "percentage" ? "20" : "10.00"}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startsAt" className="text-right">
              Start Date
            </Label>
            <Input
              id="startsAt"
              type="datetime-local"
              value={newDiscount.startsAt?.toISOString().slice(0, 16) || ""}
              onChange={(e) =>
                setNewDiscount({
                  ...newDiscount,
                  startsAt: new Date(e.target.value),
                })
              }
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endsAt" className="text-right">
              End Date
            </Label>
            <Input
              id="endsAt"
              type="datetime-local"
              value={newDiscount.endsAt?.toISOString().slice(0, 16) || ""}
              onChange={(e) =>
                setNewDiscount({
                  ...newDiscount,
                  endsAt: e.target.value ? new Date(e.target.value) : undefined,
                })
              }
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="minSubtotal" className="text-right">
              Min. Subtotal
            </Label>
            <Input
              id="minSubtotal"
              type="number"
              value={newDiscount.minSubtotal ?? ""}
              onChange={(e) =>
                setNewDiscount({
                  ...newDiscount,
                  minSubtotal:
                    e.target.value === ""
                      ? undefined
                      : parseFloat(e.target.value),
                })
              }
              className="col-span-3"
              placeholder="0.00"
            />
          </div>

          {/* Product Search */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="productSearch" className="text-right">
              Applies to
            </Label>
            <div className="col-span-3 space-y-2">
              <Input
                id="productSearch"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search by product name or ID"
              />
              {filteredProducts.length > 0 && (
                <div className="border rounded p-2 max-h-[150px] overflow-y-auto space-y-1">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="cursor-pointer hover:bg-muted p-1 rounded text-sm"
                      onClick={() => addProductToList(product.id)}
                    >
                      {product.title} ({product.id})
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {newDiscount.productIds.map((productId) => {
                  const product = products.find((p) => p.id === productId);
                  return (
                    <Badge key={productId} variant="secondary">
                      {product?.title || productId}
                      <X
                        className="ml-1 h-3 w-3 cursor-pointer"
                        onClick={() => removeProductFromList(productId)}
                      />
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="usageLimit" className="text-right">
              Usage Limit
            </Label>
            <Input
              id="usageLimit"
              type="number"
              value={newDiscount.usageLimit ?? ""}
              onChange={(e) =>
                setNewDiscount({
                  ...newDiscount,
                  usageLimit: e.target.value
                    ? parseInt(e.target.value)
                    : undefined,
                })
              }
              className="col-span-3"
              placeholder="Unlimited"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Active</Label>
            <div className="flex items-center space-x-2 col-span-3">
              <Switch
                checked={newDiscount.isActive}
                onCheckedChange={(checked) =>
                  setNewDiscount({ ...newDiscount, isActive: checked })
                }
              />
              <Label>{newDiscount.isActive ? "Active" : "Inactive"}</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddDiscount}>Add Discount</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

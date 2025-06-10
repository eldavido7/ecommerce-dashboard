"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { Discount } from "@/types";

interface EditDiscountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  discount: Discount | null;
  onUpdateDiscount: (updated: Discount) => void;
}

export function EditDiscountModal({
  open,
  onOpenChange,
  discount,
  onUpdateDiscount,
}: EditDiscountModalProps) {
  const { products } = useStore();
  const [productSearch, setProductSearch] = useState("");
  const [editDiscount, setEditDiscount] = useState<
    (Discount & { productIds: string[] }) | null
  >(null);

  useEffect(() => {
    if (discount) {
      setEditDiscount({
        ...discount,
        productIds: discount.products?.map((p) => p.id) || [],
      });
    }
  }, [discount]);

  const handleSaveChanges = () => {
    if (!editDiscount) return;

    const updatedDiscount: Discount = {
      ...editDiscount,
      updatedAt: new Date(),
      conditions: {
        products: editDiscount.productIds, // ← this line ensures productIds are saved
      },
    };

    onUpdateDiscount(updatedDiscount);
    onOpenChange(false);
    setEditDiscount(null);
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
    if (!editDiscount) return;
    if (!editDiscount.productIds.includes(productId)) {
      setEditDiscount({
        ...editDiscount,
        productIds: [...editDiscount.productIds, productId],
      });
    }
  };

  const removeProductFromList = (productId: string) => {
    if (!editDiscount) return;
    setEditDiscount({
      ...editDiscount,
      productIds: editDiscount.productIds.filter((id) => id !== productId),
    });
  };

  if (!editDiscount) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Discount</DialogTitle>
          <DialogDescription>Update discount code details.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Fields reused from AddDiscountModal */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Code</Label>
            <Input
              value={editDiscount.code}
              onChange={(e) =>
                setEditDiscount({
                  ...editDiscount,
                  code: e.target.value.toUpperCase(),
                })
              }
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Description</Label>
            <Textarea
              value={editDiscount.description || ""}
              onChange={(e) =>
                setEditDiscount({
                  ...editDiscount,
                  description: e.target.value,
                })
              }
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Type</Label>
            <Select
              value={editDiscount.type}
              onValueChange={(value) =>
                setEditDiscount({ ...editDiscount, type: value as any })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                <SelectItem value="free_shipping">Free Shipping</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Value</Label>
            <Input
              type="number"
              value={editDiscount.value}
              onChange={(e) =>
                setEditDiscount({
                  ...editDiscount,
                  value: parseFloat(e.target.value),
                })
              }
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Start Date</Label>
            <Input
              type="datetime-local"
              value={
                editDiscount.startsAt
                  ? new Date(editDiscount.startsAt).toISOString().slice(0, 16)
                  : ""
              }
              onChange={(e) =>
                setEditDiscount({
                  ...editDiscount,
                  startsAt: new Date(e.target.value),
                })
              }
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">End Date</Label>
            <Input
              type="datetime-local"
              value={
                editDiscount.endsAt
                  ? new Date(editDiscount.endsAt).toISOString().slice(0, 16)
                  : ""
              }
              onChange={(e) =>
                setEditDiscount({
                  ...editDiscount,
                  endsAt: new Date(e.target.value),
                })
              }
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Min. Subtotal</Label>
            <Input
              type="number"
              value={editDiscount.conditions?.minSubtotal || 0}
              onChange={(e) =>
                setEditDiscount({
                  ...editDiscount,
                  conditions: {
                    ...editDiscount.conditions!,
                    minSubtotal: parseFloat(e.target.value),
                  },
                })
              }
              className="col-span-3"
            />
          </div>

          {/* Product Filter */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Applies to</Label>
            <div className="col-span-3 space-y-2">
              <Input
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
                {editDiscount.productIds.map((productId) => {
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
            <Label className="text-right">Usage Limit</Label>
            <Input
              type="number"
              value={editDiscount.usageLimit ?? ""}
              onChange={(e) =>
                setEditDiscount({
                  ...editDiscount,
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
                checked={editDiscount.isActive}
                onCheckedChange={(checked) =>
                  setEditDiscount({ ...editDiscount, isActive: checked })
                }
              />
              <Label>{editDiscount.isActive ? "Active" : "Inactive"}</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveChanges}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

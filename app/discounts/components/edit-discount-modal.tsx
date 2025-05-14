"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import type { Discount } from "@/types"

interface EditDiscountModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  discount: Discount | null
  onUpdateDiscount: (id: string, discount: Partial<Discount>) => void
}

export function EditDiscountModal({ open, onOpenChange, discount, onUpdateDiscount }: EditDiscountModalProps) {
  const [discountForm, setDiscountForm] = useState<Partial<Discount>>({
    code: "",
    description: "",
    type: "percentage",
    value: 0,
    usageLimit: undefined,
    startsAt: new Date(),
    endsAt: undefined,
    isActive: true,
    conditions: {
      minSubtotal: 0,
    },
  })

  useEffect(() => {
    if (discount) {
      setDiscountForm({
        code: discount.code,
        description: discount.description || "",
        type: discount.type,
        value: discount.value,
        usageLimit: discount.usageLimit,
        startsAt: discount.startsAt,
        endsAt: discount.endsAt,
        isActive: discount.isActive,
        conditions: {
          minSubtotal: discount.conditions?.minSubtotal || 0,
        },
      })
    }
  }, [discount])

  const saveDiscountChanges = () => {
    if (!discount) return

    onUpdateDiscount(discount.id, {
      ...discountForm,
      updatedAt: new Date(),
    })

    onOpenChange(false)
    toast({
      title: "Discount Updated",
      description: `Discount code ${discountForm.code} has been updated.`,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Discount</DialogTitle>
          <DialogDescription>Update the discount details.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-code" className="text-right">
              Code
            </Label>
            <Input
              id="edit-code"
              value={discountForm.code}
              onChange={(e) => setDiscountForm({ ...discountForm, code: e.target.value.toUpperCase() })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-description" className="text-right">
              Description
            </Label>
            <Textarea
              id="edit-description"
              value={discountForm.description}
              onChange={(e) => setDiscountForm({ ...discountForm, description: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-type" className="text-right">
              Type
            </Label>
            <Select
              value={discountForm.type}
              onValueChange={(value: "percentage" | "fixed_amount" | "free_shipping") =>
                setDiscountForm({ ...discountForm, type: value })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select discount type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                <SelectItem value="free_shipping">Free Shipping</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-value" className="text-right">
              Value
            </Label>
            <Input
              id="edit-value"
              type="number"
              value={discountForm.value}
              onChange={(e) => setDiscountForm({ ...discountForm, value: Number.parseFloat(e.target.value) })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-minSubtotal" className="text-right">
              Min. Subtotal
            </Label>
            <Input
              id="edit-minSubtotal"
              type="number"
              value={discountForm.conditions?.minSubtotal}
              onChange={(e) =>
                setDiscountForm({
                  ...discountForm,
                  conditions: {
                    ...discountForm.conditions,
                    minSubtotal: Number.parseFloat(e.target.value),
                  },
                })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-usageLimit" className="text-right">
              Usage Limit
            </Label>
            <Input
              id="edit-usageLimit"
              type="number"
              value={discountForm.usageLimit}
              onChange={(e) =>
                setDiscountForm({
                  ...discountForm,
                  usageLimit: e.target.value ? Number.parseInt(e.target.value) : undefined,
                })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Active</Label>
            <div className="flex items-center space-x-2 col-span-3">
              <Switch
                checked={discountForm.isActive}
                onCheckedChange={(checked) => setDiscountForm({ ...discountForm, isActive: checked })}
              />
              <Label>{discountForm.isActive ? "Active" : "Inactive"}</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={saveDiscountChanges}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

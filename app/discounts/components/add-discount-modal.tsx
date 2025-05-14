"use client"

import { useState } from "react"
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
import type { Discount } from "@/types"

interface AddDiscountModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddDiscount: (discount: Discount) => void
}

export function AddDiscountModal({ open, onOpenChange, onAddDiscount }: AddDiscountModalProps) {
  const [newDiscount, setNewDiscount] = useState<Partial<Discount>>({
    code: "",
    description: "",
    type: "percentage",
    value: 0,
    usageLimit: undefined,
    usageCount: 0,
    startsAt: new Date(),
    endsAt: undefined,
    isActive: true,
    conditions: {
      minSubtotal: 0,
    },
  })

  const handleAddDiscount = () => {
    const discountToAdd = {
      ...newDiscount,
      id: `disc_${Math.random().toString(36).substring(2, 10)}`,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Discount

    onAddDiscount(discountToAdd)
    onOpenChange(false)
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
      conditions: {
        minSubtotal: 0,
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Discount</DialogTitle>
          <DialogDescription>Create a new discount code for your customers.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="code" className="text-right">
              Code
            </Label>
            <Input
              id="code"
              value={newDiscount.code}
              onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })}
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
              value={newDiscount.description}
              onChange={(e) => setNewDiscount({ ...newDiscount, description: e.target.value })}
              className="col-span-3"
              placeholder="Summer sale 20% off"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select
              onValueChange={(value: "percentage" | "fixed_amount" | "free_shipping") =>
                setNewDiscount({ ...newDiscount, type: value })
              }
              defaultValue={newDiscount.type}
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
            <Label htmlFor="value" className="text-right">
              Value
            </Label>
            <Input
              id="value"
              type="number"
              value={newDiscount.value}
              onChange={(e) => setNewDiscount({ ...newDiscount, value: Number.parseFloat(e.target.value) })}
              className="col-span-3"
              placeholder={newDiscount.type === "percentage" ? "20" : "10.00"}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="minSubtotal" className="text-right">
              Min. Subtotal
            </Label>
            <Input
              id="minSubtotal"
              type="number"
              value={newDiscount.conditions?.minSubtotal}
              onChange={(e) =>
                setNewDiscount({
                  ...newDiscount,
                  conditions: {
                    ...newDiscount.conditions,
                    minSubtotal: Number.parseFloat(e.target.value),
                  },
                })
              }
              className="col-span-3"
              placeholder="0.00"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="usageLimit" className="text-right">
              Usage Limit
            </Label>
            <Input
              id="usageLimit"
              type="number"
              value={newDiscount.usageLimit}
              onChange={(e) =>
                setNewDiscount({
                  ...newDiscount,
                  usageLimit: e.target.value ? Number.parseInt(e.target.value) : undefined,
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
                onCheckedChange={(checked) => setNewDiscount({ ...newDiscount, isActive: checked })}
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
  )
}

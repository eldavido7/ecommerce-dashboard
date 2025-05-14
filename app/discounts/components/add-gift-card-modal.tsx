"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { GiftCard } from "@/types"

interface AddGiftCardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddGiftCard: (giftCard: GiftCard) => void
}

export function AddGiftCardModal({ open, onOpenChange, onAddGiftCard }: AddGiftCardModalProps) {
  const [newGiftCard, setNewGiftCard] = useState<Partial<GiftCard>>({
    code: "",
    value: 0,
    balance: 0,
    isDisabled: false,
  })

  const handleAddGiftCard = () => {
    const giftCardToAdd = {
      ...newGiftCard,
      id: `gift_${Math.random().toString(36).substring(2, 10)}`,
      balance: newGiftCard.value,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as GiftCard

    onAddGiftCard(giftCardToAdd)
    onOpenChange(false)
    setNewGiftCard({
      code: "",
      value: 0,
      balance: 0,
      isDisabled: false,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Gift Card</DialogTitle>
          <DialogDescription>Create a new gift card for your customers.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="code" className="text-right">
              Code
            </Label>
            <Input
              id="code"
              value={newGiftCard.code}
              onChange={(e) => setNewGiftCard({ ...newGiftCard, code: e.target.value.toUpperCase() })}
              className="col-span-3"
              placeholder="GIFT-1234-5678"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="value" className="text-right">
              Value
            </Label>
            <Input
              id="value"
              type="number"
              value={newGiftCard.value}
              onChange={(e) =>
                setNewGiftCard({
                  ...newGiftCard,
                  value: Number.parseFloat(e.target.value),
                  balance: Number.parseFloat(e.target.value),
                })
              }
              className="col-span-3"
              placeholder="50.00"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Active</Label>
            <div className="flex items-center space-x-2 col-span-3">
              <Switch
                checked={!newGiftCard.isDisabled}
                onCheckedChange={(checked) => setNewGiftCard({ ...newGiftCard, isDisabled: !checked })}
              />
              <Label>{!newGiftCard.isDisabled ? "Active" : "Inactive"}</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddGiftCard}>Add Gift Card</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

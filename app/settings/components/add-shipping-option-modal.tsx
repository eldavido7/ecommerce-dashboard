"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ShippingOption {
  id?: string
  name: string
  price: number
  deliveryTime: string
  status: "active" | "conditional"
}

interface AddShippingOptionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddShippingOption: (option: ShippingOption) => void
}

export function AddShippingOptionModal({ open, onOpenChange, onAddShippingOption }: AddShippingOptionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Shipping Option</DialogTitle>
          <DialogDescription>Add a new shipping option to your store</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            onAddShippingOption({
              name: formData.get("name") as string,
              price: Number.parseFloat(formData.get("price") as string),
              deliveryTime: formData.get("deliveryTime") as string,
              status: formData.get("status") as "active" | "conditional",
            })
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="shipping-name" className="text-right">
                Name
              </Label>
              <Input id="shipping-name" name="name" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="shipping-price" className="text-right">
                Price (₦)
              </Label>
              <Input
                id="shipping-price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="shipping-delivery" className="text-right">
                Delivery Time
              </Label>
              <Input id="shipping-delivery" name="deliveryTime" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="shipping-status" className="text-right">
                Status
              </Label>
              <Select name="status" defaultValue="active">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="conditional">Conditional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Shipping Option</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

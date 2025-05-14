"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import type { Product } from "@/types"
import { useEffect, useState } from "react"

interface EditProductModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  onUpdateProduct: (id: string, product: Partial<Product>) => void
}

export function EditProductModal({ open, onOpenChange, product, onUpdateProduct }: EditProductModalProps) {
  const [productForm, setProductForm] = useState<Partial<Product>>({
    title: "",
    description: "",
    price: 0,
    inventory: 0,
    category: "",
    tags: [],
  })

  useEffect(() => {
    if (product) {
      setProductForm({
        title: product.title,
        description: product.description,
        price: product.price,
        inventory: product.inventory,
        category: product.category,
        tags: product.tags,
      })
    }
  }, [product])

  const saveProductChanges = () => {
    if (!product) return

    onUpdateProduct(product.id, {
      ...productForm,
      updatedAt: new Date(),
    })

    onOpenChange(false)

    toast({
      title: "Product Updated",
      description: `${productForm.title} has been updated successfully.`,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>Update the product details.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-title" className="text-right">
              Title
            </Label>
            <Input
              id="edit-title"
              value={productForm.title}
              onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-description" className="text-right">
              Description
            </Label>
            <Textarea
              id="edit-description"
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-price" className="text-right">
              Price
            </Label>
            <Input
              id="edit-price"
              type="number"
              value={productForm.price}
              onChange={(e) => setProductForm({ ...productForm, price: Number.parseFloat(e.target.value) })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-inventory" className="text-right">
              Inventory
            </Label>
            <Input
              id="edit-inventory"
              type="number"
              value={productForm.inventory}
              onChange={(e) => setProductForm({ ...productForm, inventory: Number.parseInt(e.target.value) })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-category" className="text-right">
              Category
            </Label>
            <Select
              value={productForm.category}
              onValueChange={(value) => setProductForm({ ...productForm, category: value })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tinctures">Tinctures</SelectItem>
                <SelectItem value="Capsules">Capsules</SelectItem>
                <SelectItem value="Teas">Teas</SelectItem>
                <SelectItem value="Topicals">Topicals</SelectItem>
                <SelectItem value="Extracts">Extracts</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-tags" className="text-right">
              Tags
            </Label>
            <Input
              id="edit-tags"
              placeholder="Comma separated tags"
              value={productForm.tags?.join(",")}
              onChange={(e) => setProductForm({ ...productForm, tags: e.target.value.split(",") })}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={saveProductChanges}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import type { Product } from "@/types";

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProduct: (product: Product) => void;
}

export function AddProductModal({
  open,
  onOpenChange,
  onAddProduct,
}: AddProductModalProps) {
  const [productForm, setProductForm] = useState<Partial<Product>>({
    title: "",
    description: "",
    price: 0,
    inventory: 0,
    category: "",
    tags: [],
    barcode: "",
  });

  const handleAddProduct = async () => {
    const productData = {
      title: productForm.title,
      description: productForm.description,
      price: productForm.price,
      inventory: productForm.inventory,
      category: productForm.category,
      tags: productForm.tags || [],
      barcode: productForm.barcode || "",
    };

    try {
      await onAddProduct(productData); // Wait for the request to complete
      onOpenChange(false);
      resetForm();
      toast({
        title: "Product Added",
        description: `${productForm.title} has been added successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive", // Optional: Use a different toast style for errors
      });
    }
  };

  const resetForm = () => {
    setProductForm({
      title: "",
      description: "",
      price: 0,
      inventory: 0,
      category: "",
      tags: [],
      barcode: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new product to your inventory.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={productForm.title}
              onChange={(e) =>
                setProductForm({ ...productForm, title: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={productForm.description}
              onChange={(e) =>
                setProductForm({ ...productForm, description: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price
            </Label>
            <Input
              id="price"
              type="number"
              value={productForm.price}
              onChange={(e) =>
                setProductForm({
                  ...productForm,
                  price: Number.parseFloat(e.target.value),
                })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="inventory" className="text-right">
              Inventory
            </Label>
            <Input
              id="inventory"
              type="number"
              value={productForm.inventory}
              onChange={(e) =>
                setProductForm({
                  ...productForm,
                  inventory: Number.parseInt(e.target.value),
                })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select
              onValueChange={(value) =>
                setProductForm({ ...productForm, category: value })
              }
              defaultValue={productForm.category}
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
            <Label htmlFor="tags" className="text-right">
              Tags
            </Label>
            <Input
              id="tags"
              placeholder="Comma separated tags"
              value={productForm.tags?.join(",")}
              onChange={(e) =>
                setProductForm({
                  ...productForm,
                  tags: e.target.value.split(","),
                })
              }
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddProduct}>Add Product</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

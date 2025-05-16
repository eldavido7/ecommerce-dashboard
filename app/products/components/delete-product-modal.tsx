"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import type { Product, Order } from "@/types";

interface DeleteProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  orders: Order[];
  onDeleteProduct: (id: string) => void;
}

export function DeleteProductModal({
  open,
  onOpenChange,
  product,
  orders,
  onDeleteProduct,
}: DeleteProductModalProps) {
  const confirmDeleteProduct = async () => {
    if (!product) return;

    // Check if product is used in any orders
    const productInOrders = orders.some((order) =>
      order.items.some((item) => item.title.includes(product.title))
    );

    if (productInOrders) {
      toast({
        title: "Cannot Delete Product",
        description: "This product is used in orders and cannot be deleted.",
        variant: "destructive",
      });
      onOpenChange(false);
      return;
    }

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete product");

      onDeleteProduct(product.id);
      toast({
        title: "Product Deleted",
        description: `${product.title} has been deleted.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "There was a problem deleting the product.",
        variant: "destructive",
      });
    } finally {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Confirm Deletion
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this product? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={confirmDeleteProduct}>
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

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
import { useEffect, useRef, useState } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import Image from "next/image";
interface EditProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onUpdateProduct: (id: string, product: Partial<Product>) => void;
}

export function EditProductModal({
  open,
  onOpenChange,
  product,
  onUpdateProduct,
}: EditProductModalProps) {
  const [productForm, setProductForm] = useState<Partial<Product>>({
    title: "",
    description: "",
    price: 0,
    inventory: 0,
    category: "",
    tags: [],
    barcode: "",
    imageUrl: "",
    imagePublicId: "",
  });

  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setProductForm({
        title: product.title,
        description: product.description,
        price: product.price,
        inventory: product.inventory,
        category: product.category,
        tags: product.tags,
        barcode: product.barcode,
        imageUrl: product.imageUrl,
        imagePublicId: product.imagePublicId,
      });
      // Show preview of the existing image
      setPreviewImage(product.imageUrl || "");
    }
  }, [product]);

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const { imageUrl, imagePublicId } = await response.json();

      setProductForm((prev) => ({
        ...prev,
        imageUrl,
        imagePublicId,
      }));

      setPreviewImage(imageUrl);

      toast({
        title: "Image uploaded",
        description: "Product image has been uploaded successfully.",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const removeImage = () => {
    setProductForm({
      ...productForm,
      imageUrl: "",
      imagePublicId: "",
    });
    setPreviewImage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const saveProductChanges = async () => {
    if (!product) return;

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productForm),
      });

      if (!res.ok) throw new Error("Failed to update product");

      const updatedProduct: Product = await res.json();
      onUpdateProduct(product.id, updatedProduct);
      onOpenChange(false);

      toast({
        title: "Product Updated",
        description: `${updatedProduct.title} has been updated successfully.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "There was a problem updating the product.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>Update the product details.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Image Upload Section */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right mt-2">Product Image</Label>
            <div className="col-span-3 space-y-2">
              {previewImage ? (
                <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                  <Image
                    src={previewImage}
                    alt="Product preview"
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                  <button
                    title="remove image"
                    type="button"
                    onClick={removeImage}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    disabled={isUploading}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div
                  className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  ) : (
                    <>
                      <ImageIcon className="w-6 h-6 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-500 text-center px-2">
                        Click to upload
                      </span>
                    </>
                  )}
                </div>
              )}

              <input
                title="Product Image"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-fit"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    {previewImage ? "Change Image" : "Upload Image"}
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-500">
                Optional. Max file size: 5MB. Supported formats: JPG, PNG, GIF,
                WebP
              </p>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-title" className="text-right">
              Title
            </Label>
            <Input
              id="edit-title"
              value={productForm.title}
              onChange={(e) =>
                setProductForm({ ...productForm, title: e.target.value })
              }
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
              onChange={(e) =>
                setProductForm({ ...productForm, description: e.target.value })
              }
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
            <Label htmlFor="edit-inventory" className="text-right">
              Inventory
            </Label>
            <Input
              id="edit-inventory"
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
            <Label htmlFor="edit-category" className="text-right">
              Category
            </Label>
            <Select
              value={productForm.category}
              onValueChange={(value) =>
                setProductForm({ ...productForm, category: value })
              }
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
          <Button onClick={saveProductChanges}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

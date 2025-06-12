"use client";

import { useState, useRef } from "react";
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
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import Image from "next/image";
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
    imageUrl: "",
    imagePublicId: "",
  });

  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      setProductForm({
        ...productForm,
        imageUrl,
        imagePublicId,
      });

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

  const handleAddProduct = async () => {
    // Basic validation
    if (
      !productForm.title ||
      !productForm.description ||
      !productForm.category
    ) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if ((productForm.price ?? 0) <= 0) {
      toast({
        title: "Invalid price",
        description: "Price must be greater than 0.",
        variant: "destructive",
      });
      return;
    }

    const productData = {
      title: productForm.title,
      description: productForm.description,
      price: productForm.price,
      inventory: productForm.inventory,
      category: productForm.category,
      tags: productForm.tags || [],
      barcode: productForm.barcode || "",
      imageUrl: productForm.imageUrl || "",
      imagePublicId: productForm.imagePublicId || "",
    };

    try {
      await onAddProduct(productData);
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
        variant: "destructive",
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
      imageUrl: "",
      imagePublicId: "",
    });
    setPreviewImage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
            <Label htmlFor="title" className="text-right">
              Title *
            </Label>
            <Input
              id="title"
              value={productForm.title}
              onChange={(e) =>
                setProductForm({ ...productForm, title: e.target.value })
              }
              className="col-span-3"
              placeholder="Enter product title"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description *
            </Label>
            <Textarea
              id="description"
              value={productForm.description}
              onChange={(e) =>
                setProductForm({ ...productForm, description: e.target.value })
              }
              className="col-span-3"
              placeholder="Enter product description"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price (₦) *
            </Label>
            <Input
              id="price"
              type="number"
              min="1"
              value={productForm.price}
              onChange={(e) =>
                setProductForm({
                  ...productForm,
                  price: Number.parseFloat(e.target.value) || 0,
                })
              }
              className="col-span-3"
              placeholder="0"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="inventory" className="text-right">
              Inventory
            </Label>
            <Input
              id="inventory"
              type="number"
              min="0"
              value={productForm.inventory}
              onChange={(e) =>
                setProductForm({
                  ...productForm,
                  inventory: Number.parseInt(e.target.value) || 0,
                })
              }
              className="col-span-3"
              placeholder="0"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category *
            </Label>
            <Select
              onValueChange={(value) =>
                setProductForm({ ...productForm, category: value })
              }
              value={productForm.category}
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
              value={productForm.tags?.join(",") || ""}
              onChange={(e) =>
                setProductForm({
                  ...productForm,
                  tags: e.target.value
                    ? e.target.value.split(",").map((tag) => tag.trim())
                    : [],
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
          <Button onClick={handleAddProduct} disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Add Product"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

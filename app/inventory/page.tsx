"use client";

import { useState } from "react";
import { useStore } from "@/store/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, Edit, Search } from "lucide-react";
import type { Product } from "@/types";

export default function InventoryPage() {
  const { products, updateProduct } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [updatedInventory, setUpdatedInventory] = useState<
    Record<string, number>
  >({});

  // Get all variants from all products
  const allVariants = products.flatMap((product) =>
    product.variants.map((variant) => ({
      ...variant,
      productId: product.id,
      productTitle: product.title,
      productThumbnail: product.thumbnail,
    }))
  );

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter
      ? product.category === categoryFilter
      : true;

    return matchesSearch && matchesCategory;
  });

  const filteredVariants = allVariants.filter((variant) => {
    const product = products.find((p) => p.id === variant.productId);
    if (!product) return false;

    const matchesSearch =
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      variant.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      variant.sku.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter
      ? product.category === categoryFilter
      : true;

    return matchesSearch && matchesCategory;
  });

  const handleUpdateInventory = () => {
    if (!selectedProduct) return;

    // Update product inventory (sum of all variants)
    const totalInventory = selectedProduct.variants.reduce((sum, variant) => {
      const updatedVariantInventory =
        updatedInventory[variant.id] !== undefined
          ? updatedInventory[variant.id]
          : variant.inventory;
      return sum + updatedVariantInventory;
    }, 0);

    // Update product and its variants
    updateProduct(selectedProduct.id, {
      inventory: totalInventory,
      variants: selectedProduct.variants.map((variant) => ({
        ...variant,
        inventory:
          updatedInventory[variant.id] !== undefined
            ? updatedInventory[variant.id]
            : variant.inventory,
      })),
    });

    setIsUpdateDialogOpen(false);
    setUpdatedInventory({});
  };

  const handleEditInventory = (product: Product) => {
    setSelectedProduct(product);

    // Initialize updatedInventory with current values
    const initialInventory: Record<string, number> = {};
    product.variants.forEach((variant) => {
      initialInventory[variant.id] = variant.inventory;
    });

    setUpdatedInventory(initialInventory);
    setIsUpdateDialogOpen(true);
  };

  // Get unique categories
  const categories = Array.from(
    new Set(products.map((product) => product.category))
  );

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
      </div>

      <div className="flex items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search inventory..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-2">
              Categories
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setCategoryFilter(null)}>
              All Categories
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {categories.map((category) => (
              <DropdownMenuItem
                key={category}
                onClick={() => setCategoryFilter(category)}
              >
                {category}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="variants">Variants</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Inventory</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {product.title}
                    </TableCell>
                    <TableCell>
                      {product.variants.length > 0
                        ? `${product.variants.length} variants`
                        : "No variants"}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          product.inventory < 10
                            ? "bg-red-100 text-red-800"
                            : product.inventory < 30
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {product.inventory}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleEditInventory(product)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit inventory</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="variants" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Variant</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Inventory</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVariants.map((variant) => (
                  <TableRow key={variant.id}>
                    <TableCell>{variant.productTitle}</TableCell>
                    <TableCell className="font-medium">
                      {variant.title}
                    </TableCell>
                    <TableCell>{variant.sku}</TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          variant.inventory < 10
                            ? "bg-red-100 text-red-800"
                            : variant.inventory < 30
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {variant.inventory}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Update Inventory</DialogTitle>
            <DialogDescription>
              {selectedProduct && (
                <span>Update inventory for {selectedProduct.title}</span>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4 py-4">
              <Card>
                <CardHeader>
                  <CardTitle>Variants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedProduct.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{variant.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {variant.sku}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const currentValue =
                              updatedInventory[variant.id] !== undefined
                                ? updatedInventory[variant.id]
                                : variant.inventory;
                            if (currentValue > 0) {
                              setUpdatedInventory({
                                ...updatedInventory,
                                [variant.id]: currentValue - 1,
                              });
                            }
                          }}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          className="w-20 text-center"
                          value={
                            updatedInventory[variant.id] !== undefined
                              ? updatedInventory[variant.id]
                              : variant.inventory
                          }
                          onChange={(e) => {
                            const value = Number.parseInt(e.target.value);
                            if (!isNaN(value) && value >= 0) {
                              setUpdatedInventory({
                                ...updatedInventory,
                                [variant.id]: value,
                              });
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const currentValue =
                              updatedInventory[variant.id] !== undefined
                                ? updatedInventory[variant.id]
                                : variant.inventory;
                            setUpdatedInventory({
                              ...updatedInventory,
                              [variant.id]: currentValue + 1,
                            });
                          }}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUpdateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateInventory}>Update Inventory</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

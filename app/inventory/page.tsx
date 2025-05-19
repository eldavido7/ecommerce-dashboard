"use client";

import { useEffect, useState } from "react";
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
import { Label } from "@/components/ui/label";
import { ChevronDown, Edit, Search } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import type { Product } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@tremor/react";
import { CardContent, CardHeader } from "@/components/ui/card";

export default function InventoryPage() {
  const { products, updateProduct, fetchProducts } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [newInventory, setNewInventory] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [scannedBarcode, setScannedBarcode] = useState(""); // New state for barcode input

  // Fetch products if not loaded
  useEffect(() => {
    if (products.length === 0) {
      fetchProducts()
        .then(() => {
          console.log("[FETCHED_PRODUCTS]", useStore.getState().products);
          setLoading(false);
        })
        .catch((err) => {
          console.error("[FETCH_PRODUCTS_ERROR]", err);
          toast({
            title: "Error",
            description: "Failed to fetch products.",
            variant: "destructive",
          });
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [fetchProducts, products.length]);

  // Handle barcode scanning
  useEffect(() => {
    const handleBarcodeScan = (e: KeyboardEvent) => {
      if (!isUpdateDialogOpen || !selectedProduct || e.key !== "Enter") return;
      if (scannedBarcode === selectedProduct.barcode) {
        setNewInventory((prev) => prev + 1);
        setScannedBarcode(""); // Clear barcode input after scan
        toast({
          title: "Barcode Scanned",
          description: `Inventory for ${selectedProduct.title} increased by 1.`,
        });
      } else {
        toast({
          title: "Invalid Barcode",
          description: `Scanned barcode does not match ${selectedProduct.title}.`,
          variant: "destructive",
        });
      }
    };

    if (isUpdateDialogOpen) {
      window.addEventListener("keypress", handleBarcodeScan);
    }

    return () => {
      window.removeEventListener("keypress", handleBarcodeScan);
    };
  }, [isUpdateDialogOpen, selectedProduct, scannedBarcode]);

  // Filter products by search and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter
      ? product.category === categoryFilter
      : true;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = Array.from(
    new Set(products.map((product) => product.category))
  );

  // Open edit modal
  const handleEditInventory = (product: Product) => {
    setSelectedProduct(product);
    setNewInventory(product.inventory);
    setIsUpdateDialogOpen(true);
  };

  // Update inventory
  const handleUpdateInventory = async () => {
    if (!selectedProduct || newInventory < 0) {
      setIsUpdateDialogOpen(false);
      return;
    }

    try {
      await updateProduct(selectedProduct.id, { inventory: newInventory });
      setIsUpdateDialogOpen(false);
      setSelectedProduct(null);
      setNewInventory(0);
      toast({
        title: "Inventory Updated",
        description: `Inventory for ${selectedProduct.title} updated to ${newInventory}.`,
      });
    } catch (err) {
      console.error("[UPDATE_INVENTORY]", err);
      toast({
        title: "Error",
        description: "Failed to update inventory.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-[300px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px] mb-2" />
            <Skeleton className="h-4 w-[300px]" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-full" />
            </div>

            <Skeleton className="h-24 w-full" />

            <div className="space-y-2">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="flex justify-end space-x-2">
              <Skeleton className="h-10 w-[100px]" />
              <Skeleton className="h-10 w-[150px]" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
      <p className="text-muted-foreground">Manage your product inventory</p>

      <div className="flex items-center space-x-2">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products by name..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {categoryFilter || "All Categories"}
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Inventory</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.title}</TableCell>
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

      {/* Edit Inventory Modal */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Inventory</DialogTitle>
            <DialogDescription>
              {selectedProduct && (
                <span>Update inventory for {selectedProduct.title}</span>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="barcode">Scan Barcode</Label>
                <Input
                  id="barcode"
                  value={scannedBarcode}
                  onChange={(e) => setScannedBarcode(e.target.value)}
                  placeholder="Scan or enter barcode"
                  autoFocus
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="inventory">Inventory</Label>
                <Input
                  id="inventory"
                  type="number"
                  min="0"
                  value={newInventory}
                  onChange={(e) => {
                    const value = Number.parseInt(e.target.value);
                    setNewInventory(isNaN(value) ? 0 : value);
                  }}
                />
              </div>
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

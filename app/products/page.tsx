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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Barcode,
  ChevronDown,
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  Trash,
} from "lucide-react";
import type { Product } from "@/types";
import { AddProductModal } from "./components/add-product-modal";
import { EditProductModal } from "./components/edit-product-modal";
import { DeleteProductModal } from "./components/delete-product-modal";
import { BarcodeModal } from "./components/barcode-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@tremor/react";
import { CardContent, CardHeader } from "@/components/ui/card";

export default function ProductsPage() {
  const {
    products,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    orders,
  } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBarcodeDialogOpen, setIsBarcodeDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const products = useStore.getState().products;
    if (!products || products.length === 0) {
      useStore
        .getState()
        .fetchProducts()
        .then(() => {
          const updatedProducts = useStore.getState().products;
          console.log("[FETCHED_PRODUCTS]", updatedProducts);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

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

  const filteredProducts = products.filter(
    (product) =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const uniqueCategories = Array.from(
    new Set(products.map((product) => product.category))
  );

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="flex items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
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
            <DropdownMenuItem onClick={() => setSearchQuery("")}>
              All Categories
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {uniqueCategories.map((category) => (
              <DropdownMenuItem
                key={category}
                onClick={() => setSearchQuery(category)}
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
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Inventory</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.title}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell className="text-right">
                  ₦{product.price.toFixed(2)}
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => handleEditProduct(product)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteProduct(product)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsBarcodeDialogOpen(true);
                        }}
                      >
                        <Barcode className="mr-2 h-4 w-4" />
                        View Barcode
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modals */}
      <AddProductModal
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddProduct={addProduct}
      />

      <EditProductModal
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        product={selectedProduct}
        onUpdateProduct={updateProduct}
      />

      <DeleteProductModal
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        product={selectedProduct}
        orders={orders}
        onDeleteProduct={deleteProduct}
      />

      <BarcodeModal
        open={isBarcodeDialogOpen}
        onOpenChange={setIsBarcodeDialogOpen}
        product={selectedProduct}
        onUpdateProduct={updateProduct}
      />
    </div>
  );
}

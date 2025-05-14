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
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Edit,
  MoreHorizontal,
  Percent,
  Plus,
  Search,
  Tag,
  Trash,
} from "lucide-react";
import type { Discount } from "@/types";
import { format } from "date-fns";
import { AddDiscountModal } from "./components/add-discount-modal";
import { EditDiscountModal } from "./components/edit-discount-modal";
import { DeleteDiscountModal } from "./components/delete-discount-modal";
import { AddGiftCardModal } from "./components/add-gift-card-modal";

export default function DiscountsPage() {
  const {
    discounts,
    giftCards,
    addDiscount,
    updateDiscount,
    deleteDiscount,
    addGiftCard,
    updateGiftCard,
    deleteGiftCard,
  } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("discounts");
  const [isAddDiscountOpen, setIsAddDiscountOpen] = useState(false);
  const [isAddGiftCardOpen, setIsAddGiftCardOpen] = useState(false);
  const [isEditDiscountOpen, setIsEditDiscountOpen] = useState(false);
  const [isDeleteDiscountOpen, setIsDeleteDiscountOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(
    null
  );

  const filteredDiscounts = discounts.filter(
    (discount) =>
      discount.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (discount.description &&
        discount.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredGiftCards = giftCards.filter((giftCard) =>
    giftCard.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditDiscount = (discount: Discount) => {
    setSelectedDiscount(discount);
    setIsEditDiscountOpen(true);
  };

  const handleDeleteDiscount = (discount: Discount) => {
    setSelectedDiscount(discount);
    setIsDeleteDiscountOpen(true);
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Discounts & Gift Cards
        </h2>
        {activeTab === "discounts" ? (
          <Button onClick={() => setIsAddDiscountOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Discount
          </Button>
        ) : (
          <Button onClick={() => setIsAddGiftCardOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Gift Card
          </Button>
        )}
      </div>

      <Tabs defaultValue="discounts" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="discounts">Discounts</TabsTrigger>
          <TabsTrigger value="giftcards">Gift Cards</TabsTrigger>
        </TabsList>

        <div className="flex items-center mt-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={
                activeTab === "discounts"
                  ? "Search discounts..."
                  : "Search gift cards..."
              }
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="discounts" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDiscounts.map((discount) => (
                  <TableRow key={discount.id}>
                    <TableCell className="font-medium">
                      {discount.code}
                    </TableCell>
                    <TableCell>
                      {discount.type === "percentage" ? (
                        <span className="flex items-center">
                          <Percent className="h-4 w-4 mr-1" />
                          Percentage
                        </span>
                      ) : discount.type === "fixed_amount" ? (
                        <span className="flex items-center">
                          <Tag className="h-4 w-4 mr-1" />
                          Fixed Amount
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Tag className="h-4 w-4 mr-1" />
                          Free Shipping
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {discount.type === "percentage"
                        ? `${discount.value}%`
                        : discount.type === "fixed_amount"
                        ? `₦${discount.value.toFixed(2)}`
                        : "Free"}
                    </TableCell>
                    <TableCell>
                      {discount.usageCount} /{" "}
                      {discount.usageLimit ? discount.usageLimit : "∞"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          discount.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {discount.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <div>
                          Start: {format(discount.startsAt, "MMM dd, yyyy")}
                        </div>
                        {discount.endsAt && (
                          <div>
                            End: {format(discount.endsAt, "MMM dd, yyyy")}
                          </div>
                        )}
                      </div>
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
                            onClick={() => handleEditDiscount(discount)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteDiscount(discount)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="giftcards" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGiftCards.map((giftCard) => (
                  <TableRow key={giftCard.id}>
                    <TableCell className="font-medium">
                      {giftCard.code}
                    </TableCell>
                    <TableCell>₦{giftCard.value.toFixed(2)}</TableCell>
                    <TableCell>₦{giftCard.balance.toFixed(2)}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          !giftCard.isDisabled
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {!giftCard.isDisabled ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {format(giftCard.createdAt, "MMM dd, yyyy")}
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
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AddDiscountModal
        open={isAddDiscountOpen}
        onOpenChange={setIsAddDiscountOpen}
        onAddDiscount={addDiscount}
      />

      <EditDiscountModal
        open={isEditDiscountOpen}
        onOpenChange={setIsEditDiscountOpen}
        discount={selectedDiscount}
        onUpdateDiscount={updateDiscount}
      />

      <DeleteDiscountModal
        open={isDeleteDiscountOpen}
        onOpenChange={setIsDeleteDiscountOpen}
        discount={selectedDiscount}
        onDeleteDiscount={deleteDiscount}
      />

      <AddGiftCardModal
        open={isAddGiftCardOpen}
        onOpenChange={setIsAddGiftCardOpen}
        onAddGiftCard={addGiftCard}
      />
    </div>
  );
}

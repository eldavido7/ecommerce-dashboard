"use client"

import { useState } from "react"
import { useStore } from "@/store/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Edit, MoreHorizontal, Percent, Plus, Search, Tag, Trash } from "lucide-react"
import type { Discount, GiftCard } from "@/types"
import { format } from "date-fns"

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
  } = useStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("discounts")
  const [isAddDiscountOpen, setIsAddDiscountOpen] = useState(false)
  const [isAddGiftCardOpen, setIsAddGiftCardOpen] = useState(false)
  const [newDiscount, setNewDiscount] = useState<Partial<Discount>>({
    code: "",
    description: "",
    type: "percentage",
    value: 0,
    usageLimit: undefined,
    usageCount: 0,
    startsAt: new Date(),
    endsAt: undefined,
    isActive: true,
    conditions: {
      minSubtotal: 0,
    },
  })
  const [newGiftCard, setNewGiftCard] = useState<Partial<GiftCard>>({
    code: "",
    value: 0,
    balance: 0,
    isDisabled: false,
  })

  const filteredDiscounts = discounts.filter(
    (discount) =>
      discount.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (discount.description && discount.description.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const filteredGiftCards = giftCards.filter((giftCard) =>
    giftCard.code.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddDiscount = () => {
    const discountToAdd = {
      ...newDiscount,
      id: `disc_${Math.random().toString(36).substring(2, 10)}`,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Discount

    addDiscount(discountToAdd)
    setIsAddDiscountOpen(false)
    setNewDiscount({
      code: "",
      description: "",
      type: "percentage",
      value: 0,
      usageLimit: undefined,
      usageCount: 0,
      startsAt: new Date(),
      endsAt: undefined,
      isActive: true,
      conditions: {
        minSubtotal: 0,
      },
    })
  }

  const handleAddGiftCard = () => {
    const giftCardToAdd = {
      ...newGiftCard,
      id: `gift_${Math.random().toString(36).substring(2, 10)}`,
      balance: newGiftCard.value,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as GiftCard

    addGiftCard(giftCardToAdd)
    setIsAddGiftCardOpen(false)
    setNewGiftCard({
      code: "",
      value: 0,
      balance: 0,
      isDisabled: false,
    })
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Discounts & Gift Cards</h2>
        {activeTab === "discounts" ? (
          <Dialog open={isAddDiscountOpen} onOpenChange={setIsAddDiscountOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Discount
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Discount</DialogTitle>
                <DialogDescription>Create a new discount code for your customers.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="code" className="text-right">
                    Code
                  </Label>
                  <Input
                    id="code"
                    value={newDiscount.code}
                    onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })}
                    className="col-span-3"
                    placeholder="SUMMER20"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={newDiscount.description}
                    onChange={(e) => setNewDiscount({ ...newDiscount, description: e.target.value })}
                    className="col-span-3"
                    placeholder="Summer sale 20% off"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Type
                  </Label>
                  <Select
                    onValueChange={(value: "percentage" | "fixed_amount" | "free_shipping") =>
                      setNewDiscount({ ...newDiscount, type: value })
                    }
                    defaultValue={newDiscount.type}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select discount type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                      <SelectItem value="free_shipping">Free Shipping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="value" className="text-right">
                    Value
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    value={newDiscount.value}
                    onChange={(e) => setNewDiscount({ ...newDiscount, value: Number.parseFloat(e.target.value) })}
                    className="col-span-3"
                    placeholder={newDiscount.type === "percentage" ? "20" : "10.00"}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="minSubtotal" className="text-right">
                    Min. Subtotal
                  </Label>
                  <Input
                    id="minSubtotal"
                    type="number"
                    value={newDiscount.conditions?.minSubtotal}
                    onChange={(e) =>
                      setNewDiscount({
                        ...newDiscount,
                        conditions: {
                          ...newDiscount.conditions,
                          minSubtotal: Number.parseFloat(e.target.value),
                        },
                      })
                    }
                    className="col-span-3"
                    placeholder="0.00"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="usageLimit" className="text-right">
                    Usage Limit
                  </Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    value={newDiscount.usageLimit}
                    onChange={(e) =>
                      setNewDiscount({
                        ...newDiscount,
                        usageLimit: e.target.value ? Number.parseInt(e.target.value) : undefined,
                      })
                    }
                    className="col-span-3"
                    placeholder="Unlimited"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Active</Label>
                  <div className="flex items-center space-x-2 col-span-3">
                    <Switch
                      checked={newDiscount.isActive}
                      onCheckedChange={(checked) => setNewDiscount({ ...newDiscount, isActive: checked })}
                    />
                    <Label>{newDiscount.isActive ? "Active" : "Inactive"}</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDiscountOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddDiscount}>Add Discount</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <Dialog open={isAddGiftCardOpen} onOpenChange={setIsAddGiftCardOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Gift Card
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Gift Card</DialogTitle>
                <DialogDescription>Create a new gift card for your customers.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="code" className="text-right">
                    Code
                  </Label>
                  <Input
                    id="code"
                    value={newGiftCard.code}
                    onChange={(e) => setNewGiftCard({ ...newGiftCard, code: e.target.value.toUpperCase() })}
                    className="col-span-3"
                    placeholder="GIFT-1234-5678"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="value" className="text-right">
                    Value
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    value={newGiftCard.value}
                    onChange={(e) =>
                      setNewGiftCard({
                        ...newGiftCard,
                        value: Number.parseFloat(e.target.value),
                        balance: Number.parseFloat(e.target.value),
                      })
                    }
                    className="col-span-3"
                    placeholder="50.00"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Active</Label>
                  <div className="flex items-center space-x-2 col-span-3">
                    <Switch
                      checked={!newGiftCard.isDisabled}
                      onCheckedChange={(checked) => setNewGiftCard({ ...newGiftCard, isDisabled: !checked })}
                    />
                    <Label>{!newGiftCard.isDisabled ? "Active" : "Inactive"}</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddGiftCardOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddGiftCard}>Add Gift Card</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
              placeholder={activeTab === "discounts" ? "Search discounts..." : "Search gift cards..."}
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
                    <TableCell className="font-medium">{discount.code}</TableCell>
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
                      {discount.usageCount} / {discount.usageLimit ? discount.usageLimit : "∞"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          discount.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {discount.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <div>Start: {format(discount.startsAt, "MMM dd, yyyy")}</div>
                        {discount.endsAt && <div>End: {format(discount.endsAt, "MMM dd, yyyy")}</div>}
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
                    <TableCell className="font-medium">{giftCard.code}</TableCell>
                    <TableCell>₦{giftCard.value.toFixed(2)}</TableCell>
                    <TableCell>₦{giftCard.balance.toFixed(2)}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          !giftCard.isDisabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {!giftCard.isDisabled ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>{format(giftCard.createdAt, "MMM dd, yyyy")}</TableCell>
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
    </div>
  )
}

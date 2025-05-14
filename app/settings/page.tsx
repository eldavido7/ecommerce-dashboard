"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit, MoreHorizontal, Plus, Trash, User } from "lucide-react"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isAddShippingOpen, setIsAddShippingOpen] = useState(false)
  const [isEditShippingOpen, setIsEditShippingOpen] = useState(false)
  const [currentShipping, setCurrentShipping] = useState<any>(null)
  const [shippingOptions, setShippingOptions] = useState([
    {
      id: "ship_1",
      name: "Standard Shipping",
      price: 1500.0,
      deliveryTime: "3-5 business days",
      status: "active",
    },
    {
      id: "ship_2",
      name: "Express Shipping",
      price: 1500.0,
      deliveryTime: "1-2 business days",
      status: "active",
    },
    {
      id: "ship_3",
      name: "Free Shipping",
      price: 0.0,
      deliveryTime: "5-7 business days",
      status: "conditional",
    },
  ])

  const addShippingOption = (option: any) => {
    setShippingOptions([...shippingOptions, { ...option, id: `ship_${Date.now()}` }])
    setIsAddShippingOpen(false)
  }

  const editShippingOption = (option: any) => {
    setShippingOptions(shippingOptions.map((item) => (item.id === option.id ? option : item)))
    setIsEditShippingOpen(false)
    setCurrentShipping(null)
  }

  const deleteShippingOption = (id: string) => {
    setShippingOptions(shippingOptions.filter((item) => item.id !== id))
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>

      <Tabs defaultValue="general" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your store's general settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="store-name">Store Name</Label>
                <Input id="store-name" defaultValue="Halamin Herbal" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-email">Store Email</Label>
                <Input id="store-email" type="email" defaultValue="info@halaminherbal.com" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="store" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>Manage your store's information and appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="store-description">Store Description</Label>
                <Textarea
                  id="store-description"
                  defaultValue="Halamin Herbal is your one-stop shop for high-quality products at affordable prices."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-address">Store Address</Label>
                <Textarea id="store-address" defaultValue="123 Commerce St, Suite 100, Anytown, CA 12345" rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-phone">Store Phone</Label>
                <Input id="store-phone" defaultValue="(555) 123-4567" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="shipping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Options</CardTitle>
              <CardDescription>Manage your store's shipping options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Delivery Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shippingOptions.map((option) => (
                      <TableRow key={option.id}>
                        <TableCell className="font-medium">{option.name}</TableCell>
                        <TableCell>₦{option.price.toFixed(2)}</TableCell>
                        <TableCell>{option.deliveryTime}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              option.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {option.status === "active" ? "Active" : "Conditional"}
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
                                onClick={() => {
                                  setCurrentShipping(option)
                                  setIsEditShippingOpen(true)
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => deleteShippingOption(option.id)}>
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
              <div className="mt-4">
                <Button onClick={() => setIsAddShippingOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Shipping Option
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* Add Shipping Option Dialog */}
          <Dialog open={isAddShippingOpen} onOpenChange={setIsAddShippingOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add Shipping Option</DialogTitle>
                <DialogDescription>Add a new shipping option to your store</DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  addShippingOption({
                    name: formData.get("name"),
                    price: Number.parseFloat(formData.get("price") as string),
                    deliveryTime: formData.get("deliveryTime"),
                    status: formData.get("status"),
                  })
                }}
              >
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="shipping-name" className="text-right">
                      Name
                    </Label>
                    <Input id="shipping-name" name="name" className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="shipping-price" className="text-right">
                      Price (₦)
                    </Label>
                    <Input
                      id="shipping-price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="shipping-delivery" className="text-right">
                      Delivery Time
                    </Label>
                    <Input id="shipping-delivery" name="deliveryTime" className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="shipping-status" className="text-right">
                      Status
                    </Label>
                    <Select name="status" defaultValue="active">
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="conditional">Conditional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setIsAddShippingOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Shipping Option</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Shipping Option Dialog */}
          <Dialog open={isEditShippingOpen} onOpenChange={setIsEditShippingOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit Shipping Option</DialogTitle>
                <DialogDescription>Update shipping option details</DialogDescription>
              </DialogHeader>
              {currentShipping && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    editShippingOption({
                      id: currentShipping.id,
                      name: formData.get("name"),
                      price: Number.parseFloat(formData.get("price") as string),
                      deliveryTime: formData.get("deliveryTime"),
                      status: formData.get("status"),
                    })
                  }}
                >
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-shipping-name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="edit-shipping-name"
                        name="name"
                        className="col-span-3"
                        defaultValue={currentShipping.name}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-shipping-price" className="text-right">
                        Price (₦)
                      </Label>
                      <Input
                        id="edit-shipping-price"
                        name="price"
                        type="number"
                        step="0.01"
                        min="0"
                        className="col-span-3"
                        defaultValue={currentShipping.price}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-shipping-delivery" className="text-right">
                        Delivery Time
                      </Label>
                      <Input
                        id="edit-shipping-delivery"
                        name="deliveryTime"
                        className="col-span-3"
                        defaultValue={currentShipping.deliveryTime}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-shipping-status" className="text-right">
                        Status
                      </Label>
                      <Select name="status" defaultValue={currentShipping.status}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="conditional">Conditional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setIsEditShippingOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save Changes</Button>
                  </DialogFooter>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Users</CardTitle>
                <CardDescription>Manage users that can login</CardDescription>
              </div>
              <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>Add a new user to your store</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input id="name" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">
                        Email
                      </Label>
                      <Input id="email" type="email" className="col-span-3" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setIsAddUserOpen(false)}>Add User</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          John Doe
                        </div>
                      </TableCell>
                      <TableCell>john.doe@example.com</TableCell>
                      
                      <TableCell>Just now</TableCell>
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
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          Jane Smith
                        </div>
                      </TableCell>
                      <TableCell>jane.smith@example.com</TableCell>
                     
                      <TableCell>2 hours ago</TableCell>
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
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          Robert Johnson
                        </div>
                      </TableCell>
                      <TableCell>robert.johnson@example.com</TableCell>
                      
                      <TableCell>1 day ago</TableCell>
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
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

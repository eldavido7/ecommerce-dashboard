"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Edit, MoreHorizontal, Plus, Trash, User } from "lucide-react";
import { AddShippingOptionModal } from "./components/add-shipping-option-modal";
import { EditShippingOptionModal } from "./components/edit-shipping-option-modal";
import { AddUserModal } from "./components/add-user-modal";
import { EditUserModal } from "./components/edit-user-modal";
import { DeleteUserModal } from "./components/delete-user-modal";
import { useToast } from "@/components/ui/use-toast";

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  deliveryTime: string;
  status: "active" | "conditional";
}

interface UserData {
  id: string;
  name: string;
  email: string;
  lastActive: string;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");

  // Shipping state
  const [isAddShippingOpen, setIsAddShippingOpen] = useState(false);
  const [isEditShippingOpen, setIsEditShippingOpen] = useState(false);
  const [currentShipping, setCurrentShipping] = useState<ShippingOption | null>(
    null
  );
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([
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
  ]);

  // User state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [users, setUsers] = useState<UserData[]>([
    {
      id: "user_1",
      name: "John Doe",
      email: "john.doe@example.com",
      lastActive: "Just now",
    },
    {
      id: "user_2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      lastActive: "2 hours ago",
    },
    {
      id: "user_3",
      name: "Robert Johnson",
      email: "robert.johnson@example.com",
      lastActive: "1 day ago",
    },
  ]);

  // Shipping handlers
  const addShippingOption = (option: Omit<ShippingOption, "id">) => {
    const newOption = {
      ...option,
      id: `ship_${Date.now()}`,
    };
    setShippingOptions([...shippingOptions, newOption]);
    setIsAddShippingOpen(false);
    toast({
      title: "Shipping option added",
      description: "The shipping option has been added successfully.",
    });
  };

  const editShippingOption = (option: ShippingOption) => {
    setShippingOptions(
      shippingOptions.map((item) => (item.id === option.id ? option : item))
    );
    setIsEditShippingOpen(false);
    setCurrentShipping(null);
    toast({
      title: "Shipping option updated",
      description: "The shipping option has been updated successfully.",
    });
  };

  const deleteShippingOption = (id: string) => {
    setShippingOptions(shippingOptions.filter((item) => item.id !== id));
    toast({
      title: "Shipping option deleted",
      description: "The shipping option has been deleted successfully.",
    });
  };

  // User handlers
  const addUser = (userData: Omit<UserData, "id" | "lastActive">) => {
    const newUser = {
      ...userData,
      id: `user_${Date.now()}`,
      lastActive: "Just now",
    };
    setUsers([...users, newUser]);
    setIsAddUserOpen(false);
  };

  const editUser = (userData: UserData) => {
    setUsers(users.map((user) => (user.id === userData.id ? userData : user)));
    setIsEditUserOpen(false);
    setCurrentUser(null);
  };

  const deleteUser = (userId: string) => {
    setUsers(users.filter((user) => user.id !== userId));
    setCurrentUser(null);
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>

      <Tabs defaultValue="shipping" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="shipping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Options</CardTitle>
              <CardDescription>
                Manage your store's shipping options
              </CardDescription>
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
                        <TableCell className="font-medium">
                          {option.name}
                        </TableCell>
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
                            {option.status === "active"
                              ? "Active"
                              : "Conditional"}
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
                                  setCurrentShipping(option);
                                  setIsEditShippingOpen(true);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => deleteShippingOption(option.id)}
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
              <div className="mt-4">
                <Button onClick={() => setIsAddShippingOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Shipping Option
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Modals */}
          <AddShippingOptionModal
            open={isAddShippingOpen}
            onOpenChange={setIsAddShippingOpen}
            onAddShippingOption={addShippingOption}
          />

          <EditShippingOptionModal
            open={isEditShippingOpen}
            onOpenChange={setIsEditShippingOpen}
            shippingOption={currentShipping}
            onEditShippingOption={editShippingOption}
          />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Users</CardTitle>
                <CardDescription>Manage users that can login</CardDescription>
              </div>
              <Button onClick={() => setIsAddUserOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
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
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <User className="mr-2 h-4 w-4" />
                            {user.name}
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>

                        <TableCell>{user.lastActive}</TableCell>
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
                                  setCurrentUser(user);
                                  setIsEditUserOpen(true);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setCurrentUser(user);
                                  setIsDeleteUserOpen(true);
                                }}
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
            </CardContent>
          </Card>

          {/* User Modals */}
          <AddUserModal
            open={isAddUserOpen}
            onOpenChange={setIsAddUserOpen}
            onAddUser={addUser}
          />

          <EditUserModal
            open={isEditUserOpen}
            onOpenChange={setIsEditUserOpen}
            user={currentUser}
            onEditUser={editUser}
          />

          <DeleteUserModal
            open={isDeleteUserOpen}
            onOpenChange={setIsDeleteUserOpen}
            user={currentUser}
            onDeleteUser={deleteUser}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

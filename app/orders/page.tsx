"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useStore } from "@/store/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { CreateOrderModal } from "./components/create-order-modal";
import { ViewOrderModal } from "./components/view-order-modal";
import { ConfirmStatusModal } from "./components/confirm-status-modal";
import {
  ChevronDown,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";
import type { Order } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrdersPage() {
  const { orders, updateOrderStatus, addOrder, deleteOrder } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [createOrderOpen, setCreateOrderOpen] = useState(false);
  const [viewOrderOpen, setViewOrderOpen] = useState(false);
  const [confirmStatusOpen, setConfirmStatusOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Filter orders based on search query and status filter
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const customer = order.customerDetails;
      const matchesSearch =
        searchQuery === "" ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer &&
          `${customer.firstName} ${customer.lastName}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (customer &&
          customer.email.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === null || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  useEffect(() => {
    const orders = useStore.getState().orders;
    if (!orders || orders.length === 0) {
      useStore
        .getState()
        .fetchOrders()
        .then(() => {
          const updatedOrders = useStore.getState().orders;
          console.log("[FETCHED_ORDERS]", updatedOrders);
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

  // Handle view order
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setViewOrderOpen(true);
  };

  // Handle update order status
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    const orderToUpdate = orders.find((o) => o.id === orderId);
    if (!orderToUpdate) return;

    const payload = {
      firstName: orderToUpdate.customerDetails.firstName,
      lastName: orderToUpdate.customerDetails.lastName,
      email: orderToUpdate.customerDetails.email,
      phone: orderToUpdate.customerDetails.phone,
      address: orderToUpdate.address.address,
      city: orderToUpdate.address.city,
      state: orderToUpdate.address.state,
      postalCode: orderToUpdate.address.postalCode,
      country: orderToUpdate.address.country,
      status: newStatus,
      items: orderToUpdate.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update order");

      toast({
        title: "Order Status Updated",
        description: `Order #${orderId} status has been updated to ${newStatus}`,
      });

      async function fetchOrders() {
        try {
          await useStore.getState().fetchOrders();
        } catch (err) {
          console.error("[FETCH_ORDERS]", err);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch orders.",
          });
        }
      }

      // ✅ Refresh orders to reflect updated status
      await fetchOrders();
    } catch (err) {
      console.error("[UPDATE_ORDER]", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update order status.",
      });
    }
  };

  // Open confirm status modal
  const openConfirmStatus = (order: Order, status: string) => {
    setSelectedOrder(order);
    setNewStatus(status);
    setConfirmStatusOpen(true);
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500";
      case "PROCESSING":
        return "bg-blue-500";
      case "SHIPPED":
        return "bg-purple-500";
      case "DELIVERED":
        return "bg-green-500";
      case "CANCELED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track customer orders
          </p>
        </div>
        <Button onClick={() => setCreateOrderOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Order
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>View and manage all customer orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Customer name or order ID..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  {statusFilter
                    ? `Status: ${statusFilter}`
                    : "Filter by Status"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                  All Orders
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("PENDING")}>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("PROCESSING")}>
                  Processing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("SHIPPED")}>
                  Shipped
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("DELIVERED")}>
                  Delivered
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("CANCELED")}>
                  Canceled
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>
                        {format(new Date(order.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {order.customerDetails
                          ? `${order.customerDetails.firstName} ${order.customerDetails.lastName}`
                          : "N/A"}
                      </TableCell>

                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        ₦
                        {order.items
                          ?.reduce((sum, item) => sum + item.subtotal, 0)
                          .toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleViewOrder(order)}
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {/* <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() =>
                                openConfirmStatus(order, "pending")
                              }
                              disabled={order.status === "pending"}
                            >
                              Mark as Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                openConfirmStatus(order, "processing")
                              }
                              disabled={order.status === "processing"}
                            >
                              Mark as Processing
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                openConfirmStatus(order, "shipped")
                              }
                              disabled={order.status === "shipped"}
                            >
                              Mark as Shipped
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                openConfirmStatus(order, "delivered")
                              }
                              disabled={order.status === "delivered"}
                            >
                              Mark as Delivered
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                openConfirmStatus(order, "canceled")
                              }
                              disabled={order.status === "canceled"}
                            >
                              Mark as Canceled
                            </DropdownMenuItem> */}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </CardFooter>
      </Card>

      {/* Create Order Modal */}
      <CreateOrderModal
        open={createOrderOpen}
        onOpenChange={setCreateOrderOpen}
        onAddOrder={addOrder}
      />

      {/* View Order Modal */}
      {selectedOrder && (
        <ViewOrderModal
          open={viewOrderOpen}
          onOpenChange={setViewOrderOpen}
          order={selectedOrder}
          onUpdateStatus={(orderId, status) =>
            handleUpdateStatus(orderId, status)
          }
        />
      )}
    </div>
  );
}

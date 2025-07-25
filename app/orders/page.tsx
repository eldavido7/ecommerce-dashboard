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
import { EditOrderModal } from "./components/edit-order-modal";
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
  const { orders, addOrder, updateOrder } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [createOrderOpen, setCreateOrderOpen] = useState(false);
  const [editOrderOpen, setEditOrderOpen] = useState(false);
  const [viewOrderOpen, setViewOrderOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter orders based on search query and status filter
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        searchQuery === "" ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${order.firstName} ${order.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        order.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === null || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

  // Handle edit order
  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setEditOrderOpen(true);
  };

  // Handle update order status
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    const orderToUpdate = orders.find((o) => o.id === orderId);
    if (!orderToUpdate) return;

    const payload = {
      firstName: orderToUpdate.firstName,
      lastName: orderToUpdate.lastName,
      email: orderToUpdate.email,
      phone: orderToUpdate.phone,
      address: orderToUpdate.address,
      city: orderToUpdate.city,
      state: orderToUpdate.state,
      postalCode: orderToUpdate.postalCode,
      country: orderToUpdate.country,
      status: newStatus,
      subtotal: orderToUpdate.subtotal,
      total: orderToUpdate.total,
      discountId: orderToUpdate.discountId ?? null,
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

      // ✅ Send email notification after successful status update
      try {
        console.log(
          "Sending email to:",
          orderToUpdate.email,
          "for order:",
          orderId
        );

        const emailRes = await fetch("/api/email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: orderToUpdate.email,
            firstName: orderToUpdate.firstName,
            lastName: orderToUpdate.lastName,
            orderId: orderId,
            status: newStatus,
            orderDetails: {
              items: orderToUpdate.items,
              discount: orderToUpdate.discount,
              address: orderToUpdate.address,
              city: orderToUpdate.city,
              state: orderToUpdate.state,
              postalCode: orderToUpdate.postalCode,
              country: orderToUpdate.country,
              shippingCost: orderToUpdate.shippingCost,
            },
          }),
        });

        const emailResult = await emailRes.json();

        if (!emailRes.ok) {
          console.error("Failed to send email notification:", emailResult);
          // Don't throw error here - we don't want email failure to affect the main flow
        } else {
          console.log("Email sent successfully:", emailResult);
        }
      } catch (emailError) {
        console.error("Email sending error:", emailError);
        // Email failure shouldn't break the status update flow
      }

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

      <Card className="border-0 md:border md:p-4">
        <div className="md:flex flex-1 items-center justify-between mb-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Customer name or order ID..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="mt-4 md:mt-0">
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
        </div>

        <div className="rounded-md border md:max-w-full max-w-[380px]">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden md:table-cell text-left">
                    Order ID
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="table-cell">Customer</TableHead>
                  <TableHead className="hidden md:table-cell text-center">
                    Status
                  </TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="md:text-right">Actions</TableHead>
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
                  paginatedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium hidden md:table-cell text-left">
                        {order.id}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {format(new Date(order.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="md:w-auto w-[100px] break-all break-words">
                        {`${order.firstName} ${order.lastName}`}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-center">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="md:w-auto w-[100px] break-words">
                        <div>
                          <div>₦{order.total.toLocaleString()}</div>
                          {order.discount && (
                            <span className="text-xs text-muted-foreground italic">
                              Discount Applied ({order.discount.code})
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="md:w-auto w-[50px]">
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
                            <DropdownMenuItem
                              onClick={() => handleEditOrder(order)}
                              disabled={order.status === "DELIVERED"}
                            >
                              Edit Order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        <CardFooter className="md:flex grid justify-between pt-8">
          <div className="text-sm text-muted-foreground">
            Showing {paginatedOrders.length} of {orders.length} orders
          </div>
          <div className="flex justify-between items-center md:mt-0 mt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="mx-2">
              Page {currentPage} of{" "}
              {Math.ceil(paginatedOrders.length / itemsPerPage)}
            </span>
            <Button
              variant="outline"
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(
                    prev + 1,
                    Math.ceil(paginatedOrders.length / itemsPerPage)
                  )
                )
              }
              disabled={
                currentPage === Math.ceil(paginatedOrders.length / itemsPerPage)
              }
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Create Order Modal */}
      <CreateOrderModal
        open={createOrderOpen}
        onOpenChange={setCreateOrderOpen}
        onAddOrder={addOrder}
      />

      {/* Edit Order Modal */}
      {selectedOrder && (
        <EditOrderModal
          open={editOrderOpen}
          onOpenChange={setEditOrderOpen}
          order={selectedOrder}
          onUpdateOrder={updateOrder}
        />
      )}

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

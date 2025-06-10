"use client";

import {
  getSalesData,
  getTopProducts,
  useStore,
  useSettingsStore,
} from "@/store/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowUpIcon,
  DollarSign,
  Package,
  ShoppingCart,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";

// Import charts with dynamic imports and disable SSR
const LineChart = dynamic(() => import("@/components/charts/line-chart"), {
  ssr: false,
  loading: () => <Skeleton className="h-[350px] w-full" />,
});
const BarChart = dynamic(() => import("@/components/charts/bar-chart"), {
  ssr: false,
  loading: () => <Skeleton className="h-[350px] w-full" />,
});
const DonutChart = dynamic(() => import("@/components/charts/donut-chart"), {
  ssr: false,
  loading: () => <Skeleton className="h-[350px] w-full" />,
});

export default function Dashboard() {
  const { products, orders, discounts } = useStore();
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [discountsLoading, setDiscountsLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const { users, shippingOptions, fetchSettings } = useSettingsStore();

  useEffect(() => {
    const orders = useStore.getState().orders;
    if (!orders || orders.length === 0) {
      useStore
        .getState()
        .fetchOrders()
        .then(() => {
          const updatedOrders = useStore.getState().orders;
          console.log("[FETCHED_ORDERS]", updatedOrders);
          setOrdersLoading(false);
        });
    } else {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    const products = useStore.getState().products;
    if (!products || products.length === 0) {
      useStore
        .getState()
        .fetchProducts()
        .then(() => {
          const updatedProducts = useStore.getState().products;
          console.log("[FETCHED_PRODUCTS]", updatedProducts);
          setProductsLoading(false);
        });
    } else {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    const discounts = useStore.getState().discounts;
    if (!discounts || discounts.length === 0) {
      useStore
        .getState()
        .fetchDiscounts()
        .then(() => {
          const updatedDiscounts = useStore.getState().discounts;
          console.log("[FETCHED_DISCOUNTS]", updatedDiscounts);
          setDiscountsLoading(false);
        });
    } else {
      setDiscountsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (users.length === 0) {
      fetchSettings()
        .then(() => {
          setSettingsLoading(false);
        })
        .catch((error) => {
          console.error("Fetch settings error:", error);
          setSettingsLoading(false);
          toast({
            title: "Error",
            description: "Failed to fetch settings. Please try again.",
            variant: "destructive",
          });
        });
    } else {
      setSettingsLoading(false);
    }
  }, []);

  if (ordersLoading || productsLoading || discountsLoading || settingsLoading) {
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

  // Calculate dashboard metrics
  const totalRevenue = orders
    .filter((order) => order.status === "DELIVERED")
    .reduce((sum, order) => {
      const orderTotal = order.total; // Use the total directly
      return sum + orderTotal;
    }, 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  // Count unique customers by email
  const totalCustomers = new Set(orders.map((order) => order.email)).size;

  // Calculate recent stats
  const pendingOrders = orders.filter(
    (order) => order.status === "PENDING"
  ).length;
  const processingOrders = orders.filter(
    (order) => order.status === "PROCESSING"
  ).length;
  const shippedOrders = orders.filter(
    (order) => order.status === "SHIPPED"
  ).length;
  const deliveredOrders = orders.filter(
    (order) => order.status === "DELIVERED"
  ).length;

  // Calculate low stock products (inventory < 10)
  const lowStockProducts = products.filter((product) => product.inventory < 10);
  const lowStockCount = lowStockProducts.length;

  // Calculate inventory status
  const totalInventory = products.reduce(
    (sum, product) => sum + product.inventory,
    0
  );
  const criticalStockProducts = products.filter(
    (product) => product.inventory < 5
  ).length;

  // Calculate order status distribution for pie chart
  const orderStatusData = [
    { name: "Pending", value: pendingOrders },
    { name: "Processing", value: processingOrders },
    { name: "Shipped", value: shippedOrders },
    { name: "Delivered", value: deliveredOrders },
    {
      name: "Cancelled",
      value: orders.filter((order) => order.status === "CANCELLED").length,
    },
  ].filter((item) => item.value > 0);

  // Calculate category distribution
  const categoryData = products.reduce((acc, product) => {
    const category = acc.find((c) => c.name === product.category);
    if (category) {
      category.value += 1;
    } else {
      acc.push({ name: product.category, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const salesData = getSalesData(
    orders.map((order) => ({
      ...order,
      createdAt:
        order.createdAt instanceof Date
          ? order.createdAt.toISOString()
          : order.createdAt,
    }))
  ) as any;
  const { topByRevenue, topByQuantity } = getTopProducts(
    orders.map((order) => ({
      ...order,
      createdAt:
        order.createdAt instanceof Date
          ? order.createdAt.toISOString()
          : order.createdAt,
    }))
  );

  return (
    <div className="space-y-6 p-6 pt-6 md:p-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to your Halamin Herbal dashboard. Here's what's happening with
          your herbal medicine store today.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalRevenue}</div>
            {/* <div className="flex items-center pt-1">
              <ArrowUpIcon className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-xs text-green-500 font-medium">+20.1%</span>
              <span className="text-xs text-muted-foreground ml-1">
                from last month
              </span>
            </div> */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            {/* <div className="flex items-center pt-1">
              <ArrowUpIcon className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-xs text-green-500 font-medium">+12.5%</span>
              <span className="text-xs text-muted-foreground ml-1">
                from last month
              </span>
            </div> */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <div className="flex items-center pt-1">
              {lowStockCount > 0 ? (
                <>
                  <AlertTriangle className="mr-1 h-3 w-3 text-amber-500" />
                  <span className="text-xs text-amber-500 font-medium">
                    {lowStockCount} low stock
                  </span>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">
                  All products in stock
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-full lg:col-span-4">
              <CardHeader>
                <CardTitle>Revenue Over Time</CardTitle>
                <CardDescription>
                  Monthly revenue for the past year
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={salesData}
                  categories={["revenue"] as any}
                  index="date"
                  colors={["emerald"]}
                  valueFormatter={(value) => `₦${value.toLocaleString()}`}
                  yAxisWidth={70}
                  height={350}
                />
              </CardContent>
            </Card>

            <Card className="col-span-full lg:col-span-3">
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
                <CardDescription>
                  Distribution of orders by status
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <DonutChart
                  data={orderStatusData as any}
                  index="name"
                  categories={["value"] as any}
                  colors={["blue", "amber", "emerald", "indigo", "red"]}
                  valueFormatter={(value) => `${value} orders`}
                  height={300}
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-full lg:col-span-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>
                    You have {pendingOrders} pending orders
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {orders.slice(0, 5).map((order) => (
                    <div
                      className="flex items-center justify-between"
                      key={order.id}
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {order.firstName} {order.lastName}
                        </p>
                        <div className="flex items-center text-sm text-muted-foreground gap-2">
                          <span>
                            {order.items.length}{" "}
                            {order.items.length === 1 ? "item" : "items"}
                          </span>
                          <span>•</span>
                          <span>₦{order.total.toLocaleString()}</span>
                          {order.discount && (
                            <span className="text-xs text-muted-foreground italic">
                              Discount Applied ({order.discount.code})
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge
                        className={cn(
                          order.status === "DELIVERED" &&
                            "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100",
                          order.status === "SHIPPED" &&
                            "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-100",
                          order.status === "PROCESSING" &&
                            "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-100",
                          order.status === "PENDING" &&
                            "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-100",
                          order.status === "CANCELLED" &&
                            "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-100"
                        )}
                        variant="outline"
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-full lg:col-span-3">
              <CardHeader>
                <CardTitle>Inventory Status</CardTitle>
                <CardDescription>
                  {lowStockCount} products low in stock
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {lowStockProducts.length > 0 ? (
                    lowStockProducts.slice(0, 5).map((product) => (
                      <div className="space-y-2" key={product.id}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium leading-none">
                              {product.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {product.category}
                            </p>
                          </div>
                          <Badge
                            className={cn(
                              product.inventory < 5
                                ? "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-100"
                                : "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-100"
                            )}
                            variant="outline"
                          >
                            {product.inventory < 5 ? "Critical" : "Low"}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>Stock: {product.inventory}</span>
                            <span>
                              {Math.round((product.inventory / 30) * 100)}%
                            </span>
                          </div>
                          <Progress
                            value={Math.round((product.inventory / 30) * 100)}
                            className={cn(
                              product.inventory < 5
                                ? "text-red-600"
                                : "text-amber-600"
                            )}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Package className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">
                        All products in stock
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your inventory levels are healthy
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Top Products by Revenue</CardTitle>
                <CardDescription>
                  Best selling products by revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={topByRevenue as any}
                  index="title"
                  categories={["totalRevenue"] as any}
                  colors={["emerald"]}
                  valueFormatter={(value) => `₦${value.toLocaleString()}`}
                  yAxisWidth={60}
                  height={350}
                />
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Product Categories</CardTitle>
                <CardDescription>
                  Distribution of products by category
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <DonutChart
                  data={categoryData as any}
                  index="name"
                  categories={["value"] as any}
                  colors={["blue", "emerald", "amber", "purple", "indigo"]}
                  valueFormatter={(value) => `${value} products`}
                  height={350}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Orders Over Time</CardTitle>
              <CardDescription>Monthly order volume</CardDescription>
            </CardHeader>
            <CardContent>
              <LineChart
                data={salesData}
                categories={["orderCount"] as any}
                index="month"
                colors={["blue"]}
                valueFormatter={(value) => `${value.toLocaleString()} orders`}
                yAxisWidth={70}
                height={350}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

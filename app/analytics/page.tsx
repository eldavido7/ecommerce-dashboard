"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, DollarSign, Package, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSalesData, getTopProducts, useStore } from "@/store/store";

// Import charts with dynamic imports and disable SSR
const PieChart = dynamic(() => import("@/components/charts/pie-chart"), {
  ssr: false,
  loading: () => <Skeleton className="h-[350px] w-full" />,
});

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("year");
  const { products, orders, discounts } = useStore();
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);

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

  if (ordersLoading || productsLoading) {
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

  // Calculate analytics metrics
  const totalRevenue = orders
    .filter((order) => order.status === "DELIVERED")
    .reduce((sum, order) => {
      const orderTotal = order.total; // Use the total directly
      return sum + orderTotal;
    }, 0);

  const totalOrders = orders.length;
  const totalProducts = products.length;
  const averageOrderValue = totalRevenue / totalOrders;

  // Prepare data for charts
  const categoryData = products.reduce((acc, product) => {
    const category = acc.find((c) => c.name === product.category);
    if (category) {
      category.value += 1;
    } else {
      acc.push({ name: product.category, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

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

  const statusData = [
    { name: "Pending", value: pendingOrders },
    { name: "Processing", value: processingOrders },
    { name: "Shipped", value: shippedOrders },
    { name: "Delivered", value: deliveredOrders },
    {
      name: "Canceled",
      value: orders.filter((order) => order.status === "CANCELLED").length,
    },
  ].filter((item) => item.value > 0);

  // Calculate low stock products (inventory < 10)
  const lowStockProducts = products.filter((product) => product.inventory < 10);
  const lowStockCount = lowStockProducts.length;

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

  const productPerformance = topByRevenue.map((p) => ({
    id: p.title, // or p.id if available
    title: p.title,
    sales: p.totalSold,
    revenue: p.totalRevenue,
    avgPrice: p.totalRevenue / p.totalSold,
    performance:
      p.totalRevenue > 30000
        ? "High"
        : p.totalRevenue > 10000
        ? "Medium"
        : "Low",
  }));

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <Select defaultValue={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last 7 days</SelectItem>
            <SelectItem value="month">Last 30 days</SelectItem>
            <SelectItem value="quarter">Last 90 days</SelectItem>
            <SelectItem value="year">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₦{totalRevenue.toFixed(2)}
                </div>
                {/* <p className="text-xs text-muted-foreground">
                  +20.1% from previous period
                </p> */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalOrders}</div>
                {/* <p className="text-xs text-muted-foreground">
                  +12.5% from previous period
                </p> */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Order Value
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₦{averageOrderValue.toFixed(2)}
                </div>
                {/* <p className="text-xs text-muted-foreground">
                  +2.5% from previous period
                </p> */}
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

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart
                  data={categoryData as any}
                  index="name"
                  categories={["value"]}
                  colors={[
                    "#3b82f6",
                    "#22c55e",
                    "#eab308",
                    "#a855f7",
                    "#6366f1",
                  ]}
                  valueFormatter={(value) => `${value}%`}
                  height={350}
                />
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart
                  data={statusData as any}
                  index="name"
                  categories={["value"]}
                  colors={[
                    "#94a3b8",
                    "#facc15",
                    "#3b82f6",
                    "#22c55e",
                    "#ef4444",
                  ]}
                  valueFormatter={(value) => `${value}%`}
                  height={350}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            {/* <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Distribution of payment methods used
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PieChart
                  data={paymentMethodData as any}
                  index="name"
                  categories={["value"]}
                  colors={["#3b82f6", "#22c55e", "#eab308", "#a855f7"]}
                  valueFormatter={(value) => `${value}%`}
                  height={350}
                />
              </CardContent>
            </Card> */}

            {/* <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Sales by Time of Day</CardTitle>
                <CardDescription>When customers are shopping</CardDescription>
              </CardHeader>
              <CardContent>
                <PieChart
                  data={
                    [
                      { name: "Morning (6AM-12PM)", value: 25 },
                      { name: "Afternoon (12PM-5PM)", value: 30 },
                      { name: "Evening (5PM-9PM)", value: 35 },
                      { name: "Night (9PM-6AM)", value: 10 },
                    ] as any
                  }
                  index="name"
                  categories={["value"]}
                  colors={["#facc15", "#3b82f6", "#a855f7", "#1e293b"]}
                  valueFormatter={(value) => `${value}%`}
                  height={350}
                />
              </CardContent>
            </Card> */}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Sales Performance</CardTitle>
              <CardDescription>
                Revenue and order count by month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Orders</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">
                        Avg. Order Value
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesData.map(
                      (data: {
                        month: string;
                        revenue: number;
                        orderCount: number;
                      }) => (
                        <TableRow key={data.month}>
                          {/* Use 'month' as the unique key */}
                          <TableCell className="font-medium">
                            {data.month}
                          </TableCell>
                          <TableCell className="text-right">
                            {data.orderCount}
                          </TableCell>
                          <TableCell className="text-right">
                            ₦{data.revenue.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            ₦{(data.revenue / data.orderCount).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Top Products by Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart
                  data={topByRevenue as any}
                  index="title"
                  categories={["totalRevenue"]} // ← correct key from your data
                  colors={[
                    "#3b82f6",
                    "#22c55e",
                    "#eab308",
                    "#a855f7",
                    "#6366f1",
                  ]}
                  valueFormatter={(value) => `₦${value.toLocaleString()}`}
                  height={350}
                />
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Top Products by Units Sold</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart
                  data={topByQuantity as any}
                  index="title"
                  categories={["totalSold"]}
                  valueFormatter={(value) => `${value.toLocaleString()} units`}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Product Performance Matrix</CardTitle>
              <CardDescription>Revenue vs. Units Sold</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Units Sold</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Avg. Price</TableHead>
                      <TableHead className="text-right">Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productPerformance.map((product) => (
                      <TableRow key={product.title}>
                        <TableCell className="font-medium">
                          {product.title}
                        </TableCell>
                        <TableCell className="text-right">
                          {product.sales}
                        </TableCell>
                        <TableCell className="text-right">
                          ₦{product.revenue.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          ₦{product.avgPrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              product.performance === "High"
                                ? "bg-green-100 text-green-800"
                                : product.performance === "Medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {product.performance}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

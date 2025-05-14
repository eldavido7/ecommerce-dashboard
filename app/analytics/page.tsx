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
import { DollarSign, ShoppingCart } from "lucide-react";
import { mockSalesData, mockProductPerformance } from "@/lib/mock-data";
import { useState } from "react";
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

// Import charts with dynamic imports and disable SSR
const PieChart = dynamic(() => import("@/components/charts/pie-chart"), {
  ssr: false,
  loading: () => <Skeleton className="h-[350px] w-full" />,
});

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("year");

  // Calculate analytics metrics
  const totalRevenue = mockSalesData.reduce(
    (sum, data) => sum + data.revenue,
    0
  );
  const totalOrders = mockSalesData.reduce((sum, data) => sum + data.orders, 0);
  const averageOrderValue = totalRevenue / totalOrders;

  // Prepare data for charts
  const categoryData = [
    { name: "Tinctures", value: 35 },
    { name: "Capsules", value: 25 },
    { name: "Teas", value: 15 },
    { name: "Topicals", value: 15 },
    { name: "Extracts", value: 10 },
  ];

  const statusData = [
    { name: "Pending", value: 20 },
    { name: "Processing", value: 15 },
    { name: "Shipped", value: 25 },
    { name: "Delivered", value: 35 },
    { name: "Canceled", value: 5 },
  ];

  const paymentMethodData = [
    { name: "Credit Card", value: 65 },
    { name: "Bank Transfer", value: 20 },
    { name: "Cash on Delivery", value: 10 },
    { name: "Mobile Money", value: 5 },
  ];

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
                <p className="text-xs text-muted-foreground">
                  +20.1% from previous period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  +12.5% from previous period
                </p>
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
                <p className="text-xs text-muted-foreground">
                  +2.5% from previous period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Conversion Rate
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3.2%</div>
                <p className="text-xs text-muted-foreground">
                  +0.5% from previous period
                </p>
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
            <Card className="col-span-1">
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
            </Card>

            <Card className="col-span-1">
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
            </Card>
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
                    {mockSalesData.map((data) => (
                      <TableRow key={data.date}>
                        <TableCell className="font-medium">
                          {data.date}
                        </TableCell>
                        <TableCell className="text-right">
                          {data.orders}
                        </TableCell>
                        <TableCell className="text-right">
                          ₦{data.revenue.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          ₦{(data.revenue / data.orders).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
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
                  data={mockProductPerformance as any}
                  index="title"
                  categories={["revenue"]}
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
                  data={mockProductPerformance as any}
                  index="title"
                  categories={["sales"]}
                  colors={[
                    "#3b82f6",
                    "#22c55e",
                    "#eab308",
                    "#a855f7",
                    "#6366f1",
                  ]}
                  valueFormatter={(value) => `${value.toLocaleString()} units`}
                  height={350}
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
                    {mockProductPerformance.map((product) => (
                      <TableRow key={product.id}>
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
                          ₦{(product.revenue / product.sales).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              product.revenue > 30000
                                ? "bg-green-100 text-green-800"
                                : product.revenue > 10000
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {product.revenue > 30000
                              ? "High"
                              : product.revenue > 10000
                              ? "Medium"
                              : "Low"}
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

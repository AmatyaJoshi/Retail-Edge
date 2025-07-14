import { useGetDashboardMetricsQuery } from "@/state/api";
import React from "react";
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ComposedChart,
} from "recharts";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppSelector } from "@/state/hooks";

const formatIndianNumber = (num: number) => {
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  } else if (num >= 1000) {
    return `₹${(num / 1000).toFixed(1)}k`;
  }
  return `₹${num}`;
};

const CardTrendAnalysis = () => {
  const { data, isLoading, error } = useGetDashboardMetricsQuery();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  if (isLoading) {
    return (
      <Card className={isDarkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"}>
        <CardContent>
          <div className="flex items-center justify-center h-[250px]">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={isDarkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"}>
        <CardContent>
          <div className="flex items-center justify-center h-[250px] text-red-500">Error loading data</div>
        </CardContent>
      </Card>
    );
  }

  const salesSummary = data?.salesSummary || [];

  const chartData = salesSummary.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-GB'),
    revenue: item.totalValue,
    orders: item.orderCount,
    customers: item.customerCount,
  }));

  return (
    <Card className={isDarkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"}>
      <CardContent className="flex flex-col h-full bg-gray-50 dark:bg-[#232e41] pt-4">
        <CardTitle className="mb-4 text-lg md:text-xl font-semibold">Trend Analysis</CardTitle>
        <Tabs defaultValue="revenue" className="w-full flex-grow flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="revenue" className="text-base md:text-lg font-medium">Revenue</TabsTrigger>
            <TabsTrigger value="orders" className="text-base md:text-lg font-medium">Orders</TabsTrigger>
            <TabsTrigger value="customers" className="text-base md:text-lg font-medium">Customers</TabsTrigger>
          </TabsList>
          <TabsContent value="revenue" className="flex-grow">
            <div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" interval="preserveStartEnd" angle={-45} textAnchor="end" height={60} />
                  <YAxis tickFormatter={(value) => formatIndianNumber(value)} axisLine={false} tickLine={false} width={80} />
                  <Tooltip formatter={(value: number) => [formatIndianNumber(value), "Revenue"]} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="orders" className="flex-grow">
            <div>
              <ResponsiveContainer width="100%" height={250}>
                <ScatterChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis type="category" dataKey="date" interval="preserveStartEnd" angle={-45} textAnchor="end" height={60} />
                  <YAxis type="number" dataKey="orders" axisLine={false} tickLine={false} width={80} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value: number) => [value.toString(), "Orders"]} />
                  <Legend />
                  <Scatter name="Orders" dataKey="orders" fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="customers" className="flex-grow">
            <div>
              <ResponsiveContainer width="100%" height={250}>
                <ComposedChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" interval="preserveStartEnd" angle={-45} textAnchor="end" height={60} />
                  <YAxis axisLine={false} tickLine={false} width={80} />
                  <Tooltip formatter={(value: number) => [value.toString(), "Customers"]} />
                  <Legend />
                  <Bar dataKey="customers" barSize={20} fill="#82ca9d" />
                  <Line type="monotone" dataKey="customers" stroke="#8884d8" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CardTrendAnalysis; 
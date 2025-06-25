import { useGetDashboardMetricsQuery } from "@/state/api";
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const CardCategoryAnalysis = () => {
  const { data, isLoading, error } = useGetDashboardMetricsQuery();

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-red-500">Error loading data</div>
        </CardContent>
      </Card>
    );
  }

  const categoryData = data?.categoryAnalysis || [];

  const pieData = categoryData.map((category) => ({
    name: typeof category.category === 'string' ? category.category : '',
    value: category.revenue,
  }));

  const barData = categoryData.map((category) => ({
    name: typeof category.category === 'string' ? category.category : '',
    value: category.revenue,
  }));

  return (
    <Card>
      <CardContent className="flex flex-col h-full">
        <CardTitle className="mb-4">Category Analysis</CardTitle>
        <Tabs defaultValue="distribution" className="w-full flex-grow flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>
          <TabsContent value="distribution" className="flex-grow">
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [formatIndianNumber(value), "Revenue"]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="revenue" className="flex-grow">
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" interval="preserveStartEnd" angle={-45} textAnchor="end" height={60} />
                  <YAxis
                    tickFormatter={(value) => formatIndianNumber(value)}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatIndianNumber(value), "Revenue"]}
                  />
                  <Legend />
                  <Bar
                    dataKey="value"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    barSize={32}
                    name="Revenue"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CardCategoryAnalysis; 
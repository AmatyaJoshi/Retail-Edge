import { useGetDashboardMetricsQuery } from "@/state/api";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";

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

const CardSalesSummary = () => {
  const { data, isLoading, error } = useGetDashboardMetricsQuery();
  const [showPrediction, setShowPrediction] = useState(false);

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

  const salesSummary = data?.salesSummary || [];
  const totalSales = salesSummary.reduce((sum, item) => sum + item.totalValue, 0);
  const averageChange = salesSummary.reduce((sum, item) => sum + item.changePercentage, 0) / salesSummary.length;
  const highestSales = salesSummary.reduce((max, item) => (item.totalValue > max.totalValue ? item : max), salesSummary[0] || { totalValue: 0, orderCount: 0, customerCount: 0 });

  const chartData = salesSummary.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: item.totalValue,
    orderCount: item.orderCount,
    customerCount: item.customerCount,
    changePercentage: item.changePercentage,
  }));

  if (showPrediction && highestSales) {
    chartData.push({
      date: "Tomorrow",
      value: highestSales.totalValue * 1.1,
      orderCount: highestSales.orderCount,
      customerCount: highestSales.customerCount,
      changePercentage: 10,
    });
  }

  return (
    <Card>
      <CardContent className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Sales Overview</CardTitle>
          <div className="flex items-center space-x-2">
            <Switch
              id="prediction"
              checked={showPrediction}
              onCheckedChange={setShowPrediction}
            />
            <Label htmlFor="prediction">Show Prediction</Label>
          </div>
        </div>
        <div className="grid gap-4 flex-grow">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
              <p className="text-2xl font-bold">{formatIndianNumber(totalSales)}</p>
            </div>
          <div>
              <p className="text-sm font-medium text-muted-foreground">Average Change</p>
              <p className="text-2xl font-bold">{averageChange.toFixed(1)}%</p>
              </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Highest Sales</p>
              <p className="text-2xl font-bold">{formatIndianNumber(highestSales.totalValue)}</p>
            </div>
          </div>
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" interval="preserveStartEnd" angle={-45} textAnchor="end" height={60} />
                <YAxis
                  tickFormatter={(value) => formatIndianNumber(value)}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip
                  formatter={(value: number) => [formatIndianNumber(value), "Sales"]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#8884d8"
                  strokeWidth={3}
                  dot={false}
                  name="Sales"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
            </div>
      </CardContent>
    </Card>
  );
};

export default CardSalesSummary;
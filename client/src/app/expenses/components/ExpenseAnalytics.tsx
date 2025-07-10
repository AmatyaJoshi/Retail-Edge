"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  Treemap
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetExpensesByCategoryQuery, useGetAllExpenseTransactionsQuery } from "@/state/api";
import { startOfMonth, endOfMonth, format, subMonths } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown, Calendar as CalendarIcon, TrendingUp, PieChart as PieChartIcon, Layers, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetExpensesQuery } from "@/state/api";
import { useGetAllExpenseCategoriesQuery } from "@/state/api";

// Define chart colors
const COLORS = [
  '#6366f1', '#06b6d4', '#f59e42', '#ef4444', '#a64d79', '#674ea7', '#3c78d8', '#6aa84f', '#f1c232', '#cc0000'
];

export function ExpenseAnalytics() {
  // Date range state
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  // Category filter (future: multi-select)
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  // Format dates for API
  const startDate = format(dateRange.from, "yyyy-MM-dd");
  const endDate = format(dateRange.to, "yyyy-MM-dd");
  
  // Fetch expense data
  // Simplified query without date filtering initially to debug
  const { data: expensesData, isLoading, error } = useGetExpensesByCategoryQuery({});
  
  // Fetch all categories for mapping
  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetAllExpenseCategoriesQuery();
  type Category = { categoryId: string; name: string };
  const categoryMap: Record<string, string> = useMemo(() => {
    if (!categoriesData) return {};
    const map: Record<string, string> = {};
    (categoriesData as Category[]).forEach((cat) => {
      map[cat.categoryId] = cat.name;
    });
    return map;
  }, [categoriesData]);
  
  // Format data for category distribution pie chart
  const categoryData = useMemo(() => {
    if (!expensesData || !categoryMap) return [];
    return expensesData.map((item) => {
      const amount = typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount;
      return {
        name: categoryMap[item.category] || item.category,
        value: amount || 0,
        pending: item.pendingAmount || 0
      };
    });
  }, [expensesData, categoryMap]);
  
  // Format data for budget vs actual bar chart
  const budgetVsActualData = useMemo(() => {
    if (!expensesData || !categoryMap) return [];
    return expensesData.map((item) => {
      const amount = typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount;
      return {
        name: categoryMap[item.category] || item.category,
        budget: item.allocated || 0,
        spent: amount || 0
      };
    });
  }, [expensesData, categoryMap]);
  
  // Find top category
  const topCategory = useMemo(() => {
    if (!categoryData.length) return null;
    return categoryData.reduce((a, b) => (a.value > b.value ? a : b));
  }, [categoryData]);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Calculate totals
  const totalBudget = useMemo(() => {
    if (!expensesData) return 0;
    return expensesData.reduce((sum, item) => sum + (item.allocated || 0), 0);
  }, [expensesData]);
  
  const totalSpent = useMemo(() => {
    if (!expensesData) return 0;
    return expensesData.reduce((sum, item) => {
      const amount = typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount;
      return sum + (amount || 0);
    }, 0);
  }, [expensesData]);
  
  const percentageSpent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  
  // KPI: Pending Amount
  const totalPending = useMemo(() => {
    if (!expensesData) return 0;
    return expensesData.reduce((sum, item) => sum + (item.pendingAmount || 0), 0);
  }, [expensesData]);
  
  // KPI: Number of Categories
  const numCategories = useMemo(() => {
    if (!expensesData) return 0;
    return expensesData.length;
  }, [expensesData]);
  
  // KPI: Largest Single Expense
  const largestExpense = useMemo(() => {
    if (!expensesData) return 0;
    const amounts = expensesData.map(item => {
      const amount = typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount;
      return amount || 0;
    });
    return amounts.length > 0 ? Math.max(...amounts) : 0;
  }, [expensesData]);
  
  // Top 5 Categories by Pending Amount (for horizontal bar chart)
  const topPendingCategories = useMemo(() => {
    if (!categoryData) return [];
    return [...categoryData]
      .sort((a, b) => b.pending - a.pending)
      .slice(0, 5);
  }, [categoryData]);
  
  // Fetch all expense transactions for payment status and method analytics
  const { data: allTransactions } = useGetAllExpenseTransactionsQuery();

  // Data for Stacked Bar Chart: Paid vs Pending by Category
  const paidPendingByCategory = useMemo(() => {
    if (!expensesData || !categoryMap) return [];
    return expensesData.map((item) => ({
      name: categoryMap[item.category] || item.category,
      paid: (item.amount || 0) - (item.pendingAmount || 0),
      pending: item.pendingAmount || 0,
    }));
  }, [expensesData, categoryMap]);

  // Data for Donut Chart: Payment Status Breakdown
  const paymentStatusData = useMemo(() => {
    if (!allTransactions) return [];
    const statusMap: Record<string, number> = {};
    allTransactions.forEach((txn) => {
      statusMap[txn.status] = (statusMap[txn.status] || 0) + 1;
    });
    return Object.entries(statusMap).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
      value: count,
    }));
  }, [allTransactions]);

  // Data for Treemap: Expense Distribution by Category
  const treemapData = useMemo(() => {
    if (!expensesData || !categoryMap) return [];
    return expensesData.map((item) => {
      const amount = typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount;
      return {
        name: categoryMap[item.category] || item.category,
        size: amount || 0,
      };
    });
  }, [expensesData, categoryMap]);

  // KPI: Most Used Payment Method
  const mostUsedPaymentMethod = useMemo(() => {
    if (!allTransactions) return '-';
    const methodMap: Record<string, number> = {};
    allTransactions.forEach((txn) => {
      const method = txn.paymentMethod || 'Unknown';
      methodMap[method] = (methodMap[method] || 0) + 1;
    });
    const sorted = Object.entries(methodMap).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : '-';
  }, [allTransactions]);
  
  // Loading state
  if (isLoading) {
    return (
      <Card className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200">
        <CardHeader>
          <div className="flex items-center gap-2 animate-pulse">
            <PieChartIcon className="w-6 h-6 text-primary" />
            <CardTitle>Expense Analytics</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Card className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <PieChartIcon className="w-6 h-6 text-primary" />
            <CardTitle>Expense Analytics</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[350px]">
            <p className="text-red-600">Failed to load expense data</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // No data state
  if (!expensesData || expensesData.length === 0) {
    return (
      <Card className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <PieChartIcon className="w-6 h-6 text-primary" />
            <CardTitle>Expense Analytics</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {/* Temporary debug info */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Debug Info:</h4>
            <p>Loading: {isLoading.toString()}</p>
            <p>Error: {error ? JSON.stringify(error) : 'None'}</p>
            <p>Data length: {expensesData ? expensesData.length : 0}</p>
            <p>Categories length: {categoriesData ? categoriesData.length : 0}</p>
          </div>
          <div className="flex items-center justify-center h-[350px]">
            <p className="text-gray-500">No expense data available for the selected period</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200">
      <CardHeader className="pb-2 border-b-0">
        <div className="flex items-center gap-3">
          <PieChartIcon className="w-7 h-7 text-primary" />
          <CardTitle className="text-xl font-semibold tracking-tight text-gray-900">Expense Analytics</CardTitle>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {/* Date Range Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 border-gray-300 hover:bg-gray-50">
                <CalendarIcon className="w-4 h-4" />
                {format(dateRange.from, 'MMM dd, yyyy')} - {format(dateRange.to, 'MMM dd, yyyy')}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range) => {
                  if (range?.from && range?.to) setDateRange({ from: range.from, to: range.to });
                }}
                numberOfMonths={2}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {/* Category Filter (future: multi-select) */}
          {/* <Select ... /> */}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {/* Professional KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-50 rounded-lg shadow-sm flex flex-col items-start p-4 gap-2 border border-gray-200">
            <div className="flex items-center gap-2 text-primary"><TrendingUp className="w-5 h-5" /> <span className="font-medium">Total Spent</span></div>
            <div className="text-2xl font-bold animate-fade-in">{formatCurrency(totalSpent)}</div>
          </div>
          <div className="bg-gray-50 rounded-lg shadow-sm flex flex-col items-start p-4 gap-2 border border-gray-200">
            <div className="flex items-center gap-2 text-blue-500"><Layers className="w-5 h-5" /> <span className="font-medium">Total Budget</span></div>
            <div className="text-2xl font-bold animate-fade-in">{formatCurrency(totalBudget)}</div>
          </div>
          <div className="bg-gray-50 rounded-lg shadow-sm flex flex-col items-start p-4 gap-2 border border-gray-200">
            <div className="flex items-center gap-2 text-green-600"><Award className="w-5 h-5" /> <span className="font-medium">Utilization</span></div>
            <div className="text-2xl font-bold animate-fade-in">{percentageSpent.toFixed(1)}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
              <div
                className={cn(
                  "h-2.5 rounded-full transition-all",
                  percentageSpent > 90 ? 'bg-red-600' : percentageSpent > 70 ? 'bg-yellow-500' : 'bg-green-600'
                )}
                style={{ width: `${Math.min(percentageSpent, 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg shadow-sm flex flex-col items-start p-4 gap-2 border border-gray-200">
            <div className="flex items-center gap-2 text-fuchsia-600"><PieChartIcon className="w-5 h-5" /> <span className="font-medium">Top Category</span></div>
            <div className="text-lg font-semibold animate-fade-in">{topCategory ? topCategory.name : '-'}</div>
            <div className="text-xs text-muted-foreground">{topCategory ? formatCurrency(topCategory.value) : ''}</div>
          </div>
        </div>
        {/* Main Visualizations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-[340px] bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col">
            <h3 className="text-base font-medium mb-2 flex items-center gap-2"><PieChartIcon className="w-4 h-4" /> Category Distribution</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={110}
                  innerRadius={60}
                  fill="#6366f1"
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="h-[340px] bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col">
            <h3 className="text-base font-medium mb-2 flex items-center gap-2"><Layers className="w-4 h-4" /> Budget vs Actual</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetVsActualData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `₹${value / 1000}k`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="budget" fill="#06b6d4" name="Budget" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spent" fill="#6366f1" name="Spent" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Top Pending Categories Visualization */}
        <div className="h-[340px] bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col mt-8">
          <h3 className="text-base font-medium mb-2 flex items-center gap-2"><PieChartIcon className="w-4 h-4" /> Top 5 Categories by Pending Amount</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={topPendingCategories}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(value) => formatCurrency(Number(value))} />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="pending" fill="#f59e42" name="Pending Amount" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* New Interactive Visualizations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* Stacked Bar Chart: Paid vs Pending by Category */}
          <div className="h-[340px] bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col">
            <h3 className="text-base font-medium mb-2 flex items-center gap-2"><Layers className="w-4 h-4" /> Paid vs Pending by Category</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paidPendingByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `₹${value / 1000}k`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="paid" stackId="a" fill="#22c55e" name="Paid" />
                <Bar dataKey="pending" stackId="a" fill="#f59e42" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Donut Chart: Payment Status Breakdown */}
          <div className="h-[340px] bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col">
            <h3 className="text-base font-medium mb-2 flex items-center gap-2"><PieChartIcon className="w-4 h-4" /> Payment Status Breakdown</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={110}
                  innerRadius={60}
                  fill="#6366f1"
                  dataKey="value"
                >
                  {paymentStatusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Treemap: Expense Distribution by Category */}
        <div className="h-[340px] bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col mt-8">
          <h3 className="text-base font-medium mb-2 flex items-center gap-2"><PieChartIcon className="w-4 h-4" /> Expense Distribution by Category</h3>
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={treemapData}
              dataKey="size"
              nameKey="name"
              aspectRatio={4 / 3}
              stroke="#fff"
              fill="#8884d8"
            >
              {treemapData.map((entry, index) => (
                <Cell key={`cell-treemap-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Treemap>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
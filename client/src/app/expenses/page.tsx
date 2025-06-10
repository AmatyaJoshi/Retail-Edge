"use client";

import {
  ExpenseByCategorySummary,
  useGetExpensesByCategoryQuery,
} from "@/state/api";
import { useMemo, useState } from "react";
import Header from "@/app/(components)/Header";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { Download, Filter, Calendar, TrendingUp, AlertCircle, DollarSign } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

type AggregatedDataItem = {
  name: string;
  color?: string;
  amount: number;
};

type AggregatedData = {
  [category: string]: AggregatedDataItem;
};

const COLORS = [
  "#2563eb", // blue-600
  "#7c3aed", // violet-600
  "#db2777", // pink-600
  "#ea580c", // orange-600
  "#16a34a", // green-600
  "#ca8a04", // yellow-600
];

const Expenses = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(subMonths(new Date(), 6)), "yyyy-MM-dd"),
    end: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  });
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");

  const {
    data: expensesData,
    isLoading,
    isError,
  } = useGetExpensesByCategoryQuery();
  const expenses = useMemo(() => expensesData ?? [], [expensesData]);

  const parseDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ""; // fallback to empty string for invalid
    return date.toISOString().split("T")[0];
  };

  const aggregatedData: AggregatedDataItem[] = useMemo(() => {
    const filtered: AggregatedData = expenses
      .filter((data: ExpenseByCategorySummary) => {
        const matchesCategory =
          selectedCategory === "All" || data.category === selectedCategory;
        const dataDate = parseDate(data.date);
        // Only filter by date if dataDate is not empty
        const matchesDate = dataDate && dataDate >= dateRange.start && dataDate <= dateRange.end;
        return matchesCategory && matchesDate;
      })
      .reduce((acc: AggregatedData, data: ExpenseByCategorySummary) => {
        const amount = parseInt(data.amount);
        if (!acc[data.category]) {
          acc[data.category] = { name: data.category, amount: 0 };
          acc[data.category].color = COLORS[Object.keys(acc).length % COLORS.length];
        }
        acc[data.category].amount += amount;
        return acc;
      }, {});

    return Object.values(filtered);
  }, [expenses, selectedCategory, dateRange]);

  const monthlyData = useMemo(() => {
    const monthlyExpenses = expenses.reduce((acc: any, expense: ExpenseByCategorySummary) => {
      const date = new Date(expense.date);
      if (isNaN(date.getTime())) return acc; // skip invalid dates
      const month = format(date, "MMM yyyy");
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += parseInt(expense.amount);
      return acc;
    }, {});

    return Object.entries(monthlyExpenses).map(([month, amount]) => ({
      month,
      amount,
    }));
  }, [expenses]);

  const totalExpenses = useMemo(() => {
    return aggregatedData.reduce((sum, item) => sum + item.amount, 0);
  }, [aggregatedData]);

  const handleExport = () => {
    const csvContent = [
      ["Category", "Amount", "Date"],
      ...expenses.map((expense: ExpenseByCategorySummary) => [
        expense.category,
        expense.amount,
        expense.date,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `expenses-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isError || !expensesData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Failed to fetch expenses</h3>
          <p className="text-gray-500">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <Header name="Expenses" />
          <p className="text-sm text-gray-500 mt-1">
            Track and analyze your business expenses
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setViewMode(viewMode === "chart" ? "table" : "chart")}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {viewMode === "chart" ? "Table View" : "Chart View"}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
            <DollarSign className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">₹{totalExpenses.toLocaleString()}</p>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>12% from last month</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Categories</h3>
            <Filter className="w-5 h-5 text-violet-500" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">{aggregatedData.length}</p>
          <div className="mt-2 text-sm text-gray-500">
            Active expense categories
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Date Range</h3>
            <Calendar className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {format(new Date(dateRange.start), "MMM d")} - {format(new Date(dateRange.end), "MMM d, yyyy")}
          </p>
          <div className="mt-2 text-sm text-gray-500">
            Last 6 months
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {Array.from(new Set(expenses.map((e: ExpenseByCategorySummary) => e.category))).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Distribution</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={aggregatedData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="amount"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                >
                  {aggregatedData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === activeIndex ? "rgb(29, 78, 216)" : entry.color}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, "Amount"]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, "Amount"]}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ fill: "#2563eb" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table View */}
      {viewMode === "table" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {aggregatedData.map((item) => (
                  <tr key={item.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{item.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(dateRange.end), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {((item.amount / totalExpenses) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
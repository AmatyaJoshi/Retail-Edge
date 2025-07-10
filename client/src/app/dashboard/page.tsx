"use client";

import { useState } from "react";
import CardPopularProducts from "./CardPopularProducts";
import CardPurchaseSummary from "./CardPurchaseSummary";
import CardSalesSummary from "./CardSalesSummary";
import CardTrendAnalysis from "./CardTrendAnalysis";
import CardCategoryAnalysis from "./CardCategoryAnalysis";
import CardDetailedAnalytics from "./CardDetailedAnalytics";
import CardReports from "./CardReports";
import StatCard from "./StatCard";
import { DateRangePicker } from "./DateRangePicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Filter, RefreshCw, FileDown, FileText, FileSpreadsheet } from "lucide-react";
import type { DateRange } from "react-day-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    category: "all",
    status: "all",
    sortBy: "date",
  });

  const formatDateRange = (range: DateRange) => {
    if (!range.from || !range.to) return "";
    return `${range.from.toLocaleDateString('en-GB')} - ${range.to.toLocaleDateString('en-GB')}`;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Dashboard data refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh dashboard data");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    toast.success("Filters applied successfully");
    // Add your filter application logic here
  };

  const handleExport = (format: string) => {
    toast.success(`Exporting dashboard data as ${format}`);
    // Add your export logic here
  };

  return (
    <div className="flex-1 space-y-6 p-6 pt-6 bg-white">
      {/* Header Section */}
      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-2xl shadow-xl p-8 mb-8 bg-white/80 backdrop-blur border border-gray-200">
        {/* Futuristic top accent line */}
        <div className="absolute top-0 left-0 w-full h-1 rounded-t-2xl bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 opacity-80 shadow-lg" />
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-2">Dashboard</h2>
          <p className="text-gray-500 text-base">Monitor your business performance and analytics.</p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <Button 
            variant="outline" 
            size="icon" 
            className="shrink-0 hover:bg-accent"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="shrink-0 hover:bg-accent"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Filter Dashboard</DialogTitle>
                <DialogDescription>
                  Apply filters to customize your dashboard view.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <Select
                    value={filters.category}
                    onValueChange={(value) => handleFilterChange('category', value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="clothing">Clothing</SelectItem>
                      <SelectItem value="food">Food</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sortBy" className="text-right">
                    Sort By
                  </Label>
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value) => handleFilterChange('sortBy', value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select sort option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="amount">Amount</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setFilters({
                  category: "all",
                  status: "all",
                  sortBy: "date",
                })}>
                  Reset
                </Button>
                <Button onClick={handleApplyFilters}>Apply Filters</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 hover:bg-accent">
                <Upload className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("PDF")}>
                <FileText className="mr-2 h-4 w-4" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("Excel")}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("CSV")}>
                <FileDown className="mr-2 h-4 w-4" />
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="w-full justify-start p-1 bg-gray-50 rounded-xl mb-4">
          <TabsTrigger 
            value="overview" 
            className="flex-1 max-w-[200px] data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200 rounded-md px-4 py-2.5 text-sm font-medium"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="flex-1 max-w-[200px] data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200 rounded-md px-4 py-2.5 text-sm font-medium"
          >
            Analytics
          </TabsTrigger>
          <TabsTrigger 
            value="reports" 
            className="flex-1 max-w-[200px] data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200 rounded-md px-4 py-2.5 text-sm font-medium"
          >
            Reports
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">
          {/* Top Row - KPIs */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Sales"
              value="₹45.2L"
              description="+20.1% from last month"
              icon="trending-up"
              dateRange={dateRange}
            />
            <StatCard
              title="Total Orders"
              value="1,234"
              description="+15.5% from last month"
              icon="shopping-cart"
              dateRange={dateRange}
            />
            <StatCard
              title="Average Order Value"
              value="₹3.6k"
              description="+8.2% from last month"
              icon="trending-up"
              dateRange={dateRange}
            />
            <StatCard
              title="Total Customers"
              value="8.4k"
              description="+12.3% from last month"
              icon="users"
              dateRange={dateRange}
            />
          </div>

          {/* Second Row - Main Charts */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 mb-6">
            <CardContent className="col-span-1 flex flex-col overflow-hidden min-h-[350px] flex-grow min-h-0 h-full p-6 bg-background border rounded-xl shadow-md">
              <CardSalesSummary />
            </CardContent>
            <CardContent className="col-span-1 flex flex-col overflow-hidden min-h-[350px] flex-grow min-h-0 h-full p-6 bg-background border rounded-xl shadow-md">
      <CardPopularProducts />
            </CardContent>
          </div>

          {/* Third Row - Trend Analysis */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 mb-6">
            <CardContent className="col-span-1 flex flex-col overflow-hidden min-h-[350px] flex-grow min-h-0 h-full p-6 bg-background border rounded-xl shadow-md">
              <CardTrendAnalysis />
            </CardContent>
            <CardContent className="col-span-1 flex flex-col overflow-hidden min-h-[350px] flex-grow min-h-0 h-full p-6 bg-background border rounded-xl shadow-md">
              <CardCategoryAnalysis />
            </CardContent>
          </div>

          {/* Fourth Row - Additional Metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Inventory Value"
              value="₹12.5L"
              description="+5.2% from last month"
              icon="package"
              dateRange={dateRange}
            />
      <StatCard
              title="Total Dues"
              value="₹5.2L"
              description="+2.1% from last month"
              icon="alert-circle"
              dateRange={dateRange}
      />
      <StatCard
              title="Repeat Customers"
              value="65%"
              description="+3.4% from last month"
              icon="repeat"
              dateRange={dateRange}
      />
      <StatCard
              title="Pending Orders"
              value="23"
              description="+5 new orders"
              icon="clock"
              dateRange={dateRange}
            />
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <CardDetailedAnalytics />
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <CardReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}
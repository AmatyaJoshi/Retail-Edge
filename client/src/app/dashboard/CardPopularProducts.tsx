import { useGetDashboardMetricsQuery } from "@/state/api";
import { TrendingUp, TrendingDown } from "lucide-react";
import React from "react";
import {
  Card,
  CardContent,
  CardTitle
} from "@/components/ui/card";
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

const CardPopularProducts = () => {
  const { data, isLoading, error } = useGetDashboardMetricsQuery();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  if (isLoading) {
    return (
      <Card className={isDarkMode ? "bg-gray-900 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"}>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={isDarkMode ? "bg-gray-900 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"}>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-red-500">Error loading data</div>
        </CardContent>
      </Card>
    );
  }

  const popularProducts = data?.popularProducts || [];

  // Sort products by revenue and quantity to ensure correct ranking
  const popularProductsByRevenue = [...popularProducts].sort((a, b) => (b.revenue || 0) - (a.revenue || 0));
  const popularProductsByQuantity = [...popularProducts].sort((a, b) => (b.quantity || 0) - (a.quantity || 0));

  return (
    <Card className={isDarkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"}>
      <CardContent className="flex flex-col h-full bg-gray-50 dark:bg-[#232e41] pt-4">
        <CardTitle className="mb-4 text-lg md:text-xl font-semibold">Popular Products</CardTitle>
        <Tabs defaultValue="revenue" className="w-full flex-grow flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="revenue">By Revenue</TabsTrigger>
            <TabsTrigger value="quantity">By Quantity</TabsTrigger>
          </TabsList>
          <TabsContent value="revenue" className="space-y-4 max-h-[300px] overflow-y-auto flex-grow">
            <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-3 bg-gray-50 dark:bg-gray-800">
              {popularProductsByRevenue.map((product, index) => (
              <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b last:border-b-0"
                >
                  <span className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200 w-1/2 truncate pr-2">
                    {index + 1}. {product.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-gray-100 text-base md:text-lg">
                      {formatIndianNumber(product.revenue || 0)}
                    </span>
                  </div>
                </div>
              ))}
                    </div>
          </TabsContent>
          <TabsContent value="quantity" className="space-y-4 max-h-[300px] overflow-y-auto flex-grow">
            <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-3 bg-gray-50 dark:bg-gray-800">
              {popularProductsByQuantity.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b last:border-b-0"
                >
                  <span className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200 w-1/2 truncate pr-2">
                    {index + 1}. {product.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {product.quantity || 0}
                    </span>
                  </div>
              </div>
            ))}
          </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CardPopularProducts;
import { useGetDashboardMetricsQuery } from "@/state/api";
import { TrendingUp, TrendingDown } from "lucide-react";
import React from "react";
import {
  Card,
  CardContent,
  CardTitle
} from "@/components/ui/card";
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

const CardPopularProducts = () => {
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

  const popularProducts = data?.popularProducts || [];

  // Sort products by revenue and quantity to ensure correct ranking
  const popularProductsByRevenue = [...popularProducts].sort((a, b) => (b.revenue || 0) - (a.revenue || 0));
  const popularProductsByQuantity = [...popularProducts].sort((a, b) => (b.quantity || 0) - (a.quantity || 0));

  return (
    <Card>
      <CardContent className="flex flex-col h-full">
        <CardTitle className="mb-4 text-xl font-semibold">Popular Products</CardTitle>
        <Tabs defaultValue="revenue" className="w-full flex-grow flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="revenue">By Revenue</TabsTrigger>
            <TabsTrigger value="quantity">By Quantity</TabsTrigger>
          </TabsList>
          <TabsContent value="revenue" className="space-y-4 max-h-[300px] overflow-y-auto flex-grow">
            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {popularProductsByRevenue.map((product, index) => (
              <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b last:border-b-0"
                >
                  <span className="text-base font-bold text-gray-800 dark:text-gray-200 w-1/2 truncate pr-2">
                    {index + 1}. {product.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {formatIndianNumber(product.revenue || 0)}
                    </span>
                    {product.revenueChange !== undefined && (
                      <span
                        className={`flex items-center text-sm font-medium ${
                          product.revenueChange >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {product.revenueChange >= 0 ? (
                          <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                          <TrendingDown className="w-4 h-4 mr-1" />
                        )}
                        {Math.abs(product.revenueChange)}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
                    </div>
          </TabsContent>
          <TabsContent value="quantity" className="space-y-4 max-h-[300px] overflow-y-auto flex-grow">
            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {popularProductsByQuantity.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b last:border-b-0"
                >
                  <span className="text-base font-bold text-gray-800 dark:text-gray-200 w-1/2 truncate pr-2">
                    {index + 1}. {product.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {product.quantity || 0}
                    </span>
                    {product.quantityChange !== undefined && (
                      <span
                        className={`flex items-center text-sm font-medium ${
                          product.quantityChange >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {product.quantityChange >= 0 ? (
                          <TrendingUp className="w-4 h-4 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 mr-1" />
                        )}
                        {Math.abs(product.quantityChange)}%
                      </span>
                    )}
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
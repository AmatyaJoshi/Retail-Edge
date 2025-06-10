import { useGetDashboardMetricsQuery } from "@/state/api";
import { ShoppingBag } from "lucide-react";
import React from "react";
import Rating from "../(components)/Rating";
import Image from "next/image";

// Eyewear SVG icon from svgrepo.com
const EyewearIcon = () => (
  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="40" r="12" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="48" cy="40" r="12" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M4 40c0-6 4-12 12-12m32 0c8 0 12 6 12 12" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M28 40h8" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

const CardPopularProducts = () => {
  const { data: dashboardMetrics, isLoading } = useGetDashboardMetricsQuery();

  return (
    <div className="row-span-3 xl:row-span-6 bg-white dark:bg-gray-800 shadow-md rounded-2xl pb-16">
      {isLoading ? (
        <div className="m-5 text-gray-700 dark:text-gray-300">Loading...</div>
      ) : (
        <>
          <h3 className="text-lg font-semibold px-7 pt-5 pb-2 text-gray-900 dark:text-gray-100">
            Popular Products
          </h3>
          <hr className="border-gray-200 dark:border-gray-700" />
          <div className="overflow-auto h-[calc(100%-4rem)] custom-scrollbar">
            {dashboardMetrics?.popularProducts.map((product) => (
              <div
                key={product.productId}
                className="flex items-center justify-between gap-3 px-5 py-7 border-b border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div className="flex justify-center mb-2">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={100}
                        height={100}
                        className="rounded-lg object-contain"
                      />
                    ) : (
                      <div className="w-[100px] h-[100px] bg-gray-100 rounded-lg flex items-center justify-center">
                        <EyewearIcon />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-between gap-1">
                    <div className="font-bold text-gray-700 dark:text-gray-300">
                      {product.name}
                    </div>
                    <div className="flex text-sm items-center">
                      <span className="font-bold text-blue-500 dark:text-blue-400 text-xs">
                        ₹{product.price}
                      </span>
                      <span className="mx-2 text-gray-400 dark:text-gray-600">|</span>
                      <Rating rating={product.rating || 0} />
                    </div>
                  </div>
                </div>

                <div className="text-xs flex items-center text-gray-600 dark:text-gray-400">
                  <button className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mr-2">
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                  {product.stockQuantity} Sold
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CardPopularProducts;
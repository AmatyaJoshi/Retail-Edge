import { useGetDashboardMetricsQuery } from "@/state/api";
import { TrendingDown, TrendingUp } from "lucide-react";
import numeral from "numeral";
import React from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CardPurchaseSummary = () => {
  const { data, isLoading } = useGetDashboardMetricsQuery();
  // DashboardMetrics does not have purchaseSummary, so we use salesSummary as a placeholder
  const salesData = data?.salesSummary || [];
  const lastDataPoint = salesData[salesData.length - 1] || null;

  return (
    <div className="flex flex-col justify-between row-span-2 xl:row-span-3 col-span-1 md:col-span-2 xl:col-span-1 bg-gray-50 dark:bg-[#232e41] border border-gray-200 dark:border-gray-700 shadow-md rounded-2xl text-gray-900 dark:text-gray-100">
      {isLoading ? (
        <div className="m-5 text-gray-700 dark:text-gray-300">Loading...</div>
      ) : (
        <>
          {/* HEADER */}
          <div>
            <h2 className="text-lg font-semibold mb-2 px-7 pt-5 text-gray-900 dark:text-gray-100">
              Purchase Summary
            </h2>
            <hr className="border-gray-200 dark:border-gray-700" />
          </div>

          {/* BODY */}
          <div>
            {/* BODY HEADER */}
            <div className="mb-4 mt-7 px-7">
              <p className="text-xs text-gray-400 dark:text-gray-400">Purchased</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {lastDataPoint
                    ? numeral(lastDataPoint.totalValue).format("$0.00a")
                    : "0"}
                </p>
                {lastDataPoint && lastDataPoint.changePercentage !== undefined && (
                  <p
                    className={`text-sm ${
                      lastDataPoint.changePercentage >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    } flex ml-3`}
                  >
                    {lastDataPoint.changePercentage >= 0 ? (
                      <TrendingUp className="w-5 h-5 mr-1" />
                    ) : (
                      <TrendingDown className="w-5 h-5 mr-1" />
                    )}
                    {Math.abs(lastDataPoint.changePercentage)}%
                  </p>
                )}
              </div>
            </div>
            {/* CHART */}
            <ResponsiveContainer width="100%" height={200} className="p-2">
              <AreaChart
                data={salesData}
                margin={{ top: 0, right: 0, left: -50, bottom: 45 }}
              >
                <XAxis dataKey="date" tick={false} axisLine={false} />
                <YAxis tickLine={false} tick={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-color)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.5rem',
                  }}
                  formatter={(value: number) => [
                    `$${value.toLocaleString("en")}`,
                  ]}
                  labelFormatter={(label) => {
                    const date = new Date(label);
                    return date.toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    });
                  }}
                />
                <Area
                  type="linear"
                  dataKey="totalValue"
                  stroke="#8884d8"
                  fill="#8884d8"
                  dot={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default CardPurchaseSummary;
import { useGetDashboardMetricsQuery } from "@/state/api";
import type { DashboardMetrics } from "@/state/api";
import { TrendingUp } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const colors = ["#00C49F", "#0088FE", "#FFBB28"];

const CardExpenseSummary = () => {
  const { data: dashboardMetrics, isLoading } = useGetDashboardMetricsQuery();

  // Get category analysis data from dashboard metrics
  const categoryAnalysis = dashboardMetrics?.categoryAnalysis || [];

  const expenseCategories = categoryAnalysis.map((category) => ({
    name: `${typeof category.category === 'string' ? category.category : ''} Expenses`,
    value: category.revenue
  }));

  const totalExpenses = categoryAnalysis.reduce(
    (acc, category) => acc + category.revenue,
    0
  );
  const formattedTotalExpenses = totalExpenses.toFixed(2);

  return (
    <div className="row-span-3 bg-gray-50 dark:bg-[#232e41] border border-gray-200 dark:border-gray-700 shadow-md rounded-2xl flex flex-col justify-between text-gray-900 dark:text-gray-100">
      {isLoading ? (
        <div className="m-5 text-gray-700 dark:text-gray-300">Loading...</div>
      ) : (
        <>
          {/* HEADER */}
          <div>
            <h2 className="text-lg font-semibold mb-2 px-7 pt-5 text-gray-900 dark:text-gray-100">
              Expense Summary
            </h2>
            <hr className="border-gray-200 dark:border-gray-700" />
          </div>
          {/* BODY */}
          <div className="xl:flex justify-between pr-7">
            {/* CHART */}
            <div className="relative basis-3/5">
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie
                    data={expenseCategories}
                    innerRadius={50}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                  >
                    {expenseCategories.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={colors[index % colors.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center basis-2/5">
                <span className="font-bold text-xl text-gray-900 dark:text-gray-100">
                  ₹{formattedTotalExpenses}
                </span>
              </div>
            </div>
            {/* LABELS */}
            <ul className="flex flex-col justify-around items-center xl:items-start py-5 gap-3">
              {expenseCategories.map((entry, index) => (
                <li
                  key={`legend-${index}`}
                  className="flex items-center text-xs text-gray-600 dark:text-gray-400"
                >
                  <span
                    className="mr-2 w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  ></span>
                  {entry.name}
                </li>
              ))}
            </ul>
          </div>
          {/* FOOTER */}
          <div>
            <hr className="border-gray-200 dark:border-gray-700" />
            <div className="mt-3 flex justify-between items-center px-7 mb-4">
              <div className="pt-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Average:{" "}
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    ₹{(totalExpenses / categoryAnalysis.length || 0).toFixed(2)}
                  </span>
                </p>
              </div>
              <span className="flex items-center mt-2">
                <TrendingUp className="mr-2 text-green-500" />
                30%
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CardExpenseSummary;
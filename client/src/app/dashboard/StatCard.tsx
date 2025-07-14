import { TrendingUp, TrendingDown, AlertCircle, ShoppingCart, Users, Package, Repeat, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DateRange } from "react-day-picker";
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

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: "trending-up" | "trending-down" | "alert-circle" | "shopping-cart" | "users" | "package" | "repeat" | "clock";
  dateRange?: DateRange;
}

const iconMap = {
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  "alert-circle": AlertCircle,
  "shopping-cart": ShoppingCart,
  "users": Users,
  "package": Package,
  "repeat": Repeat,
  "clock": Clock,
};

const StatCard = ({ title, value, description, icon, dateRange }: StatCardProps) => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const Icon = iconMap[icon];
  const isPositive = description.includes("+");
  const isNegative = description.includes("-");

  return (
    <Card className={isDarkMode ? "bg-[#232e41] border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={isDarkMode ? "h-4 w-4 text-gray-400" : "h-4 w-4 text-gray-600"} />
      </CardHeader>
      <CardContent className="bg-gray-50 dark:bg-[#232e41]">
        <div className="text-2xl font-bold mb-1">
          {typeof value === "number" ? formatIndianNumber(value) : value}
        </div>
        <p className={`text-xs ${isPositive ? (isDarkMode ? "text-green-300" : "text-green-500") : isNegative ? (isDarkMode ? "text-red-300" : "text-red-500") : (isDarkMode ? "text-gray-400" : "text-gray-500")}`}>
          {description}
        </p>
        {dateRange?.from && dateRange?.to && (
          <p className={isDarkMode ? "text-xs text-gray-400 mt-1" : "text-xs text-gray-500 mt-1"}>
            {dateRange.from.toLocaleDateString('en-GB')} - {dateRange.to.toLocaleDateString('en-GB')}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
import { TrendingUp, TrendingDown, AlertCircle, ShoppingCart, Users, Package, Repeat, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DateRange } from "react-day-picker";

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
  const Icon = iconMap[icon];
  const isPositive = description.includes("+");
  const isNegative = description.includes("-");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1">
          {typeof value === "number" ? formatIndianNumber(value) : value}
        </div>
        <p className={`text-xs ${isPositive ? "text-green-500" : isNegative ? "text-red-500" : "text-muted-foreground"}`}>
          {description}
        </p>
        {dateRange?.from && dateRange?.to && (
          <p className="text-xs text-muted-foreground mt-1">
            {dateRange.from.toLocaleDateString('en-GB')} - {dateRange.to.toLocaleDateString('en-GB')}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
import { useGetExpensesQuery } from "@/state/api";
import type { Expense } from "@/state/api";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface ExpenseListProps {
  categoryId: string;
  onExpenseClick: (expense: Expense) => void;
}

const formatCurrency = (amount: number | undefined) =>
  typeof amount === 'number' && !isNaN(amount)
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
    : '-';

export const ExpenseList = ({ categoryId, onExpenseClick }: ExpenseListProps) => {
  const { data: expenses, isLoading, isError } = useGetExpensesQuery({ categoryId });

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-3/4" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 text-red-500 p-4">
        <AlertTriangle className="h-4 w-4" />
        <span>Error loading expenses.</span>
      </div>
    );
  }

  return (
    <div className="space-y-1 p-2">
      {expenses && expenses.length > 0 ? (
        expenses
          .filter((expense: Expense) => expense.paymentStatus !== 'PAID')
          .map((expense: Expense) => (
            <Button
              key={expense.expenseId}
              variant="ghost"
              className="w-full flex justify-between items-center h-auto py-2 px-2"
              onClick={() => onExpenseClick(expense)}
            >
              <div>
                <p className="font-medium text-left">{expense.description || "Expense"}</p>
                <p className="text-sm text-muted-foreground text-left">
                  {format(new Date(expense.timestamp), "MMM dd, yyyy")}
                </p>
                <p className="text-xs text-muted-foreground text-left mt-1">
                  Budget: <span className="font-semibold">{formatCurrency(expense.budget)}</span>
                </p>
              </div>
              <p className="font-semibold">₹{expense.amount.toLocaleString()}</p>
            </Button>
          ))
      ) : (
        <p className="text-muted-foreground p-4 text-center">No expenses found for this category.</p>
      )}
    </div>
  );
}; 
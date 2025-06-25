import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ExpenseByCategorySummary } from '@/state/api';
import { useGetAllExpenseCategoriesQuery } from '@/state/api';

interface ExpenseAnalyticsSidebarProps {
  summaries: ExpenseByCategorySummary[];
  isLoading: boolean;
}

export const ExpenseAnalyticsSidebar = ({ summaries, isLoading }: ExpenseAnalyticsSidebarProps) => {
  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetAllExpenseCategoriesQuery();

  // Build a map from categoryId to category name
  const categoryMap: Record<string, string> = (categoriesData || []).reduce((acc: Record<string, string>, cat: any) => {
    acc[cat.categoryId] = cat.name;
    return acc;
  }, {});

  if (isLoading || isCategoriesLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-1/2" />
          <div className="space-y-2 pt-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalExpenses = summaries.reduce((sum, s) => sum + Number(s.amount), 0);
  // Show all categories, sorted by amount descending
  const allCategories = [...(summaries || [])]
    .sort((a, b) => Number(b.amount) - Number(a.amount));

  return (
    <Card className="sticky top-8 max-h-[700px] overflow-y-auto">
      <CardHeader>
        <CardTitle className="text-xl">Expense Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">Total Spent</p>
          <p className="text-3xl font-bold">
            ₹{totalExpenses.toLocaleString()}
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Spending Categories</h4>
          <div className="space-y-3">
            {allCategories.map((summary) => (
              <div key={summary.category} className="flex justify-between items-center">
                <p className="text-sm">
                  {categoryMap[summary.category] || summary.category}
                </p>
                <p className="text-sm font-medium">
                  ₹{Number(summary.amount).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 
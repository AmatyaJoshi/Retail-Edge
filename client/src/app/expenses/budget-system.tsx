import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { useGetExpensesByCategoryQuery, useGetAllExpenseCategoriesQuery, useUpdateExpenseMutation, useGetExpensesQuery } from "@/state/api";
import type { Expense, ExpenseByCategorySummary } from "@/state/api";

const COLORS = [
  '#6366f1', '#06b6d4', '#f59e42', '#ef4444', '#a64d79', '#674ea7', '#3c78d8', '#6aa84f', '#f1c232', '#cc0000'
];

// Placeholder for income sources (to be replaced with backend integration)
const initialIncomeSources = [
  { id: '1', name: 'Sales', amount: 500000 },
  { id: '2', name: 'Services', amount: 200000 },
];

type BudgetTableRow = {
  categoryId: string;
  name: string;
  allocated: number;
  spent: number;
  remaining: number;
  utilization: number;
  overBudget: boolean;
  expenseId: string;
};

export default function BudgetSystem() {
  // Income management (placeholder, replace with backend integration)
  const [incomeSources, setIncomeSources] = useState(initialIncomeSources);
  const [newIncome, setNewIncome] = useState({ name: '', amount: '' });
  const totalIncome = incomeSources.reduce((sum, src) => sum + Number(src.amount), 0);

  // Expense and budget data
  const { data: categoriesData, isLoading: isLoadingCategories } = useGetAllExpenseCategoriesQuery();
  const { data: expensesData, isLoading: isLoadingExpenses } = useGetExpensesByCategoryQuery({});
  const { data: allExpensesData } = useGetExpensesQuery({});
  const [editBudget, setEditBudget] = useState<{ [categoryId: string]: boolean }>({});
  const [budgetInputs, setBudgetInputs] = useState<{ [categoryId: string]: string }>({});
  const [updateExpense] = useUpdateExpenseMutation();

  // Map categoryId to expenseId
  const categoryToExpenseId = useMemo((): Record<string, string> => {
    if (!allExpensesData) return {};
    const map: Record<string, string> = {};
    (allExpensesData as Expense[]).forEach((exp) => {
      if (exp.category) {
        map[exp.category] = exp.expenseId;
      }
    });
    return map;
  }, [allExpensesData]);

  // Merge budgets and expenses
  const budgetTable: BudgetTableRow[] = useMemo(() => {
    if (!expensesData || !categoriesData) return [];
    return (categoriesData as { categoryId: string; name: string }[]).map((cat) => {
      const expense = (expensesData as ExpenseByCategorySummary[]).find((e) => e.category === cat.categoryId) || {} as ExpenseByCategorySummary;
      const allocated = expense.allocated || 0;
      let spent = 0;
      if (typeof expense.amount === 'string') {
        spent = parseFloat(expense.amount);
      } else if (typeof expense.amount === 'number') {
        spent = expense.amount;
      }
      const remaining = allocated - spent;
      const utilization = allocated > 0 ? (spent / allocated) * 100 : 0;
      const expenseId = categoryToExpenseId[cat.categoryId] || "";
      return {
        categoryId: cat.categoryId ? String(cat.categoryId) : '',
        name: cat.name,
        allocated,
        spent,
        remaining,
        utilization,
        overBudget: spent > allocated,
        expenseId: expenseId ? String(expenseId) : '',
      };
    });
  }, [categoriesData, expensesData, categoryToExpenseId]);

  // Budget dashboard KPIs
  const totalBudget = budgetTable.reduce((sum, row) => sum + row.allocated, 0);
  const totalSpent = budgetTable.reduce((sum, row) => sum + row.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const netCashFlow = totalIncome - totalSpent;

  // Bar chart data
  const barChartData = budgetTable.map(row => ({ name: row.name, Budget: row.allocated, Spent: row.spent }));
  // Income vs Expenses line chart data (placeholder, can be extended)
  const lineChartData = [
    { month: 'Jan', Income: totalIncome / 6, Expenses: totalSpent / 6 },
    { month: 'Feb', Income: totalIncome / 6, Expenses: totalSpent / 6 },
    { month: 'Mar', Income: totalIncome / 6, Expenses: totalSpent / 6 },
    { month: 'Apr', Income: totalIncome / 6, Expenses: totalSpent / 6 },
    { month: 'May', Income: totalIncome / 6, Expenses: totalSpent / 6 },
    { month: 'Jun', Income: totalIncome / 6, Expenses: totalSpent / 6 },
  ];

  // Handlers for income
  const handleAddIncome = () => {
    if (!newIncome.name.trim() || isNaN(Number(newIncome.amount)) || Number(newIncome.amount) <= 0) return;
    setIncomeSources([...incomeSources, { id: Date.now().toString(), name: newIncome.name, amount: Number(newIncome.amount) }]);
    setNewIncome({ name: '', amount: '' });
  };
  const handleRemoveIncome = (id: string) => {
    setIncomeSources(incomeSources.filter(src => src.id !== id));
  };

  // Handlers for budget editing
  const handleEdit = (categoryId: string, allocated: number) => {
    setEditBudget(prev => ({ ...prev, [categoryId ?? '']: true }));
    setBudgetInputs(prev => ({ ...prev, [categoryId ?? '']: allocated.toString() }));
  };
  const handleCancel = (categoryId: string) => {
    const safeCategoryId = categoryId ?? '';
    setEditBudget(prev => ({ ...prev, [safeCategoryId]: false }));
    setBudgetInputs(prev => ({ ...prev, [safeCategoryId]: "" }));
  };
  const handleSave = async (categoryId: string, expenseId: string, spent: number) => {
    const safeCategoryId = categoryId ?? '';
    const safeExpenseId = expenseId ?? '';
    const newBudget = parseFloat(budgetInputs[safeCategoryId] ?? '');
    if (isNaN(newBudget) || newBudget < spent) return;
    if (!safeExpenseId) return;
    await updateExpense({ expenseId: safeExpenseId, expense: { budget: newBudget } });
    setEditBudget(prev => ({ ...prev, [safeCategoryId]: false }));
  };

  // Format currency
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

  if (isLoadingCategories || isLoadingExpenses) {
    return <Skeleton className="h-[600px] w-full rounded-xl" />;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      {/* Income Management */}
      <Card className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900">Income Management</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
            <div className="flex flex-col gap-2 md:w-1/3">
              <label className="text-sm font-medium text-gray-700">Source Name</label>
              <Input 
                value={newIncome.name} 
                onChange={e => setNewIncome({ ...newIncome, name: e.target.value })} 
                placeholder="e.g. Sales"
                className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-col gap-2 md:w-1/3">
              <label className="text-sm font-medium text-gray-700">Amount</label>
              <Input 
                type="number" 
                value={newIncome.amount} 
                onChange={e => setNewIncome({ ...newIncome, amount: e.target.value })} 
                placeholder="e.g. 100000"
                className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button 
              className="md:w-auto bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" 
              onClick={handleAddIncome}
            >
              Add Income
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-separate border-spacing-y-2 bg-white rounded-lg border border-gray-200">
              <thead>
                <tr className="bg-gray-50 text-gray-700 text-sm font-medium">
                  <th className="py-3 px-4 border-b border-gray-200">Source</th>
                  <th className="py-3 px-4 border-b border-gray-200">Amount</th>
                  <th className="py-3 px-4 border-b border-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {incomeSources.map(src => (
                  <tr key={src.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-900">{src.name}</td>
                    <td className="py-3 px-4 text-gray-700">{formatCurrency(Number(src.amount))}</td>
                    <td className="py-3 px-4">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleRemoveIncome(src.id)}
                        className="border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Budget Dashboard KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Income</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalIncome)}</div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Budgeted</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalBudget)}</div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Spent</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalSpent)}</div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Remaining</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalRemaining)}</div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Net Cash Flow</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className={`text-2xl font-bold ${netCashFlow < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(netCashFlow)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-900">Income Sources</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incomeSources.map(src => ({ name: src.name, value: Number(src.amount) }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={110}
                  innerRadius={60}
                  fill="#6366f1"
                  dataKey="value"
                >
                  {incomeSources.map((_, index) => (
                    <Cell key={`cell-income-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={v => formatCurrency(Number(v))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-900">Budget vs Spent by Category</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={v => `₹${v / 1000}k`} />
                <Tooltip formatter={v => formatCurrency(Number(v))} />
                <Legend />
                <Bar dataKey="Budget" fill="#6366f1" />
                <Bar dataKey="Spent" fill="#f59e42" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-900">Income vs Expenses (Monthly)</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={v => `₹${v / 1000}k`} />
                <Tooltip formatter={v => formatCurrency(Number(v))} />
                <Legend />
                <Line type="monotone" dataKey="Income" stroke="#06b6d4" strokeWidth={2} />
                <Line type="monotone" dataKey="Expenses" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Budget Table */}
      <Card className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900">Category Budgets</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-separate border-spacing-y-2 bg-white rounded-lg border border-gray-200">
              <thead>
                <tr className="bg-gray-50 text-gray-700 text-sm font-medium">
                  <th className="py-3 px-4 border-b border-gray-200">Category</th>
                  <th className="py-3 px-4 border-b border-gray-200">Allocated</th>
                  <th className="py-3 px-4 border-b border-gray-200">Spent</th>
                  <th className="py-3 px-4 border-b border-gray-200">Remaining</th>
                  <th className="py-3 px-4 border-b border-gray-200">Utilization</th>
                  <th className="py-3 px-4 border-b border-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {budgetTable.map(row => (
                  <tr key={row.categoryId ?? ''} className={`hover:bg-gray-50 transition-colors ${row.overBudget ? "bg-red-50" : ""}`}>
                    <td className="py-3 px-4 font-medium text-gray-900">{row.name}</td>
                    <td className="py-3 px-4">
                      {editBudget[row.categoryId ?? ''] ? (
                        <div className="flex gap-2 items-center">
                          <Input
                            type="number"
                            min={row.spent}
                            value={budgetInputs[row.categoryId ?? ''] ?? ''}
                            onChange={e => setBudgetInputs(prev => ({ ...prev, [row.categoryId ?? '']: e.target.value }))}
                            className="w-24 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleCancel(row.categoryId ?? '')}
                            className="border-gray-300 hover:bg-gray-50"
                          >
                            Cancel
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleSave(row.categoryId ?? '', row.expenseId ?? '', row.spent)} 
                            disabled={parseFloat(budgetInputs[row.categoryId ?? ''] ?? '') < row.spent}
                            className="bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            Save
                          </Button>
                        </div>
                      ) : (
                        <span>{formatCurrency(row.allocated)}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-700">{formatCurrency(row.spent)}</td>
                    <td className="py-3 px-4 text-gray-700">{formatCurrency(row.remaining)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span>{row.utilization.toFixed(1)}%</span>
                        <div className="w-24 bg-gray-200 rounded-full h-2.5">
                          <div className={`h-2.5 rounded-full ${row.utilization > 100 ? 'bg-red-600' : 'bg-blue-600'}`} style={{ width: `${Math.min(row.utilization, 100)}%` }}></div>
                        </div>
                      </div>
                      {row.overBudget && <div className="text-xs text-red-600 font-semibold mt-1">Over Budget!</div>}
                    </td>
                    <td className="py-3 px-4">
                      {!editBudget[row.categoryId ?? ''] && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleEdit(row.categoryId ?? '', row.allocated)}
                          className="border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                        >
                          Edit
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
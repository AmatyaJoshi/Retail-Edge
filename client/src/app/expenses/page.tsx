"use client";

import { useMemo, useState, useEffect } from "react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { useGetExpensesByCategoryQuery, api, useGetAllExpenseTransactionsQuery, useGetExpensesQuery } from "@/state/api";
import type { Expense, ExpenseByCategorySummary, ExpenseTransaction } from '@/state/api';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { ColumnDef } from '@tanstack/react-table';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useRouter } from 'next/navigation';

// Icons
import { 
  PlusCircleIcon,
  SearchIcon,
  FolderOpen,
  AlertTriangle,
  MoreVertical,
  CalendarIcon,
  DollarSign,
  AlertTriangleIcon,
  Info,
  CreditCard,
  Calendar,
  Tag,
  User,
  FileText,
  Hash
} from "lucide-react";

import { AddExpenseModal, type ExpenseFormBase } from "./components/AddExpenseModal";
import { ExpenseDetailModal } from "./components/ExpenseDetailModal";
import { ExpenseAnalytics } from "./components/ExpenseAnalytics";
import PaymentTracking from "./components/PaymentTracking";
import { useExpenseCategories } from "@/hooks/use-expense-categories";
import { ExpenseList } from "./components/ExpenseList";
import { ExpenseAnalyticsSidebar } from "./components/ExpenseAnalyticsSidebar";
import PayExpenseModal from "./components/PayExpenseModal";
import BudgetSystem from "./budget-system";

type ExpenseStatus = "pending" | "approved" | "rejected";

type ExpenseCardData = {
  expenseByCategoryId: string;
  category: string;
  amount: string;
  description: string | undefined;
  vendor: string | undefined;
  dueDate: string | undefined;
  status: ExpenseStatus;
  allocated: number | undefined;
  budget: number | undefined;
  paymentStatus: "PENDING" | "PARTIAL" | "PAID" | undefined;
  paidAmount: number | undefined;
  date: string | undefined;
  timestamp: string | undefined;
  id: string | undefined;
};

export function ExpenseModalWrapper({
  isOpen,
  onClose,
  selectedExpense,
  onSuccess
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedExpense: ExpenseCardData | null;
  onSuccess: () => void;
}) {
  const initialData: ExpenseFormBase | undefined = selectedExpense ? {
    category: selectedExpense.category,
    amount: parseFloat(selectedExpense.amount),
    description: selectedExpense.description ?? "",
    vendor: selectedExpense.vendor ?? "",
    dueDate: new Date(selectedExpense.dueDate || Date.now()),
    budget: selectedExpense.allocated || undefined,
    status: selectedExpense.status,
    paymentStatus: selectedExpense.paymentStatus,
    paidAmount: selectedExpense.paidAmount
  } : undefined;
  
  // Get expense ID, checking if it's a ExpenseByCategory ID (starts with exp_cat_)
  const expenseId = selectedExpense?.expenseByCategoryId;
  
  return (
    <AddExpenseModal
      isOpen={isOpen}
      onClose={onClose}
      initialData={initialData}
      expenseId={expenseId}
      onSuccess={onSuccess}
    />
  );
}

export default function ExpensesPage() {
  const { categoryIdToName, isLoading: isLoadingCategories } = useExpenseCategories();
  const { data: categorySummaries, isLoading: isLoadingSummaries } = useGetExpensesByCategoryQuery({});
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'budget'>('overview');
  const router = useRouter();

  const isLoading = isLoadingCategories || isLoadingSummaries;

  const handleOpenPayModal = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsPayModalOpen(true);
  };

  // Placeholder for Add Category
  const handleAddCategory = () => {
    alert('Add Category modal coming soon!');
  };

  // Tab button handlers
  const handleTabClick = (tab: 'overview' | 'analytics' | 'budget') => setActiveTab(tab);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <header className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Expenses</h1>
            <p className="text-lg text-muted-foreground mt-1">
              A complete overview of your business expenditures.
            </p>
          </div>
          <div className="w-full flex flex-col md:flex-row items-center justify-center gap-4">
            {/* Centered Tab Navigation Buttons */}
            <div className="flex bg-muted/60 rounded-full shadow-sm p-1 gap-1 max-w-xl mx-auto">
              <button
                className={`px-7 py-2.5 rounded-full font-semibold transition-all text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                  activeTab === 'overview'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-transparent text-black hover:bg-blue-50 hover:text-blue-700'
                }`}
                onClick={() => handleTabClick('overview')}
              >
                Overview
              </button>
              <button
                className={`px-7 py-2.5 rounded-full font-semibold transition-all text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                  activeTab === 'analytics'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-transparent text-black hover:bg-blue-50 hover:text-blue-700'
                }`}
                onClick={() => handleTabClick('analytics')}
              >
                Expense Analytics
              </button>
              <button
                className={`px-7 py-2.5 rounded-full font-semibold transition-all text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                  activeTab === 'budget'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-transparent text-black hover:bg-blue-50 hover:text-blue-700'
                }`}
                onClick={() => handleTabClick('budget')}
              >
                Budget System
              </button>
            </div>
            {/* Modern Add Expense Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="ml-0 md:ml-8 px-6 py-2 rounded-md border border-black bg-black text-white font-semibold flex items-center gap-2 text-base transition-all hover:bg-neutral-900 hover:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                >
                  <PlusCircleIcon className="h-5 w-5 text-white" />
                  Add
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleAddCategory}>Add Category</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsAddExpenseModalOpen(true)}>Add Expense</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={val => setActiveTab(val as 'overview' | 'analytics' | 'budget')} className="space-y-4">
          <TabsList className="w-full justify-start p-1 bg-muted/50 rounded-lg mb-8 hidden" />
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categorySummaries?.map((summary) => {
                      const hasPending = summary.pendingCount && summary.pendingCount > 0;
                      return (
                        <AccordionItem
                          key={summary.category}
                          value={summary.category}
                          className={cn(
                            "bg-white rounded-2xl shadow-md p-6 mb-4 transition hover:shadow-lg border border-slate-100"
                          )}
                        >
                          <AccordionTrigger className="flex items-center justify-center w-full h-16 p-0 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-sm transition-all duration-150 hover:shadow-md hover:ring-1 hover:ring-blue-100 hover:bg-white/90 hover:no-underline">
                            <div className="w-full flex items-center justify-center">
                              <h3 className="text-xl md:text-2xl font-semibold tracking-tight text-neutral-800 text-center w-full font-sans">
                                {categoryIdToName[summary.category] || summary.category}
                              </h3>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="p-0">
                            <div className="border-t border-dashed my-3" />
                            <ExpenseList categoryId={summary.category} onExpenseClick={handleOpenPayModal} />
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                )}
              </div>
              <div className="lg:col-span-1">
                <ExpenseAnalyticsSidebar summaries={categorySummaries as ExpenseByCategorySummary[] || []} isLoading={isLoading} />
              </div>
            </div>
            {/* Expense Transaction History Section */}
            <section className="max-w-7xl mx-auto mt-12">
              <h2 className="text-2xl font-bold mb-4">Expense Transaction History</h2>
              <ExpenseTransactionHistory />
            </section>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <ExpenseAnalytics />
            </div>
          </TabsContent>
          <TabsContent value="budget" className="space-y-4">
            <section className="max-w-7xl mx-auto mb-10">
              <h2 className="text-2xl font-bold mb-4">Budget System</h2>
              <BudgetSystem />
            </section>
          </TabsContent>
        </Tabs>
      </main>

      {selectedExpense && (
        <PayExpenseModal
          open={isPayModalOpen}
          onOpenChange={setIsPayModalOpen}
          expense={selectedExpense}
          categoryName={categoryIdToName[selectedExpense.category] || selectedExpense.category}
        />
      )}
    </div>
  );
}

// ExpenseTransactionHistory component
function ExpenseTransactionHistory() {
  const { data: transactions, isLoading } = useGetAllExpenseTransactionsQuery();
  const { data: expenses } = useGetExpensesQuery({});
  const { categoryIdToName } = useExpenseCategories();
  const [selectedTxn, setSelectedTxn] = useState<any | null>(null);

  // Map expenseId to expense details for quick lookup
  const expenseMap = useMemo(() => {
    const map: Record<string, { name: string; category: string }> = {};
    if (expenses) {
      for (const exp of expenses) {
        map[exp.expenseId] = {
          name: exp.description || 'Unnamed Expense',
          category: exp.category || 'Uncategorized',
        };
      }
    }
    return map;
  }, [expenses]);

  // Prepare table data
  const tableData = useMemo(() => {
    if (!transactions) return [];
    return transactions.map((txn: ExpenseTransaction, idx: number) => {
      const expense = expenseMap[txn.expenseId] || { name: '-', category: '-' };
      const categoryName = categoryIdToName[expense.category] || expense.category || '-';
      return {
        id: (txn as any).expenseTransactionId || txn.id || idx,
        date: new Date(txn.date).toLocaleDateString(),
        amount: txn.amount,
        paymentMethod: txn.paymentMethod,
        notes: txn.notes || '-',
        status: txn.status,
        expenseName: expense.name,
        category: categoryName,
        raw: txn,
        expense,
      };
    });
  }, [transactions, expenseMap, categoryIdToName]);

  // Table columns
  const columns: ColumnDef<{
    id: string | number;
    date: string;
    amount: number;
    paymentMethod: 'Bank Transfer' | 'Cheque' | 'UPI' | 'Cash';
    notes: string;
    status: string;
    expenseName: string;
    category: string;
    raw: ExpenseTransaction;
    expense: { name: string; category: string };
  }>[] = useMemo(() => [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: (info: any) => <span>{info.getValue()}</span>,
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: (info: any) => <span className="font-semibold text-gray-900">₹{Number(info.getValue()).toLocaleString()}</span>,
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Payment Method',
    },
    {
      accessorKey: 'notes',
      header: 'Notes',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (info: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${info.getValue() === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{info.getValue()}</span>
      ),
    },
    {
      accessorKey: 'expenseName',
      header: 'Expense Name',
      cell: (info: any) => <span className="font-medium">{info.getValue()}</span>,
    },
    {
      accessorKey: 'category',
      header: 'Category',
    },
  ], []);

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Loading transaction history...</div>;
  }
  if (!transactions || transactions.length === 0) {
    return <div className="py-8 text-center text-muted-foreground">No expense transactions found.</div>;
  }

  // Custom row click handler for DataTable
  const handleRowClick = (row: any) => {
    console.log('Row clicked:', row);
    setSelectedTxn(row);
  };

  return (
    <div className="bg-white rounded-lg shadow border p-2">
      <DataTable columns={columns} data={tableData} searchKey="expenseName" onRowClick={handleRowClick} />
      <TransactionDetailModal open={!!selectedTxn} onOpenChange={() => setSelectedTxn(null)} txn={selectedTxn} />
    </div>
  );
}

// TransactionDetailModal component
function TransactionDetailModal({ open, onOpenChange, txn }: { open: boolean, onOpenChange: () => void, txn: any }) {
  const raw = txn?.raw;
  const expense = txn?.expense;
  const { toast } = useToast();

  // Copy to clipboard for Transaction ID
  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    toast({ title: 'Copied!', description: 'Transaction ID copied to clipboard.' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-full p-0 bg-gray-50 rounded-2xl overflow-hidden shadow-2xl font-sans border-0">
        <DialogTitle><VisuallyHidden>Expense Transaction Details</VisuallyHidden></DialogTitle>
        <div className="flex flex-col md:flex-row">
          {/* Left: Summary Card */}
          <div className="md:w-1/3 bg-gradient-to-br from-blue-700 to-blue-400 flex flex-col items-center justify-center p-16 gap-10 min-h-[520px]">
            <div className="flex flex-col items-center gap-4">
              <CreditCard className="h-20 w-20 text-white bg-blue-500 rounded-full p-5 shadow-lg mb-2" />
              <span className="text-white text-2xl font-semibold tracking-wide">Expense Transaction</span>
              {raw && (
                <span className="text-blue-100 text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 inline-block" />
                  {new Date(raw.date).toLocaleDateString()}
                </span>
              )}
            </div>
            {raw && (
              <div className="flex flex-col items-center gap-2 mt-10">
                <span className="text-5xl font-extrabold text-white drop-shadow">₹{raw.amount.toLocaleString()}</span>
                <span className={`mt-2 px-6 py-2 rounded-full text-lg font-semibold tracking-wide ${raw.status === 'COMPLETED' ? 'bg-green-200 text-green-900' : 'bg-yellow-200 text-yellow-900'}`}>{raw.status}</span>
              </div>
            )}
          </div>
          {/* Right: Details */}
          <div className="md:w-2/3 p-14 flex flex-col gap-12 bg-white">
            <div className="bg-gray-50 rounded-xl shadow-sm p-10 mt-0">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight">Transaction Details</h2>
              {raw && expense ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-8">
                  <DetailItem label="Payment Method">
                    <span className="flex items-center gap-2 text-lg font-medium text-gray-800"><CreditCard className="h-6 w-6 text-blue-500" />{raw.paymentMethod}</span>
                  </DetailItem>
                  <DetailItem label="Expense Name">
                    <span className="font-semibold text-gray-900 text-lg">{expense.name}</span>
                  </DetailItem>
                  <DetailItem label="Category">
                    <span className="flex items-center gap-2 text-lg font-medium text-gray-800"><Tag className="h-6 w-6 text-blue-500" />{txn.category}</span>
                  </DetailItem>
                  <DetailItem label="Notes">
                    <span className="flex items-center gap-2 text-base text-gray-700"><FileText className="h-6 w-6 text-blue-500" />{raw.notes || '-'}</span>
                  </DetailItem>
                  <DetailItem label="Transaction ID">
                    <span className="flex items-center gap-2 text-base text-gray-700 group cursor-pointer" onClick={() => handleCopy((raw as any).expenseTransactionId || raw.id)} title="Copy Transaction ID">
                      <Hash className="h-6 w-6 text-blue-500" />
                      <span className="group-hover:underline group-hover:text-blue-700 transition-colors duration-150">{(raw as any).expenseTransactionId || raw.id}</span>
                      <svg className="h-4 w-4 text-gray-400 group-hover:text-blue-700 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16h8M8 12h8m-7 8h6a2 2 0 002-2V6a2 2 0 00-2-2H8a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </span>
                  </DetailItem>
                  <DetailItem label="Created At">
                    <span className="text-base text-gray-700">{new Date(raw.createdAt).toLocaleString()}</span>
                  </DetailItem>
                  <DetailItem label="Updated At">
                    <span className="text-base text-gray-700">{new Date(raw.updatedAt).toLocaleString()}</span>
                  </DetailItem>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">No transaction selected.</div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Modern detail item component
function DetailItem({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-b pb-5 last:border-b-0">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</span>
      {children}
    </div>
  );
}
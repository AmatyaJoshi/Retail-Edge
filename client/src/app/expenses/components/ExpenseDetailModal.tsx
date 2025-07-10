"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { useGetExpenseTransactionsQuery } from "@/state/api";
import PayExpenseModal from "./PayExpenseModal";
import { CalendarIcon, CreditCard, FileText, Tag, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Expense } from "@/state/api";
import type { ExpenseTransaction } from "@/state/api";

interface ExpenseDetailModalProps {
  expense: Expense | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ExpenseDetailModal({ expense, isOpen, onClose }: ExpenseDetailModalProps) {
  const [payModalOpen, setPayModalOpen] = useState(false);
  const { data: transactions, isLoading: isLoadingTransactions } = useGetExpenseTransactionsQuery(
    expense?.expenseId || "", 
    { skip: !expense }
  );
  
  if (!expense) return null;

  const statusColor = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  const paymentStatusColor = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PARTIAL: "bg-blue-100 text-blue-800",
    PAID: "bg-green-100 text-green-800",
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const remainingAmount = expense.amount - expense.paidAmount;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Expense Details</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Category:</span>
                <span className="ml-2 text-sm capitalize">{expense.category}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium">Payment Type:</span>
                <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200 capitalize">
                  {expense.paymentType || '-'}
                </span>
              </div>
              
              <div className="flex items-center">
                <span className="mr-2 h-4 w-4 text-muted-foreground">₹</span>
                <span className="text-sm font-medium">Amount:</span>
                <span className="ml-2 text-sm">{formatCurrency(Number(expense.amount) || 0)}</span>
              </div>
              
              {expense.budget > 0 && (
                <div className="flex items-center">
                  <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Budget:</span>
                  <span className="ml-2 text-sm">{formatCurrency(Number(expense.budget) || 0)}</span>
                </div>
              )}
              
              {expense.vendor && (
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Vendor:</span>
                  <span className="ml-2 text-sm">{expense.vendor || '-'}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-sm font-medium">Status:</span>
                <Badge className={cn("ml-2", statusColor[expense.status])}>
                  {expense.status ? String(expense.status).toUpperCase() : '-'}
                </Badge>
              </div>
              
              <div className="flex items-center">
                <span className="text-sm font-medium">Payment Status:</span>
                <Badge className={cn("ml-2", paymentStatusColor[expense.paymentStatus])}>
                  {expense.paymentStatus || '-'}
                </Badge>
              </div>
              
              <div className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Created:</span>
                <span className="ml-2 text-sm">
                  {expense.timestamp ? format(new Date(expense.timestamp), "PPP") : '-'}
                </span>
              </div>
              
              {expense.dueDate && (
                <div className="flex items-center">
                  <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Due Date:</span>
                  <span className="ml-2 text-sm">
                    {expense.dueDate ? format(new Date(expense.dueDate), "PPP") : '-'}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {expense.description && (
            <div className="mb-4">
              <div className="flex items-start">
                <FileText className="mr-2 h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <span className="text-sm font-medium">Description:</span>
                  <p className="text-sm mt-1">{expense.description}</p>
                </div>
              </div>
            </div>
          )}
          
          <Separator className="my-4" />
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Payment Summary</h3>
              {expense.paymentStatus !== "PAID" && (
                <Button 
                  onClick={() => setPayModalOpen(true)}
                  variant="outline"
                  size="sm"
                >
                  Make Payment
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="p-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <p className="text-lg font-bold">{formatCurrency(expense.amount)}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="p-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Paid</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <p className="text-lg font-bold text-green-600">{formatCurrency(Number(expense.paidAmount) || 0)}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="p-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Remaining</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <p className={cn("text-lg font-bold", remainingAmount > 0 ? "text-red-600" : "text-green-600")}>
                    {formatCurrency(Number(remainingAmount) || 0)}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Payment History</h3>
            {isLoadingTransactions ? (
              <p className="text-sm text-muted-foreground">Loading transactions...</p>
            ) : !transactions || transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payment transactions found.</p>
            ) : (
              <div className="space-y-2">
                {transactions.map((transaction: ExpenseTransaction) => (
                  <div 
                    key={transaction.id} 
                    className="border rounded-md p-3 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{formatCurrency(transaction.amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(transaction.date), "PPP")} via {transaction.paymentMethod}
                      </p>
                      {transaction.notes && (
                        <p className="text-xs mt-1">{transaction.notes}</p>
                      )}
                    </div>
                    <Badge>{transaction.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end mt-6 gap-2">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {expense && (
        <PayExpenseModal
          open={payModalOpen}
          onOpenChange={setPayModalOpen}
          expense={expense}
          categoryName={expense.category}
        />
      )}
    </>
  );
}

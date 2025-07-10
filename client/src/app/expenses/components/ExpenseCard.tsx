"use client";

import React, { useState } from 'react';
import type { Expense } from '@/state/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PaymentTracking from './PaymentTracking';
import { AddExpenseModal } from './AddExpenseModal';
import { useToast } from "@/components/ui/use-toast";

export interface ExpenseCardProps {
  expense: Expense;
  onDelete: (expenseId: string) => Promise<void>;
  onEdit: (expense: Expense) => void;
  isLoading?: boolean;
}

export default function ExpenseCard({ expense, onDelete, onEdit, isLoading }: ExpenseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!onDelete) return;
    try {
      await onDelete(expense.expenseId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      });
    }
  };

  const handleEdit = () => {
    onEdit?.(expense);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null | undefined, fallback: string = 'N/A') => {
    if (!dateString) return fallback;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return fallback;
      return format(date, 'dd MMM yyyy');
    } catch (error) {
      return fallback;
    }
  };

  const statusColors = {
    'approved': 'bg-green-100 text-green-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'rejected': 'bg-red-100 text-red-800'
  };

  const paymentStatusColors = {
    'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'PARTIAL': 'bg-blue-100 text-blue-800 border-blue-200',
    'PAID': 'bg-green-100 text-green-800 border-green-200'
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              {expense.category}
              {expense.paymentType && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200">
                  {expense.paymentType}
                </span>
              )}
              <Badge 
                className={`text-xs px-2 py-0.5 ${statusColors[expense.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}
              >
                {expense.status}
              </Badge>
            </CardTitle>
            <CardDescription>
              {expense.vendor ? `Vendor: ${expense.vendor}` : 'No vendor specified'}
            </CardDescription>
          </div>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">
              {expense.category}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete}>              <span className="flex items-center text-red-500">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold">
                {formatCurrency(expense.amount)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Due: {formatDate(expense.dueDate)}
              </div>
            </div>
            <Badge
              variant="outline"
              className={paymentStatusColors[expense.paymentStatus as keyof typeof paymentStatusColors]}
            >
              {expense.paymentStatus}
            </Badge>
          </div>

          {expense.description && (
            <div className="text-sm text-muted-foreground">
              {expense.description}
            </div>          )}          <PaymentTracking
            expenseId={expense.expenseId}
            totalAmount={expense.amount}
            paidAmount={expense.paidAmount}
            lastPaymentDate={expense.lastPaymentDate}
          />

          <div className="flex justify-between items-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Show More
                </>
              )}
            </Button>
          </div>

          {isExpanded && (
            <div className="pt-4 space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-muted-foreground">Created</div>
                <div>{formatDate(expense.timestamp)}</div>
                <div className="text-muted-foreground">Budget</div>
                <div>{formatCurrency(expense.budget)}</div>
                <div className="text-muted-foreground">Status</div>
                <div className="capitalize">{expense.status}</div>
                <div className="text-muted-foreground">Payment Type</div>
                <div className="capitalize">{expense.paymentType || '-'}</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

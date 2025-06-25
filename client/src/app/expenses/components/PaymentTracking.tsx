"use client";

import { type ReactNode } from 'react';
import React, { useState } from 'react';
import { 
  useGetExpenseTransactionsQuery, 
  useAddExpenseTransactionMutation,
  type Expense
} from '@/state/api';
import type { ExpenseTransaction, PaymentMethod } from '@/app/expenses/types';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';



interface PaymentTrackingProps {
  totalAmount: number;
  paidAmount: number;
  lastPaymentDate?: string | null | undefined;
  expenseId: string;
}

interface NewPayment {
  amount: number;
  paymentMethod: PaymentMethod;
  reference: string;
  notes: string;
  paymentDate: string;
}

export default function PaymentTracking({
  totalAmount,
  paidAmount,
  lastPaymentDate,
  expenseId
}: PaymentTrackingProps): ReactNode {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPayment, setNewPayment] = useState<NewPayment>({
    amount: 0,
    paymentMethod: 'Bank Transfer',
    reference: '',
    notes: '',
    paymentDate: format(new Date(), 'yyyy-MM-dd')
  });

  const { data: transactions = [], isLoading } = useGetExpenseTransactionsQuery(expenseId);
  const [addTransaction] = useAddExpenseTransactionMutation();
  const { toast } = useToast();

  const paymentStatusColors: Record<string, string> = {
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'PARTIAL': 'bg-blue-100 text-blue-800',
    'PAID': 'bg-green-100 text-green-800',
    'OVERDUE': 'bg-red-100 text-red-800',
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPayment.amount <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Payment amount must be greater than zero"
      });
      return;
    }

    if (newPayment.amount > (totalAmount - paidAmount)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Payment amount cannot exceed the remaining balance"
      });
      return;
    }

    try {
      const transactionData: Omit<ExpenseTransaction, "id" | "createdAt" | "updatedAt"> = {
        expenseId,
        amount: Number(newPayment.amount),
        type: "EXPENSE",
        status: "COMPLETED",
        paymentMethod: newPayment.paymentMethod,
        reference: newPayment.reference || "",
        notes: newPayment.notes || "",
        date: new Date(newPayment.paymentDate).toISOString()
      };
      
      await addTransaction(transactionData).unwrap();
      
      toast({
        title: "Success",
        description: "Payment recorded successfully"
      });
      setDialogOpen(false);
      
      setNewPayment({
        amount: 0,
        paymentMethod: 'Bank Transfer',
        reference: '',
        notes: '',
        paymentDate: format(new Date(), 'yyyy-MM-dd')
      });
    } catch (error) {
      console.error('Failed to record payment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to record payment"
      });
    }
  };

  const paymentStatus = paidAmount >= totalAmount ? 'PAID'
    : paidAmount > 0 ? 'PARTIAL'
    : 'PENDING';
  
  return (
    <div className="mt-4">
      {/* Payment Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">Payment Tracking</h3>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${paymentStatusColors[paymentStatus]}`}>
          {paymentStatus}
        </div>
      </div>

      {/* Payment Details */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Total Amount:</span>
          <p className="text-lg font-semibold">{formatCurrency(totalAmount)}</p>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Paid Amount:</span>
          <span className="text-sm font-medium text-green-600">
            {formatCurrency(paidAmount)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Remaining:</span>
          <span className="text-sm font-medium text-red-600">
            {formatCurrency(totalAmount - paidAmount)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Last Payment:</span>
          <span className="text-sm">
            {lastPaymentDate ? format(new Date(lastPaymentDate), 'dd MMM yyyy') : 'N/A'}
          </span>
        </div>

        {/* Add Payment Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={paymentStatus === 'PAID'} size="sm" variant="outline" className="w-full mt-2">
              Add Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Payment</DialogTitle>
              <DialogDescription>
                Enter payment details for this expense
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="space-y-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    type="number"
                    id="amount"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment({...newPayment, amount: parseFloat(e.target.value) || 0})}
                    placeholder="Enter payment amount"
                  />
                </div>

                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="paymentMethod">Method</Label>
                  <Select
                    value={newPayment.paymentMethod}
                    onValueChange={(value: PaymentMethod) => setNewPayment({...newPayment, paymentMethod: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="reference">Reference</Label>
                  <Input
                    id="reference"
                    value={newPayment.reference}
                    onChange={(e) => setNewPayment({...newPayment, reference: e.target.value})}
                    placeholder="Enter reference"
                  />
                </div>

                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="paymentDate">Date</Label>
                  <div className="relative">
                    <CalendarIcon className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <Input
                      id="paymentDate"
                      type="date"
                      className="pl-8"
                      value={newPayment.paymentDate}
                      onChange={(e) => setNewPayment({...newPayment, paymentDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newPayment.notes}
                    onChange={(e) => setNewPayment({...newPayment, notes: e.target.value})}
                    placeholder="Enter any notes"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Payment</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <div className="mt-4">
          {isLoading ? (
            <p>Loading payment history...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{format(new Date(transaction.date), 'dd MMM yyyy')}</TableCell>
                    <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                    <TableCell>{transaction.paymentMethod}</TableCell>
                    <TableCell>{transaction.reference || '-'}</TableCell>
                  </TableRow>
                ))}
                {transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500">
                      No payments recorded yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}

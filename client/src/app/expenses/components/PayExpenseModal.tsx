"use client";
import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { useAddExpenseTransactionMutation } from "@/state/api";
import type { Expense, ExpenseTransaction } from '@/state/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tag, Wallet } from "lucide-react";

type PaymentMethod = 'Bank Transfer' | 'Cheque' | 'UPI' | 'Cash';

interface PayExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense;
  categoryName: string;
}

export default function PayExpenseModal({
  open,
  onOpenChange,
  expense,
  categoryName,
}: PayExpenseModalProps) {
  const remainingAmount = useMemo(
    () => expense.amount - (expense.paidAmount || 0),
    [expense]
  );
  const [amount, setAmount] = useState(remainingAmount);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("Bank Transfer");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [addTransaction, { isLoading }] = useAddExpenseTransactionMutation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Amount must be greater than zero.",
        variant: "destructive",
      });
      return;
    }
    if (amount > remainingAmount) {
      toast({
        title: "Invalid Amount",
        description: `Amount cannot exceed the remaining balance of ₹${remainingAmount.toLocaleString()}.`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Type guard for categoryId extraction
      let categoryId: string | undefined = undefined;
      if (typeof expense.category === 'object' && expense.category !== null && 'id' in expense.category) {
        categoryId = (expense.category as { id: string }).id;
      } else if (typeof expense.category === 'string') {
        categoryId = expense.category;
      }
      const transactionData = {
        expenseId: expense.expenseId,
        amount: Number(amount),
        type: "EXPENSE",
        status: "COMPLETED",
        paymentMethod,
        date: new Date(date).toISOString(),
        notes: notes.trim() || "",
        categoryId,
        transactionType: (expense as any).transactionType || expense.paymentType || undefined,
      };

      await addTransaction(transactionData as any).unwrap();

      toast({
        title: "Payment Successful",
        description: `₹${amount.toLocaleString()} has been paid.`,
      });

      onOpenChange(false);
    } catch (err) {
      console.error("Payment error:", err);
      toast({
        title: "Payment Failed",
        description: "There was an error recording your payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Record a Payment</DialogTitle>
          <DialogDescription>
            Settle the payment for your expense.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
          {/* Left side: Expense Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="mr-3 h-5 w-5 text-muted-foreground" />
                  Expense Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-semibold">{categoryName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Type</p>
                  <span className="inline-block px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200 capitalize">
                    {(expense as any).transactionType || expense.paymentType || '-'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-semibold">
                    {expense.description || "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wallet className="mr-3 h-5 w-5 text-muted-foreground" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-bold text-lg">
                    ₹{expense.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-muted-foreground">Already Paid:</span>
                  <span className="font-semibold text-green-600">
                    ₹{(expense.paidAmount || 0).toLocaleString()}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-baseline">
                  <span className="text-muted-foreground font-bold">
                    Remaining:
                  </span>
                  <span className="font-bold text-xl text-red-600">
                    ₹{remainingAmount.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right side: Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount to Pay</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={paymentMethod}
                onValueChange={(value: PaymentMethod) =>
                  setPaymentMethod(value)
                }
              >
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date">Payment Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes about the payment..."
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading
                  ? "Processing..."
                  : `Pay ₹${amount.toLocaleString()}`}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

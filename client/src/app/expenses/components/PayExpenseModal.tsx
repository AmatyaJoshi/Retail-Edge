"use client";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { useAddExpenseTransactionMutation } from "@/state/api";
import type { Expense, ExpenseTransaction, PaymentMethod } from "@/app/expenses/types";

interface PayExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense;
}

export default function PayExpenseModal({ open, onOpenChange, expense }: PayExpenseModalProps) {  const [amount, setAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Bank Transfer");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [addTransaction, { isLoading }] = useAddExpenseTransactionMutation();
  const { toast } = useToast();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (amount <= 0) {
      toast({
        title: "Error",
        description: "Amount must be greater than zero",
        variant: "destructive",
      });
      return;
    }
    if (amount > (expense.amount - (expense.paidAmount || 0))) {
      toast({
        title: "Error",
        description: "Amount exceeds outstanding balance",
        variant: "destructive",
      });
      return;
    }
    if (expense.dueDate && new Date(date) > new Date(expense.dueDate)) {
      toast({
        title: "Error",
        description: "Cannot pay after due date",
        variant: "destructive",
      });
      return;
    }    try {
      const transactionData: Omit<ExpenseTransaction, "id" | "createdAt" | "updatedAt"> = {
        expenseId: expense.expenseId,
        amount: Number(amount),
        type: "EXPENSE",
        status: "COMPLETED",
        paymentMethod,
        date: new Date(date).toISOString(),
        reference: reference.trim() || "",
        notes: notes.trim() || ""
      };
      
      await addTransaction(transactionData).unwrap();
      
      toast({
        title: "Success",
        description: "Payment successful",
      });

      // Reset form
      setAmount(0);
      setReference("");
      setNotes("");
      setDate(format(new Date(), "yyyy-MM-dd"));
      onOpenChange(false);
    } catch (err) {
      console.error('Payment error:', err);
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pay Expense</DialogTitle>
          <DialogDescription>
            Enter payment details for <b>{expense.description || 'Unnamed Expense'}</b> (Due: ₹{expense.amount - (expense.paidAmount || 0)})
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" min={1} max={expense.amount - (expense.paidAmount || 0)} value={amount} onChange={e => setAmount(Number(e.target.value))} required />
          </div>
          <div>
            <Label htmlFor="paymentMethod">Payment Method</Label>            <Select 
              value={paymentMethod} 
              onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}
            >
              <SelectTrigger id="paymentMethod">
                <SelectValue />
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
            <Label htmlFor="reference">Reference</Label>
            <Input id="reference" value={reference} onChange={e => setReference(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading} className="w-full">Pay</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

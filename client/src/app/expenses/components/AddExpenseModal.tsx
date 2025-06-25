"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { useAddExpenseMutation, useUpdateExpenseMutation } from "@/state/api";

export interface ExpenseFormBase {
  category: string;
  amount: number;
  description: string;
  vendor: string;
  dueDate: string;
  budget: number | undefined;
  status: "pending" | "approved" | "rejected" | undefined;
  paymentStatus: "PENDING" | "PARTIAL" | "PAID" | undefined;
  paidAmount: number | undefined;
  lastPaymentDate?: string | null;
}

export interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: ExpenseFormBase | undefined;
  expenseId?: string | undefined;
  onSuccess: () => void;
}

// Form state interface with clear typing for optional vs required fields
interface ExpenseFormData {
  category: string;
  amount: number;
  description: string;
  vendor: string;
  dueDate: string;
  budget: number;
  status: "pending" | "approved" | "rejected";
  paymentStatus: "PENDING" | "PARTIAL" | "PAID";
  paidAmount: number | undefined; // Explicitly mark as optional with undefined
  lastPaymentDate?: string | null;
  paymentType: "Subscription" | "Prepaid" | "Postpaid";
}

const EXPENSE_CATEGORIES = [
  "Inventory",
  "Utilities",
  "Rent",
  "Salaries",
  "Marketing",
  "Maintenance",
  "Office Supplies",
  "Insurance",
  "Other",
];

export function AddExpenseModal({
  isOpen,
  onClose,
  initialData,
  expenseId,
  onSuccess,
}: AddExpenseModalProps) {
  const defaultFormData: ExpenseFormData = {
    category: "",
    amount: 0,
    description: "",
    vendor: "",
    dueDate: "",
    budget: 0,
    status: "pending",
    paymentStatus: "PENDING",
    paidAmount: undefined, // Explicitly set as undefined in default form data
    lastPaymentDate: null,
    paymentType: "Prepaid",
  };

  const [formData, setFormData] = useState<ExpenseFormData>(() => {
    if (!initialData) {
      return defaultFormData;
    }

    return {
      category: initialData.category || defaultFormData.category,
      amount: Number(initialData.amount) || defaultFormData.amount,
      description: initialData.description || defaultFormData.description,
      vendor: initialData.vendor || defaultFormData.vendor,
      dueDate: initialData.dueDate || defaultFormData.dueDate,
      budget: Number(initialData.budget) || defaultFormData.budget,
      status: initialData.status || defaultFormData.status,
      paymentStatus: initialData.paymentStatus || defaultFormData.paymentStatus,
      // Allow undefined for paidAmount in the form, but we'll provide a default when submitting
      paidAmount: initialData.paidAmount !== undefined ? Number(initialData.paidAmount) : undefined,
      lastPaymentDate: initialData.lastPaymentDate || null,
      paymentType: (initialData as any).paymentType || "Prepaid",
    };
  });

  const { toast } = useToast();
  const [addExpense] = useAddExpenseMutation();
  const [updateExpense] = useUpdateExpenseMutation();

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof Pick<ExpenseFormData, "amount" | "budget" | "paidAmount">
  ) => {
    const value = e.target.value;
    
    if (field === "paidAmount") {
      // For paidAmount, treat empty string as undefined
      setFormData((prev) => ({
        ...prev,
        [field]: value === "" ? undefined : Number(value) || 0,
      }));
    } else {
      // For required number fields, treat empty as 0
      setFormData((prev) => ({
        ...prev,
        [field]: value === "" ? 0 : Number(value) || 0,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!formData.category) throw new Error("Category is required");
      if (!formData.amount) throw new Error("Amount is required");      // Common fields for both add and update
      const commonData = {
        category: formData.category,
        amount: Number(formData.amount),
        date: new Date().toISOString(), // Backend expects 'date' not 'timestamp'
        description: formData.description?.trim() || "",
        vendor: formData.vendor?.trim() || "",
        status: formData.status,
        dueDate: formData.dueDate || "",
        budget: Number(formData.budget),
        paymentStatus: formData.paymentStatus,
        paidAmount: formData.paidAmount !== undefined ? Number(formData.paidAmount) : 0,
        paymentType: formData.paymentType,
      };

      // Check if the ID is an ExpenseByCategory ID or a real Expense ID
      const isExpenseByCategoryId = expenseId && expenseId.startsWith('exp_cat_');
      
      // Log what we're attempting to update
      console.log(`Attempting to ${expenseId ? 'update' : 'add'} expense with ${isExpenseByCategoryId ? 'category' : 'expense'} ID: ${expenseId || 'new'}`);
      console.log("Payload:", JSON.stringify(commonData, null, 2));
        // For ExpenseByCategory IDs, we should create a new expense rather than update
      if (!expenseId || isExpenseByCategoryId) {
        try {
          if (isExpenseByCategoryId) {
            console.log("This is an ExpenseByCategory ID, creating a new expense instead");
          }
          
          // When adding a new expense, make sure we provide the fields in the format the backend expects
          const addPayload: any = {
            ...commonData,
            // Rename date to timestamp for the add endpoint
            timestamp: commonData.date,
          };
          delete addPayload.date;
          
          console.log("Add expense payload:", JSON.stringify(addPayload, null, 2));
          const result = await addExpense(addPayload).unwrap();
          console.log("Add expense response:", result);
          toast({
            title: "Success",
            description: "Expense created successfully",
          });
          onClose();
          onSuccess?.();
        } catch (addError: any) {
          console.error("Error creating expense:", {
            message: addError.message,
            data: addError.data,
            status: addError.status,
            error: addError
          });
          throw addError;
        }
      } else {
        // This is a real expense ID, proceed with update
        try {
          console.log("Updating expense with ID:", expenseId);
          
          const result = await updateExpense({
            expenseId,
            expense: commonData,
          }).unwrap();
          
          console.log("Update expense response:", result);
          toast({
            title: "Success",
            description: "Expense updated successfully",
          });
          onClose();
          onSuccess?.();
        } catch (updateError: any) {
          console.error("Error updating expense:", {
            message: updateError.message,
            data: updateError.data,
            status: updateError.status,
            error: updateError
          });
          throw updateError;
        }
      }    } catch (error: any) {
      console.error("Error submitting expense:", {
        message: error.message,
        data: error.data,
        status: error.status,
        stack: error.stack,
        error
      });
      
      // Better error message handling
      let errorMessage = "Failed to submit expense.";
      
      if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.data) {
        errorMessage = typeof error.data === 'object' ? JSON.stringify(error.data) : String(error.data);
      }
      
      // Add more debugging info for empty error objects
      if (JSON.stringify(error) === '{}') {
        errorMessage += " The server may be unreachable or the expense ID format may be incorrect.";
        console.error("Empty error object received - likely a 404 Not Found or network issue");
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(value: boolean) => {
        if (!value) {
          onClose();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant={expenseId ? "outline" : "default"}>
          {expenseId ? "Edit Expense" : "Add Expense"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {expenseId ? "Edit Expense" : "Add New Expense"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentType" className="text-right">
                Payment Type
              </Label>
              <Select
                value={formData.paymentType}
                onValueChange={value =>
                  setFormData(prev => ({ ...prev, paymentType: value as "Subscription" | "Prepaid" | "Postpaid" }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Subscription">Subscription</SelectItem>
                  <SelectItem value="Prepaid">Prepaid</SelectItem>
                  <SelectItem value="Postpaid">Postpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>              <Input
                id="amount"
                type="number"
                className="col-span-3"
                value={formData.amount || ""}
                onChange={(e) => handleNumberChange(e, "amount")}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="budget" className="text-right">
                Budget
              </Label>
              <Input                id="budget"
                type="number"
                className="col-span-3"
                value={formData.budget || ""}
                onChange={(e) => handleNumberChange(e, "budget")}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vendor" className="text-right">
                Vendor
              </Label>
              <Input
                id="vendor"
                className="col-span-3"
                value={formData.vendor}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, vendor: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">
                Due Date
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dueDate
                        ? format(new Date(formData.dueDate), "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.dueDate ? new Date(formData.dueDate) : undefined}
                      onSelect={(date) =>
                        date &&
                        setFormData((prev) => ({ ...prev, dueDate: date.toISOString() }))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                className="col-span-3"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paidAmount" className="text-right">
                Paid Amount
              </Label>
              <div className="col-span-3 flex gap-2">
                <Input
                  id="paidAmount"
                  type="number"
                  placeholder="Leave empty if not paid"
                  className="flex-1"
                  value={formData.paidAmount ?? ""}
                  onChange={(e) => handleNumberChange(e, "paidAmount")}
                />
                {formData.paidAmount !== undefined && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, paidAmount: undefined }))}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-4 py-4">
            <Button
              variant="outline"
              onClick={() => {
                setFormData(defaultFormData);
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {expenseId ? "Update Expense" : "Add Expense"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

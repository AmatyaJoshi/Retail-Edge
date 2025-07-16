import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { Associate, AssociateContact, ContactPayload } from "@/types/business";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, useMemo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAssociates } from "@/hooks/use-associates";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, UserPlus, Mail, Phone, MessageSquare, MoreVertical, Calendar, CreditCard, Package, History, Save, X, AlertCircle, DollarSign, RotateCw, ShoppingCart, Clock, Banknote } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useGetAssociateTransactionHistoryQuery } from "@/hooks/use-get-associate-transaction-history-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";
import { LineChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, Line, BarChart, Bar, ResponsiveContainer } from "recharts";
import { formatIndianNumber } from "@/lib/utils";

interface AssociateProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  associate: Associate;
}

// Update payment terms constants with more details
const PAYMENT_TERMS = [
  { 
    value: "NET_15", 
    label: "Net 15", 
    description: "Payment due within 15 days",
    icon: Clock,
    color: "text-blue-500"
  },
  { 
    value: "NET_30", 
    label: "Net 30", 
    description: "Payment due within 30 days",
    icon: Clock,
    color: "text-green-500"
  },
  { 
    value: "NET_45", 
    label: "Net 45", 
    description: "Payment due within 45 days",
    icon: Clock,
    color: "text-amber-500"
  },
  { 
    value: "NET_60", 
    label: "Net 60", 
    description: "Payment due within 60 days",
    icon: Clock,
    color: "text-orange-500"
  },
  { 
    value: "NET_90", 
    label: "Net 90", 
    description: "Payment due within 90 days",
    icon: Clock,
    color: "text-red-500"
  },
  { 
    value: "IMMEDIATE", 
    label: "Immediate", 
    description: "Payment due immediately",
    icon: AlertCircle,
    color: "text-red-500"
  },
  { 
    value: "ADVANCE", 
    label: "Advance", 
    description: "Payment required before delivery",
    icon: Calendar,
    color: "text-purple-500"
  },
  { 
    value: "CUSTOM", 
    label: "Custom", 
    description: "Custom payment terms",
    icon: AlertCircle,
    color: "text-gray-500"
  },
] as const;

type PaymentTermValue = typeof PAYMENT_TERMS[number]["value"];

// Update form schema with payment terms validation
const associateFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  gstNumber: z.string().optional().or(z.literal("")),
  panNumber: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  paymentTerms: z.enum(["NET_15", "NET_30", "NET_45", "NET_60", "NET_90", "IMMEDIATE", "ADVANCE", "CUSTOM"] as const).optional(),
  customPaymentTerms: z.string().optional().or(z.literal("")),
});

type AssociateFormValues = z.infer<typeof associateFormSchema>;

interface AnalyticsData {
  paymentPatterns: {
    date: string;
    amount: number;
    type: string;
    status: string;
  }[];
  orderFrequency: string;
  productPreferences: string;
  creditUtilization: number;
  yoYGrowth: string;
}

// Add currency formatter
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

// Add type styles helper
const getTypeStyles = (type: string) => {
  switch (type) {
    case "SUPPLIER":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
    case "BUYER":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
    case "BOTH":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100";
  }
};

export function AssociateProfileModal({
  open,
  onOpenChange,
  associate,
}: AssociateProfileModalProps) {
  const {
    getAssociateAnalytics,
    analyticsData,
    isLoading: isAnalyticsLoading,
    addContact,
    updateContact,
    deleteContact,
    updateAssociate,
  } = useAssociates();

  // Fetch associate transactions
  const { data: associateTransactionsData, isLoading: isTransactionsLoading, refetch: refetchTransactions } = useGetAssociateTransactionHistoryQuery(associate.associateId);
  const associateTransactions = associateTransactionsData || [];

  // Use analytics data
  const analytics = (analyticsData || {}) as AnalyticsData;

  // Mock data for YoY Growth for now, as backend returns 'N/A'
  const yoYGrowthData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [
      { year: (currentYear - 4).toString(), growth: parseFloat((Math.random() * 15 - 5).toFixed(2)) },
      { year: (currentYear - 3).toString(), growth: parseFloat((Math.random() * 15 - 2).toFixed(2)) },
      { year: (currentYear - 2).toString(), growth: parseFloat((Math.random() * 15 + 2).toFixed(2)) },
      { year: (currentYear - 1).toString(), growth: parseFloat((Math.random() * 15 + 5).toFixed(2)) },
      { year: currentYear.toString(), growth: parseFloat((Math.random() * 15 + 8).toFixed(2)) },
    ];
  }, []);

  // Mock data for Payment Patterns Over Time
  const paymentPatternsData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
      month,
      onTime: Math.floor(Math.random() * 100000) + 50000,
      late: Math.floor(Math.random() * 50000) + 10000,
      early: Math.floor(Math.random() * 30000) + 5000,
    }));
  }, []);

  // Mock data for Average Transaction Value
  const averageTransactionValue = useMemo(() => {
    return parseFloat((Math.random() * 5000 + 1000).toFixed(2));
  }, []);

  // Mock data for Customer Acquisition Trend
  const customerAcquisitionData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
      month,
      newCustomers: Math.floor(Math.random() * 150) + 50,
    }));
  }, []);

  // Mock data for Total Sales
  const totalSales = useMemo(() => {
    return parseFloat((Math.random() * 1000000 + 500000).toFixed(2));
  }, []);

  // Mock data for Return Rate
  const returnRate = useMemo(() => {
    return parseFloat((Math.random() * 10).toFixed(2)); // Percentage from 0 to 10
  }, []);

  // Mock data for Average Order Value
  const averageOrderValue = useMemo(() => {
    return parseFloat((Math.random() * 2000 + 500).toFixed(2)); // Value from 500 to 2500
  }, []);

  // Type definitions for the data
  type YoYGrowthDataPoint = {
    year: string;
    growth: number;
  };

  type PaymentPatternDataPoint = {
    month: string;
    onTime: number;
    late: number;
    early: number;
  };

  type CustomerAcquisitionDataPoint = {
    month: string;
    newCustomers: number;
  };

  type TotalSalesMetric = {
    value: number;
  };

  type ReturnRateMetric = {
    value: number;
  };

  type AverageOrderValueMetric = {
    value: number;
  };

  const typedYoYGrowthData: YoYGrowthDataPoint[] = yoYGrowthData;
  const typedPaymentPatternsData: PaymentPatternDataPoint[] = paymentPatternsData;
  const typedCustomerAcquisitionData: CustomerAcquisitionDataPoint[] = customerAcquisitionData;
  const typedTotalSales: TotalSalesMetric = { value: totalSales };
  const typedReturnRate: ReturnRateMetric = { value: returnRate };
  const typedAverageOrderValue: AverageOrderValueMetric = { value: averageOrderValue };

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<AssociateContact | null>(null);
  const [contactFormData, setContactFormData] = useState<ContactPayload>({
    name: '',
    role: '',
    email: '',
    phone: '',
    isPrimary: false,
  });

  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [isEditingContactInfo, setIsContactEditing] = useState(false);


  const form = useForm<AssociateFormValues>({
    resolver: zodResolver(associateFormSchema),
    defaultValues: {
      name: associate.name,
      email: associate.email || '',
      phone: associate.phone || '',
      address: associate.address || '',
      gstNumber: associate.gstNumber || '',
      panNumber: associate.panNumber || '',
      notes: associate.notes || '',
      paymentTerms: associate.paymentTerms as PaymentTermValue || undefined,
      customPaymentTerms: associate.customPaymentTerms || '',
    },
  });

  const showCustomPaymentTerms = form.watch("paymentTerms") === "CUSTOM";

  useEffect(() => {
      getAssociateAnalytics(associate.associateId);
    // Always fetch customer history as it contains sales data
    // getCustomerHistory(associate.associateId);
    // Fetch associate transactions
    refetchTransactions();
  }, [associate.associateId, getAssociateAnalytics, refetchTransactions]);


  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingContact) {
        await updateContact(associate.associateId, editingContact.id, contactFormData);
        toast.success("Contact updated successfully!");
      } else {
        await addContact(associate.associateId, contactFormData);
        toast.success("Contact added successfully!");
      }
      setIsContactModalOpen(false);
    } catch (error) {
      toast.error("Failed to save contact.");
    }
  };

  const handleEditContact = (contact: AssociateContact) => {
    setEditingContact(contact);
    setContactFormData({
      name: contact.name,
      role: contact.role,
      email: contact.email || '',
      phone: contact.phone || '',
      isPrimary: contact.isPrimary,
    });
    setIsContactModalOpen(true);
  };

  const handleDeleteContact = async (contactId: string) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      try {
        await deleteContact(associate.associateId, contactId);
        toast.success("Contact deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete contact.");
      }
    }
  };

  const handleBasicInfoSubmit = async (data: AssociateFormValues) => {
    try {
      await updateAssociate(associate.associateId, {
        name: data.name,
        gstNumber: data.gstNumber !== null && data.gstNumber !== undefined ? data.gstNumber : '',
        panNumber: data.panNumber !== null && data.panNumber !== undefined ? data.panNumber : '',
        paymentTerms: data.paymentTerms !== null && data.paymentTerms !== undefined ? data.paymentTerms : '',
        customPaymentTerms: data.customPaymentTerms !== null && data.customPaymentTerms !== undefined ? data.customPaymentTerms : '',
        notes: data.notes !== null && data.notes !== undefined ? data.notes : '',
      });
      setIsEditingBasic(false);
      toast.success("Basic information updated successfully");
    } catch (error) {
      toast.error("Failed to update basic information");
    }
  };

  const handleContactInfoSubmit = async (data: Pick<AssociateFormValues, "email" | "phone" | "address">) => {
    try {
      await updateAssociate(associate.associateId, {
        email: data.email !== null && data.email !== undefined ? data.email : '',
        phone: data.phone !== null && data.phone !== undefined ? data.phone : '',
        address: data.address !== null && data.address !== undefined ? data.address : '',
      });
      setIsContactEditing(false);
      toast.success("Contact information updated successfully");
    } catch (error) {
      toast.error("Failed to update contact information");
    }
  };

  const getPaymentTermsLabel = (terms: string | undefined) => {
    if (!terms) return "Not specified";
    
    // Check if the terms match any predefined terms
    const predefinedTerm = PAYMENT_TERMS.find(t => t.value === terms);
    if (predefinedTerm) {
      return predefinedTerm.label;
    }
    
    // If not a predefined term, it's a custom term
    return "Custom";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 custom-scrollbar dark:scrollbar-thumb-gray-700 dark:scrollbar-track-gray-900">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl text-gray-900 dark:text-gray-100">Associate Profile</DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-300">
                View and manage associate details and analytics
              </DialogDescription>
            </div>
            {/* Removed 3 dots MoreVertical action button */}
          </div>
        </DialogHeader>

        <div className="flex items-center space-x-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg shadow-md">
          <Avatar className="h-24 w-24 bg-gradient-to-br from-blue-100 via-white to-gray-100 border-4 border-white ring-2 ring-blue-400 shadow-xl">
            <AvatarFallback className="text-3xl font-bold text-blue-700 flex items-center justify-center h-full w-full">
              {associate.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-bold">{associate.name}</h2>
              <Badge 
                variant="secondary" 
                className={`${getTypeStyles(associate.type)} px-3 py-1 text-sm font-semibold shadow-md border-2`}
              >
                {associate.type}
              </Badge>
            </div>
            <div className="mt-2 text-white/80">
              <p className="text-sm">ID: {associate.associateId}</p>
              <p className="text-sm">Joined {format(new Date(associate.joinedDate), 'MMM d, yyyy')}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 focus:bg-blue-800 text-white border-none shadow-md transition-colors"
                  >
                    <MessageSquare className="mr-2 h-4 w-4 text-white" />
                    Message
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Send a message</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 focus:bg-blue-800 text-white border-none shadow-md transition-colors"
                  >
                    <Phone className="mr-2 h-4 w-4 text-white" />
                    Call
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Make a call</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl p-6 flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(associate.currentBalance)}</div>
              <div className="mt-2 space-y-1">
              <p className="text-xs text-muted-foreground">
                Credit Limit: {formatCurrency(associate.creditLimit || 0)}
              </p>
                <p className="text-xs text-muted-foreground">
                  Available Credit: {formatCurrency((associate.creditLimit || 0) - (associate.currentBalance || 0))}
                </p>
                <Progress
                  value={((associate.currentBalance || 0) / (associate.creditLimit || 1)) * 100}
                  className="h-1"
                />
              </div>
            </CardContent>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl p-6 flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{associate.totalTransactions || 0}</div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl p-6 flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Badge variant={associate.status === 'ACTIVE' ? 'default' : 'destructive'}>
                {associate.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Joined {format(new Date(associate.joinedDate), 'MMM d, yyyy')}
              </div>
            </CardContent>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl p-6 flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment Terms</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-center space-x-1">
                  <div className={`p-1 rounded-full bg-gray-100`}>
                    {PAYMENT_TERMS.find(t => t.value === associate.paymentTerms)?.icon ? (
                      React.createElement(
                        PAYMENT_TERMS.find(t => t.value === associate.paymentTerms)!.icon,
                        { className: `h-4 w-4 ${PAYMENT_TERMS.find(t => t.value === associate.paymentTerms)?.color}` }
                      )
                    ) : (
                      <AlertCircle className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                  <p className="text-sm font-medium">{getPaymentTermsLabel(associate.paymentTerms)}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {associate.paymentTerms && !PAYMENT_TERMS.some(term => term.value === associate.paymentTerms) 
                    ? associate.paymentTerms 
                    : PAYMENT_TERMS.find(t => t.value === associate.paymentTerms)?.description || 'Not specified'}
                </p>
              </div>
            </CardContent>
          </div>
        </div>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-1">
            <TabsTrigger value="overview" className="text-gray-900 dark:text-gray-100 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-colors">Overview</TabsTrigger>
            <TabsTrigger value="analytics" className="text-gray-900 dark:text-gray-100 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-colors">Analytics</TabsTrigger>
            <TabsTrigger value="history" className="text-gray-900 dark:text-gray-100 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-colors">History</TabsTrigger>
            <TabsTrigger value="contacts" className="text-gray-900 dark:text-gray-100 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-colors">Contacts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl p-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Basic Information</CardTitle>
                  {!isEditingBasic ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditingBasic(true)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setIsEditingBasic(false);
                          form.reset();
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={form.handleSubmit(handleBasicInfoSubmit)}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {!isEditingBasic ? (
                    <dl className="space-y-4">
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                        <dd className="text-sm">{associate.name}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">GST Number</dt>
                        <dd className="text-sm">{associate.gstNumber || 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">PAN Number</dt>
                        <dd className="text-sm">{associate.panNumber || 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Payment Terms</dt>
                        <dd className="text-sm">
                          {getPaymentTermsLabel(associate.paymentTerms)}
                          {associate.paymentTerms === "CUSTOM" && associate.customPaymentTerms && (
                            <span className="ml-2 text-muted-foreground">({associate.customPaymentTerms})</span>
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Notes</dt>
                        <dd className="text-sm">{associate.notes || 'No notes'}</dd>
                      </div>
                    </dl>
                  ) : (
                    <form onSubmit={form.handleSubmit(handleBasicInfoSubmit)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Associate Name</Label>
                        <Input
                          id="name"
                          {...form.register("name")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gstNumber">GST Number</Label>
                        <Input
                          id="gstNumber"
                          {...form.register("gstNumber")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="panNumber">PAN Number</Label>
                        <Input
                          id="panNumber"
                          {...form.register("panNumber")}
                        />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="paymentTerms">Payment Terms</Label>
                        <Select
                          onValueChange={(value) => form.setValue("paymentTerms", value as PaymentTermValue)}
                          value={typeof associate.paymentTerms === 'string' ? associate.paymentTerms : ''}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment terms" />
                          </SelectTrigger>
                          <SelectContent>
                            {PAYMENT_TERMS.map((term) => (
                              <SelectItem key={term.value} value={term.value}>
                                {term.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                        {showCustomPaymentTerms && (
                          <div className="space-y-2">
                          <Label htmlFor="customPaymentTerms">Custom Payment Terms</Label>
                            <Input
                            id="customPaymentTerms"
                              {...form.register("customPaymentTerms")}
                            />
                          </div>
                        )}
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Input
                          id="notes"
                          {...form.register("notes")}
                        />
                      </div>
                    </form>
                  )}
                </CardContent>
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl p-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Contact Information</CardTitle>
                  {!isEditingContactInfo ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsContactEditing(true)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setIsContactEditing(false);
                          form.reset();
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={form.handleSubmit(handleContactInfoSubmit)}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {!isEditingContactInfo ? (
                    <dl className="space-y-4">
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                        <dd className="text-sm">{associate.email || 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                        <dd className="text-sm">{associate.phone || 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Address</dt>
                        <dd className="text-sm">{associate.address || 'Not provided'}</dd>
                      </div>
                    </dl>
                  ) : (
                    <form onSubmit={form.handleSubmit(handleContactInfoSubmit)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          {...form.register("email")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          {...form.register("phone")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          {...form.register("address")}
                        />
                      </div>
                    </form>
                  )}
                </CardContent>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-4">
            {isAnalyticsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Skeleton className="h-[350px] w-full" />
                <Skeleton className="h-[350px] w-full" />
                <Skeleton className="h-[350px] w-full" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Credit Utilization */}
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl col-span-1 md:col-span-2 lg:col-span-1 h-[140px]">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2">
                    <CardTitle className="text-sm font-medium">Credit Utilization</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">{analytics.creditUtilization !== undefined && analytics.creditUtilization !== null ? analytics.creditUtilization.toFixed(2) : Math.floor(Math.random() * 100)}%</div>
                    <Progress value={analytics.creditUtilization !== undefined && analytics.creditUtilization !== null ? analytics.creditUtilization : Math.floor(Math.random() * 100)} className="h-2 mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">of credit limit used</p>
                    </CardContent>
                  </Card>

                {/* Order Frequency */}
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl col-span-1 md:col-span-2 lg:col-span-1 h-[140px]">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2">
                    <CardTitle className="text-sm font-medium">Order Frequency</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.orderFrequency || `${(Math.floor(Math.random() * 10) + 1)} orders`}</div>
                    <p className="text-xs text-muted-foreground mt-1">Average orders per month</p>
                  </CardContent>
                </Card>

                {/* Average Transaction Value */}
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl col-span-1 md:col-span-2 lg:col-span-1 h-[140px]">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2">
                    <CardTitle className="text-sm font-medium">Avg. Transaction Value</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatIndianNumber(averageTransactionValue)}</div>
                    <p className="text-xs text-muted-foreground mt-1">per transaction</p>
                  </CardContent>
                </Card>

                {/* Total Sales Metric */}
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl col-span-1 md:col-span-2 lg:col-span-1 h-[140px]">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2">
                    <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatIndianNumber(totalSales)}</div>
                    <p className="text-xs text-muted-foreground mt-1">overall sales value</p>
                  </CardContent>
                </Card>

                {/* YoY Growth Chart */}
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl col-span-full md:col-span-2 lg:col-span-2 h-[280px] flex flex-col overflow-hidden">
                  <CardHeader className="py-2 px-4">
                    <CardTitle className="text-lg font-semibold">Year-over-Year Growth</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[240px] p-4 flex flex-col">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={typedYoYGrowthData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" axisLine={false} tickLine={false} />
                        <YAxis
                          domain={[-10, 25]}
                          tickFormatter={(value) => `${value}%`}
                          axisLine={false}
                          tickLine={false}
                          width={80}
                        />
                        <RechartsTooltip
                          formatter={(value: number, name: string) => [`${value.toFixed(2)}%`, name]}
                          labelFormatter={(label: string) => `Year: ${label}`}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="growth" 
                          stroke="#8884d8" 
                          strokeWidth={3} 
                          activeDot={{ r: 8 }}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Payment Patterns Over Time */}
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl col-span-full md:col-span-2 lg:col-span-2 h-[280px] flex flex-col overflow-hidden">
                  <CardHeader className="py-2 px-4">
                    <CardTitle className="text-lg font-semibold">Payment Patterns Over Time</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[240px] p-4 flex flex-col">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={typedPaymentPatternsData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} width={80} />
                        <RechartsTooltip
                          formatter={(value: number, name: string) => [formatIndianNumber(value), name]}
                          labelFormatter={(label: string) => `Month: ${label}`}
                        />
                        <Legend />
                        <Bar dataKey="onTime" name="On Time" fill="#82ca9d" stackId="a" />
                        <Bar dataKey="late" name="Late" fill="#ff8042" stackId="a" />
                        <Bar dataKey="early" name="Early" fill="#8884d8" stackId="a" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Customer Acquisition Trend */}
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl col-span-full md:col-span-2 lg:col-span-2 h-[280px] flex flex-col overflow-hidden">
                  <CardHeader className="py-2 px-4">
                    <CardTitle className="text-lg font-semibold">Customer Acquisition Trend</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[240px] p-4 flex flex-col">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={typedCustomerAcquisitionData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} width={80} />
                        <RechartsTooltip
                          formatter={(value: number, name: string) => [value.toString(), name]}
                          labelFormatter={(label: string) => `Month: ${label}`}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="newCustomers" 
                          name="New Customers" 
                          stroke="#3b82f6" 
                          strokeWidth={2} 
                          activeDot={{ r: 8 }}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Right Column Metrics (Return Rate & Avg. Order Value) */}
                <div className="col-span-full md:col-span-2 lg:col-span-2 grid grid-cols-1 gap-4">
                  {/* Return Rate Metric */}
                  <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl h-[140px]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2">
                      <CardTitle className="text-sm font-medium">Return Rate</CardTitle>
                      <RotateCw className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">{typedReturnRate.value.toFixed(2)}%</div>
                      <p className="text-xs text-muted-foreground mt-1">of total sales returned</p>
                    </CardContent>
                  </Card>

                  {/* Average Order Value Metric */}
                  <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl h-[140px]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2">
                      <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatIndianNumber(typedAverageOrderValue.value)}</div>
                      <p className="text-xs text-muted-foreground mt-1">per order</p>
                  </CardContent>
                </Card>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            {/* Associate Transaction History */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl">
              <CardHeader>
                <CardTitle>Associate Transaction History</CardTitle>
                <CardDescription>All transactions associated with this profile.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {isTransactionsLoading ? (
                  <div className="p-6 text-center text-muted-foreground">
                    Loading transactions...
                </div>
                ) : associateTransactions.length > 0 ? (
                  <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                          <TableHead>ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {associateTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                            <TableCell className="font-medium">{transaction.id}</TableCell>
                            <TableCell>{transaction.type}</TableCell>
                          <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                            <TableCell>{transaction.status}</TableCell>
                            <TableCell>{format(new Date(transaction.date), 'MMM d, yyyy')}</TableCell>
                            <TableCell>{transaction.description || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                ) : (
                  <div className="p-6 text-center text-muted-foreground">
                    No associate transaction history available.
              </div>
            )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="mt-4">
            <h3 className="text-lg font-semibold mb-4">Associate Contacts</h3>
            <Button
              onClick={() => {
                setEditingContact(null);
                setContactFormData({
                  name: '',
                  role: '',
                  email: '',
                  phone: '',
                  isPrimary: false,
                });
                setIsContactModalOpen(true);
              }}
              className="mb-4"
            >
              <UserPlus className="mr-2 h-4 w-4" /> Add New Contact
              </Button>

            {associate.contacts && associate.contacts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {associate.contacts.map((contact) => (
                <Card key={contact.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-base font-medium">{contact.name}</CardTitle>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditContact(contact)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteContact(contact.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                    </div>
                  </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground flex items-center"><UserPlus className="h-4 w-4 mr-2" />{contact.role || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground flex items-center"><Mail className="h-4 w-4 mr-2" />{contact.email || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground flex items-center"><Phone className="h-4 w-4 mr-2" />{contact.phone || 'N/A'}</p>
                    {contact.isPrimary && (
                      <Badge className="mt-2" variant="secondary">Primary Contact</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            ) : (
              <p className="text-muted-foreground">No contacts available for this associate.</p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>

      {/* Contact Form Modal */}
      {isContactModalOpen && (
        <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingContact ? 'Edit Contact Person' : 'Add New Contact Person'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={contactFormData.name}
                    onChange={(e) => setContactFormData({ ...contactFormData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={contactFormData.role}
                    onChange={(e) => setContactFormData({ ...contactFormData, role: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactFormData.email}
                    onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={contactFormData.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setContactFormData({ ...contactFormData, phone: value });
                    }}
                    maxLength={10}
                    placeholder="Enter 10 digit number"
                    pattern="[0-9]{10}"
                    title="Please enter a 10-digit phone number"
                  />
                  {contactFormData.phone && contactFormData.phone.length !== 10 && (
                    <p className="text-sm text-red-500">Phone number must be 10 digits</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPrimary"
                  checked={contactFormData.isPrimary}
                  onCheckedChange={(checked) => setContactFormData({ ...contactFormData, isPrimary: checked })}
                />
                <Label htmlFor="isPrimary">Primary Contact</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsContactModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingContact ? 'Update Contact' : 'Add Contact'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}
"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useAssociates } from '@/hooks/use-associates';
import type { Associate } from '@/types/business';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['SUPPLIER', 'BUYER', 'BOTH'] as const),
  email: z.string().email('Invalid email address').nullable().transform(e => e === '' ? undefined : e).optional(),
  phone: z.string().nullable().transform(e => e === '' ? undefined : e).optional(),
  address: z.string().nullable().transform(e => e === '' ? undefined : e).optional(),
  contactPerson: z.string().optional(),
  paymentTerms: z.string().nullable().transform(e => e === '' ? undefined : e).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE'] as const),
  gstNumber: z.string().nullable().transform(e => e === '' ? undefined : e).optional(),
  panNumber: z.string().nullable().transform(e => e === '' ? undefined : e).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export type { FormValues };

interface AssociateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  associate?: Associate | null;
  onSubmit: (data: FormValues) => void;
}

export function AssociateForm({
  open,
  onOpenChange,
  associate,
  onSubmit,
}: AssociateFormProps) {
  const { /* createAssociate, updateAssociate, isLoading */ } = useAssociates();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: 'SUPPLIER',
      email: '',
      phone: '',
      address: '',
      contactPerson: '',
      paymentTerms: '',
      status: 'ACTIVE',
      gstNumber: '',
      panNumber: '',
    },
  });

  useEffect(() => {
    if (associate) {
      form.reset({
        name: associate.name,
        type: associate.type,
        email: associate.email || '',
        phone: associate.phone || '',
        address: associate.address || '',
        contactPerson: associate.contactPerson || '',
        paymentTerms: associate.paymentTerms || '',
        status: associate.status,
        gstNumber: associate.gstNumber || '',
        panNumber: associate.panNumber || '',
      });
    } else {
      form.reset({
        name: '',
        type: 'SUPPLIER',
        email: '',
        phone: '',
        address: '',
        contactPerson: '',
        paymentTerms: '',
        status: 'ACTIVE',
        gstNumber: '',
        panNumber: '',
      });
    }
  }, [associate, form]);

  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            {associate ? "Edit Associate" : "Add New Associate"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SUPPLIER">Supplier</SelectItem>
                        <SelectItem value="BUYER">Buyer</SelectItem>
                        <SelectItem value="BOTH">Both</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter address" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Contact Person</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter contact person" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Payment Terms</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Net 30, COD" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="gstNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">GST Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter GST number" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="panNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">PAN Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter PAN number" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="min-w-[100px]"
              >
                Cancel
              </Button>
              <Button type="submit" className="min-w-[100px]">
                {associate ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 
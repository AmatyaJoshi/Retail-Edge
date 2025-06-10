"use client";

import { Associate } from "@/types/business";
import { useCreateAssociateMutation, useUpdateAssociateMutation } from "@/state/associates";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const associateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  type: z.enum(["EMPLOYEE", "SUPPLIER", "PARTNER"]),
});

type AssociateFormData = z.infer<typeof associateSchema>;

interface AssociateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  associate?: Associate;
}

export function AssociateForm({ open, onOpenChange, associate }: AssociateFormProps) {
  const [createAssociate] = useCreateAssociateMutation();
  const [updateAssociate] = useUpdateAssociateMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AssociateFormData>({
    resolver: zodResolver(associateSchema),
    defaultValues: associate || {
      name: "",
      email: "",
      phone: "",
      type: "EMPLOYEE",
    },
  });

  const onSubmit = async (data: AssociateFormData) => {
    try {
      if (associate) {
        await updateAssociate({ id: associate.id, associate: data }).unwrap();
      } else {
        await createAssociate(data).unwrap();
      }
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error("Failed to save associate:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{associate ? "Edit Associate" : "Add Associate"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter name"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="Enter email"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              {...register("phone")}
              placeholder="Enter phone number"
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              defaultValue={associate?.type || "EMPLOYEE"}
              onValueChange={(value) => register("type").onChange({ target: { value } })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EMPLOYEE">Employee</SelectItem>
                <SelectItem value="SUPPLIER">Supplier</SelectItem>
                <SelectItem value="PARTNER">Partner</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {associate ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
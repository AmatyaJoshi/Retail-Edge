"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Associate, PartnerType, AssociateStatus } from "@/types/business";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ColumnActionsProps {
  onEdit: (associate: Associate) => void;
  onDelete: (associateId: string) => void;
  onView: (associate: Associate) => void;
}

export const createColumns = ({
  onEdit,
  onDelete,
  onView,
}: ColumnActionsProps): ColumnDef<Associate>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const associate = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{associate.name}</span>
          {associate.email && (
            <span className="text-sm text-gray-500">{associate.email}</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as PartnerType;
      return (
        <Badge
          variant={type === "BOTH" ? "default" : type === "BUYER" ? "secondary" : "outline"}
          className="capitalize"
        >
          {type.toLowerCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as AssociateStatus;
      return (
        <Badge
          variant={status === "ACTIVE" ? "success" : "destructive"}
          className="capitalize"
        >
          {status.toLowerCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: "currentBalance",
    header: "Balance",
    cell: ({ row }) => {
      const balance = row.getValue("currentBalance") as number;
      return (
        <div className="font-medium">
          {new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
          }).format(balance)}
        </div>
      );
    },
  },
  {
    accessorKey: "totalTransactions",
    header: "Transactions",
    cell: ({ row }) => {
      const associate = row.original;
      const count = associate.transactions?.length || 0;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="font-medium">
                {count}
        </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total transactions: {count}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "contactPerson",
    header: "Contact Person",
    cell: ({ row }) => {
      const contactPerson = row.getValue("contactPerson") as string | undefined;
      return contactPerson || "-";
    },
  },
  {
    accessorKey: "paymentTerms",
    header: "Payment Terms",
    cell: ({ row }) => {
      const paymentTerms = row.getValue("paymentTerms") as string | undefined;
      return paymentTerms || "-";
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const associate = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(associate)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(associate)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(associate.associateId)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]; 
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Associate } from "@/types/business";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteAssociateMutation } from "@/state/associates";
import { useState } from "react";
import { AssociateForm } from "./associate-form";

export const columns: ColumnDef<Associate>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const associate = row.original;
      const [deleteAssociate] = useDeleteAssociateMutation();
      const [isEditFormOpen, setIsEditFormOpen] = useState(false);

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setIsEditFormOpen(true)}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => deleteAssociate(associate.id)}
                className="text-red-600"
              >
                <Trash className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AssociateForm
            open={isEditFormOpen}
            onOpenChange={setIsEditFormOpen}
            associate={associate}
          />
        </>
      );
    },
  },
]; 
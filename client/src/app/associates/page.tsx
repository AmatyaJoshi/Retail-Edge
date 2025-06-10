"use client";

import { useGetAssociatesQuery } from "@/state/associates";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { AssociateForm } from "./associate-form";

export default function AssociatesPage() {
  const { data: associates, isLoading } = useGetAssociatesQuery({});
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Associates</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Associate
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={associates || []}
        isLoading={isLoading}
      />

      <AssociateForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
      />
    </div>
  );
} 
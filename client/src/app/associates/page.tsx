"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/data-table";
import { useAssociates } from "@/hooks/use-associates";
import { createColumns } from "./columns";
import type { Associate } from "@/types/business";
import { AssociateForm } from "./associate-form";
import { PageHeader } from "./page-header";
import { Toaster } from "sonner";
import { AssociateProfileModal } from "./associate-profile-modal";
import type { FormValues } from "./associate-form";
import { Loader2 } from "lucide-react";
import type { SortingState } from "@tanstack/react-table";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

export default function AssociatesPage() {
  const { 
    associates = [], 
    getAssociates, 
    createAssociate, 
    updateAssociate, 
    deleteAssociate, 
    isLoading, 
    error 
  } = useAssociates();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAssociate, setSelectedAssociate] = useState<Associate | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    getAssociates();
  }, [getAssociates]);

  const handleCreateOrUpdate = async (data: FormValues) => {
    if (selectedAssociate) {
      const payload: Partial<Associate> = {
        name: data.name,
        type: data.type,
        status: data.status,
        ...(data.email ? { email: data.email } : {}),
        ...(data.phone ? { phone: data.phone } : {}),
        ...(data.address ? { address: data.address } : {}),
        ...(data.contactPerson ? { contactPerson: data.contactPerson } : {}),
        ...(data.paymentTerms ? { paymentTerms: data.paymentTerms } : {}),
        ...(data.gstNumber ? { gstNumber: data.gstNumber } : {}),
        ...(data.panNumber ? { panNumber: data.panNumber } : {}),
      };
      await updateAssociate(selectedAssociate.associateId, payload);
    } else {
      await createAssociate(data);
    }
    setIsFormOpen(false);
    setSelectedAssociate(null);
  };

  const handleEdit = (associate: Associate) => {
    setSelectedAssociate(associate);
    setIsFormOpen(true);
  };

  const handleDelete = async (associateId: string) => {
    await deleteAssociate(associateId);
  };

  const handleOpenProfile = (associate: Associate) => {
    setSelectedAssociate(associate);
    setIsProfileModalOpen(true);
  };

  const handleExportAssociates = async (format: 'csv' | 'xlsx' | 'pdf' | 'doc') => {
    if (!associates || associates.length === 0) {
      toast.info("No associates data to export.");
      return;
    }

    try {
      // Prepare data for export
      const exportData = associates.map(associate => ({
        Name: associate.name,
        Type: associate.type,
        Status: associate.status,
        Email: associate.email || '',
        Phone: associate.phone || '',
        Address: associate.address || '',
        'Contact Person': associate.contactPerson || '',
        'Payment Terms': associate.paymentTerms || '',
        'GST Number': associate.gstNumber || '',
        'PAN Number': associate.panNumber || '',
        'Current Balance': associate.currentBalance || 0,
        'Total Transactions': associate.transactions?.length || 0,
      }));

      if (format === 'xlsx' || format === 'csv') {
        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Associates');

        // Generate buffer
        const wbout = XLSX.write(wb, { bookType: format, type: 'buffer' });

        // Create blob and download
        const blob = new Blob([wbout], { 
          type: format === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv' 
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `associates-export.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // For PDF and DOC, use the API endpoint
        const response = await fetch('/api/associates/export', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ format, data: exportData }),
        });

        if (!response.ok) {
          throw new Error('Export failed');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `associates-export.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      toast.success(`Successfully exported associates as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const handleImportAssociates = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast.info("No file selected for import.");
      return;
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    if (!['csv', 'xlsx'].includes(fileExtension)) {
      toast.error("Please select a valid CSV or Excel file.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/associates/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Import failed');
      }

      const result = await response.json();
      toast.success(`Successfully imported ${result.imported} associates`);
      
      // Refresh the data
      await getAssociates();
    } catch (error) {
      console.error('Import error:', error);
      toast.error(`Failed to import file: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const stats = {
    totalAssociates: associates?.length || 0,
    activeAssociates: associates?.filter((a: Associate) => a.status === "ACTIVE").length || 0,
    totalTransactions: associates?.reduce((sum: number, a: Associate) => sum + (a.transactions?.length || 0), 0) || 0,
    totalBalance: associates?.reduce((sum: number, a: Associate) => sum + (a.currentBalance || 0), 0) || 0,
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader
        onAddClick={() => {
          setSelectedAssociate(null);
          setIsFormOpen(true);
        }}
        onExportClick={handleExportAssociates}
        onImportChange={handleImportAssociates}
        onRefresh={getAssociates}
        {...stats}
      />
      <div className="flex items-center justify-between space-y-2">
        {error && (
          <div className="text-red-500 text-sm">
            Error loading associates: {error}
          </div>
        )}
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : associates?.length > 0 ? (
        <DataTable
          columns={createColumns({ 
            onEdit: handleEdit, 
            onDelete: handleDelete,
            onView: handleOpenProfile 
          })}
          data={associates}
          searchKey="name"
          onRowClick={handleOpenProfile}
          sorting={sorting}
          onSortingChange={setSorting}
        />
      ) : (
        <div className="text-center py-8 text-gray-500">
          No associates found.
        </div>
      )}
      <AssociateForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        associate={selectedAssociate}
        onSubmit={handleCreateOrUpdate}
      />
      {isProfileModalOpen && selectedAssociate && (
        <AssociateProfileModal
          open={isProfileModalOpen}
          onOpenChange={setIsProfileModalOpen}
          associate={selectedAssociate}
        />
      )}
      <Toaster />
    </div>
  );
}
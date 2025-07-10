"use client";

import { useState, useEffect } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import type { GridColDef, GridColumnVisibilityModel } from "@mui/x-data-grid";
import Header from "@/app/components/Header";
import { useAppSelector } from "@/app/redux";
import { Search, Download, Eye, Columns, XCircle, Upload } from "lucide-react";
import axios from "axios";
import { format } from "date-fns";
import { Box, Typography, Button } from '@mui/material';
import { API_ENDPOINTS } from '@/config/api';

interface Sale {
  saleId: string;
  productId: string;
  customerId: string | null;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  timestamp: string;
  paymentMethod: 'CARD' | 'CASH';
  status: 'COMPLETED' | 'PENDING' | 'REFUNDED';
  product: {
    name: string;
    category: string;
    price: number;
  };
  customer: {
    name: string;
    email: string;
    phone: string;
  } | null;
}

const Transactions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const [error, setError] = useState<string | null>(null);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({
    saleId: true,
    customer: true,
    product: true,
    timestamp: true,
    totalAmount: true,
    paymentMethod: true,
    status: true,
  });

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_ENDPOINTS.base}/sales`, {
        params: {
          startDate,
          endDate
        }
      });
      
      if (!response.data || !Array.isArray(response.data)) {
        setError('Received invalid data from server');
        return;
      }
      
      console.log('Sales data structure:', response.data.map(sale => ({
        saleId: sale.saleId,
        totalAmount: sale.totalAmount,
        row: sale
      })));
      setSales(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching sales:', err);
      if (axios.isAxiosError(err)) {
        setError(`Failed to fetch sales: ${err.message}`);
      } else {
        setError('Failed to fetch sales. Please check if the server is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [startDate, endDate]);

  const handleExport = () => {
    const csvContent = [
      ['Transaction ID', 'Customer', 'Product', 'Quantity', 'Unit Price', 'Total Amount', 'Date & Time', 'Payment Method', 'Status'],
      ...sales.map(sale => [
        sale.saleId,
        sale.customer?.name || 'Walk-in Customer',
        sale.product?.name || 'Unknown Product',
        sale.quantity.toString(),
        `₹${sale.unitPrice.toFixed(2)}`,
        `₹${sale.totalAmount.toFixed(2)}`,
        format(new Date(sale.timestamp), 'PPpp'),
        sale.paymentMethod,
        sale.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sales_history_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const columns: GridColDef<Sale>[] = [
    { 
      field: 'saleId', 
      headerName: 'Transaction ID', 
      width: 120,
      headerClassName: "font-semibold text-gray-700 dark:text-gray-300 text-center",
      cellClassName: "font-medium text-gray-600 dark:text-gray-400",
      renderCell: (params) => (
        <div className="p-2 w-full">
          <span className="font-medium text-sm whitespace-pre-wrap break-all">
            {params.value}
          </span>
        </div>
      )
    },
    { 
      field: 'customer', 
      headerName: 'Customer', 
      width: 200,
      align: 'center',
      headerAlign: 'center',
      headerClassName: "font-semibold text-gray-700 dark:text-gray-300 text-center",
      cellClassName: "font-medium text-gray-800 dark:text-gray-200",
      renderCell: (params) => {
        const customer = params.row?.customer;
        return (
          <div className="flex flex-col items-center p-2">
            <span className="font-medium text-base">{customer?.name || 'Walk-in Customer'}</span>
            {customer?.phone && (
              <span className="text-sm text-gray-500 mt-1">{customer.phone}</span>
            )}
          </div>
        );
      }
    },
    { 
      field: 'product', 
      headerName: 'Product Details', 
      width: 250,
      align: 'center',
      headerAlign: 'center',
      headerClassName: "font-semibold text-gray-700 dark:text-gray-300 text-center",
      cellClassName: "font-medium text-gray-800 dark:text-gray-200",
      renderCell: (params) => (
        <div className="flex flex-col items-center p-2">
          <span className="font-medium text-base">{params.row.product.name}</span>
          <span className="text-sm text-gray-500 mt-1">
            {params.row.product.category} • {params.row.quantity} × ₹{params.row.unitPrice.toFixed(2)}
          </span>
        </div>
      )
    },
    { 
      field: 'timestamp', 
      headerName: 'Date & Time', 
      width: 200,
      align: 'center',
      headerAlign: 'center',
      headerClassName: "font-semibold text-gray-700 dark:text-gray-300 text-center",
      cellClassName: "font-medium text-gray-800 dark:text-gray-200",
      renderCell: (params) => (
        <div className="flex flex-col items-center p-2">
          <span className="font-medium text-base">
            {format(new Date(params.row.timestamp), 'PP')}
          </span>
          <span className="text-sm text-gray-500 mt-1">
            {format(new Date(params.row.timestamp), 'p')}
          </span>
        </div>
      )
    },
    { 
      field: 'totalAmount', 
      headerName: 'Amount', 
      width: 130,
      align: 'center',
      headerAlign: 'center',
      headerClassName: "font-semibold text-gray-700 dark:text-gray-300 text-center",
      cellClassName: "font-medium text-green-600 dark:text-green-400",
      renderCell: (params) => (
        <div className="p-2">
          <span className="font-medium text-lg">
            ₹{params.row.totalAmount.toFixed(2)}
          </span>
        </div>
      )
    },
    { 
      field: 'paymentMethod', 
      headerName: 'Payment Method', 
      width: 150,
      align: 'center',
      headerAlign: 'center',
      headerClassName: "font-semibold text-gray-700 dark:text-gray-300 text-center",
      cellClassName: "font-medium text-gray-800 dark:text-gray-200",
      renderCell: (params) => (
        <div className="p-2">
          <span className={`font-medium text-lg ${
            params.row.paymentMethod === 'CARD' 
              ? 'text-blue-600 dark:text-blue-400' 
              : 'text-green-600 dark:text-green-400'
          }`}>
            {params.row.paymentMethod}
          </span>
        </div>
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 150,
      align: 'center',
      headerAlign: 'center',
      headerClassName: "font-semibold text-gray-700 dark:text-gray-300 text-center",
      cellClassName: "font-medium text-gray-800 dark:text-gray-200",
      renderCell: (params) => (
        <div className="p-2">
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${
            params.row.status === 'COMPLETED' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
            params.row.status === 'PENDING' 
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' :
              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
          }`}>
            {params.row.status}
          </span>
        </div>
      )
    }
  ];

  const filteredSales = sales.filter(sale => {
    const searchLower = searchQuery.toLowerCase();
    return (
      sale.saleId.toLowerCase().includes(searchLower) ||
      (sale.product?.name || '').toLowerCase().includes(searchLower) ||
      (sale.customer?.name || '').toLowerCase().includes(searchLower) ||
      (sale.customer?.phone || '').includes(searchLower)
    );
  });

  // Column management modal component
  const ColumnManagementModal = () => {
    if (!showColumnModal) return null;

    const columns = [
      { field: 'saleId', label: 'Transaction ID' },
      { field: 'customer', label: 'Customer' },
      { field: 'product', label: 'Product Details' },
      { field: 'timestamp', label: 'Date & Time' },
      { field: 'totalAmount', label: 'Amount' },
      { field: 'paymentMethod', label: 'Payment Method' },
      { field: 'status', label: 'Status' },
    ];

    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[480px] shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Manage Columns
            </h2>
            <button
              onClick={() => setShowColumnModal(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            {columns.map((column) => (
              <div key={column.field} className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">{column.label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={columnVisibilityModel[column.field]}
                    onChange={(e) => {
                      setColumnVisibilityModel(prev => ({
                        ...prev,
                        [column.field]: e.target.checked
                      }));
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setShowColumnModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto pb-5 w-full bg-gray-50 min-h-screen">
      <Header name="" />
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 mt-6">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: isDarkMode ? '#ffffff' : '#111827',
                marginBottom: '0.5rem'
              }}
            >
              Sales History
            </Typography>
            <div className="flex gap-2">
              <Button 
                variant="contained" 
                color="primary" 
                onClick={fetchSales}
                sx={{
                  backgroundColor: '#2563eb',
                  '&:hover': {
                    backgroundColor: '#1d4ed8'
                  },
                  color: '#ffffff',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Eye className="w-4 h-4" />
                Refresh
              </Button>
              <Button
                variant="outlined"
                onClick={() => setShowColumnModal(true)}
                sx={{
                  borderColor: isDarkMode ? '#4b5563' : '#d1d5db',
                  color: isDarkMode ? '#e5e7eb' : '#374151',
                  '&:hover': {
                    borderColor: isDarkMode ? '#6b7280' : '#9ca3af'
                  },
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Columns className="w-4 h-4" />
                Columns
              </Button>
            </div>
          </Box>

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          {/* Filters and Search */}
          <div className="mb-6 flex gap-4 items-center">
            <div className="relative flex-1 min-w-[400px]">
              <input
                type="text"
                placeholder="Search sales..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white shadow-sm font-sans"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
            <div className="flex gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white shadow-sm font-sans"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white shadow-sm font-sans"
              />
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Export
            </button>
          </div>

          {/* Content */}
          <div className="mt-6">
            <div style={{ height: 600, width: '100%' }}>
              <DataGrid
                rows={filteredSales}
                columns={columns}
                loading={loading}
                slots={{ toolbar: GridToolbar }}
                getRowId={(row) => row.saleId}
                sx={{
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                  color: isDarkMode ? '#e0e1dd' : '#22223b',
                  backgroundColor: 'transparent',
                  border: 'none',
                  '& .MuiDataGrid-row:hover': {
                    backgroundColor: isDarkMode ? '#334155' : '#f0f7ff',
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: isDarkMode ? '#334155' : '#f3f4f6',
                    fontWeight: 700,
                  },
                  '& .MuiDataGrid-footerContainer': {
                    backgroundColor: isDarkMode ? '#334155' : '#f3f4f6',
                  },
                }}
                disableRowSelectionOnClick
              />
            </div>
          </div>
        </div>

        {/* Column Management Modal */}
        <ColumnManagementModal />
      </div>
    </div>
  );
};

export default Transactions; 
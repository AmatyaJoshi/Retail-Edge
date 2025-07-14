"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/app/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import type { GridColDef, GridColumnVisibilityModel } from "@mui/x-data-grid";
import Header from "@/app/components/Header";
import { useAppSelector } from "@/app/redux";
import { Search, Download, ArrowUpDown, Columns, XCircle, Upload } from "lucide-react";
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
  // Add pagination state
  const [pageSize, setPageSize] = useState(5);
  // Add state and handler for sort dropdown at the top of the component
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const handleSort = (key: string) => {
    // Implement sorting logic here
    setShowSortDropdown(false);
  };

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

  // Define columns for TanStack Table
  const columns: ColumnDef<Sale>[] = [
    {
      accessorKey: 'saleId',
      header: 'Transaction ID',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{row.original.saleId}</span>
      ),
    },
    {
      accessorKey: 'customer',
      header: 'Customer',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{row.original.customer?.name || 'Walk-in Customer'}</span>
          {row.original.customer?.phone && (
            <span className="text-xs text-gray-500 dark:text-gray-400">{row.original.customer.phone}</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'product',
      header: 'Product Details',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">{row.original.product.name}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {row.original.product.category} • {row.original.quantity} × ₹{row.original.unitPrice.toFixed(2)}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'timestamp',
      header: 'Date & Time',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
            {format(new Date(row.original.timestamp), 'PP')}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {format(new Date(row.original.timestamp), 'p')}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'totalAmount',
      header: 'Amount',
      cell: ({ row }) => (
        <span className="font-semibold text-green-600 dark:text-green-400 text-base">
          ₹{row.original.totalAmount.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'paymentMethod',
      header: () => <div className="text-center w-full">Payment Method</div>,
      cell: ({ row }) => (
        <span className={
          (row.original.paymentMethod === 'CARD'
            ? 'text-blue-600 dark:text-blue-400 font-semibold'
            : 'text-green-600 dark:text-green-400 font-semibold') +
          ' block text-center w-full'
        }>
          {row.original.paymentMethod}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          row.original.status === 'COMPLETED'
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
            : row.original.status === 'PENDING'
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
        }`}>
          {row.original.status}
        </span>
      ),
    },
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
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 overflow-x-hidden pt-20">
      {/* Professional Header Section */}
      <div className="px-2 py-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-1">Transactions</h1>
        <p className="text-gray-500 dark:text-gray-300 text-base">View, search, and export your sales transactions. Filter by date, customer, or payment method for detailed analysis and reporting.</p>
      </div>

      {/* Controls Card and DataTable aligned */}
      <div className="flex flex-col w-full flex-1 px-2 md:px-6 gap-2">
        <div className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 flex flex-col w-full bg-gray-50 dark:bg-gray-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="relative flex-grow max-w-xs">
              <input
                className="w-full pl-9 pr-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400 bg-gray-50 dark:bg-gray-900 shadow font-sans text-sm transition focus:outline-none dark:text-gray-100"
                placeholder="Search sales..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            </div>
            <div className="flex gap-1 items-center">
              {/* Rows per page dropdown */}
              <select
                value={pageSize}
                onChange={e => {
                  const size = Number(e.target.value);
                  setPageSize(size);
                }}
                className="py-1.5 px-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-100 font-medium shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-sm transition focus:outline-none mr-2"
              >
                {[5, 10, 25, 50].map(size => (
                  <option key={size} value={size}>{size} rows</option>
                ))}
              </select>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="py-1.5 pl-9 pr-0 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-100 font-medium shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-sm transition focus:outline-none appearance-none custom-date-input"
                  style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}
                />
                <svg className="absolute left-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-300 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2"/></svg>
              </div>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="py-1.5 pl-9 pr-0 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-100 font-medium shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-sm transition focus:outline-none appearance-none custom-date-input"
                  style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}
                />
                <svg className="absolute left-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-300 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2"/></svg>
              </div>
              {/* Sort Button */}
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown((prev) => !prev)}
                  className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1 text-gray-800 dark:text-gray-200 font-medium whitespace-nowrap shadow-sm cursor-pointer text-sm"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  Sort
                </button>
                {showSortDropdown && (
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                    <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => handleSort('date')}>Date</button>
                    <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => handleSort('amount')}>Amount</button>
                    <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => handleSort('customer')}>Customer</button>
                  </div>
                )}
              </div>
              {/* Columns Button */}
              <button
                onClick={() => setShowColumnModal(true)}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1 text-gray-800 dark:text-gray-200 font-medium whitespace-nowrap shadow-sm cursor-pointer text-sm"
              >
                <Columns className="w-4 h-4" />
                Columns
              </button>
              {/* Export Button (moved to right of Columns) */}
              <button
                onClick={handleExport}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm text-sm"
              >
                <Upload className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Main Content: DataTable */}
        <div className="h-[400px] overflow-y-auto rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 custom-scrollbar w-full shadow-lg bg-gray-50 dark:bg-gray-800">
          <DataTable
            columns={columns}
            data={filteredSales}
            searchKey="customer"
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            hideToolbar
          />
        </div>
      </div>

      {/* Column Management Modal */}
      <ColumnManagementModal />
    </div>
  );
};

export default Transactions; 
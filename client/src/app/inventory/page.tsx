"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useGetProductsQuery, useGetPurchaseOrdersQuery, useCreatePurchaseOrderMutation, useUpdatePurchaseOrderStatusMutation, useUpdateProductStockMutation } from "@/state/api";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridRenderCellParams, GridColumnVisibilityModel } from "@mui/x-data-grid";
import { useAppSelector } from "@/app/redux";
import { toast } from "react-hot-toast";
import { ArrowDownToLine, CheckCircle2, Clock, PenBox, ShoppingCart, XCircle, Search, Columns } from "lucide-react";
import { useTheme } from 'next-themes';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useGetAssociatesQuery } from "@/app/state/associates";

// Eyewear SVG icon from svgrepo.com
const EyewearIcon = () => (
  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="40" r="12" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="48" cy="40" r="12" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M4 40c0-6 4-12 12-12m32 0c8 0 12 6 12 12" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M28 40h8" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

interface Product {
  productId: string;
  name: string;
  price: number;
  stockQuantity: number;
  category: string;
}

interface PurchaseOrder {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  supplier: string;
  expectedDeliveryDate: string;
  status: 'PENDING' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';
  processingStage: 'ORDER_PLACED' | 'ORDER_CONFIRMED' | 'PROCESSING' | 'PACKED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  type: 'order' | 'sell' | 'update';
  onSubmit: (quantity: number, supplier?: string, details?: { name: string; price: number; category: string }) => Promise<void>;
}

interface UpdateProductDetails {
  productId: string;
  stockQuantity: number;
  name?: string;
  price?: number;
  category?: string;
}

const StockModal = ({ isOpen, onClose, product, type, onSubmit }: StockModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [supplier, setSupplier] = useState("");
  const [buyer, setBuyer] = useState("");
  const [price, setPrice] = useState(product.price);
  const [name, setName] = useState(product.name);
  const [category, setCategory] = useState(product.category);
  const [notes, setNotes] = useState("");
  const [showBuyerDropdown, setShowBuyerDropdown] = useState(false);
  const buyerInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const supplierInputRef = useRef<HTMLInputElement>(null);
  const dropdownSupplierRef = useRef<HTMLDivElement>(null);
  const { data: associates = [], isLoading: associatesLoading } = useGetAssociatesQuery({});
  const buyers = associates.filter(a => a.type === 'BUYER' || a.type === 'BOTH');
  const suppliers = associates.filter(a => a.type === 'SUPPLIER' || a.type === 'BOTH');
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  // Debug: Log associates data
  useEffect(() => {
    console.log('Associates data:', associates);
  }, [associates]);

  // Click outside handler for dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buyerInputRef.current &&
        !buyerInputRef.current.contains(event.target as Node)
      ) {
        setShowBuyerDropdown(false);
      }
    }
    if (showBuyerDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBuyerDropdown]);

  // Click outside handler for supplier dropdown
  useEffect(() => {
    function handleClickOutsideSupplier(event: MouseEvent) {
      if (
        dropdownSupplierRef.current &&
        !dropdownSupplierRef.current.contains(event.target as Node) &&
        supplierInputRef.current &&
        !supplierInputRef.current.contains(event.target as Node)
      ) {
        setShowSupplierDropdown(false);
      }
    }
    if (showSupplierDropdown) {
      document.addEventListener('mousedown', handleClickOutsideSupplier);
    } else {
      document.removeEventListener('mousedown', handleClickOutsideSupplier);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideSupplier);
    };
  }, [showSupplierDropdown]);

  const categories = [
    { value: "frames", label: "Frames" },
    { value: "sunglasses", label: "Sunglasses" },
    { value: "lenses", label: "Lenses" },
    { value: "accessories", label: "Accessories" }
  ];

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (type === 'order' && !supplier) {
      toast.error("Please enter a supplier");
      return;
    }
    if (type === 'update') {
      if (!category) {
        toast.error("Please select a category");
        return;
      }
      if (!name.trim()) {
        toast.error("Please enter a product name");
        return;
      }
      if (price <= 0) {
        toast.error("Please enter a valid price");
        return;
      }
      await onSubmit(0, undefined, { name, price, category });
    } else if (type === 'sell') {
      if (quantity > product.stockQuantity) {
        toast.error("Not enough stock available");
        return;
      }
      if (!buyer.trim() && type === 'sell') {
        toast.error("Please enter a buyer name");
        return;
      }
      await onSubmit(quantity, buyer);
    } else {
      await onSubmit(quantity, supplier);
    }
    onClose();
  };

  const getModalTitle = () => {
    switch(type) {
      case 'order':
        return 'Create Purchase Order';
      case 'sell':
        return 'Process Sale';
      case 'update':
        return 'Update Product Details';
      default:
        return '';
    }
  };

  const getStepInfo = () => {
    switch(type) {
      case 'order':
        return [
          'Submit purchase order',
          'Order will be processed & sent to supplier',
          'Stock will be updated upon delivery',
        ];
      case 'sell':
        return [
          'Process sale transaction',
          'Stock will be updated automatically',
          'Sale record will be added to history',
        ];
      case 'update':
        return [
          'Update product information',
          'Changes will be reflected immediately',
          'Inventory records will be updated',
        ];
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col justify-center mx-2">
        {/* Header */}
        <div className="flex flex-col gap-1 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{getModalTitle()}</h2>
              <p className="text-sm text-gray-400 dark:text-gray-300 mt-1">Product: <span className="font-medium text-gray-900 dark:text-white">{product.name}</span></p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {/* Main Form and Transaction Summary only */}
          <div className="space-y-2">
            {type === 'update' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="" disabled>Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Current Stock
                    </label>
                    <input
                      type="text"
                      value={product.stockQuantity}
                      disabled
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Unit Price
                    </label>
                    <input
                      type="text"
                      value={`₹${product.price.toLocaleString()}`}
                      disabled
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {type === 'order' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Supplier
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={supplier}
                        onChange={e => {
                          setSupplier(e.target.value);
                          setShowSupplierDropdown(true);
                        }}
                        ref={supplierInputRef}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Type or select supplier..."
                        autoComplete="off"
                        onFocus={() => setShowSupplierDropdown(true)}
                      />
                      {showSupplierDropdown && (
                        <div ref={dropdownSupplierRef} className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg custom-scrollbar">
                          {associatesLoading ? (
                            <div className="px-4 py-2 text-gray-400 text-sm">Loading suppliers...</div>
                          ) : suppliers.length === 0 ? (
                            <div className="px-4 py-2 text-gray-400 text-sm">No suppliers available</div>
                          ) : (
                            <>
                              {suppliers
                                .filter(a => !supplier || a.name.toLowerCase().includes(supplier.toLowerCase()) || (a.email && a.email.toLowerCase().includes(supplier.toLowerCase())))
                                .slice(0, 20)
                                .map(a => (
                                  <div
                                    key={a.associateId}
                                    className="px-4 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 text-gray-900 dark:text-white text-sm flex flex-col gap-1"
                                    onClick={() => {
                                      setSupplier(a.name);
                                      setShowSupplierDropdown(false);
                                    }}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{a.name}</span>
                                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600`}>{a.type}</span>
                                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${a.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'} border border-gray-300 dark:border-gray-600`}>{a.status}</span>
                                    </div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{a.email || 'No email'}</span>
                                  </div>
                                ))}
                              {suppliers.filter(a => !supplier || a.name.toLowerCase().includes(supplier.toLowerCase()) || (a.email && a.email.toLowerCase().includes(supplier.toLowerCase()))).length === 0 && (
                                <div className="px-4 py-2 text-gray-400 text-sm">No suppliers found</div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {type === 'sell' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Buyer
                    </label>
                    <div className="relative">
                      <input
                        ref={buyerInputRef}
                        type="text"
                        value={buyer}
                        onChange={e => {
                          setBuyer(e.target.value);
                          setShowBuyerDropdown(true);
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Type or select associate..."
                        autoComplete="off"
                        onFocus={() => setShowBuyerDropdown(true)}
                      />
                      {showBuyerDropdown && (
                        <div ref={dropdownRef} className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg custom-scrollbar">
                          {associatesLoading ? (
                            <div className="px-4 py-2 text-gray-400 text-sm">Loading associates...</div>
                          ) : buyers.length === 0 ? (
                            <div className="px-4 py-2 text-gray-400 text-sm">No buyers available</div>
                          ) : (
                            <>
                              {buyers
                                .filter(a => !buyer || a.name.toLowerCase().includes(buyer.toLowerCase()) || (a.email && a.email.toLowerCase().includes(buyer.toLowerCase())))
                                .slice(0, 20)
                                .map(a => (
                                  <div
                                    key={a.associateId}
                                    className="px-4 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 text-gray-900 dark:text-white text-sm flex flex-col gap-1"
                                    onClick={() => {
                                      setBuyer(a.name);
                                      setShowBuyerDropdown(false);
                                    }}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{a.name}</span>
                                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600`}>{a.type}</span>
                                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${a.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'} border border-gray-300 dark:border-gray-600`}>{a.status}</span>
                                    </div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{a.email || 'No email'}</span>
                                  </div>
                                ))}
                              {buyers.filter(a => !buyer || a.name.toLowerCase().includes(buyer.toLowerCase()) || (a.email && a.email.toLowerCase().includes(buyer.toLowerCase()))).length === 0 && (
                                <div className="px-4 py-2 text-gray-400 text-sm">No buyers found</div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add any additional notes"
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>
          {/* Section: Transaction Summary */}
          <div className="mt-2">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Transaction Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Quantity:</span>
                  <span className="text-gray-900 dark:text-white font-medium">{quantity} units</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Unit Price:</span>
                  <span className="text-gray-900 dark:text-white font-medium">₹{product.price.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-gray-900 dark:text-white">Total Amount:</span>
                    <span className="text-blue-600 dark:text-blue-400">₹{(quantity * product.price).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2 ${
              type === 'order'
                ? 'bg-blue-600 hover:bg-blue-700'
                : type === 'sell'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-700 hover:bg-gray-800'
            }`}
          >
            {type === 'order' && <ArrowDownToLine className="w-4 h-4" />}
            {type === 'sell' && <ShoppingCart className="w-4 h-4" />}
            {type === 'update' && <PenBox className="w-4 h-4" />}
            {type === 'order' ? 'Place Order' : type === 'sell' ? 'Complete Sale' : 'Update Product'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Inventory = () => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalType, setModalType] = useState<'order' | 'sell' | 'update' | null>(null);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({
    // Default visibility for inventory columns
    productId: true,
    name: true,
    price: true,
    totalValue: true,
    stockQuantity: true,
    category: true,
    actions: true,
    // Default visibility for purchase order columns
    id: true,
    createdAt: true,
    product: true,
    quantity: true,
    supplier: true,
    expectedDeliveryDate: true,
    processingStage: true,
  });
  // Pagination state
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 });
  
  // Fetch products with proper error handling
  const { 
    data: products, 
    isError: productsError, 
    isLoading: productsLoading,
    error: productsFetchError 
  } = useGetProductsQuery();

  const { 
    data: purchaseOrders, 
    isError: ordersError, 
    isLoading: ordersLoading,
    refetch: refetchOrders
  } = useGetPurchaseOrdersQuery(undefined, { skip: activeTab !== 'orders' });

  const [createPurchaseOrder] = useCreatePurchaseOrderMutation();
  const [updatePurchaseOrderStatus] = useUpdatePurchaseOrderStatusMutation();
  const [updateProductStock] = useUpdateProductStockMutation();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  // Poll for updates every 5 seconds
  useEffect(() => {
    if (activeTab !== 'orders') return;
    const pollInterval = setInterval(() => {
      refetchOrders();
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [refetchOrders, activeTab]);

  // Log any fetch errors
  useEffect(() => {
    if (productsFetchError) {
      console.error('Error fetching products:', productsFetchError);
    }
  }, [productsFetchError]);

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!searchQuery) return products;
    
    return products.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  // Filter purchase orders based on search query (like products)
  const filteredPurchaseOrders = useMemo(() => {
    if (!purchaseOrders) return [];
    if (!searchQuery) return purchaseOrders;
    return purchaseOrders.filter(order =>
      order.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.supplier && order.supplier.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [purchaseOrders, searchQuery]);

  // Ensure all purchase orders have processingStage for DataGrid compatibility
  const normalizedPurchaseOrders = useMemo(() =>
    filteredPurchaseOrders.map(order => {
      const { processingStage, ...rest } = order as any;
      return {
        ...rest,
        processingStage: processingStage || 'ORDER_PLACED',
      };
    }),
    [filteredPurchaseOrders]
  );

  const handleCreateOrder = async (quantity: number, supplier?: string) => {
    if (!selectedProduct || !supplier) return;
    try {
      await createPurchaseOrder({
        productId: selectedProduct.productId,
        quantity,
        supplier,
        expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      });
      toast.success("Purchase order created successfully");
    } catch (error) {
      toast.error("Failed to create purchase order");
    }
  };

  const handleSellStock = async (quantity: number, _supplier?: string) => {
    if (!selectedProduct) return;
    try {
      if (quantity > selectedProduct.stockQuantity) {
        toast.error("Not enough stock available");
        return;
      }
      await updateProductStock({
        productId: selectedProduct.productId,
        stockQuantity: selectedProduct.stockQuantity - quantity
      });
      toast.success("Stock sold successfully");
    } catch (error) {
      toast.error("Failed to sell stock");
    }
  };

  const handleUpdateStatus = async (orderId: string, status: 'ORDERED' | 'RECEIVED' | 'CANCELLED') => {
    try {
      let processingStage: PurchaseOrder['processingStage'];
      
      switch (status) {
        case 'ORDERED':
          processingStage = 'ORDER_CONFIRMED';
          break;
        case 'RECEIVED':
          processingStage = 'DELIVERED';
          break;
        case 'CANCELLED':
          processingStage = 'CANCELLED';
          break;
        default:
          processingStage = 'ORDER_PLACED';
      }

      const updateParams = {
        orderId,
        status,
        processingStage
      };

      await updatePurchaseOrderStatus(updateParams);
      
      // Immediately refetch orders to update the UI
      await refetchOrders();
      
      // Get the order details for the notification
      const order = purchaseOrders?.find(order => order.id === orderId);
      
      toast.success(
        <div className="flex flex-col">
          <span className="font-medium">Order Status Updated</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Order #{orderId.slice(0, 8)}... - {order?.product.name}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            New Status: {status}
          </span>
        </div>,
        {
          duration: 4000,
          position: 'top-right',
          style: {
            background: isDarkMode ? '#1f2937' : '#ffffff',
            color: isDarkMode ? '#e5e7eb' : '#374151',
            border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
            padding: '12px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        }
      );
    } catch (error) {
      toast.error(
        <div className="flex flex-col">
          <span className="font-medium">Update Failed</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Failed to update order status
          </span>
        </div>,
        {
          duration: 4000,
          position: 'top-right',
          style: {
            background: isDarkMode ? '#1f2937' : '#ffffff',
            color: isDarkMode ? '#e5e7eb' : '#374151',
            border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
            padding: '12px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        }
      );
    }
  };

  const handleUpdateProduct = async (quantity: number, supplier: string | undefined, details?: { name: string; price: number; category: string }) => {
    if (!selectedProduct || !details) return;
    try {
      const updateData: UpdateProductDetails = {
        productId: selectedProduct.productId,
        stockQuantity: selectedProduct.stockQuantity,
        name: details.name,
        price: details.price,
        category: details.category
      };
      await updateProductStock(updateData);
      toast.success("Product details updated successfully");
    } catch (error) {
      toast.error("Failed to update product details");
    }
  };

const columns: GridColDef[] = [
  { 
    field: "productId", 
    headerName: "Product ID", 
    flex: 0.8,
    minWidth: 120,
    headerClassName: "font-semibold text-gray-700 dark:text-gray-300 text-center text-lg whitespace-pre-line",
    cellClassName: "font-medium text-gray-800 dark:text-gray-200",
    align: "center",
    headerAlign: "center",
    renderCell: (params: GridRenderCellParams<Product>) => {
      return (
        <div className="flex items-center justify-center w-full">
          <span 
            className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-base font-mono text-gray-700 dark:text-gray-300 cursor-help whitespace-normal text-center leading-snug"
            title={params.row.productId}
          >
            {params.row.productId.slice(0, 8)}...
          </span>
        </div>
      );
    },
  },
  { 
    field: "name", 
    headerName: "Product Name", 
    flex: 1.7, // slightly increased flex
    minWidth: 180, // slightly increased minWidth
    headerClassName: "font-semibold text-gray-700 dark:text-gray-300 text-center text-lg whitespace-pre-line",
    cellClassName: "font-medium text-gray-800 dark:text-gray-200",
    align: "center",
    headerAlign: "center",
    renderCell: (params: GridRenderCellParams<Product>) => (
      <div className="text-base font-medium">
        {params.row.name}
      </div>
    ),
  },
  {
    field: "price",
    headerName: "Unit Price",
    flex: 0.8,
    minWidth: 120,
    type: "number",
    headerClassName: "font-semibold text-gray-700 dark:text-gray-300 text-center text-lg whitespace-pre-line",
    cellClassName: "font-medium text-blue-600 dark:text-blue-400",
    align: "center",
    headerAlign: "center",
    renderCell: (params: GridRenderCellParams<Product>) => {
      return (
        <div className="text-base font-semibold">
          ₹{params.row.price.toLocaleString()}
        </div>
      );
    },
  },
  {
    field: "totalValue",
    headerName: "Total Value",
    flex: 0.8,
    minWidth: 120,
    type: "number",
    headerClassName: "font-semibold text-gray-700 dark:text-gray-300 text-center text-lg whitespace-pre-line",
    cellClassName: "font-medium text-green-600 dark:text-green-400",
    align: "center",
    headerAlign: "center",
    renderCell: (params: GridRenderCellParams<Product>) => {
      const total = params.row.price * params.row.stockQuantity;
      return (
        <div className="text-base font-semibold">
          ₹{total.toLocaleString()}
        </div>
      );
    },
  },
  {
    field: "stockQuantity",
    headerName: "Stock Quantity",
    flex: 0.9,
    minWidth: 140,
    type: "number",
    headerClassName: "font-semibold text-gray-700 dark:text-gray-300 text-center text-lg whitespace-pre-line",
    cellClassName: "font-medium",
    align: "center",
    headerAlign: "center",
    renderCell: (params: GridRenderCellParams<Product>) => {
      if (!params?.row?.stockQuantity) return null;
      const stock = Number(params.row.stockQuantity);
      return (
        <div className={`flex items-center justify-center gap-2 text-base font-semibold ${stock < 5 ? 'text-red-500 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
          <span>{stock.toLocaleString()}</span>
          {stock < 5 && <EyewearIcon />}
        </div>
      );
    },
  },
  {
    field: "category",
    headerName: "Category",
    flex: 0.8,
    minWidth: 120,
    headerClassName: "font-semibold text-gray-700 dark:text-gray-300 text-center text-lg whitespace-pre-line",
    cellClassName: "text-gray-600 dark:text-gray-400",
    align: "center",
    headerAlign: "center",
    renderCell: (params: GridRenderCellParams<Product>) => {
      return (
        <div className="flex items-center justify-center w-full">
          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-base font-medium">
            {params.row.category}
          </span>
        </div>
      );
    },
  },
  {
    field: "actions",
    headerName: "Actions",
    flex: 2, // much wider
    minWidth: 220, // much wider
    disableColumnMenu: true,
    sortable: false,
    headerClassName: "font-semibold text-gray-700 dark:text-gray-300 text-center text-lg whitespace-pre-line",
    cellClassName: "text-gray-600 dark:text-gray-400",
    align: "center",
    headerAlign: "center",
    renderCell: (params: GridRenderCellParams<Product>) => (
      <div className="flex items-center justify-center gap-1 w-full py-2"> {/* reduced gap */}
        <button
          onClick={() => {
            setSelectedProduct(params.row);
            setModalType('sell');
          }}
          className="px-2 py-0.5 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center gap-1 shadow-sm"
          title="Sell product"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          Sell
        </button>
        <button
          onClick={() => {
            setSelectedProduct(params.row);
            setModalType('order');
          }}
          className="px-2 py-0.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-1 shadow-sm"
          title="Create new order"
        >
          <ArrowDownToLine className="w-3.5 h-3.5" />
          Order
        </button>
        <button
          onClick={() => {
            setSelectedProduct(params.row);
            setModalType('update');
          }}
          className="px-2 py-0.5 text-sm bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors flex items-center gap-1 shadow-sm"
          title="Update product details"
        >
          <PenBox className="w-3.5 h-3.5 shrink-0" />
          <span className="shrink-0">Update</span>
        </button>
      </div>
    ),
  },
];

  const purchaseOrderColumns: GridColDef[] = [
    {
      field: "id",
      headerName: "Order ID",
      flex: 0.9,
      minWidth: 120,
      headerClassName: "font-semibold text-gray-700 dark:text-gray-300 text-center text-lg whitespace-pre-line",
      cellClassName: "font-medium text-gray-800 dark:text-gray-200 text-base",
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams<PurchaseOrder>) => {
        if (!params.row.id || params.row.id.startsWith('empty-')) return <span className="text-gray-300">&nbsp;</span>;
        return (
          <div className="flex items-center justify-center w-full">
            <span 
              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-base font-mono cursor-help"
              title={params.row.id}
            >
              {params.row.id.slice(0, 8)}...
            </span>
          </div>
        );
      },
    },
    {
      field: "createdAt",
      headerName: "Order Date",      flex: 1.1,
      minWidth: 130,
      headerClassName: "font-semibold text-gray-700 dark:text-gray-300 text-center text-lg whitespace-pre-line",
      cellClassName: "font-medium text-gray-800 dark:text-gray-200 text-base",
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams<PurchaseOrder>) => {
        if (!params.row.createdAt) return <span className="text-gray-300">&nbsp;</span>;
        const date = new Date(params.row.createdAt);
        return (
          <div className="flex flex-col items-center justify-center h-full leading-tight">
            <span className="font-medium text-base">{date.toLocaleDateString('en-GB')}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block" style={{ marginTop: '4px', fontSize: '0.85em' }}>
              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        );
      },
    },
    {
      field: "product",
      headerName: "Product",
      flex: 1.5,
      minWidth: 160,
      headerClassName: "font-semibold text-gray-700 dark:text-gray-300 text-center text-lg whitespace-pre-line",
      cellClassName: "font-medium text-gray-800 dark:text-gray-200 text-base",
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams<PurchaseOrder>) => {
        if (!params.row.product || !params.row.product.name) return <span className="text-gray-300">&nbsp;</span>;
        return (
          <div className="flex flex-col items-center gap-0.5">
            <span className="font-medium text-base text-gray-800 dark:text-gray-200">{params.row.product.name}</span>
            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-base font-medium text-gray-600 dark:text-gray-400">
              {params.row.product.category}
            </span>
          </div>
        );
      },
    },
    {
      field: "quantity",
      headerName: "Quantity",      flex: 0.8,
      minWidth: 110,
      type: "number",
      headerClassName: "font-semibold text-gray-700 dark:text-gray-300 text-center text-lg whitespace-pre-line",
      cellClassName: "font-medium text-gray-800 dark:text-gray-200 text-base",
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams<PurchaseOrder>) => {
        if (!params.row.quantity) return <span className="text-gray-300">&nbsp;</span>;
        return (
          <div className="flex items-center justify-center gap-2">
            <span className="font-medium">{params.row.quantity}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">units</span>
          </div>
        );
      },
    },
    {
      field: "expectedDeliveryDate",
      headerName: "Expected\nDelivery",
      flex: 1.3,
      minWidth: 140,
      headerAlign: 'center',
      headerClassName: "font-semibold text-gray-700 dark:text-gray-300 text-center text-xs whitespace-pre-line",
      renderCell: (params: GridRenderCellParams<PurchaseOrder>) => {
        if (!params.row.expectedDeliveryDate) return <span className="text-gray-300">&nbsp;</span>;
        const date = new Date(params.row.expectedDeliveryDate);
        const isOverdue = date < new Date() && params.row.status !== 'RECEIVED' && params.row.status !== 'CANCELLED';
        return (
          <div className={`flex flex-col items-center justify-center h-full leading-tight ${isOverdue ? 'text-red-500 dark:text-red-400' : ''}`}>
            <span className="font-medium text-base">{date.toLocaleDateString('en-GB')}</span>
            <span className="text-xs mt-1 block" style={{ marginTop: '4px', fontSize: '0.85em' }}>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            {isOverdue && <span className="text-xs mt-1">Overdue</span>}
          </div>
        );
      },
    },
    {
      field: "processingStage",
      headerName: "Processing\nStage",
      flex: 1.3,
      minWidth: 140,
      headerAlign: 'center',
      headerClassName: "font-semibold text-gray-700 dark:text-gray-300 text-center text-xs whitespace-pre-line",
      renderCell: (params: GridRenderCellParams<PurchaseOrder>) => {
        if (!params.row.processingStage || params.row.id.startsWith('empty-')) return <span className="text-gray-300">&nbsp;</span>;
        const stageConfig = {
          ORDER_CONFIRMED: {
            color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
            icon: <CheckCircle2 className="w-3.5 h-3.5" />,
            label: "Order Confirmed"
          },
          PROCESSING: {
            color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
            icon: <Clock className="w-3.5 h-3.5" />,
            label: "Processing"
          },
          PACKED: {
            color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
            icon: <EyewearIcon />,
            label: "Packed"
          },
          OUT_FOR_DELIVERY: {
            color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
            icon: <ShoppingCart className="w-3.5 h-3.5" />,
            label: "Out for Delivery"
          },
          DELIVERED: {
            color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
            icon: <CheckCircle2 className="w-3.5 h-3.5" />,
            label: "Delivered"
          },
          CANCELLED: {
            color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
            icon: <XCircle className="w-3.5 h-3.5" />,
            label: "Cancelled"
          }
        } as const;

        const stage = params.value || 'ORDER_CONFIRMED';
        const config = stageConfig[stage as keyof typeof stageConfig] || stageConfig.ORDER_CONFIRMED;

        return (
          <div className={`flex items-center justify-center gap-1 px-2 py-1 rounded-full ${config.color}`}>
            {config.icon}
            <span className="font-medium text-sm">{config.label}</span>
          </div>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1.3,
      minWidth: 140,
      headerClassName: "font-semibold text-gray-700 dark:text-gray-300 text-center text-lg whitespace-pre-line",
      cellClassName: "font-medium text-gray-800 dark:text-gray-200 text-base",
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams<PurchaseOrder>) => {
        const status = params.row.status;
        if (!params.row.id || params.row.id.startsWith('empty-')) return <div className="flex items-center justify-center w-full">&nbsp;</div>;
        return (
          <div className="flex items-center justify-center gap-2 w-full">
            {status === 'PENDING' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateStatus(params.row.id, 'RECEIVED')}
                  className="px-2.5 py-1.5 text-xs font-medium text-white rounded-md transition-colors flex items-center gap-1 bg-green-600 hover:bg-green-700 shadow"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Receive
                </button>
                <button
                  onClick={() => handleUpdateStatus(params.row.id, 'CANCELLED')}
                  className="px-2.5 py-1.5 text-xs font-medium text-white rounded-md transition-colors flex items-center gap-1 bg-red-600 hover:bg-red-700 shadow"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Cancel
                </button>
              </div>
            )}
            {status === 'ORDERED' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateStatus(params.row.id, 'RECEIVED')}
                  className="px-2.5 py-1.5 text-xs font-medium text-white rounded-md transition-colors flex items-center gap-1 bg-green-600 hover:bg-green-700 shadow"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Receive
                </button>
                <button
                  onClick={() => handleUpdateStatus(params.row.id, 'CANCELLED')}
                  className="px-2.5 py-1.5 text-xs font-medium text-white rounded-md transition-colors flex items-center gap-1 bg-red-600 hover:bg-red-700 shadow"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Cancel
                </button>
              </div>
            )}
            {status === 'RECEIVED' && (
              <div className="flex items-center">
                <button
                  className="px-2.5 py-1.5 text-xs font-medium text-white rounded-md flex items-center gap-1 bg-gray-400 cursor-not-allowed shadow"
                  disabled
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Received
                </button>
              </div>
            )}
            {status === 'CANCELLED' && (
              <div className="flex items-center">
                <button
                  className="px-2.5 py-1.5 text-xs font-medium text-white rounded-md flex items-center gap-1 bg-gray-400 cursor-not-allowed shadow"
                  disabled
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Cancelled
                </button>
              </div>
            )}
          </div>
        );
      },
    },
  ];

  // Helper to pad rows to always show 5 rows
  function padRows(rows: PurchaseOrder[], count = 5): PurchaseOrder[] {
    const emptyRow: PurchaseOrder = {
      id: '',
      productId: '',
      product: { productId: '', name: '', price: 0, stockQuantity: 0, category: '' },
      quantity: 0,
      supplier: '',
      expectedDeliveryDate: '',
      status: 'PENDING',
      processingStage: 'ORDER_PLACED',
      createdAt: '',
      updatedAt: '',
    };
    const padded = [...rows];
    while (padded.length < count) {
      padded.push({ ...emptyRow, id: `empty-${padded.length}` });
    }
    return padded;
  }

  // Modern custom pagination component for DataGrid
  interface ModernPaginationProps {
    page: number;
    pageCount: number;
    onPageChange: (page: number) => void;
    pageSize: number;
    onPageSizeChange: (pageSize: number) => void;
  }
  function ModernPagination({ page, pageCount, onPageChange, pageSize, onPageSizeChange }: ModernPaginationProps) {
    return (
      <div className="flex items-center justify-between w-full px-4 py-2 bg-white border-t border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-b-xl">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">Rows per page:</span>
          <select
            className="rounded-full border border-gray-300 px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            value={pageSize}
            onChange={e => onPageSizeChange(Number(e.target.value))}
          >
            {[5, 10, 25, 50].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="rounded-full px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900 focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-700 dark:text-gray-200">
            <span className="font-semibold">{page + 1}</span> / {pageCount}
          </span>
          <button
            className="rounded-full px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900 focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
            onClick={() => onPageChange(page + 1)}
            disabled={page + 1 >= pageCount}
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Column management modal component
  const ColumnManagementModal = () => {
    if (!showColumnModal) return null;

    const inventoryColumns = [
      { field: 'productId', label: 'Product ID' },
      { field: 'name', label: 'Product Name' },
      { field: 'price', label: 'Unit Price' },
      { field: 'totalValue', label: 'Total Value' },
      { field: 'stockQuantity', label: 'Stock Quantity' },
      { field: 'category', label: 'Category' },
      { field: 'actions', label: 'Actions' },
    ];

    const orderColumns = [
      { field: 'id', label: 'Order ID' },
      { field: 'createdAt', label: 'Order Date' },
      { field: 'product', label: 'Product' },
      { field: 'quantity', label: 'Quantity' },
      { field: 'expectedDeliveryDate', label: 'Expected Delivery Date' },
      { field: 'processingStage', label: 'Processing Stage' },
    ];

    const columns = activeTab === 'inventory' ? inventoryColumns : orderColumns;

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

  const theme = useMemo(() => createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      background: {
        default: isDarkMode ? '#232e41' : '#fff',
        paper: isDarkMode ? '#232e41' : '#fff',
      },
    },
    typography: {
      fontFamily: 'inherit',
    },
  }), [isDarkMode]);

  if (productsLoading || ordersLoading) {
    return <div className="py-4 text-gray-700 dark:text-gray-300">Loading...</div>;
  }

  if (productsError || ordersError) {
    return (
      <div className="text-center text-red-500 dark:text-red-400 py-4">
        Failed to fetch data
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 pt-20">
      {/* Professional Header Section - now more compact */}
      <div className="px-2 pt-4 pb-3">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-1">Inventory</h1>
        <p className="text-gray-500 dark:text-gray-300 text-base mb-2">Manage your inventory, track stock levels, and handle purchase orders efficiently. Keep your products up to date for smooth operations.</p>
      </div>

      {/* Summary Cards Row - more compact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-2 pb-1">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow border border-gray-100 dark:border-gray-700 flex flex-col items-center">
          <span className="text-xs text-gray-500 mb-1">Total Products</span>
          <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">{products?.length ?? 0}</span>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow border border-gray-100 dark:border-gray-700 flex flex-col items-center">
          <span className="text-xs text-gray-500 mb-1">Total Stock</span>
          <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">{products ? products.reduce((sum, p) => sum + (p.stockQuantity || 0), 0).toLocaleString() : 0}</span>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow border border-gray-100 dark:border-gray-700 flex flex-col items-center">
          <span className="text-xs text-gray-500 mb-1">Inventory Value</span>
          <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">₹{products ? products.reduce((sum, p) => sum + (p.price * (p.stockQuantity || 0)), 0).toLocaleString() : 0}</span>
        </div>
      </div>

      {/* Removed partition line for a cleaner look */}

      <div className="px-2 pt-4 pb-8 flex-1">
        {/* Search Bar, Column Management, and Tabs */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 rounded-xl font-medium transition-colors font-sans text-base cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Inventory
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-xl font-medium transition-colors font-sans text-base cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Purchase Orders
            </button>
          </div>
          <div className="flex items-center gap-4 flex-1 ml-8">
            <div className="relative flex-1 min-w-[400px]">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white shadow font-sans text-base"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
            <button
              onClick={() => setShowColumnModal(true)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-gray-800 dark:text-gray-200 font-medium whitespace-nowrap shadow cursor-pointer"
            >
              <Columns className="w-5 h-5" />
              Manage Columns
            </button>
          </div>
        </div>

        {/* Content */}
        <ThemeProvider theme={theme}>
          <div className="w-full px-2 md:px-4">
            {activeTab === 'inventory' ? (
              <DataGrid
                rows={filteredProducts}
                columns={columns}
                getRowId={(row) => row.productId}
                className="font-sans text-base !text-gray-800 dark:!text-gray-200"
                style={{ height: 320 }}
                slots={{
                  toolbar: () => (
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center">
                        <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                          Products
                        </div>
                      </div>
                    </div>
                  ),
                  pagination: (props) => (
                    <ModernPagination
                      page={paginationModel.page}
                      pageCount={Math.ceil(filteredProducts.length / paginationModel.pageSize)}
                      onPageChange={(page: number) => setPaginationModel({ ...paginationModel, page })}
                      pageSize={paginationModel.pageSize}
                      onPageSizeChange={(pageSize: number) => setPaginationModel({ ...paginationModel, pageSize, page: 0 })}
                    />
                  ),
                }}
                columnVisibilityModel={columnVisibilityModel}
                onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
                sx={{
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                  color: isDarkMode ? '#e0e1dd' : '#22223b',
                  '& .MuiDataGrid-row': {
                    minHeight: '48px !important',
                    maxHeight: '48px !important',
                    backgroundColor: isDarkMode ? '#1f2937' : '#fff',
                    borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                    '&:hover': {
                      backgroundColor: isDarkMode ? '#2d3340' : '#f8fafc',
                    },
                  },
                  '& .MuiDataGrid-cell': {
                    padding: '8px 8px',
                    fontSize: '1rem',
                    color: isDarkMode ? '#e0e1dd' : '#22223b',
                    fontWeight: 500,
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: isDarkMode ? '#232e41' : '#f8fafc',
                    borderBottom: `1.5px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
                    minHeight: '36px !important',
                    maxHeight: '40px !important',
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: isDarkMode ? '#bfc9db' : '#22223b',
                    whiteSpace: 'pre-line',
                    textAlign: 'center',
                    paddingTop: 0,
                    paddingBottom: 0,
                  },
                  '& .MuiDataGrid-columnHeaderTitle': {
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: isDarkMode ? '#bfc9db' : '#22223b',
                    padding: 0,
                  },
                  '& .MuiDataGrid-virtualScroller': {
                    overflowY: 'auto !important',
                    // Add custom-scrollbar class for consistent styling
                    '&::-webkit-scrollbar': {
                      width: '8px',
                      background: '#232e41',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: '#64748b',
                      borderRadius: '8px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                      background: '#475569',
                    },
                  },
                  '& .MuiDataGrid-footerContainer': {
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: '40px',
                    height: '40px',
                    overflow: 'hidden',
                    borderTop: `2px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
                    backgroundColor: isDarkMode ? '#1f2937' : '#f8fafc',
                    padding: '8px 12px',
                    '& .MuiTablePagination-root': {
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      minHeight: '40px',
                      height: '40px',
                    },
                    '& .MuiTablePagination-toolbar': {
                      minHeight: '40px',
                      height: '40px',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                    },
                    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                      fontSize: '0.95rem',
                      lineHeight: 1.2,
                      margin: 0,
                      padding: 0,
                    },
                    '& .MuiInputBase-root, & .MuiTablePagination-select': {
                      minHeight: '32px',
                      height: '32px',
                      fontSize: '0.95rem',
                      margin: 0,
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                    },
                  },
                  '& .MuiDataGrid-columnSeparator': {
                    display: 'none',
                  },
                }}
                rowHeight={48}
                pageSizeOptions={[5, 10, 25, 50]}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                autoHeight
                disableRowSelectionOnClick
              />
            ) : (
              <DataGrid
                rows={padRows(normalizedPurchaseOrders, 5)}
                columns={purchaseOrderColumns}
                getRowId={(row) => row.id}
                className="font-sans text-base !text-gray-800 dark:!text-gray-200"
                rowHeight={56}
                slots={{
                  toolbar: () => (
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center">
                        <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                          Purchase Orders
                        </div>
                      </div>
                    </div>
                  ),
                  pagination: (props) => (
                    <ModernPagination
                      page={paginationModel.page}
                      pageCount={Math.ceil(normalizedPurchaseOrders.length / paginationModel.pageSize)}
                      onPageChange={(page: number) => setPaginationModel({ ...paginationModel, page })}
                      pageSize={paginationModel.pageSize}
                      onPageSizeChange={(pageSize: number) => setPaginationModel({ ...paginationModel, pageSize, page: 0 })}
                    />
                  ),
                }}
                columnVisibilityModel={columnVisibilityModel}
                onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
                sx={{
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                  color: isDarkMode ? '#e0e1dd' : '#22223b',
                  '& .MuiDataGrid-row': {
                    minHeight: '56px !important',
                    maxHeight: '56px !important',
                    backgroundColor: isDarkMode
                      ? '#1f2937'
                      : 'inherit',
                    borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                    '&:nth-of-type(even)': {
                      backgroundColor: isDarkMode ? '#23293a' : '#f9fafb',
                    },
                    '&:nth-of-type(odd)': {
                      backgroundColor: isDarkMode ? '#1f2937' : '#fff',
                    },
                    '&:hover': {
                      backgroundColor: isDarkMode ? '#2d3340' : '#f3f4f6',
                      boxShadow: isDarkMode
                        ? '0 2px 8px 0 rgba(31,41,55,0.15)'
                        : '0 2px 8px 0 rgba(0,0,0,0.06)',
                    },
                  },
                  '& .MuiDataGrid-cell': {
                    padding: '8px 8px',
                    fontSize: '1rem',
                    color: isDarkMode ? '#e0e1dd' : '#22223b',
                    fontWeight: 500,
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: isDarkMode ? '#1f2937' : '#f8fafc',
                    borderBottom: `2px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
                    minHeight: '48px !important',
                    maxHeight: '72px !important',
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: isDarkMode ? '#e0e1dd' : '#22223b',
                    whiteSpace: 'pre-line',
                    textAlign: 'center',
                  },
                  '& .MuiDataGrid-footerContainer': {
                    display: 'flex',
                    minHeight: '40px',
                    height: '40px',
                    overflow: 'hidden',
                    borderTop: `2px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
                    backgroundColor: isDarkMode ? '#1f2937' : '#f8fafc',
                    padding: '8px 12px',
                    '& .MuiTablePagination-root': {
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      minHeight: '40px',
                      height: '40px',
                    },
                    '& .MuiTablePagination-toolbar': {
                      minHeight: '40px',
                      height: '40px',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                    },
                    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                      fontSize: '0.95rem',
                      lineHeight: 1.2,
                      margin: 0,
                      padding: 0,
                    },
                    '& .MuiInputBase-root, & .MuiTablePagination-select': {
                      minHeight: '32px',
                      height: '32px',
                      fontSize: '0.95rem',
                      margin: 0,
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                    },
                  },
                  '& .MuiDataGrid-columnSeparator': {
                    display: 'none',
                  },
                }}
                pageSizeOptions={[5, 10, 25, 50]}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                autoHeight
                disableRowSelectionOnClick
              />
            )}
          </div>
        </ThemeProvider>
        {/* Column Management Modal */}
        <ColumnManagementModal />
        {/* Stock Modal for Sell, Order, Update */}
        {selectedProduct && modalType && (
          <StockModal
            isOpen={!!selectedProduct && !!modalType}
            onClose={() => {
              setSelectedProduct(null);
              setModalType(null);
            }}
            product={selectedProduct}
            type={modalType}
            onSubmit={modalType === 'sell'
              ? handleSellStock
              : modalType === 'order'
              ? handleCreateOrder
              : handleUpdateProduct}
          />
        )}
      </div>
    </div>
  );
}

export default Inventory;
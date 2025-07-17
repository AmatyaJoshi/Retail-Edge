'use client';

import type { FC, FormEvent } from 'react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { useGetProductsQuery, useUpdateProductStockMutation, useCreateSaleMutation } from '@/state/api';
import type { Customer } from '@/types';
import ConfirmationModal from './ConfirmationModal';
import BarcodeScanner from '@/app/components/BarcodeScanner';
import InvoicePrintModal from '@/app/components/InvoicePrintModal';

// Constants
const TAX_RATE = 0.08; // 8% tax rate

// Types
interface Product {
  id: string;
  name: string;
  barcode: string;
  price: number;
  category: string;
  stock: number;
  imageUrl: string | undefined;
}

interface CartItem extends Product {
  quantity: number;
}

interface POSSystemProps {
  selectedCustomer: Customer | null;
  onCustomerSelect: () => void;
  onCustomerChange: () => void;
  onPrescriptionOpen?: () => void;
}

interface InvoiceDetails {
  invoiceNumber: string;
  date: string;
}

interface CancellationDetails {
  invoiceNumber: string;
  date: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  totalAmount: number;
  customer: {
    customerId: string;
    name: string;
    email: string;
  } | null;
  status: 'CANCELLED';
}

// Eyewear SVG icon from svgrepo.com
const EyewearIcon: FC = () => (
  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="40" r="12" />
    <circle cx="48" cy="40" r="12" />
    <path d="M4 40c0-6 4-12 12-12m32 0c8 0 12 6 12 12" />
    <path d="M28 40h8" />
  </svg>
);

type PaymentMethod = 'cash' | 'UPI' | 'card';

interface POSSystemState {
  cart: CartItem[];
  searchTerm: string;
  barcodeInput: string;
  filterCategory: string;
  selectedPaymentMethod: PaymentMethod;
  showInvoice: boolean;
  invoiceDetails: InvoiceDetails;
  showCancelConfirmation: boolean;
  sortOption: 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-asc' | 'stock-desc';
}

export default function POSSystem({ 
  selectedCustomer, 
  onCustomerSelect, 
  onCustomerChange,
  onPrescriptionOpen
}: POSSystemProps) {
  // State management with proper types
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('cash');
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails>({
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0] as string,
  });
  const [showCompleteConfirmation, setShowCompleteConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [sortOption, setSortOption] = useState<POSSystemState['sortOption']>('name-asc');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Helper function to get formatted date
  const getFormattedDate = () => new Date().toISOString().split('T')[0] as string;

  // Fetch products using RTK Query
  const { data: apiProducts, isLoading, error } = useGetProductsQuery();
  const [updateProductStock] = useUpdateProductStockMutation();
  const [createSale] = useCreateSaleMutation();

  // Transform API products to match POS interface
  const products: Product[] = useMemo(() => {
    if (!apiProducts) return [];
    return apiProducts.map((product) => ({
      id: product.productId,
      name: product.name,
      barcode: product.productId,
      price: product.price,
      category: product.category,
      stock: product.stockQuantity,
      imageUrl: product.imageUrl
    }));
  }, [apiProducts]);

  // Custom order for categories
  const preferredOrder = ['frames', 'sunglasses', 'lenses', 'accessories'];
  const categories = useMemo(() => {
    if (!products) return ['all'];
    const unique = Array.from(new Set(products.map(p => typeof p.category === 'string' ? p.category.toLowerCase() : 'uncategorized')));
    const ordered = [
      'all',
      ...preferredOrder.filter(cat => unique.includes(cat)),
      ...unique.filter(cat => !preferredOrder.includes(cat) && cat !== 'all').sort()
    ];
    return ordered;
  }, [products]);

  // Focus on barcode input on component mount
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  // Show error toast if products fetch fails
  useEffect(() => {
    if (error) {
      toast.error('Failed to load products. Please try again later.');
    }
  }, [error]);

  // When setting the filter, always use lowercase
  const handleSetCategory = (cat: string) => {
    setFilterCategory(cat.toLowerCase());
  };

  // Filter products based on search term and category
  const filteredProducts = products.filter(product => {
    const productCategory = (product.category || 'uncategorized').toLowerCase();
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm);
    const matchesCategory =
      filterCategory === 'all' || productCategory === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort filtered products based on sortOption
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    switch (sortOption) {
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'stock-asc':
        sorted.sort((a, b) => a.stock - b.stock);
        break;
      case 'stock-desc':
        sorted.sort((a, b) => b.stock - a.stock);
        break;
      default:
        break;
    }
    return sorted;
  }, [filteredProducts, sortOption]);

  // Handle barcode input and scanning
  const handleBarcodeSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!barcodeInput.trim()) return;

    const product = products.find(p => p.barcode === barcodeInput);

    if (product) {
      addToCart(product);
      setBarcodeInput('');
      toast.success(`Added ${product.name} to cart`);
    } else {
      toast.error(`Product not found for barcode: ${barcodeInput}`);
      setBarcodeInput('');
    }

    // Refocus on input for next scan
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  };

  // Handle barcode detected from camera
  const handleBarcodeDetected = (barcode: string) => {
    setBarcodeInput(barcode);
    setScannerOpen(false);
    // Optionally, auto-add to cart:
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      addToCart(product);
      toast.success(`Added ${product.name} to cart`);
    } else {
      toast.error(`Product not found for barcode: ${barcode}`);
    }
  };

  // Cart operations
  const addToCart = (product: Product) => {
    if (!selectedCustomer) {
      toast.error('Please select a customer before adding products to the sale.');
      return;
    }
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);

      if (existingItem) {
        // Check if adding one more would exceed stock
        if (existingItem.quantity + 1 > product.stock) {
          toast.error(`Cannot add more ${product.name}. Stock limit reached.`);
          return prevCart;
        }

        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    const product = products.find(p => p.id === id);

    if (product && quantity > product.stock) {
      toast.error(`Cannot add more ${product.name}. Stock limit reached.`);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  // Generate invoice number
  const generateInvoiceNumber = () => {
    const timestamp = Date.now().toString();
    return `INV-${timestamp.slice(-8)}`;
  };

  // Process payment and generate bill
  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    // Only generate invoice and show it, do not update stock or create sales yet
    try {
      // Generate invoice number
      const newInvoiceNumber = generateInvoiceNumber();

      // Set invoice details
      setInvoiceDetails({
        invoiceNumber: newInvoiceNumber,
        date: getFormattedDate(),
      });

      // Show invoice
      setShowInvoice(true);
    } catch (error) {
      console.error('Error during checkout:', error);
      toast.error('Failed to process checkout. Please try again.');
    }
  };

  const finalizeSale = async () => {
    // Now update stock and create sales records
    try {
      for (const item of cart) {
        // Create sale record with type-safe customerId
        const saleData = {
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.price,
          totalAmount: item.price * item.quantity,
          ...(selectedCustomer?.customerId ? { customerId: selectedCustomer.customerId } : {})
        };
        await createSale(saleData);

        // Update product stock
        const updatedStock = item.stock - item.quantity;
        await updateProductStock({
          productId: item.id,
          stockQuantity: updatedStock
        });
      }
      toast.success('Sale completed successfully!');
      clearCart();
      setShowInvoice(false);
      // Reset customer selection
      if (onCustomerChange) {
        onCustomerChange();
      }
    } catch (error) {
      console.error('Error finalizing sale:', error);
      toast.error('Failed to complete sale. Please try again.');
    }
  };

  // Add this function to handle sale cancellation
  const handleCancelSale = () => {
    setShowCancelConfirmation(true);
  };

  const confirmCancelSale = () => {
    setShowCancelConfirmation(false);
    setShowInvoice(false);
  };

  const handlePrintInvoice = () => {
    setShowPrintModal(true);
  };

  const handlePrintModalPrint = () => {
    const printContents = document.getElementById('invoice-print-modal');
    if (printContents) {
      const printWindow = window.open('', '', 'width=400,height=600');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Print Invoice</title>');
        printWindow.document.write('<link rel="stylesheet" href="/globals.css" />');
        printWindow.document.write('</head><body >');
        printWindow.document.write(printContents.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 300);
      }
    }
  };

  const handleConfirmCancellation = async () => {
    try {
      // Generate cancellation record
      const cancellationDetails: CancellationDetails = {
        invoiceNumber: invoiceDetails.invoiceNumber,
        date: getFormattedDate(),
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity
        })),
        totalAmount: total,
        customer: selectedCustomer ? {
          customerId: selectedCustomer.customerId,
          name: selectedCustomer.name,
          email: selectedCustomer.email || ''
        } : null,
        status: 'CANCELLED'
      };

      // Restore stock quantities
      for (const item of cart) {
        const currentProduct = products.find(p => p.id === item.id);
        if (!currentProduct) continue;

        const correctStock = currentProduct.stock + item.quantity;

        await updateProductStock({
          productId: item.id,
          stockQuantity: correctStock
        });
      }

      // Create a cancelled sale record for each item in the cart
      for (const item of cart) {
        const saleData = {
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.price,
          totalAmount: item.price * item.quantity,
          status: 'CANCELLED',
          ...(selectedCustomer?.customerId ? { customerId: selectedCustomer.customerId } : {})
        };
        await createSale(saleData);
      }

      // Clear the cart and reset states
      clearCart();
      setSearchTerm('');
      setBarcodeInput('');
      setFilterCategory('all');
      setSelectedPaymentMethod('cash');
      setShowInvoice(false);
      setInvoiceDetails({
        invoiceNumber: '',
        date: getFormattedDate(),
      });

      // Reset customer selection
      if (onCustomerChange) {
        onCustomerChange();
      }

      // Refocus on barcode input
      if (barcodeInputRef.current) {
        barcodeInputRef.current.focus();
      }

      // Close the confirmation modal
      setShowCancelConfirmation(false);

      // Show cancellation notification
      toast.custom((t) => (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Sale Cancelled</p>
                <p className="text-sm text-gray-500">
                  Invoice #{cancellationDetails.invoiceNumber} has been cancelled
                </p>
              </div>
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ), {
        duration: 5000,
      });

    } catch (error) {
      console.error('Error cancelling sale:', error);
      toast.error('Failed to cancel sale. Please try again.');
    }
  };

  const handleCompleteSale = () => {
    setShowCompleteConfirmation(true);
  };

  const confirmCompleteSale = async () => {
    setShowCompleteConfirmation(false);
    await finalizeSale();
  };

  // Clear cart when customer is removed
  useEffect(() => {
    if (!selectedCustomer) {
      setCart([]);
    }
  }, [selectedCustomer]);

  return (
    <div className="flex flex-col w-full h-screen min-h-0 bg-gray-50 dark:bg-gray-900 overflow-hidden overflow-x-hidden">
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-print, #invoice-print * {
            visibility: visible;
          }
          #invoice-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
          }
        }
      `}</style>

      {/* Main POS Interface */}
      <div className="flex flex-1 w-full h-full min-h-0 overflow-hidden pt-20">
        {/* Left side - Products */}
        <div className="flex-[2.2] flex flex-col bg-gray-50 dark:bg-gray-900 border-l border-gray-300 dark:border-gray-700 shadow-lg rounded-r-xl min-w-0 overflow-hidden p-4">
          {/* Search and Barcode */}
          <div className="mb-3 flex flex-col gap-2">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search products by name or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border rounded-lg border-gray-200 bg-white shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 transition-all duration-200"
              />
            </div>

            <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-2 bg-white dark:bg-gray-700 rounded-lg shadow px-2 py-2 border border-gray-100 dark:border-gray-600">
              <input
                ref={barcodeInputRef}
                type="text"
                value={barcodeInput}
                onChange={e => setBarcodeInput(e.target.value)}
                placeholder="Scan or enter barcode"
                className="flex-1 px-2 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 transition-all duration-200"
              />
              <button type="submit" className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm transition-all duration-200">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Add by Barcode
              </button>
              <button type="button" className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white text-blue-700 font-semibold border border-blue-200 shadow hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm dark:bg-gray-800 dark:border-blue-600 dark:text-blue-300 hover:dark:bg-gray-700" onClick={() => setScannerOpen(true)}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4" stroke="#1976d2" strokeWidth="2"/><path d="M8 12h8M12 8v8" stroke="#1976d2" strokeWidth="2" strokeLinecap="round"/></svg>
                Scan
              </button>
            </form>
            {scannerOpen && (
              <BarcodeScanner
                onDetected={handleBarcodeDetected}
                onClose={() => setScannerOpen(false)}
              />
            )}
          </div>

          {/* Categories and Sort Filter Row */}
          <div className="mb-3 flex flex-wrap items-center gap-2 justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => handleSetCategory(category)}
                  className={`px-3 py-2 rounded-lg text-xs whitespace-nowrap border shadow transition-all duration-200 font-medium
                    ${filterCategory === category
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 hover:dark:bg-gray-600'}
                  `}
                >
                  {(typeof category === 'string' ? category.charAt(0).toUpperCase() + category.slice(1) : '')}
                </button>
              ))}
            </div>
            {/* Sort Filter Dropdown (right-aligned, same line) */}
            <div className="flex items-center gap-2 ml-auto">
              <label htmlFor="sort-products" className="font-medium text-xs text-gray-700 dark:text-gray-300">Sort by:</label>
              <select
                id="sort-products"
                value={sortOption}
                onChange={e => setSortOption(e.target.value as any)}
                className="p-2 border rounded-lg text-xs border-gray-200 bg-white shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 transition-all duration-200"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
                <option value="stock-asc">Stock (Low to High)</option>
                <option value="stock-desc">Stock (High to Low)</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-3 gap-4 flex-1 w-full min-w-0 bg-gray-50 dark:bg-gray-900 custom-scrollbar p-0 px-1 overflow-auto overflow-x-hidden max-h-[calc(100vh-210px)] min-h-0 rounded-none">
            {isLoading ? (
              <div className="col-span-3 flex justify-center items-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">Loading products...</p>
                </div>
              </div>
            ) : sortedProducts.length > 0 ? (
              sortedProducts.map(product => (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="relative border border-gray-200 rounded-r-lg rounded-l-none p-3 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 flex flex-col bg-white shadow-md hover:shadow-lg transform will-change-transform hover:scale-105 hover:z-20 dark:bg-gray-800 dark:border-gray-600 hover:dark:bg-gray-700 hover:dark:border-blue-500"
                >
                  {/* Product Image - Larger and more prominent */}
                  <div className="flex justify-center mb-3">
                    {product.imageUrl ? (
                      <div className="w-full h-32 bg-white dark:bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                    <Image
                          src={`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'}/api/product-image/${product.imageUrl.startsWith('http') ? product.imageUrl.split('/').pop() : product.imageUrl}`}
                      alt={product.name}
                          width={128}
                          height={128}
                          className="object-cover w-full h-full"
                          unoptimized
                    />
                      </div>
                    ) : (
                      <div className="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-600">
                        <EyewearIcon />
                    </div>
                    )}
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex-1 flex flex-col">
                  <div className="font-bold text-base mb-1 text-gray-900 dark:text-gray-100">{product.name}</div>
                  <div className="text-gray-600 text-xs mb-0.5 dark:text-gray-400 break-all">SKU: {product.barcode}</div>
                    <div className="text-gray-600 text-xs mb-2 dark:text-gray-400">Category: {product.category}</div>
                  <div className="mt-auto flex justify-between items-center">
                    <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                      ₹{product.price}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 ${product.stock < 5 ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' : ''}`}> 
                      {product.stock} in stock
                    </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 flex justify-center items-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-gray-700">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">No products found</p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm">Try adjusting your search or filters</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right side - Cart and Checkout */}
        <div className="flex-[1] w-full max-w-md bg-white dark:bg-gray-800 flex flex-col border-l border-gray-200 dark:border-gray-700 min-h-0 overflow-hidden overflow-x-hidden rounded-l-xl shadow-xl p-4 border dark:border-gray-700">
          {showInvoice ? (
            <div className="flex flex-col flex-1 overflow-y-auto custom-scrollbar max-h-[calc(100vh-120px)]">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Invoice</h2>
              <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-xl flex-1 border-2 border-gray-200 dark:border-gray-600" id="invoice-print">
                {/* Header with Logo and Store Info */}
                <div className="text-center mb-6 pb-4 border-b-2 border-gray-300 dark:border-gray-600">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="16" cy="40" r="12" stroke="currentColor" strokeWidth="2" fill="none" />
                        <circle cx="48" cy="40" r="12" stroke="currentColor" strokeWidth="2" fill="none" />
                        <path d="M4 40c0-6 4-12 12-12m32 0c8 0 12 6 12 12" stroke="currentColor" strokeWidth="2" fill="none" />
                        <path d="M28 40h8" stroke="currentColor" strokeWidth="2" fill="none" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="font-bold text-2xl text-gray-900 dark:text-gray-100">VISION LOOP OPTICALS</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Your Vision, Our Priority</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="text-left">
                      <p><strong>Address:</strong> 123 Vision Street, Pune</p>
                      <p><strong>Phone:</strong> +91 9898983298</p>
                      <p><strong>Email:</strong> info@visionloop.com</p>
                    </div>
                    <div className="text-right">
                      <p><strong>GST No:</strong> 27ABCDE1234F1Z5</p>
                      <p><strong>PAN:</strong> ABCDE1234F</p>
                      <p><strong>License:</strong> OPT-2024-001</p>
                    </div>
                  </div>
                </div>

                {/* Invoice Details */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">INVOICE</h3>
                    <div className="bg-gray-50 dark:bg-gray-600 p-3 rounded-lg">
                      <p className="text-sm"><strong>Invoice No:</strong> {invoiceDetails.invoiceNumber}</p>
                      <p className="text-sm"><strong>Date:</strong> {new Date(invoiceDetails.date).toLocaleDateString('en-IN')}</p>
                      <p className="text-sm"><strong>Time:</strong> {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">PAYMENT METHOD</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">{selectedPaymentMethod.toUpperCase()}</p>
                    </div>
                  </div>
                </div>

                {selectedCustomer && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-md dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-700">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <h4 className="font-bold text-blue-900 dark:text-blue-100">CUSTOMER DETAILS</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-blue-800 dark:text-blue-200 font-semibold">{selectedCustomer.name}</p>
                        <p className="text-blue-700 dark:text-blue-300">{selectedCustomer.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    ITEMS PURCHASED
                  </h4>
                  <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
                        <tr>
                          <th className="text-left p-3 font-bold text-gray-900 dark:text-gray-100 text-sm border-r border-gray-300 dark:border-gray-500">Item Description</th>
                          <th className="text-center p-3 font-bold text-gray-900 dark:text-gray-100 text-sm border-r border-gray-300 dark:border-gray-500">Qty</th>
                          <th className="text-right p-3 font-bold text-gray-900 dark:text-gray-100 text-sm border-r border-gray-300 dark:border-gray-500">Unit Price</th>
                          <th className="text-right p-3 font-bold text-gray-900 dark:text-gray-100 text-sm">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.map((item, index) => (
                          <tr key={item.id} className={`border-b border-gray-200 dark:border-gray-600 ${index % 2 === 0 ? 'bg-white dark:bg-gray-700' : 'bg-gray-50 dark:bg-gray-800'}`}>
                            <td className="p-3 font-medium text-gray-900 dark:text-gray-100 text-sm border-r border-gray-200 dark:border-gray-600">
                              <div>
                                <div className="font-semibold">{item.name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">SKU: {item.barcode}</div>
                              </div>
                            </td>
                            <td className="text-center p-3 text-gray-700 dark:text-gray-300 text-sm border-r border-gray-200 dark:border-gray-600 font-semibold">{item.quantity}</td>
                            <td className="text-right p-3 text-gray-700 dark:text-gray-300 text-sm border-r border-gray-200 dark:border-gray-600">₹{item.price.toFixed(2)}</td>
                            <td className="text-right p-3 font-bold text-gray-900 dark:text-gray-100 text-sm">₹{(item.price * item.quantity).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="ml-auto w-72">
                  <div className="flex justify-between mb-2 text-gray-700 dark:text-gray-300">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2 text-gray-700 dark:text-gray-300">
                    <span>Tax (8%):</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-xl text-gray-900 dark:text-gray-100 border-t-2 border-gray-300 dark:border-gray-500 pt-2">
                    <span>Total:</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                  <div className="mt-4 p-3 bg-gray-50 border-2 border-gray-200 rounded-lg dark:bg-gray-600 dark:border-gray-500">
                    <p className="text-gray-700 dark:text-gray-300 font-medium">Payment Method: {selectedPaymentMethod.toUpperCase()}</p>
                  </div>
                </div>

                <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                  <p>Thank you for your business!</p>
                  <p>Please keep this receipt for your records.</p>
                </div>
              </div>

              <div className="mt-6 flex space-x-2">
                <button
                  onClick={handleCancelSale}
                  className="flex-1 bg-red-400 text-white px-3 py-2 rounded-md hover:bg-red-500 transition-all duration-200 shadow-sm hover:shadow-md font-medium text-sm"
                >
                  Cancel Sale
                </button>
                <button
                  onClick={handlePrintInvoice}
                  className="flex-1 bg-blue-400 text-white px-3 py-2 rounded-md hover:bg-blue-500 transition-all duration-200 shadow-sm hover:shadow-md font-medium text-sm"
                >
                  Print Invoice
                </button>
                <button
                  onClick={handleCompleteSale}
                  className="flex-1 bg-green-400 text-white px-3 py-2 rounded-md hover:bg-green-500 transition-all duration-200 shadow-sm hover:shadow-md font-medium text-sm"
                >
                  Complete Sale
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Current Sale</h2>

              <div className="flex-1 overflow-auto mb-2 custom-scrollbar min-h-0 max-h-[calc(100vh-340px)]">
                {cart.length > 0 ? (
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between bg-white dark:bg-gray-700 p-2 rounded-lg shadow border border-gray-200 dark:border-gray-600 mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-0.5">{item.name}</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-xs">₹{item.price.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="bg-gray-200 text-gray-700 w-6 h-6 rounded flex items-center justify-center hover:bg-gray-300 transition-colors dark:bg-gray-600 dark:text-gray-200 hover:dark:bg-gray-500 font-bold text-base"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-semibold text-gray-900 dark:text-gray-100 text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="bg-gray-200 text-gray-700 w-6 h-6 rounded flex items-center justify-center hover:bg-gray-300 transition-colors dark:bg-gray-600 dark:text-gray-200 hover:dark:bg-gray-500 font-bold text-base"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 ml-1 hover:text-red-700 transition-colors p-0.5"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-500 dark:text-gray-400">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 dark:bg-gray-700">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                      </svg>
                    </div>
                    <p className="font-medium">Cart is empty</p>
                    <p className="text-sm">Scan a barcode or select products</p>
                  </div>
                )}
              </div>

              {/* Customer selection */}
              <div className="mb-2 p-2 bg-white dark:bg-gray-700 rounded-lg shadow border border-gray-200 dark:border-gray-600">
                <h3 className="font-semibold mb-1 text-gray-900 dark:text-gray-100 text-sm">Customer</h3>
                {selectedCustomer ? (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{selectedCustomer.name}</p>
                      <p className="text-gray-600 dark:text-gray-400 text-xs">{selectedCustomer.email}</p>
                    </div>
                      <div className="flex gap-1">
                        {selectedCustomer && onPrescriptionOpen && (
                          <button
                            onClick={onPrescriptionOpen}
                            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-all duration-200 shadow font-medium"
                          >
                            {selectedCustomer.prescription ? 'Update Rx' : 'Add Rx'}
                          </button>
                        )}
                    <button
                      onClick={onCustomerChange}
                          className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-all duration-200 shadow font-medium"
                    >
                      Remove
                    </button>
                      </div>
                    </div>
                    {selectedCustomer.prescription && (
                      <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200 shadow-sm dark:bg-blue-900/20 dark:border-blue-700">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-xs">Prescription Details</h4>
                          <span className="text-xs text-blue-700 dark:text-blue-300">
                            Expires: {new Date(selectedCustomer.prescription.expiryDate).toLocaleDateString('en-GB')}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {/* Right Eye */}
                          <div>
                            <h5 className="font-semibold text-xs mb-1 text-blue-800 dark:text-blue-200">Right Eye</h5>
                            <div className="text-xs space-y-0.5 text-blue-700 dark:text-blue-300">
                              <p>Sphere: {selectedCustomer.prescription.rightEye.sphere}</p>
                              <p>Cylinder: {selectedCustomer.prescription.rightEye.cylinder}</p>
                              <p>Axis: {selectedCustomer.prescription.rightEye.axis}°</p>
                              <p>Add: {selectedCustomer.prescription.rightEye.add}</p>
                              <p>PD: {selectedCustomer.prescription.rightEye.pd}mm</p>
                            </div>
                          </div>
                          {/* Left Eye */}
                          <div>
                            <h5 className="font-semibold text-xs mb-1 text-blue-800 dark:text-blue-200">Left Eye</h5>
                            <div className="text-xs space-y-0.5 text-blue-700 dark:text-blue-300">
                              <p>Sphere: {selectedCustomer.prescription.leftEye.sphere}</p>
                              <p>Cylinder: {selectedCustomer.prescription.leftEye.cylinder}</p>
                              <p>Axis: {selectedCustomer.prescription.leftEye.axis}°</p>
                              <p>Add: {selectedCustomer.prescription.leftEye.add}</p>
                              <p>PD: {selectedCustomer.prescription.leftEye.pd}mm</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-1 pt-1 border-t border-blue-200 dark:border-blue-700">
                          <p className="text-xs text-blue-700 dark:text-blue-300"><span className="font-semibold">Doctor:</span> {selectedCustomer.prescription.doctor}</p>
                          {selectedCustomer.prescription.notes && (
                            <p className="text-xs mt-0.5 text-blue-700 dark:text-blue-300"><span className="font-semibold">Notes:</span> {selectedCustomer.prescription.notes}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <p className="text-gray-500 dark:text-gray-400 text-xs">No customer selected</p>
                    <button
                      className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-all duration-200 shadow font-medium"
                      onClick={onCustomerSelect}
                    >
                      Select Customer
                    </button>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="bg-white dark:bg-gray-700 p-2 rounded-lg shadow mb-2 border border-gray-200 dark:border-gray-600">
                <div className="flex justify-between mb-0.5 text-gray-700 dark:text-gray-300 text-xs">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-0.5 text-gray-700 dark:text-gray-300 text-xs">
                  <span>Tax (8%):</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-base text-gray-900 dark:text-gray-100 border-t border-gray-300 dark:border-gray-500 pt-1 mt-1">
                  <span>Total:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment method */}
              <div className="mb-2">
                <h3 className="font-semibold mb-1 text-gray-900 dark:text-gray-100 text-sm">Payment Method</h3>
                <div className="grid grid-cols-3 gap-1">
                  {(['cash', 'UPI', 'card'] as const).map(method => (
                    <button
                      key={method}
                      onClick={() => setSelectedPaymentMethod(method)}
                      className={`p-2 rounded-lg border text-center capitalize shadow text-xs font-medium
                        ${selectedPaymentMethod === method
                          ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:border-blue-400 dark:text-blue-200'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 hover:dark:bg-gray-600'}`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={clearCart}
                  className="flex-1 bg-gray-500 text-white font-bold px-6 py-4 rounded-xl hover:bg-gray-600 transition-all duration-200 shadow-lg transform hover:scale-105"
                  disabled={cart.length === 0}
                >
                  Clear Cart
                </button>
                <button
                  onClick={handleCheckout}
                  className="flex-1 bg-green-500 text-white font-bold px-6 py-4 rounded-xl hover:bg-green-600 transition-all duration-200 shadow-lg transform hover:scale-105"
                  disabled={cart.length === 0}
                >
                  Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Cancel Sale */}
      <ConfirmationModal
        isOpen={showCancelConfirmation}
        onClose={() => setShowCancelConfirmation(false)}
        onConfirm={confirmCancelSale}
        title="Cancel Sale"
        message="Are you sure you want to cancel this sale? This will discard the current invoice and return to the POS."
        confirmText="Yes, Cancel Sale"
        cancelText="No, Keep Sale"
      />
      {/* Confirmation Modal for Complete Sale */}
      <ConfirmationModal
        isOpen={showCompleteConfirmation}
        onClose={() => setShowCompleteConfirmation(false)}
        onConfirm={confirmCompleteSale}
        title="Complete Sale"
        message="Are you sure you want to complete this sale? This will finalize the sale and update stock."
        confirmText="Yes, Complete Sale"
        cancelText="No, Go Back"
      />
      {/* Print Modal for Invoice */}
      <InvoicePrintModal
        open={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        onPrint={handlePrintModalPrint}
        invoiceDetails={invoiceDetails}
        cart={cart}
        subtotal={subtotal}
        tax={tax}
        total={total}
        selectedCustomer={selectedCustomer ? { name: selectedCustomer.name, email: selectedCustomer.email } : null}
        selectedPaymentMethod={selectedPaymentMethod}
      />
    </div>
  );
}
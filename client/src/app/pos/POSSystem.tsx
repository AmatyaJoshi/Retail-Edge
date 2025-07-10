'use client';

import type { FC, FormEvent } from 'react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { useGetProductsQuery, useUpdateProductStockMutation, useCreateSaleMutation } from '@/state/api';
import type { Customer } from '@/types';
import ConfirmationModal from './ConfirmationModal';
import BarcodeScanner from '@/app/components/BarcodeScanner';

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
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [sortOption, setSortOption] = useState<POSSystemState['sortOption']>('name-asc');
  const [scannerOpen, setScannerOpen] = useState(false);

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

  // Get unique categories from products
  const categories = useMemo(() => ['all', ...new Set(products.map(p => typeof p.category === 'string' ? p.category : 'uncategorized'))], [products]);

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

  // Filter products based on search term and category
  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm);

    const matchesCategory =
      filterCategory === 'all' ||
      (product.category || 'uncategorized') === filterCategory;

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

    try {
      // Update stock and create sales records in real-time
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

      // Generate invoice number
      const newInvoiceNumber = generateInvoiceNumber();

      // Set invoice details
      setInvoiceDetails({
        invoiceNumber: newInvoiceNumber,
        date: getFormattedDate(),
      });

      // Show invoice
      setShowInvoice(true);
      toast.custom((t) => (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Stock Updated</p>
                <p className="text-sm text-gray-500">Items have been processed successfully</p>
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
        duration: 4000,
      });
    } catch (error) {
      console.error('Error during checkout:', error);
      toast.error('Failed to process checkout. Please try again.');
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const finalizeSale = () => {
    // Sale is already processed during checkout
    toast.success('Sale completed successfully!');
    clearCart();
    setShowInvoice(false);
    // Reset customer selection
    if (onCustomerChange) {
      onCustomerChange();
    }
  };

  // Add this function to handle sale cancellation
  const handleCancelSale = () => {
    if (cart.length === 0) {
      toast.error('No sale to cancel');
      return;
    }
    setShowCancelConfirmation(true);
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

  return (
    <div className="flex flex-col h-screen">
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
            inset-inline-start: 0;
            inset-block-start: 0;
            inline-size: 100%;
            block-size: auto;
          }
        }
      `}</style>

      {/* Main POS Interface */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left side - Products */}
        <div className="w-2/3 p-4 flex flex-col">
          {/* Search and Barcode */}
          <div className="mb-4 flex flex-col gap-2">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border rounded-xl border-gray-200 bg-white shadow-md"
              />
            </div>

            <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-2 bg-white rounded-xl shadow-md px-3 py-2 border border-gray-100">
              <input
                ref={barcodeInputRef}
                type="text"
                value={barcodeInput}
                onChange={e => setBarcodeInput(e.target.value)}
                placeholder="Scan or enter barcode"
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-white"
              />
              <button type="submit" className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Add by Barcode
              </button>
              <button type="button" className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-white text-blue-700 font-semibold border border-blue-200 shadow hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 transition" onClick={() => setScannerOpen(true)}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4" stroke="#1976d2" strokeWidth="2"/><path d="M8 12h8M12 8v8" stroke="#1976d2" strokeWidth="2" strokeLinecap="round"/></svg>
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
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setFilterCategory(category)}
                  className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap border shadow-md
                    ${filterCategory === category
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-white text-gray-800 border-gray-200'}
                  `}
                >
                  {(typeof category === 'string' ? category.charAt(0).toUpperCase() + category.slice(1) : '')}
                </button>
              ))}
            </div>
            {/* Sort Filter Dropdown (beside category filter) */}
            <div className="flex items-center gap-2 ml-auto">
              <label htmlFor="sort-products" className="font-medium text-sm">Sort by:</label>
              <select
                id="sort-products"
                value={sortOption}
                onChange={e => setSortOption(e.target.value as any)}
                className="p-2 border rounded-xl text-sm border-gray-200 bg-white shadow"
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
          <div className="grid grid-cols-3 gap-4 overflow-y-auto flex-1">
            {isLoading ? (
              <div className="col-span-3 flex justify-center items-center">
                <p>Loading products...</p>
              </div>
            ) : sortedProducts.length > 0 ? (
              sortedProducts.map(product => (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="border border-gray-100 rounded-xl p-4 cursor-pointer hover:bg-blue-50 transition flex flex-col bg-white shadow-md"
                >
                  <div className="flex justify-center mb-2">
                    {product.imageUrl ? (
                    <Image
                        src={product.imageUrl}
                      alt={product.name}
                      width={100}
                      height={100}
                      className="rounded-lg object-contain"
                    />
                    ) : (
                    <div className="w-[100px] h-[100px] bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                        <EyewearIcon />
                    </div>
                    )}
                  </div>
                  <div className="font-bold">{product.name}</div>
                  <div className="text-gray-500 text-sm">SKU: {product.barcode}</div>
                  <div className="text-gray-500 text-sm">Category: {product.category}</div>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="font-bold text-lg">
                      ₹{product.price}
                    </span>
                    <span className={`text-sm ${product.stock < 5 ? 'text-red-500' : 'text-gray-500'}`}>
                      {product.stock} in stock
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 flex justify-center items-center">
                <p>No products found</p>
              </div>
            )}
          </div>
        </div>

        {/* Right side - Cart and Checkout */}
        <div className="w-1/3 bg-white p-4 flex flex-col border-l border-gray-100">
          {showInvoice ? (
            <div className="flex flex-col flex-1">
              <h2 className="text-xl font-bold mb-4">Invoice</h2>
              <div className="bg-white p-4 rounded-xl shadow-md flex-1 overflow-y-auto border border-gray-100" id="invoice-print">
                <div className="flex justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg">Vision Loop Opticals</h3>
                    <p>123 Vision Street</p>
                    <p>Pune, India</p>
                    <p>Phone: 9898983298</p>
                  </div>
                  <div className="text-right">
                    <h3 className="font-bold">INVOICE</h3>
                    <p>Invoice #: {invoiceDetails.invoiceNumber}</p>
                    <p>Date: {invoiceDetails.date}</p>
                  </div>
                </div>

                {selectedCustomer && (
                  <div className="mb-4 p-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <h4 className="font-bold">Customer:</h4>
                    <p>{selectedCustomer.name}</p>
                    <p>{selectedCustomer.email}</p>
                  </div>
                )}

                <table className="w-full mb-4">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left p-2">Item</th>
                      <th className="text-right p-2">Qty</th>
                      <th className="text-right p-2">Price</th>
                      <th className="text-right p-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map(item => (
                      <tr key={item.id} className="border-b">
                        <td className="p-2">{item.name}</td>
                        <td className="text-right p-2">{item.quantity}</td>
                        <td className="text-right p-2">₹{item.price.toFixed(2)}</td>
                        <td className="text-right p-2">₹{(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="ml-auto w-64">
                  <div className="flex justify-between mb-1">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Tax (8%):</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                  <div className="mt-4 p-2 bg-white border-t border-gray-100">
                    <p>Payment Method: {selectedPaymentMethod.toUpperCase()}</p>
                  </div>
                </div>

                <div className="mt-8 text-center text-sm">
                  <p>Thank you for your business!</p>
                  <p>Please keep this receipt for your records.</p>
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <button
                  onClick={handleCancelSale}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-colors shadow"
                >
                  Cancel Sale
                </button>
                <button
                  onClick={handlePrintInvoice}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors shadow"
                >
                  Print Invoice
                </button>
                <button
                  onClick={finalizeSale}
                  className="flex-1 bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition-colors shadow"
                >
                  Complete Sale
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-4">Current Sale</h2>

              <div className="flex-1 overflow-y-auto mb-4">
                {cart.length > 0 ? (
                  <div className="space-y-2">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between bg-white p-3 rounded-xl shadow-md border border-gray-100">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-gray-500 text-sm">₹{item.price.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="bg-gray-200 text-gray-700 w-6 h-6 rounded flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="bg-gray-200 text-gray-700 w-6 h-6 rounded flex items-center justify-center"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                    <p>Cart is empty</p>
                    <p className="text-sm">Scan a barcode or select products</p>
                  </div>
                )}
              </div>

              {/* Customer selection */}
              <div className="mb-4 p-3 bg-white rounded-xl shadow-md border border-gray-100">
                <h3 className="font-medium mb-2">Customer</h3>
                {selectedCustomer ? (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="font-bold">{selectedCustomer.name}</p>
                      <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
                    </div>
                      <div className="flex gap-2">
                        {selectedCustomer && onPrescriptionOpen && (
                          <button
                            onClick={onPrescriptionOpen}
                            className="px-3 py-1 text-sm bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow"
                          >
                            {selectedCustomer.prescription ? 'Update Rx' : 'Add Rx'}
                          </button>
                        )}
                    <button
                      onClick={onCustomerChange}
                          className="px-3 py-1 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow"
                    >
                      Change
                    </button>
                      </div>
                    </div>
                    
                    {selectedCustomer.prescription && (
                      <div className="mt-3 p-3 bg-white rounded-xl border border-gray-100 shadow-md">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold text-blue-600">Prescription Details</h4>
                          <span className="text-sm text-gray-500">
                            Expires: {new Date(selectedCustomer.prescription.expiryDate).toLocaleDateString('en-GB')}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          {/* Right Eye */}
                          <div>
                            <h5 className="font-medium text-sm mb-1">Right Eye</h5>
                            <div className="text-sm space-y-1">
                              <p>Sphere: {selectedCustomer.prescription.rightEye.sphere}</p>
                              <p>Cylinder: {selectedCustomer.prescription.rightEye.cylinder}</p>
                              <p>Axis: {selectedCustomer.prescription.rightEye.axis}°</p>
                              <p>Add: {selectedCustomer.prescription.rightEye.add}</p>
                              <p>PD: {selectedCustomer.prescription.rightEye.pd}mm</p>
                            </div>
                          </div>
                          
                          {/* Left Eye */}
                          <div>
                            <h5 className="font-medium text-sm mb-1">Left Eye</h5>
                            <div className="text-sm space-y-1">
                              <p>Sphere: {selectedCustomer.prescription.leftEye.sphere}</p>
                              <p>Cylinder: {selectedCustomer.prescription.leftEye.cylinder}</p>
                              <p>Axis: {selectedCustomer.prescription.leftEye.axis}°</p>
                              <p>Add: {selectedCustomer.prescription.leftEye.add}</p>
                              <p>PD: {selectedCustomer.prescription.leftEye.pd}mm</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-2 border-t border-gray-100">
                          <p className="text-sm"><span className="font-medium">Doctor:</span> {selectedCustomer.prescription.doctor}</p>
                          {selectedCustomer.prescription.notes && (
                            <p className="text-sm mt-1"><span className="font-medium">Notes:</span> {selectedCustomer.prescription.notes}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <p className="text-gray-500">No customer selected</p>
                    <button
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow"
                      onClick={onCustomerSelect}
                    >
                      Select Customer
                    </button>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="bg-white p-3 rounded-xl shadow-md mb-4 border border-gray-100">
                <div className="flex justify-between mb-1">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Tax (8%):</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment method */}
              <div className="mb-4">
                <h3 className="font-medium mb-2">Payment Method</h3>
                <div className="grid grid-cols-3 gap-2">
                  {(['cash', 'UPI', 'card'] as const).map(method => (
                    <button
                      key={method}
                      onClick={() => setSelectedPaymentMethod(method)}
                      className={`p-2 rounded-xl border text-center capitalize shadow-md
                        ${selectedPaymentMethod === method
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-200'}`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={clearCart}
                  className="flex-1 bg-slate-500 text-white font-bold px-4 py-3 rounded-xl hover:bg-slate-600 transition-colors shadow"
                  disabled={cart.length === 0}
                >
                  Clear Cart
                </button>
                <button
                  onClick={handleCheckout}
                  className="flex-1 bg-green-500 text-white font-bold px-4 py-3 rounded-xl hover:bg-green-600 transition-colors shadow"
                  disabled={cart.length === 0}
                >
                  Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCancelConfirmation}
        onClose={() => setShowCancelConfirmation(false)}
        onConfirm={handleConfirmCancellation}
        title="Cancel Sale"
        message="Are you sure you want to cancel this sale? This will restore all items to inventory and cannot be undone."
        confirmText="Yes, Cancel Sale"
        cancelText="No, Keep Sale"
      />
    </div>
  );
}
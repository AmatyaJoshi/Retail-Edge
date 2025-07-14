import React, { useRef } from 'react';
import type { FC } from 'react';

interface InvoiceDetails {
  invoiceNumber: string;
  date: string;
}

interface CartItem {
  id: string;
  name: string;
  barcode: string;
  price: number;
  category: string;
  stock: number;
  imageUrl: string | undefined;
  quantity: number;
}

interface Customer {
  name: string;
  email: string | undefined;
}

type PaymentMethod = 'cash' | 'UPI' | 'card';

interface InvoicePrintModalProps {
  open: boolean;
  onClose: () => void;
  onPrint: () => void;
  invoiceDetails: InvoiceDetails;
  cart: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  selectedCustomer: Customer | null;
  selectedPaymentMethod: PaymentMethod;
}

const InvoicePrintModal: FC<InvoicePrintModalProps> = ({
  open,
  onClose,
  onPrint,
  invoiceDetails,
  cart,
  subtotal,
  tax,
  total,
  selectedCustomer,
  selectedPaymentMethod,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white w-[350px] max-w-full rounded-lg shadow-2xl p-6 relative print:w-full print:rounded-none print:shadow-none" ref={printRef} id="invoice-print-modal">
        {/* Store Header */}
        <div className="text-center border-b pb-2 mb-2">
          <h2 className="font-bold text-xl tracking-widest">VISION LOOP OPTICALS</h2>
          <p className="text-xs text-gray-600">123 Vision Street, Pune</p>
          <p className="text-xs text-gray-600">Phone: +91 9898983298</p>
          <p className="text-xs text-gray-600">GST: 27ABCDE1234F1Z5</p>
        </div>
        {/* Invoice Info */}
        <div className="flex justify-between text-xs mb-2">
          <span>Invoice: <span className="font-semibold">{invoiceDetails.invoiceNumber}</span></span>
          <span>Date: {new Date(invoiceDetails.date).toLocaleDateString('en-IN')}</span>
        </div>
        {/* Customer Info */}
        {selectedCustomer && (
          <div className="mb-2 text-xs">
            <span className="font-semibold">Customer:</span> {selectedCustomer.name}<br />
            <span className="text-gray-600">{selectedCustomer.email}</span>
          </div>
        )}
        {/* Items Table */}
        <table className="w-full text-xs mb-2 border-t border-b">
          <thead>
            <tr className="border-b">
              <th className="text-left py-1">Item</th>
              <th className="text-center py-1">Qty</th>
              <th className="text-right py-1">Rate</th>
              <th className="text-right py-1">Amt</th>
            </tr>
          </thead>
          <tbody>
            {cart.map(item => (
              <tr key={item.id}>
                <td className="py-1 pr-1">{item.name}</td>
                <td className="text-center py-1">{item.quantity}</td>
                <td className="text-right py-1">₹{item.price.toFixed(2)}</td>
                <td className="text-right py-1">₹{(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Totals */}
        <div className="text-xs mb-1 flex justify-between">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="text-xs mb-1 flex justify-between">
          <span>Tax (8%)</span>
          <span>₹{tax.toFixed(2)}</span>
        </div>
        <div className="text-base font-bold flex justify-between border-t pt-1 mb-2">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
        <div className="text-xs mb-2">
          <span className="font-semibold">Payment:</span> {selectedPaymentMethod.toUpperCase()}
        </div>
        <div className="text-center text-xs text-gray-500 mt-2 mb-4">
          Thank you for shopping with us!
        </div>
        {/* Actions */}
        <div className="flex gap-2 print:hidden">
          <button onClick={onPrint} className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition">Print</button>
          <button onClick={onClose} className="flex-1 bg-gray-300 text-gray-800 py-2 rounded font-semibold hover:bg-gray-400 transition">Close</button>
        </div>
      </div>
    </div>
  );
};

export default InvoicePrintModal; 
import React, { useRef, Fragment } from 'react';
import type { FC } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Printer } from 'lucide-react';

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

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-600 w-full max-w-md mx-auto transform transition-all duration-300 ease-in-out">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b-2 border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Invoice Preview</h2>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                    onClick={onClose}
                  >
                    <X className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {/* Invoice Content */}
                <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  <div 
                    ref={printRef} 
                    id="invoice-print-modal"
                    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 print:bg-white print:text-black"
                  >
                    {/* Store Header */}
                    <div className="text-center border-b-2 border-gray-200 dark:border-gray-600 pb-4 mb-4 print:border-black">
                      <h3 className="font-bold text-xl tracking-wider text-gray-900 dark:text-gray-100 print:text-black">
                        VISION LOOP OPTICALS
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-700 mt-1">
                        123 Vision Street, Pune
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-700">
                        Phone: +91 9898983298
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-700">
                        GST: 27ABCDE1234F1Z5
                      </p>
                    </div>

                    {/* Invoice Info */}
                    <div className="flex justify-between text-sm mb-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg print:bg-gray-100">
                      <div>
                        <span className="font-semibold text-gray-700 dark:text-gray-300 print:text-black">Invoice:</span>
                        <span className="ml-2 text-gray-900 dark:text-gray-100 print:text-black font-medium">
                          {invoiceDetails.invoiceNumber}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700 dark:text-gray-300 print:text-black">Date:</span>
                        <span className="ml-2 text-gray-900 dark:text-gray-100 print:text-black">
                          {new Date(invoiceDetails.date).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Customer Info */}
                    {selectedCustomer && (
                      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700 print:bg-blue-50 print:border-blue-200">
                        <div className="text-sm">
                          <span className="font-semibold text-blue-800 dark:text-blue-300 print:text-blue-800">
                            Customer:
                          </span>
                          <span className="ml-2 text-gray-900 dark:text-gray-100 print:text-black font-medium">
                            {selectedCustomer.name}
                          </span>
                        </div>
                        {selectedCustomer.email && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-700 mt-1">
                            {selectedCustomer.email}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Items Table */}
                    <div className="mb-4 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden print:border-black">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-700 print:bg-gray-200">
                          <tr>
                            <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100 print:text-black">
                              Item
                            </th>
                            <th className="text-center py-3 px-2 font-semibold text-gray-900 dark:text-gray-100 print:text-black">
                              Qty
                            </th>
                            <th className="text-right py-3 px-3 font-semibold text-gray-900 dark:text-gray-100 print:text-black">
                              Rate
                            </th>
                            <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-gray-100 print:text-black">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600 print:divide-gray-300">
                          {cart.map((item, index) => (
                            <tr 
                              key={item.id}
                              className={`${
                                index % 2 === 0 
                                  ? 'bg-white dark:bg-gray-800 print:bg-white' 
                                  : 'bg-gray-50 dark:bg-gray-750 print:bg-gray-50'
                              }`}
                            >
                              <td className="py-3 px-4 text-gray-900 dark:text-gray-100 print:text-black">
                                {item.name}
                              </td>
                              <td className="text-center py-3 px-2 text-gray-900 dark:text-gray-100 print:text-black">
                                {item.quantity}
                              </td>
                              <td className="text-right py-3 px-3 text-gray-900 dark:text-gray-100 print:text-black">
                                ₹{item.price.toFixed(2)}
                              </td>
                              <td className="text-right py-3 px-4 font-medium text-gray-900 dark:text-gray-100 print:text-black">
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Totals */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm py-2 border-b border-gray-200 dark:border-gray-600 print:border-gray-300">
                        <span className="text-gray-700 dark:text-gray-300 print:text-black">Subtotal</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100 print:text-black">
                          ₹{subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm py-2 border-b border-gray-200 dark:border-gray-600 print:border-gray-300">
                        <span className="text-gray-700 dark:text-gray-300 print:text-black">Tax (8%)</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100 print:text-black">
                          ₹{tax.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-bold py-3 border-t-2 border-gray-300 dark:border-gray-500 bg-gray-50 dark:bg-gray-700 px-4 rounded-lg print:bg-gray-100 print:border-black">
                        <span className="text-gray-900 dark:text-gray-100 print:text-black">Total</span>
                        <span className="text-gray-900 dark:text-gray-100 print:text-black">
                          ₹{total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700 print:bg-green-50 print:border-green-200">
                      <div className="text-sm">
                        <span className="font-semibold text-green-800 dark:text-green-300 print:text-green-800">
                          Payment Method:
                        </span>
                        <span className="ml-2 text-gray-900 dark:text-gray-100 print:text-black font-medium uppercase">
                          {selectedPaymentMethod}
                        </span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center text-sm text-gray-600 dark:text-gray-400 print:text-gray-700 border-t-2 border-gray-200 dark:border-gray-600 pt-4 print:border-black">
                      <p className="font-medium">Thank you for shopping with us!</p>
                      <p className="text-xs mt-1">Please visit us again</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-6 border-t-2 border-gray-200 dark:border-gray-700 print:hidden">
                  <button 
                    onClick={onPrint} 
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 dark:bg-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    <Printer className="w-5 h-5" />
                    Print Invoice
                  </button>
                  <button 
                    onClick={onClose} 
                    className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default InvoicePrintModal; 
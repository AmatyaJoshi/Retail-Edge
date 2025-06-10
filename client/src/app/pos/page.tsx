'use client';

import { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import POSSystem from './POSSytem';
import CustomerSelection from './CustomerSelection';
import PrescriptionForm from './PrescriptionForm';
import { Customer, Sale, Prescription } from '../types';
// import { products as productData } from '../data/products';

export default function Home() {
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
//   const [products, setProducts] = useState<Product[]>(productData);
  const [isLoggedIn] = useState(true); // Set to false for real authentication
  
  // Function to handle barcode detection from the global barcode reader
//   const handleBarcodeDetected = (barcode: string) => {
//     // const product = products.find(p => p.barcode === barcode);
    
//     if (product) {
//       // Pass the detected product to your POS system
//       // In a real implementation, you would use a context or ref to access the POS component
//       toast.success(`Detected: ${product.name}`);
      
//       // This is just a placeholder - in real implementation, you'll need to 
//       // pass this to your POSSystem component
//     } else {
//       toast.error(`Product not found for barcode: ${barcode}`);
//     }
//   };
  
  // Handle adding a new sale
//   const handleAddSale = (sale: Sale) => {
//     setSales(prev => [...prev, sale]);
    
//     // In a real app, update product inventory
//     setProducts(prev => 
//       prev.map(product => {
//         const soldItem = sale.items.find(item => item.id === product.id);
//         if (soldItem) {
//           return {
//             ...product,
//             stock: product.stock - soldItem.quantity
//           };
//         }
//         return product;
//       })
//     );
    
//     toast.success(`Sale #${sale.invoiceNumber} completed!`);
//   };
  
  // Handle selecting a customer
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(false);
    toast.success(`Customer ${customer.name} selected`);
  };
  
  // Handle adding a new customer
  const handleAddNewCustomer = () => {
    // In a real app, you would show a form to add a new customer
    setShowCustomerModal(false);
    toast.success('Customer created!');
    
    // For demo purposes, just create a mock customer
    const newCustomer: Customer = {
      customerId: `cust-${Date.now()}`,
      name: 'New Customer',
      phone: '(555) 987-6543',
      email: 'new@example.com',
      joinedDate: new Date().toISOString(),
    };
    
    setSelectedCustomer(newCustomer);
  };
  
  // Handle saving a prescription
  const handleSavePrescription = (prescription: Prescription) => {
    if (selectedCustomer) {
      setSelectedCustomer({
        ...selectedCustomer,
        prescription
      });
      
      // Show success message with expiry date
      const expiryDate = new Date(prescription.expiryDate).toLocaleDateString();
      toast.success(`Prescription saved! Valid until ${expiryDate}`);
    }
    
    setShowPrescriptionModal(false);
  };

  // Handle opening prescription form
  const handleOpenPrescription = () => {
    if (!selectedCustomer) {
      toast.error('Please select a customer first');
      return;
    }
    setShowPrescriptionModal(true);
  };
  
  return (
    <main className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      
      {/* Global barcode reader that works anywhere in the application */}
      {/* <BarcodeReader onBarcodeDetected={handleBarcodeDetected} isActive={isLoggedIn} /> */}
      
      {/* POS System */}
      <POSSystem 
        selectedCustomer={selectedCustomer}
        onCustomerSelect={() => setShowCustomerModal(true)}
        onCustomerChange={() => setSelectedCustomer(null)}
        onPrescriptionOpen={handleOpenPrescription}
      />
      
      {/* Customer Selection Modal */}
      <CustomerSelection
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onCustomerSelect={handleSelectCustomer}
      />
      
      {/* Prescription Modal */}
      {showPrescriptionModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <PrescriptionForm
            customerId={selectedCustomer.customerId}
            existingPrescription={selectedCustomer.prescription}
            onSave={handleSavePrescription}
            onCancel={() => setShowPrescriptionModal(false)}
          />
        </div>
      )}
    </main>
  );
}
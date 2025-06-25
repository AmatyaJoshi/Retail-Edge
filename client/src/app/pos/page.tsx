'use client';

import { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import POSSystem from './POSSystem';
import CustomerSelection from './CustomerSelection';
import PrescriptionForm from './PrescriptionForm';
import type { Customer } from '../types';
import type { Prescription } from '../types/prescriptions';
import { useUpdatePrescriptionMutation } from '@/state/api';

export default function Home() {
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [updatePrescription] = useUpdatePrescriptionMutation();
  
  // Handle selecting a customer
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(false);
    toast.success(`Customer ${customer.name} selected`);
  };
  
  // Handle saving a prescription
  const handleSavePrescription = async (prescription: Prescription) => {
    if (!selectedCustomer) return;

    try {
      // Update the prescription in the backend
      await updatePrescription({
        customerId: selectedCustomer.customerId,
        prescription: {
          ...prescription,
          rightEye: {
            ...prescription.rightEye,
            cylinder: prescription.rightEye.cylinder ?? 0,
            axis: prescription.rightEye.axis ?? 0,
            add: prescription.rightEye.add ?? 0,
            pd: prescription.rightEye.pd ?? 0
          },
          leftEye: {
            ...prescription.leftEye,
            cylinder: prescription.leftEye.cylinder ?? 0,
            axis: prescription.leftEye.axis ?? 0,
            add: prescription.leftEye.add ?? 0,
            pd: prescription.leftEye.pd ?? 0
          }
        }
      }).unwrap();

      // Update the local state
      setSelectedCustomer(prev => prev ? {
        ...prev,
        prescription
      } : null);
      
      // Show success message with expiry date
      const expiryDate = new Date(prescription.expiryDate).toLocaleDateString();
      toast.success(`Prescription saved! Valid until ${expiryDate}`);
      setShowPrescriptionModal(false);
    } catch (error) {
      console.error('Failed to save prescription:', error);
      toast.error('Failed to save prescription. Please try again.');
    }
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
'use client';

import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import POSSystem from './POSSystem';
import CustomerSelection from './CustomerSelection';
import PrescriptionForm from './PrescriptionForm';
import type { Customer } from '@/types';
import type { Prescription } from '@/types/prescriptions';
import { useUpdatePrescriptionMutation, useGetProductsQuery } from '@/state/api';
import { useUser } from '@clerk/nextjs';
import { useProductsDataUpdater } from '@/app/hooks/use-page-data-updater';

export default function Home() {
  const { isSignedIn, isLoaded, user } = useUser();
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [updatePrescription] = useUpdatePrescriptionMutation();
  
  // Fetch products for AI Assistant
  const { data: products } = useGetProductsQuery();
  
  // Update page data for AI Assistant
  useProductsDataUpdater(products || [], 'POS');
  
  // Debug authentication state
  useEffect(() => {
    console.log('POS Page - isSignedIn:', isSignedIn, 'isLoaded:', isLoaded, 'user:', user);
  }, [isSignedIn, isLoaded, user]);
  
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
      const prescriptionData: any = {
        date: prescription.date,
        expiryDate: prescription.expiryDate,
        rightEye: {
          sphere: prescription.rightEye.sphere
        },
        leftEye: {
          sphere: prescription.leftEye.sphere
        },
        doctor: prescription.doctor
      };

      // Add optional right eye fields only if they have values
      if (prescription.rightEye.cylinder !== undefined && prescription.rightEye.cylinder !== null) {
        prescriptionData.rightEye.cylinder = prescription.rightEye.cylinder;
      }
      if (prescription.rightEye.axis !== undefined && prescription.rightEye.axis !== null) {
        prescriptionData.rightEye.axis = prescription.rightEye.axis;
      }
      if (prescription.rightEye.add !== undefined && prescription.rightEye.add !== null) {
        prescriptionData.rightEye.add = prescription.rightEye.add;
      }
      if (prescription.rightEye.pd !== undefined && prescription.rightEye.pd !== null) {
        prescriptionData.rightEye.pd = prescription.rightEye.pd;
      }

      // Add optional left eye fields only if they have values
      if (prescription.leftEye.cylinder !== undefined && prescription.leftEye.cylinder !== null) {
        prescriptionData.leftEye.cylinder = prescription.leftEye.cylinder;
      }
      if (prescription.leftEye.axis !== undefined && prescription.leftEye.axis !== null) {
        prescriptionData.leftEye.axis = prescription.leftEye.axis;
      }
      if (prescription.leftEye.add !== undefined && prescription.leftEye.add !== null) {
        prescriptionData.leftEye.add = prescription.leftEye.add;
      }
      if (prescription.leftEye.pd !== undefined && prescription.leftEye.pd !== null) {
        prescriptionData.leftEye.pd = prescription.leftEye.pd;
      }

      // Only include notes if it has a value
      if (prescription.notes) {
        prescriptionData.notes = prescription.notes;
      }

      await updatePrescription({
        customerId: selectedCustomer.customerId,
        prescription: prescriptionData
      }).unwrap();

      // Update the local state with the prescription that includes customerId
      const updatedPrescription = {
        ...prescription,
        customerId: selectedCustomer.customerId
      };
      
      setSelectedCustomer(prev => prev ? {
        ...prev,
        prescription: updatedPrescription
      } : null);
      
      // Show success message with expiry date
      const expiryDate = new Date(prescription.expiryDate).toLocaleDateString('en-GB');
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
    <main className="min-h-screen bg-white dark:bg-gray-900">
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
      <PrescriptionForm
        isOpen={showPrescriptionModal && !!selectedCustomer}
        customerId={selectedCustomer?.customerId || ''}
        existingPrescription={selectedCustomer?.prescription}
        onSave={handleSavePrescription}
        onCancel={() => setShowPrescriptionModal(false)}
      />
    </main>
  );
}
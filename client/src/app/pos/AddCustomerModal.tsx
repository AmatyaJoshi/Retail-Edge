'use client';

import { useState } from 'react';
import { type Customer } from '../types';
import { useCreateCustomerMutation } from '@/state/api';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X, CheckCircle } from 'lucide-react';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerAdded: (customer: Customer) => void;
}

export default function AddCustomerModal({ isOpen, onClose, onCustomerAdded }: AddCustomerModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createCustomer, { isLoading }] = useCreateCustomerMutation();

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    // Basic phone number validation for Indian format
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Please enter a valid Indian phone number (10 digits starting with 6-9)');
      return false;
    }
    // Email validation if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const newCustomer = await createCustomer({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      }).unwrap();

      setSuccess(true);
      
      // Wait for 1.5 seconds to show the success message before closing
      setTimeout(() => {
        onCustomerAdded({
          customerId: newCustomer.customerId,
          name: newCustomer.name,
          email: newCustomer.email,
          phone: newCustomer.phone,
          joinedDate: newCustomer.joinedDate,
        });
      }, 1500);
    } catch (error) {
      console.error('Failed to create customer:', error);
      setError('Failed to create customer. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'phone' && value.length > 10) {
      return; // Don't update if length exceeds 10
    }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
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
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-12 text-left align-middle shadow-xl transition-all max-h-[98vh]">
                <Dialog.Title
                  as="h3"
                  className="text-3xl font-bold leading-8 text-gray-900 flex justify-between items-center"
                >
                  Add New Customer
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600"
                    onClick={onClose}
                  >
                    <X className="h-7 w-7" aria-hidden="true" />
                  </button>
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="mt-6">
                  {error && (
                    <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg text-lg">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg flex items-center text-lg">
                      <CheckCircle className="w-6 h-6 mr-2" />
                      Customer added successfully!
                    </div>
                  )}
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-lg font-semibold text-gray-700">Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg"
                        placeholder="Enter customer name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-lg font-semibold text-gray-700">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg"
                        placeholder="Enter email address (optional)"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-lg font-semibold text-gray-700">Phone Number * (max 10 digits)</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg"
                        placeholder="Enter phone number"
                        maxLength={10}
                      />
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end space-x-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-6 py-3 text-lg font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isLoading || success}
                    >
                      {isLoading ? 'Adding...' : success ? 'Added!' : 'Add Customer'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
      </div>
    </div>
      </Dialog>
    </Transition>
  );
}
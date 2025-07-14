'use client';

import { useState } from 'react';
import { type Customer } from '@/types';
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md" />
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-10 text-left align-middle shadow-2xl transition-all max-h-[98vh] border-2 border-gray-200 dark:border-gray-600">
                <Dialog.Title
                  as="h3"
                  className="text-3xl font-bold leading-8 text-gray-900 dark:text-gray-100 flex justify-between items-center mb-8"
                >
                  Add New Customer
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                    onClick={onClose}
                  >
                    <X className="h-7 w-7" aria-hidden="true" />
                  </button>
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="mt-6">
                  {error && (
                    <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl text-lg border-2 border-red-200 dark:border-red-700">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl flex items-center text-lg border-2 border-green-200 dark:border-green-700">
                      <CheckCircle className="w-6 h-6 mr-3" />
                      Customer added successfully!
                    </div>
                  )}
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-2 block w-full border-2 border-gray-300 dark:border-gray-600 rounded-xl shadow-lg py-4 px-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                        placeholder="Enter customer name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-2 block w-full border-2 border-gray-300 dark:border-gray-600 rounded-xl shadow-lg py-4 px-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                        placeholder="Enter email address (optional)"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone Number * (max 10 digits)</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="mt-2 block w-full border-2 border-gray-300 dark:border-gray-600 rounded-xl shadow-lg py-4 px-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                        placeholder="Enter phone number"
                        maxLength={10}
                      />
                    </div>
                  </div>
                  <div className="mt-10 flex justify-end space-x-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-8 py-4 text-lg font-semibold text-gray-700 dark:text-gray-300 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center rounded-xl border-2 border-transparent bg-blue-600 dark:bg-blue-500 px-8 py-4 text-lg font-bold text-white shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
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
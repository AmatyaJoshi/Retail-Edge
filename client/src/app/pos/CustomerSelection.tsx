'use client';

import { useState, useEffect } from 'react';
import { type Customer } from '@/types';
import { useGetCustomersQuery } from '@/state/api';
import AddCustomerModal from './AddCustomerModal';
import { Search, Plus, X } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface CustomerSelectionProps {
  onCustomerSelect: (customer: Customer) => void;
  isOpen: boolean;
  onClose: () => void;
}

const CustomerSelection: React.FC<CustomerSelectionProps> = ({ onCustomerSelect, isOpen, onClose }) => {
  const { data: customers, isLoading, isError } = useGetCustomersQuery();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortOption, setSortOption] = useState('name-asc');

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') {
      return '?';
    }
    
    const names = name.trim().split(' ').filter(n => n.length > 0);
    
    if (names.length === 0) {
      return '?';
    }
    
    if (names.length === 1) {
      return names[0]?.charAt(0).toUpperCase() || '?';
    }
    
    const firstName = names[0]?.charAt(0).toUpperCase() || '?';
    const lastName = names[names.length - 1]?.charAt(0).toUpperCase() || '?';
    
    return firstName + lastName;
  };

  // Close AddCustomerModal if parent modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsModalOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (customers) {
      let sorted = [...customers];
      if (sortOption === 'name-asc') {
        sorted.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortOption === 'name-desc') {
        sorted.sort((a, b) => b.name.localeCompare(a.name));
      } else if (sortOption === 'joined-desc') {
        sorted.sort((a, b) => new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime());
      } else if (sortOption === 'joined-asc') {
        sorted.sort((a, b) => new Date(a.joinedDate).getTime() - new Date(b.joinedDate).getTime());
      }
      setFilteredCustomers(sorted.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery)
      ));
    }
  }, [searchQuery, customers, sortOption]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 bg-white rounded-lg shadow-xl">
        <p className="text-lg text-gray-600">Loading customers...</p>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="flex items-center justify-center p-6 bg-red-50 rounded-lg shadow-xl border border-red-200">
        <p className="text-lg text-red-600">Error loading customers.</p>
      </div>
    );
  }
  
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
              <Dialog.Panel className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-600 p-8 w-full max-w-4xl mx-auto h-[90vh] max-h-[800px] min-h-[600px] flex flex-col transform transition-all duration-300 ease-in-out">
                <div className="flex justify-between items-center mb-6 border-b-2 border-gray-200 dark:border-gray-700 pb-4 flex-shrink-0">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Select Customer</h2>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                    onClick={onClose}
                  >
                    <X className="h-7 w-7" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 flex-shrink-0">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search customers by name, email, or phone..."
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-base transition-all duration-200"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <label htmlFor="sort" className="text-gray-700 dark:text-gray-300 text-sm font-semibold">Sort by:</label>
                    <select
                      id="sort"
                      className="border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
                      value={sortOption}
                      onChange={e => setSortOption(e.target.value)}
                    >
                      <option value="name-asc">Name (A-Z)</option>
                      <option value="name-desc">Name (Z-A)</option>
                      <option value="joined-desc">Newest</option>
                      <option value="joined-asc">Oldest</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex-1 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-inner bg-gray-50 dark:bg-gray-700 custom-scrollbar overflow-hidden flex flex-col min-h-0">
                  {
                    filteredCustomers.length > 0 ? (
                      <div className="flex-1 overflow-y-auto">
                        <ul className="divide-y divide-gray-200 dark:divide-gray-600 p-3">
                          {filteredCustomers.map(customer => (
                            <li 
                              key={customer.customerId}
                              className="p-5 hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer transition-all duration-200 flex items-center gap-4 rounded-xl bg-white dark:bg-gray-800 shadow-lg mb-3 border-2 border-gray-100 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500"
                              onClick={() => {
                                onCustomerSelect(customer);
                                onClose();
                              }}
                            >
                              <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-lg flex-shrink-0 shadow-md">
                                {getInitials(customer.name)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 dark:text-gray-100 text-xl truncate">{customer.name}</p>
                                <p className="text-base text-gray-600 dark:text-gray-400 truncate">
                                  {customer.email}
                                  {customer.email && customer.phone ? ' - ' : ''}
                                  {customer.phone}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-500 dark:text-gray-400">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 dark:bg-gray-600">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <p className="font-medium text-lg">No customers found</p>
                        <p className="text-sm">Try adding a new customer or adjusting your search</p>
                      </div>
                    )
                  }
                </div>
                
                <div className="mt-6 flex justify-end flex-shrink-0">
        <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-3 px-6 py-4 bg-blue-600 dark:bg-blue-500 text-white rounded-xl shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 font-semibold"
        >
                    <Plus className="w-5 h-5" />
                    <span>Add New Customer</span>
        </button>
                </div>

                <AddCustomerModal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  onCustomerAdded={(customer) => {
                    onCustomerSelect(customer);
                    setIsModalOpen(false);
                    onClose();
                  }}
                />
              </Dialog.Panel>
            </Transition.Child>
      </div>
    </div>
      </Dialog>
    </Transition>
  );
};

export default CustomerSelection;
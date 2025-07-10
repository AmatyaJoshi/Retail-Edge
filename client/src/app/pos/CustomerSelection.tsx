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
              <Dialog.Panel className="bg-white rounded-xl shadow-md border border-gray-100 p-10 w-full max-w-4xl mx-auto transform transition-all duration-300 ease-in-out">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Select Customer</h2>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600"
                    onClick={onClose}
                  >
                    <X className="h-6 w-6" aria-hidden="true" />
                  </button>
      </div>
      
                <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search customers..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-md bg-white"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="sort" className="text-gray-700 text-sm font-medium">Sort by:</label>
                    <select
                      id="sort"
                      className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow bg-white"
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
                
                <div className="max-h-80 overflow-y-auto border border-gray-100 rounded-xl shadow-inner bg-white">
                  {
                    filteredCustomers.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {filteredCustomers.map(customer => (
              <li 
                            key={customer.customerId}
                            className="p-4 hover:bg-blue-50 cursor-pointer transition-colors flex items-center gap-4 rounded-xl bg-white shadow-md m-2 border border-gray-100"
                            onClick={() => {
                              onCustomerSelect(customer);
                              onClose();
                            }}
              >
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl flex-shrink-0">
                              {customer.name.charAt(0).toUpperCase()}
                            </div>
                  <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-lg truncate">{customer.name}</p>
                              <p className="text-base text-gray-600 truncate">
                                {customer.email}
                                {customer.email && customer.phone ? ' - ' : ''}
                                {customer.phone}
                              </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
                      <p className="p-4 text-gray-500 text-center">No customers found. Try adding a new one!</p>
                    )
                  }
      </div>
      
                <div className="mt-6 flex justify-end">
        <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        >
                    <Plus className="w-5 h-5" />
                    <span>Add New</span>
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
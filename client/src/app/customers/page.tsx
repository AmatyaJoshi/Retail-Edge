"use client";

import { useGetCustomersQuery, useDeleteCustomerMutation } from "@/state/api";
import Header from "@/app/(components)/Header";
import { SearchIcon, PlusCircleIcon, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import CustomerModal from "./CustomerModal";
import { toast } from "react-hot-toast";

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState("name-asc"); // sort state
  const itemsPerPage = 12;

  const { data: customers, isError, isLoading } = useGetCustomersQuery();
  const [deleteCustomer] = useDeleteCustomerMutation();

  // Sort customers before pagination
  const sortedCustomers = customers ? [...customers].sort((a, b) => {
    if (sortOption === "name-asc") {
      return a.name.localeCompare(b.name);
    } else if (sortOption === "name-desc") {
      return b.name.localeCompare(a.name);
    } else if (sortOption === "joined-asc") {
      return new Date(a.joinedDate).getTime() - new Date(b.joinedDate).getTime();
    } else if (sortOption === "joined-desc") {
      return new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime();
    }
    return 0;
  }) : [];
  // Calculate pagination
  const totalPages = sortedCustomers ? Math.ceil(sortedCustomers.length / itemsPerPage) : 0;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = sortedCustomers?.slice(startIndex, endIndex);

  console.log("Current Customers IDs:", currentCustomers?.map(c => c.customerId));

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleDeleteClick = async (customerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomerToDelete(customerId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (customerToDelete) {
    try {
        await deleteCustomer(customerToDelete).unwrap();
        toast.success('Customer deleted successfully');
      setShowDeleteConfirm(false);
        setCustomerToDelete(null);
    } catch (error) {
        toast.error('Failed to delete customer');
      }
    }
  };

  if (isLoading) {
    return <div className="py-4">Loading...</div>;
  }

  if (isError || !customers) {
    return (
      <div className="text-center text-red-500 py-4">Failed to fetch customers</div>
    );
  }

  return (
    <div className="mx-auto pb-5 w-full">
      {/* SEARCH BAR & SORT FILTER */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center border-2 border-gray-200 rounded w-full md:w-auto flex-1">
          <SearchIcon className="w-5 h-5 text-gray-500 m-2" />
          <input
            className="w-full py-2 px-4 rounded bg-white"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {/* Sort Filter Dropdown aligned right */}
        <div className="flex items-center gap-2 justify-end w-full md:w-auto">
          <label htmlFor="sort" className="text-sm text-gray-700 font-medium mr-2">Sort by:</label>
          <select
            id="sort"
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={sortOption}
            onChange={e => setSortOption(e.target.value)}
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="joined-desc">Joined (Newest)</option>
            <option value="joined-asc">Joined (Oldest)</option>
          </select>
        </div>
      </div>

      {/* HEADER BAR */}
      <div className="flex justify-between items-center mb-6">
        <Header name="Customers" />
        <div className="flex space-x-3">
          <button
            className="flex items-center bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="w-5 h-5 mr-2" /> Delete Customer
          </button>
          <button
            className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
            onClick={() => {}}
          >
            <PlusCircleIcon className="w-5 h-5 mr-2" /> Add Customer
          </button>
        </div>
      </div>

      {/* Customers Container with Background */}
      <div className="bg-gray-50 rounded-lg p-4">
        {/* Scrollable Customers Grid */}
        <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentCustomers?.map((customer) => (
              <div
                key={customer.customerId}
                className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group relative"
              >
                <div className="p-6">
                  <div className="flex flex-col items-center">
                    <div className="relative w-24 h-24 mb-4">
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-200">
                        <span className="text-3xl font-semibold text-blue-600">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 text-center mb-1">
                      {customer.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {customer.email}
                    </p>
                    <div className="space-y-2 w-full">
                      <div className="flex items-center justify-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {customer.phone}
                      </div>
                      <div className="text-xs font-mono text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                        {customer.customerId}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleDeleteClick(customer.customerId, e)}
                    className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition-colors"
                    title="Delete Customer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div
                  className="absolute inset-0 cursor-pointer"
                  onClick={() => setSelectedCustomer(customer)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded-lg ${
                    currentPage === page
                      ? "bg-blue-500 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Customer Modal */}
      <CustomerModal
        user={selectedCustomer}
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onDelete={handleDeleteConfirm}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Delete Customer</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this customer? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setCustomerToDelete(null);
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
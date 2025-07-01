import { X, Phone, Mail, Calendar, Star, RefreshCw, AlertCircle, Eye, Receipt, Trash2, Edit2, Search, ArrowUpDown, Filter } from 'lucide-react';
import { useGetCustomerSalesQuery, Sale, useGetPrescriptionsByCustomerQuery } from '@/state/api';
import { useState, Fragment, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import PrescriptionModal from './PrescriptionModal';

interface EyeData {
  sphere: number;
  cylinder: number;
  axis: number;
  add: number;
  pd: number;
}

interface Prescription {
  id: string;
  date: string;
  expiryDate: string;
  rightEye: EyeData;
  leftEye: EyeData;
  doctor: string;
  notes?: string;
}

interface CustomerModalProps {
  user: {
    customerId: string;
    name: string;
    email: string;
    phone: string;
    joinedDate: string;
    prescription?: {
      rightEye: {
        sphere: number;
        cylinder: number;
        axis: number;
        add: number;
        pd: number;
      };
      leftEye: {
        sphere: number;
        cylinder: number;
        axis: number;
        add: number;
        pd: number;
      };
      doctor: string;
      expiryDate: string;
      notes?: string;
    };
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (customerId: string) => Promise<void>;
  onUpdate?: (customerId: string, data: any) => Promise<void>;
}

const EyewearIcon = () => (
  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="40" r="12" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="48" cy="40" r="12" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M4 40c0-6 4-12 12-12m32 0c8 0 12 6 12 12" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M28 40h8" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

const CustomerModal = ({ user, isOpen, onClose, onDelete, onUpdate }: CustomerModalProps) => {
  const { data: sales, isLoading: isLoadingSales } = useGetCustomerSalesQuery(user?.customerId || '', {
    skip: !user?.customerId
  });
  const { data: prescriptions, isLoading: isLoadingPrescriptions } = useGetPrescriptionsByCustomerQuery(user?.customerId || '', {
    skip: !user?.customerId
  });

  // State for sales filtering and sorting
  const [salesSearchTerm, setSalesSearchTerm] = useState('');
  const [salesSortField, setSalesSortField] = useState<keyof Sale>('timestamp');
  const [salesSortDirection, setSalesSortDirection] = useState<'asc' | 'desc'>('desc');
  const [salesDateFilter, setSalesDateFilter] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });

  // State for prescriptions filtering and sorting
  const [prescriptionsSearchTerm, setPrescriptionsSearchTerm] = useState('');
  const [prescriptionsSortField, setPrescriptionsSortField] = useState<keyof Prescription>('date');
  const [prescriptionsSortDirection, setPrescriptionsSortDirection] = useState<'asc' | 'desc'>('desc');
  const [prescriptionsDateFilter, setPrescriptionsDateFilter] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });

  // Filtered and sorted sales
  const filteredSales = useMemo(() => {
    if (!sales) return [];
    
    let filtered = [...sales];

    // Apply search filter
    if (salesSearchTerm) {
      filtered = filtered.filter(sale => 
        sale.productId.toLowerCase().includes(salesSearchTerm.toLowerCase()) ||
        sale.saleId.toLowerCase().includes(salesSearchTerm.toLowerCase())
      );
    }

    // Apply date filter
    if (salesDateFilter.start) {
      filtered = filtered.filter(sale => 
        new Date(sale.timestamp).getTime() >= new Date(salesDateFilter.start).getTime()
      );
    }
    if (salesDateFilter.end) {
      filtered = filtered.filter(sale => 
        new Date(sale.timestamp).getTime() <= new Date(salesDateFilter.end).getTime()
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[salesSortField];
      const bValue = b[salesSortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return salesSortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return salesSortDirection === 'asc' 
          ? aValue - bValue
          : bValue - aValue;
      }
      
      if (salesSortField === 'timestamp') {
        const aDate = new Date(aValue as string).getTime();
        const bDate = new Date(bValue as string).getTime();
        return salesSortDirection === 'asc'
          ? aDate - bDate
          : bDate - aDate;
      }
      
      return 0;
    });

    return filtered;
  }, [sales, salesSearchTerm, salesSortField, salesSortDirection, salesDateFilter]);

  // Filtered and sorted prescriptions
  const filteredPrescriptions = useMemo(() => {
    if (!prescriptions) return [];
    
    let filtered = [...prescriptions];

    // Apply search filter
    if (prescriptionsSearchTerm) {
      filtered = filtered.filter(prescription => 
        prescription.doctor.toLowerCase().includes(prescriptionsSearchTerm.toLowerCase()) ||
        prescription.id.toLowerCase().includes(prescriptionsSearchTerm.toLowerCase())
      );
    }

    // Apply date filter
    if (prescriptionsDateFilter.start) {
      filtered = filtered.filter(prescription => 
        new Date(prescription.date).getTime() >= new Date(prescriptionsDateFilter.start).getTime()
      );
    }
    if (prescriptionsDateFilter.end) {
      filtered = filtered.filter(prescription => 
        new Date(prescription.date).getTime() <= new Date(prescriptionsDateFilter.end).getTime()
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[prescriptionsSortField];
      const bValue = b[prescriptionsSortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return prescriptionsSortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (prescriptionsSortField === 'date' || prescriptionsSortField === 'expiryDate') {
        const aDate = new Date(aValue as string).getTime();
        const bDate = new Date(bValue as string).getTime();
        return prescriptionsSortDirection === 'asc'
          ? aDate - bDate
          : bDate - aDate;
      }
      
      return 0;
    });

    return filtered;
  }, [prescriptions, prescriptionsSearchTerm, prescriptionsSortField, prescriptionsSortDirection, prescriptionsDateFilter]);

  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState(user);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);

  if (!isOpen || !user) return null;

  const handleDelete = async () => {
    if (!onDelete) return;
    try {
      await onDelete(user.customerId);
      toast.success('Customer deleted successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to delete customer');
    }
  };

  const handleUpdate = async () => {
    if (!onUpdate || !editedCustomer) return;
    try {
      await onUpdate(user.customerId, editedCustomer);
      toast.success('Customer updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update customer');
    }
  };

  return (
    <>
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
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white/90 backdrop-blur-xl p-8 shadow-2xl transition-all border border-white/20">
                  {/* Header */}
                  <div className="border-b border-gray-100/50 flex justify-between items-center bg-gradient-to-r from-blue-50/50 to-indigo-50/50 -mx-8 -mt-8 px-8 pt-8 pb-6">
                    <h2 className="text-3xl font-semibold text-gray-900">Customer Details</h2>
                    <div className="flex items-center space-x-3">
                      {!isEditing && (
                        <>
                          <button
                            onClick={() => setIsEditing(true)}
                            className="p-2.5 hover:bg-white/50 rounded-full transition-colors text-blue-600 hover:shadow-md"
                            title="Edit Customer"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="p-2.5 hover:bg-white/50 rounded-full transition-colors text-red-600 hover:shadow-md"
                            title="Delete Customer"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={onClose}
                        className="p-2.5 hover:bg-white/50 rounded-full transition-colors hover:shadow-md"
                      >
                        <X className="w-6 h-6 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
                    {/* Basic Info Section */}
                    <div className="p-8 border-b border-gray-100/50">
                      <h3 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h3>
                      {isEditing ? (
                        <div className="space-y-6 max-w-2xl">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                            <input
                              type="text"
                              value={editedCustomer?.name || ''}
                              onChange={(e) => setEditedCustomer(prev => prev ? { ...prev, name: e.target.value } : null)}
                              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                              type="email"
                              value={editedCustomer?.email || ''}
                              onChange={(e) => setEditedCustomer(prev => prev ? { ...prev, email: e.target.value } : null)}
                              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                            <input
                              type="tel"
                              value={editedCustomer?.phone || ''}
                              onChange={(e) => setEditedCustomer(prev => prev ? { ...prev, phone: e.target.value } : null)}
                              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
                            />
                          </div>
                          <div className="flex justify-end space-x-4 mt-6">
                            <button
                              onClick={() => {
                                setIsEditing(false);
                                setEditedCustomer(user);
                              }}
                              className="px-6 py-3 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors hover:shadow-md"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleUpdate}
                              className="px-6 py-3 text-white bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors hover:shadow-md"
                            >
                              Save Changes
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-md">
                              <span className="text-2xl font-semibold text-blue-600">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-xl font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-500">Customer ID: {user.customerId}</p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center text-gray-600 p-3 bg-white/50 rounded-xl">
                              <Mail className="w-5 h-5 mr-3 text-blue-500" />
                              <span className="text-lg">{user.email}</span>
                            </div>
                            <div className="flex items-center text-gray-600 p-3 bg-white/50 rounded-xl">
                              <Phone className="w-5 h-5 mr-3 text-blue-500" />
                              <span className="text-lg">{user.phone}</span>
                            </div>
                            <div className="flex items-center text-gray-600 p-3 bg-white/50 rounded-xl">
                              <Calendar className="w-5 h-5 mr-3 text-blue-500" />
                              <span className="text-lg">Joined {new Date(user.joinedDate).toLocaleDateString('en-GB')}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Sales History Section */}
                    <div className="p-8 border-b border-gray-100/50">
                      <h3 className="text-xl font-semibold text-gray-900 mb-6">Sales History</h3>
                      {isLoadingSales ? (
                        <p className="text-gray-500">Loading sales history...</p>
                      ) : sales && sales.length > 0 ? (
                        <>
                          <div className="mb-6 space-y-4">
                            <div className="flex items-center space-x-4">
                              <div className="flex-1">
                                <div className="relative">
                                  <input
                                    type="text"
                                    placeholder="Search sales..."
                                    value={salesSearchTerm}
                                    onChange={(e) => setSalesSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                                  />
                                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="date"
                                  value={salesDateFilter.start}
                                  onChange={(e) => setSalesDateFilter(prev => ({ ...prev, start: e.target.value }))}
                                  className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                                />
                                <span className="text-gray-500">to</span>
                                <input
                                  type="date"
                                  value={salesDateFilter.end}
                                  onChange={(e) => setSalesDateFilter(prev => ({ ...prev, end: e.target.value }))}
                                  className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="overflow-x-auto rounded-xl border border-gray-100/50 max-h-[400px] overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200/50">
                              <thead className="bg-gray-50/50 sticky top-0">
                                <tr>
                                  <th 
                                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50"
                                    onClick={() => {
                                      setSalesSortField('timestamp');
                                      setSalesSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                                    }}
                                  >
                                    <div className="flex items-center space-x-1">
                                      <span>Date</span>
                                      <ArrowUpDown className="w-4 h-4" />
                                    </div>
                                  </th>
                                  <th 
                                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50"
                                    onClick={() => {
                                      setSalesSortField('productId');
                                      setSalesSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                                    }}
                                  >
                                    <div className="flex items-center space-x-1">
                                      <span>Product ID</span>
                                      <ArrowUpDown className="w-4 h-4" />
                                    </div>
                                  </th>
                                  <th 
                                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50"
                                    onClick={() => {
                                      setSalesSortField('quantity');
                                      setSalesSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                                    }}
                                  >
                                    <div className="flex items-center space-x-1">
                                      <span>Quantity</span>
                                      <ArrowUpDown className="w-4 h-4" />
                                    </div>
                                  </th>
                                  <th 
                                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50"
                                    onClick={() => {
                                      setSalesSortField('unitPrice');
                                      setSalesSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                                    }}
                                  >
                                    <div className="flex items-center space-x-1">
                                      <span>Unit Price</span>
                                      <ArrowUpDown className="w-4 h-4" />
                                    </div>
                                  </th>
                                  <th 
                                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50"
                                    onClick={() => {
                                      setSalesSortField('totalAmount');
                                      setSalesSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                                    }}
                                  >
                                    <div className="flex items-center space-x-1">
                                      <span>Total Amount</span>
                                      <ArrowUpDown className="w-4 h-4" />
                                    </div>
                                  </th>
                                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                                </tr>
                              </thead>
                              <tbody className="bg-white/50 divide-y divide-gray-200/50">
                                {filteredSales.map((sale) => (
                                  <tr key={sale.saleId} className="hover:bg-white/80 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {new Date(sale.timestamp).toLocaleDateString('en-GB')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.productId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.quantity}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{sale.unitPrice.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{sale.totalAmount.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      <button
                                        onClick={() => setSelectedSale(sale)}
                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                      >
                                        View Details
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </>
                      ) : (
                        <p className="text-gray-500">No sales history available.</p>
                      )}
                    </div>

                    {/* Prescription History Section */}
                    <div className="p-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-6">Prescription History</h3>
                      {isLoadingPrescriptions ? (
                        <p className="text-gray-500">Loading prescription history...</p>
                      ) : prescriptions && prescriptions.length > 0 ? (
                        <>
                          <div className="mb-6 space-y-4">
                            <div className="flex items-center space-x-4">
                              <div className="flex-1">
                                <div className="relative">
                                  <input
                                    type="text"
                                    placeholder="Search prescriptions..."
                                    value={prescriptionsSearchTerm}
                                    onChange={(e) => setPrescriptionsSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                                  />
                                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="date"
                                  value={prescriptionsDateFilter.start}
                                  onChange={(e) => setPrescriptionsDateFilter(prev => ({ ...prev, start: e.target.value }))}
                                  className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                                />
                                <span className="text-gray-500">to</span>
                                <input
                                  type="date"
                                  value={prescriptionsDateFilter.end}
                                  onChange={(e) => setPrescriptionsDateFilter(prev => ({ ...prev, end: e.target.value }))}
                                  className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[500px] overflow-y-auto pr-2">
                            {filteredPrescriptions.map((prescription) => (
                              <div key={prescription.id} className="bg-white/50 backdrop-blur-sm border border-gray-100/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative">
                                <div className="flex items-center space-x-4 mb-4">
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                                    <EyewearIcon />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900">Prescription from {new Date(prescription.date).toLocaleDateString('en-GB')}</p>
                                    <p className="text-sm text-gray-600">Expires: {new Date(prescription.expiryDate).toLocaleDateString('en-GB')}</p>
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  <p className="text-gray-700"><strong>Doctor:</strong> {prescription.doctor}</p>
                                  <p className="text-gray-700"><strong>Right Eye:</strong> Sph {prescription.rightEye.sphere}, Cyl {prescription.rightEye.cylinder}, Axis {prescription.rightEye.axis}, Add {prescription.rightEye.add}, PD {prescription.rightEye.pd}</p>
                                  <p className="text-gray-700"><strong>Left Eye:</strong> Sph {prescription.leftEye.sphere}, Cyl {prescription.leftEye.cylinder}, Axis {prescription.leftEye.axis}, Add {prescription.leftEye.add}, PD {prescription.leftEye.pd}</p>
                                  {prescription.notes && <p className="text-gray-700"><strong>Notes:</strong> {prescription.notes}</p>}
                                </div>
                                <div className="absolute top-4 right-4">
                                  <button
                                    onClick={() => {
                                      setSelectedPrescription(prescription);
                                      setShowPrescriptionModal(true);
                                    }}
                                    className="p-2 rounded-full hover:bg-white/80 transition-colors"
                                    title="View Details"
                                  >
                                    <Eye className="w-5 h-5 text-blue-500" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <p className="text-gray-500">No prescription history available.</p>
                      )}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      {selectedPrescription && (
        <PrescriptionModal
          isOpen={showPrescriptionModal}
          onClose={() => setShowPrescriptionModal(false)}
          prescription={selectedPrescription}
        />
      )}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this customer? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerModal; 
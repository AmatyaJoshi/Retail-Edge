'use client';

import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X } from 'lucide-react';
import type { EyePrescription, Prescription } from '@/types/prescriptions';

interface PrescriptionFormProps {
  existingPrescription?: Prescription | undefined;
  customerId: string;
  onSave: (prescription: Prescription) => void;
  onCancel: () => void;
  isOpen: boolean;
}

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getExpiryDate = (): string => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1); // Add 1 year
  return formatDate(date);
};

export default function PrescriptionForm({
  existingPrescription,
  customerId,
  onSave,
  onCancel,
  isOpen
}: PrescriptionFormProps) {
  const [prescription, setPrescription] = useState<Prescription>(() => {
    if (existingPrescription) {
      return existingPrescription;
    }
    
    return {
      id: `rx-${Date.now()}`,
      customerId,
      date: formatDate(new Date()),
      expiryDate: getExpiryDate(),
      rightEye: {
        sphere: 0,
        cylinder: 0,
        axis: 0,
        add: 0,
        pd: 0
      },
      leftEye: {
        sphere: 0,
        cylinder: 0,
        axis: 0,
        add: 0,
        pd: 0
      },
      doctor: '',
      notes: ''
    };
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPrescription(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEyeChange = (eye: 'rightEye' | 'leftEye', field: keyof EyePrescription, value: string) => {
    setPrescription(prev => ({
      ...prev,
      [eye]: {
        ...prev[eye],
        [field]: value === '' ? undefined : Number(value)
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!prescription.date || !prescription.expiryDate || !prescription.doctor) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate sphere values
    if (typeof prescription.rightEye.sphere !== 'number' || typeof prescription.leftEye.sphere !== 'number') {
      alert('Please enter sphere values for both eyes');
      return;
    }

    onSave(prescription);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onCancel}>
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
              <Dialog.Panel className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-600 p-8 w-full max-w-4xl mx-auto h-[85vh] max-h-[800px] min-h-[600px] flex flex-col transform transition-all duration-300 ease-in-out overflow-hidden">
                <div className="flex justify-between items-center mb-6 border-b-2 border-gray-200 dark:border-gray-700 pb-4 flex-shrink-0">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {existingPrescription ? 'Edit Prescription' : 'Add Prescription'}
                  </h2>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                    onClick={onCancel}
                  >
                    <X className="h-7 w-7" aria-hidden="true" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Date
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={prescription.date}
                          onChange={handleChange}
                          className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="date"
                          name="expiryDate"
                          value={prescription.expiryDate}
                          onChange={handleChange}
                          className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Doctor's Name
                      </label>
                      <input
                        type="text"
                        name="doctor"
                        value={prescription.doctor}
                        onChange={handleChange}
                        className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
                        placeholder="Enter doctor's name"
                        required
                      />
                    </div>
                    
                    {/* Right Eye */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-lg">
                      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Right Eye (OD)</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Sphere
                          </label>
                          <input
                            type="number"
                            step="0.25"
                            value={prescription.rightEye.sphere}
                            onChange={(e) => handleEyeChange('rightEye', 'sphere', e.target.value)}
                            className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Cylinder
                          </label>
                          <input
                            type="number"
                            step="0.25"
                            value={prescription.rightEye.cylinder ?? ''}
                            onChange={(e) => handleEyeChange('rightEye', 'cylinder', e.target.value)}
                            className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Axis
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="180"
                            value={prescription.rightEye.axis ?? ''}
                            onChange={(e) => handleEyeChange('rightEye', 'axis', e.target.value)}
                            className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Add
                          </label>
                          <input
                            type="number"
                            step="0.25"
                            value={prescription.rightEye.add ?? ''}
                            onChange={(e) => handleEyeChange('rightEye', 'add', e.target.value)}
                            className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            PD
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            value={prescription.rightEye.pd ?? ''}
                            onChange={(e) => handleEyeChange('rightEye', 'pd', e.target.value)}
                            className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Left Eye */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-lg">
                      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Left Eye (OS)</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Sphere
                          </label>
                          <input
                            type="number"
                            step="0.25"
                            value={prescription.leftEye.sphere}
                            onChange={(e) => handleEyeChange('leftEye', 'sphere', e.target.value)}
                            className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Cylinder
                          </label>
                          <input
                            type="number"
                            step="0.25"
                            value={prescription.leftEye.cylinder ?? ''}
                            onChange={(e) => handleEyeChange('leftEye', 'cylinder', e.target.value)}
                            className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Axis
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="180"
                            value={prescription.leftEye.axis ?? ''}
                            onChange={(e) => handleEyeChange('leftEye', 'axis', e.target.value)}
                            className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Add
                          </label>
                          <input
                            type="number"
                            step="0.25"
                            value={prescription.leftEye.add ?? ''}
                            onChange={(e) => handleEyeChange('leftEye', 'add', e.target.value)}
                            className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            PD
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            value={prescription.leftEye.pd ?? ''}
                            onChange={(e) => handleEyeChange('leftEye', 'pd', e.target.value)}
                            className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notes
                      </label>
                      <textarea
                        name="notes"
                        value={prescription.notes}
                        onChange={handleChange}
                        className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200 resize-none"
                        rows={3}
                        placeholder="Add any additional notes about the prescription"
                      ></textarea>
                    </div>
                  </form>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3 flex-shrink-0 border-t-2 border-gray-200 dark:border-gray-700 pt-4">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 font-semibold transition-all duration-200 shadow-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    className="px-6 py-3 rounded-xl bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 font-semibold transition-all duration-200 shadow-lg"
                  >
                    Save Prescription
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
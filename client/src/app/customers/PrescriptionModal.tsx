import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X } from 'lucide-react';

import type { Prescription } from '../types/prescriptions';

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescription: Prescription;
}

const PrescriptionModal = ({ isOpen, onClose, prescription }: PrescriptionModalProps) => {
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white/95 backdrop-blur-md p-8 shadow-xl transition-all">
                <div className="flex justify-between items-center mb-8">
                  <Dialog.Title as="h3" className="text-2xl font-semibold text-gray-900">
                    Prescription Details
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-7 h-7 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-8">
                  {/* Header Info */}
                  <div className="bg-gray-50/80 rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xl font-medium text-gray-900">Dr. {prescription.doctor}</p>
                        <p className="text-base text-gray-500 mt-1">
                          Date: {new Date(prescription.date).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-base font-medium ${
                          new Date(prescription.expiryDate) < new Date()
                            ? 'text-red-500'
                            : 'text-green-500'
                        }`}>
                          {new Date(prescription.expiryDate) < new Date() ? 'Expired' : 'Valid'}
                        </p>
                        <p className="text-base text-gray-500 mt-1">
                          Expires: {new Date(prescription.expiryDate).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Eye Measurements */}
                  <div className="grid grid-cols-2 gap-8">
                    {/* Right Eye */}
                    <div className="bg-gray-50/80 rounded-lg p-6">
                      <h4 className="text-xl font-medium text-gray-900 mb-4">Right Eye</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600 text-lg">Sphere:</span>
                          <span className="font-medium text-lg">{prescription.rightEye.sphere}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 text-lg">Cylinder:</span>
                          <span className="font-medium text-lg">{prescription.rightEye.cylinder}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 text-lg">Axis:</span>
                          <span className="font-medium text-lg">{prescription.rightEye.axis}°</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 text-lg">Add:</span>
                          <span className="font-medium text-lg">{prescription.rightEye.add}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 text-lg">PD:</span>
                          <span className="font-medium text-lg">{prescription.rightEye.pd}mm</span>
                        </div>
                      </div>
                    </div>

                    {/* Left Eye */}
                    <div className="bg-gray-50/80 rounded-lg p-6">
                      <h4 className="text-xl font-medium text-gray-900 mb-4">Left Eye</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600 text-lg">Sphere:</span>
                          <span className="font-medium text-lg">{prescription.leftEye.sphere}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 text-lg">Cylinder:</span>
                          <span className="font-medium text-lg">{prescription.leftEye.cylinder}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 text-lg">Axis:</span>
                          <span className="font-medium text-lg">{prescription.leftEye.axis}°</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 text-lg">Add:</span>
                          <span className="font-medium text-lg">{prescription.leftEye.add}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 text-lg">PD:</span>
                          <span className="font-medium text-lg">{prescription.leftEye.pd}mm</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {prescription.notes && (
                    <div className="bg-gray-50/80 rounded-lg p-6">
                      <h4 className="text-xl font-medium text-gray-900 mb-3">Notes</h4>
                      <p className="text-lg text-gray-600">{prescription.notes}</p>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={onClose}
                    className="px-6 py-3 text-lg text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default PrescriptionModal; 
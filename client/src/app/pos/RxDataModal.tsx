import type { Prescription } from '@/types/prescriptions';
import { useAppSelector } from "@/state/hooks";

interface RxDataModalProps {
  prescription: Prescription;
  onClose: () => void;
  onUpdate: () => void;
}

export default function RxDataModal({ prescription, onClose, onUpdate }: RxDataModalProps) {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const isExpired = new Date(prescription.expiryDate) < new Date();
  const isExpiringSoon = !isExpired && 
    (new Date(prescription.expiryDate).getTime() - new Date().getTime()) < (30 * 24 * 60 * 60 * 1000); // 30 days

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={
        `${isDarkMode ? "bg-gray-900 border border-gray-700 text-gray-100" : "bg-white border border-gray-200 text-gray-900"} rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto`
      }>
        <div className="flex justify-between items-center mb-4">
          <h2 className={
            `text-2xl font-bold ${isDarkMode ? "text-gray-100" : "text-gray-800"}`
          }>Prescription Details</h2>
          <button
            onClick={onClose}
            className={
              `${isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`
            }
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Prescription Status */}
        <div className={`mb-4 p-3 rounded ${
          isExpired ? (isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-50 text-red-700') : 
          isExpiringSoon ? (isDarkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-50 text-yellow-700') : 
          (isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-50 text-green-700')
        }`}>
          <p className="font-medium">
            {isExpired ? '\u26a0\ufe0f Prescription Expired' : 
             isExpiringSoon ? '\u26a0\ufe0f Prescription Expiring Soon' : 
             '\u2713 Valid Prescription'}
          </p>
          <p className="text-sm mt-1">
            Expiry Date: {new Date(prescription.expiryDate).toLocaleDateString('en-GB')}
          </p>
        </div>

        {/* Prescription Date */}
        <div className="mb-4">
          <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
            Prescribed on: {new Date(prescription.date).toLocaleDateString('en-GB')}
          </p>
        </div>

        {/* Eye Measurements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Right Eye */}
          <div className={
            `${isDarkMode ? "bg-gray-800" : "bg-gray-50"} p-4 rounded-lg`
          }>
            <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? "text-blue-300" : "text-blue-600"}`}>Right Eye</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>Sphere:</span>
                <span className="font-medium">{prescription.rightEye.sphere}</span>
              </div>
              <div className="flex justify-between">
                <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>Cylinder:</span>
                <span className="font-medium">{prescription.rightEye.cylinder}</span>
              </div>
              <div className="flex justify-between">
                <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>Axis:</span>
                <span className="font-medium">{prescription.rightEye.axis}\u00b0</span>
              </div>
              <div className="flex justify-between">
                <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>Add:</span>
                <span className="font-medium">{prescription.rightEye.add}</span>
              </div>
              <div className="flex justify-between">
                <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>PD:</span>
                <span className="font-medium">{prescription.rightEye.pd}mm</span>
              </div>
            </div>
          </div>

          {/* Left Eye */}
          <div className={
            `${isDarkMode ? "bg-gray-800" : "bg-gray-50"} p-4 rounded-lg`
          }>
            <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? "text-blue-300" : "text-blue-600"}`}>Left Eye</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>Sphere:</span>
                <span className="font-medium">{prescription.leftEye.sphere}</span>
              </div>
              <div className="flex justify-between">
                <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>Cylinder:</span>
                <span className="font-medium">{prescription.leftEye.cylinder}</span>
              </div>
              <div className="flex justify-between">
                <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>Axis:</span>
                <span className="font-medium">{prescription.leftEye.axis}\u00b0</span>
              </div>
              <div className="flex justify-between">
                <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>Add:</span>
                <span className="font-medium">{prescription.leftEye.add}</span>
              </div>
              <div className="flex justify-between">
                <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>PD:</span>
                <span className="font-medium">{prescription.leftEye.pd}mm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className={
          `${isDarkMode ? "bg-gray-800" : "bg-gray-50"} p-4 rounded-lg mb-6`
        }>
          <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? "text-blue-300" : "text-blue-600"}`}>Additional Information</h3>
          <div className="space-y-2">
            <div>
              <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>Prescribing Doctor:</span>
              <p className="font-medium">{prescription.doctor}</p>
            </div>
            {prescription.notes && (
              <div>
                <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>Notes:</span>
                <p className="font-medium">{prescription.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className={
              `px-4 py-2 ${isDarkMode ? "text-gray-300 hover:text-gray-100" : "text-gray-600 hover:text-gray-800"}`
            }
          >
            Close
          </button>
          {(isExpired || isExpiringSoon) && (
            <button
              onClick={onUpdate}
              className={
                `px-4 py-2 rounded transition-colors ${isDarkMode ? "bg-blue-700 hover:bg-blue-800 text-gray-100" : "bg-blue-500 hover:bg-blue-600 text-white"}`
              }
            >
              Update Prescription
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 
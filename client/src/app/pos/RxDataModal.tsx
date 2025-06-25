import type { Prescription } from '../types/prescriptions';

interface RxDataModalProps {
  prescription: Prescription;
  onClose: () => void;
  onUpdate: () => void;
}

export default function RxDataModal({ prescription, onClose, onUpdate }: RxDataModalProps) {
  const isExpired = new Date(prescription.expiryDate) < new Date();
  const isExpiringSoon = !isExpired && 
    (new Date(prescription.expiryDate).getTime() - new Date().getTime()) < (30 * 24 * 60 * 60 * 1000); // 30 days

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Prescription Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Prescription Status */}
        <div className={`mb-4 p-3 rounded ${
          isExpired ? 'bg-red-50 text-red-700' : 
          isExpiringSoon ? 'bg-yellow-50 text-yellow-700' : 
          'bg-green-50 text-green-700'
        }`}>
          <p className="font-medium">
            {isExpired ? '⚠️ Prescription Expired' : 
             isExpiringSoon ? '⚠️ Prescription Expiring Soon' : 
             '✓ Valid Prescription'}
          </p>
          <p className="text-sm mt-1">
            Expiry Date: {new Date(prescription.expiryDate).toLocaleDateString()}
          </p>
        </div>

        {/* Prescription Date */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Prescribed on: {new Date(prescription.date).toLocaleDateString()}
          </p>
        </div>

        {/* Eye Measurements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Right Eye */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-600 mb-3">Right Eye</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Sphere:</span>
                <span className="font-medium">{prescription.rightEye.sphere}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cylinder:</span>
                <span className="font-medium">{prescription.rightEye.cylinder}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Axis:</span>
                <span className="font-medium">{prescription.rightEye.axis}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Add:</span>
                <span className="font-medium">{prescription.rightEye.add}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">PD:</span>
                <span className="font-medium">{prescription.rightEye.pd}mm</span>
              </div>
            </div>
          </div>

          {/* Left Eye */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-600 mb-3">Left Eye</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Sphere:</span>
                <span className="font-medium">{prescription.leftEye.sphere}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cylinder:</span>
                <span className="font-medium">{prescription.leftEye.cylinder}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Axis:</span>
                <span className="font-medium">{prescription.leftEye.axis}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Add:</span>
                <span className="font-medium">{prescription.leftEye.add}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">PD:</span>
                <span className="font-medium">{prescription.leftEye.pd}mm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-blue-600 mb-3">Additional Information</h3>
          <div className="space-y-2">
            <div>
              <span className="text-gray-600">Prescribing Doctor:</span>
              <p className="font-medium">{prescription.doctor}</p>
            </div>
            {prescription.notes && (
              <div>
                <span className="text-gray-600">Notes:</span>
                <p className="font-medium">{prescription.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Close
          </button>
          {(isExpired || isExpiringSoon) && (
            <button
              onClick={onUpdate}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Update Prescription
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 
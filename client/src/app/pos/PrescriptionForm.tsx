'use client';

import { useState } from 'react';
import { EyePrescription, Prescription } from '../types';

interface PrescriptionFormProps {
  existingPrescription?: Prescription;
  customerId: string;
  onSave: (prescription: Prescription) => void;
  onCancel: () => void;
}

export default function PrescriptionForm({
  existingPrescription,
  customerId,
  onSave,
  onCancel
}: PrescriptionFormProps) {
  const [prescription, setPrescription] = useState<Prescription>(
    existingPrescription || {
      id: `rx-${Date.now()}`,
      customerId,
      date: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      rightEye: { sphere: 0 },
      leftEye: { sphere: 0 },
      doctor: '',
      notes: ''
    }
  );

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
    onSave(prescription);
  };

  return (
    <div className="bg-white p-6 rounded shadow-lg max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Eye Prescription</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={prescription.date}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date
            </label>
            <input
              type="date"
              name="expiryDate"
              value={prescription.expiryDate}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Doctor's Name
          </label>
          <input
            type="text"
            name="doctor"
            value={prescription.doctor}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        {/* Right Eye */}
        <div className="mb-6">
          <h3 className="font-bold mb-2">Right Eye (OD)</h3>
          <div className="grid grid-cols-5 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sphere
              </label>
              <input
                type="number"
                step="0.25"
                value={prescription.rightEye.sphere}
                onChange={(e) => handleEyeChange('rightEye', 'sphere', e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cylinder
              </label>
              <input
                type="number"
                step="0.25"
                value={prescription.rightEye.cylinder ?? ''}
                onChange={(e) => handleEyeChange('rightEye', 'cylinder', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Axis
              </label>
              <input
                type="number"
                min="0"
                max="180"
                value={prescription.rightEye.axis ?? ''}
                onChange={(e) => handleEyeChange('rightEye', 'axis', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add
              </label>
              <input
                type="number"
                step="0.25"
                value={prescription.rightEye.add ?? ''}
                onChange={(e) => handleEyeChange('rightEye', 'add', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PD
              </label>
              <input
                type="number"
                step="0.5"
                value={prescription.rightEye.pd ?? ''}
                onChange={(e) => handleEyeChange('rightEye', 'pd', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>
        
        {/* Left Eye */}
        <div className="mb-6">
          <h3 className="font-bold mb-2">Left Eye (OS)</h3>
          <div className="grid grid-cols-5 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sphere
              </label>
              <input
                type="number"
                step="0.25"
                value={prescription.leftEye.sphere}
                onChange={(e) => handleEyeChange('leftEye', 'sphere', e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cylinder
              </label>
              <input
                type="number"
                step="0.25"
                value={prescription.leftEye.cylinder ?? ''}
                onChange={(e) => handleEyeChange('leftEye', 'cylinder', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Axis
              </label>
              <input
                type="number"
                min="0"
                max="180"
                value={prescription.leftEye.axis ?? ''}
                onChange={(e) => handleEyeChange('leftEye', 'axis', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add
              </label>
              <input
                type="number"
                step="0.25"
                value={prescription.leftEye.add ?? ''}
                onChange={(e) => handleEyeChange('leftEye', 'add', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PD
              </label>
              <input
                type="number"
                step="0.5"
                value={prescription.leftEye.pd ?? ''}
                onChange={(e) => handleEyeChange('leftEye', 'pd', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={prescription.notes || ''}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows={3}
          ></textarea>
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded bg-white text-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-500 text-white"
          >
            Save Prescription
          </button>
        </div>
      </form>
    </div>
  );
}
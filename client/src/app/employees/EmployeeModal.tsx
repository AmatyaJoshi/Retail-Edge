import React, { useState } from 'react';
import { useAppSelector } from "@/state/hooks";
import UserAvatar from '../components/UserAvatar';
import PhotoAdjustModal from '../components/ui/PhotoAdjustModal';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
  address?: string;
  photoUrl?: string;
}

interface EmployeeModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess?: (updatedEmployee: Employee) => void;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({ employee, isOpen, onClose, onSaveSuccess }) => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEmployee, setEditedEmployee] = useState<Employee | null>(employee);
  const [saving, setSaving] = useState(false);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [showPhotoAdjust, setShowPhotoAdjust] = useState(false);
  const [rawPhoto, setRawPhoto] = useState<string | null>(null);

  React.useEffect(() => {
    setEditedEmployee(employee);
    setIsEditing(false);
  }, [employee]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleInputChange = (field: keyof Employee, value: string) => {
    setEditedEmployee(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      // Show crop modal
      const reader = new FileReader();
      reader.onload = (ev) => {
        setRawPhoto(ev.target?.result as string);
        setShowPhotoAdjust(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoAdjustSave = (cropped: Blob | string) => {
    if (cropped instanceof Blob) {
      const file = new File([cropped], 'profile-photo.png', { type: 'image/png' });
      setSelectedPhotoFile(file);
      const url = URL.createObjectURL(file);
      setEditedEmployee(prev => prev ? { ...prev, photoUrl: url } : prev);
    } else {
      setEditedEmployee(prev => prev ? { ...prev, photoUrl: cropped } : prev);
    }
    setShowPhotoAdjust(false);
    setRawPhoto(null);
  };

  const handleRemovePhoto = () => {
    setEditedEmployee(prev => {
      if (!prev) return prev;
      const { photoUrl, ...rest } = prev;
      return rest;
    });
    setSelectedPhotoFile(null);
  };

  const handleSave = async () => {
    if (!editedEmployee || !employee) return;
    setSaving(true);
    try {
      let res;
      if (selectedPhotoFile) {
        const form = new FormData();
        form.append('firstName', editedEmployee.firstName);
        form.append('lastName', editedEmployee.lastName);
        form.append('email', editedEmployee.email);
        form.append('phone', editedEmployee.phone);
        if (editedEmployee.address) form.append('address', editedEmployee.address);
        form.append('avatar', selectedPhotoFile);
        res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/employees/${employee.id}`, {
          method: 'PATCH',
          body: form,
        });
      } else {
        res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/employees/${employee.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: editedEmployee.firstName,
            lastName: editedEmployee.lastName,
            email: editedEmployee.email,
            phone: editedEmployee.phone,
            address: editedEmployee.address,
          })
        });
      }
      if (!res.ok) throw new Error('Failed to update employee');
      // Get updated employee data
      const updated = await res.json();
      setEditedEmployee(updated);
      Object.assign(employee, updated);
      setSelectedPhotoFile(null);
      setIsEditing(false);
      // Call onSaveSuccess so parent can refetch list
      if (onSaveSuccess) onSaveSuccess(updated);
      // Don't close immediately, let user see the updated avatar
      setTimeout(() => onClose(), 1000);
    } catch (err: any) {
      alert(err.message || 'Error updating employee');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !employee) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 ${isDarkMode ? 'dark' : ''}`}
    >
      <div className={`rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900'}`} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b sticky top-0 rounded-t-2xl ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <div className="flex items-center space-x-4">
                            <UserAvatar 
                  user={{
                    ...((editedEmployee || employee) ?? {}),
                    photoUrl: selectedPhotoFile
                      ? editedEmployee?.photoUrl || employee.photoUrl || '' // Show base64 preview when file is selected
                      : (editedEmployee?.photoUrl ?? employee.photoUrl ?? ''),
                  }}
                  size="xl" 
                  className="flex-shrink-0"
                />
            <div>
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{employee.firstName} {employee.lastName}</h2>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{employee.role}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={isDarkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-400 hover:text-gray-600'}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar p-6 space-y-6">
          {/* Profile Picture */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              <svg className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile Picture
            </h3>
            <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-lg p-6`}>
              <div className="flex items-center space-x-6">
                <UserAvatar 
                  user={{
                    ...((editedEmployee || employee) ?? {}),
                    photoUrl: selectedPhotoFile
                      ? editedEmployee?.photoUrl || employee.photoUrl || '' // Show base64 preview when file is selected
                      : (editedEmployee?.photoUrl ?? employee.photoUrl ?? ''),
                  }}
                  size="xl" 
                  className="flex-shrink-0"
                />
                <div className="flex-1">
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                    Upload a profile picture to personalize your account. Supported formats: JPG, PNG, GIF (max 5MB).
                  </p>
                  {isEditing ? (
                    <div className="flex space-x-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className={`block w-full text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 ${isDarkMode ? 'file:bg-blue-700 file:hover:bg-blue-800' : 'file:bg-blue-600 file:hover:bg-blue-700'}`}
                      />
                      {editedEmployee?.photoUrl && (
                        <button
                          onClick={handleRemovePhoto}
                          className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Click "Edit Employee" to update profile picture
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              <svg className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-lg p-4`}>
                <label className={`text-sm font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>First Name</label>
                {isEditing ? (
                  <input
                    className={`w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isDarkMode ? 'border-gray-700 bg-gray-900 text-gray-100' : 'border-gray-200 bg-white text-gray-900'}`}
                    value={editedEmployee?.firstName || ''}
                    onChange={e => handleInputChange('firstName', e.target.value)}
                  />
                ) : (
                  <p className={`font-medium mt-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{employee.firstName}</p>
                )}
              </div>
              <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-lg p-4`}>
                <label className={`text-sm font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Last Name</label>
                {isEditing ? (
                  <input
                    className={`w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isDarkMode ? 'border-gray-700 bg-gray-900 text-gray-100' : 'border-gray-200 bg-white text-gray-900'}`}
                    value={editedEmployee?.lastName || ''}
                    onChange={e => handleInputChange('lastName', e.target.value)}
                  />
                ) : (
                  <p className={`font-medium mt-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{employee.lastName}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              <svg className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-lg p-4`}>
                <label className={`text-sm font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Email Address</label>
                {isEditing ? (
                  <input
                    className={`w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isDarkMode ? 'border-gray-700 bg-gray-900 text-gray-100' : 'border-gray-200 bg-white text-gray-900'}`}
                    value={editedEmployee?.email || ''}
                    onChange={e => handleInputChange('email', e.target.value)}
                  />
                ) : (
                  <p className={`font-medium mt-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{employee.email}</p>
                )}
              </div>
              <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-lg p-4`}>
                <label className={`text-sm font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Phone Number</label>
                {isEditing ? (
                  <input
                    className={`w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isDarkMode ? 'border-gray-700 bg-gray-900 text-gray-100' : 'border-gray-200 bg-white text-gray-900'}`}
                    value={editedEmployee?.phone || ''}
                    onChange={e => handleInputChange('phone', e.target.value)}
                  />
                ) : (
                  <p className={`font-medium mt-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{employee.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address */}
          {employee.address && (
            <div>
              <h3 className={`text-lg font-semibold mb-4 flex items-center ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                <svg className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Address
              </h3>
              <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-lg p-4`}>
                {isEditing ? (
                  <input
                    className={`w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isDarkMode ? 'border-gray-700 bg-gray-900 text-gray-100' : 'border-gray-200 bg-white text-gray-900'}`}
                    value={editedEmployee?.address || ''}
                    onChange={e => handleInputChange('address', e.target.value)}
                  />
                ) : (
                  <p className={`font-medium mt-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{employee.address}</p>
                )}
              </div>
            </div>
          )}

          {/* Employment Details */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              <svg className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
              Employment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-lg p-4`}>
                <label className={`text-sm font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Role</label>
                <p className={`font-medium mt-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{employee.role}</p>
              </div>
              <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-lg p-4`}>
                <label className={`text-sm font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Employee ID</label>
                <p className={`font-medium mt-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{employee.id}</p>
              </div>
              <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-lg p-4 md:col-span-2`}>
                <label className={`text-sm font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Date Joined</label>
                <p className={`font-medium mt-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{formatDate(employee.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-2 p-3 border-t rounded-b-2xl bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <button
            onClick={onClose}
            className={`px-3 py-1.5 text-sm font-medium rounded-md border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${isDarkMode ? 'text-gray-100 bg-gray-700 border-gray-600 hover:bg-gray-600' : 'text-gray-800 bg-gray-100 border-gray-300 hover:bg-gray-200'}`}
          >
            Close
          </button>
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className={`px-3 py-1.5 text-sm font-medium rounded-md border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${isDarkMode ? 'text-white bg-blue-700 border-blue-600 hover:bg-blue-800' : 'text-white bg-blue-700 border-blue-700 hover:bg-blue-800'}`}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => { setIsEditing(false); setEditedEmployee(employee); }}
                className={`px-3 py-1.5 text-sm font-medium rounded-md border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${isDarkMode ? 'text-gray-100 bg-gray-700 border-gray-600 hover:bg-gray-600' : 'text-gray-800 bg-gray-100 border-gray-300 hover:bg-gray-200'}`}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${isDarkMode ? 'text-white bg-blue-700 border-blue-600 hover:bg-blue-800' : 'text-white bg-blue-700 border-blue-700 hover:bg-blue-800'}`}
            >
              Edit Employee
            </button>
          )}
        </div>
      </div>
      {showPhotoAdjust && rawPhoto && (
        <PhotoAdjustModal
          open={showPhotoAdjust}
          image={rawPhoto}
          onClose={() => { setShowPhotoAdjust(false); setRawPhoto(null); }}
          onSave={handlePhotoAdjustSave}
        />
      )}
    </div>
  );
};

export default EmployeeModal; 
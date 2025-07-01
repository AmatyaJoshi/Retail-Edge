"use client";

import { Calendar, Edit3, Mail, Phone, User } from "lucide-react";
import { useUser } from '@clerk/nextjs';
import { useState, useEffect, useRef } from 'react';

interface UserData {
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

const ProfilePage = () => {
  const { user, isLoaded } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPhoto, setEditPhoto] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user data from database
  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.id) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/user-profile?clerkId=${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setUserData(data);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    if (isLoaded && user) {
      fetchUserData();
    }
  }, [user, isLoaded]);

  useEffect(() => {
    if (userData) {
      setEditPhone(userData.phone || "");
      setEditAddress(userData.address || "");
      setEditPhoto(userData.photoUrl || null);
    }
  }, [userData]);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return 'User';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName} ${lastName}`.trim() || user.emailAddresses[0]?.emailAddress || 'User';
  };

  // Section title based on role
  const getSectionTitle = () => {
    if (!userData) return "Employee Information";
    const role = userData.role?.toLowerCase();
    if (role === "owner") return "Owner Information";
    if (role === "manager") return "Manager Information";
    if (role === "admin") return "Admin Information";
    return "Employee Information";
  };

  // ID label based on role
  const getIdLabel = () => {
    if (!userData) return "Employee ID";
    const role = userData.role?.toLowerCase();
    if (role === "owner") return "Owner ID";
    if (role === "manager") return "Manager ID";
    if (role === "admin") return "Admin ID";
    return "Employee ID";
  };

  // Handle profile photo upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setEditPhoto(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save profile changes
  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        id: userData?.id,
        phone: editPhone,
        address: editAddress,
        photoUrl: editPhoto,
      };
      const res = await fetch(`/api/auth/user-profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setEditOpen(false);
        // Refetch user data
        if (user?.id) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/user-profile?clerkId=${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setUserData(data);
          }
        }
      }
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-80px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user || !userData) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-80px)]">
        <div className="text-center">
          <p className="text-gray-600">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full min-h-[calc(100vh-80px)] bg-gray-50 px-4">
      {/* Edit Profile Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setEditOpen(false)}>&times;</button>
            <h2 className="text-xl font-bold mb-6 text-gray-900">Edit Profile</h2>
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="relative">
                {editPhoto ? (
                  <img src={editPhoto} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-blue-200 shadow" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-blue-200 shadow">
                    {getUserInitials()}
                  </div>
                )}
                <button
                  className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={editPhone}
                onChange={e => setEditPhone(e.target.value)}
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={editAddress}
                onChange={e => setEditAddress(e.target.value)}
                rows={2}
              />
            </div>
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow transition disabled:opacity-60"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
      {/* Left Sidebar */}
      <div className="lg:col-span-1 h-full flex flex-col">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 h-full flex flex-col">
          {/* Profile Info */}
          <div className="flex flex-col items-center p-8 border-b border-gray-100">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg border-4 border-white mb-4 overflow-hidden">
              {userData.photoUrl ? (
                <img src={userData.photoUrl} alt="Profile" className="w-28 h-28 rounded-full object-cover" />
              ) : (
                <span className="text-white font-bold text-4xl select-none">{getUserInitials()}</span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">{getUserDisplayName()}</h2>
            <span className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-800 text-base font-semibold shadow mb-2">{userData.role}</span>
            <span className="inline-block px-3 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold mb-2">Active</span>
            <p className="text-gray-500 text-base text-center">Member since {new Date(userData.createdAt).toLocaleDateString('en-GB')}</p>
          </div>
          
          {/* Contact Info */}
          <div className="p-8 border-b border-gray-100 flex-grow">
            <div className="space-y-4">
              <div className="flex items-center text-gray-700 gap-3">
                <Mail className="w-5 h-5 text-blue-500" />
                <span className="text-base">{user.emailAddresses[0]?.emailAddress || 'No email'}</span>
              </div>
              <div className="flex items-center text-gray-700 gap-3">
                <Phone className="w-5 h-5 text-blue-500" />
                <span className="text-base">{userData.phone || 'No phone'}</span>
              </div>
              <div className="flex items-center text-gray-700 gap-3">
                <Calendar className="w-5 h-5 text-blue-500" />
                <span className="text-base">Joined {new Date(userData.createdAt).toLocaleDateString('en-GB')}</span>
              </div>
            </div>
          </div>
          
          {/* Edit Button */}
          <div className="p-8 mt-auto">
            <button className="w-full px-4 py-2 flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow transition text-base" onClick={() => setEditOpen(true)}>
              <Edit3 className="w-5 h-5 mr-2" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>
      
      {/* Right Content */}
      <div className="lg:col-span-3 space-y-8 flex flex-col">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 flex-grow">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">{getSectionTitle()}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10">
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">{getIdLabel()}</div>
              <div className="font-mono text-base text-gray-800">{userData.id}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Department</div>
              <div className="font-medium text-gray-900">Retail Operations</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Role</div>
              <div className="font-medium text-gray-900">{userData.role}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Email</div>
              <div className="font-medium text-gray-900">{user.emailAddresses[0]?.emailAddress || 'No email'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Phone</div>
              <div className="font-medium text-gray-900">{userData.phone || 'No phone'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Address</div>
              <div className="font-medium text-gray-900">{userData.address || 'No address provided'}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">Account Information</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-start pb-3 border-b border-gray-100">
              <div>
                <div className="font-medium text-gray-800">Account Created</div>
              </div>
              <div className="text-sm text-gray-500">{new Date(userData.createdAt).toLocaleDateString('en-GB')}</div>
            </div>
            <div className="flex justify-between items-start pb-3 border-b border-gray-100">
              <div>
                <div className="font-medium text-gray-800">Last Login</div>
              </div>
              <div className="text-sm text-gray-500">{new Date().toLocaleDateString('en-GB')}</div>
            </div>
            <div className="flex justify-between items-start pb-3 border-b border-gray-100">
              <div>
                <div className="font-medium text-gray-800">Account Status</div>
              </div>
              <div className="text-sm text-green-600 font-semibold">Active</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

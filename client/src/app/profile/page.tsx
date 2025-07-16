﻿"use client";

import { Calendar, Edit3, Mail, Phone, User } from "lucide-react";
import { useUser } from '@clerk/nextjs';
import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import QRCode from 'react-qr-code';

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
  const [showRemovePhotoConfirm, setShowRemovePhotoConfirm] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const [sidebarHeight, setSidebarHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!isLoaded || !user?.id) return;
    setLoading(true);
    const backendUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';
    fetch(`${backendUrl}/api/auth/user-profile?clerkId=${user.id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setUserData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, isLoaded]);

  useEffect(() => {
    if (userData) {
      setEditPhone(userData.phone || "");
      setEditAddress(userData.address || "");
      setEditPhoto(userData.photoUrl || null);
    }
  }, [userData]);

  useEffect(() => {
    if (rightRef.current) {
      setSidebarHeight(rightRef.current.offsetHeight);
    }
  }, [userData]);

  const getUserInitials = () => {
    if (!user) return 'U';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };

  const getUserDisplayName = () => {
    if (!user) return 'User';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName} ${lastName}`.trim() || user.emailAddresses[0]?.emailAddress || 'User';
  };

  const getSectionTitle = () => {
    if (!userData) return "Employee Information";
    const role = userData.role?.toLowerCase();
    if (role === "owner") return "Owner Information";
    if (role === "manager") return "Manager Information";
    if (role === "admin") return "Admin Information";
    return "Employee Information";
  };

  const getIdLabel = () => {
    if (!userData) return "Employee ID";
    const role = userData.role?.toLowerCase();
    if (role === "owner") return "Owner ID";
    if (role === "manager") return "Manager ID";
    if (role === "admin") return "Admin ID";
    return "Employee ID";
  };

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

  const handleRemovePhoto = async () => {
    setShowRemovePhotoConfirm(false);
    setEditPhoto(null);
  };

  const handleRemovePhotoFromProfile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    handleRemovePhoto();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';
      if (fileInputRef.current && fileInputRef.current.files && fileInputRef.current.files[0]) {
        const form = new FormData();
        form.append('id', userData?.id || '');
        form.append('phone', editPhone);
        form.append('address', editAddress);
        form.append('avatar', fileInputRef.current.files[0]);
        const res = await fetch(`${backendUrl}/api/auth/user-profile`, {
          method: 'PATCH',
          body: form,
          credentials: 'include',
        });
        if (res.ok) {
          setEditOpen(false);
          if (user?.id) {
            const response = await fetch(`${backendUrl}/api/auth/user-profile?clerkId=${user.id}`);
            if (response.ok) {
              const data = await response.json();
              setUserData(data);
            }
          }
          window.dispatchEvent(new Event('profile-updated'));
        }
      } else {
        const body = {
          id: userData?.id,
          phone: editPhone,
          address: editAddress,
          photoUrl: editPhoto,
        };
        const res = await fetch(`${backendUrl}/api/auth/user-profile`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          credentials: 'include',
        });
        if (res.ok) {
          setEditOpen(false);
          if (user?.id) {
            const response = await fetch(`${backendUrl}/api/auth/user-profile?clerkId=${user.id}`);
            if (response.ok) {
              const data = await response.json();
              setUserData(data);
            }
          }
          window.dispatchEvent(new Event('profile-updated'));
        }
      }
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-80px)] dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user || !userData) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-80px)] dark:bg-gray-950">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        <div className="flex w-full max-w-7xl mx-auto gap-8 items-stretch" style={{alignItems: 'stretch'}}>
          {/* Left Sidebar */}
          <aside ref={sidebarRef} style={sidebarHeight ? { height: sidebarHeight } : {}} className="flex flex-col bg-gray-100 dark:bg-gray-800 border-l border-gray-300 dark:border-gray-700 shadow-lg rounded-2xl min-w-[320px] max-w-xs w-full">
            {/* Profile Info */}
            <div className="flex flex-col items-center px-4 py-6 border-b border-gray-100 dark:border-gray-800">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-900 mb-4 overflow-hidden">
                {userData.photoUrl ? (
                  <img src={`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'}/api/user-avatar/${userData.photoUrl.startsWith('http') ? userData.photoUrl.split('/').pop() : userData.photoUrl}`} alt="Profile" className="w-28 h-28 rounded-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-4xl select-none">{getUserInitials()}</span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center mb-1">{getUserDisplayName()}</h2>
              <span className="inline-block px-4 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-base font-semibold shadow mb-2">{userData.role}</span>
              <span className="inline-block px-3 py-0.5 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 text-xs font-semibold mb-2">Active</span>
              <p className="text-gray-500 dark:text-gray-400 text-base text-center">Member since {new Date(userData.createdAt).toLocaleDateString('en-GB')}</p>
            </div>
            {/* Contact Info */}
            <div className="py-6 px-2 border-b border-gray-100 dark:border-gray-800 flex-grow">
              <div className="space-y-4">
                <div className="flex items-center text-gray-700 dark:text-gray-200 gap-3">
                  <Mail className="w-5 h-5 text-blue-500" />
                  <span className="text-base">{user.emailAddresses[0]?.emailAddress || 'No email'}</span>
                </div>
                <div className="flex items-center text-gray-700 dark:text-gray-200 gap-3">
                  <Phone className="w-5 h-5 text-blue-500" />
                  <span className="text-base">{userData.phone || 'No phone'}</span>
                </div>
                <div className="flex items-center text-gray-700 dark:text-gray-200 gap-3">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <span className="text-base">Joined {new Date(userData.createdAt).toLocaleDateString('en-GB')}</span>
                </div>
              </div>
              {/* QR Code for Owner ID */}
              <div className="flex flex-col items-center justify-center mt-4 mb-1">
                <div className="bg-white border border-gray-200 dark:border-gray-700 rounded p-2 shadow-sm">
                  <QRCode value={userData.id} size={64} bgColor="#fff" fgColor="#222" />
                </div>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Scan Owner ID</span>
              </div>
            </div>
          </aside>
          {/* Main Content */}
          <section ref={rightRef} className="flex-1 min-w-0 flex flex-col h-full">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 pt-0 px-6 pb-10 flex-1 flex flex-col mb-6">
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100 dark:border-gray-800">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{getSectionTitle()}</h2>
                  <button className="px-4 py-2 flex items-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-lg font-semibold shadow transition text-base" onClick={() => setEditOpen(true)}>
                    <Edit3 className="w-5 h-5 mr-2" />
                    Edit Profile
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10">
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{getIdLabel()}</div>
                    <div className="font-mono text-base text-gray-800 dark:text-gray-200">{userData.id}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Department</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">Retail Operations</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Role</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{userData.role}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{user.emailAddresses[0]?.emailAddress || 'No email'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Phone</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{userData.phone || 'No phone'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Address</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{userData.address || 'No address provided'}</div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 pb-2 border-b border-gray-100 dark:border-gray-800">Account Information</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-start pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-200">Account Created</div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{new Date(userData.createdAt).toLocaleDateString('en-GB')}</div>
                  </div>
                  <div className="flex justify-between items-start pb-3 border-b border-gray-100 dark:border-gray-800">
                      <div>
                      <div className="font-medium text-gray-800 dark:text-gray-200">Last Login</div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{new Date().toLocaleDateString('en-GB')}</div>
                      </div>
                  <div className="flex justify-between items-start pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-200">Account Status</div>
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400 font-semibold">Active</div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md relative border border-gray-200 dark:border-gray-700">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl" onClick={() => setEditOpen(false)}>&times;</button>
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">Edit Profile</h2>
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
              {editPhoto && (
                <>
                  <button
                    className="mt-2 text-xs text-gray-500 hover:underline hover:text-red-500 transition-colors"
                    onClick={() => setShowRemovePhotoConfirm(true)}
                    type="button"
                  >
                    Remove photo
                  </button>
                  <Dialog open={showRemovePhotoConfirm} onOpenChange={setShowRemovePhotoConfirm}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Remove Profile Photo</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to remove your profile photo?
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <button
                          className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                          onClick={() => setShowRemovePhotoConfirm(false)}
                          type="button"
                        >
                          Cancel
                        </button>
                        <button
                          className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                          onClick={handleRemovePhoto}
                          type="button"
                        >
                          Remove
                        </button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Phone Number</label>
              <input
                type="text"
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:bg-gray-900 dark:text-gray-100"
                value={editPhone}
                onChange={e => setEditPhone(e.target.value)}
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Address</label>
              <textarea
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:bg-gray-900 dark:text-gray-100"
                value={editAddress}
                onChange={e => setEditAddress(e.target.value)}
                rows={2}
              />
            </div>
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-semibold py-2 rounded-lg shadow transition disabled:opacity-60"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePage;

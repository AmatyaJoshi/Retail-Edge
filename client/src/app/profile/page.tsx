"use client";

import { Calendar, Edit3, Mail, Phone, User, Shield, Activity, CreditCard, Settings, Bell, Lock, Eye, Key, Clock, TrendingUp, ShoppingCart, FileText, Download } from "lucide-react";
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

  // Mock data for enhanced features
  const recentActivities = [
    { id: 1, type: 'login', description: 'Logged in from Chrome on Windows', time: '2 hours ago', icon: Activity },
    { id: 2, type: 'transaction', description: 'Completed sale #TRX-2025-001', time: '1 day ago', icon: ShoppingCart },
    { id: 3, type: 'profile', description: 'Updated profile information', time: '3 days ago', icon: User },
    { id: 4, type: 'security', description: 'Changed password', time: '1 week ago', icon: Lock },
  ];

  const recentTransactions = [
    { id: 1, type: 'Sale', amount: '₹2,500', status: 'Completed', date: '2025-01-16', items: 3 },
    { id: 2, type: 'Refund', amount: '₹800', status: 'Processed', date: '2025-01-15', items: 1 },
    { id: 3, type: 'Sale', amount: '₹1,200', status: 'Completed', date: '2025-01-14', items: 2 },
    { id: 4, type: 'Sale', amount: '₹3,100', status: 'Completed', date: '2025-01-13', items: 4 },
  ];

  const securitySettings = [
    { id: 1, title: 'Two-Factor Authentication', status: 'Enabled', icon: Shield, description: 'Adds an extra layer of security' },
    { id: 2, title: 'Login Notifications', status: 'Enabled', icon: Bell, description: 'Get notified of new logins' },
    { id: 3, title: 'Session Management', status: 'Active', icon: Clock, description: 'Manage active sessions' },
    { id: 4, title: 'Password Policy', status: 'Strong', icon: Lock, description: 'Enforce strong passwords' },
  ];

  const performanceMetrics = [
    { id: 1, title: 'Total Sales', value: '₹45,200', change: '+12%', icon: TrendingUp, color: 'text-green-500' },
    { id: 2, title: 'Transactions', value: '156', change: '+8%', icon: CreditCard, color: 'text-blue-500' },
    { id: 3, title: 'Products Sold', value: '89', change: '+15%', icon: ShoppingCart, color: 'text-purple-500' },
    { id: 4, title: 'Reports Generated', value: '23', change: '+5%', icon: FileText, color: 'text-orange-500' },
  ];

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
      <div className="flex items-center justify-center h-full min-h-0 flex-1 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user || !userData) {
    return (
      <div className="flex items-center justify-center h-full min-h-0 flex-1 dark:bg-gray-950">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full min-h-0 flex-1 bg-gray-50 dark:bg-gray-900 p-2 sm:p-4 lg:p-8 flex flex-col items-center overflow-auto mt-16 custom-scrollbar">
        <div className="w-full max-w-7xl flex flex-col gap-4 lg:flex-row lg:gap-8">
          {/* Left Column - Profile Card */}
          <aside className="w-full lg:w-1/3 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-2xl overflow-hidden flex flex-col h-fit">
              <div className="flex flex-col items-center px-6 py-8 border-b border-gray-100 dark:border-gray-700">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-900 mb-4 overflow-hidden">
                {userData.photoUrl ? (
                    <img src={`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'}/api/user-avatar/${userData.photoUrl.startsWith('http') ? userData.photoUrl.split('/').pop() : userData.photoUrl}`} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                    <span className="text-white font-bold text-xl sm:text-2xl md:text-3xl select-none">{getUserInitials()}</span>
                )}
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 text-center mb-2 break-words px-2">{getUserDisplayName()}</h2>
                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold shadow-sm">{userData.role}</span>
                  <span className="inline-block px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 text-xs font-semibold">Active</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-xs text-center px-2">Member since {new Date(userData.createdAt).toLocaleDateString('en-GB')}</p>
              </div>
              <div className="py-4 px-6 flex flex-col gap-3">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700 dark:text-gray-200 gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</p>
                      <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{user.emailAddresses[0]?.emailAddress || 'No email'}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-700 dark:text-gray-200 gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phone</p>
                      <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{userData.phone || 'No phone'}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-700 dark:text-gray-200 gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Joined</p>
                      <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{new Date(userData.createdAt).toLocaleDateString('en-GB')}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="bg-white border border-gray-200 dark:border-gray-600 rounded-lg p-2 shadow-sm">
                    <QRCode value={userData.id} size={60} bgColor="#fff" fgColor="#222" />
            </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">Scan Owner ID</p>
                </div>
              </div>
            </div>

            {/* Additional Cards Below Profile */}
            <div className="mt-4 space-y-4">
              {/* Quick Actions Card */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                    <Settings className="w-4 h-4 mx-auto mb-1" />
                    Settings
                  </button>
                  <button className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400 text-xs font-medium hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                    <Download className="w-4 h-4 mx-auto mb-1" />
                    Export
                  </button>
                </div>
              </div>

              {/* System Status Card */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">System Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Database</span>
                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">Online</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">API</span>
                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Storage</span>
                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">24%</span>
                  </div>
                </div>
              </div>

              {/* Notifications Card */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Recent Notifications</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5"></div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-900 dark:text-gray-100">Low stock alert</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">5 products need restocking</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-900 dark:text-gray-100">New sale completed</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">₹2,500 transaction</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Column - Enhanced Content */}
          <div className="w-full lg:w-2/3 flex flex-col gap-4">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {performanceMetrics.map((metric) => (
                <div key={metric.id} className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-lg rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{metric.title}</p>
                      <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">{metric.value}</p>
                      <p className={`text-xs font-semibold ${metric.color}`}>{metric.change}</p>
                    </div>
                    <metric.icon className={`w-8 h-8 ${metric.color}`} />
                  </div>
                </div>
              ))}
            </div>

            {/* Owner Information */}
            <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-lg rounded-2xl p-4 sm:p-6 flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-gray-800 gap-2">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">{getSectionTitle()}</h2>
                <button className="px-3 py-2 flex items-center justify-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-lg font-semibold shadow transition text-xs sm:text-sm md:text-base" onClick={() => setEditOpen(true)}>
                  <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{getIdLabel()}</div>
                  <div className="font-mono text-xs sm:text-sm md:text-base text-gray-800 dark:text-gray-200 break-all">{userData.id}</div>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Department</div>
                  <div className="font-medium text-xs sm:text-sm md:text-base text-gray-900 dark:text-gray-100">Retail Operations</div>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Role</div>
                  <div className="font-medium text-xs sm:text-sm md:text-base text-gray-900 dark:text-gray-100">{userData.role}</div>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</div>
                  <div className="font-medium text-xs sm:text-sm md:text-base text-gray-900 dark:text-gray-100 break-all">{user.emailAddresses[0]?.emailAddress || 'No email'}</div>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Phone</div>
                  <div className="font-medium text-xs sm:text-sm md:text-base text-gray-900 dark:text-gray-100">{userData.phone || 'No phone'}</div>
                </div>
                <div className="sm:col-span-2 lg:col-span-1">
                  <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Address</div>
                  <div className="font-medium text-xs sm:text-sm md:text-base text-gray-900 dark:text-gray-100 break-words">{userData.address || 'No address provided'}</div>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-lg rounded-2xl p-4 sm:p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">Recent Transactions</h2>
                <button className="px-3 py-2 flex items-center justify-center bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-800 text-white rounded-lg font-semibold shadow transition text-xs sm:text-sm md:text-base">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                  <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{transaction.type}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{transaction.items} items • {transaction.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{transaction.amount}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        transaction.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        transaction.status === 'Processed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-lg rounded-2xl p-4 sm:p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">Security Settings</h2>
                <button className="px-3 py-2 flex items-center justify-center bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-800 text-white rounded-lg font-semibold shadow transition text-xs sm:text-sm md:text-base">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {securitySettings.map((setting) => (
                  <div key={setting.id} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                      <setting.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{setting.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{setting.description}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      setting.status === 'Enabled' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      setting.status === 'Active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {setting.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-lg rounded-2xl p-4 sm:p-6 flex flex-col">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">Recent Activity</h2>
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                      <activity.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{activity.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-lg rounded-2xl p-4 sm:p-6 flex flex-col">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">Account Information</h2>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-0 pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <div className="font-medium text-xs sm:text-sm md:text-base text-gray-800 dark:text-gray-200">Account Created</div>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{new Date(userData.createdAt).toLocaleDateString('en-GB')}</div>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-0 pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <div className="font-medium text-xs sm:text-sm md:text-base text-gray-800 dark:text-gray-200">Last Login</div>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{new Date().toLocaleDateString('en-GB')}</div>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-0 pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <div className="font-medium text-xs sm:text-sm md:text-base text-gray-800 dark:text-gray-200">Account Status</div>
                  </div>
                  <div className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-semibold">Active</div>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-0 pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div>
                    <div className="font-medium text-xs sm:text-sm md:text-base text-gray-800 dark:text-gray-200">Account Type</div>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Premium</div>
                    </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-0">
                    <div>
                    <div className="font-medium text-xs sm:text-sm md:text-base text-gray-800 dark:text-gray-200">Storage Used</div>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">2.4 GB / 10 GB</div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-auto relative border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl" onClick={() => setEditOpen(false)}>&times;</button>
              <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-gray-100">Edit Profile</h2>
              <div className="flex flex-col items-center gap-4 mb-4 sm:mb-6">
              <div className="relative">
                {editPhoto ? (
                    <img src={editPhoto} alt="Profile" className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-blue-200 shadow" />
                ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold border-4 border-blue-200 shadow">
                    {getUserInitials()}
                  </div>
                )}
                <button
                    className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-1.5 sm:p-2 shadow"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                    <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
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
                      <DialogContent className="max-w-sm mx-4">
                      <DialogHeader>
                        <DialogTitle>Remove Profile Photo</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to remove your profile photo?
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <button
                            className="px-3 sm:px-4 py-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm"
                          onClick={() => setShowRemovePhotoConfirm(false)}
                          type="button"
                        >
                          Cancel
                        </button>
                        <button
                            className="px-3 sm:px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-sm"
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
              <div className="space-y-4">
                <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Phone Number</label>
              <input
                type="text"
                value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:bg-gray-900 dark:text-gray-100 text-sm"
                    placeholder="Enter phone number"
              />
            </div>
                <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Address</label>
              <textarea
                value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:bg-gray-900 dark:text-gray-100 text-sm resize-none"
                    placeholder="Enter address"
              />
            </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
                >
                  Cancel
                </button>
            <button
              onClick={handleSave}
              disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow transition-colors disabled:opacity-50 text-sm"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePage;

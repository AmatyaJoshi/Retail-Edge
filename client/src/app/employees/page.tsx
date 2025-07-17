"use client";

import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import EmployeeModal from './EmployeeModal';
import { ArrowUpRightFromSquare, AlertTriangle } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import UserAvatar from '../components/UserAvatar';

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

const ROLE_ORDER = ['Owner', 'Admin', 'Manager', 'Staff'];
const ROLE_LABELS: Record<string, string> = {
  Owner: 'Owner',
  Admin: 'Admin',
  Manager: 'Manager',
  Staff: 'Staff',
  User: 'Staff',
  USER: 'Staff',
  STAFF: 'Staff',
  ADMIN: 'Admin',
  OWNER: 'Owner',
  MANAGER: 'Manager',
};

const ENABLED_ROLES = ['Owner', 'Admin', 'Manager', 'Staff'];

const EmployeesPage = () => {
  const { user } = useUser();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [roleLoadingId, setRoleLoadingId] = useState<string | null>(null);
  const [roleDropdownId, setRoleDropdownId] = useState<string | null>(null);
  const [roleDropdownPos, setRoleDropdownPos] = useState<{top: number, left: number, width: number} | null>(null);
  const [confirmRoleChange, setConfirmRoleChange] = useState<{emp: Employee, newRole: string} | null>(null);
  const roleBtnRefs = useRef<{[id: string]: HTMLButtonElement | null}>({});
  const [sectionSearch, setSectionSearch] = useState<{[role: string]: string}>({});
  const [exportDropdown, setExportDropdown] = useState<string | null>(null);
  const [sectionSort, setSectionSort] = useState<{[role: string]: string}>({});

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/employees`);
      if (!res.ok) throw new Error('Failed to fetch employees');
      const data = await res.json();
      setEmployees(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (roleDropdownId && roleBtnRefs.current[roleDropdownId]) {
      const rect = roleBtnRefs.current[roleDropdownId]!.getBoundingClientRect();
      setRoleDropdownPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    } else {
      setRoleDropdownPos(null);
    }
  }, [roleDropdownId]);

  useEffect(() => {
    if (!roleDropdownId) return;
    const handleClick = (e: MouseEvent) => {
      if (roleDropdownPos) {
        setRoleDropdownId(null);
      }
    };
    const handleScroll = () => setRoleDropdownId(null);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('mousedown', handleClick);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('mousedown', handleClick);
    };
  }, [roleDropdownId, roleDropdownPos]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  // Check if the user is trying to delete their own account
  const isDeletingOwnAccount = () => {
    if (!user || !deletingId) return false;
    const employeeToDelete = employees.find(emp => emp.id === deletingId);
    return employeeToDelete?.email === user.emailAddresses[0]?.emailAddress;
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      // The backend should handle deleting the user from the DB, Clerk, and Appwrite
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/employees/${deletingId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete employee');
      setShowDeleteConfirm(false);
      setDeletingId(null);
      await fetchEmployees();
    } catch (err: any) {
      alert(err.message || 'Error deleting employee');
    }
  };

  // Simulate API call to update role
  const handleRoleChange = async (emp: Employee, newRole: string) => {
    setRoleLoadingId(emp.id);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/employees/${emp.id}/assign-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      if (!res.ok) throw new Error('Failed to update role');
      setEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, role: newRole } : e));
    } catch (err: any) {
      alert(err.message || 'Error updating role');
    } finally {
      setRoleLoadingId(null);
    }
  };

  // Group employees by role, putting User/Staff together
  const grouped = ROLE_ORDER.map(role => ({
    role,
    employees: employees.filter(emp => {
      const r = (emp.role || '').toLowerCase();
      if (role === 'Staff') return r === 'staff' || r === 'user';
      return r === role.toLowerCase();
    })
  }));

  // Export helpers
  const exportData = (data: Employee[], format: string, role: string) => {
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${role.toLowerCase()}-employees.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      // Simple CSV export without XLSX
      const headers = ['Name', 'Email', 'Phone', 'Role', 'Created At'];
      const csvContent = [
        headers.join(','),
        ...data.map(emp => [
          `"${emp.firstName} ${emp.lastName}"`,
          `"${emp.email}"`,
          `"${emp.phone}"`,
          `"${emp.role}"`,
          `"${emp.createdAt}"`
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${role.toLowerCase()}-employees.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'excel') {
      // For Excel, we'll use JSON for now since XLSX is having issues
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${role.toLowerCase()}-employees.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Add a callback for when the employee modal saves successfully
  const handleEmployeeModalSave = (updatedEmployee: Employee) => {
    fetchEmployees();
    // If the updated employee is the current user, dispatch profile-updated event
    if (user && updatedEmployee.email === user.emailAddresses[0]?.emailAddress) {
      window.dispatchEvent(new Event('profile-updated'));
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#10192A] dark:text-gray-100 overflow-x-hidden">
      {/* Professional Header Section */}
      <div className="px-2 pt-24 pb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-2">Employees</h1>
        <p className="text-gray-500 dark:text-gray-300 text-base">Browse, search, and manage your team members. Add new employees, update roles, and maintain your workforce database for seamless operations and communication.</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-0 pb-8 custom-scrollbar">
        <div className="grid grid-cols-1 gap-8">
          {loading ? (
            <div className="col-span-full"><p className="text-gray-500">Loading employees...</p></div>
          ) : error ? (
            <div className="col-span-full"><p className="text-red-500">{error}</p></div>
          ) : (
            grouped.map((group, idx) => {
              // Filter employees in this section by search
              const search = sectionSearch[group.role] || '';
              const sort = sectionSort[group.role] || 'name';
              let filteredEmployees = group.employees.filter(emp => {
                const q = search.toLowerCase();
                return (
                  emp.firstName.toLowerCase().includes(q) ||
                  emp.lastName.toLowerCase().includes(q) ||
                  emp.email.toLowerCase().includes(q) ||
                  emp.phone.toLowerCase().includes(q)
                );
              });
              // Sorting logic
              filteredEmployees = [...filteredEmployees].sort((a, b) => {
                if (sort === 'name') {
                  return (a.firstName + ' ' + a.lastName).localeCompare(b.firstName + ' ' + b.lastName);
                } else if (sort === 'email') {
                  return a.email.localeCompare(b.email);
                } else if (sort === 'date') {
                  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                }
                return 0;
              });
              return (
                <div key={group.role} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <h2 className="text-lg font-semibold tracking-wide text-gray-800 dark:text-gray-100 flex items-center gap-2">
                      <span className="inline-block px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs font-bold uppercase tracking-wider">
                        {ROLE_LABELS[group.role] || group.role}
                      </span>
                      <span className="text-gray-400 dark:text-gray-300 font-normal text-xs">({filteredEmployees.length})</span>
                    </h2>
                    <div className="flex gap-2 items-center w-full md:w-auto">
                      <input
                        type="text"
                        placeholder="Search..."
                        className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-sm w-full md:w-56 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                        value={sectionSearch[group.role] || ''}
                        onChange={e => setSectionSearch(s => ({ ...s, [group.role]: e.target.value }))}
                      />
                      {/* Sorting dropdown */}
                      <select
                        className="px-2 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100"
                        value={sectionSort[group.role] || 'name'}
                        onChange={e => setSectionSort(s => ({ ...s, [group.role]: e.target.value }))}
                      >
                        <option value="name">Sort by Name</option>
                        <option value="email">Sort by Email</option>
                        <option value="date">Sort by Date Joined</option>
                      </select>
                      {/* Export button and dropdown */}
                      <div className="relative">
                        <button
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-black border border-black rounded-md hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors duration-200"
                          onClick={() => setExportDropdown(exportDropdown === group.role ? null : group.role)}
                        >
                          <ArrowUpRightFromSquare className="w-4 h-4" />
                          Export
                        </button>
                        {exportDropdown === group.role && (
                          <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
                            <button className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-gray-700" onClick={() => { exportData(filteredEmployees, 'excel', group.role); setExportDropdown(null); }}>Excel (.xlsx)</button>
                            <button className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-gray-700" onClick={() => { exportData(filteredEmployees, 'csv', group.role); setExportDropdown(null); }}>CSV (.csv)</button>
                            <button className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-gray-700" onClick={() => { exportData(filteredEmployees, 'json', group.role); setExportDropdown(null); }}>JSON (.json)</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {filteredEmployees.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-100 uppercase tracking-wider">
                              <div className="flex items-center justify-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Name
                              </div>
                            </th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-100 uppercase tracking-wider">
                              <div className="flex items-center justify-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Email
                              </div>
                            </th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-100 uppercase tracking-wider">
                              <div className="flex items-center justify-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                Phone
                              </div>
                            </th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-100 uppercase tracking-wider">
                              <div className="flex items-center justify-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                Role
                              </div>
                            </th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-100 uppercase tracking-wider">
                              <div className="flex items-center justify-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                </svg>
                                Actions
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {filteredEmployees.map((emp, index) => (
                            <tr key={emp.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 bg-white dark:bg-gray-800`}>
                              <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-start">
                                  <div className="flex-shrink-0">
                                    <UserAvatar 
                                      user={emp} 
                                      size="md" 
                                      className="flex-shrink-0"
                                    />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{emp.firstName} {emp.lastName}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">{emp.email}</div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">{emp.phone}</div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100 border border-gray-200 dark:border-gray-600">
                                  {ROLE_LABELS[emp.role] || emp.role}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button 
                                    className="inline-flex items-center px-3 py-2 text-xs font-medium text-white bg-blue-700 border border-blue-600 rounded-md hover:bg-blue-800 dark:bg-blue-700 dark:border-blue-600 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
                                    onClick={() => {
                                      setSelectedEmployee(emp);
                                      setShowEmployeeModal(true);
                                    }}
                                  >
                                    <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    View
                                  </button>
                                  <div className="relative">
                                    <button
                                      ref={el => { roleBtnRefs.current[emp.id] = el; }}
                                      className="inline-flex items-center px-3 py-2 text-xs font-medium text-white bg-blue-700 border border-blue-600 rounded-md hover:bg-blue-800 dark:bg-blue-700 dark:border-blue-600 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
                                      disabled={roleLoadingId === emp.id}
                                      onClick={() => setRoleDropdownId(emp.id === roleDropdownId ? null : emp.id)}
                                    >
                                      <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                      </svg>
                                      {roleLoadingId === emp.id ? 'Updating...' : 'Role'}
                                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                    </button>
                                  </div>
                                  <button 
                                    className="inline-flex items-center px-3 py-2 text-xs font-medium text-white bg-red-700 border border-red-700 rounded-md hover:bg-red-800 dark:bg-red-800 dark:border-red-700 dark:hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-sm"
                                    onClick={() => handleDelete(emp.id)}
                                  >
                                    <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No {group.role.toLowerCase()} employees found</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-lg text-center border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">Delete Employee</h2>
            
            {isDeletingOwnAccount() ? (
              <>
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center justify-center mb-3">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 mr-2" />
                    <span className="text-red-800 dark:text-red-200 font-semibold">Warning: You are deleting your own account!</span>
                  </div>
                  <p className="text-red-700 dark:text-red-300 text-sm leading-relaxed">
                    This action will immediately log you out and permanently delete your account. 
                    <strong> This action is irreversible and cannot be undone.</strong> 
                    You will lose access to all data and will need to be re-invited if you want to rejoin the system.
                  </p>
                </div>
                <p className="mb-8 text-gray-600 dark:text-gray-300 text-base">
                  Are you absolutely sure you want to delete your own account?
                </p>
              </>
            ) : (
              <p className="mb-8 text-gray-600 dark:text-gray-300 text-base">
                Are you sure you want to delete this employee?
              </p>
            )}
            
            <div className="flex justify-center gap-4">
              <button 
                className="px-6 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 font-medium" 
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className={`px-6 py-3 rounded-lg text-white transition-colors duration-200 font-medium ${
                  isDeletingOwnAccount() 
                    ? 'bg-red-700 hover:bg-red-800 dark:bg-red-800 dark:hover:bg-red-900' 
                    : 'bg-red-600 hover:bg-red-700 dark:bg-red-800 dark:hover:bg-red-900'
                }`} 
                onClick={confirmDelete}
              >
                {isDeletingOwnAccount() ? 'Delete My Account' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Employee Details Modal */}
      <EmployeeModal
        employee={selectedEmployee}
        isOpen={showEmployeeModal}
        onClose={() => setShowEmployeeModal(false)}
        onSaveSuccess={handleEmployeeModalSave}
      />
      {/* Role Change Confirmation Modal */}
      {confirmRoleChange && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-xs text-center">
            <h2 className="text-lg font-semibold mb-4 dark:text-gray-100">Change Role</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-300">Are you sure you want to change this employee's role to <span className="font-bold text-blue-700 dark:text-blue-300">{confirmRoleChange.newRole}</span>?</p>
            <div className="flex justify-center gap-4">
              <button className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => setConfirmRoleChange(null)}>Cancel</button>
              <button className="px-4 py-2 rounded bg-blue-700 text-white hover:bg-blue-800 dark:bg-blue-900 dark:hover:bg-blue-800" onClick={() => { handleRoleChange(confirmRoleChange.emp, confirmRoleChange.newRole); setConfirmRoleChange(null); }}>Confirm</button>
            </div>
          </div>
        </div>
      )}
      {/* Portal Dropdown */}
      {roleDropdownId && roleDropdownPos && ReactDOM.createPortal(
        <div
          className="absolute z-50 mt-2 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg"
          style={{
            position: 'absolute',
            top: roleDropdownPos.top,
            left: roleDropdownPos.left,
            width: roleDropdownPos.width
          }}
        >
          {ENABLED_ROLES.map(role => {
            const emp = employees.find(e => e.id === roleDropdownId);
            if (!emp) return null;
            return (
              <button
                key={role}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-gray-700 ${emp.role === role ? 'font-bold text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-100'}`}
                onClick={() => {
                  setRoleDropdownId(null);
                  setConfirmRoleChange({ emp, newRole: role });
                }}
                disabled={emp.role === role || roleLoadingId === emp.id}
              >
                {role}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
};

export default EmployeesPage; 
"use client";

import React, { useState, useMemo } from "react";
import Header from "@/app/(components)/Header";
import {
  Store,
  Printer,
  Receipt,
  CreditCard,
  Bell,
  User,
  Shield,
  Settings2,
  Search,
  Save,
  HelpCircle,
  LogOut,
  Eye,
  Percent,
  FileText,
} from "lucide-react";
import { toast } from "react-hot-toast";

// Eyewear SVG icon from svgrepo.com
const EyewearIcon = () => (
  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="40" r="12" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="48" cy="40" r="12" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M4 40c0-6 4-12 12-12m32 0c8 0 12 6 12 12" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M28 40h8" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

type UserSetting = {
  id: string;
  label: string;
  value: string | boolean;
  type: "text" | "toggle" | "select" | "number";
  category: "store" | "pos" | "inventory" | "security" | "billing" | "prescription";
  description?: string;
  options?: string[];
  icon: React.ReactNode;
  subcategory?: string;
};

const mockSettings: UserSetting[] = [
  // Store Settings
  {
    id: "storeName",
    label: "Store Name",
    value: "Vision Loop Opticals",
    type: "text",
    category: "store",
    description: "Your store's display name",
    icon: <Store className="w-5 h-5" />,
  },
  {
    id: "storeAddress",
    label: "Store Address",
    value: "123 Vision Street, Pune, India",
    type: "text",
    category: "store",
    description: "Your store's physical address",
    icon: <Store className="w-5 h-5" />,
  },
  {
    id: "storePhone",
    label: "Store Phone",
    value: "9898983298",
    type: "text",
    category: "store",
    description: "Your store's contact number",
    icon: <Store className="w-5 h-5" />,
  },

  // POS Settings
  {
    id: "taxRate",
    label: "Tax Rate",
    value: "8",
    type: "number",
    category: "pos",
    description: "Default tax rate percentage",
    icon: <Percent className="w-5 h-5" />,
  },
  {
    id: "receiptHeader",
    label: "Receipt Header",
    value: "Vision Loop Opticals - Thank you for your business!",
    type: "text",
    category: "pos",
    description: "Text to display at the top of receipts",
    icon: <Receipt className="w-5 h-5" />,
  },
  {
    id: "receiptFooter",
    label: "Receipt Footer",
    value: "Please keep this receipt for your records",
    type: "text",
    category: "pos",
    description: "Text to display at the bottom of receipts",
    icon: <Receipt className="w-5 h-5" />,
  },
  {
    id: "defaultPrinter",
    label: "Default Receipt Printer",
    value: "Main Printer",
    type: "select",
    category: "pos",
    description: "Select your default receipt printer",
    options: ["Main Printer", "Backup Printer", "Kitchen Printer"],
    icon: <Printer className="w-5 h-5" />,
  },

  // Inventory Settings
  {
    id: "lowStockAlert",
    label: "Low Stock Alert",
    value: "5",
    type: "number",
    category: "inventory",
    description: "Alert when stock falls below this number",
    icon: <EyewearIcon />,
  },
  {
    id: "autoReorder",
    label: "Auto Reorder",
    value: true,
    type: "toggle",
    category: "inventory",
    description: "Automatically create purchase orders for low stock items",
    icon: <EyewearIcon />,
  },
  {
    id: "stockTracking",
    label: "Stock Tracking",
    value: true,
    type: "toggle",
    category: "inventory",
    description: "Enable real-time stock tracking",
    icon: <EyewearIcon />,
  },

  // Prescription Settings
  {
    id: "prescriptionExpiryAlert",
    label: "Prescription Expiry Alert",
    value: "30",
    type: "number",
    category: "prescription",
    description: "Days before prescription expiry to send alert",
    icon: <Eye className="w-5 h-5" />,
  },
  {
    id: "autoPrescriptionReminder",
    label: "Auto Prescription Reminder",
    value: true,
    type: "toggle",
    category: "prescription",
    description: "Send automatic reminders for prescription updates",
    icon: <Eye className="w-5 h-5" />,
  },
  {
    id: "prescriptionFormat",
    label: "Prescription Format",
    value: "Standard",
    type: "select",
    category: "prescription",
    description: "Default prescription format",
    options: ["Standard", "Detailed", "Simple"],
    icon: <FileText className="w-5 h-5" />,
  },

  // Billing Settings
  {
    id: "paymentMethods",
    label: "Enabled Payment Methods",
    value: "cash,card,upi",
    type: "select",
    category: "billing",
    description: "Select available payment methods",
    options: ["cash", "card", "upi", "netbanking"],
    icon: <CreditCard className="w-5 h-5" />,
  },
  {
    id: "invoicePrefix",
    label: "Invoice Prefix",
    value: "INV-",
    type: "text",
    category: "billing",
    description: "Prefix for invoice numbers",
    icon: <Receipt className="w-5 h-5" />,
  },
  {
    id: "enableDiscounts",
    label: "Enable Discounts",
    value: true,
    type: "toggle",
    category: "billing",
    description: "Allow discounts on sales",
    icon: <Percent className="w-5 h-5" />,
  },

  // Security Settings
  {
    id: "userAccess",
    label: "User Access Control",
    value: true,
    type: "toggle",
    category: "security",
    description: "Enable role-based access control",
    icon: <Shield className="w-5 h-5" />,
  },
  {
    id: "auditLog",
    label: "Audit Log",
    value: true,
    type: "toggle",
    category: "security",
    description: "Keep track of all system activities",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    id: "sessionTimeout",
    label: "Session Timeout",
    value: "30",
    type: "number",
    category: "security",
    description: "Minutes before automatic logout",
    icon: <Shield className="w-5 h-5" />,
  },
];

const Settings = () => {
  const [userSettings, setUserSettings] = useState<UserSetting[]>(mockSettings);
  const [activeCategory, setActiveCategory] = useState<string>("store");
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  const handleToggleChange = (index: number) => {
    const settingsCopy = [...userSettings];
    settingsCopy[index].value = !settingsCopy[index].value as boolean;
    setUserSettings(settingsCopy);
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Settings saved successfully!");
    }, 1000);
  };

  const categories = [
    { id: "store", label: "Store", icon: <Store className="w-5 h-5" /> },
    { id: "pos", label: "POS", icon: <Receipt className="w-5 h-5" /> },
    { id: "inventory", label: "Inventory", icon: <EyewearIcon /> },
    { id: "prescription", label: "Prescription", icon: <Eye className="w-5 h-5" /> },
    { id: "billing", label: "Billing", icon: <CreditCard className="w-5 h-5" /> },
    { id: "security", label: "Security", icon: <Shield className="w-5 h-5" /> },
  ];

  const filteredSettings = useMemo(() => {
    return userSettings.filter((setting) => {
      const matchesCategory = setting.category === activeCategory;
      const matchesSearch = searchTerm === "" || 
        setting.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        setting.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [userSettings, activeCategory, searchTerm]);

  const handleLogout = () => {
    // Implement logout logic
    toast.success("Logged out successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Store Settings</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <nav className="p-4 space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeCategory === category.id
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {category.icon}
                  <span className="font-medium">{category.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {categories.find((c) => c.id === activeCategory)?.label}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage your {categories.find((c) => c.id === activeCategory)?.label.toLowerCase()} settings
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <HelpCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search settings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredSettings.map((setting, index) => (
                <div
                  key={setting.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
                      {setting.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {setting.label}
                      </h3>
                      {setting.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {setting.description}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {setting.type === "toggle" ? (
                        <label className="inline-flex relative items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={setting.value as boolean}
                            onChange={() => handleToggleChange(index)}
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 transition peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      ) : setting.type === "select" ? (
                        <select
                          className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={setting.value as string}
                          onChange={(e) => {
                            const settingsCopy = [...userSettings];
                            settingsCopy[index].value = e.target.value;
                            setUserSettings(settingsCopy);
                          }}
                        >
                          {setting.options?.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={setting.type}
                          className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={setting.value as string}
                          onChange={(e) => {
                            const settingsCopy = [...userSettings];
                            settingsCopy[index].value = e.target.value;
                            setUserSettings(settingsCopy);
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Help Modal */}
            {showHelp && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
                  <h3 className="text-xl font-semibold mb-4">Store Settings Help</h3>
                  <p className="text-gray-600 mb-4">
                    Configure your store settings to optimize your eyewear retail operations. Use the sidebar to navigate between different categories, and the search bar to quickly find specific settings.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">• Store: Basic store information and contact details</p>
                    <p className="text-sm text-gray-500">• POS: Receipt and transaction settings</p>
                    <p className="text-sm text-gray-500">• Inventory: Stock management and alerts</p>
                    <p className="text-sm text-gray-500">• Prescription: Eye prescription management</p>
                    <p className="text-sm text-gray-500">• Billing: Payment methods and invoice settings</p>
                    <p className="text-sm text-gray-500">• Security: User access and system security</p>
                  </div>
                  <button
                    onClick={() => setShowHelp(false)}
                    className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Got it
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
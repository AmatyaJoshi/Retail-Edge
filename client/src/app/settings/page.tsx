"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Header from "@/app/components/Header";
import {
  Store,
  Printer,
  Receipt,
  CreditCard,
  Bell,
  User,
  Shield,
  Search,
  Save,
  HelpCircle,
  LogOut,
  Eye,
  Percent,
  FileText,
  Image as ImageIcon,
  Globe,
  Lock,
  Sun,
  Moon,
  Mail,
  Settings as SettingsIcon,
  Box,
  Monitor,
} from "lucide-react";
import { toast } from "react-hot-toast";
import LanguageSwitcher from "@/components/LanguageSwitcher";

// Eyewear SVG icon from svgrepo.com
const EyewearIcon = () => (
  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="40" r="12" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="48" cy="40" r="12" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M4 40c0-6 4-12 12-12m32 0c8 0 12 6 12 12" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M28 40h8" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

// 2. Define dropdown options for currency, timezone, language, etc.
const currencyOptions = ["INR", "USD", "EUR", "GBP", "JPY", "CNY", "AUD", "CAD"];
const timezoneOptions = ["Asia/Kolkata", "UTC", "America/New_York", "Europe/London", "Europe/Berlin", "Asia/Tokyo", "Australia/Sydney"];
const languageOptions = ["en", "hi", "fr", "de", "es", "zh", "ja"];
const dateFormatOptions = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];
const numberFormatOptions = ["##,##,###.##", "#,###.##", "###,###.##"];
const paymentMethods = ["cash", "card", "upi", "netbanking"];

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

// 3. Define all fields from the Stores model
const storeFields = [
  // General
  { id: "notes", label: "Notes", type: "textarea", section: "General", icon: <FileText className="w-5 h-5" /> },
  { id: "supportEmail", label: "Support Email", type: "text", section: "General", icon: <Mail className="w-5 h-5" /> },
  { id: "theme", label: "Theme", type: "select", options: ["Light", "Dark", "System"], section: "General", icon: <Sun className="w-5 h-5" /> },

  // Store Info
  { id: "name", label: "Store Name", type: "text", section: "Store Info", icon: <Store className="w-5 h-5" /> },
  { id: "owner", label: "Owner", type: "text", section: "Store Info", icon: <User className="w-5 h-5" /> },
  { id: "address", label: "Address", type: "text", section: "Store Info", icon: <Store className="w-5 h-5" /> },
  { id: "phone", label: "Phone", type: "text", section: "Store Info", icon: <Store className="w-5 h-5" /> },
  { id: "email", label: "Email", type: "text", section: "Store Info", icon: <Store className="w-5 h-5" /> },
  { id: "website", label: "Website", type: "text", section: "Store Info", icon: <Globe className="w-5 h-5" /> },
  // logoUrl moved to Appearance

  // Add more Store Info fields
  { id: "storeType", label: "Store Type", type: "select", options: ["Retail", "Wholesale", "Online"], section: "Store Info", icon: <Store className="w-5 h-5" /> },
  { id: "registrationNumber", label: "Registration Number", type: "text", section: "Store Info", icon: <FileText className="w-5 h-5" /> },

  // Localization
  { id: "timezone", label: "Timezone", type: "select", options: timezoneOptions, section: "Localization", icon: <Globe className="w-5 h-5" /> },
  { id: "currency", label: "Currency", type: "select", options: currencyOptions, section: "Localization", icon: <CreditCard className="w-5 h-5" /> },
  { id: "language", label: "Language", type: "select", options: languageOptions, section: "Localization", icon: <Globe className="w-5 h-5" /> },
  { id: "dateFormat", label: "Date Format", type: "select", options: dateFormatOptions, section: "Localization", icon: <FileText className="w-5 h-5" /> },
  { id: "numberFormat", label: "Number Format", type: "select", options: numberFormatOptions, section: "Localization", icon: <FileText className="w-5 h-5" /> },

  // POS
  { id: "defaultPaymentMethod", label: "Default Payment Method", type: "select", options: paymentMethods, section: "POS", icon: <CreditCard className="w-5 h-5" /> },
  { id: "taxRate", label: "Tax Rate (%)", type: "number", section: "POS", icon: <Percent className="w-5 h-5" /> },
  { id: "invoicePrefix", label: "Invoice Prefix", type: "text", section: "POS", icon: <Receipt className="w-5 h-5" /> },
  { id: "receiptFooter", label: "Receipt Footer", type: "text", section: "POS", icon: <Receipt className="w-5 h-5" /> },

  // Add more POS fields
  { id: "posDeviceId", label: "POS Device ID", type: "text", section: "POS", icon: <Monitor className="w-5 h-5" /> },
  { id: "enableQuickSale", label: "Enable Quick Sale", type: "toggle", section: "POS", icon: <Monitor className="w-5 h-5" /> },

  // Inventory
  { id: "lowStockThreshold", label: "Low Stock Threshold", type: "number", section: "Inventory", icon: <Eye className="w-5 h-5" /> },
  { id: "autoReorder", label: "Auto Reorder", type: "toggle", section: "Inventory", icon: <SettingsIcon className="w-5 h-5" /> },

  // Add more Inventory fields
  { id: "inventoryValuationMethod", label: "Valuation Method", type: "select", options: ["FIFO", "LIFO", "Weighted Average"], section: "Inventory", icon: <Box className="w-5 h-5" /> },
  { id: "allowNegativeStock", label: "Allow Negative Stock", type: "toggle", section: "Inventory", icon: <Box className="w-5 h-5" /> },

  // Security
  { id: "sessionTimeout", label: "Session Timeout (min)", type: "number", section: "Security", icon: <Lock className="w-5 h-5" /> },
  { id: "enable2FA", label: "Enable 2FA", type: "toggle", section: "Security", icon: <Shield className="w-5 h-5" /> },
  { id: "roleBasedAccess", label: "Role-based Access", type: "toggle", section: "Security", icon: <Shield className="w-5 h-5" /> },

  // Add more Security fields
  { id: "passwordPolicy", label: "Password Policy", type: "select", options: ["Standard", "Strong", "Custom"], section: "Security", icon: <Lock className="w-5 h-5" /> },
  { id: "loginAlerts", label: "Login Alerts", type: "toggle", section: "Security", icon: <Bell className="w-5 h-5" /> },

  // Billing
  { id: "gstNumber", label: "GST Number", type: "text", section: "Billing", icon: <FileText className="w-5 h-5" /> },
  { id: "taxId", label: "Tax ID", type: "text", section: "Billing", icon: <FileText className="w-5 h-5" /> },

  // Add more Billing fields
  { id: "billingCycle", label: "Billing Cycle", type: "select", options: ["Monthly", "Quarterly", "Yearly"], section: "Billing", icon: <CreditCard className="w-5 h-5" /> },
  { id: "autoBilling", label: "Auto Billing", type: "toggle", section: "Billing", icon: <CreditCard className="w-5 h-5" /> },

  // Notifications
  { id: "notificationEmail", label: "Notification Email", type: "text", section: "Notifications", icon: <Mail className="w-5 h-5" /> },
  { id: "sendLowStockEmail", label: "Send Low Stock Email", type: "toggle", section: "Notifications", icon: <Mail className="w-5 h-5" /> },

  // Add more Notifications fields
  { id: "enablePushNotifications", label: "Enable Push Notifications", type: "toggle", section: "Notifications", icon: <Bell className="w-5 h-5" /> },
  { id: "dailySummaryEmail", label: "Daily Summary Email", type: "toggle", section: "Notifications", icon: <Mail className="w-5 h-5" /> },

  // Appearance
  { id: "logoUrl", label: "Store Logo", type: "logo", section: "Appearance", icon: <ImageIcon className="w-5 h-5" /> },
  { id: "primaryColor", label: "Primary Color", type: "text", section: "Appearance", icon: <ImageIcon className="w-5 h-5" /> },
  { id: "fontFamily", label: "Font Family", type: "text", section: "Appearance", icon: <ImageIcon className="w-5 h-5" /> },
];

const initialStoreState = storeFields.reduce<Record<string, string>>((acc, f) => {
  acc[f.id] = "";
  return acc;
}, {});

// Map sidebar category IDs to storeFields section names
const categorySectionMap = {
  store: ["Store Info", "Localization"],
  general: ["General"],
  pos: ["POS"],
  inventory: ["Inventory"],
  billing: ["Billing"],
  security: ["Security"],
  notifications: ["Notifications"],
  appearance: ["Appearance"],
};

const Settings = () => {
  // const t = useTranslations(); // Removed next-intl usage
  const [store, setStore] = useState<Record<string, string>>(initialStoreState);
  const [storeLogo, setStoreLogo] = useState<File | null>(null);
  const [storeLogoPreview, setStoreLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("store");
  const [searchTerm, setSearchTerm] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/store`)
      .then(res => res.json())
      .then(data => {
        const mapped: Record<string, string> = { ...initialStoreState };
        storeFields.forEach(f => { mapped[f.id] = data[f.id] || ""; });
        setStore(mapped);
        setStoreLogoPreview(data.logoUrl ? `/` + data.logoUrl.replace(/^\//, "") : null);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load store settings");
        setLoading(false);
      });
  }, []);

  const handleStoreChange = (id: string, value: string) => {
    setStore((prev) => ({ ...prev, [id]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStoreLogo(file);
      setStoreLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      storeFields.forEach(f => {
        if (f.type !== "logo") formData.append(f.id, store[f.id] ?? "");
      });
      if (storeLogo) formData.append("logo", storeLogo);
      const res = await fetch(`${API_BASE}/store`, {
        method: "PATCH",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to save settings");
      const data = await res.json();
      toast.success("Settings saved successfully!");
      setStoreLogo(null);
      setStoreLogoPreview(data.logoUrl ? `/` + data.logoUrl.replace(/^\//, "") : null);
      // Update store state with backend response
      const mapped: Record<string, string> = { ...initialStoreState };
      storeFields.forEach(f => { mapped[f.id] = data[f.id] || ""; });
      setStore(mapped);
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const categories = [
    { id: "general", label: "General", icon: <SettingsIcon className="w-5 h-5" /> },
    { id: "store", label: "Store", icon: <Store className="w-5 h-5" /> },
    { id: "pos", label: "POS", icon: <Monitor className="w-5 h-5" /> },
    { id: "inventory", label: "Inventory", icon: <Box className="w-5 h-5" /> },
    { id: "billing", label: "Billing", icon: <CreditCard className="w-5 h-5" /> },
    { id: "security", label: "Security", icon: <Shield className="w-5 h-5" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="w-5 h-5" /> },
    { id: "appearance", label: "Appearance", icon: <ImageIcon className="w-5 h-5" /> },
  ];

  const filteredSettings = useMemo(() => {
    type CategoryKey = keyof typeof categorySectionMap;
    const sections = categorySectionMap[activeCategory as CategoryKey] || [];
    return storeFields.filter((setting) => {
      const matchesCategory = sections.includes(setting.section);
      const matchesSearch = searchTerm === "" || 
        setting.label.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchTerm]);

  const handleLogout = () => {
    // Implement logout logic
    toast.success("Logged out successfully!");
  };

  return (
    <div className="min-h-screen w-full flex bg-gray-50 dark:bg-gray-900 dark:text-gray-100">
      <aside className="w-64 min-h-screen h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-6 flex flex-col pt-8">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-3 py-2 mb-6 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-white border border-transparent transition-colors"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium text-white">Back</span>
        </button>
          <div className="p-4 border-b border-gray-200 flex items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Settings</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <nav className="p-4 space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg mb-2 text-left font-semibold transition-colors duration-150 ${activeCategory === category.id ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-100'}`}
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
        </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen h-full p-8 pt-24 overflow-y-auto custom-scrollbar bg-white dark:bg-gray-900">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {categories.find((c) => c.id === activeCategory)?.label}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                  Manage your {categories.find((c) => c.id === activeCategory)?.label.toLowerCase()} settings
                </p>
              </div>
              <div className="flex items-center gap-4">
              <LanguageSwitcher />
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <HelpCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSave}
                disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                {saving ? (
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
              <div className="relative bg-white dark:bg-gray-900 rounded-lg">
                <input
                  type="text"
                  placeholder="Search settings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSettings.map((setting: typeof storeFields[number]) => (
                <div
                  key={setting.id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex flex-col h-full group"
                >
                  <div className="p-6 flex flex-col h-full">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-blue-50 dark:bg-gray-700 rounded-xl text-blue-600 dark:text-blue-300 transition-all duration-200">
                        {setting.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-1">
                          {setting.label}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-end">
                      {setting.type === "logo" ? (
                        <div className="flex flex-col items-center gap-4">
                          {storeLogoPreview && (
                            <div className="w-20 h-20 bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden shadow-sm">
                              <img
                                src={storeLogoPreview}
                                alt="Store Logo Preview"
                                className="w-full h-full object-contain"
                              />
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            onChange={handleLogoChange}
                          />
                          <button
                            type="button"
                            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            {storeLogoPreview ? "Change Logo" : "Upload Logo"}
                          </button>
                        </div>
                      ) : setting.type === "toggle" ? (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-100">Enable/Disable</span>
                          <label className="inline-flex relative items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={store[setting.id] === "true"}
                              onChange={(e) => handleStoreChange(setting.id, e.target.checked ? "true" : "false")}
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 transition peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ) : setting.type === "select" ? (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-100">Select Option</label>
                          <select
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 focus:border-blue-500"
                            value={store[setting.id]}
                            onChange={(e) => handleStoreChange(setting.id, e.target.value)}
                          >
                            {setting.options?.map((option: string) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-100">Enter Value</label>
                          <input
                            type={setting.type}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 focus:border-blue-500"
                            value={store[setting.id]}
                            onChange={(e) => handleStoreChange(setting.id, e.target.value)}
                            placeholder={`Enter ${setting.label.toLowerCase()}`}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Help Modal */}
            {showHelp && (
              <div
                className="fixed inset-0 flex items-center justify-center z-50"
                onClick={() => setShowHelp(false)}
              >
                <div
                  className="bg-white dark:bg-gray-900 dark:text-gray-100 rounded-xl p-6 max-w-lg w-full mx-4 border border-gray-200 dark:border-gray-700"
                  onClick={e => e.stopPropagation()}
                >
                  <h3 className="text-xl font-semibold mb-4">Store Settings Help</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Configure your store settings to optimize your eyewear retail operations. Use the sidebar to navigate between different categories, and the search bar to quickly find specific settings.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500 dark:text-gray-300">• Store: Basic store information and contact details</p>
                    <p className="text-sm text-gray-500 dark:text-gray-300">• POS: Receipt and transaction settings</p>
                    <p className="text-sm text-gray-500 dark:text-gray-300">• Inventory: Stock management and alerts</p>
                    <p className="text-sm text-gray-500 dark:text-gray-300">• Prescription: Eye prescription management</p>
                    <p className="text-sm text-gray-500 dark:text-gray-300">• Billing: Payment methods and invoice settings</p>
                    <p className="text-sm text-gray-500 dark:text-gray-300">• Security: User access and system security</p>
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
        </main>
    </div>
  );
};

export default Settings;
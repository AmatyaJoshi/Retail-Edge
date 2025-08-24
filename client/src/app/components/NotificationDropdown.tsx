import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useNotifications, type Notification } from '../contexts/NotificationContext';
import { Bell, Check, Trash2, ShoppingCart, AlertTriangle, Info, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAppSelector } from '@/hooks/useAppSelector';

// small helpers used by the dropdown
const getNotificationColor = (type?: string) => {
  switch (type) {
    case 'success':
      return 'border-green-400';
    case 'info':
      return 'border-blue-400';
    case 'warning':
      return 'border-yellow-400';
    case 'error':
      return 'border-red-400';
    default:
      return 'border-gray-300';
  }
};

const getNotificationIcon = (type?: string) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    case 'info':
      return <Info className="w-5 h-5 text-blue-400" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    case 'order':
      return <ShoppingCart className="w-5 h-5 text-indigo-400" />;
    case 'error':
      return <XCircle className="w-5 h-5 text-red-400" />;
    default:
      return <Info className="w-5 h-5 text-gray-400" />;
  }
};

const formatTime = (timestamp?: string | number | Date) => {
  if (!timestamp) return '';
  try {
    const d = timestamp instanceof Date ? timestamp : typeof timestamp === 'number' ? new Date(timestamp) : new Date(Date.parse(String(timestamp)));
    return d.toLocaleString();
  } catch (e) {
    return String(timestamp);
  }
};

const NotificationDropdown = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    addSampleNotifications,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const bellRef = useRef<HTMLButtonElement | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  // mark mounted for portal usage
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-close dropdown when clicking outside (handles portal element too)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!isOpen) return;
      if (target) {
        const clickedInsideBell = bellRef.current?.contains(target as Node);
        const clickedInsidePortal = target.closest('.notification-dropdown-portal');
        if (!clickedInsideBell && !clickedInsidePortal) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // compute dropdown position when opening
  useEffect(() => {
    if (isOpen && bellRef.current) {
      const rect = bellRef.current.getBoundingClientRect();
      const dropdownWidth = 384; // w-96
      const gap = 8;
      const left = Math.min(Math.max(rect.left, gap), Math.max(window.innerWidth - dropdownWidth - gap, gap));
      const top = rect.bottom + gap;
      setPos({ top, left });
    }
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        ref={bellRef}
        onClick={() => setIsOpen((s) => !s)}
        className={`relative p-2.5 rounded-full transition-all duration-200 ${
          isDarkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
        }`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && mounted && ReactDOM.createPortal(
        <div
          className={`notification-dropdown-portal w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} z-[99999] transform transition-all duration-200 ease-out`}
          style={pos ? { position: 'fixed', top: pos.top, left: pos.left } : { position: 'fixed', right: 8, top: 64 }}
        >
          {/* Header */}
          <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bell className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 font-semibold">{unreadCount}</span>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={markAllAsRead} className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
                  Mark all read
                </button>
                <button onClick={clearAllNotifications} className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'}`}>
                  Clear all
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No notifications yet</p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>We'll notify you when something important happens</p>
              </div>
            ) : (
              notifications.map((notification: Notification) => (
                <div key={notification.id} className={`p-4 border-l-4 transition-all duration-200 hover:shadow-sm ${getNotificationColor(notification.type)} ${!notification.read ? `${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border-l-4` : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className={`font-semibold text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{notification.title}</h4>
                        <div className="flex items-center gap-1 text-xs text-gray-500"><Clock className="w-3 h-3" />{formatTime(notification.timestamp)}</div>
                      </div>
                      <p className={`text-sm mt-1 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{notification.message}</p>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3 mt-3">
                        {!notification.read && (
                          <button onClick={() => markAsRead(notification.id)} className={`text-xs font-medium flex items-center gap-1 transition-colors ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
                            <Check className="w-3 h-3" /> Mark as read
                          </button>
                        )}
                        <button onClick={() => removeNotification(notification.id)} className={`text-xs font-medium flex items-center gap-1 transition-colors ${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'}`}>
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className={`p-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{notifications.length} notification{notifications.length !== 1 ? 's' : ''}</p>
                <button onClick={addSampleNotifications} className={`text-xs font-medium px-2 py-1 rounded transition-colors ${isDarkMode ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20' : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'}`}>Demo</button>
              </div>
            </div>
          )}

          {/* Demo button when no notifications */}
          {notifications.length === 0 && (
            <div className={`p-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button onClick={addSampleNotifications} className={`w-full text-xs font-medium py-2 rounded transition-colors ${isDarkMode ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20' : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'}`}>Try Demo Notifications</button>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

export default NotificationDropdown;
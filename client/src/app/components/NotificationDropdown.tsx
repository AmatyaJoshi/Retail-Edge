import React, { useEffect, useState } from 'react';
import { useNotifications, type Notification } from '../contexts/NotificationContext';
import { Bell, Check, Trash2, ShoppingCart, AlertTriangle, Info, CheckCircle, XCircle, Clock, MoreHorizontal } from 'lucide-react';
import { useAppSelector } from '@/hooks/useAppSelector';

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
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  // Auto-close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && !(event.target as Element).closest('.notification-dropdown')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: Notification['type']) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case 'success':
        return <CheckCircle className={`${iconClass} text-green-500`} />;
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-yellow-500`} />;
      case 'error':
        return <XCircle className={`${iconClass} text-red-500`} />;
      default:
        return <Info className={`${iconClass} text-blue-500`} />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/10';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
      case 'error':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
      default:
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10';
    }
  };

  return (
    <div className="relative notification-dropdown">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-full transition-all duration-200 ${
          isDarkMode 
            ? 'hover:bg-gray-700 text-gray-300 hover:text-white' 
            : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
        }`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-3 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        } z-50 transform transition-all duration-200 ease-out`}>
          {/* Header */}
          <div className={`p-4 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bell className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 font-semibold">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={markAllAsRead}
                  className={`text-sm font-medium transition-colors ${
                    isDarkMode 
                      ? 'text-blue-400 hover:text-blue-300' 
                      : 'text-blue-600 hover:text-blue-700'
                  }`}
                >
                  Mark all read
                </button>
                <button
                  onClick={clearAllNotifications}
                  className={`text-sm font-medium transition-colors ${
                    isDarkMode 
                      ? 'text-red-400 hover:text-red-300' 
                      : 'text-red-600 hover:text-red-700'
                  }`}
                >
                  Clear all
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className={`w-12 h-12 mx-auto mb-3 ${
                  isDarkMode ? 'text-gray-600' : 'text-gray-400'
                }`} />
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No notifications yet
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  We'll notify you when something important happens
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 transition-all duration-200 hover:shadow-sm ${
                    getNotificationColor(notification.type)
                  } ${
                    !notification.read 
                      ? `${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border-l-4` 
                      : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className={`font-semibold text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {formatTime(notification.timestamp)}
                        </div>
                      </div>
                      <p className={`text-sm mt-1 leading-relaxed ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {notification.message}
                      </p>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-3 mt-3">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className={`text-xs font-medium flex items-center gap-1 transition-colors ${
                              isDarkMode 
                                ? 'text-blue-400 hover:text-blue-300' 
                                : 'text-blue-600 hover:text-blue-700'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => removeNotification(notification.id)}
                          className={`text-xs font-medium flex items-center gap-1 transition-colors ${
                            isDarkMode 
                              ? 'text-red-400 hover:text-red-300' 
                              : 'text-red-600 hover:text-red-700'
                          }`}
                        >
                          <Trash2 className="w-3 h-3" />
                          Remove
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
            <div className={`p-3 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex justify-between items-center">
                <p className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                </p>
                <button
                  onClick={addSampleNotifications}
                  className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                    isDarkMode 
                      ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20' 
                      : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  Demo
                </button>
              </div>
            </div>
          )}
          
          {/* Demo button when no notifications */}
          {notifications.length === 0 && (
            <div className={`p-3 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={addSampleNotifications}
                className={`w-full text-xs font-medium py-2 rounded transition-colors ${
                  isDarkMode 
                    ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20' 
                    : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                }`}
              >
                Try Demo Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown; 
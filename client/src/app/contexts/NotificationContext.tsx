import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  category?: 'sales' | 'inventory' | 'system' | 'user';
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addSampleNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Sample notifications for demonstration
const sampleNotifications = [
  {
    title: 'New Sale Completed',
    message: 'A new sale of ₹2,500 was completed successfully. Transaction ID: #TX-2024-001',
    type: 'success' as const,
    category: 'sales' as const,
  },
  {
    title: 'Low Stock Alert',
    message: '5 products are running low on stock. Check inventory management to restock.',
    type: 'warning' as const,
    category: 'inventory' as const,
  },
  {
    title: 'Welcome to Retail Edge',
    message: 'Your optical store management system is ready to use. Start by adding your first product!',
    type: 'info' as const,
    category: 'system' as const,
  },
  {
    title: 'Payment Received',
    message: 'Payment of ₹1,800 received for order #ORD-2024-015. Payment method: Cash',
    type: 'success' as const,
    category: 'sales' as const,
  },
  {
    title: 'Product Out of Stock',
    message: 'Ray-Ban Aviator Classic is now out of stock. Consider reordering soon.',
    type: 'error' as const,
    category: 'inventory' as const,
  },
  {
    title: 'System Update',
    message: 'New features have been added to your dashboard. Check out the improved analytics!',
    type: 'info' as const,
    category: 'system' as const,
  },
];

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const hasShownSamples = useRef(false);

  // Add sample notifications on first load
  useEffect(() => {
    if (!hasShownSamples.current) {
      const stored = localStorage.getItem('notificationSamplesShown');
      if (!stored) {
        // Add initial welcome notification
        const welcomeNotification: Notification = {
          id: Math.random().toString(36).substr(2, 9),
          title: 'Welcome to Retail Edge',
          message: 'Your optical store management system is ready to use. Start by adding your first product!',
          type: 'info',
          category: 'system',
          timestamp: new Date(),
          read: false,
        };
        
        setNotifications([welcomeNotification]);
        localStorage.setItem('notificationSamplesShown', 'true');
      }
      hasShownSamples.current = true;
    }
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      // Auto-remove old notifications (keep only last 50)
      return updated.slice(0, 50);
    });
  }, []);

  const addSampleNotifications = useCallback(() => {
    // Add a few sample notifications with delays to simulate real-time
    sampleNotifications.forEach((notification, index) => {
      setTimeout(() => {
        const newNotification: Notification = {
          ...notification,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
          read: false,
        };

        setNotifications(prev => {
          const updated = [newNotification, ...prev];
          return updated.slice(0, 50);
        });
      }, index * 2000); // Add each notification 2 seconds apart
    });
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== id)
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAllNotifications,
        addSampleNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
} 
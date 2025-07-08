import type React from 'react';
import { useState, useEffect } from 'react';
import { NotificationService, type Notification } from '../services/notifications';

interface NotificationCenterProps {
  customerId: string;
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ customerId, className = '' }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    // Subscribe to notification updates
    const unsubscribe = notificationService.subscribe(customerId, (newNotifications) => {
      setNotifications(newNotifications);
      setUnreadCount(notificationService.getUnreadCount(customerId));
    });

    // Request notification permission
    notificationService.requestPermission();

    return unsubscribe;
  }, [customerId, notificationService]);

  const handleMarkAsRead = (notificationId: string) => {
    notificationService.markAsRead(customerId, notificationId);
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead(customerId);
  };

  const handleDeleteNotification = (notificationId: string) => {
    notificationService.deleteNotification(customerId, notificationId);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'booking_confirmed': return '🎉';
      case 'payment_received': return '✅';
      case 'service_reminder': return '🕐';
      case 'service_started': return '🧹';
      case 'service_completed': return '✨';
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '📢';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'booking_confirmed': return 'border-green-200 bg-green-50';
      case 'payment_received': return 'border-blue-200 bg-blue-50';
      case 'service_reminder': return 'border-yellow-200 bg-yellow-50';
      case 'service_started': return 'border-purple-200 bg-purple-50';
      case 'service_completed': return 'border-green-200 bg-green-50';
      case 'error': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-orange-200 bg-orange-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMs = now.getTime() - notificationTime.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return notificationTime.toLocaleDateString();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5v-5a5 5 0 10-10 0v5l-5 5h5m0 0v1a3 3 0 006 0v-1m-6 0h6" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 text-xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className={`text-sm font-medium text-gray-900 ${!notification.read ? 'font-semibold' : ''}`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                          <button
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="text-gray-400 hover:text-gray-600 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">{formatTimeAgo(notification.timestamp)}</span>
                        <div className="flex space-x-2">
                          {notification.actionUrl && notification.actionText && (
                            <a
                              href={notification.actionUrl}
                              onClick={() => {
                                handleMarkAsRead(notification.id);
                                setIsOpen(false);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                            >
                              {notification.actionText}
                            </a>
                          )}
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-gray-500 hover:text-gray-700 text-xs"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center">
                <div className="text-gray-400 text-4xl mb-2">🔔</div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">No notifications</h4>
                <p className="text-xs text-gray-500">You're all caught up!</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 3 && (
            <div className="px-4 py-3 border-t border-gray-200 text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

// Toast notification component for immediate feedback
export const ToastNotification: React.FC<{
  notification: Notification;
  onClose: () => void;
}> = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getToastColor = (type: Notification['type']) => {
    switch (type) {
      case 'booking_confirmed':
      case 'service_completed':
        return 'bg-green-500 border-green-600';
      case 'payment_received':
        return 'bg-blue-500 border-blue-600';
      case 'service_reminder':
      case 'service_started':
        return 'bg-yellow-500 border-yellow-600';
      case 'error':
        return 'bg-red-500 border-red-600';
      case 'warning':
        return 'bg-orange-500 border-orange-600';
      default:
        return 'bg-gray-500 border-gray-600';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full ${getToastColor(notification.type)} text-white rounded-lg shadow-lg border-l-4 animate-slide-in`}>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-3">
            <span className="text-xl">{notification.type === 'booking_confirmed' ? '🎉' : '📢'}</span>
            <div className="flex-1">
              <h4 className="font-semibold text-sm">{notification.title}</h4>
              <p className="text-sm opacity-90 mt-1">{notification.message}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 ml-2"
          >
            ✕
          </button>
        </div>
        {notification.actionUrl && notification.actionText && (
          <div className="mt-3">
            <a
              href={notification.actionUrl}
              onClick={onClose}
              className="inline-block bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              {notification.actionText}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;

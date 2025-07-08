import React from 'react';

export interface Notification {
  id: string;
  customerId: string;
  type: 'welcome' | 'payment' | 'booking' | 'subscription' | 'reminder' | 'update' | 'service';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  icon?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// Convert from static class to functions
export const createNotification = (notification: Omit<Notification, 'id' | 'createdAt'>): void => {
  const newNotification: Notification = {
    ...notification,
    id: Math.random().toString(36).substring(2, 15),
    createdAt: new Date().toISOString()
  };

  // Store in localStorage
  const existingNotifications = getNotifications(notification.customerId);
  const updatedNotifications = [newNotification, ...existingNotifications];
  localStorage.setItem(`vip_notifications_${notification.customerId}`, JSON.stringify(updatedNotifications));

  // Show browser notification if supported and permitted
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    new Notification(newNotification.title, {
      body: newNotification.message,
      icon: '/favicon.ico',
      tag: newNotification.id,
      requireInteraction: newNotification.priority === 'high'
    });
  }

  console.log('📬 Notification created:', newNotification);
};

export const getNotifications = (customerId: string): Notification[] => {
  try {
    const stored = localStorage.getItem(`vip_notifications_${customerId}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const markAsRead = (customerId: string, notificationId: string): void => {
  const notifications = getNotifications(customerId);
  const updated = notifications.map(n =>
    n.id === notificationId ? { ...n, isRead: true } : n
  );
  localStorage.setItem(`vip_notifications_${customerId}`, JSON.stringify(updated));
};

export const markAllAsRead = (customerId: string): void => {
  const notifications = getNotifications(customerId);
  const updated = notifications.map(n => ({ ...n, isRead: true }));
  localStorage.setItem(`vip_notifications_${customerId}`, JSON.stringify(updated));
};

export const deleteNotification = (customerId: string, notificationId: string): void => {
  const notifications = getNotifications(customerId);
  const filtered = notifications.filter(n => n.id !== notificationId);
  localStorage.setItem(`vip_notifications_${customerId}`, JSON.stringify(filtered));
};

export const clearAllNotifications = (customerId: string): void => {
  localStorage.removeItem(`vip_notifications_${customerId}`);
};

export const getUnreadCount = (customerId: string): number => {
  try {
    const notifications = getNotifications(customerId);
    return notifications.filter(n => !n.isRead).length;
  } catch {
    return 0;
  }
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    const permission = await Notification.requestPermission();
    console.log('🔔 Notification permission:', permission);
    return permission;
  }
  return 'denied';
};

export const sendWelcomeEmail = async (customerData: {
  firstName: string;
  lastName: string;
  email: string;
}): Promise<boolean> => {
  try {
    const emailData = {
      service_id: 'service_abc123',
      template_id: 'template_welcome123',
      user_id: 'user_abc123',
      template_params: {
        to_name: `${customerData.firstName} ${customerData.lastName}`,
        to_email: customerData.email,
        from_name: 'VIP Cleaning Squad',
        message: `Welcome to VIP Cleaning Squad, ${customerData.firstName}! Your account has been created successfully.`
      }
    };

    console.log('📧 Sending welcome email to:', customerData.email);
    console.log('Email data:', emailData);

    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
};

export const sendBookingConfirmation = async (bookingData: {
  customerEmail: string;
  customerName: string;
  bookingNumber: string;
  serviceDate: string;
  serviceTime: string;
  serviceAddress: string;
  amount: number;
}): Promise<boolean> => {
  try {
    const emailData = {
      service_id: 'service_abc123',
      template_id: 'template_booking123',
      user_id: 'user_abc123',
      template_params: {
        to_name: bookingData.customerName,
        to_email: bookingData.customerEmail,
        booking_number: bookingData.bookingNumber,
        service_date: bookingData.serviceDate,
        service_time: bookingData.serviceTime,
        service_address: bookingData.serviceAddress,
        amount: bookingData.amount.toFixed(2),
        from_name: 'VIP Cleaning Squad'
      }
    };

    console.log('📧 Sending booking confirmation to:', bookingData.customerEmail);
    console.log('Booking confirmation data:', emailData);

    return true;
  } catch (error) {
    console.error('Failed to send booking confirmation:', error);
    return false;
  }
};

export const createWelcomeNotification = (customerId: string, firstName: string): void => {
  createNotification({
    customerId,
    type: 'welcome',
    title: `Welcome to VIP Cleaning Squad, ${firstName}!`,
    message: 'Your account has been created successfully. You can now book services and manage your cleaning schedule.',
    isRead: false,
    priority: 'medium',
    icon: '🎉',
    actionUrl: '/?page=dashboard'
  });
};

export const createPaymentConfirmation = (customerId: string, amount: number, transactionId: string): void => {
  createNotification({
    customerId,
    type: 'payment',
    title: 'Payment Confirmed',
    message: `Your payment of $${amount.toFixed(2)} CAD has been processed successfully.`,
    isRead: false,
    priority: 'high',
    icon: '💳',
    metadata: { transactionId, amount }
  });
};

export const createBookingConfirmation = (customerId: string, bookingNumber: string, serviceDate: string): void => {
  createNotification({
    customerId,
    type: 'booking',
    title: 'Service Booked Successfully',
    message: `Your cleaning service has been confirmed for ${serviceDate}. Booking number: ${bookingNumber}`,
    isRead: false,
    priority: 'high',
    icon: '📅',
    metadata: { bookingNumber, serviceDate }
  });
};

export const createSubscriptionConfirmation = (customerId: string, subscriptionId: string, frequency: string, nextBillingDate: string): void => {
  createNotification({
    customerId,
    type: 'subscription',
    title: 'Subscription Activated',
    message: `Your ${frequency.toLowerCase()} cleaning subscription is now active. Next billing: ${nextBillingDate}`,
    isRead: false,
    priority: 'high',
    icon: '🔄',
    actionUrl: '/?page=dashboard',
    metadata: { subscriptionId, frequency, nextBillingDate }
  });
};

export const createServiceReminder = (customerId: string, serviceDate: string, serviceTime: string): void => {
  createNotification({
    customerId,
    type: 'reminder',
    title: 'Upcoming Cleaning Service',
    message: `Your cleaning service is scheduled for ${serviceDate} at ${serviceTime}. Our team will arrive on time!`,
    isRead: false,
    priority: 'medium',
    icon: '⏰',
    metadata: { serviceDate, serviceTime }
  });
};

export const createServiceUpdate = (customerId: string, title: string, message: string, metadata?: Record<string, unknown>): void => {
  createNotification({
    customerId,
    type: 'update',
    title,
    message,
    isRead: false,
    priority: 'medium',
    icon: '📢',
    metadata
  });
};

export const createSubscriptionUpdate = (customerId: string, subscriptionId: string, updateType: 'paused' | 'resumed' | 'cancelled' | 'modified', details?: string): void => {
  const messages = {
    paused: 'Your subscription has been paused. You can resume it anytime from your dashboard.',
    resumed: 'Your subscription has been resumed. Regular cleaning services will continue.',
    cancelled: 'Your subscription has been cancelled. Thank you for being a valued customer.',
    modified: details || 'Your subscription has been updated successfully.'
  };

  createNotification({
    customerId,
    type: 'subscription',
    title: `Subscription ${updateType.charAt(0).toUpperCase() + updateType.slice(1)}`,
    message: messages[updateType],
    isRead: false,
    priority: updateType === 'cancelled' ? 'high' : 'medium',
    icon: updateType === 'cancelled' ? '❌' : '🔄',
    actionUrl: '/?page=dashboard',
    metadata: { subscriptionId, updateType, details }
  });
};

export const createPaymentFailure = (customerId: string, subscriptionId: string, amount: number, retryDate?: string): void => {
  const message = retryDate
    ? `Payment of $${amount.toFixed(2)} CAD failed. We'll retry on ${retryDate}. Please update your payment method.`
    : `Payment of $${amount.toFixed(2)} CAD failed. Please update your payment method to continue service.`;

  createNotification({
    customerId,
    type: 'payment',
    title: 'Payment Failed',
    message,
    isRead: false,
    priority: 'high',
    icon: '⚠️',
    actionUrl: '/?page=dashboard',
    metadata: { subscriptionId, amount, retryDate, type: 'failure' }
  });
};

export const createServiceComplete = (customerId: string, bookingNumber: string, teamName?: string): void => {
  const message = teamName
    ? `Your cleaning service has been completed by ${teamName}. We hope you're satisfied with the results!`
    : 'Your cleaning service has been completed successfully. We hope you\'re satisfied with the results!';

  createNotification({
    customerId,
    type: 'service',
    title: 'Service Completed',
    message,
    isRead: false,
    priority: 'medium',
    icon: '✅',
    metadata: { bookingNumber, teamName, type: 'completed' }
  });
};

// NotificationCenter component for display
export const NotificationCenter: React.FC<{ customerId: string }> = ({ customerId }) => {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    const loadNotifications = () => {
      const userNotifications = getNotifications(customerId);
      setNotifications(userNotifications);
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [customerId]);

  const unreadCount = getUnreadCount(customerId);

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(customerId, notificationId);
    setNotifications(prev => prev.map(n =>
      n.id === notificationId ? { ...n, isRead: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead(customerId);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleDelete = (notificationId: string) => {
    deleteNotification(customerId, notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5a50.37 50.37 0 00-7-7V4a3 3 0 10-6 0v2.5a50.37 50.37 0 00-7 7L2 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-blue-600 text-sm hover:text-blue-700"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 ${!notification.isRead ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        {notification.icon && <span className="text-lg">{notification.icon}</span>}
                        <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h4>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col space-y-1">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-blue-600 text-xs hover:text-blue-700"
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="text-red-600 text-xs hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Notifications Service for VIP Cleaning Squad
export interface Notification {
  id: string;
  type: 'booking_confirmed' | 'payment_received' | 'service_reminder' | 'service_started' | 'service_completed' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  customerId?: string;
  relatedBookingId?: string;
  priority: 'low' | 'medium' | 'high';
}

export class NotificationService {
  private static instance: NotificationService;
  private listeners: ((notifications: Notification[]) => void)[] = [];

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Get all notifications for a customer
  getNotifications(customerId: string): Notification[] {
    try {
      const stored = localStorage.getItem(`vip_notifications_${customerId}`);
      const notifications = stored ? JSON.parse(stored) : [];
      return notifications.sort((a: Notification, b: Notification) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch {
      return [];
    }
  }

  // Add a new notification
  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Notification {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      timestamp: new Date().toISOString(),
      read: false
    };

    if (notification.customerId) {
      const existing = this.getNotifications(notification.customerId);
      const updated = [newNotification, ...existing];
      localStorage.setItem(`vip_notifications_${notification.customerId}`, JSON.stringify(updated));

      // Trigger browser notification if permission granted
      this.showBrowserNotification(newNotification);

      // Notify listeners
      this.notifyListeners(notification.customerId, updated);
    }

    return newNotification;
  }

  // Mark notification as read
  markAsRead(customerId: string, notificationId: string): void {
    const notifications = this.getNotifications(customerId);
    const updated = notifications.map(notif =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
    localStorage.setItem(`vip_notifications_${customerId}`, JSON.stringify(updated));
    this.notifyListeners(customerId, updated);
  }

  // Mark all notifications as read
  markAllAsRead(customerId: string): void {
    const notifications = this.getNotifications(customerId);
    const updated = notifications.map(notif => ({ ...notif, read: true }));
    localStorage.setItem(`vip_notifications_${customerId}`, JSON.stringify(updated));
    this.notifyListeners(customerId, updated);
  }

  // Delete a notification
  deleteNotification(customerId: string, notificationId: string): void {
    const notifications = this.getNotifications(customerId);
    const updated = notifications.filter(notif => notif.id !== notificationId);
    localStorage.setItem(`vip_notifications_${customerId}`, JSON.stringify(updated));
    this.notifyListeners(customerId, updated);
  }

  // Get unread count
  getUnreadCount(customerId: string): number {
    const notifications = this.getNotifications(customerId);
    return notifications.filter(notif => !notif.read).length;
  }

  // Subscribe to notification changes
  subscribe(customerId: string, callback: (notifications: Notification[]) => void): () => void {
    this.listeners.push(callback);

    // Send initial data
    callback(this.getNotifications(customerId));

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners
  private notifyListeners(customerId: string, notifications: Notification[]): void {
    for (const listener of this.listeners) {
      listener(notifications);
    }
  }

  // Show browser notification
  private showBrowserNotification(notification: Notification): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotif = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id
      });

      browserNotif.onclick = () => {
        window.focus();
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
      };

      // Auto close after 5 seconds
      setTimeout(() => browserNotif.close(), 5000);
    }
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Predefined notification creators
  static createBookingConfirmation(customerId: string, bookingNumber: string, serviceDate: string): Notification {
    const service = NotificationService.getInstance();
    return service.addNotification({
      type: 'booking_confirmed',
      title: 'Booking Confirmed! 🎉',
      message: `Your cleaning service (${bookingNumber}) has been confirmed for ${new Date(serviceDate).toLocaleDateString()}.`,
      customerId,
      relatedBookingId: bookingNumber,
      priority: 'high',
      actionUrl: '/?page=dashboard',
      actionText: 'View Booking'
    });
  }

  static createPaymentConfirmation(customerId: string, amount: number, transactionId: string): Notification {
    const service = NotificationService.getInstance();
    return service.addNotification({
      type: 'payment_received',
      title: 'Payment Received ✅',
      message: `Your payment of $${amount.toFixed(2)} has been successfully processed. Transaction ID: ${transactionId}`,
      customerId,
      priority: 'medium',
      actionUrl: '/?page=dashboard',
      actionText: 'View Payment'
    });
  }

  static createServiceReminder(customerId: string, bookingNumber: string, serviceDate: string, hours: number): Notification {
    const service = NotificationService.getInstance();
    return service.addNotification({
      type: 'service_reminder',
      title: "Service Reminder 🕐",
      message: `Your cleaning service (${bookingNumber}) is scheduled in ${hours} hours on ${new Date(serviceDate).toLocaleDateString()}.`,
      customerId,
      relatedBookingId: bookingNumber,
      priority: 'medium',
      actionUrl: '/?page=dashboard',
      actionText: 'View Details'
    });
  }

  static createServiceStarted(customerId: string, bookingNumber: string, teamName: string): Notification {
    const service = NotificationService.getInstance();
    return service.addNotification({
      type: 'service_started',
      title: 'Service Started 🧹',
      message: `${teamName} has started your cleaning service (${bookingNumber}). Estimated completion in 2-3 hours.`,
      customerId,
      relatedBookingId: bookingNumber,
      priority: 'high',
      actionUrl: '/?page=dashboard',
      actionText: 'Track Progress'
    });
  }

  static createServiceCompleted(customerId: string, bookingNumber: string, teamName: string): Notification {
    const service = NotificationService.getInstance();
    return service.addNotification({
      type: 'service_completed',
      title: 'Service Completed! ✨',
      message: `${teamName} has completed your cleaning service (${bookingNumber}). We hope you love your clean space!`,
      customerId,
      relatedBookingId: bookingNumber,
      priority: 'high',
      actionUrl: '/?page=dashboard',
      actionText: 'Rate Service'
    });
  }

  static createWelcomeNotification(customerId: string, firstName: string): Notification {
    const service = NotificationService.getInstance();
    return service.addNotification({
      type: 'info',
      title: `Welcome to VIP Cleaning Squad, ${firstName}! 👋`,
      message: 'Thank you for joining us! Your account is ready. Book your first cleaning service today.',
      customerId,
      priority: 'medium',
      actionUrl: '/',
      actionText: 'Book Service'
    });
  }
}

export default NotificationService;

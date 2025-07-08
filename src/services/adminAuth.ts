// Admin Authentication Service
export interface Admin {
  id: string;
  username: string;
  email: string;
  role: 'super_admin' | 'admin' | 'manager';
  permissions: string[];
  lastLogin: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminSession {
  token: string;
  admin: Admin;
  expiresAt: string;
}

export interface Transaction {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceType: 'residential' | 'commercial';
  amount: number;
  paymentMethod: 'paypal';
  paypalOrderId: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  createdAt: string;
  serviceDate: string;
  serviceTime: string;
  serviceAddress: string;
  serviceArea: string;
  addOns: string[];
  frequency: string;
  bookingNumber: string;
  notes?: string;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceType: 'residential' | 'commercial';
  serviceDate: string;
  serviceTime: string;
  serviceAddress: string;
  serviceArea: string;
  amount: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  assignedTeam?: string;
  cleaningType: string;
  frequency: string;
  addOns: string[];
  specialInstructions?: string;
  customerRating?: number;
  customerFeedback?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Mock data for demo purposes
const DEMO_ADMIN: Admin = {
  id: 'admin_001',
  username: 'vip_admin',
  email: 'admin@vipcleaningsquad.ca',
  role: 'super_admin',
  permissions: ['view_transactions', 'manage_bookings', 'manage_customers', 'system_settings'],
  lastLogin: new Date().toISOString(),
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z'
};

export class AdminAuthService {
  private static instance: AdminAuthService;
  private currentSession: AdminSession | null = null;

  static getInstance(): AdminAuthService {
    if (!AdminAuthService.instance) {
      AdminAuthService.instance = new AdminAuthService();
    }
    return AdminAuthService.instance;
  }

  async login(username: string, password: string): Promise<AdminSession | null> {
    try {
      // Demo login - in production this would validate against your admin database
      if (username === 'vip_admin' && password === 'VIPClean2024!') {
        const session: AdminSession = {
          token: `admin_token_${Date.now()}_${Math.random().toString(36).substring(2)}`,
          admin: DEMO_ADMIN,
          expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() // 8 hours
        };

        this.currentSession = session;
        localStorage.setItem('vip_admin_session', JSON.stringify(session));
        return session;
      }

      return null;
    } catch (error) {
      console.error('Admin login error:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    this.currentSession = null;
    localStorage.removeItem('vip_admin_session');
  }

  getCurrentSession(): AdminSession | null {
    if (this.currentSession) {
      return this.currentSession;
    }

    // Try to restore from localStorage
    const stored = localStorage.getItem('vip_admin_session');
    if (stored) {
      try {
        const session = JSON.parse(stored) as AdminSession;

        // Check if session is expired
        if (new Date(session.expiresAt) > new Date()) {
          this.currentSession = session;
          return session;
        }
        localStorage.removeItem('vip_admin_session');
      } catch (error) {
        localStorage.removeItem('vip_admin_session');
      }
    }

    return null;
  }

  isAuthenticated(): boolean {
    return this.getCurrentSession() !== null;
  }

  hasPermission(permission: string): boolean {
    const session = this.getCurrentSession();
    return session?.admin.permissions.includes(permission) || false;
  }
}

export class AdminDataService {
  // Get transactions from local storage
  getStoredTransactions(): Transaction[] {
    try {
      const stored = localStorage.getItem('vip_admin_transactions');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Get bookings from local storage
  getStoredBookings(): Booking[] {
    try {
      const stored = localStorage.getItem('vip_admin_bookings');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  async getTransactions(): Promise<Transaction[]> {
    // Get transactions from local storage - in production, this would fetch from your database
    return this.getStoredTransactions();
  }

  async getBookings(): Promise<Booking[]> {
    // Get bookings from local storage - in production, this would fetch from your database
    return this.getStoredBookings();
  }

  async updateBookingStatus(bookingId: string, status: Booking['status']): Promise<boolean> {
    // In production, this would update the database
    console.log(`Updating booking ${bookingId} status to ${status}`);
    return true;
  }

  async updateBookingTeam(bookingId: string, team: string): Promise<boolean> {
    // In production, this would update the database
    console.log(`Assigning booking ${bookingId} to ${team}`);
    return true;
  }

  async addBookingNote(bookingId: string, note: string): Promise<boolean> {
    // In production, this would update the database
    console.log(`Adding note to booking ${bookingId}: ${note}`);
    return true;
  }

  async refundTransaction(transactionId: string): Promise<boolean> {
    // In production, this would process the refund via PayPal API
    console.log(`Processing refund for transaction ${transactionId}`);
    return true;
  }
}

// Authentication Service for Customer Portal
export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  registrationDate: string;
  lastLogin: string;
  membershipTier: 'Basic' | 'Premium' | 'VIP';
  totalBookings: number;
  totalSpent: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  customer: Customer | null;
  loading: boolean;
  error: string | null;
}

class AuthService {
  private customers: Customer[] = [
    {
      id: 'cust-001',
      email: 'john.smith@email.com',
      firstName: 'John',
      lastName: 'Smith',
      phone: '(289) 555-0123',
      address: '123 Main St, St. Catharines, ON',
      registrationDate: '2024-01-15',
      lastLogin: '2024-12-10',
      membershipTier: 'Premium',
      totalBookings: 12,
      totalSpent: 1450.00
    },
    {
      id: 'cust-002',
      email: 'sarah.johnson@email.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '(289) 555-0456',
      address: '456 Oak Ave, Niagara Falls, ON',
      registrationDate: '2024-02-20',
      lastLogin: '2024-12-09',
      membershipTier: 'VIP',
      totalBookings: 18,
      totalSpent: 2200.00
    }
  ];

  async login(email: string, password: string): Promise<{ success: boolean; customer?: Customer; error?: string }> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const customer = this.customers.find(c => c.email.toLowerCase() === email.toLowerCase());

    if (!customer) {
      return { success: false, error: 'Account not found. Please check your email or create a new account.' };
    }

    // In a real app, you'd verify the password hash
    if (password.length < 6) {
      return { success: false, error: 'Invalid password. Please try again.' };
    }

    // Update last login
    customer.lastLogin = new Date().toISOString().split('T')[0];

    // Store in localStorage for demo
    localStorage.setItem('vip_customer', JSON.stringify(customer));
    localStorage.setItem('vip_auth_token', `demo-jwt-token-${customer.id}`);

    return { success: true, customer };
  }

  async register(customerData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
  }): Promise<{ success: boolean; customer?: Customer; error?: string }> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Check if email already exists
    const existingCustomer = this.customers.find(c =>
      c.email.toLowerCase() === customerData.email.toLowerCase()
    );

    if (existingCustomer) {
      return { success: false, error: 'An account with this email already exists. Please try logging in.' };
    }

    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      email: customerData.email,
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      phone: customerData.phone,
      address: customerData.address,
      registrationDate: new Date().toISOString().split('T')[0],
      lastLogin: new Date().toISOString().split('T')[0],
      membershipTier: 'Basic',
      totalBookings: 0,
      totalSpent: 0
    };

    this.customers.push(newCustomer);

    // Store in localStorage for demo
    localStorage.setItem('vip_customer', JSON.stringify(newCustomer));
    localStorage.setItem('vip_auth_token', `demo-jwt-token-${newCustomer.id}`);

    return { success: true, customer: newCustomer };
  }

  getCurrentCustomer(): Customer | null {
    const customerData = localStorage.getItem('vip_customer');
    return customerData ? JSON.parse(customerData) : null;
  }

  getAuthToken(): string | null {
    return localStorage.getItem('vip_auth_token');
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken() && !!this.getCurrentCustomer();
  }

  logout(): void {
    localStorage.removeItem('vip_customer');
    localStorage.removeItem('vip_auth_token');
  }

  async updateProfile(updates: Partial<Customer>): Promise<{ success: boolean; customer?: Customer; error?: string }> {
    const currentCustomer = this.getCurrentCustomer();
    if (!currentCustomer) {
      return { success: false, error: 'Not authenticated' };
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    const updatedCustomer = { ...currentCustomer, ...updates };
    localStorage.setItem('vip_customer', JSON.stringify(updatedCustomer));

    return { success: true, customer: updatedCustomer };
  }
}

export const authService = new AuthService();

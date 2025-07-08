// Customer Authentication & Account Management
export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  serviceArea: string;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
  hashedPassword?: string;
  securityQuestion?: string;
  securityAnswer?: string;
  emailVerified: boolean;
  lastLogin?: string;
}

export interface Subscription {
  id: string;
  planId: string;
  customerId?: string;
  customerEmail: string;
  customerName: string;
  serviceType: 'residential' | 'commercial';
  cleaningType?: string;
  serviceArea: string;
  amount: number;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  status: 'active' | 'paused' | 'cancelled' | 'pending' | 'suspended';
  nextBillingDate: string;
  nextServiceDate: string;
  lastBillingDate?: string;
  createdAt: string;
  updatedAt: string;
  pausedUntil?: string;
  cancellationReason?: string;
  failedPaymentCount?: number;
}

export interface PasswordResetRequest {
  email: string;
  token: string;
  expiresAt: string;
  used: boolean;
}

export interface RegistrationData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  serviceArea: string;
  password: string;
  confirmPassword: string;
  securityQuestion: string;
  securityAnswer: string;
}

export interface Payment {
  id: string;
  customerId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentMethod: 'paypal' | 'stripe' | 'bank_transfer';
  transactionId: string;
  createdAt: string;
  description: string;
  isRecurring?: boolean;
  billingCycle?: string;
}

export interface ServiceHistory {
  id: string;
  customerId: string;
  subscriptionId?: string;
  serviceType: 'residential' | 'commercial';
  serviceDate: string;
  serviceTime: string;
  amount: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  teamAssigned?: string;
  rating?: number;
  feedback?: string;
  photos?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  isRecurring?: boolean;
}

// Password validation rules
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false,
  blacklistedPasswords: ['password', '123456', 'qwerty', 'abc123', 'password123']
};

export const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "What is your mother's maiden name?",
  "What city were you born in?",
  "What was the name of your elementary school?",
  "What is your favorite movie?",
  "What was your childhood nickname?",
  "What is the name of the street you grew up on?",
  "What was your first car's make and model?"
];

export const ValidationService = {
  validateEmail(email: string): { isValid: boolean; error?: string } {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!email) {
      return { isValid: false, error: 'Email is required' };
    }

    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }

    if (email.length > 254) {
      return { isValid: false, error: 'Email address is too long' };
    }

    return { isValid: true };
  },

  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!password) {
      errors.push('Password is required');
      return { isValid: false, errors };
    }

    if (password.length < PASSWORD_REQUIREMENTS.minLength) {
      errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
    }

    if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    if (PASSWORD_REQUIREMENTS.blacklistedPasswords.includes(password.toLowerCase())) {
      errors.push('This password is too common. Please choose a stronger password');
    }

    return { isValid: errors.length === 0, errors };
  },

  validatePhone(phone: string): { isValid: boolean; error?: string } {
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

    if (!phone) {
      return { isValid: false, error: 'Phone number is required' };
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return { isValid: false, error: 'Phone number must be 10 digits' };
    }

    if (!phoneRegex.test(phone)) {
      return { isValid: false, error: 'Please enter a valid phone number (e.g., (555) 123-4567)' };
    }

    return { isValid: true };
  },

  validateSecurityAnswer(answer: string): { isValid: boolean; error?: string } {
    if (!answer || answer.trim().length < 3) {
      return { isValid: false, error: 'Security answer must be at least 3 characters' };
    }

    if (answer.trim().length > 100) {
      return { isValid: false, error: 'Security answer is too long' };
    }

    return { isValid: true };
  }
}

// Simple password hashing (in production, use bcrypt)
const PasswordService = {
  async hashPassword(password: string): Promise<string> {
    // Simple hash for demo - in production use bcrypt
    const encoder = new TextEncoder();
    const data = encoder.encode(`${password}vip_salt_2024`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const hash = await PasswordService.hashPassword(password);
    return hash === hashedPassword;
  }
}

export class CustomerAuthService {
  private static instance: CustomerAuthService;
  private currentCustomer: Customer | null = null;

  static getInstance(): CustomerAuthService {
    if (!CustomerAuthService.instance) {
      CustomerAuthService.instance = new CustomerAuthService();
    }
    return CustomerAuthService.instance;
  }

  async login(email: string, password: string): Promise<Customer | null> {
    try {
      // Validate email first
      const emailValidation = ValidationService.validateEmail(email);
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.error || 'Invalid email');
      }

      const storedCustomers = this.getStoredCustomers();

      // Find customer by email
      const customer = storedCustomers.find(c => c.email.toLowerCase() === email.toLowerCase());

      if (customer?.hashedPassword) {
        const isValidPassword = await PasswordService.verifyPassword(password, customer.hashedPassword);

        if (isValidPassword) {
          // Update last login
          customer.lastLogin = new Date().toISOString();
          this.updateStoredCustomer(customer);

          // Create session
          const token = this.generateToken();
          localStorage.setItem('vip_customer_token', token);
          localStorage.setItem('vip_current_customer', JSON.stringify(customer));

          this.currentCustomer = customer;
          return customer;
        }
      }

      throw new Error('Invalid email or password');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(registrationData: RegistrationData): Promise<Customer | null> {
    try {
      // Comprehensive validation
      const validation = this.validateRegistrationData(registrationData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join('. '));
      }

      // Check if email already exists
      const existingCustomers = this.getStoredCustomers();
      const emailExists = existingCustomers.some(customer =>
        customer.email.toLowerCase() === registrationData.email.toLowerCase()
      );

      if (emailExists) {
        throw new Error('An account with this email already exists');
      }

      // Hash password
      const hashedPassword = await PasswordService.hashPassword(registrationData.password);

      // Create new customer
      const newCustomer: Customer = {
        id: `customer_${Date.now()}_${Math.random().toString(36).substring(2)}`,
        email: registrationData.email.toLowerCase(),
        firstName: registrationData.firstName.trim(),
        lastName: registrationData.lastName.trim(),
        phone: this.formatPhoneNumber(registrationData.phone),
        address: registrationData.address.trim(),
        city: registrationData.city.trim(),
        state: registrationData.state.trim(),
        zipCode: registrationData.zipCode.trim(),
        serviceArea: registrationData.serviceArea,
        hashedPassword,
        securityQuestion: registrationData.securityQuestion,
        securityAnswer: registrationData.securityAnswer.toLowerCase().trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        emailVerified: false, // In production, would send verification email
        lastLogin: new Date().toISOString()
      };

      // Store customer
      existingCustomers.push(newCustomer);
      localStorage.setItem('vip_customers', JSON.stringify(existingCustomers));

      // Create session
      const token = this.generateToken();
      localStorage.setItem('vip_customer_token', token);
      localStorage.setItem('vip_current_customer', JSON.stringify(newCustomer));

      this.currentCustomer = newCustomer;

      // Send welcome email
      await this.sendWelcomeEmail(newCustomer);

      // Create welcome notification
      const { NotificationService } = await import('./notifications');
      NotificationService.createWelcomeNotification(newCustomer.id, newCustomer.firstName);

      return newCustomer;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const emailValidation = ValidationService.validateEmail(email);
      if (!emailValidation.isValid) {
        return { success: false, message: emailValidation.error || 'Invalid email' };
      }

      const customers = this.getStoredCustomers();
      const customer = customers.find(c => c.email.toLowerCase() === email.toLowerCase());

      if (!customer) {
        // Don't reveal if email exists for security
        return {
          success: true,
          message: 'If an account with this email exists, password reset instructions have been sent.'
        };
      }

      // Generate reset token
      const resetToken = this.generateResetToken();
      const resetRequest: PasswordResetRequest = {
        email: email.toLowerCase(),
        token: resetToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
        used: false
      };

      // Store reset request
      const resetRequests = this.getStoredResetRequests();
      resetRequests.push(resetRequest);
      localStorage.setItem('vip_reset_requests', JSON.stringify(resetRequests));

      // In production, send email with reset link
      console.log('Password reset token:', resetToken);
      console.log(`Reset link would be: /reset-password?token=${resetToken}`);

      return {
        success: true,
        message: 'Password reset instructions have been sent to your email.'
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, message: 'Failed to process password reset request' };
    }
  }

  async resetPasswordWithToken(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      // Validate new password
      const passwordValidation = ValidationService.validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        return { success: false, message: passwordValidation.errors.join('. ') };
      }

      // Find reset request
      const resetRequests = this.getStoredResetRequests();
      const resetRequest = resetRequests.find(r => r.token === token && !r.used);

      if (!resetRequest) {
        return { success: false, message: 'Invalid or expired reset token' };
      }

      if (new Date(resetRequest.expiresAt) < new Date()) {
        return { success: false, message: 'Reset token has expired' };
      }

      // Update customer password
      const customers = this.getStoredCustomers();
      const customerIndex = customers.findIndex(c => c.email === resetRequest.email);

      if (customerIndex === -1) {
        return { success: false, message: 'Customer not found' };
      }

      const hashedPassword = await PasswordService.hashPassword(newPassword);
      customers[customerIndex].hashedPassword = hashedPassword;
      localStorage.setItem('vip_customers', JSON.stringify(customers));

      // Mark reset request as used
      resetRequest.used = true;
      localStorage.setItem('vip_reset_requests', JSON.stringify(resetRequests));

      return { success: true, message: 'Password has been reset successfully' };
    } catch (error) {
      console.error('Password reset with token error:', error);
      return { success: false, message: 'Failed to reset password' };
    }
  }

  async resetPasswordWithSecurity(email: string, securityAnswer: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      // Validate inputs
      const emailValidation = ValidationService.validateEmail(email);
      if (!emailValidation.isValid) {
        return { success: false, message: emailValidation.error || 'Invalid email' };
      }

      const passwordValidation = ValidationService.validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        return { success: false, message: passwordValidation.errors.join('. ') };
      }

      // Find customer
      const customers = this.getStoredCustomers();
      const customerIndex = customers.findIndex(c => c.email.toLowerCase() === email.toLowerCase());

      if (customerIndex === -1) {
        return { success: false, message: 'No account found with this email' };
      }

      const customer = customers[customerIndex];

      if (!customer.securityAnswer) {
        return { success: false, message: 'No security question set for this account' };
      }

      // Verify security answer
      if (customer.securityAnswer !== securityAnswer.toLowerCase().trim()) {
        return { success: false, message: 'Incorrect security answer' };
      }

      // Update password
      const hashedPassword = await PasswordService.hashPassword(newPassword);
      customers[customerIndex].hashedPassword = hashedPassword;
      localStorage.setItem('vip_customers', JSON.stringify(customers));

      return { success: true, message: 'Password has been reset successfully' };
    } catch (error) {
      console.error('Security question password reset error:', error);
      return { success: false, message: 'Failed to reset password' };
    }
  }

  getCurrentCustomer(): Customer | null {
    if (this.currentCustomer) {
      return this.currentCustomer;
    }

    // Try to restore from localStorage
    const token = localStorage.getItem('vip_customer_token');
    const storedCustomer = localStorage.getItem('vip_current_customer');

    if (token && storedCustomer) {
      try {
        const customer = JSON.parse(storedCustomer) as Customer;
        this.currentCustomer = customer;
        return customer;
      } catch {
        this.logout();
      }
    }

    return null;
  }

  logout(): void {
    this.currentCustomer = null;
    localStorage.removeItem('vip_customer_token');
    localStorage.removeItem('vip_current_customer');
  }

  async validateToken(): Promise<boolean> {
    const token = localStorage.getItem('vip_customer_token');
    const storedCustomer = localStorage.getItem('vip_current_customer');

    if (token && storedCustomer) {
      try {
        JSON.parse(storedCustomer);
        return true;
      } catch {
        this.logout();
        return false;
      }
    }

    return false;
  }

  // Helper methods
  private validateRegistrationData(data: RegistrationData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Email validation
    const emailValidation = ValidationService.validateEmail(data.email);
    if (!emailValidation.isValid) {
      errors.push(emailValidation.error || 'Invalid email');
    }

    // Password validation
    const passwordValidation = ValidationService.validatePassword(data.password);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }

    // Confirm password
    if (data.password !== data.confirmPassword) {
      errors.push('Passwords do not match');
    }

    // Phone validation
    const phoneValidation = ValidationService.validatePhone(data.phone);
    if (!phoneValidation.isValid) {
      errors.push(phoneValidation.error || 'Invalid phone');
    }

    // Name validation
    if (!data.firstName.trim()) {
      errors.push('First name is required');
    }
    if (!data.lastName.trim()) {
      errors.push('Last name is required');
    }

    // Address validation
    if (!data.address.trim()) {
      errors.push('Address is required');
    }
    if (!data.city.trim()) {
      errors.push('City is required');
    }
    if (!data.state.trim()) {
      errors.push('State/Province is required');
    }
    if (!data.zipCode.trim()) {
      errors.push('Postal/ZIP code is required');
    }
    if (!data.serviceArea) {
      errors.push('Service area is required');
    }

    // Security question validation
    if (!data.securityQuestion) {
      errors.push('Security question is required');
    }
    const securityValidation = ValidationService.validateSecurityAnswer(data.securityAnswer);
    if (!securityValidation.isValid) {
      errors.push(securityValidation.error || 'Invalid security answer');
    }

    return { isValid: errors.length === 0, errors };
  }

  private getStoredCustomers(): Customer[] {
    try {
      const stored = localStorage.getItem('vip_customers');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private getStoredResetRequests(): PasswordResetRequest[] {
    try {
      const stored = localStorage.getItem('vip_reset_requests');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private updateStoredCustomer(customer: Customer): void {
    const customers = this.getStoredCustomers();
    const index = customers.findIndex(c => c.id === customer.id);
    if (index !== -1) {
      customers[index] = customer;
      localStorage.setItem('vip_customers', JSON.stringify(customers));
    }
  }

  private generateToken(): string {
    return `customer_token_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private generateResetToken(): string {
    return `reset_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  }

  private async sendWelcomeEmail(customer: Customer): Promise<void> {
    try {
      // Import emailjs dynamically to avoid issues if not available
      const emailjs = (await import('@emailjs/browser')).default;

      const templateParams = {
        to_name: `${customer.firstName} ${customer.lastName}`,
        to_email: customer.email,
        customer_name: customer.firstName,
        customer_id: customer.id,
        service_area: customer.serviceArea,
        phone: customer.phone,
        login_url: `${window.location.origin}/?page=dashboard`,
        website_url: window.location.origin,
        support_phone: '(289) 697-6559',
        support_email: 'info@vipcleaningsquad.ca'
      };

      // Send welcome email using EmailJS
      // Note: You'll need to set up EmailJS service, template, and public key
      await emailjs.send(
        'vip_cleaning_service', // Service ID
        'welcome_template', // Template ID
        templateParams,
        'your_public_key' // Public Key
      );

      console.log('Welcome email sent successfully to:', customer.email);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't throw error - registration should still succeed even if email fails
    }
  }
}

// Subscription Service
export class SubscriptionService {
  async getCustomerSubscriptions(customerId: string): Promise<Subscription[]> {
    try {
      const stored = localStorage.getItem('vip_subscriptions');
      const allSubscriptions: Subscription[] = stored ? JSON.parse(stored) : [];

      return allSubscriptions.filter(sub =>
        sub.customerId === customerId ||
        sub.customerEmail === this.getCustomerEmail(customerId)
      );
    } catch {
      return [];
    }
  }

  async getAllSubscriptions(): Promise<Subscription[]> {
    try {
      const stored = localStorage.getItem('vip_subscriptions');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  async pauseSubscription(subscriptionId: string, pausedUntil?: string): Promise<boolean> {
    try {
      const subscriptions = await this.getAllSubscriptions();
      const index = subscriptions.findIndex(sub => sub.id === subscriptionId);

      if (index !== -1) {
        subscriptions[index].status = 'paused';
        subscriptions[index].pausedUntil = pausedUntil;
        subscriptions[index].updatedAt = new Date().toISOString();

        localStorage.setItem('vip_subscriptions', JSON.stringify(subscriptions));
        console.log(`Pausing subscription ${subscriptionId} until ${pausedUntil || 'indefinitely'}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error pausing subscription:', error);
      return false;
    }
  }

  async resumeSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const subscriptions = await this.getAllSubscriptions();
      const index = subscriptions.findIndex(sub => sub.id === subscriptionId);

      if (index !== -1) {
        subscriptions[index].status = 'active';
        subscriptions[index].pausedUntil = undefined;
        subscriptions[index].updatedAt = new Date().toISOString();

        // Update next billing date to current date + frequency
        const currentDate = new Date();
        const nextServiceDate = new Date(currentDate);
        const frequency = subscriptions[index].frequency;

        if (frequency === 'weekly') {
          currentDate.setDate(currentDate.getDate() + 7);
          nextServiceDate.setDate(nextServiceDate.getDate() + 7);
        } else if (frequency === 'biweekly') {
          currentDate.setDate(currentDate.getDate() + 14);
          nextServiceDate.setDate(nextServiceDate.getDate() + 14);
        } else if (frequency === 'monthly') {
          currentDate.setMonth(currentDate.getMonth() + 1);
          nextServiceDate.setMonth(nextServiceDate.getMonth() + 1);
        }

        subscriptions[index].nextBillingDate = currentDate.toISOString();
        subscriptions[index].nextServiceDate = nextServiceDate.toISOString();

        localStorage.setItem('vip_subscriptions', JSON.stringify(subscriptions));
        console.log(`Resuming subscription ${subscriptionId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error resuming subscription:', error);
      return false;
    }
  }

  async cancelSubscription(subscriptionId: string, reason?: string): Promise<boolean> {
    try {
      const subscriptions = await this.getAllSubscriptions();
      const index = subscriptions.findIndex(sub => sub.id === subscriptionId);

      if (index !== -1) {
        subscriptions[index].status = 'cancelled';
        subscriptions[index].cancellationReason = reason;
        subscriptions[index].updatedAt = new Date().toISOString();

        localStorage.setItem('vip_subscriptions', JSON.stringify(subscriptions));
        console.log(`Cancelling subscription ${subscriptionId}. Reason: ${reason}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return false;
    }
  }

  async updateSubscriptionFrequency(subscriptionId: string, newFrequency: 'weekly' | 'biweekly' | 'monthly'): Promise<boolean> {
    try {
      const subscriptions = await this.getAllSubscriptions();
      const index = subscriptions.findIndex(sub => sub.id === subscriptionId);

      if (index !== -1) {
        subscriptions[index].frequency = newFrequency;
        subscriptions[index].updatedAt = new Date().toISOString();

        // Recalculate next billing date and service date based on new frequency
        const currentDate = new Date();
        const nextServiceDate = new Date(currentDate);
        if (newFrequency === 'weekly') {
          currentDate.setDate(currentDate.getDate() + 7);
          nextServiceDate.setDate(nextServiceDate.getDate() + 7);
        } else if (newFrequency === 'biweekly') {
          currentDate.setDate(currentDate.getDate() + 14);
          nextServiceDate.setDate(nextServiceDate.getDate() + 14);
        } else if (newFrequency === 'monthly') {
          currentDate.setMonth(currentDate.getMonth() + 1);
          nextServiceDate.setMonth(nextServiceDate.getMonth() + 1);
        }

        subscriptions[index].nextBillingDate = currentDate.toISOString();
        subscriptions[index].nextServiceDate = nextServiceDate.toISOString();

        localStorage.setItem('vip_subscriptions', JSON.stringify(subscriptions));
        console.log(`Updated subscription ${subscriptionId} frequency to ${newFrequency}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating subscription frequency:', error);
      return false;
    }
  }

  async getSubscriptionById(subscriptionId: string): Promise<Subscription | null> {
    try {
      const subscriptions = await this.getAllSubscriptions();
      return subscriptions.find(sub => sub.id === subscriptionId) || null;
    } catch {
      return null;
    }
  }

  private getCustomerEmail(customerId: string): string {
    try {
      const customers = JSON.parse(localStorage.getItem('vip_customers') || '[]');
      const customer = customers.find((c: Customer) => c.id === customerId);
      return customer?.email || '';
    } catch {
      return '';
    }
  }

  // Get subscription statistics for admin dashboard
  async getSubscriptionStats(): Promise<{
    total: number;
    active: number;
    paused: number;
    cancelled: number;
    monthlyRecurringRevenue: number;
    weeklyRecurringRevenue: number;
  }> {
    try {
      const subscriptions = await this.getAllSubscriptions();

      const stats = {
        total: subscriptions.length,
        active: subscriptions.filter(sub => sub.status === 'active').length,
        paused: subscriptions.filter(sub => sub.status === 'paused').length,
        cancelled: subscriptions.filter(sub => sub.status === 'cancelled').length,
        monthlyRecurringRevenue: 0,
        weeklyRecurringRevenue: 0
      };

      // Calculate recurring revenue
      for (const sub of subscriptions.filter(sub => sub.status === 'active')) {
        if (sub.frequency === 'monthly') {
          stats.monthlyRecurringRevenue += sub.amount;
        } else if (sub.frequency === 'weekly') {
          stats.weeklyRecurringRevenue += sub.amount;
          stats.monthlyRecurringRevenue += sub.amount * 4.33; // Average weeks per month
        } else if (sub.frequency === 'biweekly') {
          stats.weeklyRecurringRevenue += sub.amount / 2;
          stats.monthlyRecurringRevenue += sub.amount * 2.17; // Bi-weekly to monthly
        }
      }

      return stats;
    } catch {
      return {
        total: 0,
        active: 0,
        paused: 0,
        cancelled: 0,
        monthlyRecurringRevenue: 0,
        weeklyRecurringRevenue: 0
      };
    }
  }
}

// Payment Service
export class PaymentService {
  async getCustomerPayments(customerId: string): Promise<Payment[]> {
    try {
      const stored = localStorage.getItem('vip_payments');
      const allPayments: Payment[] = stored ? JSON.parse(stored) : [];

      return allPayments.filter(payment => payment.customerId === customerId);
    } catch {
      return [];
    }
  }

  async createPayment(paymentData: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    const newPayment: Payment = {
      ...paymentData,
      id: `payment_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      createdAt: new Date().toISOString()
    };

    try {
      const payments = JSON.parse(localStorage.getItem('vip_payments') || '[]');
      payments.push(newPayment);
      localStorage.setItem('vip_payments', JSON.stringify(payments));
      return newPayment;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }
}

// Service History Service
export class ServiceHistoryService {
  async getCustomerServiceHistory(customerId: string): Promise<ServiceHistory[]> {
    try {
      const stored = localStorage.getItem('vip_service_history');
      const allHistory: ServiceHistory[] = stored ? JSON.parse(stored) : [];

      return allHistory
        .filter(service => service.customerId === customerId)
        .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime());
    } catch {
      return [];
    }
  }

  async createServiceHistory(serviceData: Omit<ServiceHistory, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceHistory> {
    const newService: ServiceHistory = {
      ...serviceData,
      id: `service_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const services = JSON.parse(localStorage.getItem('vip_service_history') || '[]');
      services.push(newService);
      localStorage.setItem('vip_service_history', JSON.stringify(services));
      return newService;
    } catch (error) {
      console.error('Error creating service history:', error);
      throw error;
    }
  }

  async updateServiceHistory(serviceId: string, updates: Partial<ServiceHistory>): Promise<boolean> {
    try {
      const services = JSON.parse(localStorage.getItem('vip_service_history') || '[]');
      const index = services.findIndex((service: ServiceHistory) => service.id === serviceId);

      if (index !== -1) {
        services[index] = {
          ...services[index],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem('vip_service_history', JSON.stringify(services));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating service history:', error);
      return false;
    }
  }
}

import type React from 'react';
import { useState, useEffect } from 'react';
import {
  CustomerAuthService,
  SubscriptionService,
  PaymentService,
  ServiceHistoryService,
  type Customer,
  type Subscription,
  type Payment,
  type ServiceHistory,
  type RegistrationData,
  ValidationService,
  SECURITY_QUESTIONS
} from '../services/customerAccount';
// Temporary: Commenting out notifications for build
// import { createNotification } from '../services/notifications';
// import { NotificationCenter } from '../services/notifications';

// Customer Login Form Component
const CustomerLoginForm: React.FC<{ onLoginSuccess: (customer: Customer) => void }> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Registration form state
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: 'ON',
    zipCode: '',
    serviceArea: '',
    password: '',
    confirmPassword: '',
    securityQuestion: '',
    securityAnswer: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const authService = CustomerAuthService.getInstance();
      const customer = await authService.login(loginData.email, loginData.password);

      if (customer) {
        onLoginSuccess(customer);
        // Temporary: Disabled notification for build
        console.log('Login Successful:', customer.firstName);
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } catch (error) {
      setError('Login failed. Please check your credentials and try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (registrationData.password !== registrationData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    const passwordValidation = ValidationService.validatePassword(registrationData.password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors.join(', '));
      setLoading(false);
      return;
    }

    try {
      const authService = CustomerAuthService.getInstance();
      const customer = await authService.register(registrationData);

      if (customer) {
        onLoginSuccess(customer);
        // Temporary: Disabled notification for build
        console.log('Account Created Successfully:', customer.firstName);
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (error) {
      setError('Registration failed. This email may already be registered.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">VIP Cleaning Squad</h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h2>
          <p className="text-gray-600">
            {isLogin ? 'Access your dashboard and manage your cleaning services' : 'Join VIP Cleaning Squad and book your first service'}
          </p>
        </div>

        {/* Toggle Login/Register */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => {setIsLogin(true); setError('');}}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {setIsLogin(false); setError('');}}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              !isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Forms */}
        {isLogin ? (
          // Login Form
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          // Registration Form
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={registrationData.firstName}
                  onChange={(e) => setRegistrationData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={registrationData.lastName}
                  onChange={(e) => setRegistrationData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={registrationData.email}
                onChange={(e) => setRegistrationData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={registrationData.phone}
                onChange={(e) => setRegistrationData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="(555) 123-4567"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Address</label>
              <input
                type="text"
                value={registrationData.address}
                onChange={(e) => setRegistrationData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="123 Main Street"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={registrationData.city}
                  onChange={(e) => setRegistrationData(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                <select
                  value={registrationData.state}
                  onChange={(e) => setRegistrationData(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="ON">ON</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  value={registrationData.zipCode}
                  onChange={(e) => setRegistrationData(prev => ({ ...prev, zipCode: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="A1B 2C3"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Area</label>
              <select
                value={registrationData.serviceArea}
                onChange={(e) => setRegistrationData(prev => ({ ...prev, serviceArea: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                required
              >
                <option value="">Select your area</option>
                <option value="St. Catharines">St. Catharines</option>
                <option value="Niagara-on-the-Lake">Niagara-on-the-Lake</option>
                <option value="Niagara Falls">Niagara Falls</option>
                <option value="Welland">Welland</option>
                <option value="Fort Erie">Fort Erie</option>
                <option value="Lincoln">Lincoln</option>
                <option value="Pelham">Pelham</option>
                <option value="Thorold">Thorold</option>
                <option value="Grimsby">Grimsby</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={registrationData.password}
                onChange={(e) => setRegistrationData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                required
              />
              {registrationData.password && (
                <div className="mt-1">
                  <div className="text-xs">
                    <span className={`${
                      ValidationService.validatePassword(registrationData.password).isValid
                        ? 'text-green-600'
                        : ValidationService.validatePassword(registrationData.password).errors.length <= 2
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }`}>
                      {ValidationService.validatePassword(registrationData.password).isValid
                        ? 'Strong'
                        : ValidationService.validatePassword(registrationData.password).errors.length <= 2
                          ? 'Good'
                          : 'Weak'
                      }
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                value={registrationData.confirmPassword}
                onChange={(e) => setRegistrationData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Security Question</label>
              <select
                value={registrationData.securityQuestion}
                onChange={(e) => setRegistrationData(prev => ({ ...prev, securityQuestion: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                required
              >
                <option value="">Choose a security question</option>
                {SECURITY_QUESTIONS.map((question) => (
                  <option key={question} value={question}>{question}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Security Answer</label>
              <input
                type="text"
                value={registrationData.securityAnswer}
                onChange={(e) => setRegistrationData(prev => ({ ...prev, securityAnswer: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Back to Home */}
        <div className="text-center">
          <button
            onClick={() => { window.location.href = '/'; }}
            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

// Main CustomerDashboard Component
const CustomerDashboard: React.FC = () => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [serviceHistory, setServiceHistory] = useState<ServiceHistory[]>([]);

  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        const authService = CustomerAuthService.getInstance();
        const currentCustomer = authService.getCurrentCustomer();

        if (!currentCustomer) {
          setLoading(false);
          return;
        }

        setCustomer(currentCustomer);

        // Load customer data
        const subscriptionService = new SubscriptionService();
        const paymentService = new PaymentService();
        const serviceHistoryService = new ServiceHistoryService();

        const [customerSubscriptions, customerPayments, customerServiceHistory] = await Promise.all([
          subscriptionService.getCustomerSubscriptions(currentCustomer.id),
          paymentService.getCustomerPayments(currentCustomer.id),
          serviceHistoryService.getCustomerServiceHistory(currentCustomer.id)
        ]);

        setSubscriptions(customerSubscriptions);
        setPayments(customerPayments);
        setServiceHistory(customerServiceHistory);
      } catch (error) {
        console.error('Error loading customer data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCustomerData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!customer) {
    return <CustomerLoginForm onLoginSuccess={(customer) => setCustomer(customer)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {customer.firstName}!</h1>
              <p className="text-gray-600">Manage your cleaning services and account</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Last login: {customer.lastLogin ? new Date(customer.lastLogin).toLocaleDateString() : 'First time'}</span>
              <button
                onClick={() => { window.location.href = '/'; }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                ← Back to Home
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'subscriptions', label: 'Subscriptions' },
                { id: 'payments', label: 'Payments' },
                { id: 'history', label: 'Service History' },
                { id: 'profile', label: 'Profile' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Welcome to your VIP Dashboard!</h3>
            <p className="text-gray-600 mb-6">Your customer dashboard is being enhanced with new features.</p>
            <a
              href="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Book a Service
            </a>
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Subscription Management</h3>
            <p className="text-gray-600">Manage your recurring cleaning services here.</p>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Payment History</h3>
            <p className="text-gray-600">View and download receipts for your payments.</p>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Service History</h3>
            <p className="text-gray-600">Track your past and upcoming cleaning services.</p>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">👤</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Settings</h3>
            <p className="text-gray-600">Update your account information and preferences.</p>
          </div>
        )}
      </div>

      {/* Temporary: Notification Center disabled for build */}
      {/* <NotificationCenter customerId={customer.id} /> */}
    </div>
  );
};

export default CustomerDashboard;

import type React from 'react';
import { useState, useEffect } from 'react';
import { authService, type Customer } from '../services/auth';
import { bookingService, type Booking, type BookingStats } from '../services/booking';

interface CustomerPortalProps {
  onNavigate?: (page: string) => void;
}

export default function CustomerPortal({ onNavigate }: CustomerPortalProps) {
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'dashboard'>('login');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const existingCustomer = authService.getCurrentCustomer();
    if (existingCustomer) {
      setCustomer(existingCustomer);
      setCurrentView('dashboard');
    }
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    const result = await authService.login(email, password);

    if (result.success && result.customer) {
      setCustomer(result.customer);
      setCurrentView('dashboard');
    } else {
      setError(result.error || 'Login failed');
    }

    setLoading(false);
  };

  const handleRegister = async (customerData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
  }) => {
    setLoading(true);
    setError(null);

    const result = await authService.register(customerData);

    if (result.success && result.customer) {
      setCustomer(result.customer);
      setCurrentView('dashboard');
    } else {
      setError(result.error || 'Registration failed');
    }

    setLoading(false);
  };

  const handleLogout = () => {
    authService.logout();
    setCustomer(null);
    setCurrentView('login');
    if (onNavigate) onNavigate('home');
  };

  if (currentView === 'dashboard' && customer) {
    return <CustomerDashboard customer={customer} onLogout={handleLogout} onNavigate={onNavigate} />;
  }

  if (currentView === 'register') {
    return (
      <RegisterForm
        onRegister={handleRegister}
        onBackToLogin={() => setCurrentView('login')}
        loading={loading}
        error={error}
      />
    );
  }

  return (
    <LoginForm
      onLogin={handleLogin}
      onShowRegister={() => setCurrentView('register')}
      loading={loading}
      error={error}
    />
  );
}

// Login Form Component
interface LoginFormProps {
  onLogin: (email: string, password: string) => void;
  onShowRegister: () => void;
  loading: boolean;
  error: string | null;
}

function LoginForm({ onLogin, onShowRegister, loading, error }: LoginFormProps) {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(formData.email, formData.password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">VIP</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your VIP Cleaning Squad account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="john.smith@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-green-700 transition-all font-semibold disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Don't have an account?{' '}
            <button
              onClick={onShowRegister}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Create Account
            </button>
          </p>
        </div>

        {/* Demo Account Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 font-medium text-sm mb-2">Demo Account:</p>
          <p className="text-blue-700 text-xs">Email: john.smith@email.com</p>
          <p className="text-blue-700 text-xs">Password: any password (6+ chars)</p>
        </div>
      </div>
    </div>
  );
}

// Register Form Component
interface RegisterFormProps {
  onRegister: (customerData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
  }) => void;
  onBackToLogin: () => void;
  loading: boolean;
  error: string | null;
}

function RegisterForm({ onRegister, onBackToLogin, loading, error }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    onRegister(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">VIP</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-600">Join VIP Cleaning Squad today</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              minLength={6}
            />
            {formData.password !== formData.confirmPassword && formData.confirmPassword && (
              <p className="text-red-600 text-xs mt-1">Passwords don't match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || formData.password !== formData.confirmPassword}
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-green-700 transition-all font-semibold disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?{' '}
            <button
              onClick={onBackToLogin}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// Customer Dashboard Component
interface CustomerDashboardProps {
  customer: Customer;
  onLogout: () => void;
  onNavigate?: (page: string) => void;
}

function CustomerDashboard({ customer, onLogout, onNavigate }: CustomerDashboardProps) {
  const [currentTab, setCurrentTab] = useState<'overview' | 'bookings' | 'history' | 'profile'>('overview');
  const [bookingStats, setBookingStats] = useState<BookingStats | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [bookingHistory, setBookingHistory] = useState<Booking[]>([]);

  useEffect(() => {
    // Load customer data
    const stats = bookingService.getBookingStats(customer.id);
    const upcoming = bookingService.getUpcomingBookings(customer.id);
    const history = bookingService.getBookingHistory(customer.id);

    setBookingStats(stats);
    setUpcomingBookings(upcoming);
    setBookingHistory(history);
  }, [customer.id]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">VIP</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Customer Portal</h1>
                <p className="text-sm text-gray-600">Welcome back, {customer.firstName}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{customer.firstName} {customer.lastName}</p>
                <p className="text-xs text-gray-500">{customer.membershipTier} Member</p>
              </div>
              <button
                onClick={onLogout}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200">
            {[
              { id: 'overview', label: 'Overview', icon: '🏠' },
              { id: 'bookings', label: 'Upcoming Bookings', icon: '📅' },
              { id: 'history', label: 'Booking History', icon: '📋' },
              { id: 'profile', label: 'Profile', icon: '👤' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id as 'overview' | 'bookings' | 'history' | 'profile')}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  currentTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {currentTab === 'overview' && (
          <OverviewTab
            customer={customer}
            bookingStats={bookingStats}
            upcomingBookings={upcomingBookings}
            onNavigate={onNavigate}
          />
        )}

        {currentTab === 'bookings' && (
          <BookingsTab bookings={upcomingBookings} />
        )}

        {currentTab === 'history' && (
          <HistoryTab bookings={bookingHistory} />
        )}

        {currentTab === 'profile' && (
          <ProfileTab customer={customer} />
        )}
      </div>
    </div>
  );
}

// Overview Tab Component
interface OverviewTabProps {
  customer: Customer;
  bookingStats: BookingStats | null;
  upcomingBookings: Booking[];
  onNavigate?: (page: string) => void;
}

function OverviewTab({ customer, bookingStats, upcomingBookings, onNavigate }: OverviewTabProps) {
  if (!bookingStats) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xl">📅</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Bookings</h3>
              <p className="text-2xl font-bold text-gray-900">{bookingStats.totalBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-xl">💰</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Spent</h3>
              <p className="text-2xl font-bold text-gray-900">${bookingStats.totalSpent.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-yellow-600 text-xl">⭐</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Average Rating</h3>
              <p className="text-2xl font-bold text-gray-900">{bookingStats.averageRating}/5</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-xl">🏆</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Member Since</h3>
              <p className="text-lg font-bold text-gray-900">{new Date(bookingStats.memberSince).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Bookings */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Upcoming Bookings</h3>
        </div>
        <div className="p-6">
          {upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              {upcomingBookings.slice(0, 3).map(booking => (
                <div key={booking.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{booking.serviceType}</h4>
                    <p className="text-sm text-gray-600">{booking.date} at {booking.time}</p>
                    <p className="text-sm text-gray-600">{booking.address}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${booking.price}</p>
                    <p className="text-sm text-gray-600">{booking.status}</p>
                  </div>
                </div>
              ))}
              {upcomingBookings.length > 3 && (
                <p className="text-sm text-blue-600 cursor-pointer">View all upcoming bookings →</p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No upcoming bookings</p>
              <button
                onClick={() => onNavigate?.('quote')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Book Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => onNavigate?.('quote')}
              className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <span className="text-blue-600 text-xl">➕</span>
              <span className="text-blue-600 font-medium">Book New Service</span>
            </button>

            <button className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
              <span className="text-green-600 text-xl">💬</span>
              <span className="text-green-600 font-medium">Contact Support</span>
            </button>

            <button className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
              <span className="text-purple-600 text-xl">📧</span>
              <span className="text-purple-600 font-medium">Refer Friends</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Bookings Tab Component
function BookingsTab({ bookings }: { bookings: Booking[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Bookings</h3>
      </div>
      <div className="p-6">
        {bookings.length > 0 ? (
          <div className="space-y-6">
            {bookings.map(booking => (
              <div key={booking.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{booking.serviceType}</h4>
                    <p className="text-gray-600">{booking.date} at {booking.time}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    booking.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Address:</p>
                    <p className="font-medium">{booking.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Price:</p>
                    <p className="font-medium">${booking.price}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration:</p>
                    <p className="font-medium">{booking.duration} minutes</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Team Leader:</p>
                    <p className="font-medium">{booking.assignedTeam?.teamLeader || 'TBD'}</p>
                  </div>
                </div>

                {booking.notes && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Notes:</p>
                    <p className="text-sm">{booking.notes}</p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                    Reschedule
                  </button>
                  <button className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No upcoming bookings</p>
          </div>
        )}
      </div>
    </div>
  );
}

// History Tab Component
function HistoryTab({ bookings }: { bookings: Booking[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Booking History</h3>
      </div>
      <div className="p-6">
        {bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map(booking => (
              <div key={booking.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{booking.serviceType}</h4>
                    <p className="text-gray-600">Completed on {booking.completedDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${booking.price}</p>
                    {booking.rating && (
                      <div className="flex items-center mt-1">
                        <span className="text-yellow-400">{'⭐'.repeat(booking.rating)}</span>
                        <span className="text-gray-600 text-sm ml-1">({booking.rating}/5)</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Address:</p>
                    <p className="font-medium">{booking.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Team Leader:</p>
                    <p className="font-medium">{booking.assignedTeam?.teamLeader}</p>
                  </div>
                </div>

                {booking.review && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Your Review:</p>
                    <p className="text-sm italic">"{booking.review}"</p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                    Book Again
                  </button>
                  {!booking.rating && (
                    <button className="px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors">
                      Leave Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No booking history</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Profile Tab Component
function ProfileTab({ customer }: { customer: Customer }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    phone: customer.phone,
    address: customer.address
  });

  const handleSave = async () => {
    // In a real app, you'd call the API to update profile
    setEditing(false);
    // Show success message
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {editing ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            {editing ? (
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="py-2 text-gray-900">{customer.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            {editing ? (
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="py-2 text-gray-900">{customer.lastName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            {editing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="py-2 text-gray-900">{customer.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            {editing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="py-2 text-gray-900">{customer.phone}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            {editing ? (
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="py-2 text-gray-900">{customer.address}</p>
            )}
          </div>
        </div>

        {/* Account Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="font-medium">{new Date(customer.registrationDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Membership Tier</p>
              <p className="font-medium">{customer.membershipTier}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="font-medium">{customer.totalBookings}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

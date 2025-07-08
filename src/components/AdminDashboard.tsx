import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { AdminAuthService, AdminDataService, type AdminSession, type Transaction, type Booking } from '../services/adminAuth';
import { CustomerAuthService, type Customer } from '../services/customerAccount';
import { BusinessIntelligenceService, type BusinessMetrics, type CustomerInsight, type PerformanceAlert } from '../services/businessIntelligence';
import AdminLogin from './AdminLogin';
import AdminScheduling from './AdminScheduling';

const AdminDashboard: React.FC = () => {
  const [currentSession, setCurrentSession] = useState<AdminSession | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics | null>(null);
  const [customerInsights, setCustomerInsights] = useState<CustomerInsight[]>([]);
  const [performanceAlerts, setPerformanceAlerts] = useState<PerformanceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const [storageInfo, setStorageInfo] = useState<{
    bookingsCount: number;
    transactionsCount: number;
    rawBookings: string;
    rawTransactions: string;
  }>({
    bookingsCount: 0,
    transactionsCount: 0,
    rawBookings: '',
    rawTransactions: ''
  });

  const authService = AdminAuthService.getInstance();
  const dataService = new AdminDataService();
  const customerAuth = CustomerAuthService.getInstance();
  const businessIntelligence = BusinessIntelligenceService.getInstance();

  // Real-time storage monitoring
  const updateStorageInfo = useCallback(() => {
    const bookingsData = localStorage.getItem('vip_admin_bookings') || '[]';
    const transactionsData = localStorage.getItem('vip_admin_transactions') || '[]';

    try {
      const bookings = JSON.parse(bookingsData);
      const transactions = JSON.parse(transactionsData);

      setStorageInfo({
        bookingsCount: bookings.length,
        transactionsCount: transactions.length,
        rawBookings: bookingsData,
        rawTransactions: transactionsData
      });
    } catch (error) {
      console.error('Error parsing storage data:', error);
    }
  }, []);

  // Load business intelligence data
  const loadBusinessIntelligence = useCallback(() => {
    try {
      console.log('🧠 Loading Business Intelligence Data...');

      const metrics = businessIntelligence.getBusinessMetrics();
      const insights = businessIntelligence.getCustomerInsights();
      const alerts = businessIntelligence.getPerformanceAlerts();

      setBusinessMetrics(metrics);
      setCustomerInsights(insights);
      setPerformanceAlerts(alerts);

      console.log('📊 Business Metrics:', metrics);
      console.log('👥 Customer Insights:', insights);
      console.log('⚠️ Performance Alerts:', alerts);
    } catch (error) {
      console.error('Error loading business intelligence:', error);
    }
  }, [businessIntelligence]);

  // Create test booking for debugging
  const createTestBooking = () => {
    const testBooking = {
      id: `test_booking_${Date.now()}`,
      bookingNumber: `TEST${Date.now()}`,
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerPhone: '(555) 123-4567',
      serviceType: 'residential' as const,
      serviceDate: new Date().toISOString().split('T')[0],
      serviceTime: '10:00',
      serviceAddress: '123 Test Street, Test City, ON A1B 2C3',
      serviceArea: 'Test Area',
      amount: 99.99,
      status: 'scheduled' as const,
      paymentStatus: 'paid' as const,
      cleaningType: 'standard',
      frequency: 'onetime',
      addOns: ['Test Add-on'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const testTransaction = {
      id: `test_transaction_${Date.now()}`,
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerPhone: '(555) 123-4567',
      serviceType: 'residential',
      amount: 99.99,
      paymentMethod: 'paypal' as const,
      paypalOrderId: `test_order_${Date.now()}`,
      status: 'completed' as const,
      createdAt: new Date().toISOString(),
      serviceDate: new Date().toISOString().split('T')[0],
      serviceTime: '10:00',
      serviceAddress: '123 Test Street, Test City, ON A1B 2C3',
      serviceArea: 'Test Area',
      addOns: ['Test Add-on'],
      frequency: 'onetime',
      bookingNumber: testBooking.bookingNumber
    };

    try {
      // Add to existing data
      const existingBookings = JSON.parse(localStorage.getItem('vip_admin_bookings') || '[]');
      const existingTransactions = JSON.parse(localStorage.getItem('vip_admin_transactions') || '[]');

      existingBookings.unshift(testBooking);
      existingTransactions.unshift(testTransaction);

      localStorage.setItem('vip_admin_bookings', JSON.stringify(existingBookings));
      localStorage.setItem('vip_admin_transactions', JSON.stringify(existingTransactions));

      console.log('✅ Test booking and transaction created successfully!');
      console.log('📅 Test Booking:', testBooking);
      console.log('💳 Test Transaction:', testTransaction);

      // Refresh data
      loadInitialData();
      updateStorageInfo();
      loadBusinessIntelligence();

      alert(`✅ Test booking created successfully!\n\nBooking: ${testBooking.bookingNumber}\nTransaction: ${testTransaction.id}\n\nCheck the admin dashboard tabs to see the new data.`);
    } catch (error) {
      console.error('❌ Error creating test booking:', error);
      alert('❌ Error creating test booking. Check console for details.');
    }
  };

  // Clear all storage
  const clearAllData = () => {
    if (confirm('Are you sure you want to clear ALL booking and transaction data? This cannot be undone.')) {
      localStorage.removeItem('vip_admin_bookings');
      localStorage.removeItem('vip_admin_transactions');

      setBookings([]);
      setTransactions([]);
      setBusinessMetrics(null);
      setCustomerInsights([]);
      setPerformanceAlerts([]);
      updateStorageInfo();
      loadBusinessIntelligence();

      alert('🗑️ All data cleared successfully!');
    }
  };

  // Export data for backup
  const exportData = () => {
    const bookingsData = localStorage.getItem('vip_admin_bookings') || '[]';
    const transactionsData = localStorage.getItem('vip_admin_transactions') || '[]';

    const exportData = {
      bookings: JSON.parse(bookingsData),
      transactions: JSON.parse(transactionsData),
      businessMetrics,
      customerInsights,
      performanceAlerts,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `vip-business-intelligence-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
    console.log('📄 Business Intelligence data exported successfully');
  };

  useEffect(() => {
    loadInitialData();
    updateStorageInfo();
    loadBusinessIntelligence();

    // Set up storage listener for real-time updates
    const storageListener = () => {
      updateStorageInfo();
      loadInitialData();
      loadBusinessIntelligence();
    };

    window.addEventListener('storage', storageListener);

    // Also check every 10 seconds for changes and refresh BI data
    const interval = setInterval(() => {
      updateStorageInfo();
      loadBusinessIntelligence();
    }, 10000);

    return () => {
      window.removeEventListener('storage', storageListener);
      clearInterval(interval);
    };
  }, [updateStorageInfo, loadBusinessIntelligence]);

  const loadInitialData = async () => {
    const session = authService.getCurrentSession();
    if (!session) {
      setIsLoading(false);
      return;
    }

    setCurrentSession(session);

    try {
      const [transactionsData, bookingsData, customersData] = await Promise.all([
        dataService.getTransactions(),
        dataService.getBookings(),
        getCustomers()
      ]);

      console.log('🔍 ADMIN DEBUG - Transactions found:', transactionsData.length);
      console.log('🔍 ADMIN DEBUG - Bookings found:', bookingsData.length);
      console.log('🔍 ADMIN DEBUG - Customers found:', customersData.length);
      console.log('📊 ADMIN DEBUG - Raw bookings data:', bookingsData);
      console.log('💳 ADMIN DEBUG - Raw transactions data:', transactionsData);

      setTransactions(transactionsData);
      setBookings(bookingsData);
      setCustomers(customersData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }

    setIsLoading(false);
  };

  const getCustomers = (): Customer[] => {
    try {
      const stored = localStorage.getItem('vip_customers');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentSession(null);
  };

  const handleBookingStatusUpdate = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      await dataService.updateBookingStatus(bookingId, newStatus);
      setBookings(prev => prev.map(booking =>
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      ));
      // Refresh BI data after status update
      loadBusinessIntelligence();
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const handleRefund = async (transactionId: string) => {
    if (confirm('Are you sure you want to process this refund?')) {
      try {
        await dataService.refundTransaction(transactionId);
        setTransactions(prev => prev.map(txn =>
          txn.id === transactionId ? { ...txn, status: 'refunded' } : txn
        ));
        // Refresh BI data after refund
        loadBusinessIntelligence();
      } catch (error) {
        console.error('Error processing refund:', error);
      }
    }
  };

  if (!currentSession) {
    return <AdminLogin onLoginSuccess={setCurrentSession} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header with BI Metrics */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">VIP Admin Dashboard</h1>
              <p className="text-gray-600 text-sm lg:text-base">Welcome back, {currentSession.admin.username}</p>

              {/* Real-time BI Status */}
              <div className="mt-2 text-xs space-y-1">
                <div className="text-green-600 font-medium">
                  📊 Live Data: {storageInfo.bookingsCount} bookings, {storageInfo.transactionsCount} transactions
                </div>
                {businessMetrics && (
                  <div className="text-blue-600">
                    💰 Total Revenue: ${businessMetrics.totalRevenue.toFixed(2)} |
                    📈 Growth: {businessMetrics.revenueGrowth.monthly.toFixed(1)}% |
                    👥 CLV: ${businessMetrics.customerLifetimeValue.toFixed(2)}
                  </div>
                )}
                {performanceAlerts.length > 0 && (
                  <div className="text-orange-600">
                    ⚠️ {performanceAlerts.length} performance alerts requiring attention
                  </div>
                )}
                <div className="text-purple-600">
                  🔄 Last updated: {new Date().toLocaleTimeString()} | BI Engine: Active
                </div>
                {/* Mobile device indicator */}
                <div className="text-purple-600 lg:hidden">
                  📱 Mobile Admin Mode: Touch-optimized interface with full BI
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              {/* Debug Toggle */}
              <button
                onClick={() => setDebugMode(!debugMode)}
                className={`px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors touch-manipulation ${
                  debugMode
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🔧 {debugMode ? 'Hide Debug' : 'Show Debug'}
              </button>

              {/* Test Data Button */}
              <button
                onClick={createTestBooking}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs lg:text-sm font-medium touch-manipulation"
              >
                ➕ Create Test Booking
              </button>

              {/* Enhanced Data Management */}
              <div className="flex space-x-2">
                <button
                  onClick={exportData}
                  className="flex-1 sm:flex-none px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs lg:text-sm touch-manipulation"
                >
                  📊 Export BI
                </button>
                <button
                  onClick={clearAllData}
                  className="flex-1 sm:flex-none px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs lg:text-sm touch-manipulation"
                >
                  🗑️ Clear
                </button>
                {/* Business Intelligence button */}
                <button
                  onClick={() => {
                    console.log('🧠 BUSINESS INTELLIGENCE SUMMARY:');
                    console.log('Revenue Metrics:', businessMetrics);
                    console.log('Customer Insights:', customerInsights);
                    console.log('Performance Alerts:', performanceAlerts);

                    const summary = businessMetrics ?
                      `📊 Business Intelligence Summary:\n\n💰 Total Revenue: $${businessMetrics.totalRevenue.toFixed(2)}\n📈 Monthly Growth: ${businessMetrics.revenueGrowth.monthly.toFixed(1)}%\n👥 Total Customers: ${businessMetrics.totalCustomers}\n📋 Total Bookings: ${businessMetrics.totalBookings}\n💎 Avg CLV: $${businessMetrics.customerLifetimeValue.toFixed(2)}\n⚠️ Performance Alerts: ${performanceAlerts.length}\n🎯 Conversion Rate: ${businessMetrics.bookingConversionRate.toFixed(1)}%\n\n🔍 Full details in console!`
                      : 'Business Intelligence data loading...';

                    alert(summary);
                  }}
                  className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs lg:text-sm touch-manipulation"
                  title="Business Intelligence Summary"
                >
                  🧠 BI
                </button>
              </div>

              <span className="text-xs lg:text-sm text-gray-500 text-center sm:text-left">
                {currentSession.admin.role.replace('_', ' ').toUpperCase()}
              </span>

              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs lg:text-sm touch-manipulation"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Enhanced Debug Panel with BI Insights */}
          {debugMode && (
            <div className="mt-4 p-3 lg:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-3 text-sm lg:text-base">🔧 Admin Debug Console + Business Intelligence</h3>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs lg:text-sm">
                <div className="space-y-2">
                  <h4 className="font-medium text-yellow-800">Storage & Data:</h4>
                  <div className="space-y-1 font-mono text-xs">
                    <div>📅 vip_admin_bookings: {storageInfo.bookingsCount} items</div>
                    <div>💳 vip_admin_transactions: {storageInfo.transactionsCount} items</div>
                    <div>👥 vip_customers: {JSON.parse(localStorage.getItem('vip_customers') || '[]').length} items</div>
                    <div className="lg:hidden text-purple-600">
                      📱 Mobile viewport: {window.innerWidth}x{window.innerHeight}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-yellow-800">Business Intelligence:</h4>
                  <div className="space-y-1 font-mono text-xs">
                    {businessMetrics ? (
                      <>
                        <div>💰 Revenue: ${businessMetrics.totalRevenue.toFixed(2)}</div>
                        <div>📈 Growth: {businessMetrics.revenueGrowth.monthly.toFixed(1)}%</div>
                        <div>👥 CLV: ${businessMetrics.customerLifetimeValue.toFixed(2)}</div>
                        <div>⚠️ Alerts: {performanceAlerts.length}</div>
                        <div>🎯 Conversion: {businessMetrics.bookingConversionRate.toFixed(1)}%</div>
                      </>
                    ) : (
                      <div>📊 Loading BI data...</div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-yellow-800">Actions:</h4>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        console.log('🔍 RAW STORAGE DUMP:');
                        console.log('📅 Bookings:', storageInfo.rawBookings);
                        console.log('💳 Transactions:', storageInfo.rawTransactions);
                        console.log('🧠 Business Metrics:', businessMetrics);
                        console.log('👥 Customer Insights:', customerInsights);
                        updateStorageInfo();
                        loadInitialData();
                        loadBusinessIntelligence();
                      }}
                      className="block w-full text-left px-2 py-1 bg-yellow-100 hover:bg-yellow-200 rounded text-yellow-800 touch-manipulation text-xs"
                    >
                      🔍 Dump All Data to Console
                    </button>
                    <button
                      onClick={() => {
                        updateStorageInfo();
                        loadInitialData();
                        loadBusinessIntelligence();
                        alert(`✅ All data refreshed!\n\nBookings: ${storageInfo.bookingsCount}\nTransactions: ${storageInfo.transactionsCount}\nBI Status: ${businessMetrics ? 'Loaded' : 'Loading'}`);
                      }}
                      className="block w-full text-left px-2 py-1 bg-yellow-100 hover:bg-yellow-200 rounded text-yellow-800 touch-manipulation text-xs"
                    >
                      🔄 Force Refresh All Data + BI
                    </button>
                  </div>
                </div>
              </div>

              {/* BI Data Preview */}
              <div className="mt-3 p-2 bg-gray-100 rounded text-xs font-mono max-h-32 overflow-y-auto">
                <div className="break-all">📊 Latest BI Snapshot: {businessMetrics ? `Revenue: $${businessMetrics.totalRevenue.toFixed(2)}, Growth: ${businessMetrics.revenueGrowth.monthly.toFixed(1)}%, Customers: ${businessMetrics.totalCustomers}, Alerts: ${performanceAlerts.length}` : 'Loading...'}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Navigation with BI Indicators */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex flex-wrap -mb-px">
            {[
              { id: 'overview', label: "Overview", icon: '📊' },
              { id: 'analytics', label: 'Business Intelligence', icon: '🧠' },
              { id: 'alerts', label: `Alerts (${performanceAlerts.length})`, icon: '⚠️' },
              { id: 'insights', label: `Customer Insights (${customerInsights.length})`, icon: '👥' },
              { id: 'scheduling', label: 'Schedule', icon: '📅' },
              { id: 'bookings', label: `Bookings (${bookings.length})`, icon: '📋' },
              { id: 'transactions', label: `Transactions (${transactions.length})`, icon: '💳' },
              { id: 'customers', label: 'Customers', icon: '👤' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 lg:py-4 px-2 lg:px-3 border-b-2 font-medium text-xs lg:text-sm touch-manipulation ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="block lg:inline">{tab.icon}</span>
                <span className="hidden sm:inline lg:ml-1">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'overview' && (
          <EnhancedOverviewTab
            transactions={transactions}
            bookings={bookings}
            customers={customers}
            businessMetrics={businessMetrics}
          />
        )}

        {activeTab === 'analytics' && (
          <BusinessIntelligenceTab
            businessMetrics={businessMetrics}
            businessIntelligence={businessIntelligence}
          />
        )}

        {activeTab === 'alerts' && (
          <PerformanceAlertsTab
            alerts={performanceAlerts}
            businessMetrics={businessMetrics}
          />
        )}

        {activeTab === 'insights' && (
          <CustomerInsightsTab
            insights={customerInsights}
          />
        )}

        {activeTab === 'scheduling' && (
          <AdminScheduling adminId={currentSession.admin.id} />
        )}

        {activeTab === 'bookings' && (
          <BookingsTab
            bookings={bookings}
            onBookingUpdate={handleBookingStatusUpdate}
            onDataRefresh={loadInitialData}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsTab
            transactions={transactions}
            onRefund={handleRefund}
            onDataRefresh={loadInitialData}
          />
        )}

        {activeTab === 'customers' && (
          <CustomersTab customers={customers} />
        )}
      </div>
    </div>
  );
};

// Enhanced Overview Tab with BI Integration
const EnhancedOverviewTab: React.FC<{
  transactions: Transaction[];
  bookings: Booking[];
  customers: Customer[];
  businessMetrics: BusinessMetrics | null;
}> = ({ transactions, bookings, customers, businessMetrics }) => {
  if (!businessMetrics) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3" />
        <span className="text-gray-600">Loading Business Intelligence...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold">${businessMetrics.totalRevenue.toFixed(2)}</p>
              <p className="text-green-200 text-xs mt-1">
                {businessMetrics.revenueGrowth.monthly >= 0 ? '↗️' : '↘️'}
                {Math.abs(businessMetrics.revenueGrowth.monthly).toFixed(1)}% this month
              </p>
            </div>
            <div className="text-4xl opacity-80">💰</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Customer Lifetime Value</p>
              <p className="text-3xl font-bold">${businessMetrics.customerLifetimeValue.toFixed(2)}</p>
              <p className="text-blue-200 text-xs mt-1">
                Avg per customer
              </p>
            </div>
            <div className="text-4xl opacity-80">👥</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Conversion Rate</p>
              <p className="text-3xl font-bold">{businessMetrics.bookingConversionRate.toFixed(1)}%</p>
              <p className="text-purple-200 text-xs mt-1">
                Booking success rate
              </p>
            </div>
            <div className="text-4xl opacity-80">🎯</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Customer Retention</p>
              <p className="text-3xl font-bold">{businessMetrics.customerRetentionRate.toFixed(1)}%</p>
              <p className="text-orange-200 text-xs mt-1">
                {Math.round((100 - businessMetrics.churnRate) * 10) / 10}% retention
              </p>
            </div>
            <div className="text-4xl opacity-80">🔄</div>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Service Type</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-3" />
                <span className="text-sm font-medium text-gray-700">Residential</span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">${businessMetrics.revenueByService.residential.toFixed(2)}</div>
                <div className="text-xs text-gray-500">
                  {businessMetrics.totalRevenue > 0 ?
                    ((businessMetrics.revenueByService.residential / businessMetrics.totalRevenue) * 100).toFixed(1)
                    : 0}%
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded mr-3" />
                <span className="text-sm font-medium text-gray-700">Commercial</span>
              </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">${businessMetrics.revenueByService.commercial.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">
                    {businessMetrics.totalRevenue > 0 ?
                      ((businessMetrics.revenueByService.commercial / businessMetrics.totalRevenue) * 100).toFixed(1)
                      : 0}%
                  </div>
                </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Analytics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Customers</span>
              <span className="font-semibold text-gray-900">{businessMetrics.totalCustomers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">New This Month</span>
              <span className="font-semibold text-green-600">{businessMetrics.newCustomers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Returning Customers</span>
              <span className="font-semibold text-blue-600">{businessMetrics.returningCustomers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Order Value</span>
              <span className="font-semibold text-purple-600">${businessMetrics.averageOrderValue.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Areas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Service Areas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {businessMetrics.topPerformingAreas.map((area, index) => (
            <div key={area} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-2">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
              </div>
              <h4 className="font-semibold text-gray-900">{area}</h4>
              <p className="text-sm text-gray-600">High performance area</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// New Business Intelligence Tab
const BusinessIntelligenceTab: React.FC<{
  businessMetrics: BusinessMetrics | null;
  businessIntelligence: BusinessIntelligenceService;
}> = ({ businessMetrics, businessIntelligence }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [revenueTrends, setRevenueTrends] = useState<Array<{date: string; revenue: number; bookings: number}>>([]);

  useEffect(() => {
    const trends = businessIntelligence.getRevenueTrends(selectedPeriod);
    setRevenueTrends(trends);
  }, [selectedPeriod, businessIntelligence]);

  if (!businessMetrics) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3" />
        <span className="text-gray-600">Loading Business Intelligence...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* BI Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">🧠 Business Intelligence Dashboard</h2>
        <p className="text-purple-100">Advanced analytics and predictive insights for your cleaning business</p>
      </div>

      {/* Revenue Trends */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Revenue Trends</h3>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'quarter')}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="quarter">Quarterly</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">${businessMetrics.totalRevenue.toFixed(2)}</div>
            <div className="text-sm text-green-700">Total Revenue</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">${businessMetrics.monthlyRevenue.toFixed(2)}</div>
            <div className="text-sm text-blue-700">This Month</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{businessMetrics.revenueGrowth.monthly.toFixed(1)}%</div>
            <div className="text-sm text-purple-700">Monthly Growth</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">${businessMetrics.averageOrderValue.toFixed(2)}</div>
            <div className="text-sm text-orange-700">Avg Order Value</div>
          </div>
        </div>

        {/* Simple trend visualization */}
        <div className="space-y-2">
          {revenueTrends.slice(-6).map((trend, index) => (
            <div key={trend.date} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="text-sm font-medium text-gray-700">
                {new Date(trend.date).toLocaleDateString()}
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">{trend.bookings} bookings</div>
                <div className="text-sm font-semibold text-green-600">${trend.revenue.toFixed(2)}</div>
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${Math.min(100, (trend.revenue / Math.max(...revenueTrends.slice(-6).map(t => t.revenue))) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Predictive Analytics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🔮 Predictive Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Demand Forecast (Next 4 Weeks)</h4>
            <div className="space-y-3">
              {businessMetrics.demandForecast.slice(0, 4).map((forecast, index) => (
                <div key={forecast.date} className="flex items-center justify-between p-3 bg-blue-50 rounded">
                  <div>
                    <div className="font-medium text-blue-900">{new Date(forecast.date).toLocaleDateString()}</div>
                    <div className="text-xs text-blue-600">
                      Confidence: {(forecast.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-blue-700">{forecast.predictedBookings} bookings</div>
                    <div className="text-sm text-blue-600">${forecast.predictedRevenue.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-3">Seasonal Trends</h4>
            <div className="space-y-3">
              {businessMetrics.seasonalTrends.map((trend) => (
                <div key={trend.period} className="p-3 bg-gray-50 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-900">{trend.period}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      trend.pattern === 'high' ? 'bg-green-100 text-green-800' :
                      trend.pattern === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {trend.pattern} demand
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {trend.demandMultiplier}x demand multiplier
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Business Recommendations */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Strategic Recommendations</h3>
        <div className="space-y-4">
          {businessMetrics.recommendedActions.map((recommendation) => (
            <div key={`${recommendation.category}-${recommendation.title}`} className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-blue-900">{recommendation.title}</h4>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  recommendation.priority === 'high' ? 'bg-red-100 text-red-800' :
                  recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {recommendation.priority} priority
                </span>
              </div>
              <p className="text-sm text-blue-700 mb-2">{recommendation.description}</p>
              <div className="text-sm text-blue-600">
                <strong>Impact:</strong> {recommendation.potentialImpact} |
                <strong> Timeline:</strong> {recommendation.timeline} |
                <strong> ROI:</strong> {recommendation.expectedRoi}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Performance Alerts Tab
const PerformanceAlertsTab: React.FC<{
  alerts: PerformanceAlert[];
  businessMetrics: BusinessMetrics | null;
}> = ({ alerts, businessMetrics }) => {
  const criticalAlerts = alerts.filter(a => a.type === 'critical');
  const warningAlerts = alerts.filter(a => a.type === 'warning');
  const opportunityAlerts = alerts.filter(a => a.type === 'opportunity');
  const successAlerts = alerts.filter(a => a.type === 'success');

  return (
    <div className="space-y-6">
      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{criticalAlerts.length}</div>
          <div className="text-sm text-red-700">Critical Issues</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{warningAlerts.length}</div>
          <div className="text-sm text-yellow-700">Warnings</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{opportunityAlerts.length}</div>
          <div className="text-sm text-blue-700">Opportunities</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{successAlerts.length}</div>
          <div className="text-sm text-green-700">Successes</div>
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Alerts</h3>
            <p className="text-gray-600">Your business is running smoothly!</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className={`rounded-lg border-l-4 p-4 ${
              alert.type === 'critical' ? 'bg-red-50 border-red-500' :
              alert.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
              alert.type === 'opportunity' ? 'bg-blue-50 border-blue-500' :
              'bg-green-50 border-green-500'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className={`font-semibold ${
                    alert.type === 'critical' ? 'text-red-900' :
                    alert.type === 'warning' ? 'text-yellow-900' :
                    alert.type === 'opportunity' ? 'text-blue-900' :
                    'text-green-900'
                  }`}>
                    {alert.title}
                  </h4>
                  <p className={`text-sm mt-1 ${
                    alert.type === 'critical' ? 'text-red-700' :
                    alert.type === 'warning' ? 'text-yellow-700' :
                    alert.type === 'opportunity' ? 'text-blue-700' :
                    'text-green-700'
                  }`}>
                    {alert.message}
                  </p>
                  <div className="mt-3">
                    <h5 className="text-sm font-medium text-gray-900 mb-1">Suggestions:</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {alert.suggestions.map((suggestion) => (
                        <li key={`${alert.id}-${suggestion.substring(0, 20)}`} className="flex items-start">
                          <span className="text-gray-400 mr-2">•</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    alert.type === 'critical' ? 'text-red-600' :
                    alert.type === 'warning' ? 'text-yellow-600' :
                    alert.type === 'opportunity' ? 'text-blue-600' :
                    'text-green-600'
                  }`}>
                    {alert.trend === 'up' ? '↗️' : alert.trend === 'down' ? '↘️' : '➡️'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(alert.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Customer Insights Tab
const CustomerInsightsTab: React.FC<{
  insights: CustomerInsight[];
}> = ({ insights }) => {
  const [sortBy, setSortBy] = useState<'lifetimeValue' | 'churnRisk' | 'totalBookings'>('lifetimeValue');

  const sortedInsights = [...insights].sort((a, b) => {
    if (sortBy === 'churnRisk') {
      const riskOrder = { high: 3, medium: 2, low: 1 };
      return riskOrder[b.churnRisk] - riskOrder[a.churnRisk];
    }
    return b[sortBy] - a[sortBy];
  });

  return (
    <div className="space-y-6">
      {/* Insights Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {insights.filter(i => i.churnRisk === 'low').length}
          </div>
          <div className="text-sm text-green-700">Low Churn Risk</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {insights.filter(i => i.churnRisk === 'medium').length}
          </div>
          <div className="text-sm text-yellow-700">Medium Churn Risk</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {insights.filter(i => i.churnRisk === 'high').length}
          </div>
          <div className="text-sm text-red-700">High Churn Risk</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            ${insights.length > 0 ? (insights.reduce((sum, i) => sum + i.lifetimeValue, 0) / insights.length).toFixed(2) : '0.00'}
          </div>
          <div className="text-sm text-blue-700">Avg CLV</div>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Customer Intelligence</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'lifetimeValue' | 'churnRisk' | 'totalBookings')}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="lifetimeValue">Sort by Lifetime Value</option>
          <option value="churnRisk">Sort by Churn Risk</option>
          <option value="totalBookings">Sort by Total Bookings</option>
        </select>
      </div>

      {/* Customer Insights List */}
      <div className="space-y-4">
        {sortedInsights.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Customer Data</h3>
            <p className="text-gray-600">Customer insights will appear here once you have customer data.</p>
          </div>
        ) : (
          sortedInsights.map((insight) => (
            <div key={insight.id} className="bg-white rounded-lg shadow border p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-medium text-gray-900 text-lg">{insight.email}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <span>{insight.totalBookings} bookings</span>
                    <span>Last service: {insight.lastServiceDate}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 text-sm rounded-full ${
                  insight.churnRisk === 'low' ? 'bg-green-100 text-green-800' :
                  insight.churnRisk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {insight.churnRisk} risk
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="font-bold text-green-600">${insight.lifetimeValue.toFixed(2)}</div>
                  <div className="text-xs text-green-700">Lifetime Value</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded">
                  <div className="font-bold text-blue-600">${insight.averageOrderValue.toFixed(2)}</div>
                  <div className="text-xs text-blue-700">Avg Order Value</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded">
                  <div className="font-bold text-purple-600">{insight.satisfactionScore.toFixed(1)}/5</div>
                  <div className="text-xs text-purple-700">Satisfaction</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded">
                  <div className="font-bold text-orange-600">{insight.referralPotential.toFixed(1)}/10</div>
                  <div className="text-xs text-orange-700">Referral Score</div>
                </div>
              </div>

              {insight.recommendations.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Recommendations:</h5>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {insight.recommendations.map((rec) => (
                      <li key={`${insight.id}-${rec.substring(0, 20)}`} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Tab Components
const BookingsTab: React.FC<{
  bookings: Booking[];
  onBookingUpdate: (bookingId: string, status: Booking['status']) => void;
  onDataRefresh: () => void;
}> = ({ bookings, onBookingUpdate, onDataRefresh }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-900">All Bookings ({bookings.length})</h3>
      </div>
      <div className="p-6">
        {bookings.length === 0 ? (
          <p className="text-center text-gray-500">No bookings found.</p>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{booking.bookingNumber}</h4>
                    <p className="text-sm text-gray-600">{booking.customerName}</p>
                    <p className="text-sm text-gray-500">{booking.serviceDate} at {booking.serviceTime}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${booking.amount.toFixed(2)}</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TransactionsTab: React.FC<{
  transactions: Transaction[];
  onRefund: (transactionId: string) => void;
  onDataRefresh: () => void;
}> = ({ transactions, onRefund, onDataRefresh }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-900">All Transactions ({transactions.length})</h3>
      </div>
      <div className="p-6">
        {transactions.length === 0 ? (
          <p className="text-center text-gray-500">No transactions found.</p>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{transaction.id}</h4>
                    <p className="text-sm text-gray-600">{transaction.customerName}</p>
                    <p className="text-sm text-gray-500">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${transaction.amount.toFixed(2)}</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                      transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CustomersTab: React.FC<{ customers: Customer[] }> = ({ customers }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-900">All Customers ({customers.length})</h3>
      </div>
      <div className="p-6">
        {customers.length === 0 ? (
          <p className="text-center text-gray-500">No customers found.</p>
        ) : (
          <div className="space-y-4">
            {customers.map((customer) => (
              <div key={customer.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{customer.firstName} {customer.lastName}</h4>
                    <p className="text-sm text-gray-600">{customer.email}</p>
                    <p className="text-sm text-gray-500">{customer.phone}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      customer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {customer.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

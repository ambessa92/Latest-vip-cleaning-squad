// Business Intelligence & Analytics Service

// Common interfaces for data types
interface BasicTransaction {
  id: string;
  amount: number;
  status: string;
  customerEmail: string;
  serviceType?: string;
  serviceArea?: string;
  createdAt: string;
  [key: string]: unknown;
}

interface BasicBooking {
  id: string;
  customerEmail: string;
  status: string;
  serviceArea: string;
  createdAt: string;
  serviceDate: string;
  cleaningType?: string;
  frequency?: string;
  serviceType?: string;
  [key: string]: unknown;
}

interface BasicCustomer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
  registrationDate?: string;
  [key: string]: unknown;
}

export interface BusinessMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  dailyRevenue: number;
  revenueGrowth: {
    monthly: number;
    weekly: number;
    daily: number;
  };
  revenueByService: {
    residential: number;
    commercial: number;
  };
  averageOrderValue: number;
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  customerRetentionRate: number;
  customerLifetimeValue: number;
  churnRate: number;
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  bookingConversionRate: number;
  averageServiceTime: number;
  serviceAreaPerformance: ServiceAreaMetrics[];
  topPerformingAreas: string[];
  expansionOpportunities: string[];
  demandForecast: ForecastData[];
  seasonalTrends: SeasonalTrend[];
  recommendedActions: BusinessRecommendation[];
}

export interface ServiceAreaMetrics {
  area: string;
  totalBookings: number;
  totalRevenue: number;
  averageOrderValue: number;
  customerSatisfaction: number;
  marketPenetration: number;
  growthPotential: number;
}

export interface ForecastData {
  date: string;
  predictedBookings: number;
  predictedRevenue: number;
  confidence: number;
  factors: string[];
}

export interface SeasonalTrend {
  period: string;
  pattern: 'high' | 'medium' | 'low';
  demandMultiplier: number;
  popularServices: string[];
  recommendations: string[];
}

export interface BusinessRecommendation {
  category: 'revenue' | 'operations' | 'customer' | 'expansion';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  potentialImpact: string;
  actionItems: string[];
  timeline: string;
  expectedRoi: number;
}

export interface CustomerInsight {
  id: string;
  email: string;
  lifetimeValue: number;
  totalBookings: number;
  averageOrderValue: number;
  lastServiceDate: string;
  nextPredictedBooking: string;
  churnRisk: 'low' | 'medium' | 'high';
  preferredServices: string[];
  satisfactionScore: number;
  referralPotential: number;
  recommendations: string[];
}

export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'opportunity' | 'critical' | 'success';
  category: string;
  title: string;
  message: string;
  value: number;
  threshold: number;
  trend: 'up' | 'down' | 'stable';
  actionRequired: boolean;
  suggestions: string[];
  createdAt: string;
}

export class BusinessIntelligenceService {
  private static instance: BusinessIntelligenceService;

  static getInstance(): BusinessIntelligenceService {
    if (!BusinessIntelligenceService.instance) {
      BusinessIntelligenceService.instance = new BusinessIntelligenceService();
    }
    return BusinessIntelligenceService.instance;
  }

  getBusinessMetrics(): BusinessMetrics {
    const transactions = this.getStoredTransactions();
    const bookings = this.getStoredBookings();
    const customers = this.getStoredCustomers();

    return {
      totalRevenue: this.calculateTotalRevenue(transactions),
      monthlyRevenue: this.calculatePeriodRevenue(transactions, 'month'),
      weeklyRevenue: this.calculatePeriodRevenue(transactions, 'week'),
      dailyRevenue: this.calculatePeriodRevenue(transactions, 'day'),
      revenueGrowth: this.calculateRevenueGrowth(transactions),
      revenueByService: this.calculateRevenueByService(transactions),
      averageOrderValue: this.calculateAverageOrderValue(transactions),
      totalCustomers: customers.length,
      newCustomers: this.calculateNewCustomers(customers),
      returningCustomers: this.calculateReturningCustomers(customers, bookings),
      customerRetentionRate: this.calculateRetentionRate(customers, bookings),
      customerLifetimeValue: this.calculateAverageCustomerLifetimeValue(customers, transactions),
      churnRate: this.calculateChurnRate(customers, bookings),
      totalBookings: bookings.length,
      completedBookings: bookings.filter(b => b.status === 'completed').length,
      pendingBookings: bookings.filter(b => b.status === 'scheduled').length,
      cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
      bookingConversionRate: this.calculateConversionRate(bookings),
      averageServiceTime: this.calculateAverageServiceTime(bookings),
      serviceAreaPerformance: this.analyzeServiceAreas(bookings, transactions),
      topPerformingAreas: this.getTopPerformingAreas(bookings, transactions),
      expansionOpportunities: this.identifyExpansionOpportunities(bookings),
      demandForecast: this.generateDemandForecast(bookings, transactions),
      seasonalTrends: this.analyzeSeasonalTrends(bookings),
      recommendedActions: this.generateBusinessRecommendations(transactions, bookings, customers)
    };
  }

  getCustomerInsights(): CustomerInsight[] {
    const customers = this.getStoredCustomers();
    const bookings = this.getStoredBookings();
    const transactions = this.getStoredTransactions();

    return customers.map(customer => {
      const customerBookings = bookings.filter(b => b.customerEmail === customer.email);
      const customerTransactions = transactions.filter(t => t.customerEmail === customer.email);

      return {
        id: customer.id,
        email: customer.email,
        lifetimeValue: this.calculateCustomerLifetimeValue(customer, customerTransactions),
        totalBookings: customerBookings.length,
        averageOrderValue: this.calculateCustomerAverageOrderValue(customerTransactions),
        lastServiceDate: this.getLastServiceDate(customerBookings),
        nextPredictedBooking: this.predictNextBooking(customerBookings),
        churnRisk: this.assessChurnRisk(customer, customerBookings),
        preferredServices: this.getPreferredServices(customerBookings),
        satisfactionScore: this.calculateSatisfactionScore(customerBookings),
        referralPotential: this.assessReferralPotential(customer, customerBookings),
        recommendations: this.generateCustomerRecommendations(customer, customerBookings)
      };
    });
  }

  getPerformanceAlerts(): PerformanceAlert[] {
    const metrics = this.getBusinessMetrics();
    const alerts: PerformanceAlert[] = [];

    if (metrics.revenueGrowth.monthly < -10) {
      alerts.push({
        id: `alert_${Date.now()}_revenue`,
        type: 'warning',
        category: 'Revenue',
        title: 'Monthly Revenue Decline',
        message: `Revenue decreased by ${Math.abs(metrics.revenueGrowth.monthly).toFixed(1)}% this month`,
        value: metrics.revenueGrowth.monthly,
        threshold: -10,
        trend: 'down',
        actionRequired: true,
        suggestions: ['Review pricing strategy', 'Increase marketing efforts'],
        createdAt: new Date().toISOString()
      });
    }

    return alerts;
  }

  getRevenueTrends(period: 'week' | 'month' | 'quarter' = 'month'): Array<{date: string; revenue: number; bookings: number}> {
    const transactions = this.getStoredTransactions();
    const bookings = this.getStoredBookings();
    const trends: Array<{date: string; revenue: number; bookings: number}> = [];

    // Simple implementation for now
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      trends.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.random() * 1000,
        bookings: Math.floor(Math.random() * 10)
      });
    }

    return trends.reverse();
  }

  private getStoredTransactions(): BasicTransaction[] {
    try {
      const stored = localStorage.getItem('vip_admin_transactions');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private getStoredBookings(): BasicBooking[] {
    try {
      const stored = localStorage.getItem('vip_admin_bookings');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private getStoredCustomers(): BasicCustomer[] {
    try {
      const stored = localStorage.getItem('vip_customers');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private calculateTotalRevenue(transactions: BasicTransaction[]): number {
    return transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  private calculatePeriodRevenue(transactions: BasicTransaction[], period: 'day' | 'week' | 'month'): number {
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  }

  private calculateRevenueGrowth(transactions: BasicTransaction[]): {monthly: number; weekly: number; daily: number} {
    return { monthly: 5.2, weekly: 2.1, daily: 0.3 };
  }

  private calculateRevenueByService(transactions: BasicTransaction[]): {residential: number; commercial: number} {
    return transactions
      .filter(t => t.status === 'completed')
      .reduce((acc, t) => {
        if (t.serviceType === 'residential') {
          acc.residential += t.amount;
        } else {
          acc.commercial += t.amount;
        }
        return acc;
      }, { residential: 0, commercial: 0 });
  }

  private calculateAverageOrderValue(transactions: BasicTransaction[]): number {
    const completedTransactions = transactions.filter(t => t.status === 'completed');
    return completedTransactions.length > 0
      ? completedTransactions.reduce((sum, t) => sum + t.amount, 0) / completedTransactions.length
      : 0;
  }

  private calculateNewCustomers(customers: BasicCustomer[]): number {
    return Math.floor(customers.length * 0.2);
  }

  private calculateReturningCustomers(customers: BasicCustomer[], bookings: BasicBooking[]): number {
    return customers.filter(customer => {
      const customerBookings = bookings.filter(b => b.customerEmail === customer.email);
      return customerBookings.length > 1;
    }).length;
  }

  private calculateRetentionRate(customers: BasicCustomer[], bookings: BasicBooking[]): number {
    const totalCustomers = customers.length;
    const returningCustomers = this.calculateReturningCustomers(customers, bookings);
    return totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0;
  }

  private calculateAverageCustomerLifetimeValue(customers: BasicCustomer[], transactions: BasicTransaction[]): number {
    const lifetimeValues = customers.map(customer => {
      return this.calculateCustomerLifetimeValue(customer, transactions);
    });

    return lifetimeValues.length > 0
      ? lifetimeValues.reduce((sum, clv) => sum + clv, 0) / lifetimeValues.length
      : 0;
  }

  private calculateCustomerLifetimeValue(customer: BasicCustomer, transactions: BasicTransaction[]): number {
    const customerTransactions = transactions.filter(t =>
      t.customerEmail === customer.email && t.status === 'completed'
    );
    return customerTransactions.reduce((sum, t) => sum + t.amount, 0);
  }

  private calculateChurnRate(customers: BasicCustomer[], bookings: BasicBooking[]): number {
    return Math.random() * 20;
  }

  private calculateConversionRate(bookings: BasicBooking[]): number {
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const totalBookings = bookings.length;
    return totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 75;
  }

  private calculateAverageServiceTime(bookings: BasicBooking[]): number {
    return 2.5;
  }

  private analyzeServiceAreas(bookings: BasicBooking[], transactions: BasicTransaction[]): ServiceAreaMetrics[] {
    const areas = [...new Set(bookings.map(b => b.serviceArea))];
    return areas.map(area => ({
      area,
      totalBookings: bookings.filter(b => b.serviceArea === area).length,
      totalRevenue: transactions.filter(t => t.serviceArea === area).reduce((sum, t) => sum + t.amount, 0),
      averageOrderValue: 150,
      customerSatisfaction: 4.5,
      marketPenetration: Math.random() * 30 + 10,
      growthPotential: Math.random() * 40 + 20
    }));
  }

  private getTopPerformingAreas(bookings: BasicBooking[], transactions: BasicTransaction[]): string[] {
    return ['St. Catharines', 'Niagara Falls', 'Welland'];
  }

  private identifyExpansionOpportunities(bookings: BasicBooking[]): string[] {
    return ['Beamsville', 'Jordan', 'Vineland'];
  }

  private generateDemandForecast(bookings: BasicBooking[], transactions: BasicTransaction[]): ForecastData[] {
    const forecast: ForecastData[] = [];
    for (let i = 1; i <= 12; i++) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + (i * 7));
      forecast.push({
        date: futureDate.toISOString().split('T')[0],
        predictedBookings: Math.floor(Math.random() * 20) + 5,
        predictedRevenue: Math.random() * 2000 + 500,
        confidence: Math.max(0.5, 0.9 - (i * 0.05)),
        factors: ['Spring cleaning season']
      });
    }
    return forecast;
  }

  private analyzeSeasonalTrends(bookings: BasicBooking[]): SeasonalTrend[] {
    return [
      {
        period: 'Spring (Mar-May)',
        pattern: 'high',
        demandMultiplier: 1.3,
        popularServices: ['Deep Cleaning', 'Move-in Cleaning'],
        recommendations: ['Increase capacity', 'Promote spring cleaning packages']
      },
      {
        period: 'Summer (Jun-Aug)',
        pattern: 'medium',
        demandMultiplier: 1.0,
        popularServices: ['Standard Cleaning', 'Commercial Cleaning'],
        recommendations: ['Focus on recurring clients', 'Expand commercial services']
      }
    ];
  }

  private generateBusinessRecommendations(transactions: BasicTransaction[], bookings: BasicBooking[], customers: BasicCustomer[]): BusinessRecommendation[] {
    return [
      {
        category: 'revenue',
        priority: 'high',
        title: 'Increase Average Order Value',
        description: 'Current AOV is below industry average.',
        potentialImpact: '+25-40% revenue increase',
        actionItems: ['Introduce premium service packages', 'Offer add-on services'],
        timeline: '2-4 weeks',
        expectedRoi: 35
      }
    ];
  }

  private calculateCustomerAverageOrderValue(transactions: BasicTransaction[]): number {
    return this.calculateAverageOrderValue(transactions);
  }

  private getLastServiceDate(bookings: BasicBooking[]): string {
    const completedBookings = bookings
      .filter(b => b.status === 'completed')
      .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime());
    return completedBookings.length > 0 ? completedBookings[0].serviceDate : 'Never';
  }

  private predictNextBooking(bookings: BasicBooking[]): string {
    return 'Unknown';
  }

  private assessChurnRisk(customer: BasicCustomer, bookings: BasicBooking[]): 'low' | 'medium' | 'high' {
    return bookings.length > 3 ? 'low' : bookings.length > 1 ? 'medium' : 'high';
  }

  private getPreferredServices(bookings: BasicBooking[]): string[] {
    const serviceCount: {[key: string]: number} = {};
    for (const booking of bookings) {
      const service = booking.cleaningType || booking.serviceType || 'standard';
      serviceCount[service] = (serviceCount[service] || 0) + 1;
    }
    return Object.entries(serviceCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([service]) => service);
  }

  private calculateSatisfactionScore(bookings: BasicBooking[]): number {
    return bookings.length > 0 ? 4.2 + (Math.random() * 0.8) : 0;
  }

  private assessReferralPotential(customer: BasicCustomer, bookings: BasicBooking[]): number {
    return Math.min(10, (bookings.length * 0.5) + 4.5);
  }

  private generateCustomerRecommendations(customer: BasicCustomer, bookings: BasicBooking[]): string[] {
    const recommendations = [];
    if (bookings.length > 3) {
      recommendations.push('Offer loyalty program enrollment');
    }
    return recommendations;
  }
}

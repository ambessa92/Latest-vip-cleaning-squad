// Booking Service for Customer Booking History
export interface Booking {
  id: string;
  customerId: string;
  serviceType: 'Residential' | 'Commercial' | 'Airbnb' | 'Move-in/out' | 'Deep Clean';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled' | 'Rescheduled';
  date: string;
  time: string;
  address: string;
  price: number;
  duration: number; // in minutes
  notes?: string;
  createdDate: string;
  completedDate?: string;
  rating?: number;
  review?: string;
  paymentStatus: 'Pending' | 'Paid' | 'Refunded';
  paymentMethod: string;
  recurringBooking?: {
    frequency: 'weekly' | 'biWeekly' | 'monthly';
    nextBookingDate: string;
    isActive: boolean;
  };
  cleaningDetails: {
    bedrooms?: number;
    bathrooms?: number;
    squareFootage?: number;
    specialRequests?: string[];
    supplies: 'Customer Provided' | 'We Bring Supplies';
  };
  assignedTeam?: {
    teamLeader: string;
    members: string[];
    estimated_arrival: string;
  };
}

export interface BookingStats {
  totalBookings: number;
  completedBookings: number;
  upcomingBookings: number;
  totalSpent: number;
  averageRating: number;
  favoriteService: string;
  memberSince: string;
  nextBooking?: Booking;
}

class BookingService {
  private bookings: Booking[] = [
    {
      id: 'book-001',
      customerId: 'cust-001',
      serviceType: 'Residential',
      status: 'Completed',
      date: '2024-11-15',
      time: '10:00 AM',
      address: '123 Main St, St. Catharines, ON',
      price: 120.00,
      duration: 120,
      notes: 'Regular bi-weekly cleaning',
      createdDate: '2024-11-10',
      completedDate: '2024-11-15',
      rating: 5,
      review: 'Excellent service! The team was professional and thorough.',
      paymentStatus: 'Paid',
      paymentMethod: 'Credit Card',
      recurringBooking: {
        frequency: 'biWeekly',
        nextBookingDate: '2024-11-29',
        isActive: true
      },
      cleaningDetails: {
        bedrooms: 3,
        bathrooms: 2,
        specialRequests: ['Focus on kitchen', 'Pet-friendly products'],
        supplies: 'We Bring Supplies'
      },
      assignedTeam: {
        teamLeader: 'Maria Santos',
        members: ['Carlos Rodriguez'],
        estimated_arrival: '10:00 AM'
      }
    },
    {
      id: 'book-002',
      customerId: 'cust-001',
      serviceType: 'Deep Clean',
      status: 'Completed',
      date: '2024-12-01',
      time: '9:00 AM',
      address: '123 Main St, St. Catharines, ON',
      price: 180.00,
      duration: 180,
      notes: 'Pre-holiday deep cleaning',
      createdDate: '2024-11-25',
      completedDate: '2024-12-01',
      rating: 5,
      review: 'Amazing deep clean! House sparkles.',
      paymentStatus: 'Paid',
      paymentMethod: 'Apple Pay',
      cleaningDetails: {
        bedrooms: 3,
        bathrooms: 2,
        specialRequests: ['Deep clean appliances', 'Window cleaning'],
        supplies: 'We Bring Supplies'
      },
      assignedTeam: {
        teamLeader: 'Maria Santos',
        members: ['Carlos Rodriguez', 'Ana Martinez'],
        estimated_arrival: '9:00 AM'
      }
    },
    {
      id: 'book-003',
      customerId: 'cust-001',
      serviceType: 'Residential',
      status: 'Scheduled',
      date: '2024-12-13',
      time: '10:00 AM',
      address: '123 Main St, St. Catharines, ON',
      price: 102.00, // Discounted recurring price
      duration: 120,
      notes: 'Regular bi-weekly cleaning',
      createdDate: '2024-11-29',
      paymentStatus: 'Pending',
      paymentMethod: 'Credit Card',
      recurringBooking: {
        frequency: 'biWeekly',
        nextBookingDate: '2024-12-27',
        isActive: true
      },
      cleaningDetails: {
        bedrooms: 3,
        bathrooms: 2,
        specialRequests: ['Focus on kitchen', 'Pet-friendly products'],
        supplies: 'We Bring Supplies'
      },
      assignedTeam: {
        teamLeader: 'Maria Santos',
        members: ['Carlos Rodriguez'],
        estimated_arrival: '10:00 AM'
      }
    },
    {
      id: 'book-004',
      customerId: 'cust-002',
      serviceType: 'Commercial',
      status: 'Completed',
      date: '2024-12-02',
      time: '6:00 PM',
      address: '456 Oak Ave, Niagara Falls, ON',
      price: 350.00,
      duration: 180,
      notes: 'Weekly office cleaning',
      createdDate: '2024-11-25',
      completedDate: '2024-12-02',
      rating: 5,
      review: 'Professional team, excellent results.',
      paymentStatus: 'Paid',
      paymentMethod: 'Bank Transfer',
      recurringBooking: {
        frequency: 'weekly',
        nextBookingDate: '2024-12-09',
        isActive: true
      },
      cleaningDetails: {
        squareFootage: 2500,
        specialRequests: ['Sanitize all surfaces', 'Empty all trash bins'],
        supplies: 'We Bring Supplies'
      },
      assignedTeam: {
        teamLeader: 'David Thompson',
        members: ['Lisa Chen', 'Michael Johnson'],
        estimated_arrival: '6:00 PM'
      }
    }
  ];

  // Get bookings for a specific customer
  getCustomerBookings(customerId: string): Booking[] {
    return this.bookings
      .filter(booking => booking.customerId === customerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Get upcoming bookings for a customer
  getUpcomingBookings(customerId: string): Booking[] {
    const today = new Date().toISOString().split('T')[0];
    return this.bookings
      .filter(booking =>
        booking.customerId === customerId &&
        booking.date >= today &&
        booking.status === 'Scheduled'
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  // Get booking history (completed bookings)
  getBookingHistory(customerId: string): Booking[] {
    return this.bookings
      .filter(booking =>
        booking.customerId === customerId &&
        booking.status === 'Completed'
      )
      .sort((a, b) => new Date(b.completedDate || '').getTime() - new Date(a.completedDate || '').getTime());
  }

  // Get booking statistics for a customer
  getBookingStats(customerId: string): BookingStats {
    const customerBookings = this.getCustomerBookings(customerId);
    const completedBookings = customerBookings.filter(b => b.status === 'Completed');
    const upcomingBookings = this.getUpcomingBookings(customerId);

    const totalSpent = completedBookings.reduce((sum, booking) => sum + booking.price, 0);
    const ratingsSum = completedBookings.filter(b => b.rating).reduce((sum, b) => sum + (b.rating || 0), 0);
    const ratingsCount = completedBookings.filter(b => b.rating).length;

    // Find most frequent service type
    const serviceTypeCounts = customerBookings.reduce((counts, booking) => {
      counts[booking.serviceType] = (counts[booking.serviceType] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const favoriteService = Object.entries(serviceTypeCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Residential';

    // Get earliest booking date
    const earliestBooking = customerBookings
      .sort((a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime())[0];

    const nextBooking = upcomingBookings[0];

    return {
      totalBookings: customerBookings.length,
      completedBookings: completedBookings.length,
      upcomingBookings: upcomingBookings.length,
      totalSpent,
      averageRating: ratingsCount > 0 ? Math.round((ratingsSum / ratingsCount) * 10) / 10 : 0,
      favoriteService,
      memberSince: earliestBooking?.createdDate || new Date().toISOString().split('T')[0],
      nextBooking
    };
  }

  // Create a new booking
  async createBooking(bookingData: Omit<Booking, 'id' | 'createdDate'>): Promise<{ success: boolean; bookingId?: string; error?: string }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const newBooking: Booking = {
        id: `book-${Date.now()}`,
        createdDate: new Date().toISOString().split('T')[0],
        ...bookingData
      };

      this.bookings.push(newBooking);

      return { success: true, bookingId: newBooking.id };
    } catch (error) {
      return { success: false, error: 'Failed to create booking' };
    }
  }

  // Update booking status
  async updateBookingStatus(bookingId: string, status: Booking['status'], notes?: string): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const bookingIndex = this.bookings.findIndex(booking => booking.id === bookingId);
    if (bookingIndex === -1) return { success: false };

    this.bookings[bookingIndex].status = status;

    if (status === 'Completed') {
      this.bookings[bookingIndex].completedDate = new Date().toISOString().split('T')[0];
    }

    if (notes) {
      this.bookings[bookingIndex].notes = notes;
    }

    return { success: true };
  }

  // Reschedule a booking
  async rescheduleBooking(bookingId: string, newDate: string, newTime: string): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const bookingIndex = this.bookings.findIndex(booking => booking.id === bookingId);
    if (bookingIndex === -1) return { success: false };

    this.bookings[bookingIndex].date = newDate;
    this.bookings[bookingIndex].time = newTime;
    this.bookings[bookingIndex].status = 'Rescheduled';

    return { success: true };
  }

  // Cancel a booking
  async cancelBooking(bookingId: string, reason?: string): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const bookingIndex = this.bookings.findIndex(booking => booking.id === bookingId);
    if (bookingIndex === -1) return { success: false };

    this.bookings[bookingIndex].status = 'Cancelled';
    this.bookings[bookingIndex].paymentStatus = 'Refunded';

    if (reason) {
      this.bookings[bookingIndex].notes = `Cancelled: ${reason}`;
    }

    return { success: true };
  }

  // Add review and rating
  async addReview(bookingId: string, rating: number, review: string): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const bookingIndex = this.bookings.findIndex(booking => booking.id === bookingId);
    if (bookingIndex === -1) return { success: false };

    this.bookings[bookingIndex].rating = rating;
    this.bookings[bookingIndex].review = review;

    return { success: true };
  }

  // Get booking by ID
  getBooking(bookingId: string): Booking | null {
    return this.bookings.find(booking => booking.id === bookingId) || null;
  }

  // Get all bookings (for admin use)
  getAllBookings(filters?: {
    status?: string;
    serviceType?: string;
    dateRange?: { start: string; end: string };
  }): Booking[] {
    let filteredBookings = [...this.bookings];

    if (filters) {
      if (filters.status) {
        filteredBookings = filteredBookings.filter(booking => booking.status === filters.status);
      }
      if (filters.serviceType) {
        filteredBookings = filteredBookings.filter(booking => booking.serviceType === filters.serviceType);
      }
      if (filters.dateRange) {
        filteredBookings = filteredBookings.filter(booking =>
          booking.date >= (filters.dateRange?.start || '') && booking.date <= (filters.dateRange?.end || '')
        );
      }
    }

    return filteredBookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}

export const bookingService = new BookingService();

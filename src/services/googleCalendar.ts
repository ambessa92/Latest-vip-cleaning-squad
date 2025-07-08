// Browser-compatible Google Calendar integration
// Note: This is a simplified client-side implementation
// For full server-side integration, use the googleapis package in a backend service

// Google Calendar API configuration
const GOOGLE_CALENDAR_CONFIG = {
  // Google Calendar API credentials (configured via environment variables)
  CLIENT_ID: import.meta.env.VITE_GOOGLE_CALENDAR_CLIENT_ID || '',
  CLIENT_SECRET: import.meta.env.VITE_GOOGLE_CALENDAR_CLIENT_SECRET || '',
  REDIRECT_URI: import.meta.env.VITE_GOOGLE_CALENDAR_REDIRECT_URI || 'http://localhost:5173',
  SCOPES: ['https://www.googleapis.com/auth/calendar'],
  // Calendar ID for the cleaning service business calendar
  CALENDAR_ID: import.meta.env.VITE_GOOGLE_CALENDAR_ID || 'primary'
};

// Interface for booking details
export interface BookingDetails {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceType: string;
  serviceDate: string;
  serviceTime: string;
  serviceAddress: string;
  serviceArea: string;
  totalAmount: number;
  frequency: string;
  cleaningType?: string;
  addOns?: string[];
}

// Interface for calendar event creation response
interface CalendarEventResponse {
  success: boolean;
  eventId?: string;
  calendarLink?: string;
  error?: string;
}

/**
 * Parse time slot string to create proper start and end times
 */
function parseTimeSlot(date: string, timeSlot: string): { start: Date; end: Date } {
  const [datePart] = date.split('T');
  const [hours, minutes] = timeSlot.split(':').map(Number);

  const start = new Date(`${datePart}T${timeSlot}:00`);

  // Default service duration: 2-3 hours depending on service type
  const end = new Date(start.getTime() + (2.5 * 60 * 60 * 1000));

  return { start, end };
}

/**
 * Create a Google Calendar event (demo mode - returns mock data)
 * In production, this would integrate with your backend API that handles Google Calendar
 */
export async function createCalendarEvent(bookingDetails: BookingDetails): Promise<CalendarEventResponse> {
  try {
    console.log('📅 Creating Google Calendar event for booking:', bookingDetails);

    // Demo mode: simulate calendar event creation
    const mockEventId = `demo_event_${Date.now()}`;

    // Generate calendar links for the customer
    const calendarLink = generateCalendarLink(bookingDetails);

    // In a real implementation, this would make an API call to your backend
    // which would then use the googleapis package to create the actual event

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('✅ Calendar event created successfully (demo mode)');

    return {
      success: true,
      eventId: mockEventId,
      calendarLink: calendarLink,
    };
  } catch (error) {
    console.error('❌ Error creating calendar event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate a Google Calendar link that customers can use to add the event to their calendar
 */
export function generateCalendarLink(bookingDetails: BookingDetails): string {
  const { start, end } = parseTimeSlot(bookingDetails.serviceDate, bookingDetails.serviceTime);

  // Format dates for Google Calendar URL (YYYYMMDDTHHMMSSZ)
  const formatDate = (date: Date) => {
    return `${date.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
  };

  const startTime = formatDate(start);
  const endTime = formatDate(end);

  // Create event title and description
  const title = encodeURIComponent(`${bookingDetails.serviceType} Cleaning Service`);
  const description = encodeURIComponent(
    `Cleaning Service Appointment\n\nService Type: ${bookingDetails.serviceType}\nCleaning Type: ${bookingDetails.cleaningType || 'Standard'}\nFrequency: ${bookingDetails.frequency}\nCustomer: ${bookingDetails.customerName}\nPhone: ${bookingDetails.customerPhone}\nAddress: ${bookingDetails.serviceAddress}\nArea: ${bookingDetails.serviceArea}\nTotal: ${bookingDetails.totalAmount.toFixed(2)} CAD\n\nAdditional Services: ${bookingDetails.addOns?.join(', ') || 'None'}\n\nBooked via VIP Cleaning Squad`
  );

  const location = encodeURIComponent(bookingDetails.serviceAddress);

  // Generate Google Calendar URL
  const googleCalendarUrl =
    `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${description}&location=${location}&sf=true&output=xml`;

  return googleCalendarUrl;
}

/**
 * Create a customer calendar invite with detailed booking information
 */
export function createCustomerCalendarInvite(bookingDetails: BookingDetails): {
  calendarLink: string;
  eventDetails: {
    title: string;
    startTime: string;
    endTime: string;
    description: string;
    location: string;
  };
} {
  const { start, end } = parseTimeSlot(bookingDetails.serviceDate, bookingDetails.serviceTime);

  const eventDetails = {
    title: `${bookingDetails.serviceType} Cleaning Service`,
    startTime: start.toLocaleString('en-CA', {
      timeZone: 'America/Toronto',
      dateStyle: 'full',
      timeStyle: 'short'
    }),
    endTime: end.toLocaleString('en-CA', {
      timeZone: 'America/Toronto',
      timeStyle: 'short'
    }),
    description: `Your cleaning service appointment is confirmed!\n\nService Details:\n• Type: ${bookingDetails.serviceType}\n• Cleaning: ${bookingDetails.cleaningType || 'Standard'}\n• Frequency: ${bookingDetails.frequency}\n• Total: ${bookingDetails.totalAmount.toFixed(2)} CAD\n\nContact Information:\n• Phone: 1-888-VIP-CLEAN\n• Email: info@vipcleaningsquad.com\n\nWe'll arrive on time with all necessary equipment!`,
    location: bookingDetails.serviceAddress
  };

  return {
    calendarLink: generateCalendarLink(bookingDetails),
    eventDetails
  };
}

/**
 * Instructions for setting up Google Calendar integration in production
 */
export const GOOGLE_CALENDAR_SETUP_INSTRUCTIONS = {
  production: `
To enable Google Calendar integration in production:

1. Set up Google Cloud Console:
   - Create a project at https://console.cloud.google.com
   - Enable the Google Calendar API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs

2. Backend Implementation:
   - Create a backend API endpoint that uses the googleapis package
   - Handle OAuth authentication flow
   - Store and refresh access tokens securely
   - Create calendar events via the backend API

3. Environment Variables:
   - VITE_GOOGLE_CALENDAR_CLIENT_ID=your_client_id
   - VITE_GOOGLE_CALENDAR_REDIRECT_URI=your_redirect_uri
   - Backend: GOOGLE_CALENDAR_CLIENT_SECRET=your_client_secret

4. Frontend Integration:
   - Replace demo functions with actual API calls to your backend
   - Handle authentication states and token management
   - Provide user consent flow for calendar access

Current Implementation:
   - Demo mode with mock calendar events
   - Generates Google Calendar links for manual addition
   - Provides detailed event information for email notifications
  `,
  demo: `
Current Demo Mode Features:
   - Simulates calendar event creation
   - Generates working Google Calendar links
   - Creates detailed event information
   - Logs all actions for debugging
   - Perfect for development and testing
  `
};

export default {
  createCalendarEvent,
  generateCalendarLink,
  createCustomerCalendarInvite,
  GOOGLE_CALENDAR_SETUP_INSTRUCTIONS
};

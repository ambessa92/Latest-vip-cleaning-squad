import React from 'react';
import { generateCalendarLink, createCustomerCalendarInvite, type BookingDetails } from '../services/googleCalendar';

interface CalendarIntegrationProps {
  bookingDetails: BookingDetails;
}

export function CalendarIntegration({ bookingDetails }: CalendarIntegrationProps) {
  const businessCalendarLink = generateCalendarLink(bookingDetails);
  const customerCalendarInvite = createCustomerCalendarInvite(bookingDetails);
  const customerCalendarLink = customerCalendarInvite.calendarLink;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
        📅 Add to Calendar
      </h3>

      <div className="space-y-4">
        <div className="bg-white rounded-lg p-4 border border-blue-100">
          <h4 className="font-medium text-blue-800 mb-2">For Your Calendar</h4>
          <p className="text-sm text-blue-700 mb-3">
            Add this appointment to your personal calendar so you don't forget!
          </p>
          <a
            href={customerCalendarLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            📅 Add to My Calendar
          </a>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border">
          <h4 className="font-medium text-gray-800 mb-2">Calendar Details</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>📅 Date:</span>
              <span className="font-medium">{bookingDetails.serviceDate}</span>
            </div>
            <div className="flex justify-between">
              <span>⏰ Time:</span>
              <span className="font-medium">{bookingDetails.serviceTime}</span>
            </div>
            <div className="flex justify-between">
              <span>🏠 Service:</span>
              <span className="font-medium">{bookingDetails.serviceType} Cleaning</span>
            </div>
            <div className="flex justify-between">
              <span>📍 Location:</span>
              <span className="font-medium">{bookingDetails.serviceArea}</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h4 className="font-medium text-green-800 mb-2 flex items-center">
            ✅ What Happens Next
          </h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• We'll send you automatic reminders 24 hours and 1 hour before your service</li>
            <li>• Our team will arrive on time and ready to clean</li>
            <li>• You'll receive a completion notification when we're done</li>
            <li>• Feel free to call us at 1-888-VIP-CLEAN if you have any questions</li>
          </ul>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-100 rounded-lg">
        <div className="flex items-start space-x-2">
          <span className="text-blue-600 mt-0.5">💡</span>
          <div className="text-sm text-blue-800">
            <strong>Pro Tip:</strong> Adding this to your calendar ensures you'll receive automatic reminders
            and can easily reschedule if needed. The calendar invite includes all your service details!
          </div>
        </div>
      </div>
    </div>
  );
}

// Alternative simple version for integration into existing confirmation
export function CalendarButtons({ bookingDetails }: CalendarIntegrationProps) {
  const customerCalendarInvite = createCustomerCalendarInvite(bookingDetails);
  const customerCalendarLink = customerCalendarInvite.calendarLink;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-blue-900">📅 Add to Calendar</h4>
          <p className="text-sm text-blue-700">Never miss your cleaning appointment!</p>
        </div>
        <a
          href={customerCalendarLink}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center space-x-2"
        >
          <span>📅</span>
          <span>Add to Calendar</span>
        </a>
      </div>
    </div>
  );
}

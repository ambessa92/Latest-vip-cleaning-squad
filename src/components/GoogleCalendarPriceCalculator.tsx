import React, { useState, useEffect, useCallback } from 'react';
import EnhancedPaymentForm from './EnhancedPaymentForm';
import { CalendarButtons } from './CalendarIntegration';
import type { BookingDetails } from '../services/googleCalendar';

// Enhanced PriceCalculator with Google Calendar Integration
export default function GoogleCalendarPriceCalculator() {
  const [step, setStep] = useState(1);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [bookingNumber, setBookingNumber] = useState('');
  const [calendarEventId, setCalendarEventId] = useState<string | null>(null);

  // Sample booking data - replace with your actual state management
  const [pricingData, setPricingData] = useState({
    serviceType: '',
    homeSize: '',
    bedrooms: '',
    bathrooms: '',
    cleaningType: '',
    frequency: '',
    extras: [] as string[],
    commercialSpaceType: '',
    squareFootage: '',
    floors: '',
    restrooms: '',
    commercialExtras: [] as string[]
  });

  const [contactInfo, setContactInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    serviceArea: ''
  });

  const [bookingDetails, setBookingDetails] = useState({
    date: '',
    time: ''
  });

  // Generate booking number
  const generateBookingNumber = useCallback(() => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `VIP${timestamp.slice(-6)}${random}`;
  }, []);

  // Handle payment success with calendar integration
  const handlePaymentSuccess = useCallback((eventId?: string) => {
    console.log('🎉 Payment successful! Creating booking confirmation...');

    // Generate booking number
    const newBookingNumber = generateBookingNumber();
    setBookingNumber(newBookingNumber);

    // Store calendar event ID if provided
    if (eventId) {
      setCalendarEventId(eventId);
      console.log('📅 Calendar event created:', eventId);
    }

    // Move to confirmation step
    setStep(5);
  }, [generateBookingNumber]);

  // Create booking details object for calendar integration
  const createBookingDetailsForCalendar = useCallback((): BookingDetails => {
    return {
      customerName: `${contactInfo.firstName} ${contactInfo.lastName}`,
      customerEmail: contactInfo.email,
      customerPhone: contactInfo.phone,
      serviceType: pricingData.serviceType,
      serviceDate: bookingDetails.date,
      serviceTime: bookingDetails.time,
      serviceAddress: contactInfo.address,
      serviceArea: contactInfo.serviceArea,
      frequency: pricingData.frequency,
      totalAmount: calculatedPrice,
      cleaningType: pricingData.cleaningType,
      addOns: [...pricingData.extras, ...pricingData.commercialExtras]
    };
  }, [contactInfo, pricingData, bookingDetails, calculatedPrice]);

  // Sample price calculation (replace with your actual calculation)
  useEffect(() => {
    if (pricingData.serviceType) {
      const basePrice = pricingData.serviceType === 'residential' ? 120 : 200;
      setCalculatedPrice(basePrice);
    }
  }, [pricingData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            {[1, 2, 3, 4, 5].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= stepNumber ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 5 && (
                  <div className={`w-16 h-1 ${step > stepNumber ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center text-sm text-gray-600">
            {step === 1 && "Get Your Quote"}
            {step === 2 && "Contact Information"}
            {step === 3 && "Schedule Service"}
            {step === 4 && "Secure Payment"}
            {step === 5 && "Booking Confirmed"}
          </div>
        </div>

        {/* Step 1: Service Selection (Simplified for demo) */}
        {step === 1 && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Get Your Cleaning Quote
              </h1>
              <p className="text-xl text-gray-600">
                Professional cleaning with Google Calendar integration
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Service Type</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <button
                  onClick={() => setPricingData(prev => ({ ...prev, serviceType: 'residential', cleaningType: 'standard', frequency: 'weekly' }))}
                  className={`p-6 rounded-xl border-2 transition-all hover:shadow-lg ${
                    pricingData.serviceType === 'residential'
                      ? 'border-green-500 bg-green-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3">🏠</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Residential</h3>
                    <p className="text-gray-600">Homes, apartments, condos</p>
                    <p className="text-green-600 font-bold mt-2">$120 base price</p>
                  </div>
                </button>

                <button
                  onClick={() => setPricingData(prev => ({ ...prev, serviceType: 'commercial', cleaningType: 'standard', frequency: 'weekly' }))}
                  className={`p-6 rounded-xl border-2 transition-all hover:shadow-lg ${
                    pricingData.serviceType === 'commercial'
                      ? 'border-green-500 bg-green-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3">🏢</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Commercial</h3>
                    <p className="text-gray-600">Offices, retail, restaurants</p>
                    <p className="text-green-600 font-bold mt-2">$200 base price</p>
                  </div>
                </button>
              </div>

              {pricingData.serviceType && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => setStep(2)}
                    className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:from-green-600 hover:to-blue-600 transition-all shadow-lg"
                  >
                    Continue to Contact Info →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Contact Information (Simplified) */}
        {step === 2 && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Information</h2>
              <p className="text-xl text-gray-600">We need your details for the appointment</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    value={contactInfo.firstName}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Your first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={contactInfo.lastName}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Your last name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Address *</label>
                  <input
                    type="text"
                    value={contactInfo.address}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="123 Main Street, City, Province"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Area *</label>
                  <select
                    value={contactInfo.serviceArea}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, serviceArea: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select your area</option>
                    <option value="St. Catharines">St. Catharines</option>
                    <option value="Niagara-on-the-Lake">Niagara-on-the-Lake</option>
                    <option value="Niagara Falls">Niagara Falls</option>
                    <option value="Welland">Welland</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!contactInfo.firstName || !contactInfo.lastName || !contactInfo.email || !contactInfo.phone || !contactInfo.address || !contactInfo.serviceArea}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Scheduling →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Schedule Service */}
        {step === 3 && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Schedule Your Service</h2>
              <p className="text-xl text-gray-600">Choose date and time for your cleaning</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date *</label>
                  <input
                    type="date"
                    value={bookingDetails.date}
                    onChange={(e) => setBookingDetails(prev => ({ ...prev, date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time *</label>
                  <select
                    value={bookingDetails.time}
                    onChange={(e) => setBookingDetails(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select a time slot</option>
                    <option value="8:00 AM - 11:00 AM">8:00 AM - 11:00 AM</option>
                    <option value="11:00 AM - 2:00 PM">11:00 AM - 2:00 PM</option>
                    <option value="2:00 PM - 5:00 PM">2:00 PM - 5:00 PM</option>
                    <option value="5:00 PM - 8:00 PM">5:00 PM - 8:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service Type:</span>
                    <span className="font-medium">{pricingData.serviceType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-medium">{contactInfo.firstName} {contactInfo.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Cost:</span>
                    <span className="font-bold text-green-600">${calculatedPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!bookingDetails.date || !bookingDetails.time}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proceed to Payment →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Payment with Calendar Integration */}
        {step === 4 && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Secure Payment</h2>
              <p className="text-xl text-gray-600">Complete your booking and get calendar integration</p>
            </div>

            <EnhancedPaymentForm
              amount={calculatedPrice}
              customerDetails={{
                name: `${contactInfo.firstName} ${contactInfo.lastName}`,
                email: contactInfo.email,
                phone: contactInfo.phone,
                address: contactInfo.address,
                city: contactInfo.city,
                state: contactInfo.state,
                zipCode: contactInfo.zipCode
              }}
              serviceDetails={{
                serviceType: pricingData.serviceType,
                frequency: pricingData.frequency,
                date: bookingDetails.date,
                time: bookingDetails.time,
                location: contactInfo.serviceArea,
                cleaningType: pricingData.cleaningType,
                addOns: [...pricingData.extras, ...pricingData.commercialExtras]
              }}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={(error: string) => {
                console.error('Payment error:', error);
                alert('Payment failed. Please try again.');
              }}
            />

            <div className="text-center mt-6">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Back to Scheduling
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Confirmation with Calendar Integration */}
        {step === 5 && (
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-6xl mb-6">✅</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Booking Confirmed!</h2>
              <p className="text-xl text-gray-600 mb-6">
                Your cleaning service has been successfully booked with calendar integration.
              </p>

              {/* Google Calendar Integration */}
              {bookingNumber && (
                <CalendarButtons bookingDetails={createBookingDetailsForCalendar()} />
              )}

              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-green-900 mb-4">Booking Details</h3>
                <div className="space-y-2 text-sm text-green-800">
                  <div className="flex justify-between">
                    <span>Booking Number:</span>
                    <span className="font-bold">{bookingNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Date:</span>
                    <span>{bookingDetails.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Time:</span>
                    <span>{bookingDetails.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Area:</span>
                    <span>{contactInfo.serviceArea}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Paid:</span>
                    <span>${calculatedPrice.toFixed(2)}</span>
                  </div>
                  {calendarEventId && (
                    <div className="flex justify-between">
                      <span>Calendar Event:</span>
                      <span className="text-blue-600">✅ Created</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  📧 A confirmation email has been sent to {contactInfo.email} with all your booking details and calendar information.
                </p>
              </div>

              <button
                onClick={() => {
                  setStep(1);
                  setPricingData({
                    serviceType: '',
                    homeSize: '',
                    bedrooms: '',
                    bathrooms: '',
                    cleaningType: '',
                    frequency: '',
                    extras: [],
                    commercialSpaceType: '',
                    squareFootage: '',
                    floors: '',
                    restrooms: '',
                    commercialExtras: []
                  });
                  setContactInfo({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    address: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    serviceArea: ''
                  });
                  setBookingDetails({ date: '', time: '' });
                  setCalculatedPrice(0);
                  setBookingNumber('');
                  setCalendarEventId(null);
                }}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all"
              >
                Book Another Service
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

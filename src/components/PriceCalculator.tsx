import React, { useState, useEffect, useCallback } from 'react';
import EnhancedPaymentForm from './EnhancedPaymentForm';
import { CustomerAuthService, ValidationService, SECURITY_QUESTIONS } from '../services/customerAccount';
import { NotificationService } from '../services/notifications';
import { crmService } from '../services/crm';
import { bookingService } from '../services/booking';

// Testimonials Carousel Component
interface TestimonialsCarouselProps {
  testimonials: Array<{
    name: string;
    location: string;
    service: string;
    rating: number;
    text: string;
    verified: boolean;
  }>;
}

function TestimonialsCarousel({ testimonials }: TestimonialsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-rotate testimonials every 4 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [testimonials.length, isAutoPlaying]);

  // Calculate how many testimonials to show based on screen size
  const getVisibleCount = useCallback(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1024) return 3; // lg screens
      if (window.innerWidth >= 768) return 2;  // md screens
      return 1; // small screens
    }
    return 3; // default for SSR
  }, []);

  const [visibleCount, setVisibleCount] = useState(getVisibleCount);

  useEffect(() => {
    const handleResize = () => {
      setVisibleCount(getVisibleCount());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getVisibleCount]);

  // Navigate to specific slide
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Navigate to previous slide
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - visibleCount : prevIndex - 1
    );
  };

  // Navigate to next slide
  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  return (
    <div className="max-w-5xl mx-auto mt-6 lg:mt-8 px-2 lg:px-0">
      <h3 className="text-xl lg:text-2xl font-bold text-center text-gray-900 mb-2 lg:mb-3">What Our Customers Say</h3>
      <p className="text-center text-gray-600 mb-3 lg:mb-5 text-xs lg:text-sm px-4">Real reviews from real customers across the Niagara region</p>

      <div
        className="relative"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-0 lg:-translate-x-3 top-1/2 -translate-y-1/2 -translate-x-1 z-10 bg-white shadow-md rounded-full p-1.5 lg:p-2 hover:bg-gray-50 transition-all duration-200 group"
          aria-label="Previous testimonials"
        >
          <svg className="w-3 h-3 lg:w-4 lg:h-4 text-gray-600 group-hover:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={goToNext}
          className="absolute right-0 lg:translate-x-3 top-1/2 -translate-y-1/2 translate-x-1 z-10 bg-white shadow-md rounded-full p-1.5 lg:p-2 hover:bg-gray-50 transition-all duration-200 group"
          aria-label="Next testimonials"
        >
          <svg className="w-3 h-3 lg:w-4 lg:h-4 text-gray-600 group-hover:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Testimonials Container */}
        <div className="overflow-hidden mx-4 lg:mx-0">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
              width: `${(testimonials.length * 100) / visibleCount}%`
            }}
          >
            {testimonials.map((testimonial, index) => (
              <div
                key={`${testimonial.name}-${index}`}
                className="flex-shrink-0 px-1 lg:px-2"
                style={{ width: `${100 / testimonials.length}%` }}
              >
                <div className="bg-white rounded-lg shadow-lg p-3 lg:p-4 h-full border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center mb-2 lg:mb-3">
                    <div className="flex text-yellow-400 text-sm lg:text-base">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={`star-${testimonial.name}-${i}`} className="animate-pulse">⭐</span>
                      ))}
                    </div>
                    {testimonial.verified && (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  <blockquote className="text-gray-700 text-xs leading-relaxed mb-2 lg:mb-3 italic">
                    "{testimonial.text}"
                  </blockquote>

                  <div className="border-t border-gray-100 pt-2 lg:pt-3">
                    <div className="flex items-center">
                      <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-2">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-xs">{testimonial.name}</p>
                        <p className="text-gray-500 text-xs">{testimonial.location} • {testimonial.service}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dot Navigation */}
        <div className="flex justify-center mt-3 lg:mt-5 space-x-1.5">
          {Array.from({ length: Math.ceil(testimonials.length / visibleCount) }).map((_, index) => (
            <button
              key={`dot-group-${index}-${visibleCount}`}
              onClick={() => goToSlide(index * visibleCount)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                Math.floor(currentIndex / visibleCount) === index
                  ? 'bg-gradient-to-r from-green-500 to-blue-500 scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to testimonial group ${index + 1}`}
            />
          ))}
        </div>

        {/* Auto-play indicator */}
        <div className="flex justify-center mt-2 lg:mt-3">
          <div className="flex items-center space-x-1.5 text-xs text-gray-500">
            <div className={`w-1.5 h-1.5 rounded-full ${isAutoPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
            <span className="hidden lg:inline text-xs">{isAutoPlaying ? 'Auto-playing' : 'Paused'} • Hover to pause</span>
            <span className="lg:hidden text-xs">{isAutoPlaying ? 'Auto' : 'Paused'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Testimonials data
const testimonials = [
  {
    name: "Sarah Mitchell",
    location: "St. Catharines",
    service: "Weekly Cleaning",
    rating: 5,
    text: "VIP Cleaning Squad has been amazing! My house has never been cleaner and the team is so professional.",
    verified: true
  },
  {
    name: "David Chen",
    location: "Niagara Falls",
    service: "Deep Cleaning",
    rating: 5,
    text: "Outstanding service! They went above and beyond with attention to detail.",
    verified: true
  },
  {
    name: "Maria Rodriguez",
    location: "Welland",
    service: "Move-in Cleaning",
    rating: 5,
    text: "Perfect for our new home. Everything was spotless when they finished.",
    verified: true
  },
  {
    name: "Jennifer Walsh",
    location: "Niagara-on-the-Lake",
    service: "Bi-weekly Cleaning",
    rating: 5,
    text: "VIP Cleaning Squad is reliable, affordable, and they always exceed expectations!",
    verified: true
  },
  {
    name: "Michael Thompson",
    location: "Thorold",
    service: "Commercial Cleaning",
    rating: 5,
    text: "VIP Cleaning Squad keeps our office spotless every week. Professional, punctual, and reasonably priced!",
    verified: true
  },
  {
    name: "Lisa Park",
    location: "Fort Erie",
    service: "Post-Construction",
    rating: 5,
    text: "After our renovation, VIP Cleaning Squad made our home livable again. Incredible attention to detail!",
    verified: true
  }
];

// Pricing options
const homeSizeOptions = [
  { value: 'studio', label: 'Studio/1BR', price: 89, originalPrice: 120 },
  { value: '2br', label: '2 Bedrooms', price: 109, originalPrice: 145 },
  { value: '3br', label: '3 Bedrooms', price: 139, originalPrice: 185 },
  { value: '4br', label: '4 Bedrooms', price: 169, originalPrice: 225 },
  { value: '5br', label: '5+ Bedrooms', price: 199, originalPrice: 265 }
];

const bathroomOptions = [
  { value: '1', label: '1 Bathroom', price: 0 },
  { value: '2', label: '2 Bathrooms', price: 15 },
  { value: '3', label: '3 Bathrooms', price: 30 },
  { value: '4', label: '4 Bathrooms', price: 45 },
  { value: '5+', label: '5+ Bathrooms', price: 60 }
];

const cleaningTypeOptions = [
  { value: 'standard', label: 'Standard Cleaning', multiplier: 1 },
  { value: 'deep', label: 'Deep Cleaning', multiplier: 1.5, badge: 'Popular' },
  { value: 'movein', label: 'Move-in/Move-out', multiplier: 1.8 },
  { value: 'construction', label: 'Post-Construction', multiplier: 2.2 }
];

const frequencyOptions = [
  { value: 'onetime', label: 'One-time', savings: 0 },
  { value: 'monthly', label: 'Monthly', savings: 60, badge: 'Save $60/year' },
  { value: 'biweekly', label: 'Bi-weekly', savings: 120, badge: 'Save $120/year' },
  { value: 'weekly', label: 'Weekly', savings: 240, badge: 'Most Popular' }
];

const extrasOptions = [
  { value: 'fridge', label: 'Inside Fridge', price: 25, popular: true },
  { value: 'oven', label: 'Inside Oven', price: 25, popular: true },
  { value: 'windows', label: 'Interior Windows', price: 65 },
  { value: 'cabinets', label: 'Kitchen Cabinets', price: 45 },
  { value: 'garage', label: 'Garage Cleaning', price: 55 },
  { value: 'laundry', label: 'Laundry Room', price: 20 }
];

// Commercial options
const commercialSpaceOptions = [
  { value: 'office', label: 'Office Space', baseRate: 0.08 },
  { value: 'retail', label: 'Retail Store', baseRate: 0.12 },
  { value: 'restaurant', label: 'Restaurant', baseRate: 0.15 },
  { value: 'medical', label: 'Medical Facility', baseRate: 0.18 },
  { value: 'warehouse', label: 'Warehouse', baseRate: 0.06 },
  { value: 'gym', label: 'Fitness Center', baseRate: 0.10 }
];

const squareFootageOptions = [
  { value: '500-1000', label: '500-1,000 sq ft', multiplier: 1.2 },
  { value: '1000-2500', label: '1,000-2,500 sq ft', multiplier: 1.0 },
  { value: '2500-5000', label: '2,500-5,000 sq ft', multiplier: 0.9 },
  { value: '5000-10000', label: '5,000-10,000 sq ft', multiplier: 0.8 },
  { value: '10000+', label: '10,000+ sq ft', multiplier: 0.7 }
];

const commercialCleaningTypeOptions = [
  { value: 'standard', label: 'Standard Cleaning', multiplier: 1 },
  { value: 'deep', label: 'Deep Cleaning', multiplier: 1.5, badge: 'Popular' },
  { value: 'sanitization', label: 'Sanitization', multiplier: 1.3 },
  { value: 'construction', label: 'Post-Construction', multiplier: 2.0 },
  { value: 'carpet', label: 'Carpet Cleaning', multiplier: 1.4 },
  { value: 'windows', label: 'Window Cleaning', multiplier: 1.2 }
];

const commercialFrequencyOptions = [
  { value: 'onetime', label: 'One-time', savings: 0 },
  { value: 'weekly', label: 'Weekly', savings: 600, badge: 'Save $600/year' },
  { value: 'biweekly', label: 'Bi-weekly', savings: 300, badge: 'Save $300/year' },
  { value: 'monthly', label: 'Monthly', savings: 180, badge: 'Save $180/year' },
  { value: 'daily', label: 'Daily', savings: 2400, badge: 'Enterprise' }
];

const commercialBathroomOptions = [
  { value: '1', label: '1 Restroom', price: 0 },
  { value: '2-3', label: '2-3 Restrooms', price: 25 },
  { value: '4-6', label: '4-6 Restrooms', price: 50 },
  { value: '7-10', label: '7-10 Restrooms', price: 75 },
  { value: '10+', label: '10+ Restrooms', price: 100 }
];

const commercialExtrasOptions = [
  { value: 'breakroom', label: 'Break Room Deep Clean', price: 75, popular: true },
  { value: 'conference', label: 'Conference Rooms', price: 50, popular: true },
  { value: 'lobby', label: 'Lobby Maintenance', price: 65 },
  { value: 'elevator', label: 'Elevator Cleaning', price: 40 },
  { value: 'emergency', label: 'Emergency Cleanup', price: 150 }
];

interface PricingData {
  serviceType: string;
  homeSize: string;
  bedrooms: string;
  bathrooms: string;
  cleaningType: string;
  frequency: string;
  extras: string[];
  commercialSpaceType: string;
  squareFootage: string;
  floors: string;
  restrooms: string;
  commercialExtras: string[];
}

interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  serviceArea: string;
}

interface BookingDetails {
  date: string;
  time: string;
}

export default function PriceCalculator() {
  const [step, setStep] = useState(1);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [isCalculated, setIsCalculated] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [bookingNumber, setBookingNumber] = useState('');
  const [priceBreakdown, setPriceBreakdown] = useState<{ [key: string]: number }>({});

  const [pricingData, setPricingData] = useState<PricingData>({
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

  const [contactInfo, setContactInfo] = useState<ContactInfo>({
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

  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    date: '',
    time: ''
  });

  const [createAccount, setCreateAccount] = useState(false);

  // Automatically enable account creation for recurring payments
  useEffect(() => {
    if (pricingData.frequency && pricingData.frequency !== 'onetime') {
      setCreateAccount(true);
    }
  }, [pricingData.frequency]);

  const [accountData, setAccountData] = useState({
    password: '',
    confirmPassword: '',
    securityQuestion: '',
    securityAnswer: ''
  });

  // CRM Integration - Create lead when quote is generated
  const createCRMLead = async (customerData: any) => {
    try {
      const leadData = {
        ...customerData,
        propertyType: pricingData.serviceType,
        cleaningType: pricingData.cleaningType,
        frequency: pricingData.frequency,
        homeSize: pricingData.homeSize,
        bathrooms: pricingData.bathrooms,
        commercialSpaceType: pricingData.commercialSpaceType,
        squareFootage: pricingData.squareFootage,
        floors: pricingData.floors,
        restrooms: pricingData.restrooms,
        extras: [...pricingData.extras, ...pricingData.commercialExtras],
        preferredDate: bookingDetails.date,
        preferredTime: bookingDetails.time,
        estimatedPrice: calculatedPrice
      };

      const result = await crmService.createLead(leadData);

      if (result.success) {
        console.log('Lead created successfully:', result.leadId);
        // You could show a success message or track the lead ID
      } else {
        console.error('Failed to create lead:', result.error);
      }
    } catch (error) {
      console.error('Error creating CRM lead:', error);
    }
  };



  // Calculate price based on service type
  const calculatePrice = useCallback(() => {
    if (pricingData.serviceType === 'residential') {
      if (!pricingData.homeSize || !pricingData.cleaningType || !pricingData.frequency || !pricingData.bathrooms) return;

      const homeSizeOption = homeSizeOptions.find(opt => opt.value === pricingData.homeSize);
      const cleaningTypeOption = cleaningTypeOptions.find(opt => opt.value === pricingData.cleaningType);
      const bathroomOption = bathroomOptions.find(opt => opt.value === pricingData.bathrooms);

      if (!homeSizeOption || !cleaningTypeOption || !bathroomOption) return;

      const basePrice = homeSizeOption.price;
      let price = basePrice * cleaningTypeOption.multiplier;

      // Add bathroom pricing
      price += bathroomOption.price;

      // Add extras
      const extrasPrice = pricingData.extras.reduce((total, extra) => {
        const extraOption = extrasOptions.find(opt => opt.value === extra);
        return total + (extraOption?.price || 0);
      }, 0);

      price += extrasPrice;

      // Apply frequency discount
      const frequencyOption = frequencyOptions.find(opt => opt.value === pricingData.frequency);
      if (frequencyOption && frequencyOption.savings > 0) {
        price *= 0.9; // 10% discount for recurring services
      }

      setCalculatedPrice(Math.round(price * 100) / 100);

      // Build price breakdown
      const breakdown: { [key: string]: number } = {
        [`${homeSizeOption.label} Base`]: basePrice,
        [`${cleaningTypeOption.label} (${cleaningTypeOption.multiplier}x)`]: basePrice * (cleaningTypeOption.multiplier - 1)
      };

      if (bathroomOption.price > 0) {
        breakdown[`${bathroomOption.label}`] = bathroomOption.price;
      }

      if (extrasPrice > 0) {
        breakdown['Add-on Services'] = extrasPrice;
      }

      if (frequencyOption && frequencyOption.savings > 0) {
        breakdown['Recurring Service Discount'] = -(price / 0.9 * 0.1);
      }

      setPriceBreakdown(breakdown);
    } else if (pricingData.serviceType === 'commercial') {
      if (!pricingData.commercialSpaceType || !pricingData.squareFootage || !pricingData.cleaningType || !pricingData.frequency || !pricingData.restrooms) return;

      const spaceOption = commercialSpaceOptions.find(opt => opt.value === pricingData.commercialSpaceType);
      const sqftOption = squareFootageOptions.find(opt => opt.value === pricingData.squareFootage);
      const cleaningTypeOption = commercialCleaningTypeOptions.find(opt => opt.value === pricingData.cleaningType);
      const restroomOption = commercialBathroomOptions.find(opt => opt.value === pricingData.restrooms);

      if (!spaceOption || !sqftOption || !cleaningTypeOption || !restroomOption) return;

      // Estimate square footage from range
      const sqftEstimate = pricingData.squareFootage === '500-1000' ? 750 :
                          pricingData.squareFootage === '1000-2500' ? 1750 :
                          pricingData.squareFootage === '2500-5000' ? 3750 :
                          pricingData.squareFootage === '5000-10000' ? 7500 : 12500;

      const basePrice = sqftEstimate * spaceOption.baseRate;
      let price = basePrice * cleaningTypeOption.multiplier * sqftOption.multiplier;

      // Add restroom pricing
      price += restroomOption.price;

      // Add commercial extras
      const extrasPrice = pricingData.commercialExtras.reduce((total, extra) => {
        const extraOption = commercialExtrasOptions.find(opt => opt.value === extra);
        return total + (extraOption?.price || 0);
      }, 0);

      price += extrasPrice;

      // Apply frequency discount
      const frequencyOption = commercialFrequencyOptions.find(opt => opt.value === pricingData.frequency);
      if (frequencyOption && frequencyOption.savings > 0) {
        price *= 0.85; // 15% discount for recurring commercial services
      }

      setCalculatedPrice(Math.round(price * 100) / 100);

      // Build price breakdown
      const breakdown: { [key: string]: number } = {
        [`${spaceOption.label} Base (${sqftEstimate} sq ft)`]: basePrice,
        [`${cleaningTypeOption.label} (${cleaningTypeOption.multiplier}x)`]: basePrice * (cleaningTypeOption.multiplier - 1),
        "Square Footage Adjustment": basePrice * (sqftOption.multiplier - 1)
      };

      if (restroomOption.price > 0) {
        breakdown[`${restroomOption.label}`] = restroomOption.price;
      }

      if (extrasPrice > 0) {
        breakdown['Additional Services'] = extrasPrice;
      }

      if (frequencyOption && frequencyOption.savings > 0) {
        breakdown['Recurring Service Discount'] = -(price / 0.85 * 0.15);
      }

      setPriceBreakdown(breakdown);
    }

    setIsCalculated(true);
  }, [pricingData]);

  // Recalculate when pricing data changes
  useEffect(() => {
    calculatePrice();
  }, [calculatePrice]);

  // Handle extras changes
  const handleExtrasChange = (extra: string) => {
    setPricingData(prev => ({
      ...prev,
      extras: prev.extras.includes(extra)
        ? prev.extras.filter(e => e !== extra)
        : [...prev.extras, extra]
    }));
  };

  const handleCommercialExtrasChange = (extra: string) => {
    setPricingData(prev => ({
      ...prev,
      commercialExtras: prev.commercialExtras.includes(extra)
        ? prev.commercialExtras.filter(e => e !== extra)
        : [...prev.commercialExtras, extra]
    }));
  };

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 18; hour++) {
      slots.push(`${hour}:00`);
      if (hour < 18) slots.push(`${hour}:30`);
    }
    return slots;
  };

  // Generate booking number
  const generateBookingNumber = useCallback(() => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `VIP${timestamp.slice(-6)}${random}`;
  }, []);



  // Enhanced handle payment success with detailed logging
  const handlePaymentSuccess = useCallback(async (calendarEventId?: string) => {
    console.log('🎉 PAYMENT SUCCESS HANDLER CALLED');
    console.log('Calendar Event ID:', calendarEventId);

    const bookingNum = generateBookingNumber();
    setBookingNumber(bookingNum);

    console.log('Generated Booking Number:', bookingNum);

    // Create CRM lead for this quote/booking
    try {
      console.log('📊 Creating CRM Lead...');
      await createCRMLead({
        firstName: contactInfo.firstName,
        lastName: contactInfo.lastName,
        email: contactInfo.email,
        phone: contactInfo.phone,
        address: contactInfo.address
      });
    } catch (error) {
      console.error('Error creating CRM lead:', error);
      // Don't fail the payment if CRM creation fails
    }

    // Account creation is now handled entirely in EnhancedPaymentForm to avoid duplicate attempts
    // This prevents the "Account creation failed" error message

    setPaymentSuccess(true);
    setStep(5);

    // Give a moment for the payment form to store data, then trace the results
    setTimeout(() => {
      console.log('🔍 POST-PAYMENT STORAGE CHECK:');
      const bookingsAfter = localStorage.getItem('vip_admin_bookings');
      const transactionsAfter = localStorage.getItem('vip_admin_transactions');

      console.log('Bookings after payment:', bookingsAfter ? JSON.parse(bookingsAfter).length : 0);
      console.log('Transactions after payment:', transactionsAfter ? JSON.parse(transactionsAfter).length : 0);

      if (bookingsAfter) {
        const bookings = JSON.parse(bookingsAfter);
        console.log('Latest booking:', bookings[0]);
      }

      if (transactionsAfter) {
        const transactions = JSON.parse(transactionsAfter);
        console.log('Latest transaction:', transactions[0]);
      }
    }, 2000);
  }, [generateBookingNumber, contactInfo, createCRMLead]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
      <div className="container mx-auto px-4">



        {/* Step 1: Service Type Selection */}
        {step === 1 && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Service Type</h2>
              <p className="text-xl text-gray-600">Select the type of cleaning service you need</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Residential Service */}
              <div
                onClick={() => {
                  setPricingData(prev => ({ ...prev, serviceType: 'residential' }));
                  setStep(2);
                }}
                className="bg-white rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all transform hover:scale-105 border-2 border-transparent hover:border-green-500"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">🏠</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Residential Cleaning</h3>
                  <p className="text-gray-600 mb-6">
                    Professional home cleaning services for houses, apartments, and condos.
                    Perfect for regular maintenance or deep cleaning.
                  </p>
                  <ul className="text-left space-y-2 mb-6 text-sm text-gray-700">
                    <li>✓ Regular weekly, bi-weekly, or monthly cleaning</li>
                    <li>✓ One-time deep cleaning</li>
                    <li>✓ Move-in/move-out cleaning</li>
                    <li>✓ Post-construction cleanup</li>
                    <li>✓ Kitchen & bathroom sanitization</li>
                  </ul>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-green-800 font-semibold">Starting from $89</p>
                    <p className="text-green-600 text-sm">Based on home size and services</p>
                  </div>
                </div>
              </div>

              {/* Commercial Service */}
              <div
                onClick={() => {
                  setPricingData(prev => ({ ...prev, serviceType: 'commercial' }));
                  setStep(2);
                }}
                className="bg-white rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all transform hover:scale-105 border-2 border-transparent hover:border-blue-500"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">🏢</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Commercial Cleaning</h3>
                  <p className="text-gray-600 mb-6">
                    Professional business cleaning services for offices, retail spaces,
                    restaurants, medical facilities, and more.
                  </p>
                  <ul className="text-left space-y-2 mb-6 text-sm text-gray-700">
                    <li>✓ Daily, weekly, or monthly service</li>
                    <li>✓ Office buildings & retail spaces</li>
                    <li>✓ Restaurants & medical facilities</li>
                    <li>✓ Warehouses & fitness centers</li>
                    <li>✓ Contract pricing available</li>
                  </ul>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-blue-800 font-semibold">Starting from $0.08/sq ft</p>
                    <p className="text-blue-600 text-sm">Volume discounts available</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonials Carousel */}
            <TestimonialsCarousel testimonials={testimonials} />
          </div>
        )}

        {/* Step 2: Detailed Configuration */}
        {step === 2 && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Configure Your Service</h2>
              <p className="text-xl text-gray-600">Tell us about your {pricingData.serviceType} cleaning needs</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              {pricingData.serviceType === 'residential' ? (
                <div className="space-y-8">
                  {/* Home Size */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Home Size</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {homeSizeOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setPricingData(prev => ({ ...prev, homeSize: option.value }))}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            pricingData.homeSize === option.value
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-center">
                            <h4 className="font-semibold text-gray-900">{option.label}</h4>
                            <div className="mt-2">
                              <span className="text-green-600 font-bold">${option.price}</span>
                              {option.originalPrice > option.price && (
                                <span className="text-gray-400 line-through ml-2">${option.originalPrice}</span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Number of Bathrooms */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Number of Bathrooms</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {bathroomOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setPricingData(prev => ({ ...prev, bathrooms: option.value }))}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            pricingData.bathrooms === option.value
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-center">
                            <h4 className="font-semibold text-gray-900">{option.label}</h4>
                            <div className="text-green-600 font-bold mt-1">
                              {option.price === 0 ? 'Included' : `+${option.price}`}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cleaning Type */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Cleaning Type</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {cleaningTypeOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setPricingData(prev => ({ ...prev, cleaningType: option.value }))}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            pricingData.cleaningType === option.value
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-semibold text-gray-900">{option.label}</h4>
                              {option.badge && (
                                <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full mt-1">
                                  {option.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-green-600 font-bold">
                              {option.multiplier === 1 ? 'Base Price' : `${option.multiplier}x`}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Frequency */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Frequency</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {frequencyOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setPricingData(prev => ({ ...prev, frequency: option.value }))}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            pricingData.frequency === option.value
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-center">
                            <h4 className="font-semibold text-gray-900">{option.label}</h4>
                            {option.badge && (
                              <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full mt-1">
                                {option.badge}
                              </span>
                            )}
                            {option.savings > 0 && (
                              <div className="text-green-600 text-sm mt-2">
                                Save ${option.savings}/year
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Add-on Services */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Add-on Services</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {extrasOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleExtrasChange(option.value)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            pricingData.extras.includes(option.value)
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-semibold text-gray-900">{option.label}</h4>
                              {option.popular && (
                                <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full mt-1">
                                  Popular
                                </span>
                              )}
                            </div>
                            <div className="text-green-600 font-bold">+${option.price}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Commercial Space Type */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Commercial Space Type</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {commercialSpaceOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setPricingData(prev => ({ ...prev, commercialSpaceType: option.value }))}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            pricingData.commercialSpaceType === option.value
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-center">
                            <h4 className="font-semibold text-gray-900">{option.label}</h4>
                            <div className="text-green-600 text-sm mt-2">
                              ${option.baseRate}/sq ft base
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Square Footage */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Square Footage</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {squareFootageOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setPricingData(prev => ({ ...prev, squareFootage: option.value }))}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            pricingData.squareFootage === option.value
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-center">
                            <h4 className="font-semibold text-gray-900">{option.label}</h4>
                            <div className="text-green-600 text-sm mt-2">
                              {option.multiplier < 1 ? `${Math.round((1 - option.multiplier) * 100)}% discount` : 'Standard rate'}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Number of Restrooms */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Number of Restrooms</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {commercialBathroomOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setPricingData(prev => ({ ...prev, restrooms: option.value }))}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            pricingData.restrooms === option.value
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-center">
                            <h4 className="font-semibold text-gray-900">{option.label}</h4>
                            <div className="text-green-600 font-bold mt-1">
                              {option.price === 0 ? 'Included' : `+${option.price}`}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Commercial Cleaning Type */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Type</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {commercialCleaningTypeOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setPricingData(prev => ({ ...prev, cleaningType: option.value }))}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            pricingData.cleaningType === option.value
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-center">
                            <h4 className="font-semibold text-gray-900">{option.label}</h4>
                            {option.badge && (
                              <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full mt-1">
                                {option.badge}
                              </span>
                            )}
                            <div className="text-green-600 text-sm mt-2">
                              {option.multiplier === 1 ? 'Base Price' : `${option.multiplier}x rate`}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Commercial Frequency */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Frequency</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      {commercialFrequencyOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setPricingData(prev => ({ ...prev, frequency: option.value }))}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            pricingData.frequency === option.value
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-center">
                            <h4 className="font-semibold text-gray-900">{option.label}</h4>
                            {option.badge && (
                              <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full mt-1">
                                {option.badge}
                              </span>
                            )}
                            {option.savings > 0 && (
                              <div className="text-green-600 text-sm mt-2">
                                Save ${option.savings}/year
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Commercial Add-ons */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Services</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {commercialExtrasOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleCommercialExtrasChange(option.value)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            pricingData.commercialExtras.includes(option.value)
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-semibold text-gray-900">{option.label}</h4>
                              {option.popular && (
                                <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full mt-1">
                                  Popular
                                </span>
                              )}
                            </div>
                            <div className="text-green-600 font-bold">+${option.price}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Price Display */}
              {isCalculated && (
                <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Quote</h3>
                    <div className="text-4xl font-bold text-green-600 mb-4">
                      ${calculatedPrice.toFixed(2)}
                    </div>

                    {/* Price Breakdown */}
                    <div className="bg-white rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Price Breakdown</h4>
                      <div className="space-y-2 text-sm">
                        {Object.entries(priceBreakdown).map(([item, price]) => (
                          <div key={item} className="flex justify-between">
                            <span className="text-gray-600">{item}:</span>
                            <span className={`font-medium ${price < 0 ? 'text-green-600' : 'text-gray-900'}`}>
                              {price < 0 ? '-' : '+'}${Math.abs(price).toFixed(2)}
                            </span>
                          </div>
                        ))}
                        <div className="border-t pt-2 flex justify-between font-bold">
                          <span>Total:</span>
                          <span className="text-green-600">${calculatedPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 mb-4">
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                        Free sanitization included ($25-50 value)
                      </span>
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                        Satisfaction guaranteed
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!isCalculated ||
                    (pricingData.serviceType === 'residential' && !pricingData.bathrooms) ||
                    (pricingData.serviceType === 'commercial' && !pricingData.restrooms)}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Contact Info →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Contact Information */}
        {step === 3 && (
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
                    <option value="Fort Erie">Fort Erie</option>
                    <option value="Lincoln">Lincoln</option>
                    <option value="Pelham">Pelham</option>
                    <option value="Thorold">Thorold</option>
                    <option value="Grimsby">Grimsby</option>
                  </select>
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
                  disabled={!contactInfo.firstName || !contactInfo.lastName || !contactInfo.email || !contactInfo.phone || !contactInfo.address || !contactInfo.serviceArea}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Scheduling →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Schedule & Payment */}
        {step === 4 && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Schedule & Payment</h2>
              <p className="text-xl text-gray-600">Choose your date and complete payment</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Scheduling */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Your Service</h3>

                <div className="space-y-4">
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
                      {generateTimeSlots().map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>

                  {/* Account Creation Option */}
                  <div className="border-t pt-4">
                    {/* Check if this is a recurring payment */}
                    {pricingData.frequency !== 'onetime' && pricingData.frequency ? (
                      <>
                        {/* Mandatory Account Creation for Recurring Payments */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold">✓</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-blue-900">
                                Account Required for Recurring Service
                              </p>
                              <p className="text-xs text-blue-700 mt-1">
                                To manage your {pricingData.frequency} subscription, pause/cancel services, and track payments, an account is required.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id="createAccount"
                              checked={true}
                              disabled={true}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded opacity-75"
                            />
                            <label htmlFor="createAccount" className="text-sm font-medium text-blue-900">
                              Create an account to track your bookings and manage services (Required)
                            </label>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Optional Account Creation for One-time Payments */}
                        <div className="flex items-center space-x-3 mb-4">
                          <input
                            type="checkbox"
                            id="createAccount"
                            checked={createAccount}
                            onChange={(e) => setCreateAccount(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="createAccount" className="text-sm font-medium text-gray-700">
                            Create an account to track your bookings and manage services (Optional)
                          </label>
                        </div>
                      </>
                    )}

                    {/* Account Creation Form - Show if recurring OR if one-time and checkbox is checked */}
                    {(pricingData.frequency !== 'onetime' || createAccount) && (
                      <div className="space-y-3 bg-blue-50 p-4 rounded-lg">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                          <input
                            type="password"
                            value={accountData.password}
                            onChange={(e) => setAccountData(prev => ({ ...prev, password: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="Create a secure password"
                          />
                          {accountData.password && (
                            <div className="mt-1">
                              <div className="flex justify-between text-xs">
                                <span className={`${
                                  ValidationService.validatePassword(accountData.password).isValid
                                    ? 'text-green-600'
                                    : ValidationService.validatePassword(accountData.password).errors.length <= 2
                                      ? 'text-yellow-600'
                                      : 'text-red-600'
                                }`}>
                                  {ValidationService.validatePassword(accountData.password).isValid
                                    ? 'Strong'
                                    : ValidationService.validatePassword(accountData.password).errors.length <= 2
                                      ? 'Good'
                                      : 'Weak'
                                  }
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                                <div
                                  className={`h-1 rounded-full transition-all ${
                                    ValidationService.validatePassword(accountData.password).isValid
                                      ? 'bg-green-500'
                                      : ValidationService.validatePassword(accountData.password).errors.length <= 2
                                        ? 'bg-yellow-500'
                                        : 'bg-red-500'
                                  }`}
                                  style={{
                                    width: `${
                                      ValidationService.validatePassword(accountData.password).isValid
                                        ? 100
                                        : ValidationService.validatePassword(accountData.password).errors.length <= 2
                                          ? 75
                                          : 25
                                    }%`
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                          <input
                            type="password"
                            value={accountData.confirmPassword}
                            onChange={(e) => setAccountData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="Confirm your password"
                          />
                          {accountData.confirmPassword && accountData.password !== accountData.confirmPassword && (
                            <p className="text-red-600 text-xs mt-1">Passwords do not match</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Security Question *</label>
                          <select
                            value={accountData.securityQuestion}
                            onChange={(e) => setAccountData(prev => ({ ...prev, securityQuestion: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          >
                            <option value="">Choose a security question</option>
                            {SECURITY_QUESTIONS.map((question) => (
                              <option key={question} value={question}>{question}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Security Answer *</label>
                          <input
                            type="text"
                            value={accountData.securityAnswer}
                            onChange={(e) => setAccountData(prev => ({ ...prev, securityAnswer: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="Enter your answer"
                          />
                        </div>

                        <div className="text-xs text-gray-600 bg-white p-2 rounded">
                          <strong>Account Benefits:</strong>
                          <ul className="mt-1 space-y-1">
                            <li>• Track all your bookings and payments</li>
                            <li>• Manage recurring services</li>
                            <li>• Rate and review your cleaning teams</li>
                            <li>• Receive service reminders and updates</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Service Summary</h4>
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
                      <span className="text-gray-600">Service Area:</span>
                      <span className="font-medium">{contactInfo.serviceArea}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Cost:</span>
                      <span className="font-bold text-green-600">${calculatedPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div>
                {/* Recurring Payment Notice */}
                {pricingData.frequency !== 'onetime' && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">🔄</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900">Recurring {pricingData.frequency.charAt(0).toUpperCase() + pricingData.frequency.slice(1)} Service</h4>
                        <p className="text-sm text-blue-700">
                          Account creation is required to manage your subscription, view payment history, and modify your recurring service schedule.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Validation for Recurring Payments */}
                {pricingData.frequency !== 'onetime' && pricingData.frequency && (
                  !accountData.password ||
                  !accountData.confirmPassword ||
                  accountData.password !== accountData.confirmPassword ||
                  !accountData.securityQuestion ||
                  !accountData.securityAnswer ||
                  !ValidationService.validatePassword(accountData.password).isValid
                ) && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">!</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-red-900">Account Required for Recurring Service</h4>
                        <p className="text-sm text-red-700 mt-1">
                          Please complete all account creation fields above to proceed with your {pricingData.frequency} subscription payment.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Only show payment form if account validation passes for recurring payments */}
                {(pricingData.frequency === 'onetime' ||
                  (pricingData.frequency !== 'onetime' &&
                   accountData.password &&
                   accountData.confirmPassword &&
                   accountData.password === accountData.confirmPassword &&
                   accountData.securityQuestion &&
                   accountData.securityAnswer &&
                   ValidationService.validatePassword(accountData.password).isValid)) && (
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
                  accountCreation={(createAccount || pricingData.frequency !== 'onetime') ? {
                    enabled: true,
                    contactInfo,
                    accountData,
                    bookingNumber: generateBookingNumber()
                  } : undefined}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={(error) => {
                    console.error('Payment error:', error);
                    alert('Payment failed. Please try again.');
                  }}
                />
                )}
              </div>
            </div>

            <div className="text-center mt-6">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Back to Contact Info
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Confirmation */}
        {step === 5 && paymentSuccess && (
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-6xl mb-6">✅</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {(createAccount || pricingData.frequency !== 'onetime') ? 'Account Created & Booking Confirmed!' : 'Booking Confirmed!'}
              </h2>
              <p className="text-xl text-gray-600 mb-6">
                {(createAccount || pricingData.frequency !== 'onetime')
                  ? `Welcome to VIP Cleaning Squad! Your account has been created and your ${pricingData.frequency !== 'onetime' ? `${pricingData.frequency} subscription` : `${pricingData.serviceType} cleaning service`} has been successfully set up.`
                  : `Your ${pricingData.serviceType} cleaning service has been successfully booked with Google Calendar integration.`
                }
              </p>

              {(createAccount || pricingData.frequency !== 'onetime') && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">🎉 Your VIP Account is Ready!</h3>
                  <div className="space-y-2 text-sm text-green-800">
                    <div className="flex justify-center items-center space-x-2">
                      <span>Email:</span>
                      <span className="font-bold">{contactInfo.email}</span>
                    </div>
                    <p className="text-center">You've been automatically logged in to your new account.</p>
                  </div>
                </div>
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
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  📧 A confirmation email has been sent to {contactInfo.email} with all your booking details and calendar integration.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900">What's Next?</h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl mb-2">📅</div>
                    <h5 className="font-medium mb-1">Calendar Reminder</h5>
                    <p className="text-gray-600">You'll receive automatic reminders 24 hours and 1 hour before your service</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl mb-2">🧽</div>
                    <h5 className="font-medium mb-1">Professional Service</h5>
                    <p className="text-gray-600">Our trained team will arrive on time with all equipment</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl mb-2">✨</div>
                    <h5 className="font-medium mb-1">Quality Guarantee</h5>
                    <p className="text-gray-600">100% satisfaction guaranteed or we'll return to make it right</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {createAccount && (
                    <a
                      href="/?page=dashboard"
                      className="px-8 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition-all font-semibold"
                    >
                      Go to My Dashboard
                    </a>
                  )}
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
                      setCreateAccount(false);
                      setAccountData({
                        password: '',
                        confirmPassword: '',
                        securityQuestion: '',
                        securityAnswer: ''
                      });
                      setCalculatedPrice(0);
                      setIsCalculated(false);
                      setPaymentSuccess(false);
                      setBookingNumber('');
                      setPriceBreakdown({});
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all font-semibold"
                  >
                    Book Another Service
                  </button>
                </div>

                {createAccount && (
                  <div className="text-sm text-blue-600 bg-blue-50 rounded-lg p-4">
                    <p className="font-medium mb-2">🎯 What's Next with Your VIP Account:</p>
                    <ul className="space-y-1 text-left">
                      <li>• Track this booking and all future services</li>
                      <li>• Receive automatic service reminders</li>
                      <li>• Rate and review your cleaning teams</li>
                      <li>• Manage recurring cleaning schedules</li>
                      <li>• Access payment history and receipts</li>
                    </ul>
                  </div>
                )}

                <div className="text-sm text-gray-600">
                  <p>Need help? Call us at <a href="tel:(289) 697-6559" className="text-blue-600 hover:underline">(289) 697-6559</a></p>
                  <p>or email us at <a href="mailto:info@vipcleaningsquad.ca" className="text-blue-600 hover:underline">info@vipcleaningsquad.ca</a></p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

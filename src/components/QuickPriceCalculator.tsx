import type React from 'react';
import { useState } from 'react';

interface FormData {
  // Contact info
  name: string;
  email: string;
  phone: string;
  // Property type
  propertyType: 'residential' | 'commercial';
  // Residential info
  bedrooms: string;
  bathrooms: string;
  // Commercial info
  squareFootage: string;
  officeCount: string;
  buildingType: string;
  // Common info
  cleaningType: string;
  frequency: string;
  // Schedule info
  preferredDate: string;
  preferredTime: string;
}

// Discount rates based on frequency
const FREQUENCY_DISCOUNTS = {
  oneTime: 0,      // 0% discount
  weekly: 0.20,    // 20% discount
  biWeekly: 0.15,  // 15% discount
  triWeekly: 0.12, // 12% discount
  monthly: 0.10,   // 10% discount
};

// Frequency options with display labels
const FREQUENCY_OPTIONS = [
  { value: 'oneTime', label: 'One-time', discount: 0, displayDiscount: 'No discount' },
  { value: 'weekly', label: 'Weekly', discount: 0.20, displayDiscount: '20% OFF' },
  { value: 'biWeekly', label: 'Bi-weekly', discount: 0.15, displayDiscount: '15% OFF' },
  { value: 'triWeekly', label: 'Tri-weekly', discount: 0.12, displayDiscount: '12% OFF' },
  { value: 'monthly', label: 'Monthly', discount: 0.10, displayDiscount: '10% OFF' }
];

// Available time slots
const TIME_SLOTS = [
  '8:00 AM - 11:00 AM',
  '11:00 AM - 2:00 PM',
  '2:00 PM - 5:00 PM',
  '5:00 PM - 8:00 PM'
];

// Commercial building types
const BUILDING_TYPES = [
  { value: 'office', label: 'Office Building', multiplier: 1.0 },
  { value: 'retail', label: 'Retail Store', multiplier: 1.1 },
  { value: 'medical', label: 'Medical Facility', multiplier: 1.3 },
  { value: 'restaurant', label: 'Restaurant/Food Service', multiplier: 1.4 },
  { value: 'warehouse', label: 'Warehouse/Industrial', multiplier: 0.8 },
  { value: 'school', label: 'Educational Facility', multiplier: 1.2 }
];

// Commercial frequency options (different from residential)
const COMMERCIAL_FREQUENCY_OPTIONS = [
  { value: 'oneTime', label: 'One-time', discount: 0, displayDiscount: 'No discount' },
  { value: 'daily', label: 'Daily', discount: 0.30, displayDiscount: '30% OFF' },
  { value: 'weekly', label: 'Weekly', discount: 0.25, displayDiscount: '25% OFF' },
  { value: 'biWeekly', label: 'Bi-weekly', discount: 0.20, displayDiscount: '20% OFF' },
  { value: 'monthly', label: 'Monthly', discount: 0.15, displayDiscount: '15% OFF' }
];

export function QuickPriceCalculator() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    propertyType: 'residential',
    bedrooms: '',
    bathrooms: '',
    squareFootage: '',
    officeCount: '',
    buildingType: 'office',
    cleaningType: 'standard',
    frequency: 'oneTime',
    preferredDate: '',
    preferredTime: '',
  });

  const [price, setPrice] = useState<{
    firstCleanPrice: number | null;
    subsequentCleanPrice: number | null;
    discountRate: number;
    savingsPerClean: number;
  }>({
    firstCleanPrice: null,
    subsequentCleanPrice: null,
    discountRate: 0,
    savingsPerClean: 0,
  });

  const [showQuote, setShowQuote] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Real-time price calculation for Quick Calculator
  const calculateLivePrice = () => {
    if (formData.propertyType === 'residential') {
      if (!formData.bedrooms || !formData.bathrooms || !formData.cleaningType || !formData.frequency) {
        return { firstPrice: 0, recurringPrice: 0, discount: 0 };
      }

      // Residential pricing
      const basePrice = 120;
      const bedroomCost = Number.parseInt(formData.bedrooms) * 15;
      const bathroomCost = Number.parseInt(formData.bathrooms) * 20;
      let subtotal = basePrice + bedroomCost + bathroomCost;

      // Apply cleaning type multiplier
      switch(formData.cleaningType) {
        case 'deep':
          subtotal = subtotal * 1.5;
          break;
        case 'movein':
          subtotal = subtotal * 1.75;
          break;
        case 'airbnb':
          subtotal = subtotal * 1.25;
          break;
        default:
          break;
      }

      const discountRate = FREQUENCY_DISCOUNTS[formData.frequency as keyof typeof FREQUENCY_DISCOUNTS] || 0;
      const discountAmount = subtotal * discountRate;
      const discountedSubtotal = subtotal - discountAmount;

      // Add tax (13%)
      const taxRate = 0.13;
      const firstCleanPrice = Math.round((subtotal + (subtotal * taxRate)) * 100) / 100;
      const recurringPrice = formData.frequency === 'oneTime' ? 0 : Math.round((discountedSubtotal + (discountedSubtotal * taxRate)) * 100) / 100;

      return {
        firstPrice: firstCleanPrice,
        recurringPrice: recurringPrice,
        discount: Math.round((firstCleanPrice - recurringPrice) * 100) / 100
      };
    }

    // Commercial pricing
    if (!formData.squareFootage || !formData.buildingType || !formData.cleaningType || !formData.frequency) {
      return { firstPrice: 0, recurringPrice: 0, discount: 0 };
    }

    // Commercial base pricing: $0.13 per sq ft
    const sqft = Number.parseInt(formData.squareFootage);
    const basePricePerSqft = 0.13;
    let subtotal = sqft * basePricePerSqft;

    // Minimum charge for small commercial spaces
    if (subtotal < 175) {
      subtotal = 175;
    }

    // Apply building type multiplier
    const buildingType = BUILDING_TYPES.find(bt => bt.value === formData.buildingType);
    if (buildingType) {
      subtotal = subtotal * buildingType.multiplier;
    }

    // Apply cleaning type multiplier
    switch(formData.cleaningType) {
      case 'deep':
        subtotal = subtotal * 1.6;
        break;
      case 'movein':
        subtotal = subtotal * 1.8;
        break;
      case 'disinfection':
        subtotal = subtotal * 1.4;
        break;
      default:
        break;
    }

    // Commercial discounts (higher than residential due to volume)
    const commercialFrequencyOption = COMMERCIAL_FREQUENCY_OPTIONS.find(opt => opt.value === formData.frequency);
    const discountRate = commercialFrequencyOption?.discount || 0;
    const discountAmount = subtotal * discountRate;
    const discountedSubtotal = subtotal - discountAmount;

    // Add tax (13%)
    const taxRate = 0.13;
    const firstCleanPrice = Math.round((subtotal + (subtotal * taxRate)) * 100) / 100;
    const recurringPrice = formData.frequency === 'oneTime' ? 0 : Math.round((discountedSubtotal + (discountedSubtotal * taxRate)) * 100) / 100;

    return {
      firstPrice: firstCleanPrice,
      recurringPrice: recurringPrice,
      discount: Math.round((firstCleanPrice - recurringPrice) * 100) / 100
    };
  };

  const livePrice = calculateLivePrice();

  const calculatePrice = () => {
    // Base price for a standard cleaning
    const basePrice = 120;

    // Add cost for bedrooms
    const bedroomCost = Number.parseInt(formData.bedrooms) * 15;

    // Add cost for bathrooms
    const bathroomCost = Number.parseInt(formData.bathrooms) * 20;

    // Apply multiplier based on cleaning type
    const totalBeforeMultiplier = basePrice + bedroomCost + bathroomCost;

    let subtotal = totalBeforeMultiplier;

    // Apply multiplier based on cleaning type
    switch(formData.cleaningType) {
      case 'deep':
        subtotal = totalBeforeMultiplier * 1.5;
        break;
      case 'movein':
        subtotal = totalBeforeMultiplier * 1.75;
        break;
      case 'airbnb':
        subtotal = totalBeforeMultiplier * 1.25;
        break;
      default:
        // standard cleaning, no multiplier
        break;
    }

    // Round subtotal to 2 decimal places
    subtotal = Math.round(subtotal * 100) / 100;

    // Get discount rate based on frequency
    const discountRate = FREQUENCY_DISCOUNTS[formData.frequency as keyof typeof FREQUENCY_DISCOUNTS] || 0;

    // Calculate discount amount for recurring cleanings
    const discountAmount = subtotal * discountRate;

    // Calculate discounted price for recurring cleanings
    const discountedSubtotal = subtotal - discountAmount;

    // Add tax (13%)
    const taxRate = 0.13;
    const firstCleanTax = subtotal * taxRate;
    const subsequentCleanTax = discountedSubtotal * taxRate;

    // Final prices
    const firstCleanPrice = Math.round((subtotal + firstCleanTax) * 100) / 100;
    const subsequentCleanPrice = Math.round((discountedSubtotal + subsequentCleanTax) * 100) / 100;

    // Calculate savings per clean
    const savingsPerClean = Math.round((firstCleanPrice - subsequentCleanPrice) * 100) / 100;

    setPrice({
      firstCleanPrice,
      subsequentCleanPrice: formData.frequency === 'oneTime' ? null : subsequentCleanPrice,
      discountRate,
      savingsPerClean,
    });

    // Show quote section
    setShowQuote(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculatePrice();
  };

  const handlePayment = (method: string) => {
    setSelectedPaymentMethod(method);
  };

  const processPayment = () => {
    if (!selectedPaymentMethod) {
      alert('Please select a payment method');
      return;
    }

    setIsProcessingPayment(true);

    // Simulate different processing times for different payment methods
    const processingTime = selectedPaymentMethod === 'Apple Pay' || selectedPaymentMethod === 'Google Pay' ? 1000 : 2000;
    const paymentIcon = selectedPaymentMethod === 'Apple Pay' ? '🍎' :
                       selectedPaymentMethod === 'Google Pay' ? '🤖' :
                       selectedPaymentMethod === 'PayPal' ? '🅿️' : '💳';

    // Simulate payment processing
    setTimeout(() => {
      alert(`${paymentIcon} Payment of ${price.firstCleanPrice?.toFixed(2)} processed successfully via ${selectedPaymentMethod}!

✅ Your cleaning is now booked for ${formatDate(formData.preferredDate)} at ${formData.preferredTime}.

📧 A confirmation email has been sent to ${formData.email}.
📱 You will receive a reminder call 24 hours before your appointment.

Thank you for choosing our cleaning service!`);
      setIsProcessingPayment(false);
    }, processingTime);
  };

  // Helper function to display the discount percentage
  const getDiscountText = (frequency: string) => {
    switch(frequency) {
      case 'weekly': return '20%';
      case 'biWeekly': return '15%';
      case 'triWeekly': return '12%';
      case 'monthly': return '10%';
      default: return '0%';
    }
  };

  // Helper function to display the frequency text
  const getFrequencyText = (frequency: string) => {
    switch(frequency) {
      case 'weekly': return 'Weekly';
      case 'biWeekly': return 'Bi-Weekly';
      case 'triWeekly': return 'Tri-Weekly';
      case 'monthly': return 'Monthly';
      default: return 'One-Time';
    }
  };

  // Format date to display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Get minimum bookable date (tomorrow)
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow-md">
      <h2 className="text-xl font-bold mb-4 text-center">Quick Price Calculator</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Contact Information */}
        <div>
          <h3 className="flex items-center font-medium mb-3">
            <span className="mr-2 text-xl">👤</span>
            <span>Contact Information</span>
          </h3>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">
              👤 Your Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
              placeholder="Full Name"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">
              📧 Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              📱 Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
              placeholder="(555) 123-4567"
            />
          </div>
        </div>

        {/* Property Type Selection */}
        <div>
          <h3 className="flex items-center font-medium mb-3">
            <span className="mr-2 text-xl">🏢</span>
            <span>Property Type</span>
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              type="button"
              onClick={() => setFormData(prev => ({...prev, propertyType: 'residential'}))}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-[1.02] ${
                formData.propertyType === 'residential'
                  ? 'border-blue-500 bg-blue-50 shadow-md scale-[1.01]'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 hover:shadow-sm'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🏠</div>
                <div className="font-medium text-gray-900">Residential</div>
                <div className="text-sm text-gray-600">Homes, Apartments, Condos</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({...prev, propertyType: 'commercial'}))}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-[1.02] ${
                formData.propertyType === 'commercial'
                  ? 'border-blue-500 bg-blue-50 shadow-md scale-[1.01]'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 hover:shadow-sm'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🏢</div>
                <div className="font-medium text-gray-900">Commercial</div>
                <div className="text-sm text-gray-600">Offices, Retail, Medical</div>
              </div>
            </button>
          </div>
        </div>

        {/* Property Details - Conditional Rendering */}
        {formData.propertyType === 'residential' ? (
          // Residential Form
          <>
            <div>
              <label className="flex items-center mb-1">
                <span className="mr-2 text-xl">🛌</span>
                <span>Number of Bedrooms</span>
              </label>
              <select
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Bedrooms</option>
                <option value="1">1 Bedroom</option>
                <option value="2">2 Bedrooms</option>
                <option value="3">3 Bedrooms</option>
                <option value="4">4 Bedrooms</option>
                <option value="5">5 Bedrooms</option>
              </select>
            </div>

            <div>
              <label className="flex items-center mb-1">
                <span className="mr-2 text-xl">🚿</span>
                <span>Number of Bathrooms</span>
              </label>
              <select
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Bathrooms</option>
                <option value="1">1 Bathroom</option>
                <option value="2">2 Bathrooms</option>
                <option value="3">3 Bathrooms</option>
                <option value="4">4 Bathrooms</option>
                <option value="5">5 Bathrooms</option>
              </select>
            </div>

            <div>
              <label className="flex items-center mb-1">
                <span className="mr-2 text-xl">🧹</span>
                <span>Type of Cleaning</span>
              </label>
              <select
                name="cleaningType"
                value={formData.cleaningType}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="standard">Standard Cleaning</option>
                <option value="deep">Deep Cleaning</option>
                <option value="movein">Move In/Out Cleaning</option>
                <option value="airbnb">AirBnB Cleaning</option>
              </select>
            </div>
          </>
        ) : (
          // Commercial Form
          <>
            <div>
              <label className="flex items-center mb-1">
                <span className="mr-2 text-xl">📐</span>
                <span>Square Footage</span>
              </label>
              <input
                type="number"
                name="squareFootage"
                value={formData.squareFootage}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
                placeholder="e.g., 2500"
                min="100"
                max="50000"
              />
              <p className="text-xs text-gray-500 mt-1">Approximate total square footage</p>
            </div>

            <div>
              <label className="flex items-center mb-1">
                <span className="mr-2 text-xl">🏢</span>
                <span>Building Type</span>
              </label>
              <select
                name="buildingType"
                value={formData.buildingType}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                {BUILDING_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center mb-1">
                <span className="mr-2 text-xl">🏬</span>
                <span>Number of Offices/Rooms</span>
              </label>
              <input
                type="number"
                name="officeCount"
                value={formData.officeCount}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="e.g., 15"
                min="1"
                max="200"
              />
              <p className="text-xs text-gray-500 mt-1">Individual offices, rooms, or units</p>
            </div>

            <div>
              <label className="flex items-center mb-1">
                <span className="mr-2 text-xl">🧹</span>
                <span>Type of Cleaning</span>
              </label>
              <select
                name="cleaningType"
                value={formData.cleaningType}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="standard">Standard Cleaning</option>
                <option value="deep">Deep Cleaning</option>
                <option value="disinfection">Disinfection Service</option>
                <option value="movein">Move In/Out Cleaning</option>
              </select>
            </div>
          </>
        )}

        <div>
          <label className="flex items-center mb-3">
            <span className="mr-2 text-xl">🗓️</span>
            <span className="font-medium">
              {formData.propertyType === 'residential' ? 'Cleaning Frequency & Savings' : 'Commercial Cleaning Schedule & Volume Discounts'}
            </span>
          </label>

          {/* Frequency Selection Grid - Conditional based on property type */}
          <div className="space-y-2 mb-4">
            {(formData.propertyType === 'residential' ? FREQUENCY_OPTIONS : COMMERCIAL_FREQUENCY_OPTIONS).map(option => (
              <div
                key={option.value}
                onClick={() => setFormData(prev => ({...prev, frequency: option.value}))}
                className={`relative p-3 border-2 rounded-lg cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-[1.02] ${
                  formData.frequency === option.value
                    ? 'border-yellow-500 bg-yellow-50 shadow-md scale-[1.01]'
                    : 'border-gray-200 hover:border-yellow-300 hover:bg-gray-50 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="frequency"
                      value={option.value}
                      checked={formData.frequency === option.value}
                      onChange={() => {}} // Handled by div onClick
                      className="mr-3 h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{option.label}</div>
                      {option.discount > 0 && (
                        <div className="text-sm text-gray-600">Save {(option.discount * 100).toFixed(0)}% after first cleaning</div>
                      )}
                    </div>
                  </div>
                  {option.discount > 0 && (
                    <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      {option.displayDiscount}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Savings Banner */}
          {formData.frequency && formData.frequency !== 'oneTime' && (
            <div className="mt-3 p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold">🎉 {formData.propertyType === 'commercial' ? 'Excellent Volume Discount!' : 'Great Choice!'}</div>
                  <div className="text-sm opacity-90">
                    Save {(formData.propertyType === 'residential' ? FREQUENCY_OPTIONS : COMMERCIAL_FREQUENCY_OPTIONS).find(opt => opt.value === formData.frequency)?.displayDiscount} after your first cleaning
                  </div>
                </div>
                <div className="text-lg font-bold">
                  {(formData.propertyType === 'residential' ? FREQUENCY_OPTIONS : COMMERCIAL_FREQUENCY_OPTIONS).find(opt => opt.value === formData.frequency)?.displayDiscount}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Real-Time Price Display */}
        {((formData.propertyType === 'residential' && formData.bedrooms && formData.bathrooms) ||
          (formData.propertyType === 'commercial' && formData.squareFootage && formData.buildingType)) &&
         formData.cleaningType && formData.frequency && livePrice.firstPrice > 0 && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 shadow-lg transition-all duration-500 ease-in-out transform animate-in slide-in-from-top">
            <h3 className="text-lg font-bold text-green-900 mb-3 flex items-center">
              <span className="mr-2 text-xl">💰</span>
              <span>Your {formData.propertyType === 'commercial' ? 'Commercial' : 'Residential'} Price Estimate</span>
            </h3>

            <div className="space-y-3">
              {/* First Cleaning Price */}
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-lg">First Cleaning:</span>
                    <div className="text-xs text-gray-500">Includes 13% tax</div>
                  </div>
                  <span className="text-2xl font-bold text-green-600 transition-all duration-500 ease-in-out transform hover:scale-105">
                    ${livePrice.firstPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Recurring Price (if applicable) */}
              {formData.frequency !== 'oneTime' && livePrice.recurringPrice > 0 && (
                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium text-yellow-800">
                        {formData.frequency === 'weekly' ? 'Weekly' :
                         formData.frequency === 'biWeekly' ? 'Bi-weekly' :
                         formData.frequency === 'triWeekly' ? 'Tri-weekly' : 'Monthly'} Cleanings:
                      </span>
                      <div className="text-xs text-yellow-600">
                        {FREQUENCY_OPTIONS.find(opt => opt.value === formData.frequency)?.displayDiscount} discount
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 line-through transition-all duration-300">
                        ${livePrice.firstPrice.toFixed(2)}
                      </div>
                      <div className="text-xl font-bold text-yellow-700 transition-all duration-500 ease-in-out transform hover:scale-105">
                        ${livePrice.recurringPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {livePrice.discount > 0 && (
                    <div className="mt-2 pt-2 border-t border-yellow-300">
                      <div className="flex justify-between text-sm">
                        <span className="text-yellow-700">💰 You save per cleaning:</span>
                        <span className="font-bold text-yellow-700 transition-all duration-300 ease-in-out">
                          ${livePrice.discount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-3 text-center">
              <div className="text-xs text-gray-600">
                💡 Complete your details below to book this service!
              </div>
            </div>
          </div>
        )}

        {/* Schedule Information */}
        <div>
          <h3 className="flex items-center font-medium mb-3">
            <span className="mr-2 text-xl">📅</span>
            <span>Preferred Schedule</span>
          </h3>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">
              📅 Preferred Date
            </label>
            <input
              type="date"
              name="preferredDate"
              value={formData.preferredDate}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
              min={getTomorrowDate()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              ⏰ Preferred Time
            </label>
            <select
              name="preferredTime"
              value={formData.preferredTime}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select Time Slot</option>
              {TIME_SLOTS.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Enhanced Savings info box */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200 mt-2">
          <h4 className="font-bold text-yellow-800 flex items-center text-lg">
            <span className="mr-2 text-2xl">💰</span>
            <span>HUGE Savings on Recurring Cleanings!</span>
          </h4>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-green-100 p-2 rounded text-center">
              <div className="font-bold text-green-800">Weekly</div>
              <div className="text-green-600 font-bold text-lg">20% OFF</div>
            </div>
            <div className="bg-green-100 p-2 rounded text-center">
              <div className="font-bold text-green-800">Bi-Weekly</div>
              <div className="text-green-600 font-bold text-lg">15% OFF</div>
            </div>
            <div className="bg-green-100 p-2 rounded text-center">
              <div className="font-bold text-green-800">Tri-Weekly</div>
              <div className="text-green-600 font-bold text-lg">12% OFF</div>
            </div>
            <div className="bg-green-100 p-2 rounded text-center">
              <div className="font-bold text-green-800">Monthly</div>
              <div className="text-green-600 font-bold text-lg">10% OFF</div>
            </div>
          </div>
          <p className="text-center text-yellow-700 mt-3 font-bold text-sm">
            ⭐ Discounts start after your first cleaning! The more frequent, the bigger the savings! ⭐
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-yellow-400 text-gray-800 font-bold py-2 px-4 rounded hover:bg-yellow-500 transition duration-300 flex items-center justify-center"
        >
          <span className="mr-2 text-xl">🔍</span>
          <span>GET MY PRICE</span>
        </button>
      </form>

      {showQuote && price.firstCleanPrice !== null && (
        <div className="mt-6 pt-4 border-t">
          <div className="text-center">
            <p className="text-lg font-semibold">Your Estimated Price:</p>
            <p className="text-3xl font-bold text-green-600">${price.firstCleanPrice.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-2">Price includes 13% tax</p>
          </div>

          <div className="mt-4 text-center">
            <div className="border border-gray-200 p-3 rounded mb-3 text-left">
              <p className="font-medium">Booking Details:</p>
              <p><span className="font-medium">Name:</span> {formData.name}</p>
              <p><span className="font-medium">Email:</span> {formData.email}</p>
              <p><span className="font-medium">Phone:</span> {formData.phone}</p>
              <p><span className="font-medium">Date:</span> {formatDate(formData.preferredDate)}</p>
              <p><span className="font-medium">Time:</span> {formData.preferredTime}</p>
            </div>

            <div className="border border-gray-200 p-3 rounded mb-3 text-left">
              <p className="font-medium">Service Details:</p>
              <p>
                <span className="mr-1">🛌</span>
                {formData.bedrooms} bedroom(s) and
                <span className="mx-1">🚿</span>
                {formData.bathrooms} bathroom(s)
              </p>
              <p>
                <span className="mr-2">🧹</span>
                {formData.cleaningType === 'standard' ? 'Standard' :
                  formData.cleaningType === 'deep' ? 'Deep' :
                  formData.cleaningType === 'movein' ? 'Move In/Out' :
                  'AirBnB'} Cleaning
              </p>
              <p>
                <span className="mr-2">🔄</span>
                {getFrequencyText(formData.frequency)} service
              </p>
            </div>

            {formData.frequency !== 'oneTime' && price.subsequentCleanPrice !== null && (
              <div className="mt-4 bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-2 flex items-center justify-center">
                  <span className="mr-2 text-xl">💰</span>
                  <span>Recurring Cleaning Savings</span>
                </h4>
                <p className="text-sm">
                  With {getFrequencyText(formData.frequency)} cleaning, you'll save <span className="font-medium">{getDiscountText(formData.frequency)}</span> on
                  all cleanings after your first appointment.
                </p>
                <div className="mt-2 pt-2 border-t border-green-200">
                  <p className="font-medium flex justify-between">
                    <span>First Cleaning:</span>
                    <span>${price.firstCleanPrice.toFixed(2)}</span>
                  </p>
                  <p className="font-medium flex justify-between text-green-600">
                    <span>Subsequent Cleanings:</span>
                    <span>${price.subsequentCleanPrice.toFixed(2)}</span>
                  </p>
                  <p className="text-xs text-green-600 font-semibold mt-1">
                    You save ${price.savingsPerClean.toFixed(2)} per cleaning!
                  </p>
                </div>
              </div>
            )}

            {/* Payment Section */}
            <div className="mt-6 border-t pt-4">
              <h4 className="font-medium mb-4 flex items-center justify-center">
                <span className="mr-2 text-xl">💳</span>
                <span>Select Payment Method</span>
              </h4>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  className={`border p-3 rounded flex flex-col items-center justify-center hover:bg-gray-50 ${selectedPaymentMethod === 'Credit Card' ? 'border-green-500 bg-green-50' : ''}`}
                  onClick={() => handlePayment('Credit Card')}
                  type="button"
                >
                  <span className="text-2xl mb-1">💳</span>
                  <span>Credit Card</span>
                </button>

                <button
                  className={`border p-3 rounded flex flex-col items-center justify-center hover:bg-gray-50 ${selectedPaymentMethod === 'Apple Pay' ? 'border-green-500 bg-green-50' : ''}`}
                  onClick={() => handlePayment('Apple Pay')}
                  type="button"
                >
                  <span className="text-2xl mb-1">🍎</span>
                  <span>Apple Pay</span>
                </button>

                <button
                  className={`border p-3 rounded flex flex-col items-center justify-center hover:bg-gray-50 ${selectedPaymentMethod === 'Google Pay' ? 'border-green-500 bg-green-50' : ''}`}
                  onClick={() => handlePayment('Google Pay')}
                  type="button"
                >
                  <span className="text-2xl mb-1">🤖</span>
                  <span>Google Pay</span>
                </button>

                <button
                  className={`border p-3 rounded flex flex-col items-center justify-center hover:bg-gray-50 ${selectedPaymentMethod === 'PayPal' ? 'border-green-500 bg-green-50' : ''}`}
                  onClick={() => handlePayment('PayPal')}
                  type="button"
                >
                  <span className="text-2xl mb-1">🅿️</span>
                  <span>PayPal</span>
                </button>
              </div>

              <button
                className="w-full bg-green-600 text-white py-3 px-6 rounded hover:bg-green-700 transition duration-300 flex items-center justify-center"
                onClick={processPayment}
                disabled={isProcessingPayment}
                type="button"
              >
                {isProcessingPayment ? (
                  <>
                    <span className="animate-spin mr-2">⚙️</span>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span className="mr-2 text-xl">🔒</span>
                    <span>Pay ${price.firstCleanPrice.toFixed(2)} & Book Now</span>
                  </>
                )}
              </button>

              <p className="text-xs text-center mt-2 text-gray-500">
                Your payment information is secure and encrypted. Full payment is required to confirm your booking.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

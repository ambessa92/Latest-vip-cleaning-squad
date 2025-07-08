import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import emailjs from '@emailjs/browser';
import { createCalendarEvent, generateCalendarLink, createCustomerCalendarInvite, type BookingDetails } from '../services/googleCalendar';
import { CustomerAuthService } from '../services/customerAccount';
import { NotificationService } from '../services/notifications';

interface EnhancedPaymentFormProps {
  amount: number;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  serviceDetails: {
    serviceType: string;
    frequency: string;
    date: string;
    time: string;
    location: string;
    cleaningType?: string;
    addOns?: string[];
  };
  accountCreation?: {
    enabled: boolean;
    contactInfo: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      serviceArea: string;
    };
    accountData: {
      password: string;
      confirmPassword: string;
      securityQuestion: string;
      securityAnswer: string;
    };
    bookingNumber: string;
  };
  onPaymentSuccess: (calendarEventId?: string) => void;
  onPaymentError?: (error: string) => void;
}

// Order data interface for email notifications
interface OrderData {
  id?: string;
  orderID: string;
  subscriptionID?: string;
  amount?: {
    value: string;
    currency_code: string;
  };
  status?: string;
}

// PayPal Order Actions Interface
interface PayPalOrderActions {
  order: {
    create: (orderData: PayPalOrderRequest) => Promise<string>;
    capture: () => Promise<PayPalOrderResponse>;
  };
}

// PayPal Order Request Interface
interface PayPalOrderRequest {
  purchase_units: Array<{
    amount: {
      value: string;
      currency_code: string;
      breakdown?: {
        item_total: {
          currency_code: string;
          value: string;
        };
        tax_total: {
          currency_code: string;
          value: string;
        };
      };
    };
    description?: string;
    custom_id?: string;
    invoice_id?: string;
    items?: Array<{
      name: string;
      description?: string;
      quantity: string;
      unit_amount: {
        currency_code: string;
        value: string;
      };
      tax?: {
        currency_code: string;
        value: string;
      };
      category: string;
    }>;
  }>;
  application_context?: {
    brand_name: string;
    landing_page: string;
    shipping_preference: string;
    user_action: string;
  };
}

// PayPal Order Response Interface
interface PayPalOrderResponse {
  id: string;
  status: string;
  purchase_units: Array<{
    amount: {
      currency_code: string;
      value: string;
    };
  }>;
}

declare global {
  interface Window {
    paypal?: {
      Buttons: (options: Record<string, unknown>) => {
        render: (selector: string) => Promise<void>;
      };
    };
  }
}

export default function EnhancedPaymentForm(props: EnhancedPaymentFormProps) {
  const [isPayPalLoaded, setIsPayPalLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paypalError, setPaypalError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<string[]>([]);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [createdPlanId, setCreatedPlanId] = useState<string | null>(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState<Record<string, unknown> | null>(null);
  const paypalRef = useRef<HTMLDivElement>(null);

  // Determine if this is a recurring service
  const isRecurringService = props.serviceDetails.frequency !== 'onetime';

  // Enhanced frequency mapping with proper PayPal intervals
  interface FrequencyMapping {
    interval_unit: 'WEEK' | 'MONTH';
    interval_count: number;
    label: string;
    cycles_per_year: number;
    description: string;
  }

  const frequencyMapping: Record<string, FrequencyMapping> = useMemo(() => ({
    'weekly': {
      interval_unit: 'WEEK' as const,
      interval_count: 1,
      label: 'Weekly',
      cycles_per_year: 52,
      description: 'Weekly cleaning service - billed every week'
    },
    'biweekly': {
      interval_unit: 'WEEK' as const,
      interval_count: 2,
      label: 'Bi-weekly',
      cycles_per_year: 26,
      description: 'Bi-weekly cleaning service - billed every 2 weeks'
    },
    'monthly': {
      interval_unit: 'MONTH' as const,
      interval_count: 1,
      label: 'Monthly',
      cycles_per_year: 12,
      description: 'Monthly cleaning service - billed every month'
    }
  }), []);

  const addDiagnostic = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;
    const deviceInfo = isMobile ? '📱 [MOBILE]' : '🖥️ [DESKTOP]';
    const logMessage = `${deviceInfo} [${timestamp}] ${message}`;

    setDiagnostics(prev => [...prev, logMessage]);
    console.log(`PayPal Diagnostic: ${logMessage}`);

    // Mobile-specific logging
    if (isMobile) {
      console.log('📱 Mobile PayPal Context:', {
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        pixelRatio: window.devicePixelRatio,
        touchSupport: 'ontouchstart' in window,
        userAgent: navigator.userAgent.substring(0, 100),
        networkType: (navigator as unknown as { connection?: { effectiveType?: string } }).connection?.effectiveType || 'unknown'
      });
    }
  }, []);

  // Enhanced email confirmation with subscription details
  const sendConfirmationEmail = useCallback(async (orderData: OrderData, isSubscription = false) => {
    try {
      addDiagnostic('Sending enhanced confirmation email...');
      emailjs.init("Y8wW5l5Kiho70UhwU");

      const frequency = isSubscription ? frequencyMapping[props.serviceDetails.frequency as keyof typeof frequencyMapping] : null;

      const emailParams = {
        customer_name: props.customerDetails.name,
        customer_email: props.customerDetails.email,
        customer_phone: props.customerDetails.phone,
        service_type: props.serviceDetails.serviceType,
        service_frequency: props.serviceDetails.frequency,
        amount: `${props.amount.toFixed(2)} CAD`,
        order_id: orderData.id || orderData.subscriptionID || `VIP_${Date.now()}`,
        booking_date: new Date().toLocaleDateString(),
        customer_address: `${props.customerDetails.address}, ${props.customerDetails.city}, ${props.customerDetails.state} ${props.customerDetails.zipCode}`,
        payment_type: isSubscription ? 'Subscription' : 'One-time Payment',
        billing_frequency: isSubscription && frequency ? frequency.label : 'One-time'
      };

      await emailjs.send("service_04l9qxe", "template_azjian8", emailParams);
      addDiagnostic('Enhanced confirmation email sent successfully');
    } catch (error) {
      addDiagnostic(`Email sending failed: ${error}`);
      console.error('EmailJS Error:', error);
    }
  }, [props.customerDetails, props.serviceDetails, props.amount, addDiagnostic, frequencyMapping]);

  const initializePayPalButtons = useCallback(() => {
    if (!window.paypal || !paypalRef.current) return;

    addDiagnostic('Initializing enhanced PayPal buttons...');
    paypalRef.current.innerHTML = '';

    try {
      const paypalOptions: Record<string, unknown> = {
        style: {
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          height: 45,
          label: isRecurringService ? 'subscribe' : 'pay'
        },
        createOrder: (data: unknown, actions: PayPalOrderActions) => {
          addDiagnostic(`Creating enhanced PayPal order for amount: $${props.amount}`);
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: props.amount.toFixed(2),
                currency_code: 'CAD'
              }
            }]
          });
        },
        onApprove: async (data: { orderID: string }, actions: PayPalOrderActions) => {
          addDiagnostic(`Enhanced PayPal payment approved: ${data.orderID}`);
          setIsProcessing(true);

          try {
            const order = await actions.order.capture();
            addDiagnostic('Enhanced payment captured successfully');

            // Convert PayPal response to OrderData format
            const orderData: OrderData = {
              id: order.id,
              orderID: order.id,
              status: order.status,
              amount: order.purchase_units[0]?.amount
            };

            await sendConfirmationEmail(orderData);

            // CRITICAL BOOKING STORAGE - MUST ALWAYS EXECUTE
            console.log('🚨 PAYMENT CAPTURED - STORING BOOKING DATA NOW...');
            console.log('📋 Customer Details:', props.customerDetails);
            console.log('🏠 Service Details:', props.serviceDetails);
            console.log('💰 Amount:', props.amount);

            // Mobile-specific pre-storage logging
            const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;
            if (isMobile) {
              console.log('📱 MOBILE PAYMENT STORAGE CONTEXT:');
              console.log('Screen size:', window.innerWidth, 'x', window.innerHeight);
              console.log('Available memory:', (navigator as unknown as { deviceMemory?: number }).deviceMemory || 'unknown');
              console.log('Network type:', (navigator as unknown as { connection?: { effectiveType?: string } }).connection?.effectiveType || 'unknown');
              console.log('Storage API available:', 'storage' in navigator);

              // Test mobile localStorage before critical storage
              try {
                const testKey = `mobile_payment_test_${Date.now()}`;
                localStorage.setItem(testKey, 'test');
                const retrieved = localStorage.getItem(testKey);
                localStorage.removeItem(testKey);
                console.log('📱 Mobile localStorage pre-test:', retrieved === 'test' ? 'PASS' : 'FAIL');
              } catch (error) {
                console.error('📱 CRITICAL: Mobile localStorage pre-test FAILED:', error);
                addDiagnostic('🚨 MOBILE STORAGE PRE-TEST FAILED - STORAGE MAY BE COMPROMISED');
              }
            }

            const bookingNumber = props.accountCreation?.bookingNumber || `VIP${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

            const bookingData = {
              id: `booking_${Date.now()}_${Math.random().toString(36).substring(2)}`,
              bookingNumber,
              customerName: props.customerDetails.name || 'Unknown Customer',
              customerEmail: props.customerDetails.email || 'unknown@email.com',
              customerPhone: props.customerDetails.phone || 'Unknown Phone',
              serviceType: (props.serviceDetails.serviceType as 'residential' | 'commercial') || 'residential',
              serviceDate: props.serviceDetails.date || new Date().toISOString().split('T')[0],
              serviceTime: props.serviceDetails.time || '09:00',
              serviceAddress: `${props.customerDetails.address || 'Unknown Address'}, ${props.customerDetails.city || 'Unknown City'}, ${props.customerDetails.state || 'ON'} ${props.customerDetails.zipCode || 'XXX XXX'}`,
              serviceArea: props.serviceDetails.location || 'Niagara Region',
              amount: props.amount || 0,
              status: 'scheduled' as const,
              paymentStatus: 'paid' as const,
              cleaningType: props.serviceDetails.cleaningType || 'standard',
              frequency: props.serviceDetails.frequency || 'onetime',
              addOns: props.serviceDetails.addOns || [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              // Mobile-specific metadata
              deviceInfo: isMobile ? {
                isMobile: true,
                screenSize: `${window.innerWidth}x${window.innerHeight}`,
                userAgent: navigator.userAgent.substring(0, 100),
                timestamp: Date.now()
              } : undefined
            };

            const transactionData = {
              id: order.id,
              customerName: props.customerDetails.name || 'Unknown Customer',
              customerEmail: props.customerDetails.email || 'unknown@email.com',
              customerPhone: props.customerDetails.phone || 'Unknown Phone',
              serviceType: props.serviceDetails.serviceType || 'residential',
              amount: props.amount || 0,
              paymentMethod: 'paypal' as const,
              paypalOrderId: order.id,
              status: 'completed' as const,
              createdAt: new Date().toISOString(),
              serviceDate: props.serviceDetails.date || new Date().toISOString().split('T')[0],
              serviceTime: props.serviceDetails.time || '09:00',
              serviceAddress: `${props.customerDetails.address || 'Unknown Address'}, ${props.customerDetails.city || 'Unknown City'}, ${props.customerDetails.state || 'ON'} ${props.customerDetails.zipCode || 'XXX XXX'}`,
              serviceArea: props.serviceDetails.location || 'Niagara Region',
              addOns: props.serviceDetails.addOns || [],
              frequency: props.serviceDetails.frequency || 'onetime',
              bookingNumber,
              // Mobile-specific metadata
              deviceInfo: isMobile ? {
                isMobile: true,
                screenSize: `${window.innerWidth}x${window.innerHeight}`,
                userAgent: navigator.userAgent.substring(0, 100),
                timestamp: Date.now()
              } : undefined
            };

            // FORCE STORAGE - NO TRY/CATCH TO HIDE ERRORS
            const existingBookings = JSON.parse(localStorage.getItem('vip_admin_bookings') || '[]');
            existingBookings.unshift(bookingData);
            localStorage.setItem('vip_admin_bookings', JSON.stringify(existingBookings));

            const existingTransactions = JSON.parse(localStorage.getItem('vip_admin_transactions') || '[]');
            existingTransactions.unshift(transactionData);
            localStorage.setItem('vip_admin_transactions', JSON.stringify(existingTransactions));

            // Mobile-specific post-storage verification
            if (isMobile) {
              console.log('📱 MOBILE POST-STORAGE VERIFICATION:');

              // Verify data was actually stored
              const verifyBookings = localStorage.getItem('vip_admin_bookings');
              const verifyTransactions = localStorage.getItem('vip_admin_transactions');

              if (verifyBookings && verifyTransactions) {
                const parsedBookings = JSON.parse(verifyBookings);
                const parsedTransactions = JSON.parse(verifyTransactions);

                const bookingFound = parsedBookings.find((b: { bookingNumber: string }) => b.bookingNumber === bookingNumber);
                const transactionFound = parsedTransactions.find((t: { id: string }) => t.id === order.id);

                console.log('📱 Mobile storage verification results:');
                console.log('Booking found:', !!bookingFound);
                console.log('Transaction found:', !!transactionFound);
                console.log('Total bookings stored:', parsedBookings.length);
                console.log('Total transactions stored:', parsedTransactions.length);

                if (!bookingFound || !transactionFound) {
                  console.error('🚨 MOBILE STORAGE VERIFICATION FAILED');
                  addDiagnostic('🚨 MOBILE: Data storage verification failed - booking or transaction not found');
                } else {
                  console.log('✅ MOBILE STORAGE VERIFICATION PASSED');
                  addDiagnostic('✅ MOBILE: Data storage verification successful');
                }
              } else {
                console.error('🚨 MOBILE STORAGE CRITICAL FAILURE');
                addDiagnostic('🚨 MOBILE: Critical storage failure - localStorage data not retrievable');
              }
            }

            console.log('🎉 BOOKING SUCCESSFULLY STORED!');
            console.log('📅 Booking Data:', bookingData);
            console.log('💳 Transaction Data:', transactionData);
            console.log('📊 Total Bookings Now:', existingBookings.length);
            console.log('💰 Total Transactions Now:', existingTransactions.length);

            addDiagnostic(`🎉 SUCCESS: Stored booking #${bookingNumber} and transaction #${order.id}`);

            if (props.accountCreation?.enabled) {
              try {
                const authService = CustomerAuthService.getInstance();
                const { contactInfo, accountData } = props.accountCreation;

                const registrationData = {
                  email: contactInfo.email,
                  firstName: contactInfo.firstName,
                  lastName: contactInfo.lastName,
                  phone: contactInfo.phone,
                  address: contactInfo.address,
                  city: contactInfo.city,
                  state: contactInfo.state,
                  zipCode: contactInfo.zipCode,
                  serviceArea: contactInfo.serviceArea,
                  password: accountData.password,
                  confirmPassword: accountData.confirmPassword,
                  securityQuestion: accountData.securityQuestion,
                  securityAnswer: accountData.securityAnswer
                };

                const newCustomer = await authService.register(registrationData);
                if (newCustomer) {
                  addDiagnostic('Customer account created successfully during enhanced checkout');

                  // Create a booking confirmation notification
                  const { NotificationService } = await import('../services/notifications');
                  NotificationService.createBookingConfirmation(
                    newCustomer.id,
                    props.accountCreation.bookingNumber,
                    props.serviceDetails.date
                  );
                }
              } catch (error) {
                addDiagnostic(`Account creation failed: ${error}`);
                console.error('Error creating account during checkout:', error);
                // Don't fail the payment, just log the error - the user can create an account later
              }
            }

            props.onPaymentSuccess();
          } catch (error) {
            addDiagnostic(`Enhanced payment capture error: ${error}`);
            props.onPaymentError?.('Enhanced payment processing failed');
          } finally {
            setIsProcessing(false);
          }
        },
        onError: (err: Error) => {
          addDiagnostic(`Enhanced PayPal button error: ${err.message}`);
          setPaypalError('Payment error occurred. Please try again.');
          setIsProcessing(false);
        },
        onCancel: () => {
          addDiagnostic('Enhanced payment cancelled by user');
          setIsProcessing(false);
        }
      };

      window.paypal.Buttons(paypalOptions).render('.paypal-buttons-container');
      addDiagnostic(`Enhanced PayPal buttons rendered successfully for ${isRecurringService ? 'subscription' : 'one-time'} payment`);
    } catch (error) {
      addDiagnostic(`Enhanced PayPal button initialization error: ${error}`);
      setPaypalError('Failed to initialize enhanced PayPal buttons');
    }
  }, [props, isRecurringService, sendConfirmationEmail, addDiagnostic]);

  const loadPayPalScript = useCallback(async () => {
    try {
      addDiagnostic('Loading enhanced PayPal SDK...');

      const existingScripts = document.querySelectorAll('script[src*="paypal.com"]');
      for (const script of existingScripts) {
        script.remove();
      }

      if (window.paypal) {
        window.paypal = undefined;
      }

      const script = document.createElement('script');
      const paypalUrl = "https://www.paypal.com/sdk/js?client-id=Aa8vB4DXr6emNdurQdi0fVw05XabxrMPM9aw4zHPRfXEFkhcHtFUki6rmIVarqLSH5zbAgG37O9kr2vj&currency=CAD&intent=capture&vault=true&components=buttons,funding-eligibility";

      script.src = paypalUrl;
      script.async = true;
      script.crossOrigin = 'anonymous';

      const loadPromise = new Promise((resolve, reject) => {
        script.onload = () => {
          addDiagnostic('Enhanced PayPal SDK script loaded successfully');
          setTimeout(() => {
            if (window.paypal) {
              addDiagnostic('PayPal object confirmed with subscription support');
              resolve(true);
            } else {
              addDiagnostic('PayPal object not found after script load');
              reject(new Error('PayPal SDK loaded but window.paypal not available'));
            }
          }, 1000);
        };

        script.onerror = (error) => {
          addDiagnostic(`PayPal SDK script error: ${error}`);
          reject(new Error('Failed to load PayPal SDK'));
        };

        setTimeout(() => {
          addDiagnostic('PayPal SDK load timeout');
          reject(new Error('PayPal SDK load timeout'));
        }, 15000);
      });

      document.head.appendChild(script);
      await loadPromise;

      setIsPayPalLoaded(true);
      setPaypalError(null);
      addDiagnostic('Enhanced PayPal SDK loaded successfully with subscription support');

    } catch (error) {
      addDiagnostic(`PayPal SDK load failed: ${error}`);
      setPaypalError(`Failed to load PayPal: ${error}`);
    }
  }, [addDiagnostic]);

  useEffect(() => {
    if (isPayPalLoaded && paypalRef.current) {
      initializePayPalButtons();
    }
  }, [isPayPalLoaded, initializePayPalButtons]);

  useEffect(() => {
    if (!isPayPalLoaded && !paypalError) {
      loadPayPalScript();
    }
  }, [isPayPalLoaded, paypalError, loadPayPalScript]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Complete Payment</h3>

      {/* Enhanced Payment Type Indicator */}
      <div className="mb-6">
        {isRecurringService ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">🔄 Professional Subscription Service</h4>
            <p className="text-blue-700 text-sm mb-2">
              <strong>Automatic billing:</strong> You'll be charged ${props.amount.toFixed(2)} CAD {frequencyMapping[props.serviceDetails.frequency as keyof typeof frequencyMapping]?.label.toLowerCase()} for ongoing professional service.
            </p>
            <div className="text-blue-600 text-xs space-y-1">
              <p>• First service: {props.serviceDetails.date} at {props.serviceDetails.time}</p>
              <p>• Billing starts: After first service completion</p>
              <p>• Full control: Pause, modify, or cancel anytime in your dashboard</p>
              <p>• Secure: Powered by PayPal's enterprise subscription platform</p>
              <p>• Guaranteed: Priority scheduling and professional service guarantee</p>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">💳 One-time Professional Service</h4>
            <p className="text-green-700 text-sm mb-2">
              <strong>Single charge:</strong> Pay ${props.amount.toFixed(2)} CAD for your professional one-time cleaning service.
            </p>
          </div>
        )}
      </div>

      {/* Enhanced Payment Details */}
      <div className="mb-4 space-y-2">
        <p><strong>Amount:</strong> ${props.amount.toFixed(2)} CAD {isRecurringService ? `(${frequencyMapping[props.serviceDetails.frequency as keyof typeof frequencyMapping]?.label})` : '(One-time)'}</p>
        <p><strong>Customer:</strong> {props.customerDetails.name}</p>
        <p><strong>Service:</strong> {props.serviceDetails.serviceType} {props.serviceDetails.cleaningType && `- ${props.serviceDetails.cleaningType}`}</p>
        <p><strong>Location:</strong> {props.serviceDetails.location}</p>
        <p><strong>Schedule:</strong> {props.serviceDetails.frequency === 'onetime' ? 'One-time service' : `${frequencyMapping[props.serviceDetails.frequency as keyof typeof frequencyMapping]?.label} recurring service`}</p>

        {props.accountCreation?.enabled && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✅</span>
              <span className="text-sm font-medium text-green-900">Creating VIP Customer Account</span>
            </div>
            <p className="text-xs text-green-700 mt-1">
              Account email: {props.accountCreation.contactInfo.email}
            </p>
            <p className="text-xs text-green-600 mt-1">
              You'll be automatically logged in after payment completion with full dashboard access.
            </p>
          </div>
        )}
      </div>

      {/* Enhanced PayPal Payment Section */}
      <div>
        {paypalError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-800 text-sm">
              <strong>Error:</strong> {paypalError}
            </p>
            <div className="mt-2 space-x-2">
              <button
                onClick={() => loadPayPalScript()}
                className="text-blue-600 underline text-sm hover:text-blue-800"
              >
                Try Again
              </button>
              <button
                onClick={() => setShowDiagnostics(!showDiagnostics)}
                className="text-blue-600 underline text-sm hover:text-blue-800"
              >
                {showDiagnostics ? 'Hide' : 'Show'} Details
              </button>
            </div>

            {showDiagnostics && (
              <div className="mt-3 bg-gray-100 border rounded p-2 text-xs font-mono max-h-40 overflow-y-auto">
                <p className="font-bold mb-2">Enhanced Diagnostic Log:</p>
                {diagnostics.map((log, index) => (
                  <p key={`diagnostic-${index}-${log.substring(0, 20)}`} className="mb-1">{log}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {!isPayPalLoaded && !paypalError && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3" />
            <p className="text-gray-600">Loading Enhanced PayPal System...</p>
            <p className="text-xs text-gray-500 mt-1">
              {isRecurringService ? 'Preparing subscription billing...' : 'Preparing secure payment...'}
            </p>
          </div>
        )}

        {/* Enhanced PayPal Buttons */}
        {isPayPalLoaded && !paypalError && (
          <div>
            <div ref={paypalRef} className="paypal-buttons-container min-h-[50px]" />
            {isProcessing && (
              <div className="text-center mt-3 p-3 bg-blue-50 rounded">
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                <span className="text-sm text-blue-700">
                  {isRecurringService
                    ? 'Setting up your professional subscription service...'
                    : props.accountCreation?.enabled
                      ? 'Processing payment and creating your VIP account...'
                      : 'Processing your secure payment...'
                  }
                </span>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Security Notice */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>🔒 Secure payment powered by PayPal • Your financial information is never stored</p>
          {isRecurringService && (
            <p className="mt-1">📋 Subscription managed through PayPal • Cancel anytime in your dashboard</p>
          )}
        </div>
      </div>
    </div>
  );
}

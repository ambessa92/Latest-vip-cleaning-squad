import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Performance monitoring
const startTime = performance.now();

// SEO: Update viewport meta tag for better mobile experience
const viewport = document.querySelector('meta[name="viewport"]');
if (viewport) {
  viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover');
}

// Performance: Register service worker for caching
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Performance: Add critical resource hints
const addResourceHint = (href: string, rel: string, as?: string) => {
  const link = document.createElement('link');
  link.rel = rel;
  link.href = href;
  if (as) link.as = as;
  document.head.appendChild(link);
};

// Preload critical resources
addResourceHint('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap', 'preload', 'style');
addResourceHint('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap', 'preload', 'style');

// SEO: Add JSON-LD structured data for website
const addStructuredData = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://same-ybnqabs99nd-latest.netlify.app/#website",
        "url": "https://same-ybnqabs99nd-latest.netlify.app/",
        "name": "VIP Cleaning Squad",
        "description": "Professional cleaning services in Niagara region",
        "potentialAction": [
          {
            "@type": "SearchAction",
            "target": "https://same-ybnqabs99nd-latest.netlify.app/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        ],
        "inLanguage": "en-CA"
      },
      {
        "@type": "Organization",
        "@id": "https://same-ybnqabs99nd-latest.netlify.app/#organization",
        "name": "VIP Cleaning Squad",
        "url": "https://same-ybnqabs99nd-latest.netlify.app/",
        "logo": {
          "@type": "ImageObject",
          "url": "https://same-ybnqabs99nd-latest.netlify.app/vip-logo.png",
          "width": 500,
          "height": 500
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+1-289-697-6559",
          "contactType": "customer service",
          "email": "info@vipcleaningsquad.ca",
          "availableLanguage": ["English", "French"]
        },
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "St. Catharines",
          "addressRegion": "Ontario",
          "addressCountry": "Canada"
        },
        "sameAs": [
          "https://www.facebook.com/vipcleaningsquad",
          "https://www.google.com/maps/place/VIP+Cleaning+Squad"
        ]
      }
    ]
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(structuredData);
  document.head.appendChild(script);
};

// Initialize structured data
addStructuredData();

// Performance: Measure and report web vitals
const reportWebVitals = () => {
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fidEntry = entry as PerformanceEventTiming;
        console.log('FID:', fidEntry.processingStart - fidEntry.startTime);
      }
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    new PerformanceObserver((list) => {
      let cumulativeScore = 0;
      for (const entry of list.getEntries()) {
        const clsEntry = entry as any;
        if (!clsEntry.hadRecentInput) {
          cumulativeScore += clsEntry.value;
        }
      }
      console.log('CLS:', cumulativeScore);
    }).observe({ entryTypes: ['layout-shift'] });
  }
};

// Initialize performance monitoring
reportWebVitals();

// Enhanced error boundary for production
const handleError = (error: Error, errorInfo?: React.ErrorInfo) => {
  console.error('Application Error:', error);
  if (errorInfo) {
    console.error('Error Info:', errorInfo);
  }

  // In production, you might want to send this to an error reporting service
  if (import.meta.env.PROD) {
    // Example: Send to error reporting service
    // errorReportingService.captureException(error);
  }
};

// React error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    handleError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Initialize React app with optimizations
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container not found');
}

const root = createRoot(container);

// Performance: Log render time
const endTime = performance.now();
console.log(`App initialization took ${endTime - startTime} milliseconds`);

// Render app with error boundary
root.render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

// SEO: Report page load to analytics (placeholder)
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    // Google Analytics page view tracking would go here
    // gtag('config', 'GA_MEASUREMENT_ID', {
    //   page_title: document.title,
    //   page_location: window.location.href
    // });

    console.log('Page fully loaded');
  });
}

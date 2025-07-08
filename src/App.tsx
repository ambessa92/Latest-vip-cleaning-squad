import type React from 'react';
import { useState, useEffect, useRef, lazy, Suspense } from 'react';

// Lazy load non-critical components for better performance
const PriceCalculator = lazy(() => import('./components/PriceCalculator'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const CustomerDashboard = lazy(() => import('./components/CustomerDashboard'));
const CustomerPortal = lazy(() => import('./components/CustomerPortal'));
const CRMDashboard = lazy(() => import('./components/CRMDashboard'));
const ServicesPage = lazy(() => import('./components/ServicesPage'));
const Blog = lazy(() => import('./components/Blog'));
const BlogPost = lazy(() => import('./components/BlogPost'));
const Partnerships = lazy(() => import('./components/Partnerships'));

// Critical components - load immediately
import ServiceAreaMap from './components/ServiceAreaMap';

// Performance Loading Component
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <div className="text-blue-600 font-medium">Loading VIP Cleaning Squad...</div>
    </div>
  </div>
);

// Performance optimization hooks
const usePreloadCriticalResources = () => {
  useEffect(() => {
    // Preload critical fonts
    const fontLink = document.createElement('link');
    fontLink.rel = 'preconnect';
    fontLink.href = 'https://fonts.googleapis.com';
    document.head.appendChild(fontLink);

    // Preload critical images
    const heroImage = new Image();
    heroImage.src = '/api/placeholder/1200/600';

    // DNS prefetch for external services
    const dnsPrefetch = document.createElement('link');
    dnsPrefetch.rel = 'dns-prefetch';
    dnsPrefetch.href = 'https://www.google.com';
    document.head.appendChild(dnsPrefetch);

    return () => {
      document.head.removeChild(fontLink);
      document.head.removeChild(dnsPrefetch);
    };
  }, []);
};

// Performance monitoring
const usePerformanceMetrics = () => {
  useEffect(() => {
    if ('performance' in window) {
      // Monitor page load performance
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;

        // Log performance metrics (in production, send to analytics)
        console.log('Page Load Time:', `${loadTime}ms`);

        // Optimize images after load
        const images = document.querySelectorAll('img');
        for (const img of images) {
          if (!img.loading) {
            img.loading = 'lazy';
          }
        }
      });
    }
  }, []);
};

// SEO Breadcrumb Component with Links
const Breadcrumbs: React.FC<{ items: Array<{ name: string; href?: string }> }> = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb" className="py-2 text-sm">
      <ol className="flex space-x-2 text-gray-600">
        {items.map((item, index) => (
          <li key={`breadcrumb-${item.name}-${index}`} className="flex items-center">
            {index > 0 && <span className="mx-2">/</span>}
            {item.href ? (
              <button className="hover:text-blue-600 transition-colors" onClick={() => { window.location.hash = item.href || ''; }}>
                {item.name}
              </button>
            ) : (
              <span className="text-blue-600 font-medium">{item.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Enhanced Header Component with More Links
const Header: React.FC<{ currentPage: string; onNavigate: (page: string) => void }> = ({ currentPage, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-lg' : 'bg-white shadow-lg'
    }`} role="banner">
      <div className="container mx-auto px-4">
        {/* Top Banner with External Links */}
        <div className="bg-blue-600 text-white text-center py-2 text-sm">
          <span>⭐ 5.0 Rating | </span>
          <a href="https://www.google.com/maps/place/VIP+Cleaning+Squad" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300 underline">
            View Reviews
          </a>
          <span> | Call: </span>
          <a href="tel:(289) 697-6559" className="hover:text-yellow-300 font-semibold">
            (289) 697-6559
          </a>
        </div>

        <div className="flex justify-between items-center py-3">
          {/* Enhanced Logo with Internal Link */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-3 cursor-pointer group bg-transparent border-none"
            aria-label="VIP Cleaning Squad Home"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-bold text-lg">VIP</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">VIP Cleaning Squad</h1>
              <p className="text-xs text-gray-500">
                <button onClick={() => onNavigate('services')} className="hover:text-blue-600 transition-colors">
                  Professional Cleaning Services
                </button>
              </p>
            </div>
          </button>

          {/* Enhanced Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6" aria-label="Main navigation">
            {[
              { id: 'home', label: 'Home', title: 'VIP Cleaning Squad Home' },
              { id: 'services', label: 'Services', title: 'Our Cleaning Services' },
              { id: 'partnerships', label: 'Partners', title: 'Business Partnerships' },
              { id: 'blog', label: 'Blog', title: 'Cleaning Tips & Guides' },
              { id: 'about', label: 'About', title: 'About VIP Cleaning Squad' },
              { id: 'contact', label: 'Contact', title: 'Contact Us' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-3 py-2 rounded-md font-medium transition-all duration-300 ${
                  currentPage === item.id || currentPage.startsWith('blog')
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
                title={item.title}
                aria-current={currentPage === item.id ? 'page' : undefined}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Enhanced Right Side Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            <button
              onClick={() => onNavigate('quote')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
              title="Get Free Cleaning Quote"
            >
              Get Quote
            </button>
            <a
              href="tel:(289) 697-6559"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium"
              title="Call VIP Cleaning Squad"
            >
              Call Now
            </a>

            {/* Account Menu with More Links */}
            <div className="relative group">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <button onClick={() => onNavigate('customer-portal')} className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-t-lg transition-colors">
                  Customer Portal
                </button>
                <button onClick={() => onNavigate('dashboard')} className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                  Customer Dashboard
                </button>
                <button onClick={() => onNavigate('crm')} className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                  CRM Dashboard
                </button>
                <button onClick={() => onNavigate('admin')} className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-b-lg transition-colors">
                  Admin Portal
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Enhanced Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-3 border-t border-gray-200 animate-fade-in">
            <nav className="flex flex-col space-y-1" aria-label="Mobile navigation">
              {[
                { id: 'home', label: 'Home' },
                { id: 'services', label: 'Services' },
                { id: 'partnerships', label: 'Partners' },
                { id: 'blog', label: 'Blog' },
                { id: 'about', label: 'About' },
                { id: 'contact', label: 'Contact' },
                { id: 'quote', label: 'Get Quote' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`px-3 py-2 rounded-md font-medium text-left transition-all duration-300 ${
                    currentPage === item.id
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

// Enhanced Home Page Component with Performance Optimization
const HomePage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {

  // Performance hooks
  usePreloadCriticalResources();
  usePerformanceMetrics();

  // Add structured data for homepage with performance optimization
  useEffect(() => {
    // Defer non-critical script injection
    const timeoutId = setTimeout(() => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "VIP Cleaning Squad - #1 Professional Cleaning Services in Niagara",
        "description": "Premium residential & commercial cleaning services in Niagara region. Same-day service, 100% satisfaction guarantee, eco-friendly.",
        "url": window.location.href,
        "mainEntity": {
          "@type": "LocalBusiness",
          "name": "VIP Cleaning Squad",
          "telephone": "(289) 697-6559",
          "address": {
            "@type": "PostalAddress",
            "addressRegion": "Ontario",
            "addressCountry": "CA"
          }
        }
      });
      document.head.appendChild(script);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  // Optimize images with intersection observer
  useEffect(() => {
    const imageObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      }
    });

    // Observe all images with data-src
    const lazyImages = document.querySelectorAll('img[data-src]');
    for (const img of lazyImages) {
      imageObserver.observe(img);
    }

    return () => imageObserver.disconnect();
  }, []);

  return (
    <main>
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4">
        <Breadcrumbs items={[{ name: 'Home' }]} />
      </div>

      {/* Enhanced VIP Hero Section with More Links */}
      <section className="bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse mr-3" />
              <span className="text-white font-medium">
                🏆 #1 Rated{' '}
                <button onClick={() => onNavigate('services')} className="underline hover:text-yellow-300 transition-colors">
                  Cleaning Service
                </button>
                {' '}in{' '}
                <button onClick={() => onNavigate('about')} className="underline hover:text-yellow-300 transition-colors">
                  Niagara
                </button>
              </span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold mb-8 leading-tight">
              <span className="text-white">Transform Your Space</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-green-300 to-blue-300">
                Experience The VIP Difference
              </span>
            </h1>

            <p className="text-xl lg:text-2xl mb-12 text-blue-100 max-w-4xl mx-auto font-light">
              Premium{' '}
              <button onClick={() => onNavigate('services')} className="underline hover:text-yellow-300 transition-colors">
                cleaning services
              </button>
              {' '}that exceed expectations. Serving homes and businesses across{' '}
              <button onClick={() => onNavigate('contact')} className="font-semibold text-yellow-300 hover:text-yellow-200 underline transition-colors">
                St. Catharines, Niagara Falls, Welland & Beyond
              </button>
            </p>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <button
                onClick={() => onNavigate('quote')}
                className="group relative px-10 py-5 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white rounded-2xl font-bold text-xl shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105"
              >
                Get Instant Quote →
              </button>
              <a
                href="tel:(289) 697-6559"
                className="flex items-center space-x-3 text-white hover:text-yellow-300 transition-colors group"
              >
                <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-sm text-blue-200">Call Now</div>
                  <div className="text-xl font-bold">(289) 697-6559</div>
                </div>
              </a>
            </div>
          </div>

          {/* Enhanced Feature Cards with Internal Links */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <button
              onClick={() => onNavigate('services')}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/15 transition-all duration-300 transform hover:scale-105 group cursor-pointer"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Same Day Service</h3>
              <p className="text-blue-200">Book today, cleaned today. Emergency cleaning available.</p>
              <div className="text-sm text-yellow-300 mt-2 group-hover:text-yellow-200">Learn More →</div>
            </button>

            <button
              onClick={() => onNavigate('about')}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/15 transition-all duration-300 transform hover:scale-105 group cursor-pointer"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">100% Guarantee</h3>
              <p className="text-blue-200">Not satisfied? We'll return and make it right, free of charge.</p>
              <div className="text-sm text-yellow-300 mt-2 group-hover:text-yellow-200">Our Promise →</div>
            </button>

            <button
              onClick={() => onNavigate('services')}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/15 transition-all duration-300 transform hover:scale-105 group cursor-pointer"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Eco-Friendly</h3>
              <p className="text-blue-200">Safe, non-toxic products that protect your family and pets.</p>
              <div className="text-sm text-yellow-300 mt-2 group-hover:text-yellow-200">Green Cleaning →</div>
            </button>
          </div>

          {/* Enhanced Social Proof with External & Internal Links */}
          <div className="text-center">
            <div className="inline-flex items-center space-x-8 bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-6">
              <a
                href="https://www.google.com/maps/place/VIP+Cleaning+Squad"
                target="_blank"
                rel="noopener noreferrer"
                className="text-center hover:scale-105 transition-transform group"
              >
                <div className="text-3xl font-bold text-yellow-300 group-hover:text-yellow-200">5.0 ⭐</div>
                <div className="text-sm text-blue-200 group-hover:text-blue-100">Google Rating</div>
              </a>
              <div className="w-px h-12 bg-white/30" />
              <button
                onClick={() => onNavigate('about')}
                className="text-center hover:scale-105 transition-transform group"
              >
                <div className="text-3xl font-bold text-green-300 group-hover:text-green-200">100+</div>
                <div className="text-sm text-blue-200 group-hover:text-blue-100">Happy Clients</div>
              </button>
              <div className="w-px h-12 bg-white/30" />
              <button
                onClick={() => onNavigate('contact')}
                className="text-center hover:scale-105 transition-transform group"
              >
                <div className="text-3xl font-bold text-blue-300 group-hover:text-blue-200">24/7</div>
                <div className="text-sm text-blue-200 group-hover:text-blue-100">Support</div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Services Section with Internal Links */}
      <section className="py-16 bg-gray-900 text-white relative">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6 uppercase tracking-wider">
            Professional{' '}
            <button onClick={() => onNavigate('services')} className="underline hover:text-blue-400 transition-colors">
              Commercial & Residential
            </button>
            {' '}Cleaning Services
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-gray-300 mb-8">
              Welcome to{' '}
              <button onClick={() => onNavigate('about')} className="text-blue-400 font-semibold hover:text-blue-300 underline transition-colors">
                VIP Cleaning Squad
              </button>
              {' '}– the trusted{' '}
              <button onClick={() => onNavigate('contact')} className="text-blue-400 font-semibold hover:text-blue-300 underline transition-colors">
                Niagara cleaning company
              </button>
              , dedicated to providing spotless spaces for Landlords, Businesses & Homeowners across{' '}
              <span className="text-blue-400 font-semibold">
                St. Catharines, Niagara-on-the-Lake, Niagara Falls, Grimsby, Lincoln, West Lincoln, Pelham, Thorold, Welland
              </span>, and beyond.
            </p>
          </div>
        </div>
      </section>

      {/* Industry Certifications & Associations Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-blue-600 mb-8">Industry Certified & Recognized</h2>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
            {/* Industry Association Links */}
            <a
              href="https://www.issa.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-100 transition-opacity"
              title="International Sanitary Supply Association"
            >
              <div className="bg-blue-50 px-6 py-3 rounded-lg border">
                <span className="text-blue-600 font-semibold text-sm">ISSA Certified</span>
              </div>
            </a>

            <a
              href="https://www.bscai.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-100 transition-opacity"
              title="Building Service Contractors Association International"
            >
              <div className="bg-green-50 px-6 py-3 rounded-lg border">
                <span className="text-green-600 font-semibold text-sm">BSCAI Member</span>
              </div>
            </a>

            <a
              href="https://www.bbb.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-100 transition-opacity"
              title="Better Business Bureau"
            >
              <div className="bg-orange-50 px-6 py-3 rounded-lg border">
                <span className="text-orange-600 font-semibold text-sm">BBB Accredited</span>
              </div>
            </a>

            <a
              href="https://www.epa.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-100 transition-opacity"
              title="Environmental Protection Agency"
            >
              <div className="bg-green-50 px-6 py-3 rounded-lg border">
                <span className="text-green-600 font-semibold text-sm">EPA Compliant</span>
              </div>
            </a>

            <a
              href="https://www.osha.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-100 transition-opacity"
              title="Occupational Safety and Health Administration"
            >
              <div className="bg-red-50 px-6 py-3 rounded-lg border">
                <span className="text-red-600 font-semibold text-sm">OSHA Trained</span>
              </div>
            </a>

            <a
              href="https://greenbusinessbureau.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-100 transition-opacity"
              title="Green Business Bureau"
            >
              <div className="bg-emerald-50 px-6 py-3 rounded-lg border">
                <span className="text-emerald-600 font-semibold text-sm">Green Certified</span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Enhanced Why Choose Us Section with Service Links */}
      <section className="py-16 bg-gradient-to-r from-yellow-300 to-green-300 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-blue-600 mb-12 uppercase tracking-wider">
            Why Choose{' '}
            <button onClick={() => onNavigate('about')} className="underline hover:text-blue-800 transition-colors">
              VIP Cleaning Squad
            </button>
            ?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Certified Professional Cleaners",
                description: "Our team is fully trained and certified to deliver exceptional cleaning services with professional expertise.",
                icon: "🏆",
                link: 'about'
              },
              {
                title: "Environmentally Friendly Cleaning",
                description: "We use eco-friendly products and sustainable practices to protect your health and the environment.",
                icon: "🌿",
                link: 'services'
              },
              {
                title: "100% Satisfaction Guaranteed",
                description: "We stand behind our work with a complete satisfaction guarantee - we'll make it right if you're not happy.",
                icon: "✅",
                link: 'about'
              },
              {
                title: "Available Evenings & Weekends",
                description: "Flexible scheduling including evenings and weekends to accommodate your busy lifestyle.",
                icon: "🕐",
                link: 'contact'
              }
            ].map((feature, index) => (
              <button
                key={`why-choose-${feature.title.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => onNavigate(feature.link)}
                className="text-center group hover:bg-white/20 rounded-lg p-4 transition-all duration-300 transform hover:scale-105 cursor-pointer"
              >
                <div className="text-4xl mb-4 transform group-hover:scale-125 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-blue-600 mb-4 group-hover:text-blue-800 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-700 group-hover:text-gray-900 transition-colors">
                  {feature.description}
                </p>
                <div className="text-sm text-blue-600 mt-2 group-hover:text-blue-800">Learn More →</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Blog Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-blue-600 mb-6">
              💡 Expert Cleaning Tips & Guides
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Learn from Niagara's cleaning professionals. Get insider tips for maintaining a spotless{' '}
              <button onClick={() => onNavigate('services')} className="text-blue-600 hover:text-blue-800 underline transition-colors">
                home or business
              </button>
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            <button
              onClick={() => onNavigate('blog')}
              className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105 group cursor-pointer"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🏠</div>
              <h3 className="text-xl font-bold text-blue-600 mb-3 group-hover:text-blue-800 transition-colors">
                Home Cleaning Tips
              </h3>
              <p className="text-gray-600 group-hover:text-gray-800 transition-colors">
                Professional secrets for maintaining a spotless home year-round
              </p>
              <div className="text-sm text-blue-600 mt-3 group-hover:text-blue-800">Read Articles →</div>
            </button>

            <button
              onClick={() => onNavigate('blog')}
              className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105 group cursor-pointer"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🌿</div>
              <h3 className="text-xl font-bold text-green-600 mb-3 group-hover:text-green-800 transition-colors">
                Eco-Friendly Solutions
              </h3>
              <p className="text-gray-600 group-hover:text-gray-800 transition-colors">
                Safe, natural cleaning products and methods for your family
              </p>
              <div className="text-sm text-green-600 mt-3 group-hover:text-green-800">Learn More →</div>
            </button>

            <button
              onClick={() => onNavigate('blog')}
              className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105 group cursor-pointer"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🏢</div>
              <h3 className="text-xl font-bold text-purple-600 mb-3 group-hover:text-purple-800 transition-colors">
                Commercial Cleaning
              </h3>
              <p className="text-gray-600 group-hover:text-gray-800 transition-colors">
                Maintain a professional workspace that impresses clients
              </p>
              <div className="text-sm text-purple-600 mt-3 group-hover:text-purple-800">Discover Tips →</div>
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={() => onNavigate('blog')}
              className="inline-flex items-center space-x-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span>📚 View All Cleaning Tips</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Service Area Map */}
      <ServiceAreaMap onLocationSelect={(location, pricing) => {
        window.dispatchEvent(new CustomEvent('locationSelected', {
          detail: { location, pricing }
        }));
      }} />

      {/* Enhanced CTA Section with Multiple Links */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-green-600 text-white relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">Ready for a Spotless Space?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Get your{' '}
            <button onClick={() => onNavigate('quote')} className="underline hover:text-yellow-300 transition-colors font-semibold">
              free quote
            </button>
            {' '}today and experience the{' '}
            <button onClick={() => onNavigate('about')} className="underline hover:text-yellow-300 transition-colors font-semibold">
              VIP difference
            </button>
            !
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('quote')}
              className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-all font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              Get Free Quote ✨
            </button>
            <a
              href="tel:(289) 697-6559"
              className="px-8 py-4 border-2 border-white text-white rounded-xl hover:bg-white hover:text-blue-600 transition-all font-semibold text-lg transform hover:scale-105"
            >
              Call Now 📞
            </a>
          </div>

          {/* Additional Service Links */}
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
            <button onClick={() => onNavigate('services')} className="text-blue-200 hover:text-white underline transition-colors">
              Commercial Cleaning
            </button>
            <span className="text-blue-300">•</span>
            <button onClick={() => onNavigate('services')} className="text-blue-200 hover:text-white underline transition-colors">
              Residential Cleaning
            </button>
            <span className="text-blue-300">•</span>
            <button onClick={() => onNavigate('blog')} className="text-blue-200 hover:text-white underline transition-colors">
              Cleaning Tips & Guides
            </button>
            <span className="text-blue-300">•</span>
            <button onClick={() => onNavigate('services')} className="text-blue-200 hover:text-white underline transition-colors">
              Airbnb Cleaning
            </button>
            <span className="text-blue-300">•</span>
            <button onClick={() => onNavigate('partnerships')} className="text-blue-200 hover:text-white underline transition-colors">
              Business Partnerships
            </button>
            <span className="text-blue-300">•</span>
            <button onClick={() => onNavigate('services')} className="text-blue-200 hover:text-white underline transition-colors">
              Move-In/Out Cleaning
            </button>
          </div>
        </div>
      </section>


    </main>
  );
};

// Enhanced Footer Component with More Links
const Footer: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  return (
    <footer className="bg-blue-600 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info with Links */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xl">VIP</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">VIP Cleaning Squad</h3>
                <p className="text-blue-200 text-sm">Professional Cleaning Services</p>
              </div>
            </div>
            <p className="text-blue-100 mb-4">
              The trusted{' '}
              <button onClick={() => onNavigate('about')} className="underline hover:text-white transition-colors">
                Niagara cleaning company
              </button>
              , dedicated to providing spotless spaces for landlords, businesses & homeowners.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/vipcleaningsquad" className="text-blue-200 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer" title="Follow us on Facebook">
                <span className="text-2xl">📘</span>
              </a>
              <a href="https://www.google.com/maps/place/VIP+Cleaning+Squad" className="text-blue-200 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer" title="View us on Google Maps">
                <span className="text-2xl">🔍</span>
              </a>
              <a href="https://www.bbb.org" className="text-blue-200 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer" title="Better Business Bureau Accredited">
                <span className="text-2xl">🅱️</span>
              </a>
              <a href="https://www.issa.com" className="text-blue-200 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer" title="ISSA Industry Member">
                <span className="text-2xl">🏆</span>
              </a>
            </div>
          </div>

          {/* Service Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Our Services</h4>
            <nav className="space-y-2">
              <button onClick={() => onNavigate('services')} className="block text-blue-200 hover:text-white transition-colors text-left text-sm">
                Commercial Cleaning
              </button>
              <button onClick={() => onNavigate('services')} className="block text-blue-200 hover:text-white transition-colors text-left text-sm">
                Residential Cleaning
              </button>
              <button onClick={() => onNavigate('services')} className="block text-blue-200 hover:text-white transition-colors text-left text-sm">
                Airbnb Cleaning
              </button>
              <button onClick={() => onNavigate('services')} className="block text-blue-200 hover:text-white transition-colors text-left text-sm">
                Move-In/Move-Out
              </button>
              <button onClick={() => onNavigate('partnerships')} className="block text-blue-200 hover:text-white transition-colors text-left text-sm">
                Business Partnerships
              </button>
            </nav>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <nav className="space-y-2">
              <button onClick={() => onNavigate('home')} className="block text-blue-200 hover:text-white transition-colors text-left text-sm">
                Home
              </button>
              <button onClick={() => onNavigate('partnerships')} className="block text-blue-200 hover:text-white transition-colors text-left text-sm">
                Business Partners
              </button>
              <button onClick={() => onNavigate('blog')} className="block text-blue-200 hover:text-white transition-colors text-left text-sm">
                Cleaning Tips Blog
              </button>
              <button onClick={() => onNavigate('about')} className="block text-blue-200 hover:text-white transition-colors text-left text-sm">
                About Us
              </button>
              <button onClick={() => onNavigate('contact')} className="block text-blue-200 hover:text-white transition-colors text-left text-sm">
                Contact
              </button>
              <button onClick={() => onNavigate('quote')} className="block text-blue-200 hover:text-white transition-colors text-left text-sm">
                Get Quote
              </button>
              <a href="https://www.google.com/maps/place/VIP+Cleaning+Squad" target="_blank" rel="noopener noreferrer" className="block text-blue-200 hover:text-white transition-colors text-sm">
                Reviews
              </a>
            </nav>
          </div>

          {/* Contact Info with Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div>
                <p className="text-blue-200 text-sm">Phone:</p>
                <a href="tel:(289) 697-6559" className="text-white font-semibold hover:text-blue-200 transition-colors">
                  (289) 697-6559
                </a>
              </div>
              <div>
                <p className="text-blue-200 text-sm">Email:</p>
                <a href="mailto:info@vipcleaningsquad.ca" className="text-white hover:text-blue-200 transition-colors">
                  info@vipcleaningsquad.ca
                </a>
              </div>
              <div>
                <p className="text-blue-200 text-sm">Service Areas:</p>
                <button onClick={() => onNavigate('contact')} className="text-white text-sm hover:text-blue-200 transition-colors underline">
                  St. Catharines, Niagara Falls, Welland, Grimsby, and beyond
                </button>
              </div>
              <div className="pt-4 border-t border-blue-500 mt-4">
                <p className="text-blue-200 text-sm mb-2">Industry Certifications:</p>
                <div className="space-y-1">
                  <a href="https://www.issa.com" target="_blank" rel="noopener noreferrer" className="block text-blue-200 hover:text-white transition-colors text-xs">
                    ISSA Certified Professional
                  </a>
                  <a href="https://www.bscai.org" target="_blank" rel="noopener noreferrer" className="block text-blue-200 hover:text-white transition-colors text-xs">
                    BSCAI Association Member
                  </a>
                  <a href="https://www.epa.gov" target="_blank" rel="noopener noreferrer" className="block text-blue-200 hover:text-white transition-colors text-xs">
                    EPA Compliant Practices
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer with External Links */}
        <div className="border-t border-blue-500 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-blue-200 text-sm mb-4 md:mb-0">
              © 2035 by VIP Cleaning Squad. Powered and secured by Same Technology
            </p>
            <div className="flex space-x-4 text-sm">
              <a href="https://www.google.com/maps/place/VIP+Cleaning+Squad" target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:text-white transition-colors">
                Google Business
              </a>
              <span className="text-blue-300">•</span>
              <a href="https://www.facebook.com/vipcleaningsquad" target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:text-white transition-colors">
                Facebook
              </a>
              <span className="text-blue-300">•</span>
              <button onClick={() => onNavigate('contact')} className="text-blue-200 hover:text-white transition-colors">
                Sitemap
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Main App Component with Enhanced Navigation
function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentBlogPost, setCurrentBlogPost] = useState<string | null>(null);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setCurrentBlogPost(null); // Clear blog post when navigating away
    // Scroll to top when navigating
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBlogPostSelect = (postId: string) => {
    setCurrentBlogPost(postId);
    setCurrentPage('blog-post');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToBlog = () => {
    setCurrentBlogPost(null);
    setCurrentPage('blog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'services':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ServicesPage onNavigate={handleNavigate} />
          </Suspense>
        );
      case 'partnerships':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <Partnerships onNavigate={handleNavigate} />
          </Suspense>
        );
      case 'blog':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <Blog onNavigate={handleNavigate} onPostSelect={handleBlogPostSelect} />
          </Suspense>
        );
      case 'blog-post':
        return currentBlogPost ? (
          <Suspense fallback={<LoadingSpinner />}>
            <BlogPost
              postId={currentBlogPost}
              onNavigate={handleNavigate}
              onBackToBlog={handleBackToBlog}
            />
          </Suspense>
        ) : (
          <Suspense fallback={<LoadingSpinner />}>
            <Blog onNavigate={handleNavigate} onPostSelect={handleBlogPostSelect} />
          </Suspense>
        );
      case 'quote':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <PriceCalculator />
          </Suspense>
        );
      case 'customer-portal':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <CustomerPortal onNavigate={handleNavigate} />
          </Suspense>
        );
      case 'dashboard':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <CustomerDashboard />
          </Suspense>
        );
      case 'crm':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <CRMDashboard />
          </Suspense>
        );
      case 'admin':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <AdminDashboard />
          </Suspense>
        );
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="App">
      <Header currentPage={currentPage} onNavigate={handleNavigate} />
      <main>
        {renderPage()}
      </main>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default App;

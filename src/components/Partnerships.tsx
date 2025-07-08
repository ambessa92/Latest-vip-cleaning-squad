import type React from 'react';
import { useState } from 'react';

interface PartnershipProps {
  onNavigate: (page: string) => void;
}

interface Partner {
  id: string;
  name: string;
  category: string;
  location: string;
  website: string;
  description: string;
  partnershipType: 'Referral' | 'Cross-Promotion' | 'Preferred' | 'Strategic';
  logo?: string;
  benefits: string[];
}

interface PartnershipOpportunity {
  category: string;
  title: string;
  description: string;
  benefits: string[];
  icon: string;
  color: string;
  examples: string[];
}

const currentPartners: Partner[] = [
  {
    id: 'niagara-real-estate',
    name: 'Niagara Real Estate Board',
    category: 'Real Estate',
    location: 'St. Catharines',
    website: 'https://niagararealtors.ca',
    description: 'Professional real estate agents throughout Niagara region',
    partnershipType: 'Referral',
    benefits: ['Move-in/out cleaning referrals', 'Property staging cleanup', 'Home showing preparation']
  },
  {
    id: 'royal-lepage-niagara',
    name: 'Royal LePage Niagara',
    category: 'Real Estate',
    location: 'Multiple Locations',
    website: 'https://royallepage.ca',
    description: 'Leading real estate brokerage in Niagara',
    partnershipType: 'Preferred',
    benefits: ['Exclusive cleaning discounts for clients', 'Priority scheduling', 'Co-marketing opportunities']
  },
  {
    id: 'brock-university',
    name: 'Brock University',
    category: 'Education',
    location: 'St. Catharines',
    website: 'https://brocku.ca',
    description: 'Major university campus and student housing',
    partnershipType: 'Strategic',
    benefits: ['Student housing cleaning contracts', 'Faculty office cleaning', 'Event cleanup services']
  },
  {
    id: 'niagara-region-tourism',
    name: 'Niagara Region Tourism',
    category: 'Tourism & Hospitality',
    location: 'Niagara Falls',
    website: 'https://niagaracanada.com',
    description: 'Tourism board promoting Niagara region',
    partnershipType: 'Cross-Promotion',
    benefits: ['Airbnb cleaning referrals', 'Hotel partnership opportunities', 'Tourist accommodation cleaning']
  },
  {
    id: 'home-depot-niagara',
    name: 'Home Depot Niagara',
    category: 'Home Improvement',
    location: 'Multiple Locations',
    website: 'https://homedepot.ca',
    description: 'Home improvement retail chain',
    partnershipType: 'Referral',
    benefits: ['Post-renovation cleaning referrals', 'Customer referral program', 'Joint marketing initiatives']
  },
  {
    id: 'niagara-chamber',
    name: 'Greater Niagara Chamber of Commerce',
    category: 'Business Association',
    location: 'Niagara Falls',
    website: 'https://niagarachamber.com',
    description: 'Leading business organization in Niagara',
    partnershipType: 'Strategic',
    benefits: ['Business networking', 'Member referrals', 'Industry credibility']
  }
];

const partnershipOpportunities: PartnershipOpportunity[] = [
  {
    category: 'Real Estate',
    title: 'Real Estate Agent Partnerships',
    description: 'Partner with local real estate agents for move-in/out cleaning referrals',
    benefits: [
      'Steady stream of move-in/out cleaning jobs',
      'Premium pricing for urgent cleanings',
      'Long-term business relationships',
      'Mutual referral opportunities'
    ],
    icon: '🏠',
    color: 'from-blue-500 to-indigo-500',
    examples: ['Royal LePage', 'RE/MAX', 'Century 21', 'Independent agents']
  },
  {
    category: 'Property Management',
    title: 'Property Management Companies',
    description: 'Establish contracts with property management firms for regular cleaning services',
    benefits: [
      'Recurring commercial contracts',
      'Bulk service pricing opportunities',
      'Tenant turnover cleaning guaranteed',
      'Long-term partnership agreements'
    ],
    icon: '🏢',
    color: 'from-green-500 to-emerald-500',
    examples: ['Skyline Living', 'CLV Group', 'Local property managers', 'Condo boards']
  },
  {
    category: 'Home Services',
    title: 'Home Improvement Partners',
    description: 'Cross-referral partnerships with contractors and home service providers',
    benefits: [
      'Post-construction cleanup referrals',
      'Customer base expansion',
      'Complementary service offerings',
      'Increased customer lifetime value'
    ],
    icon: '🔨',
    color: 'from-orange-500 to-red-500',
    examples: ['Contractors', 'Painters', 'Flooring companies', 'Renovation specialists']
  },
  {
    category: 'Healthcare',
    title: 'Medical Office Partnerships',
    description: 'Specialized cleaning contracts for medical and dental facilities',
    benefits: [
      'Higher-value commercial contracts',
      'Specialized service premium pricing',
      'Reliable recurring revenue',
      'Industry expertise development'
    ],
    icon: '🏥',
    color: 'from-purple-500 to-pink-500',
    examples: ['Medical clinics', 'Dental offices', 'Physiotherapy centers', 'Veterinary clinics']
  },
  {
    category: 'Hospitality',
    title: 'Tourism & Accommodation',
    description: 'Partner with hotels, B&Bs, and Airbnb hosts for cleaning services',
    benefits: [
      'High-frequency cleaning contracts',
      'Premium hospitality rates',
      'Seasonal business opportunities',
      'Tourist area market dominance'
    ],
    icon: '🏨',
    color: 'from-teal-500 to-cyan-500',
    examples: ['Hotels', 'Bed & Breakfasts', 'Airbnb hosts', 'Vacation rentals']
  },
  {
    category: 'Business Networks',
    title: 'Chamber of Commerce & BNI',
    description: 'Join business networking groups for referrals and credibility',
    benefits: [
      'Weekly referral opportunities',
      'Business credibility boost',
      'Networking with potential partners',
      'Community business relationships'
    ],
    icon: '🤝',
    color: 'from-indigo-500 to-purple-500',
    examples: ['Chamber of Commerce', 'BNI groups', 'Rotary Club', 'Business associations']
  }
];

const Partnerships: React.FC<PartnershipProps> = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [partnershipForm, setPartnershipForm] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    category: '',
    partnershipType: '',
    description: '',
    location: ''
  });

  const categories = ['all', ...Array.from(new Set(partnershipOpportunities.map(p => p.category)))];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send to your CRM or email system
    alert('Partnership inquiry submitted! We\'ll contact you within 24 hours.');
    setPartnershipForm({
      businessName: '',
      contactName: '',
      email: '',
      phone: '',
      website: '',
      category: '',
      partnershipType: '',
      description: '',
      location: ''
    });
  };

  const filteredOpportunities = selectedCategory === 'all'
    ? partnershipOpportunities
    : partnershipOpportunities.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Meta Tags */}
      <div style={{ display: 'none' }}>
        <h1>VIP Cleaning Squad - Local Business Partnerships in Niagara</h1>
        <meta name="description" content="Partner with VIP Cleaning Squad for mutual referrals and business growth. Real estate, property management, and home service partnerships in Niagara region." />
        <meta name="keywords" content="cleaning service partnerships, business referrals Niagara, real estate cleaning partners, property management cleaning, Niagara business network" />
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-green-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Local Business{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-green-300">
                Partnerships
              </span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-blue-100">
              Join VIP Cleaning Squad's growing network of trusted Niagara business partners.
              Let's grow together through mutual referrals and strategic collaborations.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <button className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-all font-semibold text-lg shadow-xl transform hover:scale-105">
                🤝 Become a Partner
              </button>
              <a
                href="tel:(289) 697-6559"
                className="flex items-center space-x-2 text-white hover:text-yellow-300 transition-colors"
              >
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-sm text-blue-200">Discuss Partnership</div>
                  <div className="text-lg font-bold">(289) 697-6559</div>
                </div>
              </a>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-300">{currentPartners.length}+</div>
                <div className="text-blue-200 text-sm">Active Partners</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-300">50+</div>
                <div className="text-blue-200 text-sm">Monthly Referrals</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-300">8</div>
                <div className="text-blue-200 text-sm">Cities Covered</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-300">24hr</div>
                <div className="text-blue-200 text-sm">Response Time</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Current Partners Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Trusted Partners</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're proud to work with these established Niagara businesses, creating mutual value through referrals and collaboration.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentPartners.map((partner) => (
              <div key={partner.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{partner.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    partner.partnershipType === 'Strategic' ? 'bg-purple-100 text-purple-800' :
                    partner.partnershipType === 'Preferred' ? 'bg-green-100 text-green-800' :
                    partner.partnershipType === 'Cross-Promotion' ? 'bg-blue-100 text-blue-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {partner.partnershipType}
                  </span>
                </div>

                <div className="text-gray-600 text-sm mb-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium">Category:</span>
                    <span>{partner.category}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Location:</span>
                    <span>{partner.location}</span>
                  </div>
                </div>

                <p className="text-gray-700 text-sm mb-4">{partner.description}</p>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-900">Partnership Benefits:</div>
                  {partner.benefits.slice(0, 2).map((benefit) => (
                    <div key={benefit} className="flex items-start space-x-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                <a
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm font-medium mt-4 transition-colors"
                >
                  <span>Visit Website</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Opportunities */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Partnership Opportunities</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore how your business can benefit from partnering with VIP Cleaning Squad
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? 'All Categories' : category}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredOpportunities.map((opportunity) => (
              <div key={opportunity.category} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className={`w-16 h-16 bg-gradient-to-r ${opportunity.color} rounded-xl flex items-center justify-center text-white text-2xl mb-6`}>
                  {opportunity.icon}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">{opportunity.title}</h3>
                <p className="text-gray-600 mb-6">{opportunity.description}</p>

                <div className="space-y-3 mb-6">
                  <div className="text-sm font-semibold text-gray-900">Partnership Benefits:</div>
                  {opportunity.benefits.map((benefit) => (
                    <div key={benefit} className="flex items-start space-x-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 mb-6">
                  <div className="text-sm font-semibold text-gray-900">Examples:</div>
                  <div className="flex flex-wrap gap-2">
                    {opportunity.examples.map((example) => (
                      <span key={example} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                        {example}
                      </span>
                    ))}
                  </div>
                </div>

                <button className={`w-full bg-gradient-to-r ${opportunity.color} text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all transform hover:scale-105`}>
                  Explore Partnership
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Application Form */}
      <section className="py-16 bg-white" id="partnership-form">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Start a Partnership</h2>
              <p className="text-xl text-gray-600">
                Ready to grow your business with VIP Cleaning Squad? Fill out the form below and we'll contact you within 24 hours.
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="bg-gray-50 rounded-2xl p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
                  <input
                    type="text"
                    required
                    value={partnershipForm.businessName}
                    onChange={(e) => setPartnershipForm({...partnershipForm, businessName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={partnershipForm.contactName}
                    onChange={(e) => setPartnershipForm({...partnershipForm, contactName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={partnershipForm.email}
                    onChange={(e) => setPartnershipForm({...partnershipForm, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={partnershipForm.phone}
                    onChange={(e) => setPartnershipForm({...partnershipForm, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="(289) 555-0123"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <input
                    type="url"
                    value={partnershipForm.website}
                    onChange={(e) => setPartnershipForm({...partnershipForm, website: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Category *</label>
                  <select
                    required
                    value={partnershipForm.category}
                    onChange={(e) => setPartnershipForm({...partnershipForm, category: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Property Management">Property Management</option>
                    <option value="Home Services">Home Services</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Hospitality">Hospitality</option>
                    <option value="Business Networks">Business Networks</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Partnership Type *</label>
                  <select
                    required
                    value={partnershipForm.partnershipType}
                    onChange={(e) => setPartnershipForm({...partnershipForm, partnershipType: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select type</option>
                    <option value="Referral">Referral Partnership</option>
                    <option value="Cross-Promotion">Cross-Promotion</option>
                    <option value="Preferred">Preferred Partnership</option>
                    <option value="Strategic">Strategic Alliance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={partnershipForm.location}
                    onChange={(e) => setPartnershipForm({...partnershipForm, location: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="St. Catharines, ON"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Partnership Description</label>
                <textarea
                  value={partnershipForm.description}
                  onChange={(e) => setPartnershipForm({...partnershipForm, description: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us about your business and how we can work together..."
                />
              </div>

              <div className="mt-8 text-center">
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-green-700 transition-all shadow-lg transform hover:scale-105"
                >
                  Submit Partnership Application
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Benefits of Partnering */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-6">Why Partner with VIP Cleaning Squad?</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We're committed to building long-term, mutually beneficial relationships with Niagara businesses.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Revenue Share</h3>
              <p className="text-gray-300">Earn commission on every successful referral with competitive rates</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Quality Guarantee</h3>
              <p className="text-gray-300">100% satisfaction guarantee protects your reputation with clients</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Fast Response</h3>
              <p className="text-gray-300">24-hour response time ensures your clients are taken care of quickly</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Support Team</h3>
              <p className="text-gray-300">Dedicated partner support team to help you succeed</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Grow Together?</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join VIP Cleaning Squad's partner network and start benefiting from our mutual referral program today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#partnership-form"
              className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-all font-semibold text-lg shadow-xl transform hover:scale-105"
            >
              Apply for Partnership
            </a>
            <a
              href="tel:(289) 697-6559"
              className="px-8 py-4 border-2 border-white text-white rounded-xl hover:bg-white hover:text-blue-600 transition-all font-semibold text-lg transform hover:scale-105"
            >
              Call (289) 697-6559
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Partnerships;

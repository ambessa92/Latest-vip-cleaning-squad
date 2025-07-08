import type React from 'react';

interface ServicesPageProps {
  onNavigate: (page: string) => void;
}

const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">Our Professional Services</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Comprehensive cleaning solutions for residential and commercial properties across the Niagara region
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Residential Cleaning",
                description: "Complete home cleaning services for all types of residences",
                features: ["Regular maintenance cleaning", "Deep cleaning services", "Kitchen and bathroom sanitization", "Flexible scheduling"],
                price: "From $89",
                gradient: "from-blue-500 to-blue-700",
                icon: "🏠"
              },
              {
                title: "Commercial Cleaning",
                description: "Professional office and business cleaning solutions",
                features: ["Daily/weekly service", "Floor care and maintenance", "Window cleaning", "Sanitization protocols"],
                price: "From $0.08/sq ft",
                gradient: "from-green-500 to-green-700",
                icon: "🏢"
              },
              {
                title: "Airbnb Cleaning",
                description: "Specialized cleaning for short-term rental properties",
                features: ["Quick turnaround times", "Linen service available", "Deep sanitization", "Guest-ready standards"],
                price: "From $120",
                gradient: "from-purple-500 to-purple-700",
                icon: "🏘️"
              },
              {
                title: "Move-In/Move-Out",
                description: "Comprehensive cleaning for property transitions",
                features: ["Deep cleaning service", "Inside appliances", "Closet organization", "Inspection ready"],
                price: "From $199",
                gradient: "from-orange-500 to-orange-700",
                icon: "📦"
              },
              {
                title: "Eco-Friendly Cleaning",
                description: "Environmentally conscious cleaning solutions",
                features: ["Non-toxic products", "HEPA filtration", "Safe for pets and children", "Sustainable practices"],
                price: "Standard pricing",
                gradient: "from-green-400 to-emerald-600",
                icon: "🌿"
              },
              {
                title: "Office Cleaning",
                description: "Regular maintenance for professional environments",
                features: ["Workstation cleaning", "Common area maintenance", "Restroom sanitization", "Trash removal"],
                price: "From $0.08/sq ft",
                gradient: "from-red-500 to-red-700",
                icon: "💼"
              }
            ].map((service) => (
              <div key={`service-${service.title.replace(/\s+/g, '-').toLowerCase()}`} className={`bg-gradient-to-br ${service.gradient} text-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
                <div className="text-5xl mb-4">{service.icon}</div>
                <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                <p className="text-white/90 mb-6">{service.description}</p>

                <div className="mb-6">
                  <h4 className="font-semibold mb-3">What's Included:</h4>
                  <ul className="space-y-2">
                    {service.features.map((feature) => (
                      <li key={`feature-${feature.replace(/\s+/g, '-').toLowerCase()}`} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-white rounded-full" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm opacity-80">Starting at</div>
                    <div className="text-xl font-bold">{service.price}</div>
                  </div>
                  <button
                    onClick={() => onNavigate('quote')}
                    className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg backdrop-blur-sm transition-all font-medium"
                  >
                    Get Quote
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-blue-600 mb-8">Service Areas</h2>
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg text-gray-700 mb-8">
              We proudly serve clients throughout the Niagara region:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                'St. Catharines', 'Niagara Falls', 'Welland',
                'Grimsby', 'Lincoln', 'Thorold',
                'Pelham', 'Niagara-on-the-Lake', 'West Lincoln',
                'Port Colborne', 'Fort Erie', 'Beamsville'
              ].map((location) => (
                <div key={`location-${location.replace(/\s+/g, '-').toLowerCase()}`} className="bg-white rounded-lg p-4 shadow-sm">
                  <span className="font-medium text-gray-900">{location}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-blue-100">Contact us today for a free, no-obligation quote</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('quote')}
              className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-all font-semibold text-lg"
            >
              Get Free Quote
            </button>
            <a
              href="tel:(289) 697-6559"
              className="px-8 py-4 border-2 border-white text-white rounded-xl hover:bg-white hover:text-blue-600 transition-all font-semibold text-lg"
            >
              Call (289) 697-6559
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;

import { useState } from 'react';

interface ServiceArea {
  name: string;
  description: string;
  icon: string;
  highlights: string[];
  image: string;
}

export default function LocationsPage() {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  const serviceAreas: ServiceArea[] = [
    {
      name: "St. Catharines",
      description: "Our home base! We provide comprehensive cleaning services throughout St. Catharines, from downtown condos to suburban family homes.",
      icon: "🏛️",
      highlights: [
        "Downtown high-rise apartments",
        "Suburban family homes",
        "Heritage district properties",
        "Brock University area",
        "Port Dalhousie waterfront homes"
      ],
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
      name: "Niagara-on-the-Lake",
      description: "Serving the historic charm of NOTL with specialized care for heritage homes, wineries, and luxury properties.",
      icon: "🍇",
      highlights: [
        "Historic heritage homes",
        "Luxury vineyard properties",
        "Wine country estates",
        "Shaw Festival district",
        "Old Town boutique accommodations"
      ],
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
      name: "Niagara Falls",
      description: "Professional cleaning services for the tourist capital, including hotels, vacation rentals, and residential properties.",
      icon: "💧",
      highlights: [
        "Tourist area properties",
        "Vacation rental turnovers",
        "Fallsview district homes",
        "Hotel and hospitality cleaning",
        "Clifton Hill area businesses"
      ],
      image: "https://images.unsplash.com/photo-1489447068241-b3490214e879?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
      name: "Welland",
      description: "Reliable cleaning services for Welland's diverse communities, from canal-side homes to modern developments.",
      icon: "🚢",
      highlights: [
        "Welland Canal area homes",
        "Downtown residential areas",
        "New subdivision properties",
        "Industrial area housing",
        "Historic Rose City neighborhoods"
      ],
      image: "https://images.unsplash.com/photo-1560440021-33f9b867899d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
      name: "Thorold",
      description: "Serving Thorold's beautiful hillside communities and established neighborhoods with professional cleaning care.",
      icon: "⛰️",
      highlights: [
        "Hillside residential areas",
        "Beaverdams communities",
        "Thorold South neighborhoods",
        "Pine Street corridor homes",
        "Canal bank properties"
      ],
      image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
      name: "Fort Erie",
      description: "Cross-border cleaning excellence for Fort Erie residents, from Peace Bridge area to Crystal Beach waterfront.",
      icon: "🌊",
      highlights: [
        "Crystal Beach waterfront homes",
        "Peace Bridge corridor",
        "Ridgeway historic district",
        "Stevensville rural properties",
        "Lake Erie shoreline cottages"
      ],
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    }
  ];

  const additionalAreas = [
    "Beamsville", "Grimsby", "Lincoln", "West Lincoln", "Pelham",
    "Wainfleet", "Port Colborne", "Fonthill", "Fenwick"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            🏠 Service Areas Across Niagara
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            From St. Catharines to Niagara Falls and beyond - we bring professional cleaning services
            to homes and businesses throughout the beautiful Niagara region.
          </p>
          <div className="flex items-center justify-center gap-2 text-lg">
            <span className="bg-white/20 px-4 py-2 rounded-full">📍 Proudly Local</span>
            <span className="bg-white/20 px-4 py-2 rounded-full">🚗 Mobile Service</span>
            <span className="bg-white/20 px-4 py-2 rounded-full">⭐ 5-Star Rated</span>
          </div>
        </div>
      </div>

      {/* Service Areas Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Primary Service Areas</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Professional cleaning services tailored to each community's unique character and needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {serviceAreas.map((area, index) => (
            <div
              key={area.name}
              className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                selectedArea === area.name ? 'ring-4 ring-blue-500 shadow-2xl' : ''
              }`}
              onClick={() => setSelectedArea(selectedArea === area.name ? null : area.name)}
            >
              <div className="h-48 bg-cover bg-center relative" style={{backgroundImage: `url(${area.image})`}}>
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="text-4xl mb-2">{area.icon}</div>
                  <h3 className="text-2xl font-bold">{area.name}</h3>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-600 mb-4">{area.description}</p>

                {selectedArea === area.name && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-3">We specialize in:</h4>
                    <ul className="space-y-2">
                      {area.highlights.map((highlight) => (
                        <li key={highlight} className="flex items-center text-sm text-gray-600">
                          <span className="text-green-500 mr-2">✓</span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button className="mt-4 text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                  {selectedArea === area.name ? 'Show Less' : 'Learn More →'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Areas */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            🌟 We Also Serve These Communities
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {additionalAreas.map((area) => (
              <div key={area} className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 text-center">
                <span className="text-lg font-semibold text-gray-700">{area}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-600 mt-6">
            Don't see your area? <span className="text-blue-600 font-semibold">Contact us!</span> We're always expanding our service zones.
          </p>
        </div>

        {/* Why Choose Local */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-4">Why Choose VIP Cleaning Squad?</h3>
            <p className="text-xl">We understand our community because we ARE the community!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🏠</div>
              <h4 className="text-xl font-semibold mb-2">Local Knowledge</h4>
              <p>We know the unique needs of Niagara homes - from heritage properties to modern builds.</p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h4 className="text-xl font-semibold mb-2">Quick Response</h4>
              <p>Short travel times mean faster service and better availability for your schedule.</p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-4">🤝</div>
              <h4 className="text-xl font-semibold mb-2">Community Trust</h4>
              <p>Your neighbors trust us, and we're invested in maintaining our local reputation.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h3 className="text-3xl font-bold text-gray-800 mb-6">
            Ready to Experience Professional Cleaning?
          </h3>
          <p className="text-xl text-gray-600 mb-8">
            Get your instant quote and book your cleaning service today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => { window.location.href = '/'; }}
              className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-yellow-500 hover:to-orange-500 transition-all transform hover:scale-105 shadow-lg"
            >
              🚀 Get Instant Quote
            </button>
            <button
              onClick={() => { window.location.href = 'tel:+1234567890'; }}
              className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-blue-600 hover:to-green-600 transition-all transform hover:scale-105 shadow-lg"
            >
              📞 Call Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

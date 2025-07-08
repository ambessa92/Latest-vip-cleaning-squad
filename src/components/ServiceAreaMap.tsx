import type React from 'react';
import { useState, useEffect } from 'react';

interface ServiceZone {
  id: string;
  name: string;
  availability: 'primary' | 'secondary' | 'extended';
  basePrice: number;
  responseTime: string;
  popularServices: string[];
  description: string;
  coordinates: [number, number][];
  center: [number, number];
}

interface RealTimeStatus {
  status: 'available' | 'busy' | 'limited';
  nextSlot: string;
  teamCount: number;
}

interface ServiceAreaMapProps {
  onLocationSelect?: (location: string, pricing: { basePrice: number; availability: string }) => void;
}

const serviceZones: ServiceZone[] = [
  {
    id: 'st-catharines',
    name: 'St. Catharines',
    availability: 'primary',
    basePrice: 89,
    responseTime: '24 hours',
    popularServices: ['Residential Cleaning', 'Commercial Cleaning', 'Deep Cleaning'],
    description: 'Our main service hub with full availability',
    coordinates: [
      [43.1594, -79.2469],
      [43.1794, -79.2169],
      [43.1494, -79.1969],
      [43.1294, -79.2269],
      [43.1394, -79.2569],
    ],
    center: [43.1594, -79.2469]
  },
  {
    id: 'niagara-falls',
    name: 'Niagara Falls',
    availability: 'primary',
    basePrice: 89,
    responseTime: '24 hours',
    popularServices: ['Home Cleaning', 'Airbnb Cleaning', 'Move-in/out'],
    description: 'Premier tourist area with specialized services',
    coordinates: [
      [43.0962, -79.0377],
      [43.1162, -79.0077],
      [43.0862, -78.9977],
      [43.0662, -79.0177],
      [43.0762, -79.0477],
    ],
    center: [43.0962, -79.0377]
  },
  {
    id: 'welland',
    name: 'Welland',
    availability: 'primary',
    basePrice: 95,
    responseTime: '48 hours',
    popularServices: ['Residential Cleaning', 'Office Cleaning'],
    description: 'Full service coverage with competitive rates',
    coordinates: [
      [42.9924, -79.2484],
      [43.0124, -79.2184],
      [42.9824, -79.1984],
      [42.9624, -79.2284],
      [42.9724, -79.2584],
    ],
    center: [42.9924, -79.2484]
  },
  {
    id: 'niagara-on-lake',
    name: 'Niagara-on-the-Lake',
    availability: 'secondary',
    basePrice: 105,
    responseTime: '48 hours',
    popularServices: ['Luxury Home Cleaning', 'Winery Cleaning'],
    description: 'Premium service for luxury properties',
    coordinates: [
      [43.2557, -79.0715],
      [43.2757, -79.0415],
      [43.2457, -79.0215],
      [43.2257, -79.0515],
      [43.2357, -79.0815],
    ],
    center: [43.2557, -79.0715]
  },
  {
    id: 'grimsby',
    name: 'Grimsby',
    availability: 'secondary',
    basePrice: 99,
    responseTime: '48 hours',
    popularServices: ['Home Cleaning', 'Eco-Friendly Cleaning'],
    description: 'Regular service with eco-friendly options',
    coordinates: [
      [43.2033, -79.5649],
      [43.2233, -79.5349],
      [43.1933, -79.5149],
      [43.1733, -79.5449],
      [43.1833, -79.5749],
    ],
    center: [43.2033, -79.5649]
  },
  {
    id: 'lincoln',
    name: 'Lincoln',
    availability: 'secondary',
    basePrice: 99,
    responseTime: '72 hours',
    popularServices: ['Rural Home Cleaning', 'Seasonal Cleaning'],
    description: 'Extended coverage for rural properties',
    coordinates: [
      [43.1872, -79.4187],
      [43.2072, -79.3887],
      [43.1772, -79.3687],
      [43.1572, -79.3987],
      [43.1672, -79.4287],
    ],
    center: [43.1872, -79.4187]
  },
  {
    id: 'pelham',
    name: 'Pelham',
    availability: 'extended',
    basePrice: 109,
    responseTime: '72 hours',
    popularServices: ['Home Cleaning', 'Move-in/out'],
    description: 'Extended service area with advance booking',
    coordinates: [
      [43.0332, -79.3387],
      [43.0532, -79.3087],
      [43.0232, -79.2887],
      [43.0032, -79.3187],
      [42.9932, -79.3487],
    ],
    center: [43.0332, -79.3387]
  },
  {
    id: 'thorold',
    name: 'Thorold',
    availability: 'extended',
    basePrice: 105,
    responseTime: '72 hours',
    popularServices: ['Residential Cleaning', 'Post-Construction'],
    description: 'Growing service area with specialized options',
    coordinates: [
      [43.1238, -79.1998],
      [43.1438, -79.1698],
      [43.1138, -79.1498],
      [43.0938, -79.1798],
      [43.1038, -79.2098],
    ],
    center: [43.1238, -79.1998]
  }
];



const ServiceAreaMap: React.FC<ServiceAreaMapProps> = ({ onLocationSelect }) => {
  const [selectedZone, setSelectedZone] = useState<ServiceZone | null>(null);
  const [realTimeStatus, setRealTimeStatus] = useState<{[key: string]: RealTimeStatus}>({});

  // Add CSS animation for fade-in effect
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fade-in {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in {
        animation: fade-in 0.3s ease-out;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Simulate real-time availability updates
  useEffect(() => {
    const updateStatus = () => {
      const statuses: {[key: string]: RealTimeStatus} = {};
      for (const zone of serviceZones) {
        const statusOptions: ('available' | 'busy' | 'limited')[] = ['available', 'busy', 'limited'];
        const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
        const teamCount = zone.availability === 'primary' ? Math.floor(Math.random() * 3) + 2 :
                         zone.availability === 'secondary' ? Math.floor(Math.random() * 2) + 1 : 1;

        statuses[zone.id] = {
          status: randomStatus,
          nextSlot: randomStatus === 'busy' ? 'Tomorrow 9 AM' : 'Today 2 PM',
          teamCount
        };
      }
      setRealTimeStatus(statuses);
    };

    updateStatus();
    const interval = setInterval(updateStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const getZoneColor = (availability: string, isSelected: boolean) => {
    const colors = {
      primary: isSelected ? '#10B981' : '#34D399',
      secondary: isSelected ? '#3B82F6' : '#60A5FA',
      extended: isSelected ? '#8B5CF6' : '#A78BFA'
    };
    return colors[availability as keyof typeof colors];
  };

  const getAvailabilityLabel = (availability: string) => {
    const labels = {
      primary: 'Premium Coverage',
      secondary: 'Standard Coverage',
      extended: 'Extended Coverage'
    };
    return labels[availability as keyof typeof labels];
  };

  const getStatusColor = (status: string) => {
    const colors = {
      available: '#10B981',
      busy: '#F59E0B',
      limited: '#EF4444'
    };
    return colors[status as keyof typeof colors] || '#6B7280';
  };

  const handleZoneClick = (zone: ServiceZone) => {
    setSelectedZone(zone);
    onLocationSelect?.(zone.name, {
      basePrice: zone.basePrice,
      availability: zone.availability
    });
  };

  return (
    <section className="py-16 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Enhanced VIP Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-transparent to-orange-500/10 animate-pulse" />
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full animate-float blur-xl" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full animate-float-delayed blur-xl" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full animate-pulse blur-xl" />

        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full" style={{
            backgroundImage: `
              linear-gradient(rgba(255,215,0,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,215,0,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }} />
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse mr-3" />
            <span className="text-white font-medium">🗺️ VIP Service Coverage Map</span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-green-300 to-blue-300">
              VIP Service Coverage
            </span>
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Explore our comprehensive cleaning services across the entire Niagara region.
            Click on areas to see real-time availability and detailed information.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Enhanced Premium Map Container */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 relative group overflow-hidden">
              {/* Premium Header with Live Status */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-green-400 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">VIP Service Coverage</h3>
                    <p className="text-blue-200 text-sm">Professional cleaning across Niagara • Click areas for details</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-300 text-xs font-medium">VIP</span>
                </div>
              </div>

              {/* Enhanced Map with Search */}
              <div className="relative">
                {/* Map Search Bar */}
                <div className="absolute top-4 left-4 right-4 z-10">
                  <div className="relative max-w-md">
                    <input
                      type="text"
                      placeholder="Search your location..."
                      className="w-full px-4 py-3 pl-12 pr-20 bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm shadow-lg"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors">
                      Find
                    </button>
                  </div>
                </div>

                {/* Enhanced Static Map Container */}
                <div className="h-[500px] rounded-xl overflow-hidden relative shadow-2xl bg-gradient-to-br from-slate-800 to-slate-900">
                  {/* Beautiful Niagara Region Map Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-purple-900/50">
                    <svg viewBox="0 0 800 500" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      {/* Lake Ontario */}
                      <path d="M0 0 L800 0 L800 150 Q700 140 600 135 Q500 130 400 135 Q300 140 200 145 Q100 150 0 155 Z" fill="#1e40af" opacity="0.6" />

                      {/* Niagara River */}
                      <path d="M650 150 Q655 200 660 250 Q665 300 670 350 Q675 400 680 450 Q685 500 690 500" stroke="#3b82f6" strokeWidth="8" fill="none" />

                      {/* Service Zone Areas */}
                      {serviceZones.map((zone, index) => {
                        const isSelected = selectedZone?.id === zone.id;
                        const status = realTimeStatus[zone.id];
                        const zonePositions = {
                          'st-catharines': { x: 400, y: 250, width: 120, height: 80 },
                          'niagara-falls': { x: 650, y: 200, width: 100, height: 70 },
                          'welland': { x: 550, y: 350, width: 90, height: 60 },
                          'niagara-on-lake': { x: 500, y: 150, width: 110, height: 50 },
                          'grimsby': { x: 250, y: 200, width: 100, height: 70 },
                          'lincoln': { x: 300, y: 280, width: 80, height: 60 },
                          'pelham': { x: 480, y: 380, width: 80, height: 50 },
                          'thorold': { x: 450, y: 300, width: 70, height: 50 }
                        };

                        const pos = zonePositions[zone.id as keyof typeof zonePositions] || { x: 400, y: 250, width: 80, height: 60 };
                        const zoneColor = getZoneColor(zone.availability, isSelected);

                        return (
                          <g key={zone.id}>
                            {/* Zone Area */}
                            <ellipse
                              cx={pos.x}
                              cy={pos.y}
                              rx={pos.width / 2}
                              ry={pos.height / 2}
                              fill={zoneColor}
                              fillOpacity={isSelected ? 0.8 : 0.6}
                              stroke={zoneColor}
                              strokeWidth={isSelected ? 4 : 2}
                              strokeDasharray={isSelected ? 'none' : '10,5'}
                              className="cursor-pointer transition-all duration-300 hover:opacity-80"
                              onClick={() => handleZoneClick(zone)}
                            />

                            {/* Zone Marker */}
                            <circle
                              cx={pos.x}
                              cy={pos.y}
                              r={isSelected ? 12 : 8}
                              fill="white"
                              stroke={zoneColor}
                              strokeWidth="3"
                              className="cursor-pointer transition-all duration-300 hover:opacity-80"
                              onClick={() => handleZoneClick(zone)}
                            />

                            {/* VIP Marker Text */}
                            <text
                              x={pos.x}
                              y={pos.y + 2}
                              textAnchor="middle"
                              fontSize="8"
                              fontWeight="bold"
                              fill={zoneColor}
                              className="pointer-events-none select-none"
                            >
                              VIP
                            </text>

                            {/* Zone Label */}
                            <text
                              x={pos.x}
                              y={pos.y - pos.height / 2 - 10}
                              textAnchor="middle"
                              fontSize="12"
                              fontWeight="bold"
                              fill="white"
                              className="pointer-events-none select-none drop-shadow-lg"
                            >
                              {zone.name}
                            </text>

                            {/* Status Indicator */}
                            {status && (
                              <circle
                                cx={pos.x + pos.width / 2 - 15}
                                cy={pos.y - pos.height / 2 + 15}
                                r="6"
                                fill={getStatusColor(status.status)}
                                className="animate-pulse"
                              />
                            )}
                          </g>
                        );
                      })}

                      {/* Decorative Elements */}
                      <circle cx="100" cy="400" r="3" fill="#fbbf24" opacity="0.7" className="animate-pulse" />
                      <circle cx="700" cy="100" r="2" fill="#34d399" opacity="0.8" className="animate-pulse" />
                      <circle cx="150" cy="100" r="2" fill="#60a5fa" opacity="0.7" className="animate-pulse" />

                      {/* Geographic Labels */}
                      <text x="400" y="40" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#60a5fa" opacity="0.8">
                        Lake Ontario
                      </text>
                      <text x="720" y="320" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#3b82f6" opacity="0.8" transform="rotate(90 720 320)">
                        Niagara River
                      </text>
                    </svg>
                  </div>

                  {/* Map Overlay Controls */}
                  <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
                    <div className="flex flex-col space-y-2">
                      <button className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded text-white font-bold text-lg flex items-center justify-center transition-colors">
                        +
                      </button>
                      <button className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded text-white font-bold text-lg flex items-center justify-center transition-colors">
                        −
                      </button>
                    </div>
                  </div>

                  {/* Interactive Zone Details Popup */}
                  {selectedZone && (
                    <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-2xl p-4 animate-fade-in border-2 border-blue-500/20">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-900">{selectedZone.name}</h3>
                        <button
                          onClick={() => setSelectedZone(null)}
                          className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-green-50 rounded-lg p-2 text-center">
                          <div className="text-green-600 text-xs font-medium">Starting Price</div>
                          <div className="text-green-800 text-lg font-bold">${selectedZone.basePrice}</div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-2 text-center">
                          <div className="text-blue-600 text-xs font-medium">Response Time</div>
                          <div className="text-blue-800 text-sm font-bold">{selectedZone.responseTime}</div>
                        </div>
                      </div>

                      {realTimeStatus[selectedZone.id] && (
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div className="bg-purple-50 rounded-lg p-2 text-center">
                            <div className="text-purple-600 text-xs font-medium">Active Teams</div>
                            <div className="text-purple-800 text-sm font-bold">{realTimeStatus[selectedZone.id].teamCount}</div>
                          </div>
                          <div className="bg-orange-50 rounded-lg p-2 text-center">
                            <div className="text-orange-600 text-xs font-medium">Next Slot</div>
                            <div className="text-orange-800 text-xs font-bold">{realTimeStatus[selectedZone.id].nextSlot}</div>
                          </div>
                          <div className="bg-emerald-50 rounded-lg p-2 text-center">
                            <div className="text-emerald-600 text-xs font-medium">Same Day</div>
                            <div className="text-emerald-800 text-xs font-bold">
                              {selectedZone.availability === 'primary' ? '✓ Yes' : '⚠ Limited'}
                            </div>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => handleZoneClick(selectedZone)}
                        className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all text-sm shadow-lg"
                      >
                        🚀 Get Quote for {selectedZone.name}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Premium Legend */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-semibold text-sm">Service Coverage Levels</h4>
                  <div className="flex items-center space-x-2 text-xs text-blue-200">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span>VIP Coverage</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-green-400/30">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-400 rounded-lg flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-green-300 font-semibold text-sm">Premium Coverage</div>
                        <div className="text-green-200 text-xs">Same-day service • Priority response</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-blue-400/30">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-blue-400 rounded-lg flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-blue-300 font-semibold text-sm">Standard Coverage</div>
                        <div className="text-blue-200 text-xs">Next-day service • Regular scheduling</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-purple-400/30">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-purple-400 rounded-lg flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-purple-300 font-semibold text-sm">Extended Coverage</div>
                        <div className="text-purple-200 text-xs">On-request • Special arrangements</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Zone Details Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 sticky top-8">
              {selectedZone ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-white">{selectedZone.name}</h3>
                    <div className="flex items-center space-x-2">
                      {realTimeStatus[selectedZone.id] && (
                        <div className="flex items-center space-x-1">
                          <div
                            className="w-3 h-3 rounded-full animate-pulse"
                            style={{ backgroundColor: getStatusColor(realTimeStatus[selectedZone.id].status) }}
                          />
                          <span className="text-xs text-white font-medium capitalize">
                            {realTimeStatus[selectedZone.id].status}
                          </span>
                        </div>
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
                        selectedZone.availability === 'primary' ? 'bg-green-500' :
                        selectedZone.availability === 'secondary' ? 'bg-blue-500' : 'bg-purple-500'
                      }`}>
                        {getAvailabilityLabel(selectedZone.availability)}
                      </span>
                    </div>
                  </div>

                  <p className="text-blue-100">{selectedZone.description}</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-yellow-300 text-sm font-medium">Starting Price</div>
                      <div className="text-white text-xl font-bold">${selectedZone.basePrice}</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-green-300 text-sm font-medium">Response Time</div>
                      <div className="text-white text-xl font-bold">{selectedZone.responseTime}</div>
                    </div>
                  </div>

                  {realTimeStatus[selectedZone.id] && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 rounded-lg p-3">
                        <div className="text-purple-300 text-sm font-medium">Available Teams</div>
                        <div className="text-white text-xl font-bold">{realTimeStatus[selectedZone.id].teamCount}</div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3">
                        <div className="text-orange-300 text-sm font-medium">Next Slot</div>
                        <div className="text-white text-sm font-bold">{realTimeStatus[selectedZone.id].nextSlot}</div>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-white font-semibold mb-2">Popular Services</h4>
                    <div className="space-y-2">
                      {selectedZone.popularServices.map((service) => (
                        <div key={service} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          <span className="text-blue-100 text-sm">{service}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleZoneClick(selectedZone)}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-105 relative overflow-hidden"
                  >
                    <span className="relative z-10">Get Quote for {selectedZone.name}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🗺️</div>
                  <h3 className="text-xl font-bold text-white mb-2">Select a Service Area</h3>
                  <p className="text-blue-100 mb-4">Click on any highlighted area on the map to see detailed information, pricing, and booking options.</p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-green-300 font-semibold">Available Now</div>
                      <div className="text-white text-xs">
                        {Object.values(realTimeStatus).filter(s => s.status === 'available').length} areas
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-yellow-300 font-semibold">Busy</div>
                      <div className="text-white text-xs">
                        {Object.values(realTimeStatus).filter(s => s.status === 'busy').length} areas
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Quick Stats */}
        <div className="mt-12 grid md:grid-cols-4 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20 hover:bg-white/15 transition-all">
            <div className="text-3xl font-bold text-green-300">8</div>
            <div className="text-blue-100 text-sm">Service Areas</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20 hover:bg-white/15 transition-all">
            <div className="text-3xl font-bold text-yellow-300">
              {Object.values(realTimeStatus).reduce((acc, status) => acc + status.teamCount, 0)}
            </div>
            <div className="text-blue-100 text-sm">Active Teams</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20 hover:bg-white/15 transition-all">
            <div className="text-3xl font-bold text-purple-300">50+km</div>
            <div className="text-blue-100 text-sm">Coverage Radius</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20 hover:bg-white/15 transition-all">
            <div className="text-3xl font-bold text-blue-300">
              {Math.round((Object.values(realTimeStatus).filter(s => s.status === 'available').length / Object.values(realTimeStatus).length) * 100)}%
            </div>
            <div className="text-blue-100 text-sm">Available Now</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceAreaMap;

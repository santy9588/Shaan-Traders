import React, { useState, useEffect, useMemo } from 'react';
import { 
  Globe, MapPin, Compass, Search, Filter, ShieldCheck, 
  Map as MapIcon, Layers, Radio, Locate, Navigation2, Check,
  X, HelpCircle, Phone, ArrowUpRight, Award, Landmark, User,
  Share2, Crosshair, Users
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface GlobalEcosystemTrackerProps {
  currentUser: UserProfile | null;
  registeredUsers: UserProfile[];
  onSwitchUser?: (phone: string) => void;
  onClose: () => void;
}

// Map helper to calculate geodesic distance in km between two lat-lng coordinates
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Preset worldwide or Indian agricultural hubs to relocate simulated map context
const TRACKING_HUBS = [
  { name: 'Patna Agriculture Zone, Bihar', lat: 25.6112, lng: 85.1414, country: 'India' },
  { name: 'New Delhi Mandi, NCR', lat: 28.6304, lng: 77.2177, country: 'India' },
  { name: 'Central Bengaluru Market, Karnataka', lat: 12.9718, lng: 77.6411, country: 'India' },
  { name: 'Mumbai Sourcing Hub, Maharashtra', lat: 19.0600, lng: 72.8362, country: 'India' },
  { name: 'Noida Agro Base, Uttar Pradesh', lat: 28.6219, lng: 77.3712, country: 'India' },
  { name: 'Kolkata Export Terminal, West Bengal', lat: 22.5804, lng: 88.4378, country: 'India' },
  { name: 'Global Sourcing Center, California', lat: 37.4220, lng: -122.0841, country: 'USA' }
];

// Fallback mock seeds to auto-populate map if registeredUsers list is sparse
const MOCK_ECOSYSTEM_PARTNERS: { name: string; businessName: string; role: UserRole; phone: string; latOffset: number; lngOffset: number; address: string }[] = [
  { name: 'Rajesh Mishra', businessName: 'Mishra Kesar Farms', role: 'farmer', phone: '9876504312', latOffset: 0.024, lngOffset: -0.015, address: 'Khet #204, Bihta Road, Outskirts Patna' },
  { name: 'Ravi Teja', businessName: 'Teja Wholesale Spices', role: 'wholesaler', phone: '9440123456', latOffset: -0.045, lngOffset: 0.052, address: 'Bandra Agri Yard, Stall B-12, Mumbai' },
  { name: 'Ganga Cooperative', businessName: 'Ganga Organic Producer Co-op', role: 'organic_producer', phone: '9123456780', latOffset: 0.012, lngOffset: 0.035, address: 'Ganga Canal Belt, Sector 3, Patna Base' },
  { name: 'Priya Patel', businessName: 'Patel Bio Fertilizers & Seeds', role: 'supplier', phone: '9321045612', latOffset: 0.051, lngOffset: -0.062, address: 'NH-30 Gola Road crossing, Danapur Area' },
  { name: 'Sanjay Rawat', businessName: 'Global Exporter Direct', role: 'exporter', phone: '9213874635', latOffset: -0.031, lngOffset: -0.045, address: 'Port Customs Warehouse 4A, Marine Line' },
  { name: 'SuperFresh Mart Patna', businessName: 'SuperFresh Retail Store', role: 'retailer', phone: '9988771122', latOffset: -0.012, lngOffset: 0.018, address: 'Main Beli Road, opposite Pillar 42, Patna' },
  { name: 'Amit Kumar', businessName: 'Standard Customer', role: 'customer', phone: '9279120271', latOffset: 0.005, lngOffset: -0.008, address: 'Shivaji Park Colony, Lane No 3, Patna' },
  { name: 'Karan Johar', businessName: 'Daily Harvest Customer', role: 'customer', phone: '9560412354', latOffset: -0.022, lngOffset: -0.012, address: 'Sector 4, Housing Board Quarters, Patna' }
];

export default function GlobalEcosystemTracker({
  currentUser,
  registeredUsers = [],
  onSwitchUser,
  onClose
}: GlobalEcosystemTrackerProps) {
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('satellite');
  const [mapCenter, setMapCenter] = useState({ lat: 25.6112, lng: 85.1414 });
  const [activeHub, setActiveHub] = useState('Patna Agriculture Zone, Bihar');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom states for interactive map tracking filter
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');
  const [onlyWithin10Km, setOnlyWithin10Km] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<UserProfile | null>(null);
  const [simulatedDirections, setSimulatedDirections] = useState<{ path: {lat: number, lng: number}[], distance: number, r: number } | null>(null);

  // Fallback API key verification
  const apiKey = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
  const [mapsAuthFailed, setMapsAuthFailed] = useState(() => (window as any).googleMapsAuthFailed || false);

  useEffect(() => {
    const handleAuthFailure = () => setMapsAuthFailed(true);
    const handleAuthSuccess = () => setMapsAuthFailed(false);
    window.addEventListener('google-maps-auth-failure', handleAuthFailure);
    window.addEventListener('google-maps-auth-success', handleAuthSuccess);
    return () => {
      window.removeEventListener('google-maps-auth-failure', handleAuthFailure);
      window.removeEventListener('google-maps-auth-success', handleAuthSuccess);
    };
  }, []);

  const hasValidKey = Boolean(apiKey) && apiKey !== 'YOUR_API_KEY' && !mapsAuthFailed;

  // Coordinate setup when loading
  useEffect(() => {
    if (currentUser && currentUser.coordinates) {
      setMapCenter(currentUser.coordinates);
      // Try to find closest hub
      const closestHub = TRACKING_HUBS.reduce((prev, curr) => {
        const dPrev = Math.abs(prev.lat - currentUser.coordinates.lat) + Math.abs(prev.lng - currentUser.coordinates.lng);
        const dCurr = Math.abs(curr.lat - currentUser.coordinates.lat) + Math.abs(curr.lng - currentUser.coordinates.lng);
        return dCurr < dPrev ? curr : prev;
      });
      if (closestHub) {
        setActiveHub(closestHub.name);
      }
    }
  }, [currentUser]);

  // Combine real registered users and seeded mockup list based on current map state to make world lookup extremely engaging
  const allMapPartners = useMemo(() => {
    // Generate simulated dynamic users based on the current map center
    const localizedSeeded: UserProfile[] = MOCK_ECOSYSTEM_PARTNERS.map((partner, i) => {
      return {
        id: `mock_seed_partner_${partner.phone}_${i}`,
        name: partner.name,
        role: partner.role,
        email: `${partner.name.toLowerCase().replace(/\s+/g, '')}@freshmarket.com`,
        phone: partner.phone,
        address: partner.address,
        businessName: partner.businessName,
        coordinates: {
          lat: mapCenter.lat + partner.latOffset,
          lng: mapCenter.lng + partner.lngOffset
        },
        coverageRadius: partner.role === 'customer' ? 0 : 12
      };
    });

    // Real users formatted from database (excluding current authenticated user so current user remains central target)
    const realUsersFormatted: UserProfile[] = registeredUsers
      .filter(u => !currentUser || u.phone !== currentUser.phone)
      .map(u => ({ ...u }));

    return [...realUsersFormatted, ...localizedSeeded];
  }, [registeredUsers, currentUser, mapCenter]);

  // Handle radius & search filters
  const filteredPartners = useMemo(() => {
    return allMapPartners.filter(partner => {
      // 1. Filter by role
      if (filterRole !== 'all' && partner.role !== filterRole) {
        return false;
      }

      // 2. Filter by distance (Strictly check approx 10 Kilometer radius bounds from map center or user's coordinates)
      const currentLoc = currentUser?.coordinates || mapCenter;
      const distance = calculateHaversineDistance(
        currentLoc.lat,
        currentLoc.lng,
        partner.coordinates.lat,
        partner.coordinates.lng
      );
      
      if (onlyWithin10Km && distance > 10) {
        return false;
      }

      // 3. Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = partner.name.toLowerCase().includes(query);
        const matchesBusiness = (partner.businessName || '').toLowerCase().includes(query);
        const matchesAddress = partner.address.toLowerCase().includes(query);
        const matchesPhone = partner.phone.includes(query);
        const matchesRole = partner.role.replace('_', ' ').toLowerCase().includes(query);
        return matchesName || matchesBusiness || matchesAddress || matchesPhone || matchesRole;
      }

      return true;
    });
  }, [allMapPartners, filterRole, onlyWithin10Km, searchQuery, mapCenter, currentUser]);

  // Count active partners by role to give live dashboard telemetry
  const telemetryCounts = useMemo(() => {
    const counts = {
      farmer: 0,
      customer: 0,
      wholesaler: 0,
      retailer: 0,
      supplier: 0,
      organic_producer: 0,
      exporter: 0,
      inRange: 0
    };

    allMapPartners.forEach(partner => {
      const role = partner.role;
      if (role in counts) {
        counts[role as keyof typeof counts]++;
      }
      
      const currentLoc = currentUser?.coordinates || mapCenter;
      const distance = calculateHaversineDistance(
        currentLoc.lat,
        currentLoc.lng,
        partner.coordinates.lat,
        partner.coordinates.lng
      );
      if (distance <= 10) {
        counts.inRange++;
      }
    });

    return counts;
  }, [allMapPartners, currentUser, mapCenter]);

  // Handle relocation of map context
  const handleRelocate = (hub: { name: string; lat: number; lng: number; country?: string }) => {
    setActiveHub(hub.name);
    setMapCenter({ lat: hub.lat, lng: hub.lng });
    setSelectedPartner(null);
    setSimulatedDirections(null);
  };

  // Simulate picking / reverse geocoding on fake interactive coordinate click
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Relative shift conversion (+/- 0.08 degrees)
    const xPct = (x / rect.width) - 0.5;
    const yPct = 0.5 - (y / rect.height);
    
    const clickLat = mapCenter.lat + yPct * 0.12;
    const clickLng = mapCenter.lng + xPct * 0.12;

    // Find if user clicked very near to an existing marker
    const clickedPartner = filteredPartners.find(p => {
      const latDiff = Math.abs(p.coordinates.lat - clickLat);
      const lngDiff = Math.abs(p.coordinates.lng - clickLng);
      return latDiff < 0.012 && lngDiff < 0.012;
    });

    if (clickedPartner) {
      handleSelectPartner(clickedPartner);
    } else {
      // Prompt user or reposition center directly if double clicked or tapped
      const currentLoc = currentUser?.coordinates || mapCenter;
      const distance = calculateHaversineDistance(currentLoc.lat, currentLoc.lng, clickLat, clickLng);
      
      // If click looks like empty map space, clear selection
      setSelectedPartner(null);
      setSimulatedDirections(null);
    }
  };

  // Select partner to inspect details and show Navigation
  const handleSelectPartner = (partner: UserProfile) => {
    setSelectedPartner(partner);
    
    // Generate dynamic simulation path
    const startLoc = currentUser?.coordinates || mapCenter;
    const destLoc = partner.coordinates;
    const dist = calculateHaversineDistance(startLoc.lat, startLoc.lng, destLoc.lat, destLoc.lng);

    // Render path points
    const points = [
      startLoc,
      { lat: startLoc.lat + (destLoc.lat - startLoc.lat) * 0.35 + (Math.random() - 0.5) * 0.01, lng: startLoc.lng + (destLoc.lng - startLoc.lng) * 0.35 },
      { lat: startLoc.lat + (destLoc.lat - startLoc.lat) * 0.70 + (Math.random() - 0.5) * 0.01, lng: startLoc.lng + (destLoc.lng - startLoc.lng) * 0.70 },
      destLoc
    ];

    setSimulatedDirections({
      path: points,
      distance: dist,
      r: Math.floor(Math.random() * 3) + 12 // estimated travel minutes
    });
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'farmer': return 'bg-emerald-600 border-emerald-500 text-white';
      case 'organic_producer': return 'bg-teal-600 border-teal-500 text-white';
      case 'wholesaler': return 'bg-amber-600 border-amber-500 text-white';
      case 'retailer': return 'bg-orange-600 border-orange-500 text-white';
      case 'supplier': return 'bg-sky-600 border-sky-500 text-white';
      case 'exporter': return 'bg-indigo-600 border-indigo-500 text-white';
      case 'customer': return 'bg-purple-600 border-purple-500 text-white';
    }
  };

  const getRoleIconEmoji = (role: UserRole) => {
    switch (role) {
      case 'farmer': return '👨‍🌾';
      case 'organic_producer': return '🌱';
      case 'wholesaler': return '📦';
      case 'retailer': return '🏪';
      case 'supplier': return '🚛';
      case 'exporter': return '🚢';
      case 'customer': return '🛒';
    }
  };

  // Convert map coordinates to percentage layout for simulated visual grid
  const getCoordinatesPct = (coords: { lat: number; lng: number }) => {
    // Zoom factor layout based on relative offset
    const latSpan = 0.15;
    const lngSpan = 0.15;

    const latDiff = coords.lat - mapCenter.lat;
    const lngDiff = coords.lng - mapCenter.lng;

    // Convert to percentage with bounds restriction
    let left = 50 + (lngDiff / lngSpan) * 100;
    let top = 50 - (latDiff / latSpan) * 100; // invert Y for map

    return {
      left: `${Math.max(4, Math.min(96, left))}%`,
      top: `${Math.max(4, Math.min(96, top))}%`
    };
  };

  // Convert coordinates to raw numeric scale for SVG viewBox paths (0 to 100)
  const getCoordinatesPctVal = (coords: { lat: number; lng: number }) => {
    const latSpan = 0.15;
    const lngSpan = 0.15;

    const latDiff = coords.lat - mapCenter.lat;
    const lngDiff = coords.lng - mapCenter.lng;

    let left = 50 + (lngDiff / lngSpan) * 100;
    let top = 50 - (latDiff / latSpan) * 100; // invert Y for map

    return {
      x: Math.max(4, Math.min(96, left)),
      y: Math.max(4, Math.min(96, top))
    };
  };

  // Generate beautiful wavy road-like path from current user to the partner pin
  const pathD = useMemo(() => {
    if (!simulatedDirections || !simulatedDirections.path || !selectedPartner) return '';
    const points = simulatedDirections.path.map(pt => getCoordinatesPctVal(pt));
    if (points.length < 2) return '';

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      // Generate a curved bezier line to look like a realistic trade logistics path/road instead of straight line
      const cx1 = p0.x + (p1.x - p0.x) * 0.5 + (i % 2 === 0 ? 5 : -5);
      const cy1 = p0.y + (p1.y - p0.y) * 0.5 + (i % 2 === 0 ? -5 : 5);
      d += ` Q ${cx1} ${cy1}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [simulatedDirections, selectedPartner, mapCenter]);

  return (
    <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden animate-in fade-in duration-200">
      
      <div className="bg-white rounded-[28px] w-full max-w-7xl h-[94vh] shadow-2xl border border-zinc-200/80 overflow-hidden flex flex-col md:flex-row animate-in zoom-in duration-300">
        
        {/* Left Control Panel / Portal Directory */}
        <div className="w-full md:w-[380px] bg-zinc-50 border-r border-zinc-200 flex flex-col h-1/2 md:h-full shrink-0">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-200 bg-white">
            <div className="flex justify-between items-center mb-1">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold font-mono px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" /> Global GPS Tracking System
              </span>
              <button 
                onClick={onClose} 
                className="md:hidden p-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <h2 className="text-xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
              🍒 FreshMarket GPS Portal
            </h2>
            <p className="text-[11px] text-zinc-500 mt-1 leading-normal font-medium">
              Geospatial ecosystem telemetry of registered Farmers, Customer segments & Global Supply chain nodes.
            </p>
          </div>

          {/* Directory Filters & Settings */}
          <div className="p-4 border-b border-zinc-150 bg-zinc-50 space-y-3.5 scrollbar-thin overflow-y-auto">
            
            {/* Search Box */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                className="w-full pl-9 pr-8 py-2 bg-white border border-zinc-250 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium"
                placeholder="Find partners (Gopal Organic, Sanjay, Patna...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-zinc-400 hover:text-zinc-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Geographical Relocator Hub Selectors */}
            <div>
              <span className="block text-[8px] font-black tracking-widest text-zinc-400 uppercase mb-1.5 flex items-center gap-1">
                <Globe className="w-3 h-3 text-zinc-400 animate-spin-slow" /> GLOBAL SAT-LOCK REGIONS
              </span>
              <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin select-none">
                {TRACKING_HUBS.map((hub) => (
                  <button
                    key={hub.name}
                    onClick={() => handleRelocate(hub)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 border uppercase tracking-wider ${
                      activeHub === hub.name
                        ? 'bg-zinc-900 border-zinc-900 text-white shadow-sm font-extrabold'
                        : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                    }`}
                  >
                    {hub.name.split(',')[0]}
                  </button>
                ))}
              </div>

              {/* Global City Relocator Fly Box */}
              <div className="space-y-1 mt-2.5 border-t border-zinc-150 pt-2.5">
                <span className="block text-[8px] font-black tracking-widest text-zinc-500 uppercase">
                  🚀 Relocate Sat-Lock World-Wide
                </span>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full pl-3 pr-16 py-1.5 bg-white border border-zinc-200 rounded-lg text-[10px] focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium"
                    placeholder="Search any global place (e.g. London, Dubai, Paris...)"
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        const inputElement = e.currentTarget;
                        const query = inputElement.value.trim();
                        if (!query) return;
                        try {
                          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
                            headers: { 'Accept': 'application/json', 'User-Agent': 'OrganicEcosystemPlatform/1.0.0' }
                          });
                          const data = await res.json();
                          if (data && data[0]) {
                            const lat = parseFloat(data[0].lat);
                            const lng = parseFloat(data[0].lon);
                            const name = data[0].display_name.split(',')[0] + ', ' + (data[0].display_name.split(',').slice(-1)[0] || '').trim();
                            handleRelocate({ name, lat, lng, country: 'Global' });
                            inputElement.value = '';
                          } else {
                            alert("Place not found. Try a broader city or region search query!");
                          }
                        } catch (err) {
                          console.error(err);
                        }
                      }
                    }}
                  />
                  <span className="absolute right-2 top-1 px-1 bg-zinc-100 border border-zinc-200 rounded text-[8px] text-zinc-500 uppercase font-bold">
                    [Enter]
                  </span>
                </div>
              </div>
            </div>

            {/* Radius constraints toggle */}
            <div className="bg-white p-3 rounded-xl border border-zinc-200/80 flex items-center justify-between shadow-xs">
              <div className="space-y-0.5">
                <span className="block text-[10px] font-black text-zinc-800 uppercase leading-none">
                  10 KM Radius Restriction
                </span>
                <span className="text-[9px] text-zinc-500 leading-none">
                  Track local ecosystem members only
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOnlyWithin10Km(!onlyWithin10Km)}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  onlyWithin10Km ? 'bg-emerald-600' : 'bg-zinc-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    onlyWithin10Km ? 'translate-x-4.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Custom Role Category Carousel */}
            <div>
              <span className="block text-[8px] font-black tracking-widest text-zinc-400 uppercase mb-1.5">
                FILTER ECOSYSTEM MEMBERS ({filteredPartners.length} MAP POINTS IN VIEW)
              </span>
              <div className="grid grid-cols-4 gap-1 select-none">
                <button
                  onClick={() => setFilterRole('all')}
                  className={`col-span-2 py-1.5 rounded-lg text-[9px] font-extrabold border transition text-center uppercase tracking-wider ${
                    filterRole === 'all'
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  🌐 Show All
                </button>
                <button
                  onClick={() => setFilterRole('farmer')}
                  className={`py-1.5 rounded-lg text-[9px] font-bold border transition text-center ${
                    filterRole === 'farmer' ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-800 border-emerald-100'
                  }`}
                  title={`Farmers: ${telemetryCounts.farmer}`}
                >
                  👩‍🌾 Farmer ({telemetryCounts.farmer})
                </button>
                <button
                  onClick={() => setFilterRole('organic_producer')}
                  className={`py-1.5 rounded-lg text-[9px] font-bold border transition text-center ${
                    filterRole === 'organic_producer' ? 'bg-teal-600 text-white' : 'bg-white text-teal-800 border-teal-100'
                  }`}
                  title={`Organic Producers: ${telemetryCounts.organic_producer}`}
                >
                  🌱 Organic ({telemetryCounts.organic_producer})
                </button>
                <button
                  onClick={() => setFilterRole('wholesaler')}
                  className={`py-1.5 rounded-lg text-[9px] font-bold border transition text-center ${
                    filterRole === 'wholesaler' ? 'bg-amber-600 text-white' : 'bg-white text-amber-800 border-amber-100'
                  }`}
                  title={`Wholesalers: ${telemetryCounts.wholesaler}`}
                >
                  📦 Wholesale ({telemetryCounts.wholesaler})
                </button>
                <button
                  onClick={() => setFilterRole('retailer')}
                  className={`py-1.5 rounded-lg text-[9px] font-bold border transition text-center ${
                    filterRole === 'retailer' ? 'bg-orange-600 text-white' : 'bg-white text-orange-800 border-orange-100'
                  }`}
                  title={`Retailers: ${telemetryCounts.retailer}`}
                >
                  🏪 Retail ({telemetryCounts.retailer})
                </button>
                <button
                  onClick={() => setFilterRole('supplier')}
                  className={`py-1.5 rounded-lg text-[9px] font-bold border transition text-center ${
                    filterRole === 'supplier' ? 'bg-sky-600 text-white' : 'bg-white text-sky-850 border-sky-100'
                  }`}
                  title={`Suppliers: ${telemetryCounts.supplier}`}
                >
                  🚛 Supply ({telemetryCounts.supplier})
                </button>
                <button
                  onClick={() => setFilterRole('exporter')}
                  className={`py-1.5 rounded-lg text-[9px] font-bold border transition text-center ${
                    filterRole === 'exporter' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-850 border-indigo-100'
                  }`}
                >
                  🚢 Export ({telemetryCounts.exporter})
                </button>
              </div>
            </div>

          </div>

          {/* Partner Directory List (Filtered) */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-200">
            {filteredPartners.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <HelpCircle className="w-8 h-8 text-zinc-400 mx-auto" />
                <p className="text-xs font-black text-zinc-700">No ecosystem actors found</p>
                <p className="text-[10px] text-zinc-500 leading-normal max-w-xs mx-auto">
                  Try clearing search inputs, toggling off the "10 KM constraint" or changing global lock region.
                </p>
              </div>
            ) : (
              filteredPartners.map((partner) => {
                const partnerLoc = partner.coordinates;
                const homeLoc = currentUser?.coordinates || mapCenter;
                const dist = calculateHaversineDistance(homeLoc.lat, homeLoc.lng, partnerLoc.lat, partnerLoc.lng);
                const isIn10Km = dist <= 10;

                return (
                  <div
                    key={partner.id}
                    onClick={() => handleSelectPartner(partner)}
                    className={`p-3.5 hover:bg-zinc-100/70 transition flex gap-3 cursor-pointer items-start text-left ${
                      selectedPartner?.phone === partner.phone ? 'bg-emerald-50/70 border-l-4 border-emerald-600/90' : ''
                    }`}
                  >
                    <div className="w-9 h-9 bg-zinc-100 border border-zinc-200 rounded-xl flex items-center justify-center text-lg shadow-sm shrink-0">
                      {getRoleIconEmoji(partner.role)}
                    </div>
                    
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex justify-between items-baseline">
                        <h4 className="font-extrabold text-zinc-800 text-xs truncate leading-none">
                          {partner.name}
                        </h4>
                        <span className={`text-[8px] font-mono leading-none ${isIn10Km ? 'text-emerald-700 font-bold bg-emerald-100/60' : 'text-zinc-400 bg-zinc-100'} px-1 rounded-sm`}>
                          {dist.toFixed(1)} KM
                        </span>
                      </div>
                      
                      <p className="text-[10px] text-zinc-500 leading-none font-bold truncate">
                        {partner.businessName || 'Independent Partner'}
                      </p>
                      
                      <p className="text-[9px] text-zinc-500 leading-tight truncate">
                        📍 {partner.address}
                      </p>

                      <div className="flex gap-1 pt-1 flex-wrap select-none">
                        <span className="bg-zinc-800 text-zinc-300 font-mono text-[8px] px-1 py-0.2 rounded font-semibold uppercase leading-none">
                          {partner.role.replace('_', ' ')}
                        </span>
                        {isIn10Km && (
                          <span className="bg-emerald-600 text-white font-mono text-[8px] px-1 py-0.2 rounded font-black uppercase leading-none">
                            Nearby (10KM)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick instructions Footer */}
          <div className="p-3.5 border-t border-zinc-200 bg-white shrink-0 text-[10px] text-center text-zinc-500 font-semibold select-none flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" /> Local GPS radius complies with Ministry parameters
          </div>

        </div>

        {/* Right Map Rendering Frame */}
        <div className="flex-1 bg-zinc-900 relative flex flex-col h-1/2 md:h-full">
          
          {/* Top Info Bar controls */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2.5 max-w-full pr-4 select-none">
            
            {/* View selectors */}
            <div className="flex border border-zinc-800 bg-zinc-950/90 text-white rounded-xl shadow-xl overflow-hidden text-xs backdrop-blur-md">
              <button
                type="button"
                className={`px-3 py-2 font-black transition ${mapType === 'roadmap' ? 'bg-emerald-600 text-white' : 'hover:bg-zinc-900 text-zinc-400'}`}
                onClick={() => setMapType('roadmap')}
              >
                <Compass className="w-3.5 h-3.5 inline mr-1" /> Vector Map
              </button>
              <button
                type="button"
                className={`px-3 py-2 font-black transition ${mapType === 'satellite' ? 'bg-emerald-600 text-white' : 'hover:bg-zinc-900 text-zinc-400'}`}
                onClick={() => setMapType('satellite')}
              >
                <Globe className="w-3.5 h-3.5 inline mr-1" /> Satellite Sat-Lock
              </button>
            </div>

            {/* Simulated GPS Status indicator */}
            <div className="bg-zinc-950/90 border border-zinc-800 text-emerald-400 px-3 py-2 text-[10px] font-mono font-bold rounded-xl shadow-xl flex items-center gap-2 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>10KM ECOSYSTEM SCAN ACTIVE</span>
            </div>

          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-zinc-950/95 hover:bg-zinc-900 text-white p-2.5 rounded-2xl border border-zinc-800 shadow-xl transition-transform hover:scale-105 shrink-0 hidden md:block"
          >
            <X className="w-5 h-5" />
          </button>

          {/* CORE GIS Map Canvas (Interactive simulation with Roadmap and Satellite layers) */}
          <div 
            onClick={handleCanvasClick}
            id="ecosystem-coordinates-canvas"
            className={`flex-1 relative cursor-crosshair overflow-hidden select-none transition-all duration-500 ${
              mapType === 'satellite' ? 'bg-[#0b101d]' : 'bg-[#e5e9f0]'
            }`}
          >
            {/* 1. Roadmap Vector Background Grid */}
            {mapType === 'roadmap' ? (
              <div className="absolute inset-0 opacity-100 select-none">
                {/* Simulated Roads */}
                <div className="absolute top-1/6 left-0 w-full h-8 bg-white border-y border-zinc-300 -rotate-3 shadow-inner"></div>
                <div className="absolute top-1/2 left-0 w-full h-10 bg-white border-y border-zinc-300 rotate-1 flex items-center justify-end px-12">
                  <span className="text-[9px] text-zinc-400 font-mono tracking-widest font-black">NATION RECRUITMENT HIGHWAY NH-30</span>
                </div>
                <div className="absolute top-3/4 left-0 w-full h-6 bg-amber-500/10 rotate-6"></div>
                
                {/* Simulated Rivers / Canals crossing */}
                <div className="absolute top-0 left-1/4 w-12 h-full bg-cyan-150 rotate-12 flex items-center justify-center">
                  <p className="text-[8px] text-cyan-600 tracking-widest uppercase font-black uppercase rotate-90">Sourcing Canal Line</p>
                </div>
                <div className="absolute top-0 left-2/3 w-16 h-full bg-cyan-200/40 -rotate-45"></div>

                {/* Simulated Farm/Sourcing Area Blocks */}
                <div className="absolute top-12 left-12 w-48 h-32 bg-emerald-100/45 rounded-3xl border border-emerald-200/60 p-3">
                  <span className="text-[9px] text-emerald-800 font-extrabold uppercase tracking-wide">Patna Organic Belt</span>
                </div>
                <div className="absolute top-48 right-16 w-40 h-28 bg-emerald-50/50 rounded-3xl border border-emerald-100 p-3">
                  <span className="text-[9px] text-emerald-800 font-extrabold uppercase tracking-wide">Horticulture Nursery</span>
                </div>
                <div className="absolute bottom-12 left-24 w-52 h-24 bg-zinc-200/50 rounded-2xl border border-zinc-300"></div>

                {/* Sub-block Coordinates Grid Marks */}
                <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 opacity-30 pointer-events-none">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="border-t border-l border-white/60 text-[8px] p-2 text-zinc-500 font-mono">
                      ZONE_LOC_#{i+1}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // 2. Satellite Visual Background
              <div className="absolute inset-0 opacity-95 select-none bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:24px_24px]">
                <div className="absolute inset-0 bg-[#060b13]"></div>
                {/* Glow sources for Sat heat-maps */}
                <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-505/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-cyan-505/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-12 left-16 w-60 h-60 bg-teal-505/5 rounded-full blur-3xl"></div>
                
                {/* Simulated Sat Canal */}
                <div className="absolute top-0 left-1/4 w-12 h-full bg-cyan-950/20 rotate-12"></div>
                
                {/* Satellite Plot bounds */}
                <div className="absolute top-12 left-12 w-56 h-40 bg-emerald-950/15 border border-emerald-800/20 rounded-3xl"></div>
                <div className="absolute top-52 right-24 w-44 h-28 bg-zinc-900/40 border border-zinc-800/30 rounded-2xl"></div>

                {/* Scan Grid line */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent h-1/2 w-full animate-pulse top-1/4 pointer-events-none border-y border-emerald-500/10"></div>
              </div>
            )}

            {/* Radius indicators centered on Map Coordinates or User Coordinates (10 किलोमीटर) */}
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed flex items-center justify-center transition-all duration-300 pointer-events-none"
              style={{
                width: '320px',
                height: '320px',
                backgroundColor: mapType === 'satellite' ? 'rgba(16, 185, 129, 0.04)' : 'rgba(16, 185, 129, 0.06)',
                borderColor: mapType === 'satellite' ? 'rgba(110, 231, 183, 0.4)' : 'rgba(5, 150, 105, 0.6)'
              }}
            >
              <div className="absolute inset-0 rounded-full border border-spacing-2 border-dashed border-emerald-500/20 scale-75 animate-pulse"></div>
              
              {/* Coverage Marker */}
              <div className="text-[9px] font-extrabold text-[#15803d] bg-white border-2 border-emerald-600 px-2 py-0.5 rounded-full whitespace-nowrap z-0 shadow-lg scale-90 -translate-y-[140px]">
                🚀 10 KM SCAN BOUNDARY
              </div>
            </div>

            {/* Simulated Navigation Route representation */}
            {simulatedDirections && pathD && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-[5]" viewBox="0 0 100 100" preserveAspectRatio="none">
                <style>{`
                  @keyframes dashoffset-route-flow {
                    from {
                      stroke-dashoffset: 16;
                    }
                    to {
                      stroke-dashoffset: 0;
                    }
                  }
                  .animate-dash-flow-route {
                    animation: dashoffset-route-flow 1.5s linear infinite;
                  }
                `}</style>
                {/* 1. Radiant logistics line glow underlay */}
                <path 
                  d={pathD}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="0.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.4"
                  className="animate-pulse"
                />
                {/* 2. Animated active road connector dash */}
                <path 
                  d={pathD}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="0.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="1.2,1.2"
                  className="animate-dash-flow-route"
                />
                
                {/* 3. Interactive live transport tracker bubble */}
                <circle r="0.8" fill="#10b981">
                  <animateMotion dur="4.2s" repeatCount="indefinite" path={pathD} />
                </circle>
                <circle r="0.4" fill="#ffffff" className="animate-ping">
                  <animateMotion dur="4.2s" repeatCount="indefinite" path={pathD} />
                </circle>
              </svg>
            )}

            {/* Current Authenticated User Marker PIN (Pulsar Central Node) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(100%-8px)] z-20 flex flex-col items-center select-none pointer-events-none">
              
              <div className="bg-zinc-950 text-white text-[9px] px-2.5 py-1 rounded-xl shadow-2xl border border-zinc-800 font-mono flex flex-col items-center gap-0.5 whitespace-nowrap mb-1">
                <span className="font-bold text-emerald-400 flex items-center gap-1 uppercase tracking-wider">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> You Are Registered
                </span>
                <span>{currentUser?.name || 'Visitor Access'}</span>
                <span>Role: {currentUser ? currentUser.role.replace('_', ' ').toUpperCase() : 'VISITOR'}</span>
              </div>

              <div className="relative">
                {/* visual pulsing circles */}
                <span className="absolute -top-2 -left-2 w-10.5 h-10.5 rounded-full bg-emerald-500/30 animate-ping"></span>
                <span className="absolute -top-1 -left-1 w-8.5 h-8.5 rounded-full bg-emerald-500/20"></span>
                <div className="w-6.5 h-6.5 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg transform scale-110">
                  👑
                </div>
              </div>
            </div>

            {/* Ecosystem Partner Coordinate Pins on Map Layout */}
            {filteredPartners.map((partner) => {
              const positioning = getCoordinatesPct(partner.coordinates);
              const isSelected = selectedPartner?.phone === partner.phone;

              return (
                <div
                  key={partner.id}
                  className="absolute z-10 -translate-x-1/2 -translate-y-[calc(100%-8px)] flex flex-col items-center cursor-pointer transition-all duration-200"
                  style={{ left: positioning.left, top: positioning.top }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPartner(partner);
                  }}
                >
                  {/* Tooltip header */}
                  <div className={`px-2 py-0.5 rounded-md text-[8px] font-mono leading-none shadow-md border whitespace-nowrap mb-0.5 transition-all ${
                    isSelected 
                      ? 'bg-zinc-950 text-white border-zinc-800 scale-105 font-bold z-20' 
                      : 'bg-white text-zinc-800 border-zinc-200 scale-95 opacity-85 hover:opacity-100'
                  }`}>
                    {partner.name.split(' ')[0]} ({getRoleIconEmoji(partner.role)})
                  </div>

                  {/* Pin Circle element */}
                  <div className={`relative transition-all duration-200 ${isSelected ? 'scale-125 z-20' : 'hover:scale-110'}`}>
                    {isSelected && (
                      <span className="absolute -top-1.5 -left-1.5 w-8 h-8 rounded-full bg-emerald-500/35 animate-ping"></span>
                    )}
                    <div className={`w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-md ${
                      partner.role === 'customer' ? 'bg-purple-600' :
                      partner.role === 'farmer' ? 'bg-emerald-600' :
                      partner.role === 'organic_producer' ? 'bg-teal-600' :
                      partner.role === 'wholesaler' ? 'bg-amber-600' :
                      partner.role === 'retailer' ? 'bg-orange-600' :
                      partner.role === 'supplier' ? 'bg-sky-600' : 'bg-indigo-600'
                    }`}>
                      <span className="text-[10px] select-none leading-none">
                        {getRoleIconEmoji(partner.role)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Floating Navigation Instructions Popup inside Map */}
            {selectedPartner && (
              <div 
                className="absolute bottom-4 left-4 right-4 md:left-6 md:right-auto md:w-[440px] bg-zinc-950/95 text-white border border-zinc-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4.5 animate-in slide-in-from-bottom duration-300 backdrop-blur-md"
                onClick={(e) => e.stopPropagation()}
              >
                
                {/* Header */}
                <div className="flex justify-between items-start pb-3 border-b border-zinc-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-800 border border-zinc-700/60 rounded-xl flex items-center justify-center text-xl shadow-inner shrink-0 leading-none">
                      {getRoleIconEmoji(selectedPartner.role)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-extrabold text-sm truncate text-white">{selectedPartner.name}</p>
                      <p className="text-[10px] text-zinc-400 font-bold truncate">
                        🏢 {selectedPartner.businessName || 'Ecosystem Associate'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setSelectedPartner(null); setSimulatedDirections(null); }}
                    className="p-1 rounded-full bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-white transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Details Body */}
                <div className="space-y-3.5 text-xs text-zinc-350">
                  
                  <div className="grid grid-cols-2 gap-2.5">
                    
                    <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl">
                      <p className="text-[8px] font-black text-zinc-400 tracking-wider uppercase mb-0.5">Contact Number</p>
                      <p className="font-bold text-zinc-100 font-mono text-[10.5px] whitespace-nowrap">+91 {selectedPartner.phone}</p>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl">
                      <p className="text-[8px] font-black text-zinc-400 tracking-wider uppercase mb-0.5">Role Node</p>
                      <span className="inline-block bg-zinc-850 px-2 py-0.5 rounded font-black font-mono text-[9px] text-emerald-400 uppercase leading-none">
                        {selectedPartner.role.replace('_', ' ')}
                      </span>
                    </div>

                  </div>

                  {/* Navigation stats */}
                  {simulatedDirections && (
                    <div className="bg-emerald-950/40 border border-emerald-900/50 p-3.5 rounded-2xl flex justify-between items-center bg-gradient-to-r from-emerald-950/30 to-zinc-900">
                      <div className="space-y-0.5">
                        <span className="text-[8px] font-black tracking-widest text-emerald-400 uppercase block leading-none">
                          SIMULATED ECOSYSTEM NAVIGATION
                        </span>
                        <p className="font-bold text-zinc-100 truncate text-[11px] leading-relaxed pt-1">
                          🚗 Driving Distance: <strong className="text-emerald-400 text-xs font-mono">{simulatedDirections.distance.toFixed(1)} KM</strong>
                        </p>
                      </div>
                      <span className="bg-emerald-600 text-white font-mono text-[10px] font-black px-2 py-1 rounded-lg">
                        ~{simulatedDirections.r} Mins ETA
                      </span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-[8px] font-black tracking-widest text-zinc-400 uppercase">SAT-RECORDED ADDRESS</span>
                    <p className="text-[11px] font-medium leading-relaxed text-zinc-100">
                      📍 {selectedPartner.address}
                    </p>
                  </div>

                </div>

                {/* Switch Login Trigger for Sandbox testing */}
                {onSwitchUser && (
                  <div className="pt-2.5 border-t border-zinc-800/80 flex gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => onSwitchUser(selectedPartner.phone)}
                      className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-850 text-white rounded-xl font-bold uppercase text-[9px] tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-1 leading-none"
                    >
                      <Locate className="w-3.5 h-3.5" /> Switch Profile & Settle Trade
                    </button>
                    <a
                      href={`tel:${selectedPartner.phone}`}
                      className="px-3.5 py-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100 transition flex items-center justify-center"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                )}

              </div>
            )}

            {/* General Empty Canvas relocate instructions */}
            {!selectedPartner && (
              <div className="absolute bottom-4 left-4 right-4 md:left-6 md:right-auto md:w-[350px] bg-zinc-950/90 text-white border border-zinc-800 rounded-2xl py-3.5 px-4 shadow-xl text-[10.5px] leading-relaxed font-semibold italic flex items-center gap-2 select-none backdrop-blur-sm pointer-events-none">
                <Crosshair className="w-4 h-4 text-emerald-500 shrink-0" /> Click on any coordinate pin marker to start live distance and navigation.
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

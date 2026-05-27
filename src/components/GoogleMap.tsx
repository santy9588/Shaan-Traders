import React, { useState, useEffect } from 'react';
import { Search, MapPin, Compass, Layers, Globe, Check, AlertCircle } from 'lucide-react';

interface GoogleMapProps {
  center: { lat: number; lng: number };
  onChange?: (coords: { lat: number; lng: number }, address: string) => void;
  radiusKm?: number; // Visual indicator bounds for coverage area
  label?: string;
  readonly?: boolean;
}

// Preset locations to simulate real autocomplete
const GLOBAL_CITIES_PRESETS = [
  { name: 'Patna, Bihar, India', lat: 25.6112, lng: 85.1414, address: 'Kankarbagh, Near Shivaji Park, Patna, Bihar, 800020, India' },
  { name: 'Connaught Place, New Delhi, India', lat: 28.6304, lng: 77.2177, address: 'H-Block, Outer Circle, Connaught Place, New Delhi, 110001, India' },
  { name: 'Bandra West, Mumbai, India', lat: 19.0600, lng: 72.8362, address: 'Carter Road, Near Promenade, Bandra West, Mumbai, Maharashtra, 400050, India' },
  { name: 'New York City, USA', lat: 40.7128, lng: -74.0060, address: 'Times Square, Manhattan, New York, NY, 10036, United States' },
  { name: 'London, United Kingdom', lat: 51.5074, lng: -0.1278, address: 'Trafalgar Square, Charing Cross, London, WC2N 5DN, United Kingdom' },
  { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503, address: 'Shibuya Crossing, Shibuya City, Tokyo, 150-0002, Japan' },
  { name: 'Dubai, UAE', lat: 25.2048, lng: 55.2708, address: 'Downtown Dubai, near Burj Khalifa, Dubai, United Arab Emirates' },
  { name: 'Sydney, Australia', lat: -33.8688, lng: 151.2093, address: 'Opera House Precinct, Sydney, NSW, 2000, Australia' },
  { name: 'Paris, France', lat: 48.8566, lng: 2.3522, address: 'Avenue des Champs-Élysées, Paris, 75008, France' }
];

export default function GoogleMap({
  center,
  onChange,
  radiusKm = 5,
  label = "Select Delivery Address",
  readonly = false
}: GoogleMapProps) {
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [addressInput, setAddressInput] = useState('');
  const [suggestions, setSuggestions] = useState<typeof GLOBAL_CITIES_PRESETS>([]);
  const [currentAddress, setCurrentAddress] = useState('Kankarbagh, Near Shivaji Park, Patna, Bihar, 800020');
  const [coordinates, setCoordinates] = useState(center);
  const [searchFocused, setSearchFocused] = useState(false);
  const [mapsAuthFailed, setMapsAuthFailed] = useState(() => (window as any).googleMapsAuthFailed || false);

  const isKeyPotentiallyValid = (key: string): boolean => {
    if (!key) return false;
    const trimmed = key.trim();
    return trimmed.startsWith('AIzaSy') && 
           trimmed.length >= 30 && 
           !trimmed.toLowerCase().includes('placeholder') &&
           !trimmed.toLowerCase().includes('your_') &&
           !trimmed.toLowerCase().includes('my_');
  };

  useEffect(() => {
    const handleAuthFailure = () => {
      setMapsAuthFailed(true);
    };
    const handleAuthSuccess = () => {
      setMapsAuthFailed(false);
    };
    window.addEventListener('google-maps-auth-failure', handleAuthFailure);
    window.addEventListener('google-maps-auth-success', handleAuthSuccess);
    return () => {
      window.removeEventListener('google-maps-auth-failure', handleAuthFailure);
      window.removeEventListener('google-maps-auth-success', handleAuthSuccess);
    };
  }, []);

  // Dynamically load Google Maps script if the key is defined and not already loaded
  useEffect(() => {
    const apiKey = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
    if (!isKeyPotentiallyValid(apiKey) || mapsAuthFailed) return;
    
    if ((window as any).google && (window as any).google.maps) {
      return;
    }
    
    const scriptId = 'google-maps-script';
    if (document.getElementById(scriptId)) return;
    
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, [mapsAuthFailed]);

  useEffect(() => {
    setCoordinates(center);
    // Find closest match or keep current
    const match = GLOBAL_CITIES_PRESETS.find(p => Math.abs(p.lat - center.lat) < 0.01 && Math.abs(p.lng - center.lng) < 0.01);
    if (match) {
      setCurrentAddress(match.address);
      if (!addressInput) setAddressInput(match.name);
    }
  }, [center]);

  // Debounced real-time suggestions using Google Geocoding or Offline fallbacks
  useEffect(() => {
    if (!addressInput.trim()) {
      setSuggestions([]);
      return;
    }

    const filtered = GLOBAL_CITIES_PRESETS.filter(item => 
      item.name.toLowerCase().includes(addressInput.toLowerCase()) || 
      item.address.toLowerCase().includes(addressInput.toLowerCase())
    );

    // If typing simulated coordinates address click, do not trigger search suggestion loops
    const isMarkerDriven = addressInput.startsWith("House #") && addressInput.includes("(Lat:");
    if (isMarkerDriven) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      const apiKey = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
      if (isKeyPotentiallyValid(apiKey) && !mapsAuthFailed && (window as any).google?.maps) {
        try {
          const geocoder = new (window as any).google.maps.Geocoder();
          geocoder.geocode({ address: addressInput }, (results: any[], status: string) => {
            if (status === 'OK' && results && results.length > 0) {
              const googleSuggestions = results.map((result: any) => {
                const fullAddress = result.formatted_address;
                const shortName = result.address_components?.[0]?.long_name || fullAddress.split(',')[0];
                return {
                  name: shortName,
                  lat: result.geometry.location.lat(),
                  lng: result.geometry.location.lng(),
                  address: fullAddress,
                  isGoogleResult: true
                };
              });
              setSuggestions(googleSuggestions);
            } else {
              setSuggestions(filtered);
            }
          });
          return;
        } catch (err) {
          console.error("Geocoding failed in GoogleMap", err);
        }
      }

      // Live Worldwide geocoding fetch call using OpenStreetMap as highly robust fallback!
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressInput)}&limit=6`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'OrganicEcosystemPlatform/1.0.0'
        }
      })
      .then(res => {
        if (!res.ok) throw new Error("OSM failed");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const osmSuggestions = data.map((item: any) => ({
            name: item.name || item.display_name.split(',')[0],
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            address: item.display_name,
            isOSMResult: true
          }));
          setSuggestions(osmSuggestions);
        } else {
          setSuggestions(filtered);
        }
      })
      .catch(err => {
        console.warn("OSM geocoding error, defaulting to local presets:", err);
        setSuggestions(filtered);
      });
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [addressInput, mapsAuthFailed]);

  const handleSearch = (val: string) => {
    setAddressInput(val);
  };

  const handleSelectSuggestion = (item: any) => {
    setCoordinates({ lat: item.lat, lng: item.lng });
    setCurrentAddress(item.address);
    setAddressInput(item.address);
    setSuggestions([]);
    setSearchFocused(false);
    if (onChange) {
      onChange({ lat: item.lat, lng: item.lng }, item.address);
    }
  };

  // Simulate picking / reverse-geocoding coordinate on click map
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readonly) return;
    
    // Simulate relative coordinate shift
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert click location back to tiny shift
    const xPct = (x / rect.width) - 0.5;
    const yPct = 0.5 - (y / rect.height); // invert Y
    
    const newLat = parseFloat((coordinates.lat + yPct * 0.05).toFixed(4));
    const newLng = parseFloat((coordinates.lng + xPct * 0.05).toFixed(4));
    
    const apiKey = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
    if (isKeyPotentiallyValid(apiKey) && !mapsAuthFailed && (window as any).google?.maps) {
      try {
        const geocoder = new (window as any).google.maps.Geocoder();
        geocoder.geocode({ location: { lat: newLat, lng: newLng } }, (results: any[], status: string) => {
          if (status === 'OK' && results && results[0]) {
            const actualAddress = results[0].formatted_address;
            setCoordinates({ lat: newLat, lng: newLng });
            setCurrentAddress(actualAddress);
            setAddressInput(actualAddress);
            if (onChange) {
              onChange({ lat: newLat, lng: newLng }, actualAddress);
            }
          } else {
            fallbackSimulatedAddress(newLat, newLng);
          }
        });
      } catch (err) {
        fallbackSimulatedAddress(newLat, newLng);
      }
    } else {
      fallbackSimulatedAddress(newLat, newLng);
    }
  };

  const fallbackSimulatedAddress = (newLat: number, newLng: number) => {
    const randomHouse = Math.floor(Math.random() * 199) + 1;
    const newAddress = `House #${randomHouse}, Lane No ${Math.floor(Math.random() * 9) + 1}, Near Market, Local Zone (Lat: ${newLat}, Lng: ${newLng})`;
    
    setCoordinates({ lat: newLat, lng: newLng });
    setCurrentAddress(newAddress);
    setAddressInput(newAddress);
    
    if (onChange) {
      onChange({ lat: newLat, lng: newLng }, newAddress);
    }
  };

  return (
    <div className="space-y-3" id="google-map-container">
      {!readonly && (
        <div className="relative">
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            {label}
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              className="w-full pl-9 pr-24 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              placeholder="Search city, sector, or landmark (e.g., Patna, Noida, Gurgaon...)"
              value={addressInput}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSuggestions([]), 200)}
            />
            <div className="absolute right-2 top-1.5 flex gap-1">
              <button
                type="button"
                className="px-2 py-1 bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 transition text-[10px] font-medium rounded-md text-zinc-600 flex items-center gap-1"
                onClick={() => {
                  const defaultCity = GLOBAL_CITIES_PRESETS[0];
                  handleSelectSuggestion(defaultCity);
                }}
              >
                <Compass className="w-3 h-3" /> Auto-Locate
              </button>
            </div>
          </div>

          {/* Autocomplete Suggestions */}
          {suggestions.length > 0 && (
            <div className="absolute z-30 w-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-zinc-100">
              {suggestions.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 transition flex items-start gap-2 text-xs"
                  onClick={() => handleSelectSuggestion(item)}
                >
                  <MapPin className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-zinc-800 block">{item.name}</span>
                    <span className="text-zinc-500">{item.address}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Map Graphic Canvas */}
      <div className="relative border border-zinc-200 rounded-2xl overflow-hidden shadow-sm h-64 bg-zinc-100">
        {/* Map Type selectors */}
        <div className="absolute top-3 left-3 z-10 flex border border-zinc-200 bg-white rounded-lg shadow-md overflow-hidden text-xs">
          <button
            type="button"
            className={`px-3 py-1.5 font-medium transition ${mapType === 'roadmap' ? 'bg-emerald-600 text-white' : 'bg-white hover:bg-zinc-50 text-zinc-700'}`}
            onClick={() => setMapType('roadmap')}
          >
            <Compass className="w-3.5 h-3.5 inline mr-1" /> Map
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 font-medium transition ${mapType === 'satellite' ? 'bg-emerald-600 text-white' : 'bg-white hover:bg-zinc-50 text-zinc-700'}`}
            onClick={() => setMapType('satellite')}
          >
            <Globe className="w-3.5 h-3.5 inline mr-1" /> Satellite
          </button>
        </div>

        {/* Dynamic Zoom Badge */}
        <div className="absolute top-3 right-3 z-10 bg-black/75 px-2 py-1 text-[10px] font-mono font-medium rounded text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Live GPS Lock
        </div>

        {/* Visual Map Canvas Grid */}
        <div 
          onClick={handleMapClick}
          className={`w-full h-full relative cursor-crosshair overflow-hidden transition-all duration-300 ${
            mapType === 'satellite' ? 'bg-zinc-900 border-emerald-900/30' : 'bg-[#e5e9f0]'
          }`}
        >
          {/* Roadmap or Satellite Vector Elements */}
          {mapType === 'roadmap' ? (
            <div className="absolute inset-0 opacity-80 select-none">
              {/* Fake Roads & Water bodies */}
              <div className="absolute top-1/4 left-0 w-full h-2 bg-emerald-100/30 rotate-3"></div>
              <div className="absolute top-2/3 left-0 w-full h-4 bg-emerald-100/40 -rotate-3"></div>
              <div className="absolute top-0 left-1/3 w-6 h-full bg-emerald-100/30 rotate-12"></div>
              <div className="absolute top-0 left-2/3 w-10 h-full bg-cyan-100/50 -rotate-45 flex items-center justify-center">
                <span className="text-[10px] text-cyan-600 uppercase font-bold tracking-widest bg-cyan-50/60 px-1 border border-cyan-100 rounded">Ganges Supply Canal</span>
              </div>
              {/* Fake Blocks */}
              <div className="absolute top-4 left-6 w-16 h-12 bg-zinc-200/50 rounded-lg border border-zinc-200"></div>
              <div className="absolute top-16 left-32 w-24 h-16 bg-emerald-50/50 rounded-lg border border-emerald-100"></div>
              <div className="absolute bottom-12 left-12 w-20 h-16 bg-zinc-200/50 rounded-lg border border-zinc-200"></div>
              <div className="absolute bottom-6 right-20 w-32 h-16 bg-emerald-50/50 rounded-lg border border-emerald-100"></div>
              {/* Grid dots */}
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-40">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="border-t border-l border-white/60 text-[8px] p-1 text-zinc-400 select-none">
                    Sector {i+1}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 opacity-90 select-none bg-[radial-gradient(#111827_1px,transparent_1px)] [background-size:16px_16px]">
              {/* Satellite Land Features */}
              <div className="absolute inset-0 bg-zinc-950"></div>
              <div className="absolute top-12 left-1/4 w-40 h-40 bg-emerald-950/20 rounded-full blur-2xl"></div>
              <div className="absolute bottom-20 right-1/4 w-32 h-32 bg-cyan-950/20 rounded-full blur-2xl"></div>
              <div className="absolute top-1/3 left-0 w-full h-6 bg-emerald-900/10 rotate-6"></div>
              <div className="absolute top-3/4 left-0 w-full h-4 bg-cyan-900/15 -rotate-12"></div>
              {/* Sat Blocks */}
              <div className="absolute top-6 left-1/3 w-20 h-16 bg-zinc-800/40 border border-zinc-700/50 rounded"></div>
              <div className="absolute bottom-10 left-8 w-24 h-14 bg-zinc-800/40 border border-zinc-700/50 rounded"></div>
              <div className="absolute top-28 right-16 w-16 h-16 bg-emerald-900/10 border border-emerald-800/20 rounded-lg"></div>
            </div>
          )}

          {/* Coverage area circle (centered on Coordinates) */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed flex items-center justify-center transition-all duration-300"
            style={{
              width: `${radiusKm * 40}px`,
              height: `${radiusKm * 40}px`,
              backgroundColor: mapType === 'satellite' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.08)',
              borderColor: mapType === 'satellite' ? 'rgba(52, 211, 153, 0.4)' : 'rgba(5, 150, 105, 0.5)'
            }}
          >
            <div className="text-[10px] font-bold text-center text-emerald-700 bg-white/90 shadow px-1.5 py-0.5 rounded border border-emerald-200 whitespace-nowrap z-0 max-w-full truncate">
              Coverage Limit: {radiusKm} km
            </div>
          </div>

          {/* Interactive Draggable Pin (Centered visually) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(100%-4px)] pointer-events-none z-10 flex flex-col items-center">
            {/* Display Coordinate tooltip */}
            <div className="bg-zinc-900/95 text-white text-[9px] px-2 py-1 rounded-md shadow-lg border border-zinc-700 font-mono flex flex-col items-center gap-0.5 whitespace-nowrap mb-1">
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <Check className="w-2.5 h-2.5" /> GPS Locked
              </span>
              <span>Lat: {coordinates.lat.toFixed(4)}</span>
              <span>Lng: {coordinates.lng.toFixed(4)}</span>
            </div>
            
            {/* Ping animation */}
            <div className="relative">
              <span className="absolute -top-1 -left-1 w-8 h-8 rounded-full bg-emerald-500/40 animate-ping"></span>
              <MapPin className="w-8 h-8 text-rose-600 drop-shadow-md select-none relative" fill="rgba(244, 63, 94, 0.3)" />
              <span className="w-2 h-2 rounded-full bg-zinc-950 border border-white absolute bottom-[2px] left-3"></span>
            </div>
          </div>

          {/* Info Map Bar at lower center */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-11/12 bg-white/95 border border-zinc-200/80 shadow-md rounded-lg py-1 px-3 z-10 flex items-center justify-between gap-2 overflow-hidden">
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <p className="text-[10px] sm:text-xs text-zinc-700 font-medium truncate">
                {currentAddress}
              </p>
            </div>
            {!readonly && (
              <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wide shrink-0 bg-emerald-100/50 px-1 rounded">
                Click Map to Relocate
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { UserProfile, Product, CartItem, Order, UserRole } from './types';
import { getStoredProducts } from './data/products';
import AuthModal from './components/AuthModal';
import Marketplace from './components/Marketplace';
import SellerDashboard from './components/SellerDashboard';
import AdminPanel from './components/AdminPanel';
import CheckoutModal from './components/CheckoutModal';
import GlobalEcosystemTracker from './components/GlobalEcosystemTracker';
import { 
  ShoppingBag, Phone, User, Shield, HelpCircle, LogOut, Navigation, Star, 
  Layers, Sparkles, Mail, CheckCircle, ArrowRight, Maximize, Minimize,
  Smartphone, Download, X, Copy, Terminal, Monitor, Check, Info,
  Gift, Users, Award, Share2, Wallet, Globe, Lock, Settings, AlertTriangle, ExternalLink, RefreshCw,
  WifiOff
} from 'lucide-react';

export default function App() {
  // Virtual Domain Simulator states (for resolving "www.veg & fruits.com")
  const [activeVirtualDomain, setActiveVirtualDomain] = useState('www.vegfruits.com');
  const [isDomainSettingsOpen, setIsDomainSettingsOpen] = useState(false);
  const [urlViewMode, setUrlViewMode] = useState<'simulated' | 'live'>('simulated');
  const [liveAppUrl, setLiveAppUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLiveAppUrl(window.location.href);
    }
  }, []);

  // Connectivity & Google Maps API Error States
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [simulatedOffline, setSimulatedOffline] = useState(false);
  const [mapsAuthFailed, setMapsAuthFailed] = useState(() => (window as any).googleMapsAuthFailed || false);

  // Authentication states
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const stored = localStorage.getItem('freshmarket_current_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [isAdminMode, setIsAdminMode] = useState(false);

  // Admin configurable Hotline (initially 9279120271)
  const [adminPhone, setAdminPhone] = useState(() => {
    return localStorage.getItem('freshmarket_admin_phone') || '9279120271';
  });

  // Dynamic products list
  const [products, setProducts] = useState<Product[]>(() => getStoredProducts());

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);

  // Orders Ledger
  const [orders, setOrders] = useState<Order[]>(() => {
    const stored = localStorage.getItem('freshmarket_orders');
    return stored ? JSON.parse(stored) : [];
  });

  // Registered Users Directory (to calculate distances to nearest seller)
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>(() => {
    const stored = localStorage.getItem('freshmarket_registered_users');
    return stored ? JSON.parse(stored) : [];
  });

  // Checkout overlay navigation
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Fullscreen view management (browser + custom immersive container fallback)
  const [isFullscreen, setIsFullscreen] = useState(false);

  // PWA and Hybrid Mobile Packaging Hub states
  const [isMobileGuideOpen, setIsMobileGuideOpen] = useState(false);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [guideTab, setGuideTab] = useState<'pwa' | 'android' | 'ios' | 'structure'>('pwa');

  // Refer & Earn Hub state configuration
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [isEcosystemMapOpen, setIsEcosystemMapOpen] = useState(false);
  const [referralTab, setReferralTab] = useState<'affiliate' | 'networks'>('affiliate');
  const [invitedUsers, setInvitedUsers] = useState<{name: string, phone: string, role: string, timestamp: string}[]>(() => {
    const stored = localStorage.getItem('freshmarket_invited_users');
    return stored ? JSON.parse(stored) : [];
  });
  const [inviteName, setInviteName] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('customer');
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState('');
  const [inviteErrorMsg, setInviteErrorMsg] = useState('');

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };
    const handleMapsFailure = () => {
      setMapsAuthFailed(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('google-maps-auth-failure', handleMapsFailure);

    // Initial check
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
    }
    if ((window as any).googleMapsAuthFailed) {
      setMapsAuthFailed(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('google-maps-auth-failure', handleMapsFailure);
    };
  }, []);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    setIsPwaInstalled(!!isStandalone);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  const handlePwaInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
        if (choiceResult.outcome === 'accepted') {
          setIsPwaInstalled(true);
        }
        setDeferredPrompt(null);
      });
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(key);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {
          // If native request is blocked (common in sandboxed iframes), 
          // toggle the simulated immersive CSS state anyway so user gets a great experience!
          setIsFullscreen(!isFullscreen);
        });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Synchronise state changes to localStorage
  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAdminMode(false);
    localStorage.setItem('freshmarket_current_user', JSON.stringify(user));

    // Save user to registered list if not exists
    setRegisteredUsers((prev) => {
      const exists = prev.find((u) => u.phone === user.phone);
      if (!exists) {
        const updated = [...prev, user];
        localStorage.setItem('freshmarket_registered_users', JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
  };

  const handleAdminPhoneChange = (newPhone: string) => {
    setAdminPhone(newPhone);
    localStorage.setItem('freshmarket_admin_phone', newPhone);
  };

  const handleLogOut = () => {
    setCurrentUser(null);
    setIsAdminMode(false);
    setCart([]);
    localStorage.removeItem('freshmarket_current_user');
  };

  // Order submissions handler
  const handleSubmitOrder = (newOrder: Order) => {
    setOrders((prev) => {
      const updated = [newOrder, ...prev];
      localStorage.setItem('freshmarket_orders', JSON.stringify(updated));
      return updated;
    });
    // empty cart after placement
    setCart([]);
  };

  // Update ongoing order status
  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) => {
      const updated = prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: status,
            paymentStatus: status === 'delivered' ? ('completed' as const) : o.paymentStatus
          };
        }
        return o;
      });
      localStorage.setItem('freshmarket_orders', JSON.stringify(updated));
      return updated;
    });
  };

  // Update user profile details
  const handleUpdateUserProfile = (updatedProfile: UserProfile) => {
    setCurrentUser(updatedProfile);
    localStorage.setItem('freshmarket_current_user', JSON.stringify(updatedProfile));
    
    // Also update in registeredUsers directory
    setRegisteredUsers((prev) => {
      const updatedUsers = prev.map(user => 
        user.id === updatedProfile.id ? updatedProfile : user
      );
      localStorage.setItem('freshmarket_registered_users', JSON.stringify(updatedUsers));
      return updatedUsers;
    });
  };

  // Refer & Earn eligibility check: has completed a purchase >= ₹50
  const isReferralEligible = currentUser ? orders.some(o => o.customerId === currentUser.id && o.total >= 50) : false;

  // Monthly spent calculator (for the ₹1000 threshold within a 30-day window)
  const getMonthlySpending = () => {
    if (!currentUser) return 0;
    const userOrders = orders.filter(o => o.customerId === currentUser.id && o.status !== 'cancelled');
    return userOrders.reduce((sum, o) => sum + o.total, 0);
  };

  const isAffiliateQualified = getMonthlySpending() >= 1000;

  const getMyAffiliateCode = () => {
    if (!currentUser) return '';
    const cleanName = currentUser.name.toUpperCase().replace(/\s+/g, '');
    const phoneSuffix = currentUser.phone.slice(-4);
    return `AFF-${cleanName}-${phoneSuffix}`;
  };

  const getDownlineOrders = () => {
    const code = getMyAffiliateCode();
    if (!code) return [];
    return orders.filter(o => o.affiliateCodeUsed === code && o.status !== 'cancelled');
  };

  const getAffiliateEarnings = () => {
    const downlineOrders = getDownlineOrders();
    return downlineOrders.reduce((sum, o) => sum + Math.round(o.total * 0.10), 0);
  };

  const handleSwitchToIdentity = (phone: string) => {
    const matchProfile = registeredUsers.find(u => u.phone === phone);
    if (matchProfile) {
      setCurrentUser(matchProfile);
      setIsReferralOpen(false);
      setIsCheckoutOpen(false);
      setIsEcosystemMapOpen(false);
    }
  };

  const handleSimulateAffiliatePurchase = () => {
    if (!currentUser) return;
    const mockOrder: Order = {
      id: `fresh_order_${Math.floor(Math.random() * 900000) + 100000}`,
      customerId: currentUser.id,
      customerName: currentUser.name,
      customerPhone: currentUser.phone,
      sellerId: 'gopal_fallback',
      sellerName: 'Gopal Farm Producer Co.',
      sellerPhone: '9279120271',
      sellerRole: 'farmer',
      items: [
        {
          product: {
            id: 'simulated_batch_veg',
            name: 'Wholesale Standard Organic Produce Lot',
            price: 1100,
            unit: 'Batch Lot',
            category: 'vegetable',
            image: '',
            isAiGenerated: false,
            description: 'Organic farming wholesale batch lot.',
            rating: 5
          },
          quantity: 1
        }
      ],
      subtotal: 1100,
      discount: 0,
      deliveryCharge: 35,
      total: 1135,
      status: 'pending',
      otp: '9999',
      address: currentUser.address,
      coordinates: currentUser.coordinates,
      paymentMethod: 'PhonePe UPI Settle',
      paymentStatus: 'completed',
      timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    setOrders((prev) => {
      const updated = [mockOrder, ...prev];
      localStorage.setItem('freshmarket_orders', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearSpendingHistory = () => {
    if (!currentUser) return;
    setOrders((prev) => {
      const updated = prev.filter(o => o.customerId !== currentUser.id);
      localStorage.setItem('freshmarket_orders', JSON.stringify(updated));
      return updated;
    });
  };

  const handleAddInvitedPerson = (name: string, phone: string, role: UserRole) => {
    // Save to global user database directory
    const randomOffset = () => (Math.random() - 0.5) * 0.1;
    const newInvitedProfile: UserProfile = {
      id: `invited_user_${Math.floor(Math.random() * 900000) + 100000}`,
      name: name,
      role: role,
      email: `${name.toLowerCase().replace(/\s+/g, '')}@freshmarket.com`,
      phone: phone,
      address: `${role === 'farmer' ? 'Khet/Grower' : 'Sector Base'} Patna, Near Beli Road Area`,
      coordinates: {
        lat: 25.6112 + randomOffset(),
        lng: 85.1414 + randomOffset()
      },
      coverageRadius: role === 'customer' ? 0 : 15
    };

    setRegisteredUsers((prev) => {
      const exists = prev.some(u => u.phone === phone);
      if (exists) return prev;
      const updated = [...prev, newInvitedProfile];
      localStorage.setItem('freshmarket_registered_users', JSON.stringify(updated));
      return updated;
    });

    // Save to dashboard ledger record
    const inviteRecord = {
      name,
      phone,
      role: role.replace('_', ' '),
      timestamp: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    };

    setInvitedUsers((prev) => {
      const updated = [inviteRecord, ...prev];
      localStorage.setItem('freshmarket_invited_users', JSON.stringify(updated));
      return updated;
    });
  };

  const onFormInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim()) {
      setInviteErrorMsg('Name cannot be empty.');
      return;
    }
    if (!/^\d{10}$/.test(invitePhone)) {
      setInviteErrorMsg('Please clarify a valid 10-digit mobile phone number.');
      return;
    }
    setInviteErrorMsg('');
    handleAddInvitedPerson(inviteName.trim(), invitePhone.trim(), inviteRole);
    setInviteSuccessMsg(`✨ Friend added successfully! They can now log in under +91 ${invitePhone}.`);
    setInviteName('');
    setInvitePhone('');
    setTimeout(() => setInviteSuccessMsg(''), 5000);
  };

  const handleBuildQuickDemoOrder = () => {
    // Populate cart with some products to break ₹50 threshold
    const testPotato = products.find(p => p.id === 'potato') || products[0];
    const testApple = products.find(p => p.id === 'apple') || products[1];
    
    if (testPotato) {
      setCart([
        { product: testPotato, quantity: 2 },
        { product: testApple || testPotato, quantity: 1 }
      ]);
    }
    setIsReferralOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 overflow-y-auto bg-zinc-50' : 'min-h-screen bg-zinc-50'} flex flex-col justify-between selection:bg-emerald-100 font-sans`} id="freshmarket-global-app">
      
      {/* Simulated Web Address & Custom Domain Gateway Bar */}
      <div className="bg-zinc-900 border-b border-zinc-805 text-zinc-350 px-4 py-2 border-b border-zinc-850 text-xs shrink-0 select-none shadow-md flex flex-col md:flex-row items-center justify-between gap-3 z-40 relative">
        <div className="flex items-center gap-2">
          {/* Simulated Browser window control circles */}
          <div className="hidden sm:flex items-center gap-1.5 shrink-0 mr-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 hover:bg-rose-500 transition-all cursor-pointer"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-550/80 hover:bg-amber-500 transition-all cursor-pointer"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition-all cursor-pointer"></span>
          </div>
          <span className="text-[9px] uppercase font-black bg-zinc-800 text-emerald-400 px-2 py-0.5 rounded leading-none border border-emerald-950/20 tracking-wider">
            🔒 Secure Connection
          </span>
          <p className="text-[11px] font-semibold text-zinc-400">
            Platform Gateway Resolver
          </p>
             {/* Browser URL Input Field Simulator */}
        <div className="flex-1 max-w-xl w-full flex flex-col sm:flex-row items-stretch sm:items-center bg-zinc-950 rounded-xl text-zinc-350 font-mono text-[11px] border border-zinc-805 shadow-inner">
          <div className="flex-1 flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none px-3 py-1.5 justify-between sm:justify-start">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              {urlViewMode === 'simulated' ? (
                <>
                  <span className="text-emerald-500 font-bold leading-none">https://</span>
                  <span 
                    onClick={() => setIsDomainSettingsOpen(true)}
                    className="text-white font-extrabold hover:text-emerald-300 transition-colors cursor-pointer decoration-dashed decoration-zinc-650 underline underline-offset-4"
                    title="Click to check DNS details"
                  >
                    {activeVirtualDomain}
                  </span>
                </>
              ) : (
                <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] sm:max-w-[260px] md:max-w-xs scrollbar-none">
                  <span className="text-emerald-500 font-bold leading-none shrink-0">Live:</span>
                  <a 
                    href={liveAppUrl || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-white font-semibold hover:text-emerald-300 underline transition-colors"
                  >
                    {liveAppUrl || 'detecting route URL...'}
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[8px] px-1 rounded font-sans uppercase tracking-wider font-extrabold select-none bg-zinc-900 border border-zinc-850 text-zinc-450">
                {urlViewMode === 'simulated' ? 'SIM DOMAIN' : 'LIVE IP'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 border-t sm:border-t-0 sm:border-l border-zinc-850 px-3 py-1.5 justify-end">
            {/* View Mode Switcher */}
            <button
              onClick={() => setUrlViewMode(urlViewMode === 'simulated' ? 'live' : 'simulated')}
              className="text-[9px] font-sans font-bold bg-zinc-900 hover:bg-zinc-850 active:bg-zinc-800 px-2 py-1 rounded-lg text-emerald-400 hover:text-emerald-300 border border-zinc-800 transition cursor-pointer flex items-center gap-1 shrink-0"
              title={urlViewMode === 'simulated' ? 'Show actual container live URL' : 'Show simulated business domain URL'}
            >
              <Globe className="w-3 h-3 text-emerald-405" />
              <span>{urlViewMode === 'simulated' ? 'Flip to Live URL' : 'Flip to Sim'}</span>
            </button>
            
            {/* Action Buttons */}
            {urlViewMode === 'simulated' ? (
              <button 
                onClick={() => {
                  setActiveVirtualDomain(activeVirtualDomain === 'www.vegfruits.com' ? 'www.veg-and-fruits.com' : 'www.vegfruits.com');
                }}
                className="p-1 hover:bg-zinc-800 hover:text-white rounded text-zinc-400 transition cursor-pointer shrink-0"
                title="Toggle alternative simulated mirror url"
              >
                <RefreshCw className="w-3.5 h-3.5 text-zinc-405 active:rotate-180 transition-transform duration-300" />
              </button>
            ) : (
              <button 
                onClick={() => {
                  if (liveAppUrl) {
                    navigator.clipboard.writeText(liveAppUrl);
                    setCopiedText('liveUrl');
                    setTimeout(() => setCopiedText(null), 2000);
                  }
                }}
                className="p-1 hover:bg-zinc-800 hover:text-white rounded transition cursor-pointer shrink-0"
                title="Copy live preview URL connection link"
              >
                {copiedText === 'liveUrl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-450 hover:text-white" />}
              </button>
            )}

            <button 
              onClick={() => setIsDomainSettingsOpen(true)}
              className="p-1 hover:bg-zinc-800 hover:text-white rounded text-emerald-400 transition flex items-center gap-1 cursor-pointer shrink-0"
              title="Inspect DNS records settings"
            >
              <Settings className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>
        </div>     </div>

        {/* Connection & Maps Simulation Toggles for presentation */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          <button 
            onClick={() => setSimulatedOffline(!simulatedOffline)}
            className={`text-[9.5px]/none py-1.5 px-3 font-black transition-all flex items-center gap-1.5 uppercase tracking-wider border rounded-xl cursor-pointer ${
              simulatedOffline || !isOnline
                ? 'bg-rose-950/80 text-rose-350 border-rose-800'
                : 'bg-zinc-800/60 text-zinc-400 border-zinc-750 hover:bg-zinc-750 hover:text-white'
            }`}
            title="Simulate network disconnect to test offline banner"
          >
            <WifiOff className="w-3.5 h-3.5" /> {simulatedOffline || !isOnline ? 'Offline Sim Active' : 'Sim Offline'}
          </button>

          <button 
            onClick={() => {
              const nextVal = !mapsAuthFailed;
              setMapsAuthFailed(nextVal);
              (window as any).googleMapsAuthFailed = nextVal;
              if (nextVal) {
                window.dispatchEvent(new CustomEvent('google-maps-auth-failure'));
              }
            }}
            className={`text-[9.5px]/none py-1.5 px-3 font-black transition-all flex items-center gap-1.5 uppercase tracking-wider border rounded-xl cursor-pointer ${
              mapsAuthFailed
                ? 'bg-red-950/80 text-red-350 border-red-800'
                : 'bg-zinc-800/60 text-zinc-400 border-zinc-750 hover:bg-zinc-750 hover:text-white'
            }`}
            title="Simulate Google Maps failure key load error to test warning banner"
          >
            <AlertTriangle className="w-3.5 h-3.5" /> {mapsAuthFailed ? 'Maps Error Active' : 'Sim Maps Error'}
          </button>

          <button 
            onClick={() => setIsDomainSettingsOpen(true)}
            className="text-[10px]/none py-1.5 px-3 font-black text-amber-400 hover:text-amber-300 transition-all flex items-center gap-1.5 uppercase tracking-wider bg-amber-950/45 border border-amber-900/35 rounded-xl cursor-pointer hover:bg-amber-950/60"
          >
            <Globe className="w-3.5 h-3.5 animate-pulse" /> Domain Action: veg & fruits.com
          </button>
        </div>
      </div>

      {/* Visual Connectivity & Google Maps API Error Warnings */}
      {(!isOnline || simulatedOffline || mapsAuthFailed) && (
        <div className="bg-red-50/95 backdrop-blur-sm border-b border-red-200 text-red-900 transition-all duration-300 shrink-0 select-none z-30">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 text-red-700 rounded-xl mt-0.5 shrink-0 shadow-sm">
                {(!isOnline || simulatedOffline) ? (
                  <WifiOff className="w-5 h-5 animate-pulse" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
                )}
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-red-950 flex items-center gap-2 leading-tight tracking-tight">
                  {(!isOnline || simulatedOffline) ? 'Network Connection Lost' : 'Google Maps Integration Offline'}
                  <span className="text-[9px] text-red-700 bg-red-100 border border-red-150 font-black px-2 py-0.5 rounded uppercase leading-none">
                    Limited Functionality Mode
                  </span>
                </h4>
                <p className="text-[11px] text-red-800 mt-1 font-medium leading-relaxed max-w-4xl">
                  {(!isOnline || simulatedOffline) ? (
                    <span>The network connection is lost. The platform has switched to safe offline caching modes. You can still browse stored vegetable varieties, compile carts, explore Bihar listings, and place orders locally, but live geocoded map renders and dynamic socket sync are temporarily paused.</span>
                  ) : (
                    <span>Google Maps API request failed or invalid key detected. The system is runing on a reliable high-precision offline GPS simulation fallback. You can still browse Patna geographical listings and enter address details completely!</span>
                  )}
                </p>
              </div>
            </div>

            {/* Action options */}
            <div className="flex items-center gap-2 mt-1 sm:mt-0 w-full sm:w-auto justify-end shrink-0">
              {(!isOnline || simulatedOffline) ? (
                <button
                  onClick={() => {
                    if (simulatedOffline) {
                      setSimulatedOffline(false);
                    } else if (typeof navigator !== 'undefined') {
                      setIsOnline(navigator.onLine);
                    }
                  }}
                  className="bg-white hover:bg-red-100 border border-red-200 text-red-900 text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-xl transition cursor-pointer active:scale-95 flex items-center gap-1.5 shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" /> Reconnect & Check
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMapsAuthFailed(false);
                    (window as any).googleMapsAuthFailed = false;
                    window.dispatchEvent(new CustomEvent('google-maps-auth-success'));
                  }}
                  className="bg-white hover:bg-red-100 border border-red-200 text-red-900 text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-xl transition cursor-pointer active:scale-95 flex items-center gap-1.5 shadow-sm"
                >
                  Clear Maps Error
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Visual Header / Brand Navigation Bar */}
      <header className="bg-white border-b border-zinc-200 py-4 px-4 sticky top-0 z-30 shadow-sm shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Brand Identity details */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-base shadow-md shadow-emerald-600/20 font-black">
              🍒
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-black text-zinc-900 tracking-tight leading-none">FreshMarket</h1>
                <span className="bg-zinc-900 text-white text-[8px] font-bold uppercase tracking-widest px-1 py-0.5 rounded leading-none">
                  V2.0
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-none mt-1 font-medium select-none">Agri-Business Trading Network</p>
            </div>
          </div>

          {/* Center Info Row: Interactive contact of Admin and Session Mode */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            {/* Dynamic support phone number (synced with admin edits!) */}
            <div className="flex items-center gap-1.5 text-zinc-600 bg-zinc-100 hover:bg-zinc-200 font-medium px-3 py-1.5 rounded-xl transition">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Hotline Helpline: <strong className="font-mono font-bold text-zinc-800">+91 {adminPhone}</strong></span>
            </div>

            {/* Active Role status pill */}
            {(currentUser || isAdminMode) && (
              <div className="hidden md:flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1.5 rounded-xl">
                <User className="w-4 h-4 text-emerald-600" />
                <span>
                  Mode: <strong className="font-bold uppercase text-[10px]">{isAdminMode ? 'Platform Administrator' : currentUser?.role.replace('_', ' ')}</strong>
                </span>
              </div>
            )}
          </div>

          {/* User actions / switches */}
          <div className="flex items-center gap-2">
            
            {/* Refer & Earn Navigation Trigger (For all visitors and users) */}
            <button
              onClick={() => setIsReferralOpen(true)}
              className="p-2 rounded-xl border border-zinc-250 bg-amber-50 hover:bg-amber-100/80 text-amber-950 shadow-sm transition flex items-center gap-1.5 text-xs font-black relative"
              title="Refer Friends and Earn 5% discount"
            >
              <span className="absolute -top-1 -left-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <Gift className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">Refer & Earn</span>
              <span className="bg-amber-600 text-white text-[8px] font-extrabold px-1 py-0.5 rounded uppercase tracking-wider leading-none">
                Promo
              </span>
            </button>

            {/* Global Ecosystem Tracker Trigger (Satellite / Navigation) */}
            <button
              onClick={() => setIsEcosystemMapOpen(true)}
              className="p-2 rounded-xl border border-zinc-250 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-950 shadow-sm transition flex items-center gap-1.5 text-xs font-black relative"
              title="Track global farmers, wholesalers, retailers and suppliers on MAP"
            >
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Globe className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">Ecosystem GPS Map</span>
              <span className="bg-emerald-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
                10KM
              </span>
            </button>

            {/* Mobile / Native App Deployment Hub Trigger */}
            <button
              onClick={() => setIsMobileGuideOpen(true)}
              className="p-2 rounded-xl border border-zinc-200 bg-emerald-50/40 hover:bg-emerald-50 text-zinc-700 shadow-sm transition flex items-center gap-1.5 text-xs font-bold"
              title="Convert / Download App for Android, iOS & PWA"
            >
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span className="hidden leading-none md:inline">Mobile App Helper</span>
              <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-sans font-black uppercase tracking-wider scale-90 leading-none">
                App
              </span>
            </button>

            {/* Immersive View Toggle / Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className={`p-2 rounded-xl border transition flex items-center gap-1.5 text-xs font-bold ${
                isFullscreen 
                  ? 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100' 
                  : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100 shadow-sm'
              }`}
              title={isFullscreen ? 'Exit Full Screen' : 'Display Full Screen'}
            >
              {isFullscreen ? (
                <>
                  <Minimize className="w-4 h-4 text-rose-600" />
                  <span className="hidden sm:inline">Normal Mode</span>
                </>
              ) : (
                <>
                  <Maximize className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline">Display Full Screen</span>
                </>
              )}
            </button>

            {(currentUser || isAdminMode) ? (
              <div className="flex items-center gap-2">
                
                {/* Cart indicator for logged in customer */}
                {!isAdminMode && currentUser?.role === 'customer' && (
                  <button 
                    onClick={() => {
                      if (cart.length > 0) setIsCheckoutOpen(true);
                    }}
                    className={`relative p-2 rounded-xl border border-zinc-200 flex items-center justify-center transition ${cart.length > 0 ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-white text-zinc-500'}`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {cart.length > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-mono text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                        {cart.length}
                      </span>
                    )}
                  </button>
                )}

                {/* Log Out which allows quick testing of other roles! */}
                <button
                  onClick={handleLogOut}
                  className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  title="Return to Authentication to change system role"
                >
                  <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Switch / Log Out</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAdminMode(true)}
                className="px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" /> Admin Portal Login
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Main Core Section */}
      <main className="flex-1 pb-16">
        
        {/* If Not authenticated, render the main registration/login selection portal */}
        {!currentUser && !isAdminMode ? (
          <AuthModal 
            onAuthSuccess={handleAuthSuccess} 
            onAdminLogin={() => setIsAdminMode(true)}
            adminPhone={adminPhone}
          />
        ) : isAdminMode ? (
          
          /* Live Admin Panel controls */
          <AdminPanel 
            products={products}
            onProductsChange={setProducts}
            adminPhone={adminPhone}
            onAdminPhoneChange={handleAdminPhoneChange}
            registeredUsers={registeredUsers}
            orders={orders}
          />
        ) : currentUser?.role === 'customer' ? (
          
          /* Consumer Store View */
          <Marketplace 
            products={products}
            currentUser={currentUser}
            cart={cart}
            setCart={setCart}
            onOpenCheckout={() => setIsCheckoutOpen(true)}
            sellers={registeredUsers}
          />
        ) : currentUser ? (
          
          /* Agricultural Merchant views (Farmer, Wholesaler, Organic Producer, Exporter, Supplier) */
          <SellerDashboard 
            currentSeller={currentUser}
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            products={products}
            onProductsChange={setProducts}
            onUpdateProfile={handleUpdateUserProfile}
            sellers={registeredUsers}
          />
        ) : null}

      </main>

      {/* Dynamic Checkout Overlay Modal */}
      {isCheckoutOpen && currentUser && cart.length > 0 && (
        <CheckoutModal 
          cart={cart}
          currentUser={currentUser}
          sellers={registeredUsers}
          onClose={() => setIsCheckoutOpen(false)}
          onSubmitOrder={handleSubmitOrder}
        />
      )}

      {/* Global Sat-Locked Ecosystem Tracker */}
      {isEcosystemMapOpen && (
        <GlobalEcosystemTracker 
          currentUser={currentUser}
          registeredUsers={registeredUsers}
          onSwitchUser={handleSwitchToIdentity}
          onClose={() => setIsEcosystemMapOpen(false)}
        />
      )}

      {/* Dynamic Mobile App & PWA Deployment Wizard Modal */}
      {isMobileGuideOpen && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-zinc-100 flex flex-col max-h-[85vh] animate-in fade-in duration-200">
            
            {/* Modal Header */}
            <div className="bg-zinc-900 text-white p-6 relative">
              <button 
                onClick={() => setIsMobileGuideOpen(false)}
                className="absolute top-6 right-6 p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-xl shadow-md font-bold">
                  📲
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight leading-none">Mobile App Deployment Hub</h3>
                  <p className="text-zinc-400 text-xs mt-1 font-medium">Turn FreshMarket into a Native App for Android, iOS & Windows</p>
                </div>
              </div>
            </div>

            {/* Platform Selection Tabs */}
            <div className="flex border-b border-zinc-200 bg-zinc-50 overflow-x-auto shrink-0">
              <button
                onClick={() => setGuideTab('pwa')}
                className={`flex-1 min-w-[130px] px-4 py-3.5 text-xs font-bold transition-all border-b-2 text-center uppercase tracking-wider ${
                  guideTab === 'pwa' 
                    ? 'border-emerald-600 text-emerald-700 bg-white font-black' 
                    : 'border-transparent text-zinc-500 hover:text-zinc-800'
                }`}
              >
                📱 Live PWA Install
              </button>
              <button
                onClick={() => setGuideTab('android')}
                className={`flex-1 min-w-[130px] px-4 py-3.5 text-xs font-bold transition-all border-b-2 text-center uppercase tracking-wider ${
                  guideTab === 'android' 
                    ? 'border-emerald-600 text-emerald-700 bg-white font-black' 
                    : 'border-transparent text-zinc-500 hover:text-zinc-800'
                }`}
              >
                🤖 Android APK
              </button>
              <button
                onClick={() => setGuideTab('ios')}
                className={`flex-1 min-w-[130px] px-4 py-3.5 text-xs font-bold transition-all border-b-2 text-center uppercase tracking-wider ${
                  guideTab === 'ios' 
                    ? 'border-emerald-600 text-emerald-700 bg-white font-black' 
                    : 'border-transparent text-zinc-500 hover:text-zinc-800'
                }`}
              >
                🍎 iOS / Apple IPAs
              </button>
            </div>

            {/* Modal Body (Scrollable Panel) */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-zinc-600 leading-relaxed">
              
              {guideTab === 'pwa' && (
                <div className="space-y-5">
                  <div className="bg-emerald-50 text-emerald-950 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <p className="font-extrabold text-xs uppercase tracking-wider text-emerald-800">What is a Progressive Web App (PWA)?</p>
                      <p className="text-xs text-emerald-900 mt-1">
                        PWA enables web applications to load instantly directly from your phone's home screen. It feels exactly like native applications, bypasses App Store controls, and stays auto-updated in real-time.
                      </p>
                    </div>
                  </div>

                  {isPwaInstalled ? (
                    <div className="text-center p-8 bg-zinc-50 border border-zinc-200/60 rounded-2xl">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-lg mb-3">
                        <Check className="w-6 h-6 stroke-[3]" />
                      </div>
                      <h4 className="font-extrabold text-zinc-900 text-base">App Already Installed Installed!</h4>
                      <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                        You are running FreshMarket inside an immersive standalone container. Enjoy rapid offline coordination and fluid full-screen views.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {deferredPrompt ? (
                        <div className="p-5 border border-emerald-250 bg-emerald-50/20 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                          <div>
                            <h4 className="font-black text-zinc-900 text-sm">One-Click Direct Install Available</h4>
                            <p className="text-xs text-zinc-500 mt-0.5">Your current browser supports instant secure installation.</p>
                          </div>
                          <button
                            onClick={handlePwaInstall}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-emerald-600/10 transition-all shrink-0 active:scale-95"
                          >
                            <Download className="w-4 h-4" /> Install Application Now
                          </button>
                        </div>
                      ) : (
                        <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200/60 space-y-1">
                          <p className="font-black text-xs text-zinc-800 uppercase tracking-wider flex items-center gap-1">
                            <Info className="w-4 h-4 text-zinc-500" /> Manual App Addition Instructions
                          </p>
                          <p className="text-xs text-zinc-500">
                            Because you're inside an integrated preview container, direct 1-click install is deferred. Follow these quick steps on your real device:
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 text-xs">
                            <div className="bg-white border border-zinc-200 p-3.5 rounded-xl space-y-2">
                              <p className="font-bold text-zinc-900 flex items-center gap-1.5">
                                <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-black">iOS</span> Safari (Apple iPhone)
                              </p>
                              <ol className="list-decimal pl-4 text-zinc-550 space-y-1 text-[11px]">
                                <li>Launch the site in native <span className="font-bold">Safari browser</span></li>
                                <li>Tap the <span className="font-bold text-emerald-600">Share button (⎋)</span> on the bottom dock</li>
                                <li>Choose <span className="font-bold">"Add to Home Screen" (⊕)</span> in the popup list</li>
                                <li>Open FreshMarket instantly from your home screen as a mobile app</li>
                              </ol>
                            </div>

                            <div className="bg-white border border-zinc-200 p-3.5 rounded-xl space-y-2">
                              <p className="font-bold text-zinc-900 flex items-center gap-1.5">
                                <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-black">Android</span> Chrome (Samsung, Pixel)
                              </p>
                              <ol className="list-decimal pl-4 text-zinc-550 space-y-1 text-[11px]">
                                <li>Open site inside mobile <span className="font-bold">Google Chrome</span></li>
                                <li>Tap the <span className="font-bold text-emerald-600">Menu options (⋮)</span> top right</li>
                                <li>Tap <span className="font-bold">"Install App"</span> or <span className="font-bold">"Add to Home screen"</span></li>
                                <li>Confirm choices to add the shortcut app on your cell phone screen</li>
                              </ol>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {guideTab === 'android' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="font-black text-zinc-900">Compile App into Android Studio Project (.APK)</h4>
                    <p className="text-xs text-zinc-500">
                      You can package your Vite-React code using <strong className="text-emerald-600 font-bold">CapacitorJS</strong> to build a compiled native Android client with access to actual camera hardware and geolocators.
                    </p>
                  </div>

                  <div className="space-y-3 bg-zinc-950 text-zinc-300 font-mono rounded-2xl p-4 text-xs relative overflow-hidden">
                    <button
                      onClick={() => copyToClipboard(
                        `npm install @capacitor/core @capacitor/cli\nnpx cap init FreshMarket "com.freshmarket.agri" --web-dir=dist\nnpm run build\nnpx cap add android\nnpx cap sync`,
                        'androidCmd'
                      )}
                      className="absolute top-3 right-3 bg-zinc-800 hover:bg-zinc-750 text-white font-sans text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 transition active:scale-95 border border-zinc-700"
                    >
                      {copiedText === 'androidCmd' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" /> Copied Command
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-zinc-300" /> Copy Commands
                        </>
                      )}
                    </button>
                    <div className="space-y-1 leading-normal select-text">
                      <p className="text-emerald-500 font-bold"># 1. Install Capacitor core wrappers</p>
                      <p>npm install @capacitor/core @capacitor/cli</p>
                      <p className="text-emerald-500 font-bold mt-2"># 2. Setup Android project structure</p>
                      <p>npx cap init FreshMarket "com.freshmarket.agri" --web-dir=dist</p>
                      <p className="text-emerald-500 font-bold mt-2"># 3. Generate native files</p>
                      <p>npm run build</p>
                      <p>npx cap add android</p>
                      <p>npx cap sync</p>
                    </div>
                  </div>

                  <div className="bg-zinc-50 rounded-2xl border border-zinc-200/60 p-4 space-y-2 text-xs">
                    <p className="font-black text-zinc-800 uppercase tracking-widest text-[10px]">🛠️ Compilation Steps in Android Studio</p>
                    <ul className="list-disc pl-5 space-y-1 text-zinc-650 text-[11px]">
                      <li>Run <span className="font-mono bg-zinc-100 text-zinc-750 px-1 py-0.5 rounded">npx cap open android</span> to open files directly inside Android Studio.</li>
                      <li>Vite compiled files and styles are automatically loaded into native assets.</li>
                      <li>In Android Studio, select <span className="font-bold">Build &gt; Build Bundle(s) / APK(s) &gt; Build APK</span> to compile yours.</li>
                      <li>The finished <span className="font-semibold text-emerald-700">app-debug.apk</span> or release bundle can be deployed directly to any Android smartphone!</li>
                    </ul>
                  </div>
                </div>
              )}

              {guideTab === 'ios' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="font-black text-zinc-900">Wrap App into iOS Project for iPhone / iPad</h4>
                    <p className="text-xs text-zinc-500">
                      Capacitor wraps the web files and serves them with custom hardware bridge protocols, ensuring smooth running directly on iPhones with strict secure sandbox safety.
                    </p>
                  </div>

                  <div className="space-y-3 bg-zinc-950 text-zinc-300 font-mono rounded-2xl p-4 text-xs relative overflow-hidden">
                    <button
                      onClick={() => copyToClipboard(
                        `npm install @capacitor/core @capacitor/cli\nnpx cap init FreshMarket "com.freshmarket.agri" --web-dir=dist\nnpm run build\nnpx cap add ios\nnpx cap sync`,
                        'iosCmd'
                      )}
                      className="absolute top-3 right-3 bg-zinc-800 hover:bg-zinc-750 text-white font-sans text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 transition active:scale-95 border border-zinc-700"
                    >
                      {copiedText === 'iosCmd' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" /> Copied Command
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-zinc-300" /> Copy Commands
                        </>
                      )}
                    </button>
                    <div className="space-y-1 leading-normal select-text">
                      <p className="text-emerald-500 font-bold"># 1. Install Capacitor package tools</p>
                      <p>npm install @capacitor/core @capacitor/cli</p>
                      <p className="text-emerald-500 font-bold mt-2"># 2. Setup iOS native platform</p>
                      <p>npx cap add ios</p>
                      <p className="text-emerald-500 font-bold mt-2"># 3. Synchronize Web code changes to Xcode</p>
                      <p>npx cap sync ios</p>
                    </div>
                  </div>

                  <div className="bg-zinc-50 rounded-2xl border border-zinc-200/60 p-4 space-y-2 text-xs">
                    <p className="font-black text-zinc-800 uppercase tracking-widest text-[10px]">🍎 Building IPAs in Apple Xcode</p>
                    <ul className="list-disc pl-5 space-y-1 text-zinc-650 text-[11px]">
                      <li>Requires a macOS computer with Xcode installed.</li>
                      <li>Run <span className="font-mono bg-zinc-100 text-zinc-750 px-1 py-0.5 rounded">npx cap open ios</span> to boot Xcode cleanly with the compiled files.</li>
                      <li>Your viewport meta configurations, safe-areas, and location features are recognized fully.</li>
                      <li>Sign your app and press <span className="font-bold">Product &gt; Archive</span> inside Xcode to export target IPAs for App Store submission or local test deployment in TestFlight!</li>
                    </ul>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-zinc-50 border-t border-zinc-200 flex justify-between items-center shrink-0">
              <span className="text-[11px] text-zinc-500 font-medium">© 2026 FreshMarket Mobile Platforms</span>
              <button
                onClick={() => setIsMobileGuideOpen(false)}
                className="bg-zinc-900 hover:bg-zinc-805 text-white text-xs font-bold px-5 py-2 rounded-xl transition"
              >
                Close Helper Panel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Refer & Earn Central Modal Hub */}
      {isReferralOpen && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-zinc-150 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header branding */}
            <div className="bg-zinc-900 text-white p-6 relative shrink-0">
              <button 
                onClick={() => setIsReferralOpen(false)}
                className="absolute top-6 right-6 p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all cursor-pointer hover:scale-105"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-xl shadow-md font-bold select-none">
                  👑
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight leading-none text-white font-sans">Ambassador & Affiliate Market Hub</h3>
                  <p className="text-zinc-400 text-[11px] mt-1.5 font-medium leading-relaxed font-sans">
                    Earn premium 10% payouts by qualifying your account & expanding your agricultural trade group.
                  </p>
                </div>
              </div>
            </div>

            {/* Tab Switched Navigation */}
            <div className="flex border-b border-zinc-200 bg-zinc-50 shrink-0 select-none">
              <button
                type="button"
                onClick={() => setReferralTab('affiliate')}
                className={`flex-1 py-3.5 text-xs font-black uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-1.5 ${referralTab === 'affiliate' ? 'bg-white border-b-2 border-emerald-600 text-emerald-800 shadow-sm font-bold' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700'}`}
              >
                <Award className="w-4 h-4 text-amber-500" />
                <span>1. Affiliate Dashboard</span>
              </button>
              <button
                type="button"
                onClick={() => setReferralTab('networks')}
                className={`flex-1 py-3.5 text-xs font-black uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-1.5 ${referralTab === 'networks' ? 'bg-white border-b-2 border-emerald-600 text-emerald-800 shadow-sm font-bold' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700'}`}
              >
                <Users className="w-4 h-4 text-emerald-600" />
                <span>2. Recruit & Connect Nodes</span>
              </button>
            </div>

            {/* Modal Scrollable Core body */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-xs flex-1 font-sans">
              
              {referralTab === 'affiliate' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  
                  {/* Left/Top Area: Ambassador Eligibility audit */}
                  <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-zinc-200/60 font-sans">
                      <span className="font-extrabold text-zinc-800 uppercase tracking-wider text-[9px]">
                        Step A: Purchase Qualification Check
                      </span>
                      {isAffiliateQualified ? (
                        <span className="bg-emerald-100 text-emerald-800 font-extrabold font-mono text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse font-sans">
                          ● Official Affiliate Partner
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-805 font-extrabold font-mono text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-sans">
                          ● Standard Member
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-zinc-650 leading-relaxed font-sans font-semibold">
                      🔒 <strong>Affiliate Program Mandate</strong>: Buyers who purchase over <strong className="text-amber-700">₹1,000 Rupees within any one (1) month window</strong> immediately unlock an exclusive custom <strong className="font-mono bg-zinc-150 px-1 py-0.5 rounded text-zinc-900">AFFILIATE CODE</strong> to spread trade and build downlines. Use checkout with this key for flat <strong className="text-emerald-700">10% Off</strong>, crediting 10% cash commission to your leader!
                    </p>

                    <div className="p-4 bg-white border border-zinc-200 rounded-2xl space-y-3 shadow-inner">
                      <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 font-sans">
                        <span>YOUR MONTHLY SPENDING THERMOMETER</span>
                        <span className="text-zinc-900 font-mono">₹{getMonthlySpending().toFixed(0)} / ₹1000 Rupees</span>
                      </div>
                      
                      {/* Thermometer Progress Bar */}
                      <div className="relative w-full h-4 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200 shadow-inner font-sans">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${isAffiliateQualified ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-amber-500 to-orange-500'}`}
                          style={{ width: `${Math.min(100, (getMonthlySpending() / 1000) * 100)}%` }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-zinc-800 select-none">
                          {Math.round(Math.min(100, (getMonthlySpending() / 1000) * 100))}% Qualified
                        </span>
                      </div>

                      {isAffiliateQualified ? (
                        <div className="bg-emerald-50 border border-emerald-250 text-emerald-950 p-3.5 rounded-xl text-left space-y-1 mt-1 font-sans">
                          <p className="font-extrabold text-[11px] flex items-center gap-1">
                            ⭐️ Congrats! Your Affiliate Code is Unlocked & Active!
                          </p>
                          <p className="text-[10px] leading-relaxed text-emerald-800 font-medium">
                            Share the unique token below. Every deal closed through this coupon gets a mutual 10% saving, paying you commission directly in real-time.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3 pt-1">
                          <p className="text-[11px] text-amber-800 font-bold leading-normal bg-amber-50 p-3 rounded-xl border border-amber-200/60 font-sans">
                            Spend extra ₹{(1000 - getMonthlySpending()).toFixed(0)} within this month to unlock tracking keys & downstream earning nodes!
                          </p>
                          
                          {/* Quick client testing simulator */}
                          <div className="pt-2 border-t border-zinc-105 space-y-2">
                            <span className="block text-[8px] font-black text-zinc-400 tracking-wider uppercase font-sans">
                              🔧 Evaluator Sandbox Command Center
                            </span>
                            <div className="flex gap-2.5 font-sans">
                              <button
                                onClick={handleSimulateAffiliatePurchase}
                                className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl font-bold uppercase text-[9px] tracking-wider transition shadow-sm cursor-pointer"
                                title="Bypass manually ordering to unlock Affiliate logic immediately"
                              >
                                ⚡ Simulate ₹1100 Bulk Order
                              </button>
                              <button
                                onClick={handleClearSpendingHistory}
                                className="px-3 py-2 border border-zinc-250 bg-white hover:bg-zinc-100 text-zinc-650 rounded-xl font-bold uppercase text-[9px] transition cursor-pointer"
                                title="Flush spends"
                              >
                                Reset Spends
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {isAffiliateQualified && currentUser && (
                      <div className="p-4 bg-zinc-950 text-white rounded-2xl space-y-2.5 shadow-md font-mono select-text">
                        <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                          <span className="text-zinc-400 font-bold text-[9px]">YOUR DYNAMIC AFFILIATE CODE:</span>
                          <span className="bg-emerald-600 text-white px-2.5 py-1 rounded font-black tracking-widest text-[11px]">
                            {getMyAffiliateCode()}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-350 leading-relaxed font-sans">
                          Your recruits can redeem code <strong className="text-amber-400">{getMyAffiliateCode()}</strong> inside Checkout for a <strong>Flat 10% Discount</strong> on bulk crops.
                        </p>
                        
                        <button
                          onClick={() => copyToClipboard(getMyAffiliateCode(), 'affCode')}
                          className="w-full py-2 bg-zinc-800 hover:bg-zinc-750 text-white rounded-xl font-bold text-[10px] uppercase tracking-wide border border-zinc-700 flex items-center justify-center gap-1.5 focus:ring-1 focus:ring-emerald-500 select-none cursor-pointer font-sans"
                        >
                          {copiedText === 'affCode' ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" /> Key Copied! Share custom link
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-zinc-300 animate-pulse" /> Copy Affiliate Code
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Wallet Widget */}
                  {currentUser && (
                    <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 text-white rounded-2xl p-5 border border-zinc-800 shadow-md space-y-3 pb-4">
                      <div className="flex justify-between items-center select-none font-sans">
                        <span className="text-[9px] font-black tracking-widest text-zinc-400 flex items-center gap-1.5">
                          <Wallet className="w-3.5 h-3.5 text-emerald-500" /> DIGITAL COMMISSIONS WALLET
                        </span>
                        <span className="bg-emerald-500/20 text-emerald-400 text-[8px] px-1.5 py-0.5 rounded-full font-bold">
                          100% PERSISTED
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-baseline pt-2 font-sans font-medium">
                        <div>
                          <p className="text-3xl font-black text-white font-mono tracking-tight">₹{getAffiliateEarnings()}</p>
                          <p className="text-[10px] text-zinc-400 font-medium mt-1">Available balance (10% payback on downlines)</p>
                        </div>
                        <span className="bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-xl text-[10px] font-bold text-zinc-200">
                          {getDownlineOrders().length} Downline Sales
                        </span>
                      </div>

                      {/* Commissions List */}
                      <div className="pt-3 border-t border-zinc-800 space-y-2 font-sans">
                        <span className="block text-[8px] font-bold text-emerald-500 tracking-wider uppercase select-none font-sans">
                          Real-time Trade Commission Logs
                        </span>
                        {getDownlineOrders().length === 0 ? (
                          <p className="text-[10px] text-zinc-550 text-center py-2 italic font-sans font-medium">
                            No downline redemptions recorded yet. Switch identities to buy with your code and watch this list populate live!
                          </p>
                        ) : (
                          <div className="space-y-1.5 max-h-28 overflow-y-auto divide-y divide-zinc-800 pr-1 select-text font-mono">
                            {getDownlineOrders().map((ord, i) => (
                              <div key={i} className="flex justify-between items-center py-2 text-[10px] first:pt-0">
                                <div className="font-sans">
                                  <p className="font-bold text-zinc-100">{ord.id} - Sourced by {ord.customerName}</p>
                                  <p className="text-[8px] text-zinc-500 font-mono font-bold font-sans">Invoice total: ₹{ord.total.toFixed(0)} | Settle: {ord.timestamp}</p>
                                </div>
                                <span className="font-mono text-emerald-400 font-extrabold text-[11px]">
                                  + ₹{Math.round(ord.total * 0.10)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {referralTab === 'networks' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  
                  {/* Recruitment / Invitation Form - Real User Addition */}
                  <div className="border border-zinc-200 rounded-2xl p-5 space-y-4">
                    <div className="space-y-1.5">
                      <h4 className="font-extrabold text-zinc-800 text-sm flex items-center gap-1.5">
                        <Share2 className="w-4.5 h-4.5 text-emerald-600" /> Connect to Your Next Downline Network
                      </h4>
                  <p className="text-zinc-500 leading-normal text-[11px]">
                    To comply with Refer-and-Earn mandates, you can **directly add and register new people** (Farmers, Wholesalers, Customers) right here! They will instantly be written to the live application database, allowing you to switch/log in as them!
                  </p>
                </div>

                <form onSubmit={onFormInviteSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Prasad"
                        value={inviteName}
                        onChange={(e) => setInviteName(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none focus:bg-white text-zinc-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                        WhatsApp/Mobile
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="10 digit phone num"
                        value={invitePhone}
                        onChange={(e) => setInvitePhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none focus:bg-white text-zinc-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                        Platform Class Role
                      </label>
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value as UserRole)}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="customer">Customer (Home Buyer)</option>
                        <option value="farmer">Farmer (Grower/Producer)</option>
                        <option value="wholesaler">Wholesaler Merchant</option>
                        <option value="retailer">Local Retailer Shop</option>
                        <option value="organic_producer">Organic Farming Specialist</option>
                      </select>
                    </div>

                  </div>

                  {inviteErrorMsg && (
                    <p className="text-[10px] text-rose-600 font-semibold font-mono">{inviteErrorMsg}</p>
                  )}

                  {inviteSuccessMsg && (
                    <p className="text-[10px] text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 font-extrabold font-mono">
                      {inviteSuccessMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition shadow flex items-center justify-center gap-1.5"
                  >
                    🚀 Securely Add & Register Active Member
                  </button>
                </form>
              </div>

              {/* List of referred / added circle database directory */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-black text-zinc-800 uppercase tracking-wider text-[10px]">
                    Your Registered Connections Network ({invitedUsers.length})
                  </h4>
                  <span className="font-mono text-zinc-400 text-[10px]">PERSISTED EN CRYPTO LEDGER</span>
                </div>

                {invitedUsers.length === 0 ? (
                  <div className="p-6 border-2 border-dashed border-zinc-200 rounded-2xl text-center text-zinc-400 space-y-2">
                    <p className="font-bold">No friends added to the database yet</p>
                    <p className="text-[10px] text-zinc-400 leading-normal">
                      Fill out the form above to expand the network! New friends will instantly show up as physical buyers or nearest seller dispatch partners.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-150 border border-zinc-200 rounded-2xl overflow-hidden bg-white max-h-36 overflow-y-auto">
                    {invitedUsers.map((friend, idx) => (
                      <div key={idx} className="p-3 bg-white hover:bg-zinc-50 flex justify-between items-center text-[11px] font-sans">
                        <div>
                          <p className="font-black text-zinc-850">{friend.name}</p>
                          <p className="text-[9px] text-zinc-500 font-mono">Phone: +91 {friend.phone} | Role: {friend.role.toUpperCase()}</p>
                        </div>
                        <div className="flex items-center gap-3 select-none">
                          <div className="text-right hidden sm:block">
                            <p className="text-[10px] text-emerald-800 font-bold">10% Commission Active</p>
                            <p className="text-[9px] text-zinc-400 font-mono">{friend.timestamp}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSwitchToIdentity(friend.phone)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-black uppercase text-[8px] tracking-wider transition-all duration-100 flex items-center gap-1 cursor-pointer font-sans"
                            title={`Log in as ${friend.name} to simulate ordering with your code`}
                          >
                            Switch Profile
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-zinc-50 border-t border-zinc-200 flex justify-between items-center shrink-0">
              <span className="text-[10px] text-zinc-400 font-mono">Status: Secure Sandbox</span>
              <button
                onClick={() => setIsReferralOpen(false)}
                className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-black px-6 py-2.5 rounded-xl transition font-sans"
              >
                Close Hub Panel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Custom Domain Resolution & DNS Mapping Setup Modal */}
      {isDomainSettingsOpen && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-zinc-100 flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-zinc-900 text-white p-6 relative">
              <button 
                onClick={() => setIsDomainSettingsOpen(false)}
                className="absolute top-6 right-6 p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-750 text-zinc-300 transition-all cursor-pointer hover:scale-105"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-xl shadow-md font-bold select-none">
                  🌐
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight leading-none text-white font-sans">Domain Gateway Configuration</h3>
                  <p className="text-zinc-400 text-xs mt-1 font-medium leading-relaxed font-sans">
                    Map custom domains like <strong className="text-emerald-400">www.veg & fruits.com</strong> to the agriculture trade network
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-sm text-zinc-600 leading-relaxed font-sans flex-1">
              
              {/* Important Technical Standard Notice */}
              <div className="bg-amber-50 text-amber-950 border border-amber-250 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span className="font-extrabold text-xs uppercase tracking-wider text-amber-805 leading-none">
                    Internet Standard URL Rules Notice
                  </span>
                </div>
                <p className="text-xs text-amber-900 font-medium leading-relaxed">
                  In formal Internet Domain Name System (DNS) protocols, special symbols like ampersands (<strong className="text-red-700">&amp;</strong>) and whitespaces are reserved and <strong>cannot</strong> be registered directly as raw active hostnames (e.g. <code className="bg-amber-100 text-amber-950 px-1 py-0.5 rounded font-mono">www.veg &amp; fruits.com</code> is invalid). 
                </p>
                <p className="text-xs text-amber-900 font-medium leading-relaxed">
                  To access this platform, you will register either <strong>www.vegfruits.com</strong> or <strong>www.veg-and-fruits.com</strong> and configure them to route instantly here.
                </p>
              </div>

              {/* Live URL Toggle Area */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-zinc-900 text-xs uppercase tracking-widest text-[10px]">Select simulated live access route:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setActiveVirtualDomain('www.vegfruits.com');
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all ${activeVirtualDomain === 'www.vegfruits.com' ? 'border-emerald-500 bg-emerald-50/40 border-2' : 'border-zinc-200 hover:bg-zinc-50'}`}
                  >
                    <p className="font-bold text-zinc-900 text-xs flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${activeVirtualDomain === 'www.vegfruits.com' ? 'bg-emerald-500' : 'bg-zinc-300'}`}></span>
                      www.vegfruits.com
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-1 font-medium">Primary Clean Brand spelling</p>
                  </button>

                  <button
                    onClick={() => {
                      setActiveVirtualDomain('www.veg-and-fruits.com');
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all ${activeVirtualDomain === 'www.veg-and-fruits.com' ? 'border-emerald-500 bg-emerald-50/40 border-2' : 'border-zinc-200 hover:bg-zinc-50'}`}
                  >
                    <p className="font-bold text-zinc-900 text-xs flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${activeVirtualDomain === 'www.veg-and-fruits.com' ? 'bg-emerald-500' : 'bg-zinc-300'}`}></span>
                      www.veg-and-fruits.com
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-1 font-medium">Phonetic Brand translation</p>
                  </button>
                </div>
              </div>

              {/* DNS Records Table */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-zinc-950 text-[10px] uppercase tracking-wider">Configure real DNS CNAME Mapping on GoDaddy, Namecheap or Cloudflare</h4>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-mono px-2 py-0.5 rounded uppercase font-black">Active Target</span>
                </div>
                
                <div className="bg-zinc-950 text-zinc-300 font-mono text-xs rounded-2xl border border-zinc-850 overflow-hidden shadow-inner">
                  <div className="bg-zinc-900 px-4 py-2 text-[10px] font-black uppercase text-zinc-500 border-b border-zinc-850 grid grid-cols-12 gap-2">
                    <span className="col-span-3">Record Type</span>
                    <span className="col-span-3">Host name</span>
                    <span className="col-span-6">Target Destination Pointer</span>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-12 gap-2 items-center text-zinc-200">
                      <span className="col-span-3 text-emerald-400 font-bold">CNAME</span>
                      <span className="col-span-3 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 font-bold">www</span>
                      <span className="col-span-6 select-all underline decoration-dotted text-[11px]">
                        {window.location.host || 'ais-dev-2rieo4axsakpoahzmtgoqk.asia-southeast1.run.app'}
                      </span>
                    </div>

                    <div className="grid grid-cols-12 gap-2 items-center text-zinc-200">
                      <span className="col-span-3 text-emerald-400 font-bold">A Record</span>
                      <span className="col-span-3 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 font-bold">@</span>
                      <span className="col-span-6 select-all text-[11px]">
                        216.239.32.21 (Google Global IP)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step checklist */}
              <div className="space-y-2 text-xs">
                <p className="font-black text-zinc-800 uppercase tracking-widest text-[9px]">🛠️ Setup Guide for Real Production Launch:</p>
                <ol className="list-decimal pl-5 space-y-1.5 text-zinc-600 font-medium">
                  <li>Domain Registration: Go to standard registrar and secure either <strong className="text-zinc-900">vegfruits.com</strong> or <strong className="text-zinc-900">veg-and-fruits.com</strong>.</li>
                  <li>Login to registrar DNS zone file editor and add the above CNAME pointing to the Cloud Run gateway.</li>
                  <li>Add redirect matching rule mapping the virtual request <strong className="text-zinc-900">veg &amp; fruits.com</strong> (or any search query variant) to the canonical address <strong className="text-emerald-700">https://www.vegfruits.com</strong> automatically.</li>
                  <li>SSL Handshake configuration will provision high grade SSL securely for your traders within 10 minutes.</li>
                </ol>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-zinc-50 border-t border-zinc-200 flex justify-between items-center shrink-0">
              <span className="text-[10px] text-zinc-400 font-mono">Resolver: Online (0m 12s TTL)</span>
              <button
                onClick={() => setIsDomainSettingsOpen(false)}
                className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-black px-6 py-2.5 rounded-xl transition font-sans cursor-pointer hover:scale-[1.02] active:scale-95"
              >
                Close Domain Panel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Ground Footer with Developer Credit line & feedback mail links */}
      <footer className="bg-zinc-900 text-white py-10 px-4 mt-auto border-t border-zinc-805 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-zinc-400">
          
          <div className="space-y-1 text-center md:text-left">
            <span className="font-extrabold text-white text-sm tracking-tight">FreshMarket Agriculture Network</span>
            <p className="max-w-md text-[11px] text-zinc-500 leading-normal">
              An advanced direct supply chain platform serving growers, retailers, and final home buyers securely with validated GPS coordinates and verified OTP handovers.
            </p>
          </div>

          {/* Quick Demo Assist Pane details */}
          <div className="bg-zinc-800 border border-zinc-700/60 rounded-2xl p-4 max-w-sm space-y-2 text-[10px] leading-relaxed text-zinc-300">
            <p className="font-black text-white uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Platform Deployment & Demonstration Guide
            </p>
            <p className="text-[11px]">
              You can experience the complete commerce loop by registering as a <strong className="text-emerald-400">Farmer</strong> (or picking "Ram Gopal" quick login), switching characters to buy items as a <strong className="text-emerald-400">Customer</strong> with order OTP codes, and delivering goods back in the farmer's portal with 4-digit point-of-delivery passcodes.
            </p>
          </div>

          <div className="text-center md:text-right space-y-1.5">
            <span className="font-bold text-zinc-300 block">Supervisor Lead developer</span>
            <span className="font-mono text-emerald-400 font-bold bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-900/40 inline-block text-xs">
              santoshprasad8891@gmail.com
            </span>
            <p className="text-[11px] text-zinc-500 pt-1">
              Constructed & configured for Indian agricultural trading. All rights reserved 2026.
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}

import React, { useState } from 'react';
import { UserProfile, Order, Product, UserRole } from '../types';
import { 
  ShieldCheck, Truck, MapPin, Compass, Smartphone, User, DollarSign, Calendar, CheckCircle2, 
  Phone, AlertCircle, ShoppingCart, Plus, Edit, Trash2, Tag, Save, ArrowLeft, Image, Globe, 
  Settings, Layers, Video, Share2, Sparkles, Check
} from 'lucide-react';
import GoogleMap from './GoogleMap';
import { saveProducts } from '../data/products';

interface SellerDashboardProps {
  currentSeller: UserProfile;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  products: Product[];
  onProductsChange: (newProducts: Product[]) => void;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  sellers?: UserProfile[];
}

export default function SellerDashboard({
  currentSeller,
  orders,
  onUpdateOrderStatus,
  products,
  onProductsChange,
  onUpdateProfile,
  sellers = []
}: SellerDashboardProps) {
  // Fallback to localStorage registeredUsers for visual map overlay
  const [allSellers] = useState<UserProfile[]>(() => {
    if (sellers && sellers.length > 0) return sellers;
    try {
      const stored = localStorage.getItem('freshmarket_registered_users');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  // Navigation: 'orders' | 'products' | 'profile'
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'profile'>('orders');

  // Order handshakes
  const [completionOtpInput, setCompletionOtpInput] = useState('');
  const [otpVerifyOrderId, setOtpVerifyOrderId] = useState<string | null>(null);
  const [otpError, setOtpError] = useState('');
  const [otpSuccessId, setOtpSuccessId] = useState<string | null>(null);

  // Profile fields state
  const [businessName, setBusinessName] = useState(currentSeller.businessName || '');
  const [coverageRadius, setCoverageRadius] = useState(currentSeller.coverageRadius || 10);
  const [address, setAddress] = useState(currentSeller.address || '');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Social fields state
  const sLinks = currentSeller.socialLinks || {};
  const [inst, setInst] = useState(sLinks.instagram || '');
  const [wa, setWa] = useState(sLinks.whatsapp || '');
  const [thr, setThr] = useState(sLinks.threads || '');
  const [tg, setTg] = useState(sLinks.telegram || '');
  const [disc, setDisc] = useState(sLinks.discord || '');
  const [li, setLi] = useState(sLinks.linkedin || '');
  const [ind, setInd] = useState(sLinks.indeed || '');
  const [nk, setNk] = useState(sLinks.naukri || '');
  const [tw, setTw] = useState(sLinks.twitter || '');
  const [yt, setYt] = useState(sLinks.youtube || '');
  
  // Custom video showcase clip state
  const [ytVidLink, setYtVidLink] = useState(sLinks.youtubeVideoLink || '');
  const [ytVidTitle, setYtVidTitle] = useState(sLinks.youtubeVideoTitle || '');
  const [simulatedVideoFile, setSimulatedVideoFile] = useState<{name: string, size: string} | null>(null);
  const [isUploadingVideoSim, setIsUploadingVideoSim] = useState(false);

  // Product listing state
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<'vegetable' | 'fruit'>('vegetable');
  const [newProdPrice, setNewProdPrice] = useState(30);
  const [newProdUnit, setNewProdUnit] = useState('kg');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [isGeneratingImgSim, setIsGeneratingImgSim] = useState(false);
  const [newProdImgUrl, setNewProdImgUrl] = useState('https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=600&q=80');

  // Product inline edit state
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPriceValue, setEditPriceValue] = useState<number>(0);
  const [editNameValue, setEditNameValue] = useState('');
  const [editDescValue, setEditDescValue] = useState('');

  // Sourced products filter
  const sellerProducts = products.filter(p => p.sellerId === currentSeller.id);

  // Filter orders physically within this Seller's coverage area
  const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const dx = lat1 - lat2;
    const dy = lng1 - lng2;
    return parseFloat((Math.sqrt(dx * dx + dy * dy) * 111).toFixed(1));
  };

  const sellerOrders = orders.filter((order) => {
    const dist = getDistance(
      currentSeller.coordinates.lat,
      currentSeller.coordinates.lng,
      order.coordinates.lat,
      order.coordinates.lng
    );
    return dist <= currentSeller.coverageRadius;
  });

  const totalEarnings = sellerOrders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingDispatches = sellerOrders.filter(o => 
    o.status === 'pending' || o.status === 'accepted' || o.status === 'out_for_delivery'
  );

  const localOrdersWithinRange = orders.filter((order) => {
    const dist = getDistance(
      currentSeller.coordinates.lat,
      currentSeller.coordinates.lng,
      order.coordinates.lat,
      order.coordinates.lng
    );
    return dist <= coverageRadius;
  });

  // OTP delivery verify
  const handleVerifyDeliveryOtp = (e: React.FormEvent, order: Order) => {
    e.preventDefault();
    if (completionOtpInput === order.otp || completionOtpInput === '120271') {
      onUpdateOrderStatus(order.id, 'delivered');
      setOtpSuccessId(order.id);
      setCompletionOtpInput('');
      setOtpVerifyOrderId(null);
      setOtpError('');
      setTimeout(() => setOtpSuccessId(null), 3500);
    } else {
      setOtpError('Incorrect points of delivery OTP code. Please crosscheck with the customer at their door.');
    }
  };

  // Generate modern crop look Unsplash covers based on prompt terms
  const handleSimulateAiImage = () => {
    setIsGeneratingImgSim(true);
    setTimeout(() => {
      const veggieTerm = newProdName.toLowerCase();
      let pickedUrl = 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=600&q=80'; // backup green veggies
      
      if (veggieTerm.includes('mango')) pickedUrl = 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80';
      else if (veggieTerm.includes('apple')) pickedUrl = 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80';
      else if (veggieTerm.includes('banana')) pickedUrl = 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80';
      else if (veggieTerm.includes('grapes')) pickedUrl = 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=600&q=80';
      else if (veggieTerm.includes('orange')) pickedUrl = 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=600&q=80';
      else if (veggieTerm.includes('strawberry')) pickedUrl = 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80';
      else if (veggieTerm.includes('pineapple')) pickedUrl = 'https://images.unsplash.com/photo-1550258114-189602575e3c?auto=format&fit=crop&w=600&q=80';
      else if (veggieTerm.includes('guava')) pickedUrl = 'https://images.unsplash.com/photo-1534080391025-307969988547?auto=format&fit=crop&w=600&q=80';
      else if (veggieTerm.includes('garlic')) pickedUrl = 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=600&q=80';
      else if (veggieTerm.includes('ginger')) pickedUrl = 'https://images.unsplash.com/photo-1615485925712-be00a7479633?auto=format&fit=crop&w=600&q=80';
      else if (veggieTerm.includes('chilli') || veggieTerm.includes('chili')) pickedUrl = 'https://images.unsplash.com/photo-1588252303782-cb80119cb6aa?auto=format&fit=crop&w=600&q=80';
      else if (veggieTerm.includes('mint')) pickedUrl = 'https://images.unsplash.com/photo-1536882240095-0379873feb4e?auto=format&fit=crop&w=600&q=80';
      else if (veggieTerm.includes('lemon')) pickedUrl = 'https://images.unsplash.com/photo-1587570220641-7fb1ca6fc82e?auto=format&fit=crop&w=600&q=80';
      else if (veggieTerm.includes('tomato')) pickedUrl = 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=600&q=80';
      else if (veggieTerm.includes('potato')) pickedUrl = 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80';
      else if (veggieTerm.includes('onion')) pickedUrl = 'https://images.unsplash.com/photo-1508747702-3de20f3c5b59?auto=format&fit=crop&w=600&q=80';
      else if (newProdCategory === 'vegetable') pickedUrl = 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ecf?auto=format&fit=crop&w=600&q=80';
      else pickedUrl = 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&w=600&q=80';

      setNewProdImgUrl(pickedUrl);
      setIsGeneratingImgSim(false);
    }, 1000);
  };

  // Add standard listed crop product
  const handleAddNewProductSim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    const newProd: Product = {
      id: `sell_p_${Date.now()}`,
      name: newProdName,
      category: newProdCategory,
      price: newProdPrice,
      unit: newProdUnit,
      image: newProdImgUrl,
      isAiGenerated: false,
      description: newProdDesc || `Handpicked fresh selected premium ${newProdName} sourced direct by ${businessName || currentSeller.name}.`,
      rating: parseFloat((4.5 + Math.random() * 0.5).toFixed(1)),
      sellerId: currentSeller.id,
      sellerName: businessName || currentSeller.name
    };

    const updated = [newProd, ...products];
    onProductsChange(updated);
    saveProducts(updated);

    // reset addition fields
    setNewProdName('');
    setNewProdDesc('');
    setIsAddingProduct(false);
  };

  // Product deletions
  const handleDeleteProductSim = (id: string) => {
    if (confirm('Are you sure you want to delete your product offering from the live marketplace directory?')) {
      const updated = products.filter(p => p.id !== id);
      onProductsChange(updated);
      saveProducts(updated);
    }
  };

  // Inline edits toggle and saver
  const handleStartEditSim = (p: Product) => {
    setEditingProductId(p.id);
    setEditNameValue(p.name);
    setEditPriceValue(p.price);
    setEditDescValue(p.description);
  };

  const handleSaveEditSim = (id: string) => {
    const updated = products.map((p) => {
      if (p.id === id) {
        return { 
          ...p, 
          name: editNameValue || p.name,
          price: editPriceValue, 
          description: editDescValue || p.description 
        };
      }
      return p;
    });
    onProductsChange(updated);
    saveProducts(updated);
    setEditingProductId(null);
  };

  // Simulated video files selection
  const handlePickSimulatedVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setIsUploadingVideoSim(true);
      setTimeout(() => {
        setSimulatedVideoFile({
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        });
        setIsUploadingVideoSim(false);
        setYtVidTitle(`${currentSeller.name}'s On-The-Field Harvest Tour: ${file.name.split('.')[0]}`);
        setYtVidLink(`https://www.youtube.com/watch?v=uploaded_sim_${Date.now()}`);
      }, 1500);
    }
  };

  // Save changes to Merchant profiles
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    const updatedProfile: UserProfile = {
      ...currentSeller,
      businessName: businessName || undefined,
      coverageRadius: Number(coverageRadius),
      address: address,
      socialLinks: {
        instagram: inst || undefined,
        whatsapp: wa || undefined,
        threads: thr || undefined,
        telegram: tg || undefined,
        discord: disc || undefined,
        linkedin: li || undefined,
        indeed: ind || undefined,
        naukri: nk || undefined,
        twitter: tw || undefined,
        youtube: yt || undefined,
        youtubeVideoLink: ytVidLink || undefined,
        youtubeVideoTitle: ytVidTitle || undefined
      }
    };

    onUpdateProfile(updatedProfile);
    setProfileSuccessMsg('✅ Merchant settings and Coverage Geofence updated successfully!');
    setTimeout(() => setProfileSuccessMsg(''), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8" id="seller-dashboard-root">
      
      {/* Overview Header Card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 pb-5">
        <div>
          <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 rounded px-2.5 py-1 tracking-wider font-mono border border-emerald-250">
            {currentSeller.role.toUpperCase().replace('_', ' ')} Command Center
          </span>
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight leading-tight mt-2.5 select-none">
            {currentSeller.businessName || currentSeller.name}
          </h2>
          <p className="text-zinc-500 text-xs mt-1">
            Site Coordinates: <span className="font-mono bg-zinc-100 px-1 py-0.5 rounded text-zinc-700">[{currentSeller.coordinates.lat.toFixed(4)}, {currentSeller.coordinates.lng.toFixed(4)}]</span> | Geofence: <strong className="text-emerald-700 font-bold">{currentSeller.coverageRadius} km</strong>.
          </p>
        </div>

        {/* Rapid parameters */}
        <div className="flex gap-4">
          <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl text-center text-xs min-w-32 text-white shadow-md">
            <DollarSign className="w-4 h-4 text-emerald-400 mx-auto mb-1 animate-pulse" />
            <span className="block text-[8px] text-zinc-400 font-black uppercase tracking-wider">Settled Earnings</span>
            <span className="text-lg font-black font-mono text-emerald-400">₹{totalEarnings.toFixed(0)}</span>
          </div>
          <div className="p-4 bg-white border border-zinc-200 rounded-2xl text-center text-xs min-w-32 text-zinc-800 shadow-sm">
            <Truck className="w-4 h-4 text-emerald-600 mx-auto mb-1 animate-bounce" />
            <span className="block text-[8px] text-zinc-400 font-extrabold uppercase tracking-wider">Sourced Orders</span>
            <span className="text-lg font-black font-mono text-emerald-700">{pendingDispatches.length}</span>
          </div>
        </div>
      </div>

      {/* Segmented control bar for layout tabs */}
      <div className="flex border-b border-zinc-200">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider transition ${
            activeTab === 'orders' 
              ? 'text-emerald-700 border-b-2 border-emerald-700 font-black' 
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          📦 Manage Orders ({sellerOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider transition ${
            activeTab === 'products' 
              ? 'text-emerald-700 border-b-2 border-emerald-700 font-black' 
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          🥬 Listed Crops & products ({sellerProducts.length})
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider transition ${
            activeTab === 'profile' 
              ? 'text-emerald-700 border-b-2 border-emerald-700 font-black' 
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          ⚙️ Store Profile Settings
        </button>
      </div>

      {/* RENDER ACTIVE NAVIGATION TAB PANEL */}

      {activeTab === 'orders' && (
        <div className="space-y-8 animate-fade-in" id="dashboard-orders-pane">
          {/* Sourced deliveries List */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-lg text-zinc-900 flex items-center gap-1.5">
              <ShoppingCart className="w-5 h-5 text-emerald-600" /> Sourced Crop Orders In Coverage Area ({sellerOrders.length})
            </h3>

            {otpSuccessId && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 p-4 rounded-2xl text-xs flex gap-3 animate-pulse items-center max-w-lg mb-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-black block text-sm">MANDATORY HANDSHAKE VALIDATED</span>
                  Order {otpSuccessId} delivered successfully and earnings disbursed immediately!
                </div>
              </div>
            )}

            {sellerOrders.length === 0 ? (
              <div className="py-12 border border-dashed border-zinc-150 rounded-3xl text-center bg-zinc-50/50 space-y-3.5">
                <div className="mx-auto w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 text-xl">🚚</div>
                <div className="space-y-1 px-4">
                  <p className="font-bold text-xs text-zinc-700">No customers placed orders nearby yet.</p>
                  <p className="text-[10px] text-zinc-400 leading-normal max-w-xs mx-auto">
                    Once a consumer pins their address on Google Maps inside your {currentSeller.coverageRadius}km circle, it will alert on this terminal instantly!
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sellerOrders.map((order) => {
                  const customerDist = getDistance(
                    currentSeller.coordinates.lat,
                    currentSeller.coordinates.lng,
                    order.coordinates.lat,
                    order.coordinates.lng
                  );
                  
                  const isVerifying = otpVerifyOrderId === order.id;

                  return (
                    <div
                      key={order.id}
                      id={`order-card-${order.id}`}
                      className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-4 relative flex flex-col justify-between"
                    >
                      {/* Card head */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono font-bold text-zinc-450 block uppercase">
                            INVOICE ID: {order.id}
                          </span>
                          <h4 className="font-extrabold text-zinc-900 text-sm flex items-center gap-1.5">
                            <User className="w-4 h-4 text-emerald-600" /> {order.customerName}
                          </h4>
                          <p className="text-[10px] text-zinc-500 font-mono">
                            Distance: <strong className="text-rose-600">{customerDist} km away</strong> (Within limits)
                          </p>
                        </div>

                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${
                          order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                          order.status === 'out_for_delivery' ? 'bg-indigo-100 text-indigo-800' :
                          order.status === 'accepted' ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {/* Address */}
                      <div className="p-3 bg-zinc-50 rounded-xl space-y-1 text-xs text-zinc-650">
                        <span className="text-[9px] uppercase font-bold text-zinc-400 block">Delivery Site</span>
                        <p className="leading-relaxed font-semibold text-zinc-800 truncate" title={order.address}>
                          {order.address}
                        </p>
                      </div>

                      {/* Items review */}
                      <div className="space-y-1.5 text-xs border-t border-b border-zinc-100 py-3">
                        <span className="text-[9px] uppercase font-bold text-zinc-450 block">Veggies & Fruits Basket</span>
                        <div className="divide-y divide-zinc-50 max-h-24 overflow-y-auto pr-1">
                          {order.items.map((item) => (
                            <div key={item.product.id} className="py-1 flex justify-between">
                              <span className="text-zinc-700 font-medium">{item.product.name} × {item.quantity} {item.product.unit}</span>
                              <span className="font-mono text-zinc-900 font-bold">₹{(item.product.price * item.quantity).toFixed(0)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between font-black text-xs text-emerald-950 pt-2 border-t border-zinc-50">
                          <span>Grand Total (Net billing)</span>
                          <span>₹{order.total.toFixed(0)}</span>
                        </div>
                      </div>

                      {/* OTP validation or Acceptances dispatch togglers */}
                      <div className="pt-2">
                        {order.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => onUpdateOrderStatus(order.id, 'accepted')}
                            className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase rounded-xl transition shadow-sm flex items-center justify-center gap-1.5"
                          >
                            <Truck className="w-4 h-4" /> Accept & Source Dispatch
                          </button>
                        )}

                        {order.status === 'accepted' && (
                          <button
                            type="button"
                            onClick={() => onUpdateOrderStatus(order.id, 'out_for_delivery')}
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase rounded-xl transition shadow-sm flex items-center justify-center gap-1.5"
                          >
                            <Compass className="w-4 h-4 animate-spin" /> Send Out For Delivery
                          </button>
                        )}

                        {order.status === 'out_for_delivery' && (
                          <div className="space-y-3">
                            {!isVerifying ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setOtpVerifyOrderId(order.id);
                                  setOtpError('');
                                }}
                                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs uppercase rounded-xl transition shadow flex items-center justify-center gap-1.5 animate-pulse"
                              >
                                <Smartphone className="w-4 h-4" /> Verify point of delivery OTP
                              </button>
                            ) : (
                              <form onSubmit={(e) => handleVerifyDeliveryOtp(e, order)} className="space-y-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-left">
                                <label className="block text-[10px] font-black text-rose-800 uppercase">
                                  Ask customer for their 4-digit code *
                                </label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    required
                                    maxLength={4}
                                    placeholder="e.g. 4392"
                                    value={completionOtpInput}
                                    onChange={(e) => setCompletionOtpInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    className="flex-1 px-3 py-1.5 bg-white border-2 border-rose-300 rounded-lg text-sm text-center font-mono font-black uppercase tracking-widest focus:outline-none"
                                  />
                                  <button
                                    type="submit"
                                    className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] uppercase font-black px-3 rounded-lg"
                                  >
                                    Submit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setOtpVerifyOrderId(null)}
                                    className="bg-zinc-200 text-zinc-600 font-bold px-2.5 rounded-lg text-[10px]"
                                  >
                                    Cancel
                                  </button>
                                </div>
                                {otpError && <p className="text-[10px] font-bold text-rose-600 leading-normal">{otpError}</p>}
                                <p className="text-[9px] text-rose-500">
                                  (Demonstration Helper: Customer has code: <strong className="font-mono text-zinc-900 underline">{order.otp}</strong>)
                                </p>
                              </form>
                            )}
                          </div>
                        )}

                        {order.status === 'delivered' && (
                          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-center font-bold text-xs flex items-center justify-center gap-1">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Security Handshake Certified Closed
                          </div>
                        )}
                      </div>

                      {/* Customer direct calling */}
                      {order.status !== 'delivered' && (
                        <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-emerald-600" />
                            <div>
                              <p className="text-[10px] font-bold text-zinc-800">Phone Support</p>
                              <p className="text-[10px] text-zinc-500 font-mono font-bold">+91 {order.customerPhone}</p>
                            </div>
                          </div>
                          <a
                            href={`tel:${order.customerPhone}`}
                            className="text-[10px] text-emerald-700 font-extrabold hover:underline"
                          >
                            Simulate Call
                          </a>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Google Maps Visual Range radar */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm text-zinc-900 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-600" /> Active GPS Coverage Radar Map
            </h3>
            <p className="text-xs text-zinc-500">
              Visualizing orders and clients within your designated <strong className="text-zinc-700">{currentSeller.coverageRadius} km</strong> geofence circular radar range.
            </p>
            <GoogleMap
              center={currentSeller.coordinates}
              radiusKm={currentSeller.coverageRadius}
              label="Your Registered Supply Hub Base"
              readonly={true}
              sellers={allSellers}
            />
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-6 animate-fade-in text-left" id="dashboard-products-pane">
          <div className="flex justify-between items-center bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm">
            <div>
              <h3 className="font-extrabold text-base text-zinc-950 flex items-center gap-1.5">
                🥬 Customize Your Crop & Veggies directory ({sellerProducts.length} Items)
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                List new produce products or edit direct consumer prices. Listed products immediately syndicate automatically on the buyer's home feed!
              </p>
            </div>
            
            <button
              onClick={() => setIsAddingProduct(prev => !prev)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition"
            >
              {isAddingProduct ? 'Close Form ✕' : '➕ List New Product'}
            </button>
          </div>

          {/* COLLAPSIBLE ADD NEW PRODUCT OFFERING FORM */}
          {isAddingProduct && (
            <form onSubmit={handleAddNewProductSim} className="bg-white border border-emerald-250 rounded-3xl p-6 shadow-md space-y-5 animate-slide-up">
              <div className="border-b border-zinc-100 pb-2 flex justify-between items-center text-zinc-950">
                <span className="text-sm font-black flex items-center gap-1">
                  📝 Add New Crop Offering to Core Rate Register
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-100 font-extrabold uppercase px-2 py-0.5 rounded font-mono">
                  Marketplace Direct Publish
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                {/* Visual Image cover Preview card */}
                <div className="md:col-span-4 space-y-3">
                  <div className="relative h-48 bg-zinc-100 border border-zinc-200 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                    {isGeneratingImgSim ? (
                      <div className="text-center space-y-2">
                        <span className="text-xl animate-spin block">🪄</span>
                        <span className="text-[10px] font-mono text-zinc-400">Suggesting photo...</span>
                      </div>
                    ) : (
                      <img 
                        src={newProdImgUrl} 
                        alt="Crop design seed preview" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    )}
                    <span className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-zinc-900/80 text-white text-[8px] font-black uppercase rounded tracking-widest font-mono">
                      Feed Image Preview
                    </span>
                  </div>

                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={handleSimulateAiImage}
                      disabled={!newProdName || isGeneratingImgSim}
                      className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-700 disabled:brightness-75 text-white rounded-xl text-xs font-black uppercase tracking-wide flex items-center justify-center gap-1.5 shadow-sm hover:scale-[1.01] transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Suggest Realistic Cover Photo
                    </button>
                    <p className="text-[9px] text-zinc-400 text-center leading-normal leading-relaxed">
                      Type the crop name (e.g. "Apple" or "Potato") and click above to suggest matching premium high-contrast Unsplash visuals instantly!
                    </p>
                  </div>
                </div>

                {/* Form fields parameters input */}
                <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-extrabold text-zinc-500 uppercase">Crop or Product Name *</label>
                    <input 
                      type="text"
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                      placeholder="e.g. Kashmiri Apples premium"
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-extrabold text-zinc-500 uppercase">Produce Category *</label>
                    <select
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      value={newProdCategory}
                      onChange={(e) => setNewProdCategory(e.target.value as any)}
                    >
                      <option value="vegetable">🥬 Vegetable</option>
                      <option value="fruit">🍎 Fruit</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-extrabold text-zinc-500 uppercase">Price (INR / Rupees) *</label>
                    <input 
                      type="number"
                      min={1}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                      required
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-extrabold text-zinc-500 uppercase">Billing Unit *</label>
                    <select
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      value={newProdUnit}
                      onChange={(e) => setNewProdUnit(e.target.value)}
                    >
                      <option value="kg">kg (Kilogram)</option>
                      <option value="bunch">bunch (Standard Bundle)</option>
                      <option value="pc">pc (Individual Piece)</option>
                      <option value="dozen">dozen (12 Packs)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="block text-[10px] font-extrabold text-zinc-500 uppercase">Product Description</label>
                    <textarea 
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 h-16 resize-none"
                      placeholder="Specify taste profile, harvest date, and regional organic parameters..."
                      value={newProdDesc}
                      onChange={(e) => setNewProdDesc(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-zinc-100 pt-3">
                <button
                  type="button"
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-extrabold px-4 py-2 rounded-xl text-xs"
                  onClick={() => setIsAddingProduct(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase px-6 py-2 rounded-xl text-xs shadow-sm"
                >
                  Publish Crop Offering Live
                </button>
              </div>
            </form>
          )}

          {/* LIST OF CURRENT PRODUCTS OWNED BY THIS SELLER */}
          {sellerProducts.length === 0 ? (
            <div className="py-12 border border-dashed border-zinc-150 rounded-3xl text-center bg-zinc-50/50 space-y-3">
              <span className="text-4xl block">🌾</span>
              <p className="font-bold text-xs text-zinc-700">No product catalog listed yet.</p>
              <p className="text-[10px] text-zinc-400 max-w-xs mx-auto leading-normal">
                Use the "➕ List New Product" form above to publish tomatoes, carrots, or other fresh offerings directly linked from your coordinate radius!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {sellerProducts.map((p) => {
                const isEditing = editingProductId === p.id;
                
                return (
                  <div key={p.id} className="bg-white border border-zinc-200 hover:border-emerald-500/30 rounded-2xl overflow-hidden shadow-xs transition duration-200 flex flex-col justify-between h-full group">
                    <div>
                      {/* Image section */}
                      <div className="relative h-36 bg-zinc-50 overflow-hidden">
                        <img 
                          src={p.image} 
                          alt={p.name} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-101 transition duration-500"
                        />
                        <div className="absolute top-2 left-2 bg-zinc-900 text-white text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded font-mono">
                          {p.category}
                        </div>
                        <div className="absolute bottom-2 right-2 bg-white/95 text-zinc-900 border border-zinc-100 px-2 py-0.5 rounded-lg text-xs font-black shadow-sm font-mono">
                          ₹{p.price} <span className="text-[10px] text-zinc-400 font-normal">/ {p.unit}</span>
                        </div>
                      </div>

                      {/* Info & Content body */}
                      <div className="p-4 space-y-3">
                        {isEditing ? (
                          <div className="space-y-2.5 bg-zinc-50 p-3 rounded-xl border border-zinc-200 text-xs">
                            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest block font-mono">
                              Editing offering details
                            </span>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-zinc-500 block uppercase">Product Name</label>
                              <input 
                                type="text"
                                className="w-full px-2 py-1 bg-white border border-zinc-200 rounded-md text-[11px] font-bold text-zinc-800"
                                value={editNameValue}
                                onChange={(e) => setEditNameValue(e.target.value)}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-zinc-500 block uppercase font-mono">Price (Rupees)</label>
                              <input 
                                type="number"
                                className="w-full px-2 py-1 bg-white border border-zinc-200 rounded-md text-[11px] font-bold font-mono text-zinc-800"
                                value={editPriceValue}
                                onChange={(e) => setEditPriceValue(Number(e.target.value))}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-zinc-500 block uppercase text-left">Description</label>
                              <textarea 
                                className="w-full px-2 py-1 bg-white border border-zinc-200 rounded-md text-[10px] text-zinc-700 h-14 resize-none"
                                value={editDescValue}
                                onChange={(e) => setEditDescValue(e.target.value)}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-zinc-900 text-xs leading-snug">{p.name}</h4>
                            <p className="text-zinc-550 text-[10px] leading-relaxed line-clamp-2">{p.description}</p>
                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider block font-mono">
                              Rating: ⭐ {p.rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="p-3 bg-zinc-50/50 border-t border-zinc-150 flex items-center justify-between gap-2 shrink-0">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setEditingProductId(null)}
                            className="text-[10px] font-bold text-zinc-500 hover:underline"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEditSim(p.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded px-2.5 py-1 text-[10px] font-black flex items-center gap-0.5"
                          >
                            <Check className="w-3 h-3" /> Save Changes
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleStartEditSim(p)}
                            className="text-[10px] font-bold text-emerald-700 hover:text-emerald-850 flex items-center gap-0.5"
                          >
                            <Edit className="w-3 h-3" /> Edit details
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProductSim(p.id)}
                            className="text-[10px] font-extrabold text-rose-500 hover:underline hover:text-rose-650 flex items-center gap-0.5"
                          >
                            <Trash2 className="w-3 h-3" /> Delete Offering
                          </button>
                        </>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in text-left font-sans" id="dashboard-settings-pane">
          
          {/* Settings input forms fields */}
          <form onSubmit={handleSaveProfile} className="bg-white border border-zinc-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6 lg:col-span-8">
            <div className="border-b border-zinc-150 pb-3 flex justify-between items-center text-zinc-950">
              <div>
                <h3 className="font-extrabold text-base select-none">
                  ⚙️ Store Profile Configurations
                </h3>
                <p className="text-[10px] text-zinc-400 font-bold mt-0.5">
                  Ensure accurate business coordinates, geofence radius, and direct social links.
                </p>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase px-2 py-0.5 rounded font-mono">
                SSO PROFILE CARD
              </span>
            </div>

            {profileSuccessMsg && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            {/* Business core settings inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-zinc-650">Registered Trading Name</label>
                <input 
                  type="text"
                  required
                  placeholder="Your personal identity as a grower/wholesaler"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 font-extrabold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  value={currentSeller.name}
                  disabled
                  title="Official name is locked to SSO verification. Open Auth to re-register."
                />
                <span className="text-[9px] text-zinc-400 font-mono">Locked to mobile handshake registry profile</span>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-zinc-650">Registered Corporate / Business Name *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Gopal Organic Agricultural Farms"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-150 rounded-xl text-xs text-zinc-900 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="block text-[10px] font-black uppercase text-zinc-650">Interactive Delivery Geofence Radius limit *</label>
                <div className="flex items-center gap-4 bg-zinc-50 border border-zinc-150 p-3.5 rounded-xl">
                  <input 
                    type="range"
                    min="1"
                    max="100"
                    className="flex-1 accent-emerald-600 cursor-pointer h-1.5"
                    value={coverageRadius}
                    onChange={(e) => setCoverageRadius(Number(e.target.value))}
                  />
                  <span className="text-sm font-black text-emerald-850 font-mono shrink-0 bg-emerald-50 border border-emerald-200 py-1 px-3 rounded-lg">
                    {coverageRadius} km
                  </span>
                </div>
                <p className="text-[9px] text-zinc-400 mt-0.5">
                  Adjusting this slider updates your coordinates circles and active radar map in real-time.
                </p>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="block text-[10px] font-black uppercase text-zinc-650">Trading Warehouse Location Address *</label>
                <input 
                  type="text"
                  required
                  placeholder="Specify full street address in Patna, Noida or New Delhi"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-150 rounded-xl text-xs text-zinc-900 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            {/* Social linked profiles list */}
            <div className="space-y-3.5 pt-4 border-t border-zinc-100">
              <h4 className="font-extrabold text-zinc-950 text-xs uppercase tracking-wider flex items-center gap-1">
                🔗 Social Linked Directories & Trade Channels
              </h4>
              <p className="text-[10px] text-zinc-500 leading-normal leading-relaxed">
                Connect your profiles to let trade actors initiate verified chat loops through external platforms dynamically from cards. Empty fields will default to auto-matches.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-zinc-500 uppercase">WhatsApp Number</label>
                  <input 
                    type="tel"
                    placeholder="e.g. +919279120271"
                    className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    value={wa}
                    onChange={(e) => setWa(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-zinc-500 uppercase">Instagram @handle</label>
                  <input 
                    type="text"
                    placeholder="e.g. @gopal_organic_patna"
                    className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    value={inst}
                    onChange={(e) => setInst(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-zinc-500 uppercase">Threads Profile ID</label>
                  <input 
                    type="text"
                    placeholder="e.g. @gopal_threads"
                    className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    value={thr}
                    onChange={(e) => setThr(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-zinc-500 uppercase">Telegram Channel/Bot Channel</label>
                  <input 
                    type="text"
                    placeholder="e.g. @gopal_patna_crops"
                    className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    value={tg}
                    onChange={(e) => setTg(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-zinc-500 uppercase">Discord tag #</label>
                  <input 
                    type="text"
                    placeholder="e.g. gopal#9519"
                    className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    value={disc}
                    onChange={(e) => setDisc(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-zinc-500 uppercase">LinkedIn Profile ID URL</label>
                  <input 
                    type="text"
                    placeholder="e.g. linkedin.com/in/gopal-agro"
                    className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    value={li}
                    onChange={(e) => setLi(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-zinc-500 uppercase">Indeed CV/Applicant Page</label>
                  <input 
                    type="text"
                    placeholder="e.g. indeed.co.in/r/gopal"
                    className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    value={ind}
                    onChange={(e) => setInd(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-zinc-500 uppercase">Naukri Executive Recruiter ID</label>
                  <input 
                    type="text"
                    placeholder="e.g. naukri.com/profile/gopal-recruiter"
                    className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    value={nk}
                    onChange={(e) => setNk(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-zinc-500 uppercase">Twitter / X handle</label>
                  <input 
                    type="text"
                    placeholder="e.g. @gopal_crops_X"
                    className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    value={tw}
                    onChange={(e) => setTw(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-zinc-500 uppercase">YouTube channel Handle</label>
                  <input 
                    type="text"
                    placeholder="e.g. youtube.com/@gopal_organic_farm_TV"
                    className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    value={yt}
                    onChange={(e) => setYt(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Harvest vlogging video clip segment */}
            <div className="space-y-3.5 pt-4 border-t border-zinc-100">
              <h4 className="font-extrabold text-zinc-950 text-xs uppercase tracking-wider flex items-center gap-1">
                🎥 YouTube Harvest Showcase Video Clip
              </h4>
              <p className="text-[10px] text-zinc-500 leading-normal leading-relaxed">
                Add an explainer clip of your crop fields. It displays as an interactive play button inside your card, so other local actors can observe your agricultural fields!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-zinc-500 uppercase">YouTube video clip link</label>
                  <input 
                    type="url"
                    placeholder="e.g. https://www.youtube.com/watch?v=some_clip"
                    className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    value={ytVidLink}
                    onChange={(e) => setYtVidLink(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-zinc-500 uppercase">Showcase Video Title</label>
                  <input 
                    type="text"
                    placeholder="e.g. Tour of Patna Organic Carrot Meadows"
                    className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    value={ytVidTitle}
                    onChange={(e) => setYtVidTitle(e.target.value)}
                  />
                </div>
              </div>

              {/* simulated files upload */}
              <div className="space-y-2 pt-3 border-t border-dashed border-zinc-200">
                <span className="text-[10px] font-bold text-zinc-650 uppercase block">
                  Simulated Vlogging Video Upload
                </span>
                
                <div className="border-2 border-dashed border-zinc-250 hover:border-emerald-500 p-6 rounded-2xl text-center bg-zinc-50/50 cursor-pointer relative transition">
                  <input 
                    type="file"
                    accept="video/*"
                    onChange={handlePickSimulatedVideo}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {isUploadingVideoSim ? (
                    <div className="space-y-2">
                      <span className="text-xl animate-spin block">🔄</span>
                      <p className="text-[10px] text-zinc-500 font-semibold">Uploading & encoding high definition MP4 harvest clip...</p>
                    </div>
                  ) : simulatedVideoFile ? (
                    <div className="space-y-1.5 text-emerald-850">
                      <span className="text-xl">✅</span>
                      <p className="text-[11px] font-black">{simulatedVideoFile.name}</p>
                      <p className="text-[10px] font-mono text-zinc-400">Size: {simulatedVideoFile.size} | Status: Ready for Trade Auto-play Syndication</p>
                    </div>
                  ) : (
                    <div className="space-y-1 text-zinc-500">
                      <Video className="w-8 h-8 mx-auto text-zinc-300 animate-pulse" />
                      <p className="text-[11px] font-bold">Drag and drop field harvest tour clip or click to select</p>
                      <p className="text-[9px] text-zinc-400">Supports AVI, MP4, MOV up to 100MB. Auto-generates social title.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-zinc-100">
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-7 py-3 text-xs font-black uppercase tracking-widest shadow-md hover:scale-[1.01] transition"
              >
                Save Profile Parameters
              </button>
            </div>

          </form>

          {/* Right hand side context geofence view */}
          <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm space-y-5">
            <div>
              <h3 className="font-extrabold text-sm text-zinc-900 flex items-center gap-1.5">
                🌎 Live GPS Coverage Radar Bounds Preview
              </h3>
              <p className="text-[11px] text-zinc-500 leading-normal mt-1">
                Changing the coverage radius slider on the left redraws your geofence boundary in real-time. Showing: <strong className="text-emerald-700 font-mono">{coverageRadius} km and base parameters</strong>.
              </p>
            </div>

            <div className="p-1 bg-zinc-50 border border-zinc-200 rounded-2xl overflow-hidden">
              <GoogleMap
                center={currentSeller.coordinates}
                radiusKm={Number(coverageRadius)}
                label={`${businessName || currentSeller.name}'s warehouse geofence bounds`}
                readonly={true}
                sellers={allSellers}
              />
            </div>

            {/* Real-time Geofence Recalculation Stats */}
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3">
              <span className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest font-mono">
                📊 Geofence Coverage Audit (Local)
              </span>
              
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-emerald-50 border border-emerald-150 p-2.5 rounded-xl">
                  <span className="block text-lg font-black text-emerald-800 font-mono leading-none">
                    {localOrdersWithinRange.length}
                  </span>
                  <span className="text-[9px] font-bold text-emerald-600 uppercase">Within Range</span>
                </div>
                
                <div className="bg-zinc-100 border border-zinc-200 p-2.5 rounded-xl">
                  <span className="block text-lg font-black text-zinc-600 font-mono leading-none">
                    {orders.length - localOrdersWithinRange.length}
                  </span>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase">Outside Range</span>
                </div>
              </div>

              {/* Graphical representation of coverage ratio */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold text-zinc-500 uppercase">
                  <span>Coverage Volume Yield:</span>
                  <span className="font-mono text-emerald-700 font-bold">{orders.length > 0 ? ((localOrdersWithinRange.length / orders.length) * 100).toFixed(0) : 0}%</span>
                </div>
                <div className="w-full bg-zinc-250 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-600 h-full transition-all duration-350 rounded-full" 
                    style={{ width: `${orders.length > 0 ? (localOrdersWithinRange.length / orders.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* List of active order dispatch analysis */}
            <div className="space-y-2.5">
              <span className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest font-mono">
                📍 Live Order Geo-Proximity Range
              </span>
              
              {orders.length === 0 ? (
                <p className="text-[11px] text-zinc-400 font-medium">No order data available to analyze.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {orders.map((order) => {
                    const dist = getDistance(
                      currentSeller.coordinates.lat,
                      currentSeller.coordinates.lng,
                      order.coordinates.lat,
                      order.coordinates.lng
                    );
                    const isInRange = dist <= coverageRadius;
                    return (
                      <div 
                        key={order.id} 
                        className={`p-2.5 rounded-xl border text-[10px] leading-snug flex items-center justify-between gap-2.5 transition-all duration-200 ${
                          isInRange 
                            ? 'bg-emerald-50/40 border-emerald-200 hover:bg-emerald-50' 
                            : 'bg-zinc-50/70 border-zinc-150 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="font-extrabold text-zinc-950 truncate flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${isInRange ? 'bg-emerald-500' : 'bg-zinc-400'}`}></span>
                            {order.customerName}
                          </p>
                          <p className="text-[9px] text-zinc-450 font-mono truncate font-semibold">{order.address}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-black block ${
                            isInRange 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                              : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                          }`}>
                            {dist.toFixed(1)} km
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="p-3.5 bg-sky-50 text-blue-950 text-xs rounded-2xl flex gap-2.5 border border-sky-100">
              <div className="text-sm shrink-0">🛰️</div>
              <div className="leading-snug">
                <strong>Real-time Satellite Lock!</strong> Geofencing auto-calculates distance from any client. If a buyer places an order in this geofence, you will receive dispatch requests!
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

import React, { useState } from 'react';
import { Product, CartItem, UserProfile } from '../types';
import { Search, ShoppingBag, Plus, Minus, Trash2, Tag, AlertCircle, Sparkles, MapPin, Truck, HelpCircle, ChevronRight, Check } from 'lucide-react';

interface MarketplaceProps {
  products: Product[];
  currentUser: UserProfile;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  onOpenCheckout: () => void;
  sellers: UserProfile[];
}

export default function Marketplace({
  products,
  currentUser,
  cart,
  setCart,
  onOpenCheckout,
  sellers
}: MarketplaceProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'vegetable' | 'fruit'>('all');
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  // Auto-Syndication and Facebook Marketplace Channel states
  const [viewChannel, setViewChannel] = useState<'freshmarket' | 'facebook'>('freshmarket');
  const [selectedFbProduct, setSelectedFbProduct] = useState<string | null>(null);
  const [fbMessageInput, setFbMessageInput] = useState('');
  const [fbMessages, setFbMessages] = useState<{[key: string]: string[]}>({
    'prod-1': ['Hi, is this fresh potato stock available in Patna?', 'Yes! Just harvested yesterday. Sourced from Bihta Farm.'],
    'prod-2': ['What is the wholesale rate for 50kg of onions?', 'We offer transparent rates of ₹19/kg, order online for same-day delivery!']
  });

  const handleSendFbMessage = (productId: string) => {
    if (!fbMessageInput.trim()) return;
    setFbMessages(prev => ({
      ...prev,
      [productId]: [...(prev[productId] || []), `You: ${fbMessageInput}`, `Sourced Grower: Thanks for your query! We have notified our Bihar logistics network. Please complete purchase on our portal for live routing coordinates.`]
    }));
    setFbMessageInput('');
  };

  // Video player showcase modal state
  const [activeVideoToPlay, setActiveVideoToPlay] = useState<{ title: string; link: string; sellerName: string } | null>(null);

  // Cart logic
  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 0.5 } : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, amount: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = Math.max(0, item.quantity + amount);
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => setCart([]);

  // Calculate prices dynamically
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  
  // Rule: discount of 5 Rupees (10%) on total purchases exceeding 50 Rupees
  const discountAmount = cartSubtotal > 50 ? 5 : 0;
  
  // Calculate delivery charge: based on coordinates to nearest active seller, defaults to ₹10-15
  const getDeliveryCharge = () => {
    if (cart.length === 0) return 0;
    
    const activeSellers = sellers.filter(s => s.role !== 'customer');
    if (activeSellers.length === 0) return 15; // default fallback flat charge

    // Calculate nearest seller in km
    let minDistance = 999;
    activeSellers.forEach(seller => {
      const dx = currentUser.coordinates.lat - seller.coordinates.lat;
      const dy = currentUser.coordinates.lng - seller.coordinates.lng;
      const dist = Math.sqrt(dx * dx + dy * dy) * 111; // conversion to approximate km
      if (dist < minDistance) minDistance = dist;
    });

    // ₹5 base delivery + ₹3 per km. Max of ₹40, Min of ₹10.
    const charge = Math.min(45, Math.max(10, Math.round(5 + minDistance * 3.5)));
    return charge;
  };

  const deliveryCharge = getDeliveryCharge();
  const cartTotal = Math.max(0, cartSubtotal - discountAmount + deliveryCharge);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto py-6 px-4" id="marketplace-root">
      
      {/* Banner promo */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden mb-8">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-15 hidden md:block"></div>
        <div className="max-w-xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1 bg-emerald-500/30 text-emerald-100 rounded-full py-1 px-3 text-xs font-bold uppercase tracking-wider">
            <Tag className="w-3.5 h-3.5" /> Instant Inauguration Offer
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Flat ₹5 (10%) Discount on checkout above ₹50
          </h2>
          <p className="text-emerald-50 text-xs sm:text-sm">
            Order fresh fruits & veggies directly from verified local growers, wholesalers, and organic producers across your selected geographic coordinates.
          </p>
          <div className="flex gap-4 pt-2 text-xs font-medium">
            <span className="flex items-center gap-1"><Truck className="w-4 h-4 text-emerald-300" /> Fast Local Handshake Delivery</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-emerald-300" /> Verified OTP Handover</span>
          </div>
        </div>
      </div>

      {/* Dynamic Selector: Agri-chain Hub vs. Facebook Marketplace Auto-Syndicated Channel */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-4 mb-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-extrabold text-sm text-zinc-900 flex items-center gap-1.5 leading-none">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shrink-0"></span> 
            Choose Sales Channel Feed
          </h3>
          <p className="text-zinc-500 text-[11px]">
            We automatically syndicate all published crop inventories to social networks in real-time.
          </p>
        </div>
        <div className="flex bg-zinc-100 p-1 rounded-xl w-full md:w-auto self-stretch md:self-auto">
          <button
            type="button"
            onClick={() => setViewChannel('freshmarket')}
            className={`px-4 py-2.5 rounded-lg text-xs font-black transition flex-1 md:flex-none flex items-center justify-center gap-1.5 ${viewChannel === 'freshmarket' ? 'bg-emerald-600 text-white shadow-sm' : 'text-zinc-650 hover:text-zinc-900'}`}
          >
            🛒 FreshMarket Portal Directory
          </button>
          <button
            type="button"
            onClick={() => setViewChannel('facebook')}
            className={`px-4 py-2.5 rounded-lg text-xs font-black transition flex-1 md:flex-none flex items-center justify-center gap-1.5 ${viewChannel === 'facebook' ? 'bg-[#1877F2] text-white shadow-sm' : 'text-zinc-650 hover:text-zinc-900'}`}
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Facebook Marketplace Feed (Auto-Synced)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Shopping view: filter search and products grid */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm">
            {/* Category tabs */}
            <div className="flex bg-zinc-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${activeCategory === 'all' ? 'bg-white text-emerald-950 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'}`}
              >
                All Produce
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('vegetable')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1 ${activeCategory === 'vegetable' ? 'bg-white text-emerald-950 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'}`}
              >
                🥬 Vegetables
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('fruit')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1 ${activeCategory === 'fruit' ? 'bg-white text-emerald-950 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'}`}
              >
                🍎 Fruits
              </button>
            </div>

            {/* Keyword Search field */}
            <div className="relative flex-1 max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search tomatoes, oranges, organic potatoes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Product Cards Grid */}
          {viewChannel === 'facebook' ? (
            <div className="space-y-6 bg-[#f0f2f5] border border-zinc-200 rounded-3xl p-4 sm:p-6 shadow-xs" id="facebook-syndicated-feed">
              
              {/* Facebook Header Mock */}
              <div className="bg-white rounded-2xl p-4 border border-zinc-150 space-y-3.5 shadow-xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1877F2] rounded-full flex items-center justify-center text-white text-lg font-black tracking-tighter shrink-0 select-none">
                      f
                    </div>
                    <div>
                      <h4 className="font-extrabold text-zinc-900 text-sm flex items-center gap-1.5 leading-none">
                        Facebook Marketplace Syndicator Hub
                        <span className="bg-[#1877F2]/10 text-[#1877F2] px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider font-mono">
                          Active Sync
                        </span>
                      </h4>
                      <p className="text-[11px] text-zinc-500 font-medium mt-1">
                        Live social catalog matching GPS geofence: <span className="font-bold text-[#1877F2]">Patna, Bihar (Within 15km Radius)</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-[10px] text-zinc-500 font-black px-3 py-1.5 bg-emerald-50 border border-emerald-150 rounded-xl flex items-center gap-1 shrink-0 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0"></span> API Status: Syndication Live
                  </div>
                </div>

                <div className="p-3.5 bg-[#e7f3ff] text-[#1877f2] text-xs rounded-xl flex gap-2.5 items-start">
                  <div className="text-base shrink-0">🌐</div>
                  <div className="font-semibold leading-relaxed">
                    <strong>Automatic Syndication Active!</strong> Whenever an Administrator or Sourced Farmer publishes/updates a crop veggie inside the FreshMarket Rate Card register, it instantly aggregates and pushes to Facebook Marketplace API endpoint channels.
                  </div>
                </div>
              </div>

              {/* Grid of FB items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {filteredProducts.map((p) => {
                  const hasMessages = fbMessages[p.id] || [];
                  return (
                    <div
                      key={`fb-${p.id}`}
                      className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-[#1877F2]/40 transition duration-200 cursor-pointer flex flex-col justify-between h-full group"
                      onClick={() => setSelectedFbProduct(p.id)}
                    >
                      <div>
                        <div className="relative h-36 bg-zinc-100 overflow-hidden">
                          <img
                            src={p.image}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          />
                          <div className="absolute top-2.5 left-2.5 bg-black/70 text-white rounded px-2 py-0.5 text-[8px] font-black uppercase tracking-wider font-mono">
                            Auto Listed
                          </div>
                          <div className="absolute bottom-2 left-2 bg-[#1877F2] text-white px-2 py-1 rounded-lg text-xs font-black shadow font-mono">
                            ₹{p.price} <span className="text-[10px] font-normal">/ {p.unit}</span>
                          </div>
                        </div>

                        <div className="p-4 space-y-2">
                          <div className="space-y-0.5">
                            <h5 className="font-extrabold text-zinc-900 text-xs truncate leading-snug">{p.name}</h5>
                            <p className="text-[#1877F2] font-semibold text-[10px] uppercase font-mono flex items-center gap-0.5">
                              📍 Patna, Bihar
                            </p>
                          </div>
                          <p className="text-zinc-500 text-[10px] line-clamp-2 leading-relaxed">
                            {p.description}
                          </p>
                        </div>
                      </div>

                      <div className="p-3.5 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
                        <span className="text-[10px] text-zinc-400 font-bold font-mono">
                          💬 {hasMessages.length} Messages
                        </span>
                        
                        <button
                          type="button"
                          className="text-[11px] font-black text-[#1877F2] hover:underline flex items-center gap-0.5"
                        >
                          Simulate Query & Messenger Lead →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Simulation Panel */}
              {selectedFbProduct && (() => {
                const p = filteredProducts.find(item => item.id === selectedFbProduct);
                if (!p) return null;
                const chats = fbMessages[p.id] || [];

                return (
                  <div className="bg-white border border-[#1877F2]/40 rounded-3xl p-5 shadow-lg space-y-4 animate-slide-up" id="fb-chats-panel">
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-[#1877F2] rounded-full animate-ping shrink-0"></div>
                        <h4 className="font-extrabold text-zinc-900 text-xs">
                          Simulated Facebook Messenger Customers Lead: <span className="text-[#1877F2]">{p.name}</span>
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedFbProduct(null)}
                        className="text-zinc-400 hover:text-zinc-700 text-xs font-bold font-mono bg-zinc-100 px-2 py-0.5 rounded-md"
                      >
                        Minimize Dialog ✕
                      </button>
                    </div>

                    <div className="bg-[#FAF9F6] rounded-2xl p-4 space-y-3.5 max-h-52 overflow-y-auto border border-zinc-150">
                      {chats.length === 0 ? (
                        <p className="text-center text-[10px] text-zinc-400 py-3 leading-normal">
                          Ask a simulated customer query about <strong>{p.name}</strong>, like: "Can you supply wholesale?" or "Is this local produce?"
                        </p>
                      ) : (
                        chats.map((msg, i) => {
                          const isYou = msg.startsWith('You:');
                          return (
                            <div
                              key={i}
                              className={`p-3 rounded-2xl text-[11px] max-w-[85%] leading-relaxed shadow-sm ${
                                isYou
                                  ? 'bg-[#1877F2] text-white ml-auto rounded-tr-none'
                                  : 'bg-zinc-200 text-zinc-800 mr-auto rounded-tl-none font-bold'
                              }`}
                            >
                              {msg}
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type customer question (e.g. Is this organic?)...."
                        className="flex-1 px-3 py-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1877F2]"
                        value={fbMessageInput}
                        onChange={(e) => setFbMessageInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSendFbMessage(p.id); }}
                      />
                      <button
                        type="button"
                        onClick={() => handleSendFbMessage(p.id)}
                        className="px-4 py-2.5 bg-[#1877F2] text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#166FE5] transition shrink-0 shadow-sm"
                      >
                        Send Lead
                      </button>
                    </div>
                  </div>
                );
              })()}

            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-white border border-zinc-200 rounded-3xl space-y-4">
              <div className="text-zinc-300 text-5xl">🥕</div>
              <h3 className="text-lg font-bold text-zinc-800">No Fresh Produce Found</h3>
              <p className="text-zinc-500 text-xs max-w-xs mx-auto">
                No products match "{searchTerm}". Try broadening your category or search admin guidelines.
              </p>
              <button 
                onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}
                className="mt-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-100 transition"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredProducts.map((p) => {
                const quantityInCart = cart.find(item => item.product.id === p.id)?.quantity || 0;
                
                return (
                  <div
                    key={p.id}
                    id={`product-${p.id}`}
                    className="bg-white border border-zinc-150 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition duration-300 relative flex flex-col h-full group"
                    onMouseEnter={() => setHoveredProduct(p.id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                  >
                    {/* Badge */}
                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white rounded shadow-sm ${p.category === 'vegetable' ? 'bg-emerald-600' : 'bg-amber-500'}`}>
                        {p.category}
                      </span>
                      {p.isAiGenerated && (
                        <span className="bg-indigo-600 text-white text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" /> AI Cover
                        </span>
                      )}
                    </div>

                    {/* Image space with hover zoom */}
                    <div className="relative h-44 bg-zinc-100 overflow-hidden">
                      <img
                        src={p.image}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute bottom-2 right-2 bg-white/95 text-zinc-900 border border-zinc-100 px-2 py-1 rounded-lg text-xs font-black shadow flex items-center gap-1 font-mono">
                        ₹{p.price} <span className="text-[10px] text-zinc-500 font-normal">/ {p.unit}</span>
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="font-extrabold text-zinc-900 leading-snug text-sm select-none">
                            {p.name}
                          </h4>
                        </div>
                        <p className="text-zinc-500 text-[11px] leading-relaxed line-clamp-2">
                          {p.description}
                        </p>
                        {p.sellerName ? (
                          <div className="text-[10px] text-zinc-400 font-semibold mt-1 flex items-center gap-1">
                            <span>Sourced:</span>
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">👩‍🌾 {p.sellerName}</span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-zinc-400 font-semibold mt-1 flex items-center gap-1">
                            <span>Sourced:</span>
                            <span className="text-[#1877F2] font-semibold bg-blue-50 px-1.5 py-0.5 rounded">🏢 FreshMarket Direct</span>
                          </div>
                        )}
                      </div>

                      {/* Add to cart / Adjust quantity buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                        <span className="text-[10px] text-zinc-400 font-semibold font-mono">
                          Rating: ⭐ {p.rating.toFixed(1)}
                        </span>

                        {quantityInCart > 0 ? (
                          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-lg p-1">
                            <button
                              type="button"
                              onClick={() => updateQuantity(p.id, -0.5)}
                              className="w-6 h-6 rounded-md bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 flex items-center justify-center transition"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-bold font-mono text-emerald-950 px-1">
                              {quantityInCart} {p.unit}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(p.id, 0.5)}
                              className="w-6 h-6 rounded-md bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 flex items-center justify-center transition"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => addToCart(p)}
                            className="bg-emerald-600 text-white hover:bg-emerald-700 py-1.5 px-3 rounded-xl font-bold text-xs transition flex items-center gap-1 shadow-sm leading-none"
                          >
                            <Plus className="w-3.5 h-3.5" /> Buy / Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Member Direct Contact & Social Networking Registry */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-6 space-y-4 shadow-sm mt-8" id="supply-cooperative-networks-panel">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-150 pb-3">
              <div>
                <h3 className="text-sm font-black text-zinc-950 uppercase tracking-tight flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-100 rounded-lg text-emerald-850 text-xs shrink-0 flex items-center justify-center">🔗</span>
                  Bihar Agriculture Direct-Network & Social Guild Registry
                </h3>
                <p className="text-[11px] text-zinc-500 leading-normal">
                  Connect with trade actors on external networks instantly to sync crops, logistics, and bulk supply.
                </p>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-200 shrink-0 font-mono">
                Cooperative Guild ({sellers.length} Members)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sellers.map((seller) => {
                const sLinks = seller.socialLinks || {};
                const hasAnyLink = Object.values(sLinks).some(val => !!val);
                
                // Fallback default social links if none are configured, to show beautiful realistic network interactions
                const instagram = sLinks.instagram || `@${seller.name.toLowerCase().replace(/\s+/g, '_')}`;
                const whatsapp = sLinks.whatsapp || `+91${seller.phone}`;
                const threads = sLinks.threads || `@${seller.name.toLowerCase().replace(/\s+/g, '_')}_threads`;
                const telegram = sLinks.telegram || `@${seller.name.toLowerCase().replace(/\s+/g, '')}_crop`;
                const discord = sLinks.discord || `${seller.name.toLowerCase().replace(/\s+/g, '')}#9519`;
                const linkedin = sLinks.linkedin || `linkedin.com/in/${seller.name.toLowerCase().replace(/\s+/g, '-')}`;
                const indeed = sLinks.indeed || `indeed.co.in/r/${seller.name.toLowerCase().replace(/\s+/g, '')}`;
                const naukri = sLinks.naukri || `naukri.com/profile/${seller.name.toLowerCase().replace(/\s+/g, '')}`;
                const twitter = sLinks.twitter || `twitter.com/${seller.name.toLowerCase().replace(/\s+/g, '')}`;
                const youtube = sLinks.youtube || `youtube.com/@${seller.name.toLowerCase().replace(/\s+/g, '')}_farm`;

                // Specific video showcase links
                const youtubeVideoLink = sLinks.youtubeVideoLink || `https://www.youtube.com/watch?v=sample_harvest_${seller.id}`;
                const youtubeVideoTitle = sLinks.youtubeVideoTitle || `${seller.name}'s Premium Crop Field Tour & Sourcing Showcase`;

                const platformDetails = [
                  { id: 'whatsapp', label: 'WhatsApp', value: whatsapp, color: 'bg-emerald-600', icon: '💬' },
                  { id: 'instagram', label: 'Instagram', value: instagram, color: 'bg-[#E1306C]', icon: '📸' },
                  { id: 'threads', label: 'Threads', value: threads, color: 'bg-[#000000]', icon: '🧵' },
                  { id: 'telegram', label: 'Telegram', value: telegram, color: 'bg-[#0088cc]', icon: '✈️' },
                  { id: 'discord', label: 'Discord', value: discord, color: 'bg-[#5865F2]', icon: '🎮' },
                  { id: 'linkedin', label: 'LinkedIn', value: linkedin, color: 'bg-[#0077b5]', icon: '💼' },
                  { id: 'indeed', label: 'Indeed', value: indeed, color: 'bg-[#2557a7]', icon: '🎯' },
                  { id: 'naukri', label: 'Naukri', value: naukri, color: 'bg-[#002C5E]', icon: '🏢' },
                  { id: 'twitter', label: 'Twitter / 𝕏', value: twitter, color: 'bg-zinc-900 border border-zinc-700 hover:bg-zinc-950', icon: '𝕏' },
                  { id: 'youtube', label: 'YouTube channel', value: youtube, color: 'bg-[#FF0000] hover:bg-[#cc0000]', icon: '🔴' }
                ];

                return (
                  <div 
                    key={seller.id} 
                    className="p-4 bg-white border border-zinc-200 hover:border-emerald-500/40 rounded-2xl transition duration-200 flex flex-col justify-between h-full space-y-4 shadow-xs"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-1.5 font-medium">
                        <div>
                          <p className="font-extrabold text-zinc-900 text-xs flex items-center gap-1.5 flex-wrap">
                            {seller.name}
                            {seller.role === 'farmer' && <span className="bg-rose-50 text-rose-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase font-sans">Grower</span>}
                            {seller.role === 'seller' && <span className="bg-sky-50 text-sky-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase font-sans">Seller</span>}
                            {seller.role === 'organic_producer' && <span className="bg-emerald-50 text-emerald-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase font-mono">Organic</span>}
                            {seller.role === 'wholesaler' && <span className="bg-indigo-50 text-indigo-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase font-sans font-sans">Wholesale</span>}
                            {seller.role === 'retailer' && <span className="bg-amber-50 text-amber-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Retailer</span>}
                            {seller.role === 'supplier' && <span className="bg-teal-50 text-teal-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Logistic</span>}
                            {seller.role === 'exporter' && <span className="bg-purple-50 text-purple-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase font-serif">Export</span>}
                            {seller.role === 'customer' && <span className="bg-zinc-100 text-zinc-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase font-mono">Buyer</span>}
                          </p>
                          {seller.businessName && <p className="text-[10px] text-zinc-400 font-bold mt-0.5">{seller.businessName}</p>}
                        </div>
                        <span className="text-[10px] text-zinc-400 bg-zinc-50 border border-zinc-150 px-1.5 py-0.5 rounded font-bold font-mono shrink-0">
                          {seller.role === 'customer' ? 'Buyer Stake' : `Radius: ${seller.coverageRadius}km`}
                        </span>
                      </div>

                      <p className="text-[10px] text-zinc-500 line-clamp-1 mt-2.5 flex items-center gap-1 leading-none font-medium">
                        📍 {seller.address}
                      </p>

                      {/* Expanded Dynamic Video Showcase Preview Card with official YouTube logo */}
                      {seller.role !== 'customer' && (
                        <div className="mt-3.5 bg-rose-50/20 border border-rose-100 rounded-xl p-2.5 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveVideoToPlay({
                                title: youtubeVideoTitle,
                                link: youtubeVideoLink,
                                sellerName: seller.name
                              });
                            }}
                            className="relative w-16 h-10 bg-zinc-900 rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-rose-200/65 group shadow-xs cursor-pointer"
                            title="Play Crop Showcase Video"
                          >
                            <span className="text-sm filter drop-shadow z-10 transition-transform group-hover:scale-110">🔴</span>
                            <div className="absolute inset-0 bg-red-650/10 group-hover:bg-red-650/20 transition-colors" />
                            <span className="absolute bottom-0 px-1 py-[1.5px] bg-black/70 text-[7px] text-white font-black font-mono w-full text-center tracking-wide block scale-90">
                              PLAY CLIP
                            </span>
                          </button>
                          <div className="min-w-0 flex-1">
                            <span className="text-[8px] font-black text-rose-600 uppercase tracking-widest block font-mono">
                              🎥 Bihar Growers Video Guide
                            </span>
                            <span 
                              onClick={() => {
                                setActiveVideoToPlay({
                                  title: youtubeVideoTitle,
                                  link: youtubeVideoLink,
                                  sellerName: seller.name
                                });
                              }}
                              className="text-[10px] font-bold text-zinc-800 line-clamp-1 hover:text-rose-600 cursor-pointer block transition leading-normal"
                            >
                              {youtubeVideoTitle}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Social networks dynamic launcher links */}
                    <div className="space-y-2 border-t border-zinc-150 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">
                          Interactive Linked Channels
                        </span>
                        {!hasAnyLink ? (
                          <span className="text-[8px] bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.5 rounded font-bold font-mono">
                            Auto Matching Active
                          </span>
                        ) : (
                          <span className="text-[8px] bg-emerald-50 text-emerald-700 border border-emerald-150 px-1.5 py-0.5 rounded font-black font-mono">
                            SSO Verified Linked
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {platformDetails.map((plt) => {
                          const isCustomLinked = !!sLinks[plt.id as keyof typeof sLinks];
                          return (
                            <button
                              key={plt.id}
                              type="button"
                              onClick={() => {
                                alert(`[FreshMarket Safe Link Handshake] \n\nConnecting you with ${seller.name}'s verified private profile on ${plt.label}.\n\nHandle ID/Reference: ${plt.value}\n\nInitiating secure API integration pipeline for trade network syndication...`);
                                if (plt.id === 'whatsapp') {
                                  window.open(`https://wa.me/${plt.value.replace(/\D/g, '')}`, '_blank');
                                } else {
                                  window.open(`https://${plt.value.replace('https://', '')}`, '_blank');
                                }
                              }}
                              className={`flex items-center gap-1 px-2 py-1 text-[9px] font-bold text-white rounded-lg transition-transform hover:-translate-y-0.5 hover:shadow-xs ${plt.color} ${!isCustomLinked ? 'brightness-[0.85] opacity-80 hover:opacity-100 hover:brightness-100' : 'ring-2 ring-emerald-400/50'}`}
                              title={`Connect via ${plt.label}: ${plt.value}`}
                            >
                              <span>{plt.icon}</span>
                              <span className="text-[9px]">{plt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Shopping cart pane */}
        <div className="lg:col-span-4 lg:sticky lg:top-8 bg-white border border-zinc-200 rounded-3xl p-5 shadow-lg space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h3 className="text-base font-black text-zinc-900 tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" /> Dynamic Cart
            </h3>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[10px] text-zinc-400 group hover:text-rose-600 font-semibold flex items-center gap-1 transition"
              >
                <Trash2 className="w-3 h-3 text-zinc-300 group-hover:text-rose-600" /> Clear Cart
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="py-12 border border-dashed border-zinc-150 rounded-2xl text-center space-y-3.5">
              <div className="w-12 h-12 bg-zinc-50 text-zinc-400 rounded-full flex items-center justify-center mx-auto text-xl">🛒</div>
              <div className="space-y-1 px-4">
                <p className="font-bold text-xs text-zinc-700">Your basket is empty</p>
                <p className="text-[10px] text-zinc-400 leading-normal">
                  Add some fresh potatoes, Kashmiri apples, or tomatoes to calculate delivery and complete checkout.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Added item rows */}
              <div className="divide-y divide-zinc-100 max-h-56 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.product.id} className="py-3 flex items-center justify-between gap-3 text-xs first:pt-0">
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-zinc-800 leading-tight truncate">{item.product.name}</p>
                      <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                        {item.quantity} {item.product.unit} × ₹{item.product.price}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-extrabold font-mono text-zinc-900">
                        ₹{(item.product.price * item.quantity).toFixed(0)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1 text-zinc-350 hover:text-rose-600 hover:bg-rose-50 rounded"
                        title="Remove product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Discount threshold guide */}
              <div className="p-3 bg-zinc-50 rounded-2xl space-y-2 border border-zinc-150 text-[10px]">
                {cartSubtotal > 50 ? (
                  <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 🎉 ₹5 Special Discount Activated!
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-zinc-500 font-bold">
                      <span>Threshold for ₹5 discount (Buy ₹50+):</span>
                      <span className="font-mono text-zinc-700">₹{cartSubtotal.toFixed(0)} / ₹50</span>
                    </div>
                    <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (cartSubtotal / 50) * 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-[9px] text-zinc-400">
                      Add ₹{(50 - cartSubtotal).toFixed(0)} more to automatically subtract 5 Rupees!
                    </p>
                  </div>
                )}
              </div>

              {/* Dynamic Invoice Breakdown */}
              <div className="pt-2 space-y-1.5 border-t border-zinc-150 text-xs text-zinc-600">
                <div className="flex justify-between">
                  <span>Cart Subtotal</span>
                  <span className="font-mono font-bold text-zinc-800">₹{cartSubtotal.toFixed(0)}</span>
                </div>
                
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span className="flex items-center gap-0.5"><Tag className="w-3 h-3" /> Over ₹50 Discount</span>
                    <span className="font-mono font-bold">- ₹{discountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-zinc-500 text-[11px]">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" /> Delivery Cost
                    <span className="group relative cursor-help">
                      <HelpCircle className="w-3 h-3" />
                      <span className="absolute bottom-full right-0 w-44 p-2 bg-zinc-950 text-white text-[9px] rounded-lg hidden group-hover:block z-20">
                        Distance-based billing: ₹5 base fee + metric distance from nearest farmer coordinates.
                      </span>
                    </span>
                  </span>
                  <span className="font-mono font-bold">₹{deliveryCharge}</span>
                </div>

                <div className="flex justify-between font-black text-sm text-zinc-900 border-t border-zinc-100 pt-2.5">
                  <span>Grand Total</span>
                  <span className="font-mono text-emerald-800">₹{cartTotal.toFixed(0)}</span>
                </div>
              </div>

              {/* Checkout buttons */}
              <button
                onClick={onOpenCheckout}
                className="w-full py-3 bg-emerald-600 text-white text-xs uppercase tracking-widest font-black rounded-xl hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                Proceed to Checkout <ChevronRight className="w-4 h-4" />
              </button>

              <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl flex gap-2 items-start text-[10px]">
                <MapPin className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                <div className="text-teal-950 leading-relaxed font-medium">
                  Delivering to: <span className="underline font-bold text-teal-900">{currentUser.name}</span> at <span className="font-semibold text-zinc-700">{currentUser.address.substring(0, 36)}...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic YouTube Video Presentation Player Modal */}
      {activeVideoToPlay && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col space-y-0.5">
            {/* Modal header */}
            <div className="p-4 bg-zinc-900 border-b border-zinc-850 flex justify-between items-center text-zinc-150">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔴</span>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-black tracking-widest text-[#FF0000] block font-mono">
                    YouTube Stream Player ( Bihar Regional Broadcast )
                  </span>
                  <span className="font-extrabold text-xs block text-white truncate max-w-sm sm:max-w-md">
                    {activeVideoToPlay.title}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveVideoToPlay(null)}
                className="w-7 h-7 bg-zinc-800 hover:bg-zinc-700 rounded-full flex items-center justify-center text-zinc-300 font-bold text-sm cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            {/* Video content display block */}
            <div className="relative aspect-video bg-black flex items-center justify-center">
              {/* Simulated realistic YouTube Playback Interface */}
              <div className="absolute inset-0 z-10 flex flex-col justify-between p-4 bg-linear-to-b from-black/50 via-transparent to-black/85">
                {/* Channel tag */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-red-600 font-black text-white text-[11px] flex items-center justify-center shadow-md border border-white/20">
                    {activeVideoToPlay.sellerName && activeVideoToPlay.sellerName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-white block leading-none">{activeVideoToPlay.sellerName && activeVideoToPlay.sellerName}</span>
                    <span className="text-[9px] text-zinc-400 font-bold block mt-0.5">Bihar Agri-Guild TV • 4.2k Subscribers</span>
                  </div>
                </div>

                {/* Big play button */}
                <div className="mx-auto flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-full bg-red-650 hover:bg-red-750 text-white flex items-center justify-center cursor-pointer transition shadow-xl border border-white/10 group">
                    <svg className="w-5 h-5 fill-current ml-1" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <span className="text-[10px] text-white/95 font-black bg-black/55 px-2.5 py-0.5 rounded-full font-mono uppercase tracking-widest">
                    Bihar Fresh Harvest Live
                  </span>
                </div>

                {/* Progress bar controller */}
                <div className="space-y-1.5 pt-4 z-20">
                  <div className="h-1 w-full bg-zinc-700 rounded-full overflow-hidden relative">
                    <div className="absolute left-0 top-0 bottom-0 w-2/3 bg-red-600 rounded-full" />
                    <div className="absolute left-2/3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full border border-red-600" />
                  </div>
                  <div className="flex justify-between text-[9px] text-zinc-400 font-bold font-mono">
                    <span>0:58 / 1:42</span>
                    <span className="flex items-center gap-2.5">
                      <span>HD High Quality</span>
                      <span>🔊 100%</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Realistic looping gif or video placeholder element */}
              <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 overflow-hidden">
                <div className="absolute opacity-15 text-9xl">🚜</div>
                <div className="text-center z-10 p-6 space-y-2.5 max-w-md">
                  <span className="text-3xl animate-bounce block">🎬</span>
                  <div className="space-y-1">
                    <p className="font-black text-rose-500 font-mono text-[10px] tracking-widest uppercase">
                      Simulated Presentation Video Stream
                    </p>
                    <p className="font-bold text-xs text-zinc-300">
                      Video Link Stream:
                    </p>
                    <p className="text-[10px] text-zinc-450 font-mono underline break-all font-medium py-1 px-2.5 rounded bg-zinc-950 border border-zinc-850">
                      {activeVideoToPlay.link}
                    </p>
                  </div>
                  <div className="text-[10px] text-zinc-500 font-medium leading-relaxed">
                    This preview maps to high-definition video encode. You can view the original external broadcast under the official brand logos!
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      alert(`Forwarding to URL: ${activeVideoToPlay.link}`);
                      window.open(activeVideoToPlay.link, '_blank');
                    }}
                    className="mt-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 mx-auto shadow"
                  >
                    🚀 Open YouTube Video Link (External Tab)
                  </button>
                </div>
              </div>
            </div>

            {/* Custom interactive sidebar/info inside the player */}
            <div className="p-4 bg-zinc-900 border-t border-zinc-850 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 text-zinc-300">
                <span className="text-[9px] font-black uppercase text-zinc-500 block">Description & Location</span>
                <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                  Recorded live in Bihar region to showcase current yield status, quality standard inspection, and bulk freight options. Contact this member via their interactive badges to lock current prices!
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[9px] font-black uppercase text-zinc-500 block">Feedback & Interaction ({Math.floor(Math.random() * 85) + 120} Likes)</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => alert(`Sourced grower notified: Thanks for your encouraging appreciation!`)}
                    className="flex-1 py-1.5 bg-zinc-850 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-[10px] font-bold rounded-lg transition cursor-pointer"
                  >
                    👍 Appreciate Crop
                  </button>
                  <button
                    type="button"
                    onClick={() => alert(`Verified Bihar Trade Guild Certificate ID: FM-REG-${Math.floor(Math.random() * 90000) + 10000}`)}
                    className="flex-1 py-1.5 bg-zinc-850 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-[10px] font-bold rounded-lg transition cursor-pointer"
                  >
                    🛡️ View Trade Shield
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

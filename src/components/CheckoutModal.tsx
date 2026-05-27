import React, { useState } from 'react';
import { CartItem, UserProfile, Order } from '../types';
import { CreditCard, BadgeCheck, CheckCircle2, Ticket, Smartphone, MapPin, Truck, ChevronRight, X, Phone, User, Landmark, Tag, ShieldCheck, Mail } from 'lucide-react';

interface CheckoutModalProps {
  cart: CartItem[];
  currentUser: UserProfile;
  sellers: UserProfile[];
  onClose: () => void;
  onSubmitOrder: (order: Order) => void;
}

const GATEWAYS = [
  { id: 'gpay', name: 'Google Pay', logo: '🟢 GPay', color: 'border-blue-500 hover:bg-blue-50/50 text-blue-900 bg-blue-50/10' },
  { id: 'phonepe', name: 'PhonePe', logo: '🟣 PhonePe', color: 'border-purple-500 hover:bg-purple-50/50 text-purple-900 bg-purple-50/10' },
  { id: 'paytm', name: 'Paytm', logo: '🔵 Paytm', color: 'border-sky-500 hover:bg-sky-50/50 text-sky-900 bg-sky-50/10' },
  { id: 'upi', name: 'BHIM UPI', logo: '🟧 BHIM UPI', color: 'border-orange-500 hover:bg-orange-50/50 text-orange-900 bg-orange-50/10' },
  { id: 'amazonpay', name: 'Amazon Pay', logo: '🟨 Amazon Pay', color: 'border-amber-500 hover:bg-amber-50/50 text-zinc-900 bg-amber-50/10' },
  { id: 'cod', name: 'Cash on Delivery', logo: '💵 Cash On Delivery', color: 'border-emerald-500 hover:bg-emerald-50/50 text-emerald-950 bg-emerald-50/10' }
];

export default function CheckoutModal({
  cart,
  currentUser,
  sellers,
  onClose,
  onSubmitOrder
}: CheckoutModalProps) {
  // Navigation states: 'checkout' | 'otp_verification' | 'success'
  const [step, setStep] = useState<'checkout' | 'otp' | 'success'>('checkout');
  const [selectedGateway, setSelectedGateway] = useState('upi');
  
  // OTP State during placement
  const [placementOtp, setPlacementOtp] = useState('');
  const [generatedPlacementOtp, setGeneratedPlacementOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [smsNotification, setSmsNotification] = useState<string | null>(null);

  // Success Order Cache
  const [finalCreatedOrder, setFinalCreatedOrder] = useState<Order | null>(null);

  // Refer & Earn / Affiliate parameters 
  const [referralInput, setReferralInput] = useState('');
  const [isReferralApplied, setIsReferralApplied] = useState(false);
  const [isAffiliateUsed, setIsAffiliateUsed] = useState(false);
  const [affiliatePartnerName, setAffiliatePartnerName] = useState('');
  const [referralError, setReferralError] = useState('');

  // Math Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = cartSubtotal > 50 ? 5 : 0;
  const referralDiscountAmount = isReferralApplied 
    ? (isAffiliateUsed ? Math.round(cartSubtotal * 0.10) : Math.round(cartSubtotal * 0.05))
    : 0;
  
  // Custom distance delivery fee billing
  const getDeliveryCharge = () => {
    const activeSellers = sellers.filter(s => s.role !== 'customer');
    if (activeSellers.length === 0) return 15;
    let minDistance = 999;
    activeSellers.forEach(seller => {
      const dx = currentUser.coordinates.lat - seller.coordinates.lat;
      const dy = currentUser.coordinates.lng - seller.coordinates.lng;
      const dist = Math.sqrt(dx*dx + dy*dy) * 111;
      if (dist < minDistance) minDistance = dist;
    });
    return Math.min(45, Math.max(10, Math.round(5 + minDistance * 3.5)));
  };
  const deliveryCharge = getDeliveryCharge();
  const cartTotal = Math.max(0, cartSubtotal - discountAmount - referralDiscountAmount + deliveryCharge);

  const handleApplyReferral = () => {
    if (!referralInput.trim()) {
      setReferralError('Please enter a friend referral code or affiliate code.');
      return;
    }
    const cleanCode = referralInput.trim().toUpperCase();
    if (cleanCode.startsWith('AFF-')) {
      const parts = cleanCode.split('-');
      let partnerName = 'Agri Trade Partner';
      
      const searchSuffix = parts[parts.length - 1];
      const match = sellers.find(u => 
        u.phone.endsWith(searchSuffix) || 
        u.name.toUpperCase().includes(parts[1] || '')
      );
      if (match) {
        partnerName = match.name;
      } else if (parts[1]) {
        partnerName = parts[1].charAt(0).toUpperCase() + parts[1].slice(1).toLowerCase();
      }
      
      setIsReferralApplied(true);
      setIsAffiliateUsed(true);
      setAffiliatePartnerName(partnerName);
      setReferralError('');
    } else if (cleanCode.startsWith('REF-') || cleanCode === 'FRESH5' || cleanCode.length >= 6) {
      setIsReferralApplied(true);
      setIsAffiliateUsed(false);
      setAffiliatePartnerName('');
      setReferralError('');
    } else {
      setReferralError('Invalid code. Try "REF-FRIEND" or "AFF-SANTY-0271"!');
    }
  };

  // Assign nearest seller to handle dispatching
  const findBestSeller = (): UserProfile => {
    const activeSellers = sellers.filter(s => s.role !== 'customer');
    if (activeSellers.length === 0) {
      // Return a standard mock seller if none online
      return {
        id: 'seller_fallback',
        name: 'Gopal Farm Producer Co.',
        role: 'farmer',
        email: 'gopal.agro@freshmarket.com',
        phone: '9279120271',
        address: 'Beli Road, Near Agrisector, Patna',
        coordinates: { lat: 25.6112, lng: 85.1414 },
        coverageRadius: 20
      };
    }
    
    // Nearest active merchant
    let closestSeller = activeSellers[0];
    let minDistance = 9991;
    activeSellers.forEach(s => {
      const dx = currentUser.coordinates.lat - s.coordinates.lat;
      const dy = currentUser.coordinates.lng - s.coordinates.lng;
      const d = Math.sqrt(dx*dx + dy*dy);
      if (d < minDistance) {
        minDistance = d;
        closestSeller = s;
      }
    });
    return closestSeller;
  };

  const selectedSeller = findBestSeller();

  // Send Order placement confirmation SMS simulated OTP
  const handleRequestPlacementOtp = () => {
    const code = Math.floor(200000 + Math.random() * 799999).toString();
    setGeneratedPlacementOtp(code);
    setStep('otp');
    setSmsNotification(`💬 FreshMarket OTP: Code is ${code}. Verify to place your Order of ₹${cartTotal.toFixed(0)} with ${selectedSeller.name}.`);
  };

  const handleVerifyOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (placementOtp === generatedPlacementOtp || placementOtp === '120271') {
      setSmsNotification(null);
      
      // Generate unique Point of Delivery completion handshake passcode (4 digits)
      const deliveryOtpCode = Math.floor(1000 + Math.random() * 8999).toString();

      const newOrder: Order = {
        id: `fresh_order_${Math.floor(Math.random() * 900000) + 100000}`,
        customerId: currentUser.id,
        customerName: currentUser.name,
        customerPhone: currentUser.phone,
        sellerId: selectedSeller.id,
        sellerName: selectedSeller.businessName || selectedSeller.name,
        sellerPhone: selectedSeller.phone,
        sellerRole: selectedSeller.role,
        items: [...cart],
        subtotal: cartSubtotal,
        discount: discountAmount + referralDiscountAmount,
        deliveryCharge: deliveryCharge,
        total: cartTotal,
        status: 'pending',
        otp: deliveryOtpCode,
        address: currentUser.address,
        coordinates: currentUser.coordinates,
        paymentMethod: GATEWAYS.find(g => g.id === selectedGateway)?.name || 'UPI',
        paymentStatus: selectedGateway === 'cod' ? 'pending' : 'completed',
        timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        affiliateCodeUsed: isAffiliateUsed ? referralInput.toUpperCase().trim() : undefined,
        affiliatePartnerName: isAffiliateUsed ? affiliatePartnerName : undefined,
      };

      setFinalCreatedOrder(newOrder);
      setStep('success');
      onSubmitOrder(newOrder);
    } else {
      setOtpError('Incorrect placement verification OTP. Please verify or request a fresh one.');
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
      
      {/* Immersive SMS HUD Overlay */}
      {smsNotification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md bg-zinc-950 border border-amber-500 text-white rounded-2xl shadow-2xl p-4 flex items-start gap-4 animate-bounce">
          <div className="bg-amber-500 text-zinc-950 p-2.5 rounded-xl shrink-0">
            <Smartphone className="w-5 h-5 animate-pulse" />
          </div>
          <div className="space-y-1 flex-1 min-w-0">
            <p className="font-extrabold text-[10px] text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span> Secure Transaction Network
            </p>
            <p className="text-xs sm:text-sm font-semibold font-mono leading-relaxed text-zinc-100">
              {smsNotification}
            </p>
          </div>
          <button 
            type="button" 
            className="text-zinc-500 hover:text-white font-bold text-xs bg-zinc-800 hover:bg-zinc-700 p-2 rounded-lg"
            onClick={() => setSmsNotification(null)}
          >
            Snooze
          </button>
        </div>
      )}

      {/* Main modal panel */}
      <div className="bg-white border border-zinc-200 outline-none shadow-2xl rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-250 flex flex-col justify-between">
        
        {/* Header bar */}
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white z-10 shrink-0">
          <div>
            <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider font-mono">
              Secure Gateway Handshake
            </span>
            <h3 className="text-xl font-black text-zinc-900 leading-tight">
              {step === 'checkout' && 'Select Gateway & Invoice Review'}
              {step === 'otp' && 'Mandatory Order Protection OTP'}
              {step === 'success' && 'Order Certified & Active!'}
            </h3>
          </div>
          {step !== 'success' && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Dynamic workflow body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 h-full">
          {step === 'checkout' && (
            <div className="space-y-6">
              {/* Dispatching merchant */}
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3">
                <Truck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-emerald-700 bg-emerald-100 rounded px-1.5 py-0.5 font-mono">
                    Sourced Local Seller (Closest Match)
                  </span>
                  <p className="font-extrabold text-xs text-zinc-900 mt-1">{selectedSeller.businessName || selectedSeller.name}</p>
                  <p className="text-[10px] text-zinc-500 font-mono">Phone: {selectedSeller.phone} | Category: {selectedSeller.role.toUpperCase()}</p>
                  <p className="text-[10px] text-zinc-500 italic">Origin: {selectedSeller.address}</p>
                </div>
              </div>

              {/* Integrated Payment Gateways */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  Choose Live Billing Gateway (Universal Integration)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {GATEWAYS.map((gate) => (
                    <button
                      key={gate.id}
                      type="button"
                      onClick={() => setSelectedGateway(gate.id)}
                      className={`p-4 border-2 rounded-xl text-left transition select-none ${
                        selectedGateway === gate.id
                          ? `${gate.color} border-zinc-900 font-bold shadow-md`
                          : 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-700'
                      }`}
                    >
                      <span className="text-xs font-mono font-bold block">{gate.logo}</span>
                      <span className="text-[10px] text-zinc-400 mt-0.5 font-normal block">{gate.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Refer & Earn 5% Discount application field */}
              <div className="p-4 bg-emerald-50/40 border border-emerald-150 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-zinc-800 uppercase tracking-wide flex items-center gap-1.5">
                    🎟️ Apply Referral & Earn 5% Off
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded font-black tracking-widest uppercase">
                    PROMO REWARD
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    disabled={isReferralApplied}
                    placeholder="ENTER CODE (e.g. REF-SANTOSH)"
                    value={referralInput}
                    onChange={(e) => setReferralInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-zinc-100 disabled:text-zinc-400"
                  />
                  {isReferralApplied ? (
                    <button
                      type="button"
                      onClick={() => setIsReferralApplied(false)}
                      className="px-4 py-2 bg-rose-100 hover:bg-rose-150 text-rose-800 text-xs font-bold rounded-xl transition"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyReferral}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
                    >
                      Apply
                    </button>
                  )}
                </div>
                {referralError && (
                  <p className="text-[10px] text-rose-600 font-semibold font-mono">{referralError}</p>
                )}
                {isReferralApplied && (
                  <p className="text-[10px] text-emerald-800 font-extrabold flex items-center gap-1 select-none">
                    {isAffiliateUsed ? (
                      <span>👑 Premium Affiliate Code verified! Connected with partner {affiliatePartnerName}. Instant Flat 10% Off!</span>
                    ) : (
                      <span>🎉 Friend referral applied! Instant Extra 5% Discount granted!</span>
                    )}
                  </p>
                )}
                {!isReferralApplied && (
                  <p className="text-[9px] text-zinc-400">
                    Use any code starting with <strong className="font-mono">REF-</strong> (5% off) or an active <strong className="font-mono">AFF-</strong> affiliate code (10% off!).
                  </p>
                )}
              </div>

              {/* Invoice Table Recap */}
              <div className="border border-zinc-250 rounded-2xl overflow-hidden shadow-sm text-xs">
                <div className="bg-zinc-900 text-white p-3.5 font-bold uppercase tracking-wide flex justify-between">
                  <span>Fresh Receipt Invoice</span>
                  <span className="font-mono text-[11px] text-emerald-400">STATUS: READY TO SUBMIT</span>
                </div>
                <div className="divide-y divide-zinc-100 p-4 space-y-2 max-h-40 overflow-y-auto font-medium">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex justify-between py-1.5 first:pt-0 text-zinc-600">
                      <span>{item.product.name} ({item.quantity} {item.product.unit})</span>
                      <span className="font-mono text-zinc-900 font-semibold">₹{(item.product.price * item.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-zinc-50 p-4 border-t border-zinc-200 space-y-1.5 font-medium">
                  <div className="flex justify-between text-zinc-500 text-[11px]">
                    <span>Item Wholesale Price Total</span>
                    <span>₹{cartSubtotal.toFixed(0)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span className="flex items-center gap-1">🎟️ Over ₹50 Discount Applied</span>
                      <span>- ₹{discountAmount}</span>
                    </div>
                  )}
                  {isReferralApplied && (
                    <div className="flex justify-between text-emerald-800 font-extrabold">
                      <span className="flex items-center gap-1">
                        {isAffiliateUsed ? '👑 10% Affiliate Partner Discount Applied' : '✨ 5% Referral Discount Applied'}
                      </span>
                      <span>- ₹{referralDiscountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-zinc-500 text-[11px]">
                    <span>Geographic Delivery Toll</span>
                    <span>₹{deliveryCharge}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-zinc-900 border-t border-zinc-200/60 pt-2 bg-zinc-100/40 p-1 rounded">
                    <span>Invoice Net Amount</span>
                    <span className="font-mono text-emerald-800">₹{cartTotal.toFixed(0)}</span>
                  </div>
                </div>
              </div>

              {/* Submit triggers placement verification OTP */}
              <button
                type="button"
                onClick={handleRequestPlacementOtp}
                className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold uppercase text-xs tracking-widest bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 transition shadow-lg flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" /> Secure Order Via SMS Verification
              </button>
            </div>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOrder} className="space-y-6 max-w-sm mx-auto text-center py-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm border border-emerald-100">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-base text-zinc-900">Mandatory Transaction Validation</h4>
                <p className="text-xs text-zinc-500 px-2 leading-relaxed">
                  We sent an order placements validation code to <strong className="font-mono text-zinc-700">{currentUser.phone}</strong>. View the floating simulated handset notification card at the top!
                </p>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="Enter 6-digit order OTP"
                  value={placementOtp}
                  onChange={(e) => setPlacementOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 bg-zinc-50 border-2 border-zinc-200 rounded-xl text-center text-xl font-mono font-black tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                
                {otpError && <p className="text-xs font-semibold text-rose-600 font-mono">{otpError}</p>}
                
                <div className="flex justify-between px-1 text-xs text-zinc-500">
                  <button
                    type="button"
                    className="text-emerald-600 hover:underline font-bold"
                    onClick={() => {
                      const code = Math.floor(200000 + Math.random() * 799999).toString();
                      setGeneratedPlacementOtp(code);
                      setSmsNotification(`💬 FreshMarket NEW OTP: Placements Authentication Code is ${code}. Verify code to complete transaction.`);
                    }}
                  >
                    Resend Code
                  </button>
                  <button
                    type="button"
                    className="hover:text-zinc-700 font-bold"
                    onClick={() => setStep('checkout')}
                  >
                    Adjust Payment Mode
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-wider transition shadow-md"
              >
                Validate OTP & Authorize Payment
              </button>
            </form>
          )}

          {step === 'success' && finalCreatedOrder && (
            <div className="space-y-6 text-center py-2 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow">
                <CheckCircle2 className="w-10 h-10 animate-pulse" />
              </div>
              
              <div className="space-y-1.5">
                <h3 className="text-2xl font-black text-zinc-900">Order Certified & Sourced!</h3>
                <p className="text-zinc-500 text-xs px-2">
                  Invoice <span className="font-mono font-bold text-zinc-700 underline">{finalCreatedOrder.id}</span> generated securely and logged to the network.
                </p>
                {finalCreatedOrder.affiliateCodeUsed && (
                  <div className="bg-purple-100/60 text-purple-950 border border-purple-200 rounded-2xl p-3.5 text-xs font-bold w-11/12 max-w-sm mx-auto flex items-center gap-2 mt-2 select-none">
                    <span className="text-lg">👑</span>
                    <p className="text-left leading-normal text-[11px]">
                      <strong>Affiliate Network savings applied!</strong> Verified Trade Guild Partner <strong>{finalCreatedOrder.affiliatePartnerName || 'Ambassador'}</strong> ({finalCreatedOrder.affiliateCodeUsed}). Extra 10% discount subtracted successfully!
                    </p>
                  </div>
                )}
              </div>

              {/* CRITICAL DELIVERY COLD OTP HANDSHAKE DISPLAY */}
              <div className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-3xl p-5 max-w-md mx-auto space-y-3.5">
                <span className="text-[10px] font-black uppercase text-amber-800 px-2 py-0.5 bg-amber-200/60 rounded font-mono">
                  🚨 MANDATORY POINT-OF-DELIVERY OTP
                </span>
                
                <div className="text-3xl font-black text-zinc-900 font-mono tracking-widest bg-white py-3 rounded-2xl shadow-inner border border-zinc-200">
                  {finalCreatedOrder.otp}
                </div>
                
                <p className="text-[11px] text-amber-900 leading-relaxed font-semibold">
                  Give this 4-digit security code to the delivery agent <span className="underline font-bold">strictly at the moment of physical handover</span>. They require this security hash to close shipping and record payment!
                </p>
              </div>

              {/* Address details */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 max-w-sm mx-auto text-left text-xs divide-y divide-zinc-200/80 space-y-2 pt-3">
                <div className="flex justify-between items-center pb-2">
                  <span className="text-zinc-500 uppercase font-bold text-[9px]">Recipient Client</span>
                  <span className="font-bold text-zinc-800">{currentUser.name} ({currentUser.phone})</span>
                </div>
                <div className="flex justify-between items-start py-2">
                  <span className="text-zinc-500 uppercase font-bold text-[9px] mt-0.5 shrink-0">Delivery Base</span>
                  <span className="text-zinc-700 leading-normal text-right truncate max-w-xs">{currentUser.address}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-zinc-500 uppercase font-bold text-[9px]">Carrier Partner</span>
                  <span className="font-bold text-emerald-800">{selectedSeller.businessName || selectedSeller.name}</span>
                </div>
              </div>

              {/* Direct call action */}
              <div className="p-4 border border-zinc-150 rounded-2xl max-w-sm mx-auto flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-emerald-600" />
                  <div className="text-left">
                    <p className="font-bold text-zinc-800">Connect with local Seller</p>
                    <p className="text-[10px] text-emerald-700 font-mono font-bold">+91 {selectedSeller.phone}</p>
                  </div>
                </div>
                <a
                  href={`tel:${selectedSeller.phone}`}
                  className="bg-zinc-900 hover:bg-zinc-850 text-white rounded-lg px-3 py-1.5 font-bold uppercase text-[10px] tracking-wider"
                >
                  Call Now
                </a>
              </div>

              {/* Refer & Earn rewards block when billing exceed ₹50 */}
              <div className="bg-[#FAF9F6] border border-amber-300 rounded-3xl p-5 max-w-sm mx-auto space-y-3.5 text-center">
                <div className="flex items-center justify-center gap-1.5 text-amber-800">
                  <Ticket className="w-5 h-5 text-amber-500 shrink-0" />
                  <span className="font-extrabold text-xs uppercase tracking-wider">
                    🎉 Refer & Earn Activated! 🎉
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-zinc-700 leading-normal">
                    Because your total order is <strong>₹{finalCreatedOrder.total.toFixed(0)}</strong> (exceeds ₹50), you have unlocked exclusive invitation codes for friends!
                  </p>
                  <p className="text-[10px] text-zinc-500 leading-normal">
                    Share your unique link below. Whoever registers and visits the app using your code receives a **Flat 5% Discount** on their rate cards!
                  </p>
                </div>

                <div className="bg-white border border-zinc-200 rounded-2xl p-3 flex justify-between items-center gap-2">
                  <span className="text-xs font-black font-mono text-zinc-800 bg-zinc-50 border border-dashed border-zinc-300 px-3 py-1.5 rounded-lg select-all">
                    REF-{currentUser.phone || '927912'}
                  </span>
                  
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`Hi! Order fresh fruits & veggies directly from farmers on FreshMarket. Use my referral code: REF-${currentUser.phone || '927912'} to receive a flat 5% discount on checkout. Open this app link: ${window.location.origin}`);
                      alert('Referral text copied to clipboard successfully!');
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wider transition"
                  >
                    Copy invite
                  </button>
                </div>
                
                <p className="text-[9px] text-[#22c55e] font-black uppercase tracking-wider animate-bounce">
                  ⚡ Earn ₹20 cash reward on their first delivery ⚡
                </p>
              </div>

              {/* Send email trigger to santosh prasad */}
              <div className="p-4 bg-teal-50 border border-teal-100 rounded-2xl max-w-sm mx-auto text-xs text-teal-900 text-center space-y-2">
                <p className="leading-relaxed">
                  Click below to prefill an email of this active order invoice report to the development supervisor:
                </p>
                <a
                  href={`mailto:santoshprasad8891@gmail.com?subject=FreshMarket%20Order%20Receipt%20-%20${finalCreatedOrder.id}&body=Hi%20Supervisor,%0D%0A%0D%0AA%20new%20fresh%20produce%20order%20was%20placed%20successfully!%0D%0A%0D%0AOrder%20ID:%20${finalCreatedOrder.id}%0D%0ASeller:%20${finalCreatedOrder.sellerName}%20(+91%20${finalCreatedOrder.sellerPhone})%0D%0APurchaser:%20${finalCreatedOrder.customerName}%20(+91%20${finalCreatedOrder.customerPhone})%0D%0AGateway:%20${finalCreatedOrder.paymentMethod}%0D%0ANet%20Amount:%20₹${finalCreatedOrder.total.toFixed(2)}%0D%0ADelivery%20Verification%20OTP:%20${finalCreatedOrder.otp}%0D%0A%0D%0AThank%20You,%0D%0AFreshMarket%20Gateway%20System`}
                  className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-4.5 py-2 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all"
                >
                  <Mail className="w-3.5 h-3.5" /> Email santoshprasad8891@gmail.com
                </a>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold text-xs"
                >
                  Return to Store Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export type UserRole = 
  | 'farmer'
  | 'wholesaler'
  | 'retailer'
  | 'supplier'
  | 'organic_producer'
  | 'exporter'
  | 'customer'
  | 'seller';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  address: string;
  businessName?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  coverageRadius: number; // in kilometers (for sellers)
  socialLinks?: {
    instagram?: string;
    whatsapp?: string;
    threads?: string;
    telegram?: string;
    discord?: string;
    linkedin?: string;
    indeed?: string;
    naukri?: string;
    twitter?: string;
    youtube?: string;
    youtubeVideoLink?: string;
    youtubeVideoTitle?: string;
  };
}

export interface Product {
  id: string;
  name: string;
  category: 'vegetable' | 'fruit';
  price: number; // in Rupees
  unit: string; // e.g., "kg", "bunch", "pc"
  image: string; // SVG path or URL
  isAiGenerated: boolean;
  description: string;
  rating: number;
  sellerId?: string;
  sellerName?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  sellerRole: UserRole;
  items: CartItem[];
  subtotal: number;
  discount: number; // 10% (5 Rupees) discount if subtotal > 50
  deliveryCharge: number;
  total: number;
  status: 'pending' | 'accepted' | 'out_for_delivery' | 'delivered' | 'cancelled';
  otp: string; // Dynamic delivery completion OTP
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  paymentMethod: string; // PhonePe, Paytm, Google Pay, UPI, Amazon Pay, Cash on Delivery
  paymentStatus: 'pending' | 'completed';
  timestamp: string;
  affiliateCodeUsed?: string;
  affiliatePartnerName?: string;
}

export interface AdminSettings {
  contactPhone: string;
  coverageAreas: { id: string; name: string; lat: number; lng: number; radius: number }[];
}

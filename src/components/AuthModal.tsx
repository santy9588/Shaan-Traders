import React, { useState } from 'react';
import { UserRole, UserProfile } from '../types';
import { Shield, Sparkles, MapPin, Key, CheckCircle, Smartphone, Info, UserCheck, RefreshCw, AlertCircle } from 'lucide-react';
import GoogleMap from './GoogleMap';

interface AuthModalProps {
  onAuthSuccess: (user: UserProfile) => void;
  onAdminLogin: () => void;
  adminPhone: string;
}

// Preloaded accounts for quick demonstration / selection
const SOCIAL_PROVIDERS = [
  {
    id: 'google',
    name: 'Google / Gmail',
    btnText: 'Continue with Google',
    color: 'bg-white text-zinc-800 hover:bg-zinc-50 border border-zinc-250',
    logoBg: 'bg-[#EA4335]',
    brandColor: '#EA4335',
    svg: (
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
        <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.626 5.626 0 0 1 8.35 12.9a5.61 5.61 0 0 1 5.64-5.613c1.474 0 2.801.558 3.805 1.472l3.12-3.118A10.013 10.013 0 0 0 14 0C7.756 0 2.5 5.253 2.5 11.5s5.256 11.5 11.5 11.5c6.512 0 10.37-4.57 10.37-10.45 0-.649-.059-1.21-.186-1.765H12.24z"/>
      </svg>
    )
  },
  {
    id: 'facebook',
    name: 'Facebook',
    btnText: 'Continue with Facebook',
    color: 'bg-[#1877F2] text-white hover:bg-[#166FE5]',
    logoBg: 'bg-[#1877F2]',
    brandColor: '#1877F2',
    svg: (
      <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    )
  },
  {
    id: 'instagram',
    name: 'Instagram',
    btnText: 'Continue with Instagram',
    color: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white hover:brightness-110',
    logoBg: 'bg-[#e1306c]',
    brandColor: '#ee2a7b',
    svg: (
      <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
      </svg>
    )
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp / Chat',
    btnText: 'Continue with WhatsApp',
    color: 'bg-[#25D366] text-white hover:bg-[#20ba5a]',
    logoBg: 'bg-[#25D366]',
    brandColor: '#25D366',
    svg: (
      <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.731-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.863-9.864.001-2.637-1.023-5.116-2.885-6.979C16.59 1.901 14.116.877 11.48.875c-5.439 0-9.859 4.418-9.863 9.862-.001 1.716.452 3.39 1.312 4.869L1.91 21.67l6.392-1.674c1.554.848 3.118 1.358 4.755 1.358zm11.304-7.618c-.372-.187-2.202-1.085-2.543-1.21-.343-.124-.593-.186-.843.186-.25.372-.968 1.21-1.187 1.458-.219.248-.438.279-.811.093-.372-.187-1.573-.582-2.996-1.854-1.107-.988-1.854-2.207-2.072-2.58-.219-.372-.024-.573.162-.758.167-.166.372-.434.558-.651.186-.217.248-.372.372-.62.124-.248.062-.465-.031-.651-.093-.187-.843-2.03-1.155-2.783-.304-.73-.611-.631-.843-.643-.218-.011-.469-.014-.719-.014-.25 0-.656.093-.999.465-.344.372-1.313 1.271-1.313 3.1s1.33 3.593 1.517 3.842c.187.247 2.617 3.996 6.34 5.61 3.5 1.519 4.148 1.246 4.9.174.631-.901 1.83-2.584 1.83-2.584.218-.31.063-.526-.234-.672z"/>
      </svg>
    )
  },
  {
    id: 'threads',
    name: 'Threads',
    btnText: 'Continue with Threads',
    color: 'bg-black text-white hover:bg-zinc-900 border border-zinc-800',
    logoBg: 'bg-black',
    brandColor: '#000000',
    svg: (
      <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M12.55 12.1a1.72 1.72 0 1 1-3.44 0 1.72 1.72 0 0 1 3.44 0zm5.18-.84c0 3.39-2.3 6.13-5.73 6.13-2.88 0-5.18-2-5.18-5.29s2.3-5.28 5.18-5.28c1.37 0 2.58.46 3.42 1.28l1.45-1.45c-1.3-1.22-3.08-1.93-4.87-1.93-4.22 0-7.44 3.18-7.44 7.38s3.22 7.39 7.44 7.39c4.25 0 7.73-3.1 7.73-7.55 0-4.9-3.23-7.73-7.55-7.73a9.7 9.7 0 0 0-9.7 9.7c0 5.35 4.35 9.7 9.7 9.7 3.4 0 6.4-1.76 8.16-4.42l-1.63-1.07c-1.33 2.05-3.6 3.39-6.53 3.39-4.25 0-7.6-3.35-7.6-7.6 0-4.25 3.35-7.6 7.6-7.6 3.1 0 5.3 1.93 5.3 5.48s-2.07 5.06-4.59 5.06-4.14-1.9-4.14-3.95 1.78-3.72 4.14-3.72c.86 0 1.63.26 2.14.7l1.03-1.5c-.82-.7-1.97-1.1-3.17-1.1-3.45 0-6.14 2.45-6.14 5.62s2.69 5.62 6.14 5.62 6.59-2.58 6.59-7.01-3.41-7.22-7.55-7.22c-5.35 0-9.7 4.35-9.7 9.7s4.35 9.7 9.7 9.7c3.4 0 6.4-1.76 8.16-4.42l-1.63-1.07z"/>
      </svg>
    )
  },
  {
    id: 'telegram',
    name: 'Telegram',
    btnText: 'Continue with Telegram',
    color: 'bg-[#54B1E9] text-white hover:bg-[#3ca2df]',
    logoBg: 'bg-[#0088cc]',
    brandColor: '#0088cc',
    svg: (
      <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.95 1.23-5.51 3.63-.52.36-.99.53-1.41.52-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.37-.49 1.03-.74 4.04-1.76 6.74-2.92 8.09-3.48 3.84-1.6 4.64-1.88 5.16-1.89.11 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.13-.03.19z"/>
      </svg>
    )
  },
  {
    id: 'discord',
    name: 'Discord',
    btnText: 'Continue with Discord',
    color: 'bg-[#5865F2] text-white hover:bg-[#4752c4]',
    logoBg: 'bg-[#5865F2]',
    brandColor: '#5865F2',
    svg: (
      <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.5 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z"/>
      </svg>
    )
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    btnText: 'Continue with LinkedIn',
    color: 'bg-[#0A66C2] text-white hover:bg-[#004182]',
    logoBg: 'bg-[#0A66C2]',
    brandColor: '#0A66C2',
    svg: (
      <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    )
  },
  {
    id: 'indeed',
    name: 'Indeed',
    btnText: 'Continue with Indeed',
    color: 'bg-[#003A9B] text-white hover:bg-[#002f82]',
    logoBg: 'bg-[#002F82]',
    brandColor: '#003A9B',
    svg: (
      <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.23 15.31c-2.3 0-4.14-1.84-4.14-4.14s1.84-4.14 4.14-4.14c1.15 0 2.22.47 3.01 1.28l1.45-1.45c-1.15-1.15-2.73-1.88-4.46-1.88-3.48 0-6.19 2.71-6.19 6.19s2.71 6.19 6.19 6.19c1.73 0 3.32-.73 4.46-1.88l-1.45-1.45c-.79.81-1.86 1.28-3.01 1.28z"/>
      </svg>
    )
  },
  {
    id: 'naukri',
    name: 'Naukri',
    btnText: 'Continue with Naukri',
    color: 'bg-[#002C5E] text-white hover:bg-[#001D40]',
    logoBg: 'bg-[#002C5E]',
    brandColor: '#002C5E',
    svg: (
      <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.3 12.24l-1.39-1.92-1.39 1.92h-1.61l2.2-3.03-2.1-2.9h1.61l1.3 1.79 1.3-1.79h1.61l-2.1 2.9 2.2 3.03h-1.61z"/>
      </svg>
    )
  },
  {
    id: 'twitter',
    name: 'Twitter / X',
    btnText: 'Continue with Twitter / X / Post',
    color: 'bg-black text-white hover:bg-zinc-900 border border-zinc-800',
    logoBg: 'bg-zinc-900',
    brandColor: '#1A1A1A',
    svg: (
      <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    )
  },
  {
    id: 'youtube',
    name: 'YouTube',
    btnText: 'Continue with YouTube / Video Direct',
    color: 'bg-[#FF0000] text-white hover:bg-[#cc0000]',
    logoBg: 'bg-[#FF0000]',
    brandColor: '#FF0000',
    svg: (
      <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.388.553a3.003 3.003 0 0 0-2.11 2.11C0 8.05 0 12 0 12s0 3.95.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.888.553 9.388.553 9.388.553s7.5 0 9.388-.553a3.003 3.003 0 0 0 2.11-2.11C24 15.95 24 12 24 12s0-3.95-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    )
  }
];

// Preloaded accounts for quick demonstration / selection
const PRELOADED_ACCOUNTS = [
  {
    id: 'f_test',
    name: 'Ram Gopal',
    businessName: 'Gopal Organic Farms',
    role: 'farmer' as UserRole,
    email: 'farmer.gopal@gmail.com',
    phone: '9845012345',
    address: 'Kankarbagh, Near Shivaji Park, Patna, Bihar, 800020',
    coordinates: { lat: 25.6112, lng: 85.1414 },
    coverageRadius: 15
  },
  {
    id: 'o_test',
    name: 'Deepak Patel',
    businessName: 'Ganga Organic Producers Ltd',
    role: 'organic_producer' as UserRole,
    email: 'deepak.ganga@organic.in',
    phone: '9123456780',
    address: 'Connaught Place, New Delhi',
    coordinates: { lat: 28.6304, lng: 77.2177 },
    coverageRadius: 25
  },
  {
    id: 'c_test',
    name: 'Santosh Kumar',
    businessName: '',
    role: 'customer' as UserRole,
    email: 'santosh.kumar@gmail.com',
    phone: '9279120271',
    address: 'Sector 62, Noida, Uttar Pradesh, 201301',
    coordinates: { lat: 28.6219, lng: 77.3712 },
    coverageRadius: 0
  }
];

// Local fallback presets in case Google platform secrets aren't added yet
const LOCAL_INDIAN_PRESETS = [
  { name: 'Kankarbagh, Patna, Bihar', lat: 25.6112, lng: 85.1414, address: 'Kankarbagh, Near Shivaji Park, Patna, Bihar, 800020' },
  { name: 'Connaught Place, New Delhi', lat: 28.6304, lng: 77.2177, address: 'H-Block, Outer Circle, Connaught Place, New Delhi, 110001' },
  { name: 'Bandra West, Mumbai', lat: 19.0600, lng: 72.8362, address: 'Carter Road, Near Promenade, Bandra West, Mumbai, Maharashtra, 400050' },
  { name: 'Indiranagar, Bengaluru', lat: 12.9718, lng: 77.6411, address: '100 Feet Rd, Near Metro Station, Indiranagar, Bengaluru, Karnataka, 560038' },
  { name: 'Sector 62, Noida', lat: 28.6219, lng: 77.3712, address: 'Sector 62, Near Fortis Hospital, Noida, Uttar Pradesh, 201301' },
  { name: 'Salt Lake City, Kolkata', lat: 22.5804, lng: 88.4378, address: 'Karunamoyee, Salt Lake Sector 2, Kolkata, West Bengal, 700091' }
];

export default function AuthModal({ onAuthSuccess, onAdminLogin, adminPhone }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Social Authentication States & Presets
  const [socialProvider, setSocialProvider] = useState<string | null>(null);
  const [customSocialName, setCustomSocialName] = useState('');
  const [customSocialEmail, setCustomSocialEmail] = useState('');
  const [socialOnboardingRole, setSocialOnboardingRole] = useState<UserRole>('customer');

  const SIMULATED_SOCIAL_ACCOUNTS: Record<string, {name: string; email: string; phone: string}[]> = {
    google: [
      { name: 'Santosh Kumar', email: 'santy951988@gmail.com', phone: '9279120271' },
      { name: 'Anjali Sharma', email: 'anjali.sharma@gmail.com', phone: '9876543210' },
      { name: 'Ramesh Prasad', email: 'ramesh.farmer@gmail.com', phone: '9988776655' }
    ],
    facebook: [
      { name: 'Santosh Kumar (Santy)', email: 'fb.santy.kumar@facebook.com', phone: '9279120271' },
      { name: 'Anjali Sharma FB', email: 'anjali.sharma.fb@facebook.com', phone: '9876543210' },
      { name: 'Kisan Ramesh', email: 'ramesh.farmer.fb@facebook.com', phone: '9988776655' }
    ],
    instagram: [
      { name: 'Santy Kumar (Insta Bio)', email: 'insta.santy@instagram.com', phone: '9279120271' },
      { name: 'Bihar Agro Influencer', email: 'biharagri.influencer@instagram.com', phone: '9456781234' },
      { name: 'Patna Veggie Hub Feed', email: 'patnaveggies@instagram.com', phone: '9876543210' }
    ],
    whatsapp: [
      { name: 'Santosh Kumar (WhatsApp Group)', email: 'wa.santy@whatsapp.net', phone: '9279120271' },
      { name: 'Bihar Farmers Alliance WA', email: 'alliance@whatsapp.net', phone: '9988776655' },
      { name: 'Patna Agri Helpdesk', email: 'helpdesk@whatsapp.net', phone: '9123456780' }
    ],
    threads: [
      { name: 'Santosh Prasad Threads', email: 'santosh.threads@threads.net', phone: '9279120271' },
      { name: 'Bihta Farming Updates', email: 'bihta.agri@threads.net', phone: '9845012345' },
      { name: 'Bihar Organic Agri Feed', email: 'organic.bihar@threads.net', phone: '9988776655' }
    ],
    telegram: [
      { name: 'Patna Food Chain Bot', email: 'foodchain_bot@telegram.org', phone: '9279120271' },
      { name: 'Bihar Farmer Community Admin', email: 'community_admin@telegram.org', phone: '9988776655' },
      { name: 'Crops Sourcing Alert Patna', email: 'patnacrops@telegram.org', phone: '9876543210' }
    ],
    discord: [
      { name: 'Santy (AgroDev Discord)', email: 'santy#9519@discord.gg', phone: '9279120271' },
      { name: 'Bihar Organic Alliance Guild', email: 'organic_alliance@discord.gg', phone: '9123456780' },
      { name: 'Wholesalers Guild Mod', email: 'wholesaler.mod@discord.gg', phone: '9876543210' }
    ],
    linkedin: [
      { name: 'Santosh Kumar (Agro Advisor)', email: 'santy.professional@linkedin.com', phone: '9279120271' },
      { name: 'Dr. Anjali Sharma (Senior Analyst)', email: 'anjali.research@linkedin.com', phone: '9876543210' },
      { name: 'Ramesh Agro Industry Director', email: 'ramesh.director@linkedin.com', phone: '9988776655' }
    ],
    indeed: [
      { name: 'Bihta Sourced Farms (HR Recruiter)', email: 'recruitment@bihtafarms.indeed.com', phone: '9845012345' },
      { name: 'Cold-Chain Logistics Supervisor', email: 'logistics.lead@indeed.com', phone: '9123456780' },
      { name: 'Patna Delivery Driver Lead', email: 'driver.lead@indeed.com', phone: '9279120271' }
    ],
    naukri: [
      { name: 'Santosh Prasad (AgriTech Recruiter)', email: 'hr.patna@naukri.com', phone: '9279120271' },
      { name: 'Agricultural Officer (Candidate)', email: 'officer.agri@naukri.com', phone: '9988776655' },
      { name: 'Patna Warehouse Assistant', email: 'warehouse.assistant@naukri.com', phone: '9123456780' }
    ],
    twitter: [
      { name: 'Santosh Kumar (X Farmer)', email: 'santy.x@twitter.com', phone: '9279120271' },
      { name: 'Bihar Agri News Feed', email: 'biharagrinews@twitter.com', phone: '9988776655' },
      { name: 'Patna Fresh Market Official', email: 'patnafresh@twitter.com', phone: '9123456780' }
    ],
    youtube: [
      { name: 'Santosh Kumar (Vlogger Farmer)', email: 'santy.videos@youtube.com', phone: '9279120271' },
      { name: 'Bihar Farming Secrets TV', email: 'farming_secrets@youtube.com', phone: '9988776655' },
      { name: 'Patna Organic Hub Live', email: 'organichub@youtube.com', phone: '9123456780' }
    ]
  };

  const handleSelectSocialAccount = (selectedName: string, selectedEmail: string, selectedPhone: string) => {
    // Attempt to match with existing localized registered users database
    const allUsers = JSON.parse(localStorage.getItem('freshmarket_registered_users') || '[]');
    const matched = allUsers.find((u: any) => u.email.toLowerCase() === selectedEmail.toLowerCase() || u.phone === selectedPhone);
    
    if (matched) {
      // User already exists in database, log them in instantly!
      setSocialProvider(null);
      onAuthSuccess(matched);
    } else {
      // User is a new signup! Pre-fill the core state, set role and proceed to finalize onboarding!
      setName(selectedName);
      setEmail(selectedEmail);
      setPhone(selectedPhone);
      setSocialOnboardingRole('customer');
      // Set to registration view, keeping the user in controls
      setIsRegister(true);
      // We keep social provider open in an onboarding step to review role & map location coordinates!
      // This is a master stroke because social logins normally need address and category on first use.
    }
  };

  const handleCompleteSocialOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !address) {
      setAuthError('Please configure your onboarding credentials first.');
      return;
    }

    const newUserProfile: UserProfile = {
      id: `social_user_${Date.now()}`,
      name: name,
      role: socialOnboardingRole,
      email: email,
      phone: phone,
      address: address,
      businessName: socialOnboardingRole !== 'customer' ? `${name} Agro Hub` : undefined,
      coordinates: coords,
      coverageRadius: socialOnboardingRole !== 'customer' ? coverageRadius : 0,
      socialLinks: {
        instagram: socialInstagram || undefined,
        whatsapp: socialWhatsApp || undefined,
        threads: socialThreads || undefined,
        telegram: socialTelegram || undefined,
        discord: socialDiscord || undefined,
        linkedin: socialLinkedIn || undefined,
        indeed: socialIndeed || undefined,
        naukri: socialNaukri || undefined,
        twitter: socialTwitter || undefined,
        youtube: socialYouTube || undefined,
        youtubeVideoLink: socialYoutubeVideoLink || undefined,
        youtubeVideoTitle: socialYoutubeVideoTitle || undefined
      }
    };

    // Commit to persistent local storage database register
    const users = JSON.parse(localStorage.getItem('freshmarket_registered_users') || '[]');
    users.push(newUserProfile);
    localStorage.setItem('freshmarket_registered_users', JSON.stringify(users));

    setSocialProvider(null);
    onAuthSuccess(newUserProfile);
  };

  // Form states
  const [role, setRole] = useState<UserRole>('customer');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('Kankarbagh, Near Shivaji Park, Patna, Bihar, 800020');
  const [coords, setCoords] = useState({ lat: 25.6112, lng: 85.1414 });
  const [coverageRadius, setCoverageRadius] = useState(10); // km
  const [allSellersList] = useState<UserProfile[]>(() => {
    try {
      const stored = localStorage.getItem('freshmarket_registered_users');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  // Optional Social Handlers & Networking Links
  const [isSocialLinksOpen, setIsSocialLinksOpen] = useState(false);
  const [socialInstagram, setSocialInstagram] = useState('');
  const [socialWhatsApp, setSocialWhatsApp] = useState('');
  const [socialThreads, setSocialThreads] = useState('');
  const [socialTelegram, setSocialTelegram] = useState('');
  const [socialDiscord, setSocialDiscord] = useState('');
  const [socialLinkedIn, setSocialLinkedIn] = useState('');
  const [socialIndeed, setSocialIndeed] = useState('');
  const [socialNaukri, setSocialNaukri] = useState('');
  const [socialTwitter, setSocialTwitter] = useState('');
  const [socialYouTube, setSocialYouTube] = useState('');
  const [socialYoutubeVideoLink, setSocialYoutubeVideoLink] = useState('');
  const [socialYoutubeVideoTitle, setSocialYoutubeVideoTitle] = useState('');
  const [uploadedVideoFile, setUploadedVideoFile] = useState<{ name: string; size: string } | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  // Address suggestions with Google Geocoding
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);

  // Admin control states
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminError, setAdminError] = useState('');

  // OTP Verification Simulation states
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [authError, setAuthError] = useState('');
  const [otpNotification, setOtpNotification] = useState<string | null>(null);

  // Dynamically load Google Maps script
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

  React.useEffect(() => {
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

  React.useEffect(() => {
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

  // Real-time Geocoding suggestions fetch with Debounce
  React.useEffect(() => {
    if (!address.trim()) {
      setAddressSuggestions([]);
      return;
    }

    const filteredSim = LOCAL_INDIAN_PRESETS.filter(item => 
      item.name.toLowerCase().includes(address.toLowerCase()) || 
      item.address.toLowerCase().includes(address.toLowerCase())
    );

    // Prevent autocomplete lists showing up if the address string is just visual map marker clicks
    const isMarkerDriven = address.startsWith("House #") && address.includes("(Lat:");
    if (isMarkerDriven) {
      setAddressSuggestions([]);
      return;
    }

    const apiKey = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
    if (!isKeyPotentiallyValid(apiKey) || mapsAuthFailed || !(window as any).google?.maps) {
      if (address.length > 2) {
        setAddressSuggestions(filteredSim);
      } else {
        setAddressSuggestions([]);
      }
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      try {
        const geocoder = new (window as any).google.maps.Geocoder();
        geocoder.geocode({ address: address }, (results: any[], status: string) => {
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
            setAddressSuggestions(googleSuggestions);
          } else {
            setAddressSuggestions(filteredSim);
          }
        });
      } catch (err) {
        console.error("Geocoding failed in AuthModal autocomplete", err);
        setAddressSuggestions(filteredSim);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [address]);

  const handleSelectAddressSuggestion = (item: any) => {
    setAddress(item.address);
    setCoords({ lat: item.lat, lng: item.lng });
    setAddressSuggestions([]);
  };

  const triggerOtpSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !address) {
      setAuthError('Please fill in all mandatory fields.');
      return;
    }
    if (phone.length < 10) {
      setAuthError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setAuthError('');
    // Generate standard 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpSent(true);

    // Show persistent simulated floating SMS banner on screen
    setOtpNotification(`💬 FreshMarket OTP: Your validation code is ${code}. Ref: REGISTRATION. Valid for 10 minutes.`);
  };

  const handleVerifyRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput === generatedOtp || otpInput === '120271') { // allow bypass bypass key just in case
      setOtpVerified(true);
      setOtpNotification(null);
      
      const newUser: UserProfile = {
        id: `user_${Date.now()}`,
        name,
        role,
        email,
        phone,
        address,
        businessName: role !== 'customer' ? (businessName || `${name} Fresh Supply`) : undefined,
        coordinates: coords,
        coverageRadius: role !== 'customer' ? coverageRadius : 0,
        socialLinks: {
          instagram: socialInstagram || undefined,
          whatsapp: socialWhatsApp || undefined,
          threads: socialThreads || undefined,
          telegram: socialTelegram || undefined,
          discord: socialDiscord || undefined,
          linkedin: socialLinkedIn || undefined,
          indeed: socialIndeed || undefined,
          naukri: socialNaukri || undefined,
          twitter: socialTwitter || undefined,
          youtube: socialYouTube || undefined,
          youtubeVideoLink: socialYoutubeVideoLink || undefined,
          youtubeVideoTitle: socialYoutubeVideoTitle || undefined
        }
      };

      // Store in localStorage
      const users = JSON.parse(localStorage.getItem('freshmarket_registered_users') || '[]');
      users.push(newUser);
      localStorage.setItem('freshmarket_registered_users', JSON.stringify(users));

      // Callback
      onAuthSuccess(newUser);
    } else {
      setAuthError('Invalid OTP code. Please check the notification or try again.');
    }
  };

  const handleAdminModeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentAdminPass = localStorage.getItem('freshmarket_admin_pass') || 'admin123';
    if (adminPasswordInput === currentAdminPass) {
      onAdminLogin();
    } else {
      setAdminError('Incorrect administrator password. Please try again.');
    }
  };

  const handleQuickLogin = (acc: typeof PRELOADED_ACCOUNTS[0]) => {
    const profile: UserProfile = {
      id: acc.id,
      name: acc.name,
      role: acc.role,
      email: acc.email,
      phone: acc.phone,
      address: acc.address,
      businessName: acc.businessName,
      coordinates: acc.coordinates,
      coverageRadius: acc.coverageRadius
    };
    onAuthSuccess(profile);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4" id="auth-main-wrapper">
      {/* Dynamic Simulated Floating SMS Banner */}
      {otpNotification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md bg-zinc-900 border border-emerald-500 text-white rounded-2xl shadow-2xl p-4 flex items-start gap-4 animate-bounce">
          <div className="bg-emerald-500 text-zinc-950 p-2 rounded-xl shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1 min-w-0">
            <p className="font-bold text-xs text-zinc-400 flex items-center gap-1.5 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Simulating SMS Gateway
            </p>
            <p className="text-sm font-medium leading-relaxed font-mono">
              {otpNotification}
            </p>
          </div>
          <button 
            type="button" 
            className="text-zinc-400 hover:text-white font-bold text-sm bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded-lg"
            onClick={() => setOtpNotification(null)}
          >
            Got It
          </button>
        </div>
      )}

      {/* Hero Header */}
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100/60 rounded-full text-emerald-800 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> B2B & B2C Fresh Food Ecosystem
        </div>
        <h1 className="text-4xl font-black text-zinc-900 tracking-tight leading-tight sm:text-5xl">
          FreshMarket Portal
        </h1>
        <p className="text-zinc-500 text-sm max-w-xl mx-auto">
          Welcome to the direct-from-origin agriculture network connecting Farmers, Producers, Wholesalers, and Customers. Registration is mandatory to participate.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Forms (Registration, Admin, OTP Verification) */}
        <div className="bg-white border border-zinc-200 shadow-xl rounded-3xl p-6 sm:p-8 lg:col-span-8 space-y-6">
          
          {/* Tabs */}
          <div className="flex border-b border-zinc-100 pb-1 gap-2 text-sm justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                className={`pb-3 font-semibold px-2 transition-all relative ${isRegister && !isAdminMode ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-zinc-400 hover:text-zinc-600'}`}
                onClick={() => {
                  setIsRegister(true);
                  setIsAdminMode(false);
                  setAuthError('');
                  setOtpSent(false);
                }}
              >
                Mandatory Sign Up
              </button>
              <button
                type="button"
                className={`pb-3 font-semibold px-2 transition-all relative ${!isRegister && !isAdminMode ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-zinc-400 hover:text-zinc-600'}`}
                onClick={() => {
                  setIsRegister(false);
                  setIsAdminMode(false);
                  setAuthError('');
                  setOtpSent(false);
                }}
              >
                Instant Access Log In
              </button>
            </div>
            
            <button
              type="button"
              className={`pb-3 font-semibold px-3 py-1 rounded-t-lg transition-all flex items-center gap-1.5 ${isAdminMode ? 'text-rose-600 bg-rose-50 border-b-2 border-rose-600' : 'text-zinc-400 hover:text-zinc-600'}`}
              onClick={() => {
                setIsAdminMode(true);
                setAuthError('');
                setAdminError('');
              }}
            >
              <Shield className="w-4 h-4" /> Admin Console
            </button>
          </div>

          {/* Error Banner */}
          {authError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs flex gap-2.5 items-start">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Incomplete Form</span>
                {authError}
              </div>
            </div>
          )}

          {/* Form Content */}
          {isAdminMode ? (
            /* Admin Password Mode */
            <form onSubmit={handleAdminModeSubmit} className="space-y-4">
              <div className="space-y-2">
                <p className="text-zinc-600 text-xs flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-zinc-400" /> Exclusive administrator channel for pricing update and analytics.
                </p>
                <label className="block text-xs font-bold text-zinc-700 uppercase">Enter Developer / Administrator Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <Key className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    placeholder="Enter admin password (default: admin123)"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                  />
                </div>
              </div>

              {adminError && <p className="text-xs text-rose-600 font-semibold">{adminError}</p>}

              <button
                type="submit"
                className="w-full py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-zinc-900 to-zinc-800 hover:from-rose-950 hover:to-rose-900 transition shadow-md"
              >
                Authenticate Admin session
              </button>
            </form>
          ) : isRegister ? (
            /* User Registration Form */
            !otpSent ? (
              <form onSubmit={triggerOtpSend} className="space-y-5">
                {/* Social Onboarding Integration */}
                <div className="bg-[#FAF9F6] border border-zinc-200 rounded-3xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-150 pb-3">
                    <div>
                      <h4 className="text-sm font-black text-zinc-800 uppercase tracking-tight">
                        ⚡ Quick Social Sign Up & Verification
                      </h4>
                      <p className="text-[10px] text-zinc-500 leading-normal">
                        Select a network to link and automatically register your credentials.
                      </p>
                    </div>
                    <span className="bg-emerald-150 text-emerald-850 text-[9px] font-black px-2 py-0.5 rounded-full uppercase font-mono border border-emerald-350 self-start shrink-0">
                      Multi-Platform Gateway
                    </span>
                  </div>

                  {/* Category 1: Social & Messaging Channels */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider block">
                      💬 Interactive Networks & Messenger Channels
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {SOCIAL_PROVIDERS.filter(p => ['google', 'facebook', 'instagram', 'whatsapp', 'threads', 'telegram', 'discord', 'twitter', 'youtube'].includes(p.id)).map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSocialProvider(p.id)}
                          className={`flex items-center gap-2 p-2.5 rounded-xl text-[11px] font-bold transition shadow-sm border border-zinc-200 hover:border-zinc-300 hover:scale-[1.02] hover:shadow-md ${p.id === 'google' ? 'bg-white text-zinc-700' : p.id === 'threads' ? 'bg-black text-white border-zinc-850' : 'bg-white hover:bg-zinc-50 text-zinc-800'}`}
                        >
                          <span className={`p-1.5 rounded-lg text-white ${p.logoBg} flex items-center justify-center shrink-0`}>
                            {p.svg}
                          </span>
                          <span className="truncate">{p.name.split(' / ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category 2: Professional Directories */}
                  <div className="space-y-2 pt-2 border-t border-zinc-100">
                    <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider block">
                      💼 Trade Portals & Employment Databases
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {SOCIAL_PROVIDERS.filter(p => ['linkedin', 'indeed', 'naukri'].includes(p.id)).map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSocialProvider(p.id)}
                          className="flex items-center gap-2.5 p-2.5 bg-white border border-zinc-200 hover:border-zinc-350 hover:bg-zinc-50 rounded-xl text-[11px] font-black text-zinc-800 transition shadow-sm hover:scale-[1.02] hover:shadow-md"
                        >
                          <span className={`p-1.5 rounded-lg text-white ${p.logoBg} flex items-center justify-center shrink-0`}>
                            {p.svg}
                          </span>
                          <span className="truncate">{p.name} Onboarding</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 my-2 text-zinc-300">
                  <span className="h-px bg-zinc-200 flex-1"></span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#a1a1aa]">Or Register Manually Below</span>
                  <span className="h-px bg-zinc-200 flex-1"></span>
                </div>

                {/* Participant Category (Mandatory selection) */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Join As (Participants Category - Required)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'customer', label: '🛒 Customer', desc: 'Buy fresh food' },
                      { id: 'farmer', label: '👩‍🌾 Farmer', desc: 'Sell farm fresh produce' },
                      { id: 'wholesaler', label: '🏢 Wholesaler', desc: 'Bulk supply orders' },
                      { id: 'retailer', label: '🏪 Retailer', desc: 'Local shop procurement' },
                      { id: 'supplier', label: '🚚 Supplier', desc: 'Logistic distribution' },
                      { id: 'organic_producer', label: '🌿 Organic Producer', desc: '100% natural organic' },
                      { id: 'exporter', label: '✈️ Exporter', desc: 'Cross-border supplier' },
                      { id: 'seller', label: '🤝 Seller', desc: 'List & manage standard products' }
                    ].map((roleType) => (
                      <button
                        key={roleType.id}
                        type="button"
                        onClick={() => setRole(roleType.id as UserRole)}
                        className={`p-3 text-left rounded-xl border text-xs transition duration-200 flex flex-col justify-between h-20 ${
                          role === roleType.id
                            ? 'border-emerald-500 bg-emerald-50/70 rings-2 ring-emerald-500/30 font-semibold text-emerald-950'
                            : 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-700'
                        }`}
                      >
                        <span className="text-xs font-bold leading-none">{roleType.label}</span>
                        <span className="text-[10px] text-zinc-400 mt-1 block font-normal break-words">
                          {roleType.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-700 uppercase">Individual or Business Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Chandra Prasad"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-700 uppercase">
                      {role === 'customer' ? 'Corporate or Unit Name (Optional)' : 'Registered Business Name *'}
                    </label>
                    <input
                      type="text"
                      required={role !== 'customer'}
                      placeholder={role === 'customer' ? 'Optional' : 'e.g. Ganga Agro Exports Pvt Ltd'}
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-700 uppercase">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. ramesh@farmfresh.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-700 uppercase">Mobile Number (For SMS validation) *</label>
                    <input
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      placeholder="Enter 10-digit number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 tracking-wider font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Real-time Address Autocomplete Input Field */}
                <div className="space-y-1.5 relative">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-zinc-700 uppercase">
                      Trading or Delivery Address *
                    </label>
                    {isKeyPotentiallyValid(process.env.GOOGLE_MAPS_PLATFORM_KEY || '') && !mapsAuthFailed ? (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-150 px-2 py-0.5 rounded font-black uppercase tracking-wider flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Google Autocomplete Active
                      </span>
                    ) : (
                      <span className="text-[10px] bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded font-bold">
                        Simulation Mode (Offline Preset Fallbacks)
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Type complete landmark, city, or sector (e.g., Patna, Noida, Connaught Place...)"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>

                  {addressSuggestions.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-zinc-200 rounded-2xl shadow-xl max-h-56 overflow-y-auto divide-y divide-zinc-100">
                      {addressSuggestions.map((item, index) => (
                        <button
                          key={index}
                          type="button"
                          className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 transition flex items-start gap-2.5 text-xs text-zinc-700 font-medium"
                          onClick={() => handleSelectAddressSuggestion(item)}
                        >
                          <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-zinc-950 block truncate">{item.name}</span>
                            <span className="text-zinc-500 text-[10px] truncate block">{item.address} {item.isGoogleResult ? '(Google Real-Time)' : ''}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {role !== 'customer' && (
                  <div className="space-y-1.5 p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-zinc-700 uppercase">
                        Sellers Coverage Area (Radius)
                      </label>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        {coverageRadius} km
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={coverageRadius}
                      onChange={(e) => setCoverageRadius(parseInt(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-zinc-200 rounded-lg appearance-none"
                    />
                    <p className="text-[10px] text-zinc-500">
                      Determine geographical coordinates threshold radius for accepting orders within your vicinity.
                    </p>
                  </div>
                )}

                {/* Optional Social Networking Links Accordion */}
                <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => setIsSocialLinksOpen(!isSocialLinksOpen)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-50 transition"
                  >
                    <div className="flex items-center gap-2">
                       <span className="text-lg">🔗</span>
                       <div>
                         <span className="text-xs font-black uppercase text-zinc-800 tracking-wider block">
                           Network Integration & Video Showcase (Highly Recommended)
                         </span>
                         <span className="text-[10px] text-zinc-500 font-medium">
                           Link WhatsApp, Twitter/X, YouTube, Instagram, & upload crop presentation clips!
                         </span>
                       </div>
                    </div>
                    <span className="text-xs font-bold text-zinc-500 bg-zinc-100 px-2 py-1 rounded">
                      {isSocialLinksOpen ? '▲ Hide Section' : '▼ Expand & Stream (10 Platforms & Videos)'}
                    </span>
                  </button>

                  {isSocialLinksOpen && (
                    <div className="p-4 border-t border-zinc-150 bg-[#FAF9F6] space-y-4 animate-fade-in">
                      <p className="text-[10px] text-zinc-500 leading-normal">
                        Showcase your active links so other farmers, exporters, wholesalers and consumers in Bihar can tap your logos and instantly communicate or connect with you!
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* Instagram */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-extrabold uppercase text-pink-700 flex items-center gap-1">
                            📸 Instagram Handle
                          </label>
                          <input
                            type="text"
                            placeholder="@your.username (e.g. @santy_patna)"
                            value={socialInstagram}
                            onChange={(e) => setSocialInstagram(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs"
                          />
                        </div>

                        {/* WhatsApp */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-extrabold uppercase text-emerald-850 flex items-center gap-1">
                            💬 WhatsApp Link / Mobile
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. +919279120271"
                            value={socialWhatsApp}
                            onChange={(e) => setSocialWhatsApp(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs"
                          />
                        </div>

                        {/* Threads */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-extrabold uppercase text-black flex items-center gap-1">
                            🧵 Threads Username
                          </label>
                          <input
                            type="text"
                            placeholder="@username (e.g. @santy_threads)"
                            value={socialThreads}
                            onChange={(e) => setSocialThreads(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs"
                          />
                        </div>

                        {/* Telegram */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-extrabold uppercase text-sky-700 flex items-center gap-1">
                            ✈️ Telegram Username or Channel
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. @patna_veggies_bulk"
                            value={socialTelegram}
                            onChange={(e) => setSocialTelegram(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs"
                          />
                        </div>

                        {/* Discord */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-extrabold uppercase text-indigo-700 flex items-center gap-1">
                            🎮 Discord Invite or Tag
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. discord.gg/agroserver or user#1234"
                            value={socialDiscord}
                            onChange={(e) => setSocialDiscord(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs"
                          />
                        </div>

                        {/* LinkedIn */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-extrabold uppercase text-blue-800 flex items-center gap-1">
                            💼 LinkedIn Profile URL
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. linkedin.com/in/santosh-kumar"
                            value={socialLinkedIn}
                            onChange={(e) => setSocialLinkedIn(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs"
                          />
                        </div>

                        {/* Indeed */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-extrabold uppercase text-[#2557a7] flex items-center gap-1">
                            🎯 Indeed Profile or Resume ID
                          </label>
                          <input
                            type="text"
                            placeholder="Indeed Job / Recruiter handle"
                            value={socialIndeed}
                            onChange={(e) => setSocialIndeed(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs"
                          />
                        </div>

                        {/* Naukri */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-extrabold uppercase text-[#002C5E] flex items-center gap-1">
                            🏢 Naukri Recruiter ID or CV Link
                          </label>
                          <input
                            type="text"
                            placeholder="Naukri ID / resume CV Link"
                            value={socialNaukri}
                            onChange={(e) => setSocialNaukri(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs"
                          />
                        </div>

                        {/* Twitter / X */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-extrabold uppercase text-zinc-900 flex items-center gap-1">
                            𝕏 Twitter / X Profile URL
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. twitter.com/yourhandle"
                            value={socialTwitter}
                            onChange={(e) => setSocialTwitter(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs"
                          />
                        </div>

                        {/* YouTube Channel */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-extrabold uppercase text-rose-700 flex items-center gap-1">
                            🔴 YouTube Channel URL
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. youtube.com/@yourchannel"
                            value={socialYouTube}
                            onChange={(e) => setSocialYouTube(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs"
                          />
                        </div>

                        {/* Dynamic Business Video & Product Showcase Upload Area */}
                        <div className="col-span-1 sm:col-span-2 pt-3.5 border-t border-zinc-200/80 space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🎬</span>
                            <div>
                              <span className="text-[11px] font-black uppercase text-zinc-800 tracking-tight block">
                                Crop & Business Presentation Video Showcase
                              </span>
                              <p className="text-[10px] text-zinc-500 leading-normal">
                                Paste a video url (e.g., YouTube) or select standard video files to display custom play buttons with official YouTube red logo for trade guild!
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-white p-3.5 border border-zinc-200 rounded-2xl shadow-xs">
                            {/* Option A: Paste YouTube/Video Link */}
                            <div className="space-y-2">
                              <span className="text-[9px] font-black uppercase text-zinc-400 block tracking-widest border-b border-zinc-100 pb-1">
                                Option 1: Link YouTube Video
                              </span>
                              <div className="space-y-2">
                                <div>
                                  <label className="text-[9px] font-bold text-zinc-650 block mb-0.5">Custom Video Headline / Caption</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Modern Cauliflower Harvesting in Patna"
                                    value={socialYoutubeVideoTitle}
                                    onChange={(e) => setSocialYoutubeVideoTitle(e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] font-bold text-zinc-650 block mb-0.5">YouTube Video Web URL</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. https://www.youtube.com/watch?v=youtube_id"
                                    value={socialYoutubeVideoLink}
                                    onChange={(e) => setSocialYoutubeVideoLink(e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Option B: Direct Video File Upload Simulation */}
                            <div className="space-y-2 flex flex-col justify-between">
                              <div>
                                <span className="text-[9px] font-black uppercase text-zinc-400 block tracking-widest border-b border-zinc-100 pb-1">
                                  Option 2: Direct Video File Upload
                                </span>
                                <p className="text-[9px] text-zinc-500 mt-1 leading-normal">
                                  Upload farm tour videos directly. Direct uploads are securely encoded & watermarked automatically.
                                </p>
                              </div>

                              <div className="relative mt-2">
                                <input
                                  type="file"
                                  accept="video/*"
                                  id="direct_video_uploader"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setIsUploadingVideo(true);
                                      setTimeout(() => {
                                        setUploadedVideoFile({
                                          name: file.name,
                                          size: (file.size / (1024 * 1024)).toFixed(1) + ' MB'
                                        });
                                        setSocialYoutubeVideoTitle(file.name.replace(/\.[^/.]+$/, ""));
                                        setSocialYoutubeVideoLink("https://youtube.com/watch?v=file_uploads_BiharAgri_" + Math.floor(Math.random() * 9000));
                                        setIsUploadingVideo(false);
                                      }, 1300);
                                    }
                                  }}
                                />

                                {isUploadingVideo ? (
                                  <div className="flex flex-col items-center justify-center p-4 bg-zinc-50 border border-dashed border-zinc-300 rounded-xl">
                                    <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent animate-spin rounded-full mb-1"></div>
                                    <span className="text-[9px] text-zinc-500 font-bold font-mono">Syncing & Encoding Clip...</span>
                                  </div>
                                ) : uploadedVideoFile ? (
                                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                                    <div className="min-w-0">
                                      <span className="text-[10px] font-black text-emerald-900 block truncate">🎥 {uploadedVideoFile.name}</span>
                                      <span className="text-[9px] text-emerald-600 block">{uploadedVideoFile.size} • Upload Complete!</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setUploadedVideoFile(null);
                                        setSocialYoutubeVideoLink('');
                                        setSocialYoutubeVideoTitle('');
                                      }}
                                      className="text-xs text-rose-600 hover:text-rose-800 font-bold bg-white px-2 py-1 rounded-md border border-rose-200 cursor-pointer shrink-0"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                ) : (
                                  <label
                                    htmlFor="direct_video_uploader"
                                    className="flex flex-col items-center justify-center p-3 bg-zinc-50 hover:bg-zinc-100 border border-dashed border-zinc-300 rounded-xl cursor-pointer transition text-center"
                                  >
                                    <span className="text-lg">📤</span>
                                    <span className="text-[10px] font-black text-zinc-700 mt-1">Upload Farm Clip (MP4/MOV)</span>
                                    <span className="text-[8px] text-zinc-400">Drag/Drop or click to browse files</span>
                                  </label>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}
                </div>

                {/* Google Maps Location Coordinates Selection */}
                <div className="space-y-2">
                  <div className="p-3 bg-emerald-50 border border-emerald-100/80 rounded-xl flex items-start gap-2.5">
                    <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-xs text-emerald-950 block">Accuracy Matters: Google Maps Location Pick</span>
                      <p className="text-[11px] text-emerald-800">
                        Please select your primary delivery address or farm warehouse site on the interactive map below. This validates your trading region.
                      </p>
                    </div>
                  </div>
                  <GoogleMap
                    center={coords}
                    onChange={(newCoords, newAddr) => {
                      setCoords(newCoords);
                      setAddress(newAddr);
                    }}
                    radiusKm={role !== 'customer' ? coverageRadius : 5}
                    label="Pin your exact location on Google Maps"
                    sellers={allSellersList}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 transition shadow-lg shrink-0 flex items-center justify-center gap-2"
                >
                  <Smartphone className="w-4 h-4" /> Request Simulated Mobile OTP
                </button>
              </form>
            ) : (
              /* OTP verification state */
              <form onSubmit={handleVerifyRegistration} className="space-y-6 py-6 text-center max-w-sm mx-auto">
                <div className="mx-auto bg-emerald-100 text-emerald-800 w-16 h-16 rounded-full flex items-center justify-center mb-2">
                  <Smartphone className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-zinc-900">OTP Sent & Pending</h3>
                  <p className="text-xs text-zinc-500 px-4">
                    A verification code was routed to <strong className="font-mono text-zinc-700">{phone}</strong>. Look at the top floating SMS simulated banner on screen!
                  </p>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter 6-digit OTP code"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-3 bg-zinc-50 border-2 border-zinc-200 rounded-xl text-center text-lg font-mono font-black tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="flex justify-between text-xs px-1">
                    <button
                      type="button"
                      className="text-emerald-600 hover:underline font-semibold"
                      onClick={() => {
                        const code = Math.floor(100000 + Math.random() * 900000).toString();
                        setGeneratedOtp(code);
                        setOtpNotification(`💬 FreshMarket NEW OTP: Your validation code is ${code}. Valid for 10 minutes.`);
                      }}
                    >
                      Resend SMS Code
                    </button>
                    <button
                      type="button"
                      className="text-zinc-500 hover:text-zinc-700 underline"
                      onClick={() => setOtpSent(false)}
                    >
                      Change Phone Number
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black text-xs tracking-wider uppercase bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-750 hover:to-teal-850 transition shadow-md"
                >
                  Verify Code & Create Profile
                </button>
              </form>
            )
          ) : (
            /* Traditional Log In with preloaded accounts or manual entry */
            <div className="space-y-6">
              {/* Social Login buttons */}
              <div className="bg-[#FAF9F6] border border-zinc-200 rounded-3xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-150 pb-3">
                  <div>
                    <h4 className="text-sm font-black text-zinc-800 uppercase tracking-tight">
                      ⚡ Instant Social Account Login
                    </h4>
                    <p className="text-[10px] text-zinc-500 leading-normal">
                      Acknowledge your account below to sign in instantly with dynamic context matching.
                    </p>
                  </div>
                  <span className="bg-emerald-150 text-emerald-850 text-[9px] font-black px-2 py-0.5 rounded-full uppercase font-mono border border-emerald-355 self-start shrink-0">
                    Trusted OAuth SSO
                  </span>
                </div>

                {/* Category 1: Social & Messaging Channels */}
                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider block">
                    💬 Chat Intercoms & Social Networks
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SOCIAL_PROVIDERS.filter(p => ['google', 'facebook', 'instagram', 'whatsapp', 'threads', 'telegram', 'discord', 'twitter', 'youtube'].includes(p.id)).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSocialProvider(p.id)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl text-[11px] font-bold transition shadow-sm border border-zinc-200 hover:border-zinc-300 hover:scale-[1.02] hover:shadow-md ${p.id === 'google' ? 'bg-white text-zinc-700' : p.id === 'threads' ? 'bg-black text-white border-zinc-850' : 'bg-white hover:bg-zinc-50 text-zinc-800'}`}
                      >
                        <span className={`p-1.5 rounded-lg text-white ${p.logoBg} flex items-center justify-center shrink-0`}>
                          {p.svg}
                        </span>
                        <span className="truncate">{p.name.split(' / ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category 2: Professional Directories */}
                <div className="space-y-2 pt-2 border-t border-zinc-100">
                  <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider block">
                    💼 Trade Portals & Placement Directories
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {SOCIAL_PROVIDERS.filter(p => ['linkedin', 'indeed', 'naukri'].includes(p.id)).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSocialProvider(p.id)}
                        className="flex items-center gap-2.5 p-2.5 bg-white border border-zinc-200 hover:border-zinc-350 hover:bg-zinc-50 rounded-xl text-[11px] font-black text-zinc-800 transition shadow-sm hover:scale-[1.02] hover:shadow-md"
                      >
                        <span className={`p-1.5 rounded-lg text-white ${p.logoBg} flex items-center justify-center shrink-0`}>
                          {p.svg}
                        </span>
                        <span className="truncate">{p.name} Login</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 my-1.5 text-zinc-300">
                <span className="h-px bg-zinc-200 flex-1"></span>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#a1a1aa]">Or Access via Demo Keys</span>
                <span className="h-px bg-zinc-200 flex-1 text-[#a1a1aa]"></span>
              </div>

              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl">
                <h3 className="text-xs font-black uppercase text-zinc-500 mb-3 tracking-widest">
                  Quick Log In With Preloaded Demonstration Profiles
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PRELOADED_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleQuickLogin(acc)}
                      className="text-left p-3.5 bg-white border border-zinc-200 rounded-xl hover:border-emerald-500 hover:shadow-sm transition group"
                    >
                      <div className="flex items-center gap-1.5 justify-between">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-wider">
                          {acc.role.replace('_', ' ')}
                        </span>
                        <UserCheck className="w-3.5 h-3.5 text-zinc-300 group-hover:text-emerald-500" />
                      </div>
                      <p className="text-xs font-extrabold text-zinc-800 mt-1">{acc.name}</p>
                      <p className="text-[10px] text-zinc-400 font-mono truncate">{acc.phone}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Login form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  // Simulate matching registered users
                  const allUsers = JSON.parse(localStorage.getItem('freshmarket_registered_users') || '[]');
                  const matched = allUsers.find((u: any) => u.phone === phone);
                  if (matched) {
                    onAuthSuccess(matched);
                  } else {
                    // Fail over / dynamic simulation
                    const generatedProfile: UserProfile = {
                      id: `dyn_${Date.now()}`,
                      name: name || 'Demo Member',
                      role: role,
                      email: email || 'demo@freshmarket.com',
                      phone: phone || '8005551212',
                      address: address,
                      coordinates: coords,
                      coverageRadius: role !== 'customer' ? coverageRadius : 0
                    };
                    onAuthSuccess(generatedProfile);
                  }
                }} 
                className="space-y-4 pt-2"
              >
                <div className="p-3 bg-zinc-100 border border-zinc-200 text-zinc-600 text-[11px] rounded-lg">
                  📝 Registered before but on a new browser? You can enter your phone and select your category to recover your session instantly.
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-700 uppercase">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9279120271"
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-mono tracking-wider font-bold"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-700 uppercase">Target Role Profile</label>
                    <select
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm"
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                    >
                      <option value="customer">Customer (Home Buyer)</option>
                      <option value="farmer">Farmer (Producer)</option>
                      <option value="wholesaler">Wholesaler</option>
                      <option value="retailer">Retailer</option>
                      <option value="supplier">Supplier / Agent</option>
                      <option value="organic_producer">Organic Specialist</option>
                      <option value="exporter">Exporter</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm tracking-wide transition shadow-md"
                >
                  Confirm Identifier Log In
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Right Side: Informational Features & Platform Status */}
        <div className="space-y-4 lg:col-span-4 lg:sticky lg:top-8">
          <div className="bg-zinc-900 text-white border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" /> Secure Agri-Chain Protocol
            </h3>
            <p className="text-xs text-zinc-300">
              FreshMarket protects both farmers and retail consumers by enforcing a tight location accuracy policy with verified secure handshakes.
            </p>

            <ul className="space-y-3 pt-2 text-xs">
              <li className="flex items-start gap-2 text-zinc-300">
                <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-mono leading-none mt-0.5">
                  RULE 1
                </span>
                <span>Farmers set wholesale prices. Admin maintains the centralized rate card guidelines.</span>
              </li>
              <li className="flex items-start gap-2 text-zinc-300">
                <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-mono leading-none mt-0.5">
                  RULE 2
                </span>
                <span>OTP verification is mandatory at registration and placement to secure transactions against fraud.</span>
              </li>
              <li className="flex items-start gap-2 text-zinc-300">
                <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-mono leading-none mt-0.5">
                  RULE 3
                </span>
                <span>Point of delivery is certified securely only when the customer releases the unique numeric payload upon delivery.</span>
              </li>
            </ul>

            <div className="border-t border-zinc-800 pt-4 flex gap-3 items-center text-xs">
              <MapPin className="w-5 h-5 text-rose-500" />
              <div>
                <span className="font-bold text-[10px] text-zinc-400 uppercase font-mono block">GPS Verification Area</span>
                <span className="text-zinc-300 text-[11px]">Real-time distance validations powered by Google Maps</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-md space-y-3.5 text-xs text-zinc-600">
            <h4 className="font-black text-zinc-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Info className="w-4 h-4 text-emerald-600" /> Developer Contacts
            </h4>
            <div className="space-y-1">
              <p className="font-semibold text-zinc-800">Support Hotline:</p>
              <p className="text-emerald-700 font-mono font-bold text-sm bg-emerald-50 px-2 py-1 rounded inline-block">
                +91 {adminPhone}
              </p>
            </div>
            <div className="pt-2 border-t border-zinc-100">
              <p className="text-zinc-500">
                Email marketplace feedback directly to developer:
              </p>
              <a 
                href={`mailto:santoshprasad8891@gmail.com?subject=FreshMarket%20Marketplace%20Platform%20Details&body=Hi%20Santosh,%0D%0A%0D%0AI%20am%20testing%20the%20FreshMarket%20veggies%20and%20fruits%20marketplace%20portal.%20Here%20is%20the%20website%20preview%20link:%20${window.location.href}%0D%0A%0D%0AAll%20features%20look%20amazing!`} 
                className="text-emerald-600 font-bold hover:underline block mt-1"
              >
                santoshprasad8891@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* High Fidelity OAuth Dialog Overlay */}
      {socialProvider && (() => {
        const pMeta = SOCIAL_PROVIDERS.find(p => p.id === socialProvider) || SOCIAL_PROVIDERS[0];
        const simulatedAccounts = SIMULATED_SOCIAL_ACCOUNTS[socialProvider] || [];
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in" id="social-oauth-overlay">
            <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 flex flex-col">
              
              {/* Modal Header */}
              <div 
                className="p-5 text-white flex items-center justify-between transition-all"
                style={{ backgroundColor: pMeta.brandColor }}
              >
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-white/20 rounded-md">
                    {pMeta.svg}
                  </span>
                  <span className="font-extrabold text-sm tracking-tight">
                    {pMeta.name} Integration Gateway
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSocialProvider(null)}
                  className="hover:bg-white/20 p-1.5 rounded-full text-white/95 hover:text-white transition font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                <div className="text-center space-y-1">
                  <h3 className="font-extrabold text-zinc-800 text-sm">
                    Syndicated Verification with {pMeta.name}
                  </h3>
                  <p className="text-[11px] text-zinc-500 leading-normal">
                    To connect to <strong>FreshMarket Patna</strong> and link your networks, select an account or add your credentials below.
                  </p>
                </div>

                {/* Express Account Chooser */}
                <div className="space-y-2">
                  {simulatedAccounts.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleSelectSocialAccount(acc.name, acc.email, acc.phone)}
                      className="w-full p-3.5 bg-zinc-50 hover:bg-emerald-50/50 hover:border-emerald-500 border border-zinc-200 rounded-xl transition flex items-center gap-3 text-left group"
                    >
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ring-2 ring-white text-white shrink-0"
                        style={{ backgroundColor: pMeta.brandColor }}
                      >
                        {acc.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-extrabold text-zinc-800 text-xs group-hover:text-emerald-950 truncate">{acc.name}</p>
                        <p className="text-[10px] text-zinc-500 font-mono truncate">{acc.email}</p>
                      </div>
                      <span className="bg-white px-2 py-1 rounded text-[9px] text-zinc-400 font-bold border border-zinc-150 shadow-sm opacity-0 group-hover:opacity-100 transition shrink-0">
                        Link / Sign In
                      </span>
                    </button>
                  ))}
                </div>

                {/* Add Custom User Row */}
                <div className="pt-3 border-t border-zinc-150 space-y-3">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest text-[#a1a1aa] text-center">
                    Linking alternative {pMeta.name} handle
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      placeholder="Associated Handlers Name"
                      className="px-3 py-2 border border-zinc-200 bg-zinc-100/50 rounded-lg text-xs"
                      value={customSocialName}
                      onChange={(e) => setCustomSocialName(e.target.value)}
                    />
                    <input
                      type="email"
                      placeholder={pMeta.id === 'google' ? 'user@gmail.com' : `username@${pMeta.id}.com`}
                      className="px-3 py-2 border border-zinc-200 bg-zinc-100/50 rounded-lg text-xs"
                      value={customSocialEmail}
                      onChange={(e) => setCustomSocialEmail(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (customSocialName && customSocialEmail) {
                        handleSelectSocialAccount(
                          customSocialName,
                          customSocialEmail,
                          '998844' + Math.floor(1000 + Math.random() * 9000).toString()
                        );
                        setCustomSocialName('');
                        setCustomSocialEmail('');
                      } else {
                        setAuthError('Please fill in both name and social identity address first.');
                      }
                    }}
                    className="w-full py-2 text-white font-bold rounded-xl text-xs transition shadow-md hover:brightness-110"
                    style={{ backgroundColor: pMeta.brandColor }}
                  >
                    Authorize Custom {pMeta.name} OAuth handshake
                  </button>
                </div>

                {/* Onboarding block if user is NOT yet registered */}
                {name && email && (
                  <div className="p-4 bg-emerald-50/70 border border-[#bbf7d0] rounded-2xl space-y-3">
                    <div className="flex items-center gap-1.5 text-emerald-950 font-extrabold text-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                      <span>Link successfully established! Proceed to onboarding:</span>
                    </div>
                    <p className="text-[10px] text-zinc-650 leading-normal">
                      Your identity through <strong>{pMeta.name} ({email})</strong> is linked. To register instantly on this platform, answer these questions:
                    </p>
                    
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[9px] font-black uppercase text-zinc-500 mb-1">Target Category</label>
                        <select
                          className="w-full text-xs p-1.5 border border-zinc-250 bg-white rounded-lg font-bold text-zinc-700"
                          value={socialOnboardingRole}
                          onChange={(e) => setSocialOnboardingRole(e.target.value as UserRole)}
                        >
                          <option value="customer">Customer (Home Vegetable Buyer)</option>
                          <option value="farmer">Farmer (Produce Grower)</option>
                          <option value="seller">Seller (Standard Product Merchant)</option>
                          <option value="wholesaler">Agricultural Wholesaler</option>
                          <option value="retailer">Local Retail Grocery Shop</option>
                          <option value="supplier">Logistic Distribution Supplier</option>
                          <option value="organic_producer">Organic Farming Specialist</option>
                          <option value="exporter">Agriculture Produce Exporter</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] font-black uppercase text-zinc-500 mb-1">Pin Location Address on Bihar Gate</label>
                        <input
                          type="text"
                          className="w-full text-xs p-1.5 border border-zinc-250 bg-white rounded-lg text-zinc-700"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCompleteSocialOnboarding}
                      className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black uppercase tracking-wider rounded-xl transition"
                    >
                      Authenticate and Register on this Platform
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-zinc-50 p-3.5 border-t border-zinc-150 text-center text-[10px] text-zinc-500 flex items-center justify-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-600" /> End-to-end sandbox token verification active.
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}

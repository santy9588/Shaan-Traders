import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register standard Progressive Web App service worker for native mobile feel
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => console.log('FreshMarket PWA Service Worker activated successfully:', reg.scope))
      .catch((err) => console.warn('PWA Service Worker registration deferred:', err));
  });
}

// Intercept Google Maps Authentication Failures (such as InvalidKeyMapError) globally
(window as any).gm_authFailure = () => {
  console.warn('Google Maps authentication failed globally. Switching to offline simulation modes.');
  (window as any).googleMapsAuthFailed = true;
  window.dispatchEvent(new CustomEvent('google-maps-auth-failure'));
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

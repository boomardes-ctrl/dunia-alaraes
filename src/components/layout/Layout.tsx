import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';
import { api } from '../../lib/api';
import type { Settings } from '../../types';

function hexToRgb(hex: string) {
  const c = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return c ? `${parseInt(c[1], 16)}, ${parseInt(c[2], 16)}, ${parseInt(c[3], 16)}` : '107, 29, 58';
}

function lighten(hex: string, p: number) {
  const c = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!c) return '#6B1D3A';
  const l = (v: number) => Math.min(255, Math.round(v + (255 - v) * p));
  return `rgb(${l(parseInt(c[1], 16))}, ${l(parseInt(c[2], 16))}, ${l(parseInt(c[3], 16))})`;
}

function darken(hex: string, p: number) {
  const c = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!c) return '#4A1227';
  const d = (v: number) => Math.round(v * (1 - p));
  return `rgb(${d(parseInt(c[1], 16))}, ${d(parseInt(c[2], 16))}, ${d(parseInt(c[3], 16))})`;
}

export default function Layout() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    api.getSettings().then(s => {
      setSettings(s);
      const root = document.documentElement;
      const p = s.primaryColor || '#6B1D3A';
      const a = s.accentColor || '#C9A84C';
      root.style.setProperty('--color-primary', p);
      root.style.setProperty('--color-primary-light', lighten(p, 0.25));
      root.style.setProperty('--color-primary-dark', darken(p, 0.2));
      root.style.setProperty('--color-primary-rgb', hexToRgb(p));
      root.style.setProperty('--color-accent', a);
      root.style.setProperty('--color-accent-light', lighten(a, 0.25));
      root.style.setProperty('--color-accent-dark', darken(a, 0.2));
      root.style.setProperty('--color-accent-rgb', hexToRgb(a));
      root.style.setProperty('--color-bg', s.bgColor || '#FDF8F5');
      root.style.setProperty('--color-text', s.textColor || '#1A1A1A');
      root.style.setProperty('--color-text-light', s.textLight || '#6B7280');
      root.style.setProperty('--color-border', s.borderColor || '#E5E7EB');
      root.style.setProperty('--color-success', s.successColor || '#059669');
      root.style.setProperty('--color-warning', s.warningColor || '#D97706');
      root.style.setProperty('--color-error', s.errorColor || '#DC2626');
      root.style.setProperty('--color-header-bg', s.headerBg || p);
      root.style.setProperty('--color-header-text', s.headerText || '#FFFFFF');
      root.style.setProperty('--color-footer-bg', s.footerBg || darken(p, 0.2));
      root.style.setProperty('--color-footer-text', s.footerText || '#FFFFFF');
      root.style.setProperty('--color-card-bg', s.cardBg || '#FFFFFF');
      root.style.setProperty('--color-btn-bg', s.buttonBg || p);
      root.style.setProperty('--color-btn-text', s.buttonText || '#FFFFFF');
    }).catch(() => {});
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header settings={settings} />
      <main className={`flex-1 ${isHome ? '' : 'pt-20'}`}>
        <Outlet context={{ settings }} />
      </main>
      <Footer settings={settings} />
      {settings?.whatsapp && <WhatsAppButton phone={settings.whatsapp} />}
    </div>
  );
}

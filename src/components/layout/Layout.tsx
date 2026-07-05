import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';
import { api } from '../../lib/api';
import type { Settings } from '../../types';

export default function Layout() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    api.getSettings().then(setSettings).catch(() => {});
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

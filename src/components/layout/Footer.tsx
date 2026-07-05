import { Phone, Mail, MapPin, Heart, Settings } from 'lucide-react';
import type { Settings as SiteSettings } from '../../types';
import { SOCIAL_PLATFORMS } from '../../types';

interface Props { settings: SiteSettings | null }

const platformSvg: Record<string, string> = {
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
  tiktok: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.9 2.89 2.89 0 0 1-2.88-2.89 2.89 2.89 0 0 1 2.88-2.89c.2 0 .39.02.58.05V8.75a6.41 6.41 0 0 0-.58-.04 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.84a8.26 8.26 0 0 0 4.76 1.5v-3.4a4.84 4.84 0 0 1-1.9-1.25z"/></svg>',
  twitter: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98" fill="white"/></svg>',
  snapchat: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-5.5 0-10 3.6-10 8.5 0 1.5.4 2.9 1.1 4-.2.5-.5 1-.9 1.3-.9.8-2 1-3 1.2v.5c0 .5 2.8 1.5 7.8 1.5.5 0 1 .1 1.5.1.5 0 1-.1 1.5-.1 5 0 7.8-1 7.8-1.5v-.5c-1-.2-2.1-.5-3-1.2-.4-.3-.7-.8-.9-1.3.7-1.1 1.1-2.5 1.1-4C22 5.6 17.5 2 12 2z"/></svg>',
  telegram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.5 3.5L2.5 10.5c-.8.3-.7 1.5.1 1.8l4.9 1.8 2.8 6.3c.3.7 1.2.9 1.8.4l3.1-2.7c.4-.3.9-.4 1.4-.2l5.6 2.3c.8.3 1.6-.4 1.4-1.2l-4-16c-.2-.8-1.1-1.2-1.8-.8zM10.6 14.7l-.8 3.7-1.8-6.3 10-6.5-7.4 9.1z"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.523 3.655 1.422 5.149L2 22l4.851-1.422A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.4a8.36 8.36 0 01-4.256-1.175l-.304-.184-2.88.845.845-2.88-.184-.304A8.356 8.356 0 013.6 12c0-4.635 3.765-8.4 8.4-8.4s8.4 3.765 8.4 8.4-3.765 8.4-8.4 8.4z"/></svg>',
  pinterest: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.237 2.636 7.855 6.356 9.312-.087-.791-.167-2.005.035-2.868.183-.78 1.172-4.971 1.172-4.971s-.299-.599-.299-1.483c0-1.391.806-2.428 1.809-2.428.853 0 1.265.64 1.265 1.408 0 .858-.546 2.14-.828 3.329-.236.995.5 1.807 1.48 1.807 1.776 0 3.143-1.873 3.143-4.575 0-2.392-1.719-4.064-4.173-4.064-2.843 0-4.512 2.132-4.512 4.335 0 .858.331 1.779.744 2.28a.3.3 0 01.069.288c-.076.316-.245.996-.278 1.135-.044.183-.145.222-.335.134-1.247-.581-2.027-2.405-2.027-3.871 0-3.152 2.29-6.045 6.601-6.045 3.464 0 6.157 2.469 6.157 5.77 0 3.444-2.171 6.213-5.185 6.213-1.012 0-1.964-.526-2.29-1.148l-.623 2.378c-.226.869-.835 1.958-1.243 2.622.936.29 1.931.446 2.96.446 5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
};

export default function Footer({ settings }: Props) {
  if (!settings) return null;
  const links = settings.socialLinks || [];
  return (
    <footer className="relative bg-gradient-to-br from-[#2D0A18] via-primary-dark to-[#1A050D] text-white mt-24 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center shadow-xl">
                <Heart size={22} className="text-white" />
              </div>
              <h3 className="text-2xl font-black">{settings.siteName}</h3>
            </div>
            <p className="text-gray-300 leading-relaxed text-sm">{settings.siteDescription}</p>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-5 relative inline-block">
              روابط سريعة
              <span className="absolute -bottom-2 right-0 w-10 h-1 bg-accent rounded-full" />
            </h4>
            <ul className="space-y-3">
              {[
                { to: '/', label: 'الرئيسية' },
                { to: '/products', label: 'المنتجات' },
                { to: '/products?hasOffer=1', label: 'العروض' },
              ].map((link) => (
                <li key={link.to}>
                  <a href={link.to} className="text-gray-300 hover:text-accent transition-all flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-accent/50 rounded-full group-hover:bg-accent transition-all" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-5 relative inline-block">
              معلومات التواصل
              <span className="absolute -bottom-2 right-0 w-10 h-1 bg-accent rounded-full" />
            </h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-gray-300 group">
                <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-accent/20 transition-all">
                  <Phone size={16} className="group-hover:text-accent transition-all" />
                </div>
                <span dir="ltr" className="text-sm">{settings.phone}</span>
              </li>
              <li className="flex items-center gap-3 text-gray-300 group">
                <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-accent/20 transition-all">
                  <Mail size={16} className="group-hover:text-accent transition-all" />
                </div>
                <span className="text-sm">{settings.email}</span>
              </li>
              <li className="flex items-center gap-3 text-gray-300 group">
                <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-accent/20 transition-all">
                  <MapPin size={16} className="group-hover:text-accent transition-all" />
                </div>
                <span className="text-sm">{settings.address}</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-5 relative inline-block">
              تابعينا
              <span className="absolute -bottom-2 right-0 w-10 h-1 bg-accent rounded-full" />
            </h4>
            <p className="text-gray-300 text-sm mb-4">تابعينا على وسائل التواصل الاجتماعي</p>
            <div className="flex flex-wrap gap-3">
              {links.length === 0 && (
                <p className="text-gray-500 text-xs">لا توجد روابط بعد</p>
              )}
              {links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 bg-white/5 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-accent/20 hover:scale-110 hover:shadow-lg transition-all group"
                  title={link.label || SOCIAL_PLATFORMS[link.platform]?.label || link.platform}
                >
                  <span
                    className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-all text-white"
                    dangerouslySetInnerHTML={{ __html: platformSvg[link.platform] || '' }}
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            جميع الحقوق محفوظة &copy; {new Date().getFullYear()} {settings.siteName}
          </p>
          <a
            href="/admin"
            className="text-gray-400 hover:text-white text-sm transition-all flex items-center gap-2 bg-white/5 hover:bg-accent/20 px-4 py-2 rounded-xl border border-white/10 hover:border-accent/30"
          >
            <Settings size={14} />
            <span>لوحة الإدارة</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

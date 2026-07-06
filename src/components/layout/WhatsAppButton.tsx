import { MessageCircle } from 'lucide-react';

interface Props {
  phone: string;
}

export default function WhatsAppButton({ phone }: Props) {
  const num = String(phone).replace(/[^0-9]/g, '');
  return (
    <a
      href={`https://wa.me/${num}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-40 group"
      title="تواصل معنا عبر واتساب"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-60 group-hover:opacity-80 transition-opacity animate-pulse" />
        <div className="relative bg-gradient-to-br from-green-400 to-green-600 text-white p-4 rounded-full shadow-2xl group-hover:scale-110 transition-all duration-300 group-hover:shadow-green-500/40">
          <MessageCircle size={28} />
        </div>
      </div>
    </a>
  );
}

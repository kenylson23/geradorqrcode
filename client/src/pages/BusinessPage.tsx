import { useEffect, useState } from "react";
import { Briefcase, Globe, MapPin, Clock, Phone, Mail, ExternalLink, MessageCircle } from "lucide-react";
import { SiInstagram, SiTiktok, SiFacebook, SiWhatsapp, SiYoutube } from "react-icons/si";
import { decompressFromEncodedURIComponent as lzDecompress } from "lz-string";

const SOCIAL_MAP: Record<string, { Icon: any; color: string; label: string }> = {
  instagram: { Icon: SiInstagram, color: "#E1306C", label: "Instagram" },
  tiktok:    { Icon: SiTiktok,    color: "#000000", label: "TikTok" },
  facebook:  { Icon: SiFacebook,  color: "#1877F2", label: "Facebook" },
  whatsapp:  { Icon: SiWhatsapp,  color: "#25D366", label: "WhatsApp" },
  youtube:   { Icon: SiYoutube,   color: "#FF0000", label: "YouTube" },
};

function expandCloudinaryUrl(val: string): string {
  if (!val || !val.startsWith('c:')) return val;
  return 'https://res.cloudinary.com/' + val.slice(2);
}

function expandOpeningHours(oh: any[]): any[] {
  if (!oh || !oh.length) return [];
  return oh.map((entry: any) => {
    if (entry.day) return entry;
    return {
      day: entry.d,
      enabled: true,
      slots: (entry.s || []).map((s: any) => ({ from: s.f, to: s.t })),
    };
  });
}

function expandSocialLinks(sl: any[]): any[] {
  if (!sl || !sl.length) return [];
  return sl.map((entry: any) => {
    if (entry.platform) return entry;
    return { platform: entry.p, url: entry.u };
  });
}

export default function BusinessPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      const hash = window.location.hash.slice(1);
      if (!hash) { setError(true); return; }
      const decompressed = lzDecompress(hash);
      if (!decompressed) { setError(true); return; }
      const parsed = JSON.parse(decompressed);
      parsed.photoUrl = expandCloudinaryUrl(parsed.photoUrl || '');
      parsed.openingHours = expandOpeningHours(parsed.openingHours || []);
      parsed.socialLinks = expandSocialLinks(parsed.socialLinks || []);
      setData(parsed);
    } catch {
      setError(true);
    }
  }, []);

  if (error || (!data && window.location.hash.length <= 1)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 text-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Página não encontrada</h1>
          <p className="text-slate-400">O link acessado parece ser inválido ou expirado.</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <div className="w-full max-w-md mx-auto flex flex-col min-h-screen">

        {/* Dark gradient hero header */}
        <div className="relative px-6 pt-14 pb-20 flex flex-col items-center text-center flex-shrink-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900" />

          {/* Logo */}
          <div className="w-24 h-24 rounded-2xl bg-white flex items-center justify-center mb-5 shadow-2xl relative z-10 overflow-hidden border border-white/10">
            {data.photoUrl ? (
              <img src={data.photoUrl} className="w-full h-full object-cover" alt="Logo" />
            ) : (
              <Briefcase className="w-12 h-12 text-slate-300" />
            )}
          </div>

          <h1 className="text-white text-2xl font-bold relative z-10 leading-tight">{data.companyName || "Nome da Empresa"}</h1>
          {data.industry && (
            <span className="mt-3 inline-block bg-white/10 text-white/80 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full relative z-10">
              {data.industry}
            </span>
          )}
        </div>

        {/* White content card */}
        <div className="bg-white rounded-t-[32px] -mt-10 relative z-10 px-6 pt-6 pb-8 space-y-6 flex-1 shadow-2xl">

          {/* Caption */}
          {data.caption && (
            <div className="border-l-4 border-primary pl-4 py-1">
              <p className="text-sm text-slate-500 italic leading-relaxed">"{data.caption}"</p>
            </div>
          )}

          {/* Quick action pills */}
          {(data.phone || data.email || data.website) && (
            <div className="flex gap-2 flex-wrap">
              {data.phone && (
                <a
                  href={`tel:${data.phone}`}
                  className="flex items-center gap-1.5 bg-green-50 text-green-700 rounded-full px-4 py-2 text-sm font-bold hover:bg-green-100 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Ligar</span>
                </a>
              )}
              {(data.whatsappNumber || data.phone) && (
                <a
                  href={`https://wa.me/${(data.whatsappNumber || data.phone).replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-green-500 text-white rounded-full px-4 py-2 text-sm font-bold hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              )}
              {data.email && (
                <a
                  href={`mailto:${data.email}`}
                  className="flex items-center gap-1.5 bg-blue-50 text-blue-700 rounded-full px-4 py-2 text-sm font-bold hover:bg-blue-100 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </a>
              )}
              {data.website && (
                <a
                  href={data.website.startsWith('http') ? data.website : `https://${data.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-slate-100 text-slate-700 rounded-full px-4 py-2 text-sm font-bold hover:bg-slate-200 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Site</span>
                </a>
              )}
            </div>
          )}

          {/* Contact rows */}
          <div className="space-y-3">
            {data.phone && (
              <a href={`tel:${data.phone}`} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 active:bg-slate-200 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wide">Telefone</p>
                  <p className="text-base font-semibold text-slate-800 truncate">{data.phone}</p>
                </div>
              </a>
            )}
            {data.email && (
              <a href={`mailto:${data.email}`} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 active:bg-slate-200 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wide">Email</p>
                  <p className="text-base font-semibold text-slate-800 truncate">{data.email}</p>
                </div>
              </a>
            )}
            {data.website && (
              <a
                href={data.website.startsWith('http') ? data.website : `https://${data.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 active:bg-slate-200 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-violet-600" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wide">Website</p>
                  <p className="text-base font-semibold text-slate-800 truncate">{data.website}</p>
                </div>
              </a>
            )}
            {data.location && (
              <a
                href={data.mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(data.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 active:bg-slate-200 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wide">Endereço</p>
                  <p className="text-base font-semibold text-slate-800 leading-snug">{data.location}</p>
                  {data.mapsUrl && (
                    <p className="text-xs text-violet-600 mt-0.5 font-medium">Ver no Google Maps →</p>
                  )}
                </div>
              </a>
            )}
          </div>

          {/* Opening hours */}
          {data.openingHours && data.openingHours.some((d: any) => d.enabled) && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wide">Horário de Funcionamento</p>
              </div>
              <div className="bg-slate-50 rounded-2xl overflow-hidden divide-y divide-slate-100">
                {data.openingHours.filter((d: any) => d.enabled).map((dayEntry: any) => (
                  <div key={dayEntry.day} className="flex items-start gap-4 px-4 py-3">
                    <span className="w-28 text-sm font-semibold text-slate-800 flex-shrink-0 pt-0.5">{dayEntry.day}</span>
                    <div className="flex-1 space-y-1">
                      {(dayEntry.slots || []).filter((s: any) => s.from || s.to).map((slot: any, i: number) => (
                        <p key={i} className="text-sm text-slate-600">
                          {slot.from || "--:--"} – {slot.to || "--:--"}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social links */}
          {data.socialLinks && data.socialLinks.length > 0 && (
            <div className="space-y-3">
              <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wide">Redes Sociais</p>
              <div className="flex flex-wrap gap-3">
                {data.socialLinks.map((sl: any, i: number) => {
                  const info = SOCIAL_MAP[sl.platform] || { Icon: Globe, color: "#6b7280", label: sl.platform };
                  const { Icon, color, label } = info;
                  return (
                    <a
                      key={i}
                      href={sl.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white text-sm font-semibold shadow-sm active:opacity-80 transition-opacity"
                      style={{ backgroundColor: color }}
                    >
                      <Icon size={18} />
                      <span>{label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 text-center">
            <a href="https://angoqurcode.ao" target="_blank" rel="noopener noreferrer" className="text-[10px] text-slate-300 uppercase tracking-widest font-bold" style={{cursor:"pointer"}}>Gerado por AngoQrCode</a>
          </div>
        </div>
      </div>
    </div>
  );
}

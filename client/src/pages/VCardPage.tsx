import { useEffect, useState } from "react";
import { User, Globe, MapPin, Briefcase, Phone, Mail, MessageCircle, Download } from "lucide-react";
import { SiInstagram, SiTiktok, SiFacebook, SiWhatsapp, SiYoutube } from "react-icons/si";

const SOCIAL_MAP: Record<string, { Icon: any; color: string; label: string }> = {
  instagram: { Icon: SiInstagram, color: "#E1306C", label: "Instagram" },
  tiktok:    { Icon: SiTiktok,    color: "#000000", label: "TikTok" },
  facebook:  { Icon: SiFacebook,  color: "#1877F2", label: "Facebook" },
  whatsapp:  { Icon: SiWhatsapp,  color: "#25D366", label: "WhatsApp" },
  youtube:   { Icon: SiYoutube,   color: "#FF0000", label: "YouTube" },
};

interface VCardData {
  type: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  whatsappNumber?: string;
  email?: string;
  website?: string;
  location?: string;
  companyName?: string;
  organization?: string;
  profession?: string;
  jobTitle?: string;
  summary?: string;
  photoUrl?: string;
  socialLinks?: { platform: string; url: string }[];
}

function generateVCardBlob(data: VCardData): Blob {
  const lines = ["BEGIN:VCARD", "VERSION:3.0"];
  const firstName = data.firstName || "";
  const lastName = data.lastName || "";
  lines.push(`N:${lastName};${firstName};;;`);
  lines.push(`FN:${[firstName, lastName].filter(Boolean).join(" ")}`);
  if (data.companyName || data.organization) lines.push(`ORG:${data.companyName || data.organization}`);
  if (data.profession || data.jobTitle) lines.push(`TITLE:${data.profession || data.jobTitle}`);
  if (data.phone) lines.push(`TEL;TYPE=CELL:${data.phone}`);
  if (data.whatsappNumber && data.whatsappNumber !== data.phone) lines.push(`TEL;TYPE=WORK:${data.whatsappNumber}`);
  if (data.email) lines.push(`EMAIL:${data.email}`);
  if (data.website) lines.push(`URL:${data.website.startsWith("http") ? data.website : "https://" + data.website}`);
  if (data.location) lines.push(`ADR:;;${data.location};;;;`);
  if (data.summary) lines.push(`NOTE:${data.summary}`);
  lines.push("END:VCARD");
  return new Blob([lines.join("\r\n")], { type: "text/vcard" });
}

export default function VCardPage() {
  const [data, setData] = useState<VCardData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      const hash = window.location.hash.slice(1);
      if (!hash) { setError(true); return; }
      const decoded = JSON.parse(decodeURIComponent(escape(atob(hash))));
      setData(decoded);
    } catch {
      setError(true);
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <p className="text-slate-400">Cartão não encontrado.</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const fullName = [data.firstName, data.lastName].filter(Boolean).join(" ") || "Sem Nome";
  const company = data.companyName || data.organization || "";
  const role = data.profession || data.jobTitle || "";
  const phone = data.phone || "";
  const whatsapp = data.whatsappNumber || data.phone || "";

  const handleSaveContact = () => {
    const blob = generateVCardBlob(data);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fullName.replace(/\s+/g, "_")}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center">
      <div className="w-full max-w-md min-h-screen flex flex-col">

        {/* Dark gradient hero */}
        <div className="relative px-5 pt-14 pb-20 flex flex-col items-center text-center flex-shrink-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900" />

          <div className="w-24 h-24 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center mb-4 shadow-2xl relative z-10 overflow-hidden">
            {data.photoUrl ? (
              <img src={data.photoUrl} className="w-full h-full object-cover" alt="Foto de Perfil" />
            ) : (
              <User className="w-11 h-11 text-slate-300" />
            )}
          </div>

          <h1 className="text-white text-2xl font-bold relative z-10 leading-tight">{fullName}</h1>
          {role && (
            <p className="text-slate-400 text-sm mt-1 relative z-10">{role}</p>
          )}
          {company && (
            <span className="mt-3 inline-flex items-center gap-1.5 bg-white/10 text-white/70 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full relative z-10">
              <Briefcase className="w-3 h-3" />
              {company}
            </span>
          )}
        </div>

        {/* White card */}
        <div className="bg-white rounded-t-[32px] -mt-10 relative z-10 px-6 pt-6 pb-8 space-y-5 shadow-2xl flex-1">

          {/* Quick action pills */}
          {(phone || data.email) && (
            <div className="flex gap-2 flex-wrap">
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="flex items-center gap-1.5 bg-green-50 text-green-700 rounded-full px-4 py-2 text-[12px] font-bold hover:bg-green-100 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Ligar</span>
                </a>
              )}
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-green-500 text-white rounded-full px-4 py-2 text-[12px] font-bold hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              )}
              {data.email && (
                <a
                  href={`mailto:${data.email}`}
                  className="flex items-center gap-1.5 bg-blue-50 text-blue-700 rounded-full px-4 py-2 text-[12px] font-bold hover:bg-blue-100 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </a>
              )}
            </div>
          )}

          {/* Contact rows */}
          <div className="space-y-3">
            {phone && (
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 active:bg-slate-200 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Telemóvel</p>
                  <p className="text-sm font-semibold text-slate-900 truncate">{phone}</p>
                </div>
              </a>
            )}

            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-green-50 rounded-2xl hover:bg-green-100 active:bg-green-200 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-green-600">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[10px] text-green-700 uppercase font-bold tracking-wider">WhatsApp</p>
                  <p className="text-sm font-semibold text-green-800 truncate">{whatsapp}</p>
                </div>
              </a>
            )}

            {data.email && (
              <a
                href={`mailto:${data.email}`}
                className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 active:bg-slate-200 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Email</p>
                  <p className="text-sm font-semibold text-slate-900 truncate">{data.email}</p>
                </div>
              </a>
            )}

            {data.website && (
              <a
                href={data.website.startsWith("http") ? data.website : `https://${data.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 active:bg-slate-200 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-violet-600" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Website</p>
                  <p className="text-sm font-semibold text-slate-900 truncate">{data.website}</p>
                </div>
              </a>
            )}

            {data.location && (
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(data.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 active:bg-slate-200 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Localização</p>
                  <p className="text-sm font-semibold text-slate-900">{data.location}</p>
                </div>
              </a>
            )}
          </div>

          {/* Summary */}
          {data.summary && (
            <div className="bg-slate-50 rounded-2xl p-4">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2">Sobre</p>
              <p className="text-sm text-slate-600 leading-relaxed">{data.summary}</p>
            </div>
          )}

          {/* Social links */}
          {(data.socialLinks || []).length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Redes Sociais</p>
              <div className="flex flex-wrap gap-3">
                {(data.socialLinks || []).map((sl, i) => {
                  const info = SOCIAL_MAP[sl.platform] || { Icon: Globe, color: "#6b7280", label: sl.platform };
                  const { Icon, color, label } = info;
                  return (
                    <a
                      key={i}
                      href={sl.url.startsWith("http") ? sl.url : `https://${sl.url}`}
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

          {/* Save contact button */}
          <button
            onClick={handleSaveContact}
            className="w-full min-h-14 rounded-2xl bg-[#2ECC71] hover:bg-[#27ae60] active:scale-[0.98] text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-lg shadow-green-500/20 transition-all"
          >
            <Download className="w-5 h-5" />
            Salvar Contacto
          </button>

          <div className="pt-2 text-center">
            <a href="https://angoqurcode.ao" target="_blank" rel="noopener noreferrer" className="text-[10px] text-slate-400 uppercase tracking-widest font-bold" style={{cursor:"pointer"}}>Gerado por AngoQrCode</a>
          </div>
        </div>
      </div>
    </div>
  );
}

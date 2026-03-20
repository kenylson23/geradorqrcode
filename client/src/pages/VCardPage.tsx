import { useEffect, useState } from "react";
import { User, Smartphone, Mail, Globe, MapPin, Briefcase, FileText } from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-muted-foreground">Cartão não encontrado.</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const fullName = [data.firstName, data.lastName].filter(Boolean).join(" ") || "Sem Nome";
  const company = data.companyName || data.organization || "";
  const role = data.profession || data.jobTitle || "";
  const phone = data.phone || "";
  const whatsapp = data.whatsappNumber || data.phone || "";

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-primary pt-14 pb-20 px-6 text-white flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center mb-4 border-4 border-white shadow-xl relative z-10 overflow-hidden">
            {data.photoUrl ? (
              <img src={data.photoUrl} className="w-full h-full object-cover" alt="Foto de Perfil" />
            ) : (
              <User className="w-14 h-14 text-primary/30" />
            )}
          </div>
          <h1 className="text-2xl font-bold relative z-10">{fullName}</h1>
          {role && <p className="text-sm opacity-90 relative z-10 mt-0.5">{role}</p>}
          {company && <p className="text-xs opacity-75 relative z-10 mt-0.5">{company}</p>}
        </div>

        <div className="bg-white -mt-12 rounded-t-[32px] px-6 pt-8 pb-6 space-y-3 relative z-10">
          {data.summary && (
            <p className="text-sm text-slate-500 text-center italic leading-relaxed mb-4">{data.summary}</p>
          )}

          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 active:bg-slate-200 transition-colors"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Ligar</p>
                <p className="text-sm font-semibold text-slate-900 truncate">{phone}</p>
              </div>
            </a>
          )}

          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
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
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Email</p>
                <p className="text-sm font-semibold text-slate-900 truncate">{data.email}</p>
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
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Site</p>
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
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Localização</p>
                <p className="text-sm font-semibold text-slate-900">{data.location}</p>
              </div>
            </a>
          )}

          {company && (
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Empresa</p>
                <p className="text-sm font-semibold text-slate-900 truncate">{company}</p>
              </div>
            </div>
          )}

          {(data.socialLinks || []).length > 0 && (
            <div className="pt-2 space-y-2">
              {(data.socialLinks || []).map((s, i) => (
                <a
                  key={i}
                  href={s.url.startsWith('http') ? s.url : `https://${s.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 active:bg-slate-200 transition-colors"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{s.platform}</p>
                    <p className="text-sm font-semibold text-slate-900 truncate">{s.url}</p>
                  </div>
                </a>
              ))}
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Gerado por AngoQrCode</p>
          </div>
        </div>
      </div>
    </div>
  );
}

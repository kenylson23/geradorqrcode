import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, Globe, MapPin, Clock, Smartphone, Loader2 } from "lucide-react";
import { SiInstagram, SiTiktok, SiFacebook, SiWhatsapp, SiYoutube } from "react-icons/si";

const SOCIAL_MAP: Record<string, { Icon: any; color: string; label: string }> = {
  instagram: { Icon: SiInstagram, color: "#E1306C", label: "Instagram" },
  tiktok:    { Icon: SiTiktok,    color: "#000000", label: "TikTok" },
  facebook:  { Icon: SiFacebook,  color: "#1877F2", label: "Facebook" },
  whatsapp:  { Icon: SiWhatsapp,  color: "#25D366", label: "WhatsApp" },
  youtube:   { Icon: SiYoutube,   color: "#FF0000", label: "YouTube" },
};

export default function BusinessPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data: pageData, isLoading, isError } = useQuery({
    queryKey: ["/api/pages", slug],
    queryFn: async () => {
      const res = await fetch(`/api/pages/${slug}`);
      if (!res.ok) throw new Error("Page not found");
      const json = await res.json();
      return json.data;
    },
    enabled: !!slug,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 text-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Página não encontrada</h1>
          <p className="text-slate-500">O link acessado parece ser inválido ou expirado.</p>
        </div>
      </div>
    );
  }

  const data = pageData;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col shadow-xl">
        <div className="bg-primary pt-12 pb-20 px-6 text-white flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-4 border-4 border-white shadow-xl relative z-10 overflow-hidden">
            {data.photoUrl ? (
              <img src={data.photoUrl} className="w-full h-full object-cover" alt="Logo" />
            ) : (
              <Briefcase className="w-12 h-12 text-primary/20" />
            )}
          </div>
          <h1 className="text-2xl font-bold relative z-10">{data.companyName || "Nome da Empresa"}</h1>
          <p className="text-sm opacity-90 relative z-10">{data.industry || "Ramo de Atividade"}</p>
        </div>

        <div className="flex-1 bg-white -mt-12 rounded-t-[32px] p-8 space-y-8 relative z-20">
          {data.caption && (
            <p className="text-base text-slate-600 text-center italic leading-relaxed">{data.caption}</p>
          )}

          <div className="space-y-4">
            {data.phone && (
              <a href={`tel:${data.phone}`} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Ligar</p>
                  <p className="text-base font-semibold text-slate-900 truncate">{data.phone}</p>
                </div>
              </a>
            )}
            {(data.whatsappNumber || data.phone) && (
              <a
                href={`https://wa.me/${(data.whatsappNumber || data.phone).replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-green-50 rounded-2xl hover:bg-green-100 active:bg-green-200 transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-green-600">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[11px] text-green-700 uppercase font-bold tracking-wider">WhatsApp</p>
                  <p className="text-base font-semibold text-green-800 truncate">{data.whatsappNumber || data.phone}</p>
                </div>
              </a>
            )}
            {data.email && (
              <a href={`mailto:${data.email}`} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <Globe className="w-6 h-6" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Email</p>
                  <p className="text-base font-semibold text-slate-900 truncate">{data.email}</p>
                </div>
              </a>
            )}
            {data.website && (
              <a
                href={data.website.startsWith('http') ? data.website : `https://${data.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <Globe className="w-6 h-6" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Site</p>
                  <p className="text-base font-semibold text-slate-900 truncate">{data.website}</p>
                </div>
              </a>
            )}
            {data.location && (
              <a
                href={data.mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(data.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Endereço</p>
                  <p className="text-base font-semibold text-slate-900">{data.location}</p>
                  {data.mapsUrl && (
                    <p className="text-[11px] text-primary mt-0.5">Ver no Google Maps →</p>
                  )}
                </div>
              </a>
            )}
          </div>

          {data.openingHours && data.openingHours.some((d: any) => d.enabled) && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-slate-400" />
                <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Horário de Funcionamento</p>
              </div>
              <div className="bg-slate-50 rounded-2xl overflow-hidden divide-y divide-slate-100">
                {data.openingHours.filter((d: any) => d.enabled).map((dayEntry: any) => (
                  <div key={dayEntry.day} className="flex items-center gap-3 px-4 py-3">
                    <span className="w-28 text-sm font-semibold text-slate-800 flex-shrink-0">{dayEntry.day}</span>
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

          {data.socialLinks && data.socialLinks.length > 0 && (
            <div className="space-y-3">
              <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Redes Sociais</p>
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

          <div className="pt-6 border-t border-slate-100 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Gerado por AngoQrCode</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { LinkTree } from "@/components/LinkTree";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { User, Smartphone, Globe, Briefcase, MapPin, FileText, Download, ExternalLink, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LinkTreePage() {
  const [location] = useLocation();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    try {
      // The data is encoded in the hash as base64
      const hash = window.location.hash.slice(1);
      if (hash) {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(hash))));
        setData(decoded);
      }
    } catch (e) {
      console.error("Failed to parse page data", e);
    }
  }, [location]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 text-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Página não encontrada</h1>
          <p className="text-slate-500">O link acessado parece ser inválido ou expirado.</p>
        </div>
      </div>
    );
  }

  if (data.type === 'pdf') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center">
        <div className="w-full max-w-md min-h-screen flex flex-col">
          {/* Header */}
          <div className="pt-14 pb-8 px-6 text-center">
            {data.companyName && (
              <p className="text-slate-400 text-xs uppercase tracking-[0.2em] font-bold mb-2">{data.companyName}</p>
            )}
            <h1 className="text-white text-2xl font-bold leading-tight">{data.title || "Documento PDF"}</h1>
          </div>

          {/* Document preview card */}
          <div className="mx-5 mb-5 bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* PDF bar */}
            <div className="bg-red-500 px-5 py-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm uppercase tracking-wider">PDF</p>
                <p className="text-red-100 text-[11px]">Documento</p>
              </div>
              <div className="ml-auto flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
              </div>
            </div>

            {/* Simulated page content */}
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="h-3 bg-slate-800 rounded-full w-2/3" />
                <div className="h-2 bg-slate-200 rounded-full w-full" />
                <div className="h-2 bg-slate-200 rounded-full w-11/12" />
                <div className="h-2 bg-slate-200 rounded-full w-4/5" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-16 bg-slate-100 rounded-xl" />
                <div className="h-16 bg-slate-100 rounded-xl" />
              </div>
              <div className="space-y-2">
                <div className="h-2 bg-slate-100 rounded-full w-full" />
                <div className="h-2 bg-slate-100 rounded-full w-11/12" />
                <div className="h-2 bg-slate-100 rounded-full w-4/6" />
                <div className="h-2 bg-slate-100 rounded-full w-full" />
                <div className="h-2 bg-slate-100 rounded-full w-3/4" />
              </div>
            </div>
          </div>

          {/* Info + CTA card */}
          <div className="mx-5 mb-5 bg-slate-800 rounded-3xl p-5 space-y-4">
            {data.description && (
              <p className="text-slate-300 text-sm leading-relaxed">{data.description}</p>
            )}

            {data.website && (
              <a
                href={data.website.startsWith('http') ? data.website : `https://${data.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-slate-700/60 hover:bg-slate-700 rounded-2xl px-4 py-3 transition-colors"
              >
                <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-300 text-sm truncate">{data.website}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 ml-auto flex-shrink-0" />
              </a>
            )}

            <a
              href={data.fileUrl || data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-14 rounded-2xl bg-red-500 hover:bg-red-600 active:scale-[0.98] text-white font-bold flex items-center justify-center gap-2.5 text-base transition-all shadow-lg shadow-red-500/30 px-4 py-3 text-center leading-snug"
            >
              <Download className="w-5 h-5 flex-shrink-0" />
              <span>{data.buttonLabel || "Abrir PDF"}</span>
            </a>
          </div>

          <div className="mt-auto pb-8 text-center">
            <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">Gerado por AngoQrCode</p>
          </div>
        </div>
      </div>
    );
  }

  if (data.type === 'images') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center">
        <div className="w-full max-w-md bg-white min-h-screen flex flex-col shadow-xl overflow-hidden">
          {data.url && (
            <div className="w-full aspect-square relative bg-slate-100">
              <img src={data.url} className="w-full h-full object-cover" alt={data.title} />
            </div>
          )}
          
          <div className="flex-1 p-8 space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900">{data.title || "Imagem"}</h1>
              {data.description && (
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{data.description}</p>
              )}
            </div>

            {(data.buttonLabel || data.website) && (
              <div className="pt-4">
                <Button 
                  asChild
                  className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg transition-all"
                >
                  <a 
                    href={data.website ? (data.website.startsWith('http') ? data.website : `https://${data.website}`) : "#"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {data.buttonLabel || "Ver mais"}
                  </a>
                </Button>
              </div>
            )}
            
            <div className="pt-8 mt-auto border-t border-slate-100 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Gerado por AngoQrCode</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (data.type === 'business') {
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

            <div className="pt-6 border-t border-slate-100 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Gerado por AngoQrCode</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 flex flex-col items-center justify-center">
      <LinkTree 
        title={data.title} 
        description={data.description}
        photoUrl={data.photoUrl}
        links={data.links} 
      />
    </div>
  );
}

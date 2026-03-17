import { LinkTree } from "@/components/LinkTree";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { User, Smartphone, Globe, Briefcase, MapPin, FileText } from "lucide-react";
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
        console.log("LinkTreePage decoded data:", decoded);
        console.log("Photo URL:", decoded.photoUrl);
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
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="bg-[#2ECC71] pt-12 pb-20 px-6 text-white flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 border-2 border-white/30 relative z-10">
            <FileText className="w-12 h-12" />
          </div>
          <h3 className="text-2xl font-bold relative z-10">{data.title || "Documento PDF"}</h3>
          <p className="text-lg opacity-90 relative z-10">{data.companyName || "Visualizador de PDF"}</p>
        </div>

        <div className="flex-1 bg-white -mt-12 rounded-t-[48px] p-6 max-w-2xl mx-auto w-full space-y-6 shadow-2xl relative z-20 overflow-y-auto">
          {data.description && (
            <div className="p-5 bg-slate-50 rounded-2xl">
              <p className="text-xs text-muted-foreground uppercase font-bold mb-2">Descrição</p>
              <p className="text-base text-slate-600 leading-relaxed break-words">{data.description}</p>
            </div>
          )}

          {data.website && (
            <a 
              href={data.website.startsWith('http') ? data.website : `https://${data.website}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <Globe className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase font-bold">Site</p>
                <p className="text-sm font-semibold text-primary truncate hover:underline">{data.website}</p>
              </div>
            </a>
          )}

          <div className="pt-8 text-center">
            <a
              href={data.fileUrl || data.url}
              download={(data.title || 'documento').toLowerCase().replace(/\s+/g, '-') + '.pdf'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-16 rounded-3xl bg-[#2ECC71] hover:bg-[#27ae60] text-white font-bold flex items-center justify-center text-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98] no-underline"
            >
              {data.buttonLabel || "Download PDF"}
            </a>
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
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Telefone</p>
                    <a href={`tel:${data.phone}`} className="text-base font-semibold text-slate-900 block">{data.phone}</a>
                  </div>
                </div>
              )}
              {data.email && (
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Email</p>
                    <a href={`mailto:${data.email}`} className="text-base font-semibold text-slate-900 block truncate">{data.email}</a>
                  </div>
                </div>
              )}
              {data.website && (
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Site</p>
                    <a href={data.website.startsWith('http') ? data.website : `https://${data.website}`} target="_blank" rel="noopener noreferrer" className="text-base font-semibold text-slate-900 block truncate">{data.website}</a>
                  </div>
                </div>
              )}
              {data.location && (
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Endereço</p>
                    <p className="text-base font-semibold text-slate-900">{data.location}</p>
                  </div>
                </div>
              )}
            </div>
            
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

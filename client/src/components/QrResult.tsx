import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Globe, MessageCircle, FileText, User, Instagram, Facebook, Smartphone, Search, MoreHorizontal, Briefcase, Image as ImageIcon, Video } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LinkTree } from "./LinkTree";
import { useState } from "react";

interface QrResultProps {
  value: any;
}

export function QrResult({ value }: QrResultProps) {
  const [showQr, setShowQr] = useState(false);
  
  // If value is an object with type 'links', we show LinkTree preview
  const isLinkTree = typeof value === 'object' && value?.type === 'links';
  
  // Extract the raw URL for the preview (before any processing like mailto: or tel:)
  // This ensures we show exactly what the user typed in the browser simulation
  const previewUrl = typeof value === 'object' ? (value.url || value.fileUrl || (value.type === 'instagram' && value.instagramUser ? `instagram.com/${value.instagramUser.startsWith('@') ? value.instagramUser.slice(1) : value.instagramUser}` : "")) : value;
  
  const generateQrValue = (data: any) => {
    if (!data) return "";
    
    // Check if data is already a URL string (from LinkTree/Images preview)
    if (typeof data === 'string' && (data.startsWith('http') || data.includes('/i/') || data.includes('/l#'))) {
      return data;
    }

    if (typeof data === 'string') return data;
    
    // Check if we have minimum data for the specific type
    const hasData = data.type === 'url' || data.type === 'facebook' || data.type === 'instagram' || data.type === 'images'
      ? (data.url && data.url.length > 0) || (data.type === 'instagram' && data.instagramUser && data.instagramUser.length > 0) || (data.type === 'images')
      : (data.type === 'whatsapp' ? !!data.phone : (data.type === 'links' ? !!data.title || (data.links && data.links.length > 0 && (data.links[0].url || data.links[0].label)) : (data.type === 'images' ? (!!data.fileUrl || !!data.title || !!data.description || !!data.website || !!data.buttonLabel) : true)));

    if (!hasData) return "";

    switch (data.type) {
      case "url":
      case "facebook":
      case "instagram":
        return data.url ? (data.url.startsWith('http') ? data.url : `https://${data.url}`) : "";
      case "pdf":
        const pdfData = {
          type: "pdf",
          title: data.title,
          companyName: data.companyName,
          description: data.description,
          website: data.website,
          buttonLabel: data.buttonLabel,
          fileUrl: data.fileUrl || data.url
        };
        const encodedPdfData = btoa(unescape(encodeURIComponent(JSON.stringify(pdfData))));
        return `${window.location.origin}/l#${encodedPdfData}`;
      case "text":
        return data.text || "";
      case "whatsapp":
        const phone = (data.phone || "").replace(/\D/g, "");
        const message = data.message ? `?text=${encodeURIComponent(data.message)}` : "";
        return phone ? `https://wa.me/${phone}${message}` : "";
      case "email":
        const subject = data.subject ? `&subject=${encodeURIComponent(data.subject)}` : "";
        const body = data.body ? `&body=${encodeURIComponent(data.body)}` : "";
        return data.email ? `mailto:${data.email}?${subject.slice(1)}${body}` : "";
      case "phone":
        return data.phone ? `tel:${data.phone}` : "";
      case "links":
      case "business":
        const pageType = data.type;
        const pageData = pageType === 'business' ? {
          type: 'business',
          companyName: data.companyName,
          industry: data.industry,
          phone: data.phone,
          email: data.email,
          website: data.website,
          location: data.location,
          caption: data.caption,
          photoUrl: data.photoUrl
        } : {
          type: 'links',
          title: data.title,
          description: data.description,
          links: (data.links || []).filter((l: any) => l.label && l.url).map((l: any) => ({
            label: l.label,
            url: l.url
          }))
        };
        const encodedData = btoa(unescape(encodeURIComponent(JSON.stringify(pageData))));
        return `${window.location.origin}/l#${encodedData}`;
      case "images":
        const imagesData = {
          type: "images",
          title: data.title,
          description: data.description,
          website: data.website,
          buttonLabel: data.buttonLabel,
          fileUrl: data.fileUrl
        };
        const encodedImagesData = encodeURIComponent(JSON.stringify(imagesData));
        return `${window.location.origin}/i/${encodedImagesData}`;
      case "vcard":
        const photo = data.photoUrl ? `\nPHOTO;VALUE=URI:${window.location.origin}${data.photoUrl}` : "";
        const website = data.website ? `\nURL:${data.website}` : "";
        const location = data.location ? `\nADR:;;${data.location};;;;` : "";
        const org = data.companyName ? `\nORG:${data.companyName}` : (data.organization ? `\nORG:${data.organization}` : "");
        const title = data.profession ? `\nTITLE:${data.profession}` : (data.jobTitle ? `\nTITLE:${data.jobTitle}` : "");
        const summary = data.summary ? `\nNOTE:${data.summary}` : "";
        const social = (data.socialLinks || []).map((s: any) => `\nX-SOCIAL-PROFILE;TYPE=${s.platform}:${s.url}`).join("");
        return `BEGIN:VCARD\nVERSION:3.0\nN:${data.lastName || ""};${data.firstName || ""}\nFN:${data.firstName || ""} ${data.lastName || ""}\nTEL:${data.phone || ""}\nEMAIL:${data.email || ""}${org}${title}${photo}${website}${location}${summary}${social}\nEND:VCARD`;
      default:
        return JSON.stringify(data);
    }
  };

  const qrValue = generateQrValue(value);
  
  // QR Code standard limit is around 4296 characters for alphanumeric
  // Base64 encoded PDFs can easily exceed this.
  const isTooLong = qrValue.length > 2953; // Alphanumeric limit for level M is ~2.9k

  // Determine if it's a "real-time preview" (incomplete data)
  const isUrlType = value?.type === 'url' || value?.type === 'facebook' || value?.type === 'instagram' || value?.type === 'pdf';
  const hasMinData = true; // Always show simulation during filling

  console.log("QrResult Render:", { type: value?.type, hasMinData, value });

  const renderSimulation = () => {
    // If value is a string, it might be an encoded URL from LinkTree or Images
    // We need to decode it to show the simulation, or just skip if it's already a full URL
    let data = value;
    if (typeof value === 'string') {
      try {
        if (value.includes('/i/')) {
          const encoded = value.split('/i/')[1];
          data = JSON.parse(decodeURIComponent(encoded));
          // Log decoded data to debug
          console.log("Decoded Images Data:", data);
        } else if (value.includes('/l#')) {
          const encoded = value.split('/l#')[1];
          data = JSON.parse(decodeURIComponent(escape(atob(encoded))));
        }
      } catch (e) {
        // Not a JSON string we can decode, use as is
      }
    }

    const isLinkTreeData = typeof data === 'object' && data?.type === 'links';

    if (isLinkTreeData && hasMinData) {
      return (
        <div className="w-full h-full bg-white animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto">
          <LinkTree 
            title={data.title} 
            description={data.description} 
            links={data.links || []} 
          />
        </div>
      );
    }

    switch (data?.type) {
      case 'url':
      case 'facebook':
      case 'instagram':
        const url = (typeof value === 'object' ? (value.url || value.fileUrl || (value.type === 'instagram' && value.instagramUser ? `instagram.com/${value.instagramUser.startsWith('@') ? value.instagramUser.slice(1) : value.instagramUser}` : "")) : value) || "";
        const fullUrl = url ? (url.startsWith('http') ? url : `https://${url}`) : "";

        return (
          <div className="w-full h-full bg-white flex flex-col animate-in fade-in duration-500 overflow-hidden">
            {/* Browser Header Area - More like the mockup */}
            <div className="bg-[#2ECC71] pt-12 pb-4 px-4 flex flex-col gap-3">
              <div className="flex items-center justify-between px-2 text-white">
                <span className="text-[12px] font-bold">9:41</span>
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5 items-end h-3">
                    <div className="w-0.5 h-1 bg-white rounded-full"></div>
                    <div className="w-0.5 h-1.5 bg-white rounded-full"></div>
                    <div className="w-0.5 h-2 bg-white rounded-full"></div>
                    <div className="w-0.5 h-2.5 bg-white/40 rounded-full"></div>
                  </div>
                  <div className="w-3.5 h-3.5 flex items-center justify-center">
                    <div className="w-3 h-2 border border-white rounded-sm relative">
                      <div className="absolute inset-0 bg-white m-[1px] w-[80%]"></div>
                      <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-0.5 h-1 bg-white rounded-r-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-md rounded-2xl py-2 px-4 flex items-center gap-3 border border-white/10">
                <Globe className="w-4 h-4 text-white" />
                <span className="text-[13px] text-white font-medium truncate flex-1">{url || "Ex: https://seusite.com"}</span>
              </div>
            </div>
            
            {/* Content Area */}
            <div className="flex-1 bg-white flex flex-col relative overflow-hidden">
              {!fullUrl ? (
                <div className="p-4 space-y-4">
                  <div className="w-full aspect-[4/5] bg-slate-200 rounded-lg flex items-center justify-center">
                    {data.type === 'facebook' ? <Facebook className="w-12 h-12 text-slate-400" /> : 
                      data.type === 'instagram' ? <Instagram className="w-12 h-12 text-slate-400" /> :
                      <Globe className="w-12 h-12 text-slate-400" />}
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-100 rounded-full w-full"></div>
                    <div className="h-4 bg-slate-100 rounded-full w-5/6"></div>
                    <div className="h-4 bg-slate-100 rounded-full w-4/6 mx-auto mt-4"></div>
                  </div>
                  <div className="mt-8 p-4 bg-slate-100 rounded-lg h-16 flex items-center justify-center">
                    <div className="h-4 bg-slate-300 rounded-full w-32"></div>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 bg-white">
                  <iframe 
                    src={fullUrl} 
                    className="w-full h-full border-0"
                    title="Safari Preview"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 'pdf':
        const hasPdfData = data.fileUrl || data.url;
        return (
          <div className="w-full h-full bg-slate-50 flex flex-col animate-in fade-in duration-500 overflow-hidden">
            <div className="bg-[#2ECC71] pt-12 pb-20 px-6 text-white flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10" />
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 border-2 border-white/30 relative z-10">
                <FileText className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold relative z-10">{data.title || "Documento PDF"}</h3>
              <p className="text-xs opacity-90 relative z-10">{data.companyName || "Visualizador de PDF"}</p>
            </div>
            
            <div className="flex-1 bg-white -mt-12 rounded-t-[32px] p-6 space-y-6 shadow-xl relative z-20 overflow-y-auto">
              <div className="space-y-4">
                {data.description && (
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Descrição</p>
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-4">{data.description}</p>
                  </div>
                )}
                
                {data.website && (
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Site</p>
                      <p className="text-sm font-semibold truncate">{data.website}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <a 
                  href={hasPdfData ? (data.fileUrl || data.url) : "#"}
                  download={(data.title || 'documento').toLowerCase().replace(/\s+/g, '-') + '.pdf'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full h-12 rounded-2xl bg-[#2ECC71] hover:bg-[#27ae60] text-white font-bold flex items-center justify-center transition-all ${!hasPdfData ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {data.buttonLabel || "Download PDF"}
                </a>
                {!hasPdfData && (
                  <p className="text-[10px] text-center text-muted-foreground mt-2 italic">Aguardando upload do arquivo...</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'whatsapp':
        return (
          <div className="w-full h-full bg-[#E5DDD5] flex flex-col animate-in fade-in duration-500 overflow-hidden">
            <div className="bg-[#075E54] pt-12 pb-4 px-4 flex items-center gap-3 text-white">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="font-bold text-xs truncate">{data.phone || "WhatsApp"}</p>
                <p className="text-[10px] opacity-80">online</p>
              </div>
              <Video className="w-4 h-4" />
            </div>
            <div className="flex-1 p-4 flex flex-col justify-end gap-2 overflow-y-auto">
              <div className="self-end bg-[#DCF8C6] p-3 rounded-lg rounded-tr-none shadow-sm max-w-[80%]">
                <p className="text-[11px] text-slate-800">{data.message || "Olá! Gostaria de mais informações."}</p>
                <p className="text-[9px] text-slate-500 text-right mt-1">12:01</p>
              </div>
            </div>
            <div className="bg-white p-3 pb-8 flex items-center gap-2">
              <div className="flex-1 bg-slate-100 rounded-full h-8 px-4 flex items-center">
                <span className="text-[10px] text-slate-400">Mensagem</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#128C7E] flex items-center justify-center text-white">
                <MessageCircle className="w-4 h-4" />
              </div>
            </div>
          </div>
        );

      case 'vcard':
        return (
          <div className="w-full h-full bg-slate-50 flex flex-col animate-in fade-in duration-500 overflow-hidden">
            <div className="bg-[#2ECC71] pt-12 pb-20 px-6 text-white flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 border-4 border-white/30">
                <User className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold">{data.firstName} {data.lastName}</h3>
              <p className="text-sm opacity-90">{data.jobTitle || data.profession}</p>
            </div>
            <div className="flex-1 bg-white -mt-12 rounded-t-[32px] p-6 space-y-6 shadow-xl">
              <div className="space-y-4">
                {data.phone && (
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Telemóvel</p>
                      <p className="text-sm font-semibold">{data.phone}</p>
                    </div>
                  </div>
                )}
                {data.email && (
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Email</p>
                      <p className="text-sm font-semibold">{data.email}</p>
                    </div>
                  </div>
                )}
                {data.companyName && (
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Empresa</p>
                      <p className="text-sm font-semibold">{data.companyName}</p>
                    </div>
                  </div>
                )}
                {data.website && (
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Website</p>
                      <p className="text-sm font-semibold">{data.website}</p>
                    </div>
                  </div>
                )}
                {data.summary && (
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Sobre</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{data.summary}</p>
                  </div>
                )}
              </div>
              <Button className="w-full h-12 rounded-2xl bg-[#2ECC71] hover:bg-[#27ae60] font-bold">
                Salvar Contacto
              </Button>
            </div>
          </div>
        );

      case 'business':
        return (
          <div className="w-full h-full bg-slate-50 flex flex-col animate-in fade-in duration-500 overflow-hidden">
            <div className="bg-primary pt-12 pb-20 px-6 text-white flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10" />
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-4 border-4 border-white shadow-xl relative z-10">
                {data.photoUrl ? (
                  <img src={data.photoUrl} className="w-full h-full object-cover rounded-full" alt="Logo" />
                ) : (
                  <Search className="w-12 h-12 text-primary/20" />
                )}
              </div>
              <h3 className="text-xl font-bold relative z-10">{data.companyName || "Nome da Empresa"}</h3>
              <p className="text-sm opacity-90 relative z-10">{data.industry || "Ramo de Atividade"}</p>
            </div>
            
            <div className="flex-1 bg-white -mt-12 rounded-t-[32px] p-6 space-y-6 shadow-xl relative z-20 overflow-y-auto">
              {data.caption && (
                <p className="text-sm text-slate-600 text-center italic">{data.caption}</p>
              )}
              
              <div className="space-y-3">
                {data.phone && (
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Telefone</p>
                      <p className="text-sm font-semibold truncate">{data.phone}</p>
                    </div>
                  </div>
                )}
                {data.email && (
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Email</p>
                      <p className="text-sm font-semibold truncate">{data.email}</p>
                    </div>
                  </div>
                )}
                {data.website && (
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Site</p>
                      <p className="text-sm font-semibold truncate">{data.website}</p>
                    </div>
                  </div>
                )}
                {data.location && (
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Search className="w-5 h-5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Endereço</p>
                      <p className="text-sm font-semibold truncate">{data.location}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button className="rounded-2xl bg-primary font-bold h-12">
                  Contato
                </Button>
                <Button variant="outline" className="rounded-2xl border-2 font-bold h-12">
                  Visitar
                </Button>
              </div>
            </div>
          </div>
        );

      case 'images':
        return (
          <div className="w-full h-full bg-slate-50 flex flex-col animate-in fade-in duration-500 overflow-hidden">
            {/* Status Bar simulation */}
            <div className="absolute top-0 inset-x-0 h-12 flex items-center justify-between px-6 z-30 text-white pointer-events-none">
              <span className="text-[12px] font-bold">9:41</span>
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5 items-end h-3">
                  <div className="w-0.5 h-1 bg-white rounded-full"></div>
                  <div className="w-0.5 h-1.5 bg-white rounded-full"></div>
                  <div className="w-0.5 h-2 bg-white rounded-full"></div>
                  <div className="w-0.5 h-2.5 bg-white/40 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Header / Banner Area */}
            <div className="bg-gradient-to-br from-[#2ECC71] to-[#27ae60] pt-16 pb-20 px-6 text-white flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-xl" />
              
            <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 border-2 border-white/40 relative z-10 shadow-2xl overflow-hidden group">
                {data.fileUrl && (data.fileUrl.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i) || !data.fileUrl.toLowerCase().endsWith('.pdf')) ? (
                  <img src={data.fileUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Preview" />
                ) : (
                  <ImageIcon className="w-12 h-12 text-white/80" />
                )}
              </div>
              <h3 className="text-xl font-extrabold relative z-10 drop-shadow-md tracking-tight uppercase">{data.title || "Galeria de Imagens"}</h3>
              <div className="flex items-center gap-2 mt-1 opacity-90 relative z-10">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <p className="text-[11px] font-medium tracking-wide">{data.companyName || "Portfolio Digital"}</p>
              </div>
            </div>
            
            {/* Content Area */}
            <div className="flex-1 bg-white -mt-10 rounded-t-[40px] p-6 space-y-8 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] relative z-20 overflow-y-auto">
              {data.description && (
                <div className="relative">
                  <div className="absolute -left-2 top-0 bottom-0 w-1 bg-[#2ECC71]/20 rounded-full" />
                  <p className="text-[10px] text-muted-foreground uppercase font-black mb-2 tracking-[0.1em] px-2">Sobre a Galeria</p>
                  <p className="text-sm text-slate-600 leading-relaxed px-2 font-medium">{data.description}</p>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.1em]">Explorar Fotos</p>
                  <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">4 ITENS</span>
                </div>
                
                {/* Main Image Grid Simulation */}
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="group aspect-square bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-md hover:border-[#2ECC71]/30">
                      {i === 1 && data.fileUrl && (data.fileUrl.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i) || !data.fileUrl.toLowerCase().endsWith('.pdf')) ? (
                        <img src={data.fileUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Uploaded" />
                      ) : (
                        <div className="flex flex-col items-center gap-1 opacity-30">
                          <ImageIcon className="w-6 h-6 text-slate-400" />
                          <span className="text-[8px] font-bold text-slate-400">IMG_{i}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {data.website && (
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-3xl border border-slate-100/80 transition-colors hover:bg-slate-100/50">
                  <div className="w-12 h-12 rounded-2xl bg-[#2ECC71]/10 flex items-center justify-center text-[#2ECC71] shadow-inner">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[9px] text-muted-foreground uppercase font-black tracking-wider mb-0.5">Website Oficial</p>
                    <p className="text-[13px] font-bold truncate text-slate-800">{data.website}</p>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-4 pb-8">
                <Button className="w-full h-14 rounded-3xl bg-[#2ECC71] hover:bg-[#27ae60] text-white font-black text-[11px] uppercase tracking-[0.15em] shadow-[0_10px_20px_rgba(46,204,113,0.3)] transition-all active:scale-[0.95] flex items-center justify-center gap-2">
                  <span>{data.buttonLabel || "Ver Galeria Completa"}</span>
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <Search className="w-3 h-3" />
                  </div>
                </Button>
                <p className="text-[9px] text-center text-slate-400 mt-4 font-medium uppercase tracking-tight">Escaneado via QR Code Premium</p>
              </div>
            </div>
          </div>
        );

      default:
        // For simple types like text, email, phone, etc., if we have data, show a default simulation
        if (hasMinData && data?.type) {
          return (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500 bg-white">
              <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-6">
                <Smartphone className="w-10 h-10 text-primary" />
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">Pronto para gerar</h4>
              <p className="text-sm text-slate-500">Seus dados foram inseridos com sucesso. Visualize o Código QR na aba ao lado.</p>
            </div>
          );
        }
        return (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500 bg-white">
            <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-6">
              <Smartphone className="w-10 h-10 text-primary/40" />
            </div>
            <h4 className="text-lg font-bold text-slate-800 mb-2">Simulação iPhone</h4>
            <p className="text-sm text-slate-500">Complete as informações para ver como seu QR Code funcionará no celular.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full h-full overflow-hidden">
      {/* Control Tabs - At the Top */}
      <div className="flex bg-[#F2F2F7] p-1 rounded-full w-full max-w-[280px] border border-slate-200 shadow-sm">
        <button
          onClick={() => setShowQr(false)}
          className={`flex-1 py-2 px-4 rounded-full text-[13px] font-bold transition-all ${!showQr ? 'bg-[#2ECC71] text-white shadow-md' : 'text-slate-600 hover:text-[#2ECC71]'}`}
          data-testid="button-tab-preview"
        >
          Pré-visualização
        </button>
        <button
          onClick={() => setShowQr(true)}
          className={`flex-1 py-2 px-4 rounded-full text-[13px] font-bold transition-all ${showQr ? 'bg-[#2ECC71] text-white shadow-md' : 'text-slate-600 hover:text-[#2ECC71]'}`}
          data-testid="button-tab-qr"
        >
          Código QR
        </button>
      </div>

      <div className="flex-1 w-full relative">
        <div className={`absolute inset-0 flex flex-col transition-all duration-500 ${showQr ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
          {renderSimulation()}
        </div>

        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ${showQr ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
          <div className="pt-12 flex flex-col items-center gap-8 w-full h-full bg-white">
             <div className="flex items-center justify-between px-6 w-full text-slate-900">
                <span className="text-[12px] font-bold">9:41</span>
                <div className="flex items-center gap-1.5">
                   <div className="flex gap-0.5 items-end h-3">
                    <div className="w-0.5 h-1 bg-slate-900 rounded-full"></div>
                    <div className="w-0.5 h-1.5 bg-slate-900 rounded-full"></div>
                    <div className="w-0.5 h-2 bg-slate-900 rounded-full"></div>
                    <div className="w-0.5 h-2.5 bg-slate-900/40 rounded-full"></div>
                  </div>
                </div>
              </div>

              <div id="qr-code-element" className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mt-12">
                {isTooLong ? (
                  <div className="w-48 h-48 flex flex-col items-center justify-center text-destructive bg-destructive/5 rounded-xl border border-destructive/20 p-4">
                    <AlertTriangle className="w-10 h-10 mb-2" />
                    <span className="text-[10px] font-bold text-center uppercase tracking-wider">Dados muito longos</span>
                  </div>
                ) : (
                  <div className={!hasMinData ? "opacity-20 grayscale" : ""}>
                    <QRCodeSVG
                      value={hasMinData ? qrValue : "https://replit.com"}
                      size={200}
                      level="M"
                      includeMargin={true}
                      imageSettings={{
                        src: "/logo.png",
                        x: undefined,
                        y: undefined,
                        height: 40,
                        width: 40,
                        excavate: true,
                      }}
                    />
                  </div>
                )}
              </div>
          </div>
        </div>
      </div>

      {isTooLong && (
        <Alert variant="destructive" className="border-2 mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro: Arquivo muito grande</AlertTitle>
          <AlertDescription className="text-xs">
            O conteúdo deste arquivo excede o limite de um QR Code (máx ~3KB). 
            Tente usar um arquivo menor ou use a opção de "URL" para arquivos na nuvem.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Globe, MessageCircle, FileText, User, Instagram, Facebook, Smartphone, Search, MoreHorizontal, Briefcase, Image as ImageIcon, Video, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LinkTree } from "./LinkTree";
import { useState, useEffect } from "react";

interface QrResultProps {
  value: any;
  showQr?: boolean;
  setShowQr?: (show: boolean) => void;
}

export function QrResult({ value, showQr: propShowQr = false, setShowQr: propSetShowQr }: QrResultProps) {
  const [showQr, setShowQr] = useState(false);
  const [simCurrent, setSimCurrent] = useState(0);
  const effectiveShowQr = propShowQr !== undefined ? propShowQr : showQr;

  const data = typeof value === 'object' ? value : null;
  const simImagesKey = data?.fileUrls?.length ?? 0;
  useEffect(() => { setSimCurrent(0); }, [simImagesKey]);
  const effectiveSetShowQr = propSetShowQr || setShowQr;
  
  // If value is an object with type 'links', we show LinkTree preview
  const isLinkTree = typeof value === 'object' && value?.type === 'links';

  // Handle keyboard scroll with arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        const scrollAmount = 60; // pixels to scroll
        const direction = e.key === 'ArrowUp' ? -1 : 1;
        window.scrollBy(0, direction * scrollAmount);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
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
        return data.url ? (data.url.startsWith('http') ? data.url : `https://${data.url}`) : "";
      case "instagram": {
        const igData = {
          type: "instagram",
          url: data.url,
          title: data.title,
          description: data.description,
          buttonLabel: data.buttonLabel,
          photoUrl: data.photoUrl,
        };
        const encodedIg = encodeURIComponent(JSON.stringify(igData));
        return `${window.location.origin}/ig/${encodedIg}`;
      }
      case "facebook": {
        const fbData = {
          type: "facebook",
          url: data.url,
          title: data.title,
          description: data.description,
          buttonLabel: data.buttonLabel,
          photoUrl: data.photoUrl,
        };
        const encodedFb = encodeURIComponent(JSON.stringify(fbData));
        return `${window.location.origin}/fb/${encodedFb}`;
      }
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
          whatsappNumber: data.whatsappNumber,
          email: data.email,
          website: data.website,
          location: data.location,
          caption: data.caption,
          photoUrl: data.photoUrl
        } : {
          type: 'links',
          title: data.title,
          description: data.description,
          photoUrl: data.photoUrl,
          links: (data.links || []).filter((l: any) => l.label && l.url).map((l: any) => ({
            label: l.label,
            url: l.url,
            imageUrl: l.imageUrl
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
          fileUrl: data.fileUrl,
          fileUrls: data.fileUrls && data.fileUrls.length > 0 ? data.fileUrls : (data.fileUrl ? [data.fileUrl] : [])
        };
        const encodedImagesData = encodeURIComponent(JSON.stringify(imagesData));
        return `${window.location.origin}/i/${encodedImagesData}`;
      case "vcard":
        const vcardData = {
          type: 'vcard',
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          whatsappNumber: data.whatsappNumber,
          email: data.email,
          website: data.website,
          location: data.location,
          companyName: data.companyName || data.organization,
          profession: data.profession || data.jobTitle,
          summary: data.summary,
          photoUrl: data.photoUrl,
          socialLinks: data.socialLinks,
        };
        const encodedVcard = btoa(unescape(encodeURIComponent(JSON.stringify(vcardData))));
        return `${window.location.origin}/c#${encodedVcard}`;
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
        <div className="w-full h-full bg-white animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
          <LinkTree 
            title={data.title} 
            description={data.description} 
            photoUrl={data.photoUrl}
            links={data.links || []} 
          />
        </div>
      );
    }

    switch (data?.type) {
      case 'url':
        const urlValue = (typeof value === 'object' ? (value.url || value.fileUrl || "") : value) || "";
        const urlFullUrl = urlValue ? (urlValue.startsWith('http') ? urlValue : `https://${urlValue}`) : "";
        
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
                <span className="text-[13px] text-white font-medium truncate flex-1">{urlValue || "Ex: https://seusite.com"}</span>
              </div>
            </div>
            
            {/* Content Area */}
            <div className="flex-1 bg-white flex flex-col relative overflow-hidden">
              {!urlFullUrl ? (
                <div className="p-4 space-y-4">
                  <div className="w-full aspect-[4/5] bg-slate-200 rounded-lg flex items-center justify-center">
                    <Globe className="w-12 h-12 text-slate-400" />
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
                    src={urlFullUrl} 
                    className="w-full h-full border-0"
                    title="Safari Preview"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 'facebook': {
        const fbSimUrl = (typeof value === 'object' ? (value.url || "") : value) || "";
        return (
          <div className="w-full h-full bg-[#1877F2] flex flex-col animate-in fade-in duration-500 overflow-auto">
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              <div className="w-full bg-white rounded-3xl overflow-hidden shadow-xl">
                {/* Header */}
                <div className="bg-[#1877F2] px-6 pt-8 pb-12 flex flex-col items-center text-center relative">
                  <div className="absolute bottom-0 left-0 right-0 h-6 bg-white rounded-t-3xl" />
                  <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-[#1877F2]/30 flex items-center justify-center mb-3">
                    {data.photoUrl ? (
                      <img src={data.photoUrl} alt={data.title || "Foto"} className="w-full h-full object-cover" />
                    ) : (
                      <Facebook className="w-10 h-10 text-white" />
                    )}
                  </div>
                  <h3 className="text-white text-base font-bold leading-tight">{data.title || "Minha Página"}</h3>
                </div>

                {/* Content */}
                <div className="px-5 pt-2 pb-6 space-y-3">
                  {data.description && (
                    <p className="text-slate-500 text-[11px] text-center leading-relaxed">{data.description}</p>
                  )}

                  {fbSimUrl && (
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                      <Facebook className="w-3.5 h-3.5 text-[#1877F2] flex-shrink-0" />
                      <span className="text-[10px] text-slate-500 truncate flex-1">{fbSimUrl}</span>
                    </div>
                  )}

                  <div className="w-full min-h-10 rounded-xl bg-[#1877F2] flex items-center justify-center gap-1.5 px-3 py-2">
                    <span className="text-white text-[11px] font-bold text-center leading-snug">{data.buttonLabel || "Visitar Página do Facebook"}</span>
                    <ArrowRight className="w-3 h-3 text-white flex-shrink-0" />
                  </div>

                  <div className="pt-1 border-t border-slate-100 text-center">
                    <p className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold">Gerado por AngoQrCode</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      
      case 'instagram': {
        const igSimUrl = (typeof value === 'object' ? (value.url || "") : value) || "";
        return (
          <div className="w-full h-full flex flex-col animate-in fade-in duration-500 overflow-auto"
            style={{ background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)" }}>
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              <div className="w-full bg-white rounded-3xl overflow-hidden shadow-xl">
                {/* Header */}
                <div className="px-6 pt-8 pb-12 flex flex-col items-center text-center relative"
                  style={{ background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)" }}>
                  <div className="absolute bottom-0 left-0 right-0 h-6 bg-white rounded-t-3xl" />
                  <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white/20 flex items-center justify-center mb-3">
                    {data.photoUrl ? (
                      <img src={data.photoUrl} alt={data.title || "Foto"} className="w-full h-full object-cover" />
                    ) : (
                      <Instagram className="w-10 h-10 text-white" />
                    )}
                  </div>
                  <h3 className="text-white text-base font-bold leading-tight">{data.title || "Meu Perfil"}</h3>
                </div>

                {/* Content */}
                <div className="px-5 pt-2 pb-6 space-y-3">
                  {data.description && (
                    <p className="text-slate-500 text-[11px] text-center leading-relaxed">{data.description}</p>
                  )}

                  {igSimUrl && (
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                      <Instagram className="w-3.5 h-3.5 text-pink-500 flex-shrink-0" />
                      <span className="text-[10px] text-slate-500 truncate flex-1">{igSimUrl}</span>
                    </div>
                  )}

                  <div className="w-full min-h-10 rounded-xl flex items-center justify-center gap-1.5 px-3 py-2"
                    style={{ background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)" }}>
                    <span className="text-white text-[11px] font-bold text-center leading-snug">{data.buttonLabel || "Visitar Perfil do Instagram"}</span>
                    <ArrowRight className="w-3 h-3 text-white flex-shrink-0" />
                  </div>

                  <div className="pt-1 border-t border-slate-100 text-center">
                    <p className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold">Gerado por AngoQrCode</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

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
            
            <div className="flex-1 bg-white -mt-12 rounded-t-[32px] p-4 shadow-xl relative z-20 overflow-hidden flex flex-col">
              <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                {data.description && (
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold mb-2">Descrição</p>
                    <p className="text-xs text-slate-600 leading-relaxed break-words">{data.description}</p>
                  </div>
                )}
                
                {data.website && (
                  <a 
                    href={data.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                    data-testid="link-website-pdf"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] text-muted-foreground uppercase font-bold">Site</p>
                      <p className="text-xs font-semibold truncate text-primary hover:underline">{data.website}</p>
                    </div>
                  </a>
                )}
              </div>

              <div className="pt-4">
                {hasPdfData ? (
                  <a 
                    href={data.fileUrl || data.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-12 rounded-2xl bg-[#2ECC71] hover:bg-[#27ae60] text-white font-bold flex items-center justify-center transition-all cursor-pointer"
                    data-testid="button-open-pdf"
                  >
                    {data.buttonLabel || "Download PDF"}
                  </a>
                ) : (
                  <button 
                    disabled
                    className="w-full h-12 rounded-2xl bg-[#2ECC71] hover:bg-[#27ae60] text-white font-bold flex items-center justify-center transition-all opacity-50 cursor-not-allowed"
                  >
                    {data.buttonLabel || "Download PDF"}
                  </button>
                )}
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
            <div className="flex-1 p-4 flex flex-col justify-end gap-2 overflow-hidden">
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
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 border-4 border-white/30 overflow-hidden">
                {data.photoUrl ? (
                  <img src={data.photoUrl} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <User className="w-12 h-12" />
                )}
              </div>
              <h3 className="text-xl font-bold">{data.firstName} {data.lastName}</h3>
              <p className="text-sm opacity-90">{data.profession || data.jobTitle}</p>
            </div>
            <div className="flex-1 bg-white -mt-12 rounded-t-[32px] p-6 space-y-6 shadow-xl overflow-hidden">
              <div className="space-y-4 pb-20">
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
                {(data.companyName || data.organization) && (
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Empresa</p>
                      <p className="text-sm font-semibold">{data.companyName || data.organization}</p>
                    </div>
                  </div>
                )}
                {data.location && (
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Localização</p>
                      <p className="text-sm font-semibold">{data.location}</p>
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
              <div className="absolute bottom-4 left-6 right-6">
                <Button className="w-full h-12 rounded-2xl bg-[#2ECC71] hover:bg-[#27ae60] font-bold shadow-lg shadow-[#2ECC71]/20">
                  Salvar Contacto
                </Button>
              </div>
            </div>
          </div>
        );

      case 'business':
        return (
          <div className="w-full h-full bg-slate-50 flex flex-col animate-in fade-in duration-500 overflow-hidden">
            <div className="bg-primary pt-12 pb-20 px-6 text-white flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10" />
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-4 border-4 border-white shadow-xl relative z-10 overflow-hidden">
                {data.photoUrl ? (
                  <img src={data.photoUrl} className="w-full h-full object-cover" alt="Logo" />
                ) : (
                  <Search className="w-12 h-12 text-primary/20" />
                )}
              </div>
              <h3 className="text-xl font-bold relative z-10">{data.companyName || "Nome da Empresa"}</h3>
              <p className="text-sm opacity-90 relative z-10">{data.industry || "Ramo de Atividade"}</p>
            </div>
            
            <div className="flex-1 bg-white -mt-12 rounded-t-[32px] p-6 space-y-6 shadow-xl relative z-20 overflow-hidden">
              {data.caption && (
                <p className="text-sm text-slate-600 text-center italic leading-relaxed">"{data.caption}"</p>
              )}
              
              {data.openingHours && data.openingHours.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold px-1">Horário de Funcionamento</p>
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                    {data.openingHours.map((oh: any, i: number) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-slate-500">{oh.day}</span>
                        <span className="font-semibold text-slate-700">{oh.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <p className="text-[10px] text-muted-foreground uppercase font-bold px-1">Contato e Localização</p>
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
                      <p className="text-sm font-semibold leading-tight">{data.location}</p>
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

      case 'images': {
        const simImages: string[] = data.fileUrls && data.fileUrls.length > 0
          ? data.fileUrls
          : data.fileUrl ? [data.fileUrl] : [];
        const simIsSingle = simImages.length <= 1;
        return (
          <div className="w-full h-full bg-slate-950 flex flex-col animate-in fade-in duration-500 overflow-auto">
            {/* Image area */}
            {simImages.length > 0 ? (
              <div className="relative w-full bg-slate-900 flex-shrink-0">
                {simIsSingle ? (
                  <div className="w-full">
                    <img
                      src={simImages[0]}
                      alt={data.title || "Imagem"}
                      className="w-full object-cover"
                      style={{ maxHeight: "220px", minHeight: "160px" }}
                    />
                  </div>
                ) : (
                  <div className="relative overflow-hidden">
                    <div
                      className="flex transition-transform duration-300 ease-in-out"
                      style={{ transform: `translateX(-${simCurrent * 100}%)` }}
                    >
                      {simImages.map((src: string, i: number) => (
                        <div key={i} className="w-full flex-shrink-0">
                          <img
                            src={src}
                            alt={`Imagem ${i + 1}`}
                            className="w-full object-cover"
                            style={{ height: "180px" }}
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setSimCurrent((c) => (c - 1 + simImages.length) % simImages.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSimCurrent((c) => (c + 1) % simImages.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                      {simImages.map((_: string, i: number) => (
                        <button
                          key={i}
                          onClick={() => setSimCurrent(i)}
                          className={`w-1.5 h-1.5 rounded-full transition-all ${i === simCurrent ? "bg-white scale-110" : "bg-white/40"}`}
                        />
                      ))}
                    </div>
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                      {simCurrent + 1}/{simImages.length}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full bg-slate-800 flex items-center justify-center flex-shrink-0" style={{ height: "160px" }}>
                <div className="flex flex-col items-center gap-2 opacity-40">
                  <ImageIcon className="w-10 h-10 text-white" />
                  <span className="text-[10px] text-white font-medium">Adicione imagens</span>
                </div>
              </div>
            )}

            {/* Thumbnails */}
            {simImages.length > 1 && (
              <div className="flex gap-1.5 px-3 py-2 bg-slate-900 overflow-x-auto flex-shrink-0">
                {simImages.map((src: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSimCurrent(i)}
                    className={`flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${i === simCurrent ? "border-white" : "border-transparent opacity-50"}`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 bg-white rounded-t-3xl -mt-3 p-4 space-y-3 relative z-10">
              {data.title && (
                <h3 className="text-base font-bold text-slate-900 leading-tight">{data.title}</h3>
              )}
              {data.description && (
                <p className="text-[11px] text-slate-500 leading-relaxed">{data.description}</p>
              )}
              {(data.website || data.buttonLabel) && (
                <Button className="w-full h-10 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5">
                  {data.buttonLabel || "Ver mais"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              )}
              <div className="pt-2 border-t border-slate-100 text-center">
                <p className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold">Gerado por AngoQrCode</p>
              </div>
            </div>
          </div>
        );
      }

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
    <div className="flex flex-col items-center gap-6 w-full h-full overflow-hidden">
      <div className="flex-1 w-full relative">
        <div className={`absolute inset-0 flex flex-col transition-all duration-500 ${effectiveShowQr ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
          {renderSimulation()}
        </div>

        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ${effectiveShowQr ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
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

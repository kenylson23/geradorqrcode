import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, AlertTriangle, Globe, MessageCircle, FileText, User, Instagram, Facebook, Smartphone, Search, MoreHorizontal, Briefcase, Image as ImageIcon, Video } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LinkTree } from "./LinkTree";
import { useState } from "react";

interface QrResultProps {
  value: any;
  onDownload: () => void;
  onReset: () => void;
}

export function QrResult({ value, onDownload, onReset }: QrResultProps) {
  const [showQr, setShowQr] = useState(false);
  
  // If value is an object with type 'links', we show LinkTree preview
  const isLinkTree = typeof value === 'object' && value?.type === 'links';
  
  // Extract the raw URL for the preview (before any processing like mailto: or tel:)
  // This ensures we show exactly what the user typed in the browser simulation
  const previewUrl = typeof value === 'object' ? (value.url || value.fileUrl || (value.type === 'instagram' && value.instagramUser ? `instagram.com/${value.instagramUser.startsWith('@') ? value.instagramUser.slice(1) : value.instagramUser}` : "")) : value;
  
  const generateQrValue = (data: any) => {
    if (!data) return "";
    if (typeof data === 'string') return data;
    
    // Check if we have minimum data for the specific type
    const hasData = data.type === 'url' || data.type === 'facebook' || data.type === 'instagram' 
      ? (data.url && data.url.length > 0) || (data.type === 'instagram' && data.instagramUser && data.instagramUser.length > 0)
      : (data.type === 'whatsapp' ? !!data.phone : (data.type === 'links' ? !!data.title || (data.links && data.links.length > 0 && (data.links[0].url || data.links[0].label)) : (data.type === 'images' ? (!!data.fileUrl || !!data.title || !!data.description || !!data.website || !!data.buttonLabel || !!data.url) : true)));

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
  const hasMinData = isUrlType 
    ? (value?.url && value.url.length > 0) || (value?.fileUrl && value.fileUrl.length > 0) || (value?.type === 'instagram' && value?.instagramUser && value.instagramUser.length > 0)
    : (value?.type === 'whatsapp' ? !!value?.phone : (value?.type === 'links' ? !!value?.title || (value?.links && value?.links.length > 0 && (value?.links[0].url || value?.links[0].label)) : (value?.type === 'images' ? (!!value?.fileUrl || !!value?.title || !!value?.description || !!value?.website || !!value?.buttonLabel || !!value?.url) : (value?.type === 'pdf' ? (!!value?.fileUrl || !!value?.url || !!value?.title) : (value?.type === 'business' ? (!!value?.companyName || !!value?.industry) : true)))));

  console.log("QrResult Render:", { type: value?.type, hasMinData, value });

  const renderSimulation = () => {
    // Force hasMinData to true for debugging if it's the right type
    const effectiveHasMinData = hasMinData || (value?.type === 'images' && (value?.title || value?.description));

    if (isLinkTree && effectiveHasMinData) {
      return (
        <div className="w-full h-full bg-white animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto">
          <LinkTree 
            title={value.title} 
            description={value.description} 
            links={value.links || []} 
          />
        </div>
      );
    }

    switch (value?.type) {
      case 'url':
      case 'facebook':
      case 'instagram':
        const url = previewUrl || "";
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
                    {value.type === 'facebook' ? <Facebook className="w-12 h-12 text-slate-400" /> : 
                      value.type === 'instagram' ? <Instagram className="w-12 h-12 text-slate-400" /> :
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
        const hasPdfData = value.fileUrl || value.url;
        return (
          <div className="w-full h-full bg-slate-50 flex flex-col animate-in fade-in duration-500 overflow-hidden">
            <div className="bg-[#2ECC71] pt-12 pb-20 px-6 text-white flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10" />
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 border-2 border-white/30 relative z-10">
                <FileText className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold relative z-10">{value.title || "Documento PDF"}</h3>
              <p className="text-xs opacity-90 relative z-10">{value.companyName || "Visualizador de PDF"}</p>
            </div>
            
            <div className="flex-1 bg-white -mt-12 rounded-t-[32px] p-6 space-y-6 shadow-xl relative z-20 overflow-y-auto">
              <div className="space-y-4">
                {value.description && (
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Descrição</p>
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-4">{value.description}</p>
                  </div>
                )}
                
                {value.website && (
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Site</p>
                      <p className="text-sm font-semibold truncate">{value.website}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <a 
                  href={hasPdfData ? (value.fileUrl || value.url) : "#"}
                  download={(value.title || 'documento').toLowerCase().replace(/\s+/g, '-') + '.pdf'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full h-12 rounded-2xl bg-[#2ECC71] hover:bg-[#27ae60] text-white font-bold flex items-center justify-center transition-all ${!hasPdfData ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={(e) => {
                    if (!hasPdfData) {
                      e.preventDefault();
                      return;
                    }
                  }}
                >
                  {value.buttonLabel || "Download PDF"}
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
                <p className="font-bold text-xs truncate">{value.phone || "WhatsApp"}</p>
                <p className="text-[10px] opacity-80">online</p>
              </div>
              <Video className="w-4 h-4" />
            </div>
            <div className="flex-1 p-4 flex flex-col justify-end gap-2 overflow-y-auto">
              <div className="self-end bg-[#DCF8C6] p-3 rounded-lg rounded-tr-none shadow-sm max-w-[80%]">
                <p className="text-[11px] text-slate-800">{value.message || "Olá! Gostaria de mais informações."}</p>
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
              <h3 className="text-xl font-bold">{value.firstName} {value.lastName}</h3>
              <p className="text-sm opacity-90">{value.jobTitle || value.profession}</p>
            </div>
            <div className="flex-1 bg-white -mt-12 rounded-t-[32px] p-6 space-y-6 shadow-xl">
              <div className="space-y-4">
                {value.phone && (
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Telemóvel</p>
                      <p className="text-sm font-semibold">{value.phone}</p>
                    </div>
                  </div>
                )}
                {value.email && (
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Email</p>
                      <p className="text-sm font-semibold">{value.email}</p>
                    </div>
                  </div>
                )}
                {value.companyName && (
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Empresa</p>
                      <p className="text-sm font-semibold">{value.companyName}</p>
                    </div>
                  </div>
                )}
                {value.website && (
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Website</p>
                      <p className="text-sm font-semibold">{value.website}</p>
                    </div>
                  </div>
                )}
                {value.summary && (
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Sobre</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{value.summary}</p>
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
                {value.photoUrl ? (
                  <img src={value.photoUrl} className="w-full h-full object-cover rounded-full" alt="Logo" />
                ) : (
                  <Search className="w-12 h-12 text-primary/20" />
                )}
              </div>
              <h3 className="text-xl font-bold relative z-10">{value.companyName || "Nome da Empresa"}</h3>
              <p className="text-sm opacity-90 relative z-10">{value.industry || "Ramo de Atividade"}</p>
            </div>
            
            <div className="flex-1 bg-white -mt-12 rounded-t-[32px] p-6 space-y-6 shadow-xl relative z-20 overflow-y-auto">
              {value.caption && (
                <p className="text-sm text-slate-600 text-center italic">{value.caption}</p>
              )}
              
              <div className="space-y-3">
                {value.phone && (
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Telefone</p>
                      <p className="text-sm font-semibold truncate">{value.phone}</p>
                    </div>
                  </div>
                )}
                {value.email && (
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Email</p>
                      <p className="text-sm font-semibold truncate">{value.email}</p>
                    </div>
                  </div>
                )}
                {value.website && (
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Site</p>
                      <p className="text-sm font-semibold truncate">{value.website}</p>
                    </div>
                  </div>
                )}
                {value.location && (
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Search className="w-5 h-5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Endereço</p>
                      <p className="text-sm font-semibold truncate">{value.location}</p>
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
        const hasImagesData = !!value.fileUrl || !!value.title || !!value.description || !!value.url;
        return (
          <div className="w-full h-full bg-gray-50 flex flex-col animate-in fade-in duration-500 overflow-y-auto pb-10">
            <div className="bg-[#2ECC71] pt-12 pb-16 px-6 text-white flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10" />
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 border-2 border-white/30 relative z-10">
                <ImageIcon className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold relative z-10 truncate w-full px-4">{value.title || "Galeria de Imagens"}</h3>
            </div>

            <div className="flex-1 bg-white -mt-8 rounded-t-[32px] p-6 space-y-6 shadow-xl relative z-20">
              {value.fileUrl && (
                <div className="w-full aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                  <img 
                    src={value.fileUrl} 
                    alt={value.title || "Imagem"} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-4">
                {value.description && (
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1 text-left">Descrição</p>
                    <p className="text-sm text-slate-600 leading-relaxed text-left">{value.description}</p>
                  </div>
                )}
                
                {value.url && (
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold text-left">Link Relacionado</p>
                      <p className="text-sm font-semibold truncate text-left">{value.url}</p>
                    </div>
                  </div>
                )}
              </div>

              {!effectiveHasMinData && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground space-y-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 opacity-20" />
                  </div>
                  <p className="text-xs italic">Complete as informações para ver o preview</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        if (hasMinData && value?.type) {
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
      <div className="flex w-full gap-4 p-1 bg-slate-100 rounded-xl">
        <Button 
          variant={!showQr ? "default" : "ghost"} 
          className="flex-1 rounded-lg h-9 text-xs font-bold"
          onClick={() => setShowQr(false)}
        >
          Simulação
        </Button>
        <Button 
          variant={showQr ? "default" : "ghost"} 
          className="flex-1 rounded-lg h-9 text-xs font-bold"
          onClick={() => setShowQr(true)}
        >
          Código QR
        </Button>
      </div>

      <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
        {!showQr ? (
          <div className="relative w-[280px] h-[580px] bg-slate-900 rounded-[3rem] p-3 shadow-2xl border-[6px] border-slate-800 scale-[0.85] origin-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-30 flex items-center justify-center gap-1.5 pt-1">
              <div className="w-8 h-1.5 bg-slate-800 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-slate-800 rounded-full"></div>
            </div>
            <div className="w-full h-full bg-white rounded-[2.2rem] overflow-hidden relative">
              {renderSimulation()}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8 animate-in zoom-in-95 duration-300">
            {qrValue ? (
              <>
                <div className="p-6 bg-white rounded-[2rem] shadow-xl border-4 border-slate-50">
                  <QRCodeSVG 
                    value={qrValue} 
                    size={200}
                    level="M"
                    includeMargin={true}
                  />
                </div>
                
                {isTooLong && (
                  <Alert variant="destructive" className="max-w-[300px]">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Dados em excesso</AlertTitle>
                    <AlertDescription>
                      O arquivo ou texto é muito grande para um código QR. Tente reduzir o tamanho.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-col gap-3 w-full max-w-[240px]">
                  <Button 
                    onClick={onDownload} 
                    className="w-full h-12 rounded-2xl bg-[#2ECC71] hover:bg-[#27ae60] font-bold gap-2 text-white"
                  >
                    <Download className="w-4 h-4" />
                    Baixar QR Code
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={onReset}
                    className="w-full h-12 rounded-2xl border-2 font-bold gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Criar Outro
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center p-8 space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-500 text-sm">Insira os dados à esquerda para gerar o Código QR.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

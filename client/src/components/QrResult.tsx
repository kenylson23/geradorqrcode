import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Globe, MessageCircle, FileText, User, Instagram, Facebook, Smartphone, Search, MoreHorizontal, Briefcase, Image as ImageIcon, Video, ChevronLeft, ChevronRight, ArrowRight, MapPin, Phone, Mail, Clock, ExternalLink } from "lucide-react";
import { SiInstagram, SiTiktok, SiFacebook, SiWhatsapp, SiYoutube } from "react-icons/si";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LinkTree } from "./LinkTree";
import { useState, useEffect, useRef } from "react";
import { compressToEncodedURIComponent as lzCompress } from "lz-string";

// Cloudinary URL helpers (Option B: strip base URL + version to save ~50 chars)
function shrinkCloudinaryUrl(url: string): string {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  const withoutBase = url.replace('https://res.cloudinary.com/', '');
  return 'c:' + withoutBase.replace(/\/v\d+\//, '/');
}

// Compress business JSON with LZ-String (Option A) + shrink Cloudinary URLs (Option B)
function encodeBusinessData(data: object): string {
  const json = JSON.stringify(data);
  return lzCompress(json);
}

interface QrResultProps {
  value: any;
  showQr?: boolean;
  setShowQr?: (show: boolean) => void;
}

export function QrResult({ value, showQr: propShowQr = false, setShowQr: propSetShowQr }: QrResultProps) {
  const [showQr, setShowQr] = useState(false);
  const [simCurrent, setSimCurrent] = useState(0);
  const effectiveShowQr = propShowQr !== undefined ? propShowQr : showQr;
  const simContainerRef = useRef<HTMLDivElement>(null);

  const data = typeof value === 'object' ? value : null;
  const simImagesKey = data?.fileUrls?.length ?? 0;
  useEffect(() => { setSimCurrent(0); }, [simImagesKey]);

  const effectiveSetShowQr = propSetShowQr || setShowQr;
  
  // If value is an object with type 'links', we show LinkTree preview
  const isLinkTree = typeof value === 'object' && value?.type === 'links';

  // Handle keyboard scroll with arrow keys — scrolls the simulation's inner container
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        const scrollable = simContainerRef.current?.querySelector('.sim-scroll') as HTMLElement | null;
        if (scrollable) {
          e.preventDefault();
          const direction = e.key === 'ArrowUp' ? -1 : 1;
          scrollable.scrollBy({ top: direction * 80, behavior: 'smooth' });
        }
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
      case "business": {
        const bizData = {
          type: 'business',
          companyName: data.companyName,
          industry: data.industry,
          phone: data.phone,
          whatsappNumber: data.whatsappNumber,
          email: data.email,
          website: data.website,
          location: data.location,
          mapsUrl: data.mapsUrl,
          caption: data.caption,
          // Option B: shorten Cloudinary URLs before compression
          photoUrl: shrinkCloudinaryUrl(data.photoUrl || ''),
          openingHours: (data.openingHours || [])
            .filter((d: any) => d.enabled)
            .map((d: any) => ({
              d: d.day,
              s: (d.slots || []).filter((s: any) => s.from || s.to)
                .map((s: any) => ({ f: s.from, t: s.to }))
            })),
          socialLinks: (data.socialLinks || []).map((sl: any) => ({
            p: sl.platform,
            u: sl.url
          })),
        };
        // Option A: LZ-String compress
        const compressed = encodeBusinessData(bizData);
        return `${window.location.origin}/b#${compressed}`;
      }
      case "links": {
        const linksPageData = {
          type: 'links',
          title: data.title,
          description: data.description,
          photoUrl: data.photoUrl,
          links: (data.links || []).filter((l: any) => l.label && l.url).map((l: any) => ({
            label: l.label,
            url: l.url,
            imageUrl: l.imageUrl,
            socialType: l.socialType || ""
          }))
        };
        const encodedData = btoa(unescape(encodeURIComponent(JSON.stringify(linksPageData))));
        return `${window.location.origin}/l#${encodedData}`;
      }
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
        <div className="w-full h-full bg-white animate-in fade-in slide-in-from-bottom-4 duration-500 sim-scroll">
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
          <div className="w-full h-full bg-[#F2F2F7] flex flex-col animate-in fade-in duration-500 overflow-hidden">
            {/* Status bar */}
            <div className="bg-[#F2F2F7] pt-8 pb-1 px-5 flex items-center justify-between flex-shrink-0">
              <span className="text-[11px] font-bold text-slate-900">9:41</span>
              <div className="flex items-center gap-1.5">
                <div className="flex gap-[2px] items-end h-2.5">
                  <div className="w-[3px] h-[5px] bg-slate-900 rounded-sm"></div>
                  <div className="w-[3px] h-[7px] bg-slate-900 rounded-sm"></div>
                  <div className="w-[3px] h-[9px] bg-slate-900 rounded-sm"></div>
                  <div className="w-[3px] h-[10px] bg-slate-400 rounded-sm"></div>
                </div>
                <svg className="w-3.5 h-3" viewBox="0 0 16 12" fill="currentColor">
                  <path d="M8 2.4C5.6 2.4 3.5 3.4 2 5L0 3C2.1 1.1 4.9 0 8 0s5.9 1.1 8 3l-2 2C12.5 3.4 10.4 2.4 8 2.4zM8 6.8c-1.2 0-2.3.5-3.1 1.2L3 6.1C4.2 4.9 6 4.2 8 4.2s3.8.7 5 1.9L11.1 8C10.3 7.3 9.2 6.8 8 6.8zM8 11.2c-.8 0-1.5-.3-2-.8L8 8l2 2.4c-.5.5-1.2.8-2 .8z"/>
                </svg>
                <div className="flex items-center gap-0.5">
                  <div className="w-5 h-2.5 border border-slate-900 rounded-[2px] relative">
                    <div className="absolute inset-[1px] right-[3px] bg-slate-900 rounded-[1px]"></div>
                    <div className="absolute right-[-2px] top-[3px] w-[2px] h-[4px] bg-slate-900 rounded-r-sm"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Browser address bar */}
            <div className="bg-[#F2F2F7] px-3 pb-2 flex-shrink-0">
              <div className="bg-white rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm border border-slate-200/80">
                {urlFullUrl ? (
                  <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                ) : (
                  <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
                )}
                <span className={`text-[12px] flex-1 truncate ${urlFullUrl ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                  {urlValue || "seusite.com"}
                </span>
                <div className="w-3.5 h-3.5 flex-shrink-0">
                  <MoreHorizontal className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 relative overflow-hidden bg-white">
              {!urlFullUrl ? (
                <div className="p-4 space-y-3 animate-pulse">
                  {/* Hero skeleton */}
                  <div className="w-full h-28 bg-slate-200 rounded-xl" />
                  {/* Nav skeleton */}
                  <div className="flex gap-2">
                    <div className="h-6 bg-slate-100 rounded-lg flex-1" />
                    <div className="h-6 bg-slate-100 rounded-lg flex-1" />
                    <div className="h-6 bg-slate-100 rounded-lg flex-1" />
                  </div>
                  {/* Content lines */}
                  <div className="space-y-2 pt-1">
                    <div className="h-2.5 bg-slate-100 rounded-full w-2/3" />
                    <div className="h-2 bg-slate-100 rounded-full w-full" />
                    <div className="h-2 bg-slate-100 rounded-full w-11/12" />
                    <div className="h-2 bg-slate-100 rounded-full w-4/5" />
                  </div>
                  {/* Cards row */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="h-16 bg-slate-100 rounded-xl" />
                    <div className="h-16 bg-slate-100 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-slate-100 rounded-full w-full" />
                    <div className="h-2 bg-slate-100 rounded-full w-3/4" />
                  </div>
                  <div className="h-8 bg-slate-200 rounded-xl w-2/5 mx-auto" />
                </div>
              ) : (
                <iframe
                  src={urlFullUrl}
                  className="w-full h-full border-0"
                  title="Browser Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              )}
            </div>

            {/* Bottom browser toolbar */}
            <div className="bg-[#F2F2F7] border-t border-slate-200/80 px-4 py-2 flex items-center justify-between flex-shrink-0">
              <ChevronLeft className="w-5 h-5 text-slate-400" />
              <ChevronRight className="w-5 h-5 text-slate-300" />
              <div className="w-5 h-5 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-slate-400 rounded-sm" />
              </div>
              <div className="flex flex-col items-center gap-[2px]">
                <div className="w-3.5 h-[1.5px] bg-slate-400 rounded-full" />
                <div className="w-3.5 h-[1.5px] bg-slate-400 rounded-full" />
                <div className="w-3.5 h-[1.5px] bg-slate-400 rounded-full" />
              </div>
              <div className="w-5 h-5 flex items-center justify-center">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-400 flex items-center justify-center">
                  <User className="w-2 h-2 text-slate-400" />
                </div>
              </div>
            </div>
          </div>
        );

      case 'facebook': {
        const fbSimUrl = (typeof value === 'object' ? (value.url || "") : value) || "";
        return (
          <div className="w-full h-full bg-[#1877F2] flex flex-col animate-in fade-in duration-500 sim-scroll">
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
          <div className="w-full h-full flex flex-col animate-in fade-in duration-500 sim-scroll"
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

      case 'pdf': {
        const hasPdfData = data.fileUrl || data.url;
        return (
          <div className="w-full h-full bg-slate-900 flex flex-col animate-in fade-in duration-500 sim-scroll">
            {/* Top header */}
            <div className="bg-slate-900 pt-10 pb-6 px-5 flex flex-col items-center text-center">
              {data.companyName && (
                <p className="text-[10px] text-slate-400 uppercase tracking-[0.15em] font-bold mb-1">{data.companyName}</p>
              )}
              <h3 className="text-white text-sm font-bold leading-tight">{data.title || "Documento PDF"}</h3>
            </div>

            {/* Document card */}
            <div className="mx-4 mb-4 bg-white rounded-2xl shadow-2xl overflow-hidden flex-shrink-0">
              <div className="bg-red-500 px-4 py-3 flex items-center gap-2">
                <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-white text-[11px] font-bold uppercase tracking-wider">PDF</span>
                <div className="ml-auto flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-white/40" />
                  <div className="w-2 h-2 rounded-full bg-white/40" />
                  <div className="w-2 h-2 rounded-full bg-white/40" />
                </div>
              </div>
              <div className="p-4 space-y-3">
                {/* Simulated document lines */}
                <div className="space-y-2 py-2">
                  <div className="h-2 bg-slate-200 rounded-full w-full" />
                  <div className="h-2 bg-slate-200 rounded-full w-5/6" />
                  <div className="h-2 bg-slate-200 rounded-full w-4/6" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-10 bg-slate-100 rounded-lg" />
                  <div className="h-10 bg-slate-100 rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-2 bg-slate-100 rounded-full w-full" />
                  <div className="h-2 bg-slate-100 rounded-full w-5/6" />
                  <div className="h-2 bg-slate-100 rounded-full w-full" />
                  <div className="h-2 bg-slate-100 rounded-full w-3/4" />
                </div>
              </div>
            </div>

            {/* Info card */}
            <div className="mx-4 bg-slate-800 rounded-2xl p-4 space-y-3 flex-shrink-0">
              {data.description && (
                <p className="text-slate-300 text-[11px] leading-relaxed">{data.description}</p>
              )}
              {data.website && (
                <div className="flex items-center gap-2 bg-slate-700/60 rounded-xl px-3 py-2">
                  <Globe className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="text-[10px] text-slate-400 truncate">{data.website}</span>
                </div>
              )}
              <div className={`w-full min-h-10 rounded-xl flex items-center justify-center gap-1.5 px-3 py-2.5 ${hasPdfData ? 'bg-red-500' : 'bg-slate-600 opacity-60'}`}>
                <FileText className="w-3.5 h-3.5 text-white flex-shrink-0" />
                <span className="text-white text-[11px] font-bold text-center leading-snug">{data.buttonLabel || "Abrir PDF"}</span>
              </div>
              {!hasPdfData && (
                <p className="text-[9px] text-center text-slate-500 italic">Aguardando upload do PDF...</p>
              )}
            </div>

            <div className="py-4 text-center">
              <p className="text-[8px] text-slate-600 uppercase tracking-widest font-bold">Gerado por AngoQrCode</p>
            </div>
          </div>
        );
      }

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
          <div className="w-full h-full bg-slate-900 flex flex-col animate-in fade-in duration-500 sim-scroll">
            {/* Dark hero */}
            <div className="relative px-5 pt-10 pb-16 flex flex-col items-center text-center flex-shrink-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900" />
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center mb-4 shadow-2xl relative z-10 overflow-hidden">
                {data.photoUrl ? (
                  <img src={data.photoUrl} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <User className="w-9 h-9 text-slate-300" />
                )}
              </div>
              <h3 className="text-white text-lg font-bold relative z-10 leading-tight">
                {(data.firstName || data.lastName) ? `${data.firstName || ''} ${data.lastName || ''}`.trim() : "Nome Completo"}
              </h3>
              {(data.profession || data.jobTitle) && (
                <p className="text-slate-400 text-xs mt-1 relative z-10">{data.profession || data.jobTitle}</p>
              )}
              {(data.companyName || data.organization) && (
                <span className="mt-2 inline-flex items-center gap-1.5 bg-white/10 text-white/70 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full relative z-10">
                  <Briefcase className="w-2.5 h-2.5" />
                  {data.companyName || data.organization}
                </span>
              )}
            </div>

            {/* White card */}
            <div className="bg-white rounded-t-[28px] -mt-8 relative z-10 px-5 pt-5 pb-6 space-y-4 shadow-2xl">

              {/* Quick action pills */}
              {(data.phone || data.email) && (
                <div className="flex gap-2 flex-wrap">
                  {data.phone && (
                    <div className="flex items-center gap-1.5 bg-green-50 text-green-700 rounded-full px-3 py-1.5 text-[11px] font-bold">
                      <Phone className="w-3 h-3" />
                      <span>Ligar</span>
                    </div>
                  )}
                  {(data.whatsappNumber || data.phone) && (
                    <div className="flex items-center gap-1.5 bg-green-500 text-white rounded-full px-3 py-1.5 text-[11px] font-bold">
                      <MessageCircle className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </div>
                  )}
                  {data.email && (
                    <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 rounded-full px-3 py-1.5 text-[11px] font-bold">
                      <Mail className="w-3 h-3" />
                      <span>Email</span>
                    </div>
                  )}
                </div>
              )}

              {/* Contact rows */}
              <div className="space-y-2.5">
                {data.phone && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                    <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wide">Telemóvel</p>
                      <p className="text-xs font-semibold text-slate-800 truncate">{data.phone}</p>
                    </div>
                  </div>
                )}
                {data.email && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wide">Email</p>
                      <p className="text-xs font-semibold text-slate-800 truncate">{data.email}</p>
                    </div>
                  </div>
                )}
                {data.website && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                    <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-4 h-4 text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wide">Website</p>
                      <p className="text-xs font-semibold text-slate-800 truncate">{data.website}</p>
                    </div>
                  </div>
                )}
                {data.location && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                    <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wide">Localização</p>
                      <p className="text-xs font-semibold text-slate-800 leading-snug">{data.location}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Summary */}
              {data.summary && (
                <div className="bg-slate-50 rounded-2xl p-3">
                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wide mb-1.5">Sobre</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{data.summary}</p>
                </div>
              )}

              {/* Save button */}
              <button className="w-full min-h-11 rounded-2xl bg-[#2ECC71] hover:bg-[#27ae60] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 transition-all">
                <User className="w-4 h-4" />
                Salvar Contacto
              </button>

              <div className="text-center pt-1 pb-2">
                <p className="text-[8px] text-slate-300 uppercase tracking-widest font-bold">Gerado por AngoQrCode</p>
              </div>
            </div>
          </div>
        );

      case 'business': {
        const BIZ_SOCIAL_MAP: Record<string, { Icon: any; color: string; label: string }> = {
          instagram: { Icon: SiInstagram, color: "#E1306C", label: "Instagram" },
          tiktok:    { Icon: SiTiktok,    color: "#000000", label: "TikTok" },
          facebook:  { Icon: SiFacebook,  color: "#1877F2", label: "Facebook" },
          whatsapp:  { Icon: SiWhatsapp,  color: "#25D366", label: "WhatsApp" },
          youtube:   { Icon: SiYoutube,   color: "#FF0000", label: "YouTube" },
        };
        return (
          <div className="w-full h-full bg-slate-50 flex flex-col animate-in fade-in duration-500 sim-scroll">
            <div className="w-full bg-white flex flex-col shadow-xl min-h-full">
              {/* Primary header — matches BusinessPage exactly */}
              <div className="bg-primary pt-8 pb-14 px-5 text-white flex flex-col items-center text-center relative overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 bg-black/10" />
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-3 border-4 border-white shadow-xl relative z-10 overflow-hidden flex-shrink-0">
                  {data.photoUrl ? (
                    <img src={data.photoUrl} className="w-full h-full object-cover" alt="Logo" />
                  ) : (
                    <Briefcase className="w-8 h-8 text-primary/20" />
                  )}
                </div>
                <h3 className="text-base font-bold relative z-10 leading-tight">{data.companyName || "Nome da Empresa"}</h3>
                <p className="text-[11px] opacity-90 relative z-10 mt-0.5">{data.industry || "Ramo de Atividade"}</p>
              </div>

              {/* White rounded card — matches -mt-12 rounded-t-[32px] */}
              <div className="flex-1 bg-white -mt-8 rounded-t-[28px] px-4 pt-5 pb-4 space-y-4 relative z-20">

                {data.caption && (
                  <p className="text-[11px] text-slate-600 text-center italic leading-relaxed">{data.caption}</p>
                )}

                {/* Contact rows */}
                <div className="space-y-2">
                  {data.phone && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Ligar</p>
                        <p className="text-xs font-semibold text-slate-900 truncate">{data.phone}</p>
                      </div>
                    </div>
                  )}
                  {(data.whatsappNumber || data.phone) && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-2xl">
                      <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                        <SiWhatsapp className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] text-green-700 uppercase font-bold tracking-wider">WhatsApp</p>
                        <p className="text-xs font-semibold text-green-800 truncate">{data.whatsappNumber || data.phone}</p>
                      </div>
                    </div>
                  )}
                  {data.email && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Email</p>
                        <p className="text-xs font-semibold text-slate-900 truncate">{data.email}</p>
                      </div>
                    </div>
                  )}
                  {data.website && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Site</p>
                        <p className="text-xs font-semibold text-slate-900 truncate">{data.website}</p>
                      </div>
                    </div>
                  )}
                  {data.location && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Endereço</p>
                        <p className="text-xs font-semibold text-slate-900 leading-snug">{data.location}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Opening hours */}
                {data.openingHours && data.openingHours.some((oh: any) => oh.enabled) && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Horário de Funcionamento</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl overflow-hidden divide-y divide-slate-100">
                      {data.openingHours.filter((oh: any) => oh.enabled).map((oh: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-2">
                          <span className="text-[10px] font-semibold text-slate-800 flex-shrink-0 w-20">{oh.day}</span>
                          <div className="flex-1 space-y-0.5">
                            {(oh.slots || []).filter((s: any) => s.from || s.to).map((slot: any, si: number) => (
                              <p key={si} className="text-[10px] text-slate-600">{slot.from || "--:--"} – {slot.to || "--:--"}</p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social links */}
                {data.socialLinks && data.socialLinks.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Redes Sociais</p>
                    <div className="flex flex-wrap gap-2">
                      {data.socialLinks.map((sl: any, i: number) => {
                        const info = BIZ_SOCIAL_MAP[sl.platform] || { Icon: Globe, color: "#6b7280", label: sl.platform };
                        const { Icon, color, label } = info;
                        return (
                          <div
                            key={i}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-white text-[10px] font-semibold shadow-sm"
                            style={{ backgroundColor: color }}
                          >
                            <Icon size={12} />
                            <span>{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 text-center">
                  <p className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold">Gerado por AngoQrCode</p>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'images': {
        const simImages: string[] = data.fileUrls && data.fileUrls.length > 0
          ? data.fileUrls
          : data.fileUrl ? [data.fileUrl] : [];
        const simIsSingle = simImages.length <= 1;
        return (
          <div className="w-full h-full bg-slate-950 flex flex-col animate-in fade-in duration-500 sim-scroll">
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
        <div ref={simContainerRef} className={`absolute inset-0 flex flex-col transition-all duration-500 ${effectiveShowQr ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
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

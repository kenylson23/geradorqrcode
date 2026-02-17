import { QRCodeSVG } from "qrcode.react";
import { Download, RefreshCw, Share2, Eye, Layout, Briefcase, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface QrResultProps {
  value: string;
  onDownload: () => void;
  onReset: () => void;
}

export function QrResult({ value, onDownload, onReset }: QrResultProps) {
  const [activeTab, setActiveTab] = useState<"qr" | "details">("qr");

  if (!value) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px]">
        {/* iPhone Mockup for Empty State */}
        <div className="relative w-[280px] h-[580px] bg-slate-900 rounded-[3rem] border-8 border-slate-800 shadow-2xl p-4 overflow-hidden flex flex-col items-center justify-center">
          <div className="absolute top-0 w-32 h-6 bg-slate-800 rounded-b-2xl z-20" />
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <RefreshCw className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2 text-center">Aguardando geração</h3>
          <p className="text-xs text-slate-400 max-w-[180px] text-center leading-relaxed">
            Preencha o formulário e clique em "Gerar" para ver seu QR Code aqui.
          </p>
        </div>
      </div>
    );
  }

  // Simple logic to identify content type
  const getContentType = (val: string) => {
    if (val.includes("ORG:") && val.includes("TITLE:")) {
      // Check if it's a business card or generic vcard
      if (val.includes("BEGIN:VCARD")) return "Perfil de Negócio";
    }
    if (val.startsWith("BEGIN:VCARD")) return "Cartão de Visita (vCard)";
    if (val.startsWith("http")) return "Link Web";
    if (val.startsWith("mailto:")) return "E-mail";
    if (val.startsWith("tel:")) return "Telefone";
    if (val.startsWith("WIFI:")) return "Rede Wi-Fi";
    return "Texto Simples";
  };

  const renderBusinessPreview = (val: string) => {
    const lines = val.split("\n");
    const companyName = lines.find(l => l.startsWith("FN:"))?.replace("FN:", "") || "";
    const industry = lines.find(l => l.startsWith("TITLE:"))?.replace("TITLE:", "") || "";
    const caption = lines.find(l => l.startsWith("NOTE:"))?.replace("NOTE:", "") || "";
    const phone = lines.find(l => l.startsWith("TEL:"))?.replace("TEL:", "") || "";
    const email = lines.find(l => l.startsWith("EMAIL:"))?.replace("EMAIL:", "") || "";
    const website = lines.find(l => l.startsWith("URL:"))?.replace("URL:", "") || "";
    const location = lines.find(l => l.startsWith("ADR:"))?.split(";")[2] || "";
    const hours = lines.filter(l => l.startsWith("NOTE:Horário ")).map(l => l.replace("NOTE:Horário ", ""));
    const socials = lines.filter(l => l.startsWith("X-SOCIAL-PROFILE;")).map(l => {
      const match = l.match(/TYPE=(.*?):(.*)/);
      return match ? { platform: match[1], url: match[2] } : null;
    }).filter(Boolean);
    const photoLine = lines.find(l => l.startsWith("PHOTO;VALUE=URI:"));
    const photoUrl = photoLine ? photoLine.replace("PHOTO;VALUE=URI:", "") : null;

    return (
      <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-slate-100 mb-4">
            {photoUrl ? (
              <img src={photoUrl} alt="Business" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <Briefcase className="w-10 h-10" />
              </div>
            )}
          </div>
          <h4 className="text-xl font-bold text-slate-900">{companyName}</h4>
          <p className="text-sm font-semibold text-primary uppercase tracking-wider">{industry}</p>
          {caption && <p className="text-xs text-slate-500 mt-2 italic">"{caption}"</p>}
        </div>

        <div className="space-y-4">
          {location && (
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <RefreshCw className="w-4 h-4 text-primary mt-0.5" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Localização</span>
                <span className="text-sm text-slate-700">{location}</span>
              </div>
            </div>
          )}

          {hours.length > 0 && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Horário de Funcionamento</span>
              <div className="space-y-1">
                {hours.map((h, i) => (
                  <div key={i} className="flex justify-between text-xs text-slate-600">
                    <span>{h.split(": ")[0]}</span>
                    <span className="font-medium">{h.split(": ")[1]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-2">
            {phone && (
              <Button variant="outline" className="w-full justify-start h-10 rounded-lg text-xs" asChild>
                <a href={`tel:${phone}`}>
                  <RefreshCw className="w-3 h-3 mr-2 text-primary" />
                  {phone}
                </a>
              </Button>
            )}
            {email && (
              <Button variant="outline" className="w-full justify-start h-10 rounded-lg text-xs" asChild>
                <a href={`mailto:${email}`}>
                  <RefreshCw className="w-3 h-3 mr-2 text-primary" />
                  {email}
                </a>
              </Button>
            )}
            {website && (
              <Button variant="outline" className="w-full justify-start h-10 rounded-lg text-xs" asChild>
                <a href={website} target="_blank" rel="noopener noreferrer">
                  <Globe className="w-3 h-3 mr-2 text-primary" />
                  {website.replace(/^https?:\/\//, "")}
                </a>
              </Button>
            )}
          </div>

          {socials.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-3">Redes Sociais</span>
              <div className="flex flex-wrap gap-2">
                {socials.map((s: any, i: number) => (
                  <Button key={i} variant="secondary" size="sm" className="h-8 rounded-full text-[10px] px-3" asChild>
                    <a href={s.url} target="_blank" rel="noopener noreferrer">
                      <Share2 className="w-3 h-3 mr-1" />
                      {s.platform}
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderVCardPreview = (val: string) => {
    const lines = val.split("\n");
    const firstName = lines.find(l => l.startsWith("FN:"))?.replace("FN:", "").split(" ")[0] || "";
    const lastName = lines.find(l => l.startsWith("FN:"))?.replace("FN:", "").split(" ").slice(1).join(" ") || "";
    const phone = lines.find(l => l.startsWith("TEL:"))?.replace("TEL:", "") || "";
    const email = lines.find(l => l.startsWith("EMAIL:"))?.replace("EMAIL:", "") || "";
    const org = lines.find(l => l.startsWith("ORG:"))?.replace("ORG:", "") || "";
    const title = lines.find(l => l.startsWith("TITLE:"))?.replace("TITLE:", "") || "";
    const website = lines.find(l => l.startsWith("URL:"))?.replace("URL:", "") || "";
    const summary = lines.find(l => l.startsWith("NOTE:"))?.replace("NOTE:", "") || "";
    const socials = lines.filter(l => l.startsWith("X-SOCIAL-PROFILE;")).map(l => {
      const match = l.match(/TYPE=(.*?):(.*)/);
      return match ? { platform: match[1], url: match[2] } : null;
    }).filter(Boolean);
    const photoLine = lines.find(l => l.startsWith("PHOTO;VALUE=URI:"));
    const photoUrl = photoLine ? photoLine.replace("PHOTO;VALUE=URI:", "") : null;

    return (
      <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-100 mb-4">
            {photoUrl ? (
              <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <Layout className="w-10 h-10" />
              </div>
            )}
          </div>
          <h4 className="text-xl font-bold text-slate-900">{firstName} {lastName}</h4>
          {(title || org) && (
            <p className="text-sm text-slate-500">{title}{title && org ? " @ " : ""}{org}</p>
          )}
        </div>

        <div className="grid gap-3">
          {phone && (
            <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-slate-200 hover:bg-slate-50" asChild>
              <a href={`tel:${phone}`}>
                <RefreshCw className="w-4 h-4 mr-3 text-primary rotate-90" />
                <div className="flex flex-col items-start">
                  <span className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Telefone</span>
                  <span className="text-sm font-medium text-slate-700">{phone}</span>
                </div>
              </a>
            </Button>
          )}
          {email && (
            <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-slate-200 hover:bg-slate-50" asChild>
              <a href={`mailto:${email}`}>
                <RefreshCw className="w-4 h-4 mr-3 text-primary" />
                <div className="flex flex-col items-start">
                  <span className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">E-mail</span>
                  <span className="text-sm font-medium text-slate-700">{email}</span>
                </div>
              </a>
            </Button>
          )}
          {website && (
            <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-slate-200 hover:bg-slate-50" asChild>
              <a href={website} target="_blank" rel="noopener noreferrer">
                <RefreshCw className="w-4 h-4 mr-3 text-primary" />
                <div className="flex flex-col items-start">
                  <span className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Website</span>
                  <span className="text-sm font-medium text-slate-700">{website.replace(/^https?:\/\//, "")}</span>
                </div>
              </a>
            </Button>
          )}
          {summary && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Resumo</span>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">{summary}</p>
            </div>
          )}
          {socials && socials.length > 0 && (
            <div className="pt-4 mt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase mb-3 block">Redes Sociais</span>
              <div className="grid grid-cols-2 gap-2">
                {socials.map((s: any, i: number) => (
                  <Button key={i} variant="outline" size="sm" className="justify-start h-10 rounded-lg text-xs" asChild>
                    <a href={s.url} target="_blank" rel="noopener noreferrer">
                      <Share2 className="w-3 h-3 mr-2 text-primary" />
                      {s.platform}
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderUrlPreview = (val: string) => {
    return (
      <div className="w-full flex flex-col h-full bg-slate-50">
        {/* Browser Top Bar */}
        <div className="bg-slate-200/80 backdrop-blur-md border-b border-slate-300 px-4 py-3 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="flex-1 bg-white rounded-md h-7 flex items-center px-3 gap-2 border border-slate-300 shadow-sm overflow-hidden">
            <Globe className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="text-[10px] text-slate-600 font-medium truncate">
              {val}
            </span>
          </div>
          <RefreshCw className="w-3 h-3 text-slate-400" />
        </div>

        {/* Website Content Mockup */}
        <div className="flex-1 overflow-y-auto bg-white p-6 space-y-6">
          {/* Hero Section */}
          <div className="space-y-4">
            <div className="w-full aspect-video bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 shadow-inner">
              <Layout className="w-12 h-12 text-slate-200" />
            </div>
            <div className="space-y-2">
              <div className="h-6 bg-slate-100 rounded-md w-3/4" />
              <div className="h-3 bg-slate-50 rounded-md w-full" />
              <div className="h-3 bg-slate-50 rounded-md w-[90%]" />
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="aspect-square bg-slate-50 rounded-lg border border-slate-100" />
              <div className="h-2 bg-slate-100 rounded-full w-full" />
            </div>
            <div className="space-y-2">
              <div className="aspect-square bg-slate-50 rounded-lg border border-slate-100" />
              <div className="h-2 bg-slate-100 rounded-full w-full" />
            </div>
          </div>

          {/* Content Block */}
          <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-3">
             <div className="h-4 bg-primary/10 rounded-full w-1/2" />
             <div className="space-y-1.5">
               <div className="h-2 bg-slate-100 rounded-full w-full" />
               <div className="h-2 bg-slate-100 rounded-full w-full" />
               <div className="h-2 bg-slate-100 rounded-full w-2/3" />
             </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-full py-4"
    >
      {/* iPhone Mockup */}
      <div className="relative w-[300px] h-[620px] bg-slate-900 rounded-[3.5rem] border-[10px] border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-800 rounded-b-2xl z-20 flex items-center justify-center">
          <div className="w-12 h-1 bg-slate-700 rounded-full" />
        </div>

        {/* Screen Content */}
        <div className="flex-1 bg-white flex flex-col relative">
          {activeTab === "details" && value.startsWith("http") ? (
            <div className="absolute inset-0 z-10">
              {renderUrlPreview(value)}
            </div>
          ) : null}

          {/* Header/Tabs */}
          <div className="pt-12 px-6 pb-4 border-b border-slate-100 flex justify-center gap-4 bg-white">
            <button
              onClick={() => setActiveTab("qr")}
              className={`flex flex-col items-center gap-1 transition-colors ${
                activeTab === "qr" ? "text-primary" : "text-slate-400"
              }`}
            >
              <Layout className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">QR Code</span>
              {activeTab === "qr" && (
                <motion.div layoutId="tab-indicator" className="w-full h-0.5 bg-primary rounded-full mt-1" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`flex flex-col items-center gap-1 transition-colors ${
                activeTab === "details" ? "text-primary" : "text-slate-400"
              }`}
            >
              <Eye className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Detalhes</span>
              {activeTab === "details" && (
                <motion.div layoutId="tab-indicator" className="w-full h-0.5 bg-primary rounded-full mt-1" />
              )}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col items-center">
            <AnimatePresence mode="wait">
              {activeTab === "qr" ? (
                <motion.div
                  key="qr-tab"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="w-full flex flex-col items-center"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900 font-display">Seu QR Code</h3>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Digitalize agora</p>
                  </div>
                  
                  <div 
                    id="qr-code-element"
                    className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 mb-6 w-full aspect-square flex items-center justify-center"
                  >
                    <QRCodeSVG
                      value={value}
                      size={200}
                      level="H"
                      includeMargin={true}
                      className="w-full h-auto"
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="details-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="w-full space-y-4"
                >
                  {!value.startsWith("http") && (
                    <>
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-slate-900 font-display">Conteúdo</h3>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Dados codificados</p>
                      </div>

                      <div className="space-y-4 text-left w-full">
                        {value.includes("TITLE:") && value.includes("ORG:") ? (
                          renderBusinessPreview(value)
                        ) : value.startsWith("BEGIN:VCARD") ? (
                          renderVCardPreview(value)
                        ) : (
                          <>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Tipo de Dado</span>
                              <p className="text-sm font-semibold text-slate-700">{getContentType(value)}</p>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 overflow-hidden">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Valor do Conteúdo</span>
                              <p className="text-sm text-slate-600 break-all leading-relaxed whitespace-pre-wrap mt-1">
                                {value}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col w-full gap-3 mt-auto mb-8 pt-6 z-20">
              <Button 
                onClick={onDownload}
                className="w-full h-11 text-sm rounded-xl" 
                size="default"
              >
                <Download className="mr-2 h-4 w-4" />
                Baixar PNG
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  onClick={onReset}
                  className="w-full h-11 text-xs rounded-xl"
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Novo
                </Button>
                <Button 
                  variant="secondary"
                  className="w-full h-11 text-xs rounded-xl"
                  onClick={() => {
                    navigator.clipboard.writeText(value);
                  }}
                >
                  <Share2 className="mr-1 h-3 w-3" />
                  Copiar
                </Button>
              </div>
            </div>
          </div>

          {/* Home Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-slate-200 rounded-full z-20" />
        </div>
      </div>
    </motion.div>
  );
}

import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, AlertTriangle, Globe, MessageCircle, FileText, User, Video, Instagram, Facebook, Smartphone, Search, MoreHorizontal } from "lucide-react";
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
  const previewUrl = typeof value === 'object' ? (value.url || value.fileUrl || "") : value;
  
  const qrValue = typeof value === 'string' ? value : JSON.stringify(value);
  
  // QR Code standard limit is around 4296 characters for alphanumeric
  // Base64 encoded PDFs can easily exceed this.
  const isTooLong = qrValue.length > 2953; // Alphanumeric limit for level M is ~2.9k

  // Determine if it's a "real-time preview" (incomplete data)
  const isUrlType = value?.type === 'url' || value?.type === 'video' || value?.type === 'facebook' || value?.type === 'instagram' || value?.type === 'pdf';
  const hasMinData = isUrlType ? !!value?.url : (value?.type === 'whatsapp' ? !!value?.phone : (value?.type === 'links' ? !!value?.title || (value?.links && value?.links.length > 0 && value?.links[0].url) : true));

  const renderSimulation = () => {
    if (isLinkTree && hasMinData) {
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
      case 'video':
        const url = previewUrl || "";
        const displayUrl = url.replace(/^https?:\/\//, '').split('/')[0] || "https://online-qr-generator.com";
        return (
          <div className="w-full h-full bg-white flex flex-col animate-in fade-in duration-500 overflow-hidden">
            {/* Browser Header Area - More like the mockup */}
            <div className="bg-[#FF8A3D] pt-12 pb-4 px-4 flex flex-col gap-3">
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
                <span className="text-[13px] text-white font-medium truncate flex-1">{url || "https://online-qr-generator.com"}</span>
              </div>
            </div>
            
            {/* Content Area */}
            <div className="flex-1 bg-white flex flex-col relative overflow-hidden">
              <div className="p-4 space-y-4">
                <div className="w-full aspect-[4/5] bg-slate-200 rounded-lg flex items-center justify-center">
                   {value.type === 'facebook' ? <Facebook className="w-12 h-12 text-slate-400" /> : 
                    value.type === 'instagram' ? <Instagram className="w-12 h-12 text-slate-400" /> :
                    value.type === 'video' ? <Video className="w-12 h-12 text-slate-400" /> :
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

              {url && (
                <div className="absolute inset-0 bg-white">
                  <iframe 
                    src={url.startsWith('http') ? url : `https://${url}`} 
                    className="w-full h-full border-0"
                    title="Safari Preview"
                  />
                </div>
              )}
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

      case 'pdf':
        return (
          <div className="w-full h-full bg-slate-100 flex flex-col animate-in fade-in duration-500 overflow-hidden">
             <div className="bg-white pt-12 pb-4 px-4 flex items-center justify-between border-b">
              <span className="text-[12px] font-bold">9:41</span>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-red-500" />
                <span className="text-[10px] font-bold text-slate-600 truncate max-w-[120px]">{value.url?.split('/').pop() || "documento.pdf"}</span>
              </div>
              <Download className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="flex-1 p-6 flex flex-col items-center justify-center gap-4">
              <div className="w-44 h-64 bg-white shadow-xl rounded-sm flex flex-col p-4 gap-2 border">
                <div className="w-full h-4 bg-slate-100 rounded-sm" />
                <div className="w-3/4 h-3 bg-slate-50 rounded-sm" />
                <div className="w-full h-2 bg-slate-50 rounded-sm" />
                <div className="w-full h-2 bg-slate-50 rounded-sm" />
                <div className="w-full h-2 bg-slate-50 rounded-sm" />
                <div className="mt-auto w-12 h-12 self-center border-4 border-slate-100 rounded-full" />
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">PDF Preview</p>
            </div>
          </div>
        );

      default:
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
      {/* Top Tabs - Mockup Style */}
      <div className="flex bg-[#F2F2F7] p-1 rounded-full w-full max-w-[240px] border border-slate-200 mt-2">
        <button
          onClick={() => setShowQr(false)}
          className={`flex-1 py-1.5 px-3 rounded-full text-[11px] font-bold transition-all ${!showQr ? 'bg-[#2ECC71] text-white shadow-sm' : 'text-[#2ECC71]'}`}
        >
          Pré-visualização
        </button>
        <button
          onClick={() => setShowQr(true)}
          className={`flex-1 py-1.5 px-3 rounded-full text-[11px] font-bold transition-all ${showQr ? 'bg-[#2ECC71] text-white shadow-sm' : 'text-[#2ECC71]'}`}
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

      <div className="flex flex-col gap-3 w-full mt-4">
        <Button 
          onClick={onDownload} 
          className="w-full h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
          disabled={isTooLong}
          data-testid="button-download-qr"
        >
          <Download className="mr-2 h-5 w-5" />
          Baixar PNG
        </Button>
        <Button 
          variant="outline" 
          onClick={onReset} 
          className="w-full h-12 rounded-xl font-bold border-2"
          data-testid="button-reset-qr"
        >
          <RefreshCw className="mr-2 h-5 w-5" />
          Criar outro
        </Button>
      </div>
    </div>
  );
}

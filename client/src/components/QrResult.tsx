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
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
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
        const url = value.url;
        const displayUrl = url ? url.replace(/^https?:\/\//, '').split('/')[0] : "google.com";
        return (
          <div className="w-full h-full bg-slate-100 flex flex-col rounded-2xl overflow-hidden animate-in fade-in duration-500">
            <div className="bg-slate-200/80 p-3 flex items-center gap-2 border-b border-slate-300">
              <div className="flex gap-1.5 mr-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              </div>
              <div className="flex-1 bg-white rounded-md py-1 px-3 flex items-center justify-between shadow-sm">
                <span className="text-[10px] text-slate-500 truncate">{displayUrl}</span>
                <RefreshCw className="w-2.5 h-2.5 text-slate-400" />
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                {value.type === 'facebook' ? <Facebook className="w-8 h-8 text-primary" /> : 
                 value.type === 'instagram' ? <Instagram className="w-8 h-8 text-primary" /> :
                 value.type === 'video' ? <Video className="w-8 h-8 text-primary" /> :
                 <Globe className="w-8 h-8 text-primary" />}
              </div>
              <h4 className="font-bold text-slate-800 mb-2 truncate w-full px-4">{value.url ? "Carregando site..." : "Aguardando URL..."}</h4>
              <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                <div className={`h-full bg-primary/40 ${value.url ? 'w-1/2 animate-pulse' : 'w-0'}`} />
              </div>
              <p className="text-[10px] text-slate-400">Preview simulador de navegador</p>
            </div>
            <div className="bg-slate-100 p-3 flex justify-around border-t border-slate-200">
              <Search className="w-4 h-4 text-slate-400" />
              <div className="w-4 h-4 rounded-sm border border-slate-400" />
              <MoreHorizontal className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        );

      case 'whatsapp':
        return (
          <div className="w-full h-full bg-[#E5DDD5] flex flex-col rounded-2xl overflow-hidden animate-in fade-in duration-500">
            <div className="bg-[#075E54] p-4 flex items-center gap-3 text-white">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="font-bold text-xs truncate">{value.phone || "Número WhatsApp"}</p>
                <p className="text-[10px] opacity-80">visto por último hoje às 12:00</p>
              </div>
              <Video className="w-4 h-4" />
            </div>
            <div className="flex-1 p-4 flex flex-col justify-end gap-2">
              <div className="self-end bg-[#DCF8C6] p-3 rounded-lg rounded-tr-none shadow-sm max-w-[80%]">
                <p className="text-[11px] text-slate-800">{value.message || "Olá! Gostaria de mais informações."}</p>
                <p className="text-[9px] text-slate-500 text-right mt-1">12:01</p>
              </div>
            </div>
            <div className="bg-white p-3 flex items-center gap-2">
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
          <div className="w-full h-full bg-slate-200 flex flex-col rounded-2xl overflow-hidden animate-in fade-in duration-500">
            <div className="bg-slate-800 p-3 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-red-500" />
                <span className="text-[10px] font-medium truncate max-w-[120px]">{value.url?.split('/').pop() || "documento.pdf"}</span>
              </div>
              <Download className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 p-6 flex flex-col items-center justify-center gap-4 bg-slate-500/10">
              <div className="w-40 h-56 bg-white shadow-lg rounded-sm flex flex-col p-4 gap-2">
                <div className="w-full h-4 bg-slate-100 rounded-sm" />
                <div className="w-3/4 h-3 bg-slate-50 rounded-sm" />
                <div className="w-full h-2 bg-slate-50 rounded-sm" />
                <div className="w-full h-2 bg-slate-50 rounded-sm" />
                <div className="w-full h-2 bg-slate-50 rounded-sm" />
                <div className="mt-auto w-12 h-12 self-center border-4 border-slate-100 rounded-full" />
              </div>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Visualização de PDF</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
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
    <div className="flex flex-col items-center gap-6 w-full h-full">
      <div className="flex-1 w-full relative group">
        <div className={`w-full h-full flex flex-col transition-all duration-500 ${showQr ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
          {renderSimulation()}
        </div>

        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ${showQr ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
          <div id="qr-code-element" className="bg-white p-6 rounded-3xl shadow-xl border border-border">
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
        
        {/* Toggle View Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowQr(!showQr)}
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full h-8 px-4 text-[10px] font-bold uppercase tracking-wider shadow-lg hover-elevate z-10"
        >
          {showQr ? "Ver Simulação" : "Ver Código QR"}
        </Button>
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

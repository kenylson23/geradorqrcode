import { QRCodeSVG } from "qrcode.react";
import { Download, RefreshCw, Share2, Eye, Layout } from "lucide-react";
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
    if (val.startsWith("http")) return "Link Web";
    if (val.startsWith("mailto:")) return "E-mail";
    if (val.startsWith("tel:")) return "Telefone";
    if (val.startsWith("WIFI:")) return "Rede Wi-Fi";
    return "Texto Simples";
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
        <div className="flex-1 bg-white flex flex-col">
          {/* Header/Tabs */}
          <div className="pt-12 px-6 pb-4 border-b border-slate-100 flex justify-center gap-4">
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
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900 font-display">Conteúdo</h3>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Dados codificados</p>
                  </div>

                  <div className="space-y-4 text-left w-full">
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
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col w-full gap-3 mt-auto mb-8 pt-6">
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
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-slate-200 rounded-full" />
        </div>
      </div>
    </motion.div>
  );
}

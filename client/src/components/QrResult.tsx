import { QRCodeSVG } from "qrcode.react";
import { Download, RefreshCw, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface QrResultProps {
  value: string;
  onDownload: () => void;
  onReset: () => void;
}

export function QrResult({ value, onDownload, onReset }: QrResultProps) {
  if (!value) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px]">
        {/* iPhone Mockup for Empty State */}
        <div className="relative w-[280px] h-[580px] bg-slate-900 rounded-[3rem] border-8 border-slate-800 shadow-2xl p-4 overflow-hidden flex flex-col items-center justify-center">
          <div className="absolute top-0 w-32 h-6 bg-slate-800 rounded-b-2xl z-20" />
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <RefreshCw className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Aguardando geração</h3>
          <p className="text-xs text-slate-400 max-w-[180px] text-center">
            Preencha o formulário e clique em "Gerar" para ver seu QR Code aqui.
          </p>
        </div>
      </div>
    );
  }

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
        <div className="flex-1 bg-white p-6 pt-12 flex flex-col items-center">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-slate-900 font-display">Seu QR Code</h3>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Pronto para uso</p>
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

          <div className="flex flex-col w-full gap-3 mt-auto mb-8">
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

          {/* Home Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-slate-200 rounded-full" />
        </div>
      </div>
    </motion.div>
  );
}

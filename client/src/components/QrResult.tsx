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
      <Card className="h-full flex flex-col items-center justify-center p-8 text-center bg-secondary/30 border-dashed border-2 min-h-[400px]">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <RefreshCw className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Aguardando geração</h3>
        <p className="text-sm text-muted-foreground max-w-[250px]">
          Preencha o formulário e clique em "Gerar" para ver seu QR Code aqui.
        </p>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, type: "spring" }}
      className="h-full"
    >
      <Card className="h-full flex flex-col items-center p-8 bg-white shadow-xl shadow-primary/5 border-primary/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-green-400" />
        
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-foreground font-display">Seu QR Code</h3>
          <p className="text-muted-foreground">Pronto para uso imediato</p>
        </div>

        <div 
          id="qr-code-element"
          className="p-6 bg-white rounded-2xl shadow-sm border border-border mb-8 transform hover:scale-105 transition-transform duration-300"
        >
          <QRCodeSVG
            value={value}
            size={256}
            level="H"
            includeMargin={true}
            className="w-full h-auto max-w-[256px]"
          />
        </div>

        <div className="flex flex-col w-full gap-3 mt-auto">
          <Button 
            onClick={onDownload}
            className="w-full h-12 text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300" 
            size="lg"
          >
            <Download className="mr-2 h-5 w-5" />
            Baixar PNG
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              onClick={onReset}
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Novo
            </Button>
            <Button 
              variant="secondary"
              className="w-full text-primary bg-primary/10 hover:bg-primary/20 border-primary/10"
              onClick={() => {
                navigator.clipboard.writeText(value);
                // Would add a toast here in a full app
              }}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Copiar
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

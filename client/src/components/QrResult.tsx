import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface QrResultProps {
  value: string;
  onDownload: () => void;
  onReset: () => void;
}

export function QrResult({ value, onDownload, onReset }: QrResultProps) {
  // QR Code standard limit is around 4296 characters for alphanumeric
  // Base64 encoded PDFs can easily exceed this.
  const isTooLong = value.length > 2953; // Alphanumeric limit for level M is ~2.9k

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div id="qr-code-element" className="bg-white p-4 rounded-2xl shadow-inner border border-border">
        {isTooLong ? (
          <div className="w-48 h-48 flex flex-col items-center justify-center text-destructive bg-destructive/5 rounded-xl border border-destructive/20 p-4">
            <AlertTriangle className="w-10 h-10 mb-2" />
            <span className="text-[10px] font-bold text-center uppercase tracking-wider">Dados muito longos</span>
          </div>
        ) : (
          <QRCodeSVG
            value={value}
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
        )}
      </div>

      {isTooLong && (
        <Alert variant="destructive" className="border-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro: Arquivo muito grande</AlertTitle>
          <AlertDescription className="text-xs">
            O conteúdo deste arquivo excede o limite de um QR Code (máx ~3KB). 
            Tente usar um arquivo menor ou use a opção de "URL" para arquivos na nuvem.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-3 w-full">
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

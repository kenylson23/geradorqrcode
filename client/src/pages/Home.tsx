import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, CheckCircle2, QrCode } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { QrForm } from "@/components/QrForm";
import { QrResult } from "@/components/QrResult";
import { useQrGenerator } from "@/hooks/use-qr-generator";

export default function Home() {
  const { qrData, generate, download, reset } = useQrGenerator();
  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [objectPath, setObjectPath] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Arquivo muito grande",
          description: "O limite máximo é de 10MB.",
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Using the new Cloudinary endpoint (Netlify Function-like)
      const res = await fetch("/api/cloudinary-upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Falha no upload");
      }

      const { url } = await res.json();

      setObjectPath(url);
      toast({
        title: "Sucesso!",
        description: "Arquivo enviado com sucesso para o Cloudinary.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro no upload",
        description: error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <Header currentStep={currentStep} />

      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Form and Selection */}
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white rounded-3xl p-8 border border-border shadow-sm">
                <QrForm 
                  onGenerate={(data) => {
                    generate(data);
                    setCurrentStep(3);
                  }} 
                  onStepChange={setCurrentStep}
                />
              </div>

              {/* Upload Section Integrated */}
              <Card className="rounded-3xl border-border shadow-sm hover-elevate">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Upload className="w-6 h-6 text-primary" />
                    Upload de Arquivos para o Servidor
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid w-full items-center gap-1.5">
                    <Input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="cursor-pointer rounded-xl h-12"
                      data-testid="input-file-upload"
                    />
                    <p className="text-sm text-muted-foreground">
                      Limite de 10MB por arquivo. Armazenamento seguro no servidor.
                    </p>
                  </div>

                  {file && (
                    <div className="flex items-center gap-3 p-4 bg-muted rounded-2xl border">
                      <FileText className="w-5 h-5 text-primary" />
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        onClick={handleUpload}
                        disabled={uploading}
                        size="sm"
                        className="rounded-xl"
                        data-testid="button-upload-confirm"
                      >
                        {uploading ? "Enviando..." : "Confirmar Upload"}
                      </Button>
                    </div>
                  )}

                  {objectPath && (
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-2xl">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="font-medium">Upload Concluído</span>
                      </div>
                      <p className="text-xs font-mono break-all text-green-600 dark:text-green-500 mb-3">
                        Caminho: {objectPath}
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="rounded-xl"
                          asChild
                        >
                          <a href={objectPath} target="_blank" rel="noreferrer">
                            Ver Arquivo
                          </a>
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => {
                            const fullUrl = window.location.origin + objectPath;
                            generate(fullUrl);
                            setCurrentStep(3);
                            toast({
                              title: "QR Code Gerado",
                              description: "QR Code gerado para o link do arquivo.",
                            });
                          }}
                        >
                          <QrCode className="w-4 h-4 mr-2" />
                          Gerar QR Code
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Mobile Preview */}
            <div className="lg:col-span-4 sticky top-24">
              <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-2xl">
                <div className="h-[32px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg"></div>
                <div className="h-[46px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
                <div className="h-[46px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
                <div className="h-[64px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
                <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white flex flex-col items-center justify-center p-6 text-center">
                  {qrData ? (
                    <div className="w-full flex flex-col items-center animate-in fade-in zoom-in duration-300">
                      <QrResult 
                        value={qrData} 
                        onDownload={() => download("qr-code-element")}
                        onReset={reset}
                      />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="w-48 h-48 mx-auto border-2 border-dashed border-muted rounded-2xl flex items-center justify-center bg-muted/20">
                        <div className="text-muted-foreground text-sm flex flex-col items-center gap-2">
                          <div className="w-24 h-24 opacity-20 bg-foreground rounded-lg"></div>
                          <span>Seu QR Code aparecerá aqui</span>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-foreground">
                        Selecione um tipo de código QR à esquerda.
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Escolha entre site, PDF, vCard e muito mais para começar.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

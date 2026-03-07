import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { QrForm } from "@/components/QrForm";
import { QrResult } from "@/components/QrResult";
import { useQrGenerator } from "@/hooks/use-qr-generator";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";

export default function Home() {
  const { qrData, generate, download, reset } = useQrGenerator();
  const [currentStep, setCurrentStep] = useState(1);
  const [showQr, setShowQr] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans pb-40">
      <Header currentStep={currentStep} />

      <main className="flex-grow container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Form and Selection */}
            <div className="lg:col-span-7 space-y-6">
              <QrForm 
                onGenerate={(data) => {
                  generate(data);
                  if (currentStep < 2) setCurrentStep(2);
                }} 
                onStepChange={setCurrentStep}
              />
              
              {/* Action Buttons */}
              {qrData && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button 
                    onClick={() => download("qr-code-element")} 
                    className="h-12 rounded-xl font-bold bg-[#2ECC71] hover:bg-[#27ae60] text-white shadow-lg shadow-[#2ECC71]/20 transition-all active:scale-[0.98]"
                    data-testid="button-download-qr"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Baixar PNG
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={reset} 
                    className="h-12 rounded-xl font-bold border-2 text-slate-500 hover:text-[#2ECC71] hover:border-[#2ECC71] transition-all active:scale-[0.98]"
                    data-testid="button-reset-qr"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Criar outro
                  </Button>
                </div>
              )}
            </div>

            {/* Right Column: Mobile Preview */}
            <div className="hidden lg:block lg:fixed lg:right-8 lg:top-24 lg:w-80 z-40">
              {/* Control Tabs - Outside Mockup */}
              {qrData && (
                <div className="flex gap-3 justify-center mb-6">
                  <button
                    onClick={() => setShowQr(false)}
                    className={`px-6 py-3 rounded-full text-[14px] font-bold transition-all ${!showQr ? 'bg-[#8B5CF6] text-white shadow-lg' : 'bg-slate-200 text-slate-400 hover:text-slate-600'}`}
                    data-testid="button-tab-preview"
                  >
                    Pré-visualização
                  </button>
                  <button
                    onClick={() => setShowQr(true)}
                    className={`px-6 py-3 rounded-full text-[14px] font-bold transition-all ${showQr ? 'bg-[#8B5CF6] text-white shadow-lg' : 'bg-slate-200 text-slate-400 hover:text-slate-600'}`}
                    data-testid="button-tab-qr"
                  >
                    Código QR
                  </button>
                </div>
              )}

              <div className="relative mx-auto border-[#222222] bg-[#222222] border-[10px] rounded-[3rem] h-[550px] w-[240px] shadow-2xl overflow-visible">
                {/* iPhone Frame Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-xl z-50 flex items-center justify-center">
                  <div className="w-10 h-2.5 bg-[#111] rounded-full"></div>
                </div>
                
                <div className="h-[28px] w-[2.5px] bg-gray-800 absolute -left-[12.5px] top-[130px] rounded-l-lg border-l border-white/10"></div>
                <div className="h-[44px] w-[2.5px] bg-gray-800 absolute -left-[12.5px] top-[210px] rounded-l-lg border-l border-white/10"></div>
                <div className="h-[44px] w-[2.5px] bg-gray-800 absolute -left-[12.5px] top-[290px] rounded-l-lg border-l border-white/10"></div>
                <div className="h-[70px] w-[2.5px] bg-gray-800 absolute -right-[12.5px] top-[240px] rounded-r-lg border-r border-white/10"></div>

                <div className="rounded-[2.4rem] overflow-hidden w-full h-full bg-white flex flex-col relative">
                  {qrData ? (
                    <div className="w-full h-full flex flex-col items-center animate-in fade-in zoom-in duration-300 scale-95 origin-top">
                      <QrResult 
                        value={qrData}
                        showQr={showQr}
                        setShowQr={setShowQr}
                      />
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6 text-center">
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

                  {/* Home Indicator */}
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-black rounded-full z-50 opacity-20"></div>
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

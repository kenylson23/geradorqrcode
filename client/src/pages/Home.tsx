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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <Header currentStep={currentStep} />

      <main className="flex-grow pb-56">
        <div className="max-w-7xl mx-auto px-6 py-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Column: Form (6 columns) */}
            <div className="lg:col-span-6">
              <QrForm 
                onGenerate={(data) => {
                  generate(data);
                  if (currentStep < 2) setCurrentStep(2);
                }} 
                onStepChange={setCurrentStep}
              />
            </div>

            {/* Right Column: Mockup (6 columns) - Desktop only */}
            <div className="hidden lg:flex lg:col-span-6 flex-col items-center justify-start sticky top-8 h-fit">
              {/* Control Tabs */}
              {qrData && (
                <div className="flex gap-3 justify-center mb-4">
                  <button
                    onClick={() => setShowQr(false)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${!showQr ? 'bg-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/30' : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-700'}`}
                    data-testid="button-tab-preview"
                  >
                    Pré-visualização
                  </button>
                  <button
                    onClick={() => setShowQr(true)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${showQr ? 'bg-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/30' : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-700'}`}
                    data-testid="button-tab-qr"
                  >
                    Código QR
                  </button>
                </div>
              )}

              {/* iPhone Mockup */}
              <div className="relative border-[#222222] bg-[#222222] border-[10px] rounded-[3rem] h-[460px] w-[260px] shadow-2xl overflow-hidden flex flex-col flex-shrink-0">
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
                    <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4 text-center">
                      <div className="w-40 h-40 mx-auto border-2 border-dashed border-muted rounded-2xl flex items-center justify-center bg-muted/20">
                        <div className="text-muted-foreground text-xs flex flex-col items-center gap-2">
                          <div className="w-20 h-20 opacity-20 bg-foreground rounded-lg"></div>
                          <span>QR aparecerá aqui</span>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-foreground">
                        Selecione um tipo
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        de QR Code à esquerda
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

      {/* Fixed Bottom Navigation */}
      {qrData && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 shadow-lg py-4 px-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Button 
              variant="outline"
              onClick={reset}
              className="h-11 px-8 rounded-xl font-semibold border-2 border-slate-300 text-slate-600 hover:text-slate-700 hover:border-slate-400 transition-all active:scale-95"
              data-testid="button-back"
            >
              ← Voltar
            </Button>
            
            <div className="flex gap-3">
              <Button 
                onClick={() => download("qr-code-element")} 
                className="h-11 px-8 rounded-xl font-semibold bg-[#2ECC71] hover:bg-[#27ae60] text-white shadow-lg shadow-[#2ECC71]/20 transition-all active:scale-95"
                data-testid="button-download-qr"
              >
                <Download className="mr-2 h-4 w-4" />
                Download PNG
              </Button>
              <Button 
                className="h-11 px-8 rounded-xl font-semibold bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-lg shadow-[#8B5CF6]/20 transition-all active:scale-95"
                data-testid="button-next"
              >
                Próximo →
              </Button>
            </div>
          </div>
        </div>
      )}

      {!qrData && <Footer />}
    </div>
  );
}

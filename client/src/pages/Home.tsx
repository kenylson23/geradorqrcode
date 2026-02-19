import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { QrForm } from "@/components/QrForm";
import { QrResult } from "@/components/QrResult";
import { useQrGenerator } from "@/hooks/use-qr-generator";

export default function Home() {
  const { qrData, generate, download, reset } = useQrGenerator();
  const [currentStep, setCurrentStep] = useState(1);

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
                    if (currentStep < 2) setCurrentStep(2);
                  }} 
                  onStepChange={setCurrentStep}
                />
              </div>
            </div>

            {/* Right Column: Mobile Preview */}
            <div className="lg:col-span-4 sticky top-24">
              <div className="relative mx-auto border-[#222222] bg-[#222222] border-[12px] rounded-[3.5rem] h-[720px] w-[340px] shadow-2xl overflow-visible">
                {/* iPhone Frame Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-b-2xl z-50 flex items-center justify-center">
                  <div className="w-12 h-3 bg-[#111] rounded-full"></div>
                </div>
                
                <div className="h-[32px] w-[3px] bg-gray-800 absolute -left-[15px] top-[100px] rounded-l-lg border-l border-white/10"></div>
                <div className="h-[50px] w-[3px] bg-gray-800 absolute -left-[15px] top-[160px] rounded-l-lg border-l border-white/10"></div>
                <div className="h-[50px] w-[3px] bg-gray-800 absolute -left-[15px] top-[220px] rounded-l-lg border-l border-white/10"></div>
                <div className="h-[80px] w-[3px] bg-gray-800 absolute -right-[15px] top-[180px] rounded-r-lg border-r border-white/10"></div>

                <div className="rounded-[2.8rem] overflow-hidden w-full h-full bg-white flex flex-col relative">
                  {qrData ? (
                    <div className="w-full h-full flex flex-col items-center animate-in fade-in zoom-in duration-300">
                      <QrResult 
                        value={qrData} 
                        onDownload={() => download("qr-code-element")}
                        onReset={reset}
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

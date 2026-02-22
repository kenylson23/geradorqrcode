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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans pb-24">
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
            </div>

            {/* Right Column: Mobile Preview */}
            <div className="lg:col-span-5 sticky top-24">
              <div className="relative mx-auto border-[#222222] bg-[#222222] border-[10px] rounded-[3rem] h-[640px] w-[300px] shadow-2xl overflow-visible">
                {/* iPhone Frame Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-xl z-50 flex items-center justify-center">
                  <div className="w-10 h-2.5 bg-[#111] rounded-full"></div>
                </div>
                
                <div className="h-[28px] w-[2.5px] bg-gray-800 absolute -left-[12.5px] top-[90px] rounded-l-lg border-l border-white/10"></div>
                <div className="h-[44px] w-[2.5px] bg-gray-800 absolute -left-[12.5px] top-[145px] rounded-l-lg border-l border-white/10"></div>
                <div className="h-[44px] w-[2.5px] bg-gray-800 absolute -left-[12.5px] top-[200px] rounded-l-lg border-l border-white/10"></div>
                <div className="h-[70px] w-[2.5px] bg-gray-800 absolute -right-[12.5px] top-[165px] rounded-r-lg border-r border-white/10"></div>

                <div className="rounded-[2.4rem] overflow-hidden w-full h-full bg-white flex flex-col relative">
                  {qrData ? (
                    <div className="w-full h-full flex flex-col items-center animate-in fade-in zoom-in duration-300 scale-95 origin-top">
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

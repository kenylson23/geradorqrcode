import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { QrForm } from "@/components/QrForm";
import { QrResult } from "@/components/QrResult";
import { useQrGenerator } from "@/hooks/use-qr-generator";
import { useState } from "react";

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
            <div className="lg:col-span-8">
              <div className="bg-white rounded-3xl p-8 border border-border shadow-sm">
                <QrForm 
                  onGenerate={(data) => {
                    generate(data);
                    setCurrentStep(3);
                  }} 
                  onStepChange={setCurrentStep}
                />
              </div>
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

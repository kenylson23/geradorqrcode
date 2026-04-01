import { useState, type ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { QrForm } from "@/components/QrForm";
import { QrResult } from "@/components/QrResult";
import { QrDesign, defaultDesign, type QrDesignSettings } from "@/components/QrDesign";
import { useQrGenerator } from "@/hooks/use-qr-generator";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Download, ChevronDown, ImageIcon, FileText, Code, Check,
  MousePointerClick, Palette, Share2,
  RefreshCw, BarChart2, Paintbrush, FileImage, FileDown, Gift,
  ArrowRight,
} from "lucide-react";

const QR_ELEMENT_ID = "qr-code-element";

type DownloadFormat = "png" | "svg" | "pdf";

const FORMAT_META: Record<DownloadFormat, { label: string; desc: string; icon: ReactNode }> = {
  png: { label: "PNG", desc: "Alta resolução",        icon: <ImageIcon className="h-4 w-4 text-blue-500" /> },
  svg: { label: "SVG", desc: "Vectorial, escalável",  icon: <Code className="h-4 w-4 text-orange-500" /> },
  pdf: { label: "PDF", desc: "Documento A4",          icon: <FileText className="h-4 w-4 text-red-500" /> },
};

const SIZE_OPTIONS: { label: string; value: number; desc: string }[] = [
  { label: "512 px",  value: 512,  desc: "Web / redes sociais" },
  { label: "1024 px", value: 1024, desc: "Padrão (recomendado)" },
  { label: "2048 px", value: 2048, desc: "Impressão pequena" },
  { label: "4096 px", value: 4096, desc: "Impressão grande" },
];

export default function Home() {
  const { qrData, generate, downloadPng, downloadSvg, downloadPdf, reset } = useQrGenerator();
  const [currentStep, setCurrentStep] = useState(1);
  const [showQr, setShowQr] = useState(true);
  const [selectedFormat, setSelectedFormat] = useState<DownloadFormat>("png");
  const [downloadSize, setDownloadSize] = useState(1024);
  const [design, setDesign] = useState<QrDesignSettings>(defaultDesign);

  const handleDownload = () => {
    if (selectedFormat === "svg") downloadSvg(QR_ELEMENT_ID, downloadSize);
    else if (selectedFormat === "pdf") downloadPdf(QR_ELEMENT_ID, design, downloadSize);
    else downloadPng(QR_ELEMENT_ID, design, downloadSize);
  };

  const handleNext = () => {
    if (currentStep === 2) {
      setCurrentStep(3);
      setShowQr(true);
    }
  };

  const handleBack = () => {
    if (currentStep === 3) {
      setCurrentStep(2);
      setShowQr(false);
    } else {
      reset();
      if ((window as any).qrFormRef?.handleBack) {
        (window as any).qrFormRef.handleBack();
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <Header currentStep={currentStep} />

      <main id="criar" className="flex-grow pb-24">
        <div className="max-w-7xl mx-auto px-6 py-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Column: Form or Design (6 columns) */}
            <div className="lg:col-span-6 pb-56">
              {currentStep < 3 ? (
                <QrForm 
                  onGenerate={(data) => {
                    generate(data);
                    if (currentStep < 2) setCurrentStep(2);
                  }} 
                  onStepChange={setCurrentStep}
                  ref={(instance) => {
                    if (instance) {
                      (window as any).qrFormRef = instance;
                    }
                  }}
                />
              ) : (
                <QrDesign design={design} onChange={setDesign} />
              )}
            </div>

            {/* Right Column: Mockup (6 columns) - Desktop only - Fixed Position */}
            <div className="hidden lg:flex lg:col-span-6 flex-col items-center justify-start fixed right-0 top-16 w-1/2 pointer-events-none" style={{paddingBottom: qrData ? '96px' : '0'}}>

              {/* Control Tabs */}
              {qrData && (
                <div className="flex gap-3 justify-center mb-4 pointer-events-auto">
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
              <div className="relative border-[#222222] bg-[#222222] border-[10px] rounded-[3rem] h-[460px] w-[260px] shadow-2xl overflow-hidden flex flex-col flex-shrink-0 pointer-events-auto">
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
                    <div className="w-full h-full flex flex-col items-center animate-in fade-in zoom-in duration-300">
                      <QrResult 
                        value={qrData}
                        showQr={showQr}
                        setShowQr={setShowQr}
                        design={design}
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
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 shadow-lg py-2 px-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Button 
              variant="outline"
              onClick={handleBack}
              className="h-9 px-6 rounded-xl font-semibold border-2 border-slate-300 text-slate-600 hover:text-slate-700 hover:border-slate-400 transition-all active:scale-95"
              data-testid="button-back"
            >
              ← Voltar
            </Button>
            
            <div className="flex gap-2 items-center">
              {/* Download controls — only on step 3 */}
              {currentStep === 3 && (
                <>
                  {/* Size picker */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-9 px-3 rounded-xl border-2 border-slate-200 text-slate-600 text-xs font-semibold hover:border-slate-300 gap-1"
                        data-testid="button-download-size"
                      >
                        {SIZE_OPTIONS.find(s => s.value === downloadSize)?.label ?? "1024 px"}
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuLabel className="text-xs text-muted-foreground">Tamanho do ficheiro</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {SIZE_OPTIONS.map(sz => (
                        <DropdownMenuItem
                          key={sz.value}
                          className="cursor-pointer gap-2"
                          onClick={() => setDownloadSize(sz.value)}
                          data-testid={`menu-size-${sz.value}`}
                        >
                          <div className="flex-1">
                            <div className="font-medium">{sz.label}</div>
                            <div className="text-[11px] text-muted-foreground">{sz.desc}</div>
                          </div>
                          {downloadSize === sz.value && <Check className="h-3.5 w-3.5 text-[#2ECC71]" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Format + Download split button */}
                  <div className="flex rounded-xl overflow-hidden shadow-lg shadow-[#2ECC71]/20">
                    <Button
                      onClick={handleDownload}
                      className="h-9 px-5 rounded-none rounded-l-xl font-semibold bg-[#2ECC71] hover:bg-[#27ae60] text-white transition-all active:scale-95 border-r border-[#27ae60]"
                      data-testid="button-download"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Baixar {FORMAT_META[selectedFormat].label}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          className="h-9 px-2.5 rounded-none rounded-r-xl font-semibold bg-[#2ECC71] hover:bg-[#27ae60] text-white transition-all active:scale-95"
                          data-testid="button-download-formats"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuLabel className="text-xs text-muted-foreground">Escolher formato</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {(Object.entries(FORMAT_META) as [DownloadFormat, typeof FORMAT_META[DownloadFormat]][]).map(([fmt, meta]) => (
                          <DropdownMenuItem
                            key={fmt}
                            className="cursor-pointer gap-2"
                            onClick={() => setSelectedFormat(fmt)}
                            data-testid={`menu-format-${fmt}`}
                          >
                            {meta.icon}
                            <div className="flex-1">
                              <div className="font-medium">{meta.label}</div>
                              <div className="text-[11px] text-muted-foreground">{meta.desc}</div>
                            </div>
                            {selectedFormat === fmt && <Check className="h-3.5 w-3.5 text-[#2ECC71]" />}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </>
              )}

              {/* Próximo button — only on step 2 */}
              {currentStep === 2 && (
                <Button 
                  onClick={handleNext}
                  className="h-9 px-6 rounded-xl font-semibold bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-lg shadow-[#8B5CF6]/20 transition-all active:scale-95"
                  data-testid="button-next"
                >
                  Design QR →
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Landing sections — only visible before QR is generated */}
      {!qrData && (
        <>
          {/* Section 2 — Como funciona */}
          <section className="py-16 bg-[#f8fafc] border-t border-slate-100">
            <div className="max-w-5xl mx-auto px-6">
              <h2 className="text-2xl font-bold text-center text-slate-800 mb-12">Como funciona</h2>
              <div className="flex flex-col md:flex-row items-start gap-0">

                {/* Step 1 */}
                <div className="flex-1 flex flex-col items-center text-center px-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#2ECC71]/10 flex items-center justify-center mb-4">
                    <MousePointerClick className="h-7 w-7 text-[#2ECC71]" />
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#2ECC71] text-white text-xs font-bold flex items-center justify-center mb-3">1</div>
                  <h3 className="font-semibold text-slate-800 mb-2">Escolha o tipo</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">Selecione entre 9 modelos: site, WhatsApp, PDF, vCard e mais</p>
                </div>

                {/* Arrow */}
                <div className="hidden md:flex items-center justify-center pt-6 px-2">
                  <ArrowRight className="h-6 w-6 text-slate-300" />
                </div>
                <div className="md:hidden flex justify-center w-full py-3">
                  <div className="w-px h-8 bg-slate-200" />
                </div>

                {/* Step 2 */}
                <div className="flex-1 flex flex-col items-center text-center px-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#8B5CF6]/10 flex items-center justify-center mb-4">
                    <Palette className="h-7 w-7 text-[#8B5CF6]" />
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#8B5CF6] text-white text-xs font-bold flex items-center justify-center mb-3">2</div>
                  <h3 className="font-semibold text-slate-800 mb-2">Personalize o conteúdo</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">Preencha as informações e customize as cores e o design do seu QR</p>
                </div>

                {/* Arrow */}
                <div className="hidden md:flex items-center justify-center pt-6 px-2">
                  <ArrowRight className="h-6 w-6 text-slate-300" />
                </div>
                <div className="md:hidden flex justify-center w-full py-3">
                  <div className="w-px h-8 bg-slate-200" />
                </div>

                {/* Step 3 */}
                <div className="flex-1 flex flex-col items-center text-center px-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
                    <Share2 className="h-7 w-7 text-blue-500" />
                  </div>
                  <div className="w-7 h-7 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center mb-3">3</div>
                  <h3 className="font-semibold text-slate-800 mb-2">Baixe e compartilhe</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">Faça download em PNG ou SVG e use em qualquer material</p>
                </div>

              </div>
            </div>
          </section>

          {/* Section 3 — Por que usar o AngoQRCode? */}
          <section className="py-16 bg-white border-t border-slate-100">
            <div className="max-w-5xl mx-auto px-6">
              <h2 className="text-2xl font-bold text-center text-slate-800 mb-12">Por que usar o AngoQRCode?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                {[
                  {
                    icon: <RefreshCw className="h-6 w-6 text-[#2ECC71]" />,
                    bg: "bg-[#2ECC71]/10",
                    title: "QR Code Dinâmico",
                    desc: "Edite o destino a qualquer hora sem reimprimir",
                  },
                  {
                    icon: <BarChart2 className="h-6 w-6 text-[#8B5CF6]" />,
                    bg: "bg-[#8B5CF6]/10",
                    title: "Analytics de Scans",
                    desc: "Acompanhe quantas vezes seu QR foi escaneado",
                  },
                  {
                    icon: <Paintbrush className="h-6 w-6 text-orange-500" />,
                    bg: "bg-orange-500/10",
                    title: "Design Personalizado",
                    desc: "Adicione cores, logo e estilo ao seu QR",
                  },
                  {
                    icon: <FileImage className="h-6 w-6 text-blue-500" />,
                    bg: "bg-blue-500/10",
                    title: "PDF e Imagens",
                    desc: "Hospede documentos e imagens diretamente no QR",
                  },
                  {
                    icon: <FileDown className="h-6 w-6 text-red-500" />,
                    bg: "bg-red-500/10",
                    title: "Múltiplos Formatos",
                    desc: "Baixe em PNG, SVG ou PDF com alta resolução",
                  },
                  {
                    icon: <Gift className="h-6 w-6 text-teal-500" />,
                    bg: "bg-teal-500/10",
                    title: "Totalmente Gratuito",
                    desc: "Crie quantos QR codes quiser sem cadastro",
                  },
                ].map((item) => (
                  <div key={item.title} className="bg-[#f8fafc] rounded-2xl p-6 flex gap-4 items-start hover:shadow-md transition-shadow">
                    <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">{item.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}

              </div>
            </div>
          </section>

          <Footer />
        </>
      )}
    </div>
  );
}

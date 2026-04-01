import { useState, type ReactNode } from "react";
import stepOneImg from "@assets/image_1775053797453.png";
import stepTwoImg from "@assets/image_1775054078641.png";
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
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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

            {/* Right Column: Mockup (6 columns) - Desktop only - Sticky */}
            <div className="hidden lg:flex lg:col-span-6 flex-col items-center justify-start sticky top-16 self-start pointer-events-none" style={{paddingBottom: qrData ? '96px' : '0'}}>

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
          <section className="relative py-24 overflow-hidden" style={{background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)"}}>
            {/* Glow orbs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#2ECC71]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#8B5CF6]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative max-w-5xl mx-auto px-6">
              {/* Badge */}
              <div className="flex justify-center mb-5">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-white/70 border border-white/10 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] animate-pulse" />
                  Simples e rápido
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-4 tracking-tight">Como funciona</h2>
              <p className="text-center text-white/50 mb-16 text-base">Em apenas 3 passos, crie um QR code profissional</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                {/* Connecting line desktop */}
                <div className="hidden md:block absolute top-10 left-[calc(16.66%+1.5rem)] right-[calc(16.66%+1.5rem)] h-px bg-gradient-to-r from-[#2ECC71]/40 via-[#8B5CF6]/40 to-blue-500/40" />

                {[
                  {
                    num: "01", icon: <MousePointerClick className="h-6 w-6 text-[#2ECC71]" />,
                    iconBg: "bg-[#2ECC71]/15 border border-[#2ECC71]/20",
                    numColor: "text-[#2ECC71]",
                    title: "Escolha o tipo",
                    desc: "Selecione entre 9 modelos: site, WhatsApp, PDF, vCard e mais",
                    img: stepOneImg,
                  },
                  {
                    num: "02", icon: <Palette className="h-6 w-6 text-[#8B5CF6]" />,
                    iconBg: "bg-[#8B5CF6]/15 border border-[#8B5CF6]/20",
                    numColor: "text-[#8B5CF6]",
                    title: "Personalize",
                    desc: "Preencha as informações e customize cores, logo e design do seu QR",
                    img: stepTwoImg,
                  },
                  {
                    num: "03", icon: <Share2 className="h-6 w-6 text-blue-400" />,
                    iconBg: "bg-blue-500/15 border border-blue-500/20",
                    numColor: "text-blue-400",
                    title: "Baixe e use",
                    desc: "Faça download em PNG, SVG ou PDF e use em qualquer material",
                    img: null,
                  },
                ].map((step) => (
                  <div key={step.num} className="relative flex flex-col items-center text-center p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/8 transition-all">
                    {step.img ? (
                      <div className="w-full mb-5 rounded-2xl overflow-hidden border border-white/10">
                        <img src={step.img} alt={step.title} className="w-full h-auto object-cover" />
                      </div>
                    ) : (
                      <div className={`w-14 h-14 rounded-2xl ${step.iconBg} flex items-center justify-center mb-5`}>
                        {step.icon}
                      </div>
                    )}
                    <span className={`text-xs font-bold tracking-widest uppercase mb-2 ${step.numColor}`}>{step.num}</span>
                    <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 3 — Por que usar o AngoQRCode? */}
          <section className="py-24 bg-white">
            <div className="max-w-5xl mx-auto px-6">
              {/* Badge */}
              <div className="flex justify-center mb-5">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#2ECC71]/10 text-[#2ECC71] border border-[#2ECC71]/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71]" />
                  Funcionalidades
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-4 tracking-tight">Por que usar o AngoQRCode?</h2>
              <p className="text-center text-slate-400 mb-16 text-base">Tudo que precisa para criar QR codes profissionais</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  {
                    icon: <RefreshCw className="h-5 w-5 text-[#2ECC71]" />,
                    gradient: "from-[#2ECC71]/10 to-[#2ECC71]/5",
                    border: "border-[#2ECC71]/15",
                    dot: "bg-[#2ECC71]",
                    title: "QR Code Dinâmico",
                    desc: "Edite o destino a qualquer hora sem reimprimir",
                  },
                  {
                    icon: <BarChart2 className="h-5 w-5 text-[#8B5CF6]" />,
                    gradient: "from-[#8B5CF6]/10 to-[#8B5CF6]/5",
                    border: "border-[#8B5CF6]/15",
                    dot: "bg-[#8B5CF6]",
                    title: "Analytics de Scans",
                    desc: "Acompanhe quantas vezes seu QR foi escaneado",
                  },
                  {
                    icon: <Paintbrush className="h-5 w-5 text-orange-500" />,
                    gradient: "from-orange-500/10 to-orange-500/5",
                    border: "border-orange-500/15",
                    dot: "bg-orange-500",
                    title: "Design Personalizado",
                    desc: "Adicione cores, logo e estilo ao seu QR",
                  },
                  {
                    icon: <FileImage className="h-5 w-5 text-blue-500" />,
                    gradient: "from-blue-500/10 to-blue-500/5",
                    border: "border-blue-500/15",
                    dot: "bg-blue-500",
                    title: "PDF e Imagens",
                    desc: "Hospede documentos e imagens diretamente no QR",
                  },
                  {
                    icon: <FileDown className="h-5 w-5 text-rose-500" />,
                    gradient: "from-rose-500/10 to-rose-500/5",
                    border: "border-rose-500/15",
                    dot: "bg-rose-500",
                    title: "Múltiplos Formatos",
                    desc: "Baixe em PNG, SVG ou PDF com alta resolução",
                  },
                  {
                    icon: <Gift className="h-5 w-5 text-teal-500" />,
                    gradient: "from-teal-500/10 to-teal-500/5",
                    border: "border-teal-500/15",
                    dot: "bg-teal-500",
                    title: "Totalmente Gratuito",
                    desc: "Crie quantos QR codes quiser sem cadastro",
                  },
                ].map((item) => (
                  <div key={item.title} className={`group relative bg-gradient-to-br ${item.gradient} border ${item.border} rounded-2xl p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-default`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                        {item.icon}
                      </div>
                      <h3 className="font-semibold text-slate-800 text-sm">{item.title}</h3>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed pl-0">{item.desc}</p>
                    <div className={`absolute top-5 right-5 w-1.5 h-1.5 rounded-full ${item.dot} opacity-60`} />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 4 — FAQ */}
          <section className="py-24 bg-[#f8fafc]">
            <div className="max-w-2xl mx-auto px-6">
              {/* Badge */}
              <div className="flex justify-center mb-5">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-slate-900/8 text-slate-600 border border-slate-200">
                  Dúvidas
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-4 tracking-tight">Perguntas frequentes</h2>
              <p className="text-center text-slate-400 mb-12 text-base">Tudo o que precisa de saber antes de começar</p>

              <div className="flex flex-col gap-2">
                {[
                  {
                    q: "O AngoQRCode é gratuito?",
                    a: "Sim, totalmente gratuito. Pode criar, personalizar e descarregar QR codes sem precisar de criar conta.",
                  },
                  {
                    q: "Que tipos de QR code posso criar?",
                    a: "Pode criar QR codes para URLs, WhatsApp, Instagram, Facebook, vCard (cartão de contacto), PDF, imagens, Link Tree e muito mais.",
                  },
                  {
                    q: "Posso adicionar o meu logo ao QR code?",
                    a: "Sim. Na etapa de design pode fazer upload do seu logotipo para ser exibido no centro do QR code.",
                  },
                  {
                    q: "Em que formatos posso descarregar o QR code?",
                    a: "Pode descarregar em PNG (ideal para redes sociais), SVG (vetorial, escalável sem perda de qualidade) ou PDF (pronto para impressão em A4).",
                  },
                  {
                    q: "O QR code gerado expira?",
                    a: "Não. Os QR codes gerados são permanentes e não têm data de expiração.",
                  },
                  {
                    q: "Consigo usar o QR code para impressão em grande formato?",
                    a: "Sim. Ao descarregar, pode escolher resoluções até 4096 px ou usar o formato SVG que é infinitamente escalável sem perda de qualidade.",
                  },
                ].map((item, i) => (
                  <div key={i} className={`rounded-2xl border transition-all duration-200 overflow-hidden ${openFaq === i ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/60 border-slate-100 hover:border-slate-200'}`}>
                    <button
                      className="w-full flex items-center justify-between px-6 py-4 text-left gap-4 group"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      <span className={`font-medium text-sm transition-colors ${openFaq === i ? 'text-slate-900' : 'text-slate-700 group-hover:text-slate-900'}`}>{item.q}</span>
                      <ChevronDown className={`h-4 w-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180 text-[#2ECC71]' : ''}`} />
                    </button>
                    {openFaq === i && (
                      <div className="px-6 pb-5 text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-4">
                        {item.a}
                      </div>
                    )}
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

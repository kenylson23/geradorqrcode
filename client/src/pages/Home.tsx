import { useState, useEffect, type ReactNode } from "react";
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
  ArrowRight, Globe, MessageCircle, UserCircle, Briefcase, Facebook, Instagram, Link2,
  Copy, ClipboardCheck,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

const FEATURES: {
  type: string;
  label: string;
  icon: ReactNode;
  color: string;
  title: string;
  description: string;
  sampleData: any;
}[] = [
  {
    type: "url",
    label: "Site",
    icon: <Globe className="h-4 w-4" />,
    color: "#2ECC71",
    title: "Link para qualquer Website",
    description: "Direcione quem escaneia o QR code diretamente para qualquer URL ou página web. Ideal para menus digitais, catálogos online, portfólios e muito mais.",
    sampleData: { type: "url", url: "https://www.meusite.com" },
  },
  {
    type: "whatsapp",
    label: "WhatsApp",
    icon: <SiWhatsapp className="h-4 w-4" />,
    color: "#25D366",
    title: "Mensagem direta para WhatsApp",
    description: "Ao escanear o QR, o utilizador abre uma conversa no WhatsApp com uma mensagem pré-preenchida. Perfeito para atendimento ao cliente e contacto rápido.",
    sampleData: { type: "whatsapp", phone: "244949639932", countryCode: "+244", message: "Olá! Gostaria de saber mais informações." },
  },
  {
    type: "vcard",
    label: "vCard",
    icon: <UserCircle className="h-4 w-4" />,
    color: "#8B5CF6",
    title: "Cartão de visita digital",
    description: "Partilhe os seus dados de contacto de forma instantânea. Ao escanear, o utilizador pode guardar o contacto directamente no telemóvel.",
    sampleData: { type: "vcard", firstName: "João", lastName: "Silva", phone: "244949639932", email: "joao@empresa.com", organization: "Empresa Lda", jobTitle: "Director Geral", website: "https://empresa.com" },
  },
  {
    type: "pdf",
    label: "PDF",
    icon: <FileText className="h-4 w-4" />,
    color: "#EF4444",
    title: "Visualizar documentos PDF",
    description: "Partilhe documentos, brochuras, catálogos ou relatórios em PDF. O utilizador abre e lê directamente no telemóvel sem descarregar ficheiros.",
    sampleData: { type: "pdf", url: "https://example.com/doc.pdf", companyName: "Empresa Lda", title: "Relatório Anual 2024", description: "Aceda ao nosso relatório anual de 2024 com todos os resultados.", buttonLabel: "Abrir Documento" },
  },
  {
    type: "links",
    label: "Lista de Links",
    icon: <Link2 className="h-4 w-4" />,
    color: "#F59E0B",
    title: "Todos os seus links num só lugar",
    description: "Crie uma página personalizada com todos os seus links importantes. Ideal para bio do Instagram, perfis de redes sociais e sites.",
    sampleData: { type: "links", title: "Os meus links", description: "Todos os meus perfis num só lugar", links: [{ label: "Instagram", url: "https://instagram.com/perfil", imageUrl: "" }, { label: "YouTube", url: "https://youtube.com/canal", imageUrl: "" }, { label: "Website", url: "https://meusite.com", imageUrl: "" }] },
  },
  {
    type: "images",
    label: "Imagens",
    icon: <ImageIcon className="h-4 w-4" />,
    color: "#3B82F6",
    title: "Galeria de imagens interativa",
    description: "Mostre várias imagens ao escanear o QR code. Ideal para portfólios, galerias de produtos, eventos e álbuns fotográficos.",
    sampleData: { type: "images", title: "Galeria de Fotos", description: "Veja as nossas melhores fotos", website: "https://meusite.com", buttonLabel: "Ver Mais" },
  },
  {
    type: "facebook",
    label: "Facebook",
    icon: <Facebook className="h-4 w-4" />,
    color: "#1877F2",
    title: "Página do Facebook",
    description: "Direcione o utilizador directamente para a sua página do Facebook e aumente os seus seguidores de forma rápida e fácil.",
    sampleData: { type: "facebook", url: "https://facebook.com/minhapagina", title: "Siga-nos no Facebook", description: "Acompanhe as nossas novidades e promoções exclusivas!", buttonLabel: "Ver Página" },
  },
  {
    type: "instagram",
    label: "Instagram",
    icon: <Instagram className="h-4 w-4" />,
    color: "#E1306C",
    title: "Perfil do Instagram",
    description: "Leve os utilizadores directamente ao seu perfil do Instagram. Aumente os seus seguidores e partilhe conteúdo visual de forma eficaz.",
    sampleData: { type: "instagram", url: "https://instagram.com/meuperfil", instagramUser: "@meuperfil", title: "Siga no Instagram", description: "Conteúdo exclusivo e novidades todos os dias!", buttonLabel: "Ver Perfil" },
  },
  {
    type: "business",
    label: "Negócios",
    icon: <Briefcase className="h-4 w-4" />,
    color: "#0EA5E9",
    title: "Cartão de empresa completo",
    description: "Apresente a sua empresa de forma profissional com informações completas: morada, horários, contactos, redes sociais e muito mais.",
    sampleData: { type: "business", companyName: "Empresa Lda", industry: "Tecnologia", caption: "A melhor solução tecnológica de Angola", location: "Luanda, Angola", email: "info@empresa.com", website: "https://empresa.com", phone: "244949639932", whatsappNumber: "244949639932" },
  },
];

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
  const [activeFeature, setActiveFeature] = useState("url");

  const [downloadSize, setDownloadSize] = useState(1024);
  const [design, setDesign] = useState<QrDesignSettings>(defaultDesign);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (qrData) setMobilePreviewOpen(true);
  }, [!!qrData]);

  const handleCopyUrl = () => {
    if (!qrUrl) return;
    navigator.clipboard.writeText(qrUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans overflow-x-hidden">
      <Header currentStep={currentStep} />

      <main id="criar" className="flex-grow pb-24">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-12 lg:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
            
            {/* Left Column: Form or Design (6 columns) */}
            <div className="lg:col-span-6 pb-28 lg:pb-56">
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

            {/* Mobile Preview Accordion — only visible below lg, only when qrData exists */}
            {qrData && (
              <div className="lg:hidden col-span-1 -mt-2">
                <button
                  onClick={() => setMobilePreviewOpen(o => !o)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-slate-200 shadow-sm text-sm font-semibold text-slate-700 transition-all active:scale-[0.99]"
                  data-testid="button-mobile-preview-toggle"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse" />
                    Pré-visualização em tempo real
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${mobilePreviewOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {mobilePreviewOpen && (
                  <div className="mt-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    {/* Preview/QR tabs */}
                    <div className="flex gap-2 px-4 pt-3 pb-2 border-b border-slate-100">
                      <button
                        onClick={() => setShowQr(false)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${!showQr ? 'bg-[#8B5CF6] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        data-testid="button-mobile-tab-preview"
                      >
                        Prévia da página
                      </button>
                      <button
                        onClick={() => setShowQr(true)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${showQr ? 'bg-[#8B5CF6] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        data-testid="button-mobile-tab-qr"
                      >
                        Código QR
                      </button>
                    </div>

                    {/* Scaled iPhone mockup */}
                    <div className="flex justify-center items-center py-6" style={{ minHeight: 320 }}>
                      <div style={{ transform: 'scale(0.72)', transformOrigin: 'top center', height: 332 }}>
                        <div className="relative border-[#222222] bg-[#222222] border-[10px] rounded-[3rem] h-[460px] w-[260px] shadow-2xl overflow-hidden flex flex-col flex-shrink-0">
                          {/* Notch */}
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-xl z-50 flex items-center justify-center">
                            <div className="w-10 h-2.5 bg-[#111] rounded-full" />
                          </div>
                          {/* Side buttons */}
                          <div className="h-[28px] w-[2.5px] bg-gray-800 absolute -left-[12.5px] top-[130px] rounded-l-lg border-l border-white/10" />
                          <div className="h-[44px] w-[2.5px] bg-gray-800 absolute -left-[12.5px] top-[210px] rounded-l-lg border-l border-white/10" />
                          <div className="h-[44px] w-[2.5px] bg-gray-800 absolute -left-[12.5px] top-[290px] rounded-l-lg border-l border-white/10" />
                          <div className="h-[70px] w-[2.5px] bg-gray-800 absolute -right-[12.5px] top-[240px] rounded-r-lg border-r border-white/10" />
                          {/* Screen */}
                          <div className="rounded-[2.4rem] overflow-hidden w-full h-full bg-white flex flex-col relative">
                            <div className="w-full h-full flex flex-col items-center animate-in fade-in zoom-in duration-300">
                              <QrResult
                                value={qrData}
                                showQr={showQr}
                                setShowQr={setShowQr}
                                design={design}
                              />
                            </div>
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-black rounded-full z-50 opacity-20" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

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
                        onUrlComputed={setQrUrl}
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
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 shadow-lg py-2 px-3 sm:px-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
            <Button 
              variant="outline"
              onClick={handleBack}
              className="h-9 px-3 sm:px-6 rounded-xl font-semibold border-2 border-slate-300 text-slate-600 hover:text-slate-700 hover:border-slate-400 transition-all active:scale-95 flex-shrink-0 text-sm"
              data-testid="button-back"
            >
              ← <span className="hidden sm:inline ml-1">Voltar</span>
            </Button>
            
            <div className="flex gap-2 items-center min-w-0">
              {/* Download controls — only on step 3 */}
              {currentStep === 3 && (
                <>
                  {/* Copy URL button */}
                  {qrUrl && (
                    <Button
                      variant="outline"
                      onClick={handleCopyUrl}
                      className={`h-9 px-3 rounded-xl border-2 font-semibold text-sm transition-all active:scale-95 flex-shrink-0 gap-1.5
                        ${copied
                          ? 'border-[#2ECC71] text-[#2ECC71] bg-[#2ECC71]/5'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      data-testid="button-copy-url"
                    >
                      {copied
                        ? <><ClipboardCheck className="h-3.5 w-3.5" /><span className="hidden sm:inline">Copiado!</span></>
                        : <><Copy className="h-3.5 w-3.5" /><span className="hidden sm:inline">Copiar URL</span></>
                      }
                    </Button>
                  )}

                  {/* Size picker — hidden on mobile */}
                  <div className="hidden sm:block">
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
                  </div>

                  {/* Format + Download split button */}
                  <div className="flex rounded-xl overflow-hidden shadow-lg shadow-[#2ECC71]/20">
                    <Button
                      onClick={handleDownload}
                      className="h-9 px-3 sm:px-5 rounded-none rounded-l-xl font-semibold bg-[#2ECC71] hover:bg-[#27ae60] text-white transition-all active:scale-95 border-r border-[#27ae60] text-sm"
                      data-testid="button-download"
                    >
                      <Download className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Baixar {FORMAT_META[selectedFormat].label}</span>
                      <span className="sm:hidden">{FORMAT_META[selectedFormat].label}</span>
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
                      <DropdownMenuContent align="end" className="w-56">
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

                        {/* Size section — only visible on mobile (sm+ uses the separate size picker) */}
                        <div className="sm:hidden">
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-xs text-muted-foreground">Tamanho do ficheiro</DropdownMenuLabel>
                          {SIZE_OPTIONS.map(sz => (
                            <DropdownMenuItem
                              key={sz.value}
                              className="cursor-pointer gap-2"
                              onClick={() => setDownloadSize(sz.value)}
                              data-testid={`menu-size-mobile-${sz.value}`}
                            >
                              <div className="flex-1">
                                <div className="font-medium">{sz.label}</div>
                                <div className="text-[11px] text-muted-foreground">{sz.desc}</div>
                              </div>
                              {downloadSize === sz.value && <Check className="h-3.5 w-3.5 text-[#2ECC71]" />}
                            </DropdownMenuItem>
                          ))}
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </>
              )}

              {/* Próximo button — only on step 2 */}
              {currentStep === 2 && (
                <Button 
                  onClick={handleNext}
                  className="h-9 px-4 sm:px-6 rounded-xl font-semibold bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-lg shadow-[#8B5CF6]/20 transition-all active:scale-95 text-sm"
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
          <section className="py-12 md:py-20 bg-[#eef2f7]">
            <div className="max-w-5xl mx-auto px-6">
              <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-900 mb-2 tracking-tight">
                Como criar o seu código QR personalizado?
              </h2>
              <p className="text-center text-slate-400 mb-14 text-sm">Em apenas 3 passos simples, crie um QR code profissional</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {/* Step 1 */}
                <div className="flex flex-col items-center text-center">
                  {/* Illustration */}
                  <div className="w-28 h-28 mb-6 flex items-center justify-center">
                    <div className="relative">
                      {/* Grid of boxes */}
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="w-9 h-9 rounded-lg bg-white border-2 border-slate-200 shadow-sm flex items-center justify-center">
                          <div className="w-3 h-3 rounded bg-slate-200" />
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-white border-2 border-slate-200 shadow-sm flex items-center justify-center">
                          <div className="w-3 h-3 rounded bg-slate-200" />
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-white border-2 border-slate-200 shadow-sm flex items-center justify-center">
                          <div className="w-3 h-3 rounded bg-slate-200" />
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-[#2ECC71] border-2 border-[#2ECC71] shadow-sm flex items-center justify-center">
                          <div className="w-3 h-3 rounded bg-white/60" />
                        </div>
                      </div>
                      {/* Cursor */}
                      <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center border border-slate-100">
                        <MousePointerClick className="h-3.5 w-3.5 text-[#2ECC71]" />
                      </div>
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-2">
                    1. Escolha o conteúdo do seu código QR
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Selecione o material que deseja partilhar. Inclua links para sites, PDFs, menus, vídeos, aplicativos e muito mais!
                  </p>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-28 h-28 mb-6 flex items-center justify-center">
                    <div className="relative">
                      {/* Colorful blocks */}
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="w-9 h-9 rounded-lg bg-[#8B5CF6] shadow-sm" />
                        <div className="w-9 h-9 rounded-lg bg-[#F59E0B] shadow-sm" />
                        <div className="w-9 h-9 rounded-lg bg-[#EF4444] shadow-sm" />
                        <div className="w-9 h-9 rounded-lg bg-[#2ECC71] shadow-sm" />
                      </div>
                      {/* Badge */}
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-[#8B5CF6] rounded-full shadow-md flex items-center justify-center">
                        <Palette className="h-3.5 w-3.5 text-white" />
                      </div>
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-2">
                    2. Personalize o design
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Use o AngoQRCode para adicionar facilmente logotipos, cores e estilos ao seu código QR.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-28 h-28 mb-6 flex items-center justify-center">
                    <div className="relative">
                      {/* QR code representation */}
                      <div className="w-[76px] h-[76px] bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
                        <div className="grid grid-cols-3 gap-0.5 p-1">
                          <div className="w-4 h-4 rounded-sm bg-slate-800 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-[2px] bg-slate-800 border border-white/60" />
                          </div>
                          <div className="w-4 h-4 rounded-sm flex flex-col gap-0.5 items-center justify-center">
                            <div className="w-3 h-1 rounded-full bg-slate-300" />
                            <div className="w-2 h-1 rounded-full bg-slate-300" />
                          </div>
                          <div className="w-4 h-4 rounded-sm bg-slate-800 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-[2px] bg-slate-800 border border-white/60" />
                          </div>
                          <div className="w-4 h-4 rounded-sm flex flex-col gap-0.5 items-center justify-center">
                            <div className="w-3 h-1 rounded-full bg-slate-300" />
                            <div className="w-2 h-1 rounded-full bg-slate-300" />
                          </div>
                          <div className="w-4 h-4 rounded-sm flex items-center justify-center">
                            <div className="w-2 h-2 rounded-sm bg-slate-400" />
                          </div>
                          <div className="w-4 h-4 rounded-sm flex flex-col gap-0.5 items-center justify-center">
                            <div className="w-1 h-1 rounded-full bg-slate-400" />
                            <div className="w-3 h-1 rounded-full bg-slate-300" />
                          </div>
                          <div className="w-4 h-4 rounded-sm bg-slate-800 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-[2px] bg-slate-800 border border-white/60" />
                          </div>
                          <div className="w-4 h-4 rounded-sm flex flex-col gap-0.5 items-center justify-center">
                            <div className="w-2 h-1 rounded-full bg-slate-300" />
                            <div className="w-3 h-1 rounded-full bg-slate-300" />
                          </div>
                          <div className="w-4 h-4 rounded-sm flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                          </div>
                        </div>
                      </div>
                      {/* Download badge */}
                      <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-[#2ECC71] rounded-full shadow-md flex items-center justify-center">
                        <FileDown className="h-3.5 w-3.5 text-white" />
                      </div>
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-2">
                    3. Baixe o seu código QR
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Obtenha o seu código QR nos formatos PNG, SVG ou PDF. Imprima ou partilhe digitalmente. É muito fácil!
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="flex justify-center">
                <a href="#criar">
                  <Button
                    className="h-11 px-8 rounded-xl font-semibold bg-[#2ECC71] hover:bg-[#27ae60] text-white shadow-md shadow-[#2ECC71]/30 transition-all active:scale-95"
                    data-testid="button-how-it-works-cta"
                  >
                    Criar código QR
                  </Button>
                </a>
              </div>
            </div>
          </section>

          {/* Section 2.5 — Explore as Funcionalidades */}
          <section className="py-14 md:py-24 bg-[#f8fafc]">
            <div className="max-w-6xl mx-auto px-6">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-4 tracking-tight">Explore cada funcionalidade</h2>
              <p className="text-center text-slate-400 mb-10 text-base">Clique em cada tipo para ver uma prévia de como ficará no telemóvel</p>

              {/* Tab Pills */}
              <div className="flex flex-wrap gap-2 justify-center mb-10" data-testid="feature-tabs">
                {FEATURES.map((f) => {
                  const isActive = activeFeature === f.type;
                  return (
                    <button
                      key={f.type}
                      onClick={() => setActiveFeature(f.type)}
                      data-testid={`tab-feature-${f.type}`}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                        isActive
                          ? "text-white border-transparent shadow-lg scale-105"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-800"
                      }`}
                      style={isActive ? { backgroundColor: f.color, boxShadow: `0 4px 14px ${f.color}40` } : {}}
                    >
                      <span style={isActive ? { color: "white" } : { color: f.color }}>{f.icon}</span>
                      {f.label}
                    </button>
                  );
                })}
              </div>

              {/* Content Panel */}
              {(() => {
                const feature = FEATURES.find(f => f.type === activeFeature) ?? FEATURES[0];
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center bg-white rounded-3xl border border-slate-100 shadow-sm p-5 sm:p-8 lg:p-12">
                    {/* Left: Info */}
                    <div className="flex flex-col gap-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: feature.color }}>
                          <span className="[&>svg]:h-6 [&>svg]:w-6">{feature.icon}</span>
                        </div>
                        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: feature.color }}>
                          {feature.label}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                        <p className="text-slate-500 text-base leading-relaxed">{feature.description}</p>
                      </div>

                      <a href="#criar" className="w-full sm:w-fit">
                        <Button
                          className="w-full sm:w-fit px-6 h-11 rounded-xl font-semibold text-white transition-all active:scale-95 shadow-md"
                          style={{ backgroundColor: feature.color }}
                          data-testid={`button-create-${feature.type}`}
                        >
                          Criar QR Code de {feature.label} →
                        </Button>
                      </a>
                    </div>

                    {/* Right: iPhone Mockup Preview */}
                    <div className="flex justify-center">
                      <div className="relative border-[#222222] bg-[#222222] border-[10px] rounded-[3rem] h-[480px] w-[270px] shadow-2xl overflow-hidden flex flex-col flex-shrink-0">
                        {/* Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-xl z-50 flex items-center justify-center">
                          <div className="w-10 h-2.5 bg-[#111] rounded-full"></div>
                        </div>
                        {/* Side buttons */}
                        <div className="h-[28px] w-[2.5px] bg-gray-800 absolute -left-[12.5px] top-[130px] rounded-l-lg border-l border-white/10"></div>
                        <div className="h-[44px] w-[2.5px] bg-gray-800 absolute -left-[12.5px] top-[210px] rounded-l-lg border-l border-white/10"></div>
                        <div className="h-[44px] w-[2.5px] bg-gray-800 absolute -left-[12.5px] top-[290px] rounded-l-lg border-l border-white/10"></div>
                        <div className="h-[70px] w-[2.5px] bg-gray-800 absolute -right-[12.5px] top-[240px] rounded-r-lg border-r border-white/10"></div>

                        <div className="rounded-[2.4rem] overflow-hidden w-full h-full bg-white flex flex-col relative">
                          <div className="w-full h-full flex flex-col items-center animate-in fade-in zoom-in duration-300" key={feature.type}>
                            <QrResult
                              value={feature.sampleData}
                              showQr={false}
                              design={defaultDesign}
                            />
                          </div>
                          {/* Home Indicator */}
                          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-black rounded-full z-50 opacity-20"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </section>

          {/* Section 3 — Por que usar o AngoQRCode? */}
          <section className="py-14 md:py-24 bg-white">
            <div className="max-w-5xl mx-auto px-6">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-4 tracking-tight">Por que usar o AngoQRCode?</h2>
              <p className="text-center text-slate-400 mb-8 md:mb-16 text-base">Tudo que precisa para criar QR codes profissionais</p>

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

          {/* Section — Depoimentos */}
          <section className="py-14 md:py-24 bg-[#eef2f7]">
            <div className="max-w-5xl mx-auto px-6">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-4 tracking-tight">O que dizem os nossos utilizadores</h2>
              <p className="text-center text-slate-400 mb-8 md:mb-14 text-base">Milhares de pessoas já criaram os seus QR codes com o AngoQRCode</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  {
                    name: "Marta Ferreira",
                    role: "Dona de restaurante, Luanda",
                    initials: "MF",
                    color: "bg-[#0EA5E9]",
                    stars: 5,
                    quote: "Criei o QR code do menu do meu restaurante em menos de 2 minutos. Os clientes adoram e já não precisamos de imprimir menus em papel.",
                  },
                  {
                    name: "Carlos Mendes",
                    role: "Fotógrafo profissional, Benguela",
                    initials: "CM",
                    color: "bg-[#2ECC71]",
                    stars: 5,
                    quote: "Uso o AngoQRCode para partilhar o meu portfólio de fotos. Coloco o QR code nos meus cartões de visita e os clientes acedem diretamente às minhas melhores imagens.",
                  },
                  {
                    name: "Sofia Lopes",
                    role: "Gestora de marketing, Luanda",
                    initials: "SL",
                    color: "bg-[#8B5CF6]",
                    stars: 5,
                    quote: "Ferramenta incrível! Crio QR codes personalizados com o logo da empresa para todas as nossas campanhas. O design fica sempre profissional.",
                  },
                  {
                    name: "António Dias",
                    role: "Professor universitário, Lubango",
                    initials: "AD",
                    color: "bg-[#F59E0B]",
                    stars: 5,
                    quote: "Uso para partilhar materiais de estudo com os meus alunos. Crio um QR code com PDF e eles acedem facilmente pelo telemóvel. Muito prático!",
                  },
                  {
                    name: "Beatriz Santos",
                    role: "Empreendedora, Huambo",
                    initials: "BS",
                    color: "bg-[#EF4444]",
                    stars: 5,
                    quote: "O meu negócio cresceu muito desde que passei a usar QR codes para divulgar o WhatsApp e o Instagram. Simples, rápido e completamente gratuito.",
                  },
                  {
                    name: "Rui Tavares",
                    role: "Músico e produtor, Luanda",
                    initials: "RT",
                    color: "bg-[#0EA5E9]",
                    stars: 5,
                    quote: "Criei um QR code com a lista de links para todas as minhas plataformas musicais. Os fãs encontram tudo num só scan. Recomendo a todos!",
                  },
                ].map((t) => (
                  <div
                    key={t.name}
                    className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    data-testid={`card-testimonial-${t.initials}`}
                  >
                    {/* Stars */}
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.stars }).map((_, i) => (
                        <svg key={i} className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    {/* Quote */}
                    <p className="text-sm text-slate-600 leading-relaxed flex-1">"{t.quote}"</p>
                    {/* Author */}
                    <div className="flex items-center gap-3 pt-2 border-t border-slate-50">
                      <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-xs font-bold text-white">{t.initials}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{t.name}</p>
                        <p className="text-xs text-slate-400">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 4 — FAQ */}
          <section className="py-14 md:py-24 bg-[#f8fafc]">
            <div className="max-w-2xl mx-auto px-6">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-4 tracking-tight">Perguntas frequentes</h2>
              <p className="text-center text-slate-400 mb-8 md:mb-12 text-base">Tudo o que precisa de saber antes de começar</p>

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

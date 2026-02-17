import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  type QrCodeForm, 
  qrCodeFormSchema, 
  qrTypes, 
  type QrType 
} from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Globe, 
  FileText, 
  Share2, 
  UserCircle, 
  Briefcase, 
  Video, 
  ImageIcon, 
  Facebook, 
  Instagram, 
  MessageCircle,
  Upload,
  RefreshCw
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface QrFormProps {
  onGenerate: (data: QrCodeForm) => void;
  onStepChange: (step: number) => void;
}

const countryCodes = [
  { code: "244", name: "AO (+244)", flag: "🇦🇴" },
  { code: "351", name: "PT (+351)", flag: "🇵🇹" },
  { code: "55", name: "BR (+55)", flag: "🇧🇷" },
  { code: "1", name: "US (+1)", flag: "🇺🇸" },
  { code: "44", name: "UK (+44)", flag: "🇬🇧" },
  { code: "238", name: "CV (+238)", flag: "🇨🇻" },
  { code: "258", name: "MZ (+258)", flag: "🇲🇿" },
  { code: "239", name: "ST (+239)", flag: "🇸🇹" },
  { code: "245", name: "GW (+245)", flag: "🇬🇼" },
  { code: "670", name: "TL (+670)", flag: "🇹🇱" },
];

const qrOptions: { type: QrType; label: string; description: string; icon: any }[] = [
  { type: "url", label: "Site", description: "Link para qualquer URL de site", icon: Globe },
  { type: "whatsapp", label: "WhatsApp", description: "Mensagem direta para WhatsApp", icon: MessageCircle },
  { type: "pdf", label: "PDF", description: "Exibir um PDF", icon: FileText },
  { type: "links", label: "Lista de links", description: "Compartilhar vários links", icon: Share2 },
  { type: "business", label: "Negócios", description: "Informações sobre sua empresa", icon: Briefcase },
  { type: "vcard", label: "vCard", description: "Cartão de visita digital", icon: UserCircle },
  { type: "video", label: "Vídeo", description: "Mostrar um vídeo", icon: Video },
  { type: "images", label: "Imagens", description: "Compartilhar várias imagens", icon: ImageIcon },
  { type: "facebook", label: "Facebook", description: "Sua página do Facebook", icon: Facebook },
  { type: "instagram", label: "Instagram", description: "Seu perfil do Instagram", icon: Instagram },
];

export function QrForm({ onGenerate, onStepChange }: QrFormProps) {
  const [activeType, setActiveType] = useState<QrType | null>(null);
  const [selectedCountryCode, setSelectedCountryCode] = useState("244");
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const form = useForm<QrCodeForm>({
    resolver: zodResolver(qrCodeFormSchema),
    defaultValues: {
      type: "url",
      url: "",
    },
    mode: "onChange"
  });

  const handleFileUpload = async (file: File, fieldName: any) => {
    setIsUploading(true);
    setProgress(10);
    try {
      setProgress(20);
      
      // Converte o arquivo para Base64 localmente
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setProgress(100);
      form.setValue(fieldName, base64);
      
      // Atualiza o preview em tempo real
      onGenerate(form.getValues());
    } catch (error) {
      console.error("Erro no processamento do arquivo:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleTypeSelect = (type: QrType) => {
    setActiveType(type);
    onStepChange(2);
    
    let defaultValues: any = { type };
    switch (type) {
      case "url":
      case "video":
      case "facebook":
      case "instagram":
      case "pdf":
        defaultValues = { ...defaultValues, url: "" };
        break;
      case "text":
        defaultValues = { ...defaultValues, text: "" };
        break;
      case "whatsapp":
        defaultValues = { ...defaultValues, phone: "", message: "" };
        break;
      case "email":
        defaultValues = { ...defaultValues, email: "", subject: "", body: "" };
        break;
      case "phone":
        defaultValues = { ...defaultValues, phone: "" };
        break;
      case "links":
        defaultValues = { ...defaultValues, title: "", description: "", photoUrl: "", links: [{ label: "", url: "" }] };
        break;
      case "vcard":
        defaultValues = { ...defaultValues, firstName: "", lastName: "", phone: "", email: "", organization: "", jobTitle: "", website: "", location: "", companyName: "", profession: "", summary: "", socialLinks: [] };
        break;
      case "images":
        defaultValues = { ...defaultValues, title: "", description: "", urls: [""], buttons: [] };
        break;
      case "business":
        defaultValues = { ...defaultValues, companyName: "", industry: "", caption: "", photoUrl: "", location: "", email: "", website: "", phone: "", openingHours: [{ day: "Segunda-feira", hours: "09:00 - 18:00" }], socialLinks: [] };
        break;
    }
    form.reset(defaultValues);
    // Initial generation with empty values
    onGenerate(defaultValues);
  };

  const onSubmit = (data: QrCodeForm) => {
    const modifiedData = prepareData(data);
    onGenerate(modifiedData);
  };

  const prepareData = (data: QrCodeForm) => {
    const modifiedData = { ...data } as any;
    if ((data.type === 'whatsapp' || data.type === 'phone' || data.type === 'vcard') && data.phone) {
      if (!data.phone.startsWith('+')) {
        modifiedData.phone = `+${selectedCountryCode}${data.phone.replace(/^0+/, '')}`;
      }
    }
    return modifiedData;
  };

  // Watch all fields for real-time preview
  const watchedValues = form.watch();
  const [lastEmitted, setLastEmitted] = useState("");

  useEffect(() => {
    const watchedStr = JSON.stringify(watchedValues) + selectedCountryCode;
    if (watchedStr !== lastEmitted && activeType) {
      setLastEmitted(watchedStr);
      onGenerate(prepareData(watchedValues));
    }
  }, [watchedValues, selectedCountryCode, activeType, lastEmitted, onGenerate]);

  if (!activeType) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground mb-8">1. Selecione um tipo de código QR</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {qrOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => handleTypeSelect(option.type)}
              className="group flex flex-col items-center p-6 bg-white rounded-2xl border border-border/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
              data-testid={`button-qr-type-${option.type}-${index}`}
            >
              <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <option.icon className="w-6 h-6 text-primary" />
              </div>
              <span className="font-bold text-foreground text-center mb-1">{option.label}</span>
              <span className="text-[10px] text-muted-foreground text-center leading-tight">{option.description}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Button variant="ghost" onClick={() => { setActiveType(null); onStepChange(1); }} className="mb-4 text-muted-foreground hover:text-primary">
        ← Voltar para seleção
      </Button>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeType}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-white p-6 rounded-2xl border border-border shadow-sm min-h-[300px]"
            >
              {activeType === "whatsapp" && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-foreground">Número do WhatsApp</FormLabel>
                        <div className="flex gap-2">
                          <Select value={selectedCountryCode} onValueChange={setSelectedCountryCode}>
                            <SelectTrigger className="w-[120px] h-12 rounded-xl border-2 border-border">
                              <SelectValue placeholder="Código" />
                            </SelectTrigger>
                            <SelectContent>
                              {countryCodes.map((c) => (
                                <SelectItem key={c.code} value={c.code}>
                                  <span className="flex items-center gap-2">
                                    <span>{c.flag}</span>
                                    <span>+{c.code}</span>
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormControl>
                            <Input placeholder="923 000 000" className="h-12 rounded-xl border-2 border-border flex-1" {...field} value={field.value || ''} />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-foreground">Mensagem (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Olá, gostaria de mais informações..." className="min-h-[120px] resize-none rounded-xl border-2 border-border" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {activeType === "pdf" && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fileUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-foreground">Upload de PDF</FormLabel>
                        <FormControl>
                          <div className="flex flex-col gap-4">
                            <div 
                              className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors cursor-pointer bg-slate-50/50"
                              onClick={() => {
                                if (!isUploading) {
                                  document.getElementById('pdf-upload')?.click();
                                }
                              }}
                            >
                              <Upload className="w-8 h-8 text-muted-foreground" />
                              <span className="text-sm font-medium text-slate-600">
                                {isUploading ? "Enviando..." : (form.getValues("fileUrl") ? "PDF carregado com sucesso" : "Clique para fazer upload do PDF")}
                              </span>
                              <span className="text-[10px] text-muted-foreground">PDF até 10MB</span>
                              <input 
                                id="pdf-upload"
                                type="file" 
                                accept=".pdf" 
                                className="hidden" 
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    if (file.size > 2 * 1024) {
                                      alert("Para geração local, o arquivo deve ter menos de 3KB devido ao limite do QR Code. Para arquivos maiores, use a opção de URL.");
                                      return;
                                    }
                                    handleFileUpload(file, "fileUrl");
                                  }
                                }}
                              />
                            </div>
                            {isUploading && (
                              <div className="space-y-2">
                                <Progress value={progress} className="h-1" />
                                <p className="text-[10px] text-center text-muted-foreground animate-pulse">Enviando arquivo...</p>
                              </div>
                            )}
                            {field.value && (
                              <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg border border-primary/10">
                                <FileText className="w-4 h-4 text-primary" />
                                <span className="text-xs text-slate-600 truncate flex-1">{field.value.split('/').pop()}</span>
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 w-7 p-0" 
                                  onClick={() => form.setValue("fileUrl", "")}
                                >
                                  <RefreshCw className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground font-semibold">ou use uma URL</span></div>
                  </div>
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-foreground">URL do PDF</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/documento.pdf" {...field} value={field.value || ''} className="h-12 rounded-xl border-2 border-border focus-visible:ring-primary/20" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {(activeType === "url" || activeType === "video" || activeType === "facebook" || activeType === "instagram") && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-foreground">URL do Link</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com" {...field} value={field.value || ''} className="h-12 rounded-xl border-2 border-border focus-visible:ring-primary/20" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {activeType === "phone" && (
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-foreground">Número de Telefone</FormLabel>
                      <div className="flex gap-2">
                        <Select value={selectedCountryCode} onValueChange={setSelectedCountryCode}>
                          <SelectTrigger className="w-[120px] h-12 rounded-xl border-2 border-border"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {countryCodes.map(c => <SelectItem key={c.code} value={c.code}>{c.flag} +{c.code}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormControl>
                          <Input placeholder="222 123 456" className="h-12 rounded-xl border-2 border-border flex-1" {...field} value={field.value || ''} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* ... other types if needed ... */}
              
              <div className="mt-8 flex justify-end">
                <Button type="submit" size="lg" className="h-12 px-8 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20">
                  Gerar QR Code
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </form>
      </Form>
    </div>
  );
}

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
  RefreshCw,
  Plus,
  Trash2
} from "lucide-react";
import { useState, useEffect } from "react";
import { useFieldArray } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";

import { useUpload } from "@/hooks/use-upload";

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

  const { uploadFile, progress: uploadProgress, isUploading: hookIsUploading } = useUpload();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "links" as never,
  });

  const handleFileUpload = async (file: File, fieldName: any) => {
    try {
      setIsUploading(true);
      setProgress(10);
      
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        throw new Error("Configurações do Cloudinary (Cloud Name ou Upload Preset) não encontradas.");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Erro ao fazer upload para o Cloudinary");
      }

      const result = await response.json();
      setProgress(100);
      
      if (result.secure_url) {
        form.setValue(fieldName, result.secure_url);
        if (activeType === "pdf") {
          form.setValue("url", result.secure_url);
        }
      }
      
      onGenerate(form.getValues());
    } catch (error: any) {
      console.error("Erro no processamento do arquivo:", error);
      alert(error.message || "Erro ao processar o arquivo.");
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
      }, 1000);
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
    // Initial generation with empty values to clear previous state
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
      // Special handling for URL types to update preview even if invalid URL
      const dataToGenerate = prepareData(watchedValues);
      onGenerate(dataToGenerate);
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
              {activeType === "links" && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-foreground">Título da Página</FormLabel>
                        <FormControl>
                          <Input placeholder="Meu Linktree" {...field} value={field.value || ''} className="h-12 rounded-xl border-2 border-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-foreground">Descrição (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Confira meus links importantes" className="min-h-[80px] resize-none rounded-xl border-2 border-border" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-3">
                    <FormLabel className="text-base font-semibold text-foreground">Links</FormLabel>
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex flex-col gap-2 p-4 border-2 border-border rounded-xl bg-slate-50/50">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-muted-foreground uppercase">Link {index + 1}</span>
                          {fields.length > 1 && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <FormField
                          control={form.control}
                          name={`links.${index}.label` as any}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Rótulo (ex: Instagram)" {...field} className="h-10 rounded-lg border-border" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`links.${index}.url` as any}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="URL (ex: https://instagram.com/user)" {...field} className="h-10 rounded-lg border-border" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full h-10 rounded-xl border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 text-primary"
                      onClick={() => append({ label: "", url: "" })}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Link
                    </Button>
                  </div>
                </div>
              )}

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
                                {isUploading || hookIsUploading ? "Enviando..." : (form.getValues("fileUrl") ? "PDF carregado com sucesso" : "Clique para fazer upload do PDF")}
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
                                    handleFileUpload(file, "fileUrl");
                                  }
                                }}
                              />
                            </div>
                            {(isUploading || hookIsUploading) && (
                              <div className="space-y-2">
                                <Progress value={progress || uploadProgress} className="h-1" />
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

              {activeType === "vcard" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input placeholder="João" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sobrenome</FormLabel>
                          <FormControl>
                            <Input placeholder="Silva" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telemóvel</FormLabel>
                        <div className="flex gap-2">
                          <Select value={selectedCountryCode} onValueChange={setSelectedCountryCode}>
                            <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {countryCodes.map(c => <SelectItem key={c.code} value={c.code}>{c.flag} +{c.code}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormControl>
                            <Input placeholder="923 000 000" className="flex-1" {...field} value={field.value || ''} />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="joao@exemplo.com" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Empresa</FormLabel>
                        <FormControl>
                          <Input placeholder="Minha Empresa" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="profession"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profissão / Cargo</FormLabel>
                        <FormControl>
                          <Input placeholder="Desenvolvedor Full Stack" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input placeholder="https://meusite.com" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="summary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resumo Profissional</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Breve biografia ou resumo..." {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {activeType === "images" && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título da Galeria</FormLabel>
                        <FormControl>
                          <Input placeholder="Minhas Fotos" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Uma breve descrição da sua galeria..." className="min-h-[80px]" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-3">
                    <FormLabel>Imagens da Galeria</FormLabel>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {form.getValues("fileUrls")?.map((url: string, idx: number) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                          <img src={url} className="w-full h-full object-cover" alt={`Preview ${idx}`} />
                          <button 
                            type="button"
                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                            onClick={() => {
                              const current = form.getValues("fileUrls") || [];
                              form.setValue("fileUrls", current.filter((_: any, i: number) => i !== idx));
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <div 
                        className="aspect-square border-2 border-dashed border-border rounded-lg flex items-center justify-center hover:border-primary/50 transition-colors cursor-pointer bg-slate-50/50"
                        onClick={() => document.getElementById('image-upload')?.click()}
                      >
                        <Plus className="w-6 h-6 text-muted-foreground" />
                      </div>
                    </div>
                    <input id="image-upload" type="file" accept="image/*" multiple className="hidden" 
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        for (const file of files) {
                          // Using a temporary field name to handle multiple uploads
                          // In a real app we'd append to an array field
                          const currentUrls = form.getValues("fileUrls") || [];
                          // This is a bit of a hack since handleFileUpload is designed for single fields
                          // but it works for our MVP demonstration
                          try {
                            setIsUploading(true);
                            const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
                            const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
                            const formData = new FormData();
                            formData.append("file", file);
                            formData.append("upload_preset", uploadPreset);
                            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
                              method: "POST",
                              body: formData,
                            });
                            const result = await response.json();
                            if (result.secure_url) {
                              form.setValue("fileUrls", [...currentUrls, result.secure_url]);
                            }
                          } finally {
                            setIsUploading(false);
                          }
                        }
                      }} 
                    />
                  </div>
                </div>
              )}

              {activeType === "business" && (
                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-border rounded-xl bg-slate-50/50 hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('business-photo-upload')?.click()}>
                    {form.getValues("photoUrl") ? (
                      <div className="relative w-20 h-20">
                        <img src={form.getValues("photoUrl")} className="w-full h-full object-cover rounded-full border-2 border-white shadow-md" alt="Preview" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                          <RefreshCw className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                        <span className="text-xs font-medium text-muted-foreground">Foto da Empresa</span>
                      </>
                    )}
                    <input id="business-photo-upload" type="file" accept="image/*" className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, "photoUrl");
                      }} 
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Empresa</FormLabel>
                        <FormControl>
                          <Input placeholder="Minha Empresa Lda" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ramo de Atividade</FormLabel>
                        <FormControl>
                          <Input placeholder="Tecnologia, Restauração, etc." {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="923 000 000" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="contato@empresa.com" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site</FormLabel>
                        <FormControl>
                          <Input placeholder="https://www.empresa.com" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Localização</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua exemplo, Luanda" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="caption"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sobre a Empresa</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Uma breve descrição da sua empresa..." className="min-h-[80px]" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

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

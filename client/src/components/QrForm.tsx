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
      instagramUser: "",
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

      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const resourceType = isPdf ? 'raw' : 'auto';
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
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
        let downloadUrl = result.secure_url;
        // Don't force attachment for preview/display, Cloudinary handles images well
        
        form.setValue(fieldName, downloadUrl);
        if (activeType === "pdf") {
          form.setValue("url", downloadUrl);
        }
        
        // Ensure we trigger a generation update with the new URL
        const currentValues = form.getValues();
        onGenerate({ ...currentValues, [fieldName]: downloadUrl });
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
      case "facebook":
      case "pdf":
        defaultValues = { ...defaultValues, url: "" };
        break;
      case "instagram":
        defaultValues = { ...defaultValues, url: "", instagramUser: "" };
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
        defaultValues = { ...defaultValues, title: "", description: "", website: "", url: "", buttonLabel: "", fileUrl: "" };
        break;
      case "business":
        defaultValues = { ...defaultValues, companyName: "", industry: "", caption: "", photoUrl: "", location: "", email: "", website: "", phone: "", openingHours: [{ day: "Segunda-feira", hours: "09:00 - 18:00" }], socialLinks: [] };
        break;
    }
    form.reset(defaultValues);
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

  const watchedValues = form.watch();
  const [lastEmitted, setLastEmitted] = useState("");

  useEffect(() => {
    const watchedStr = JSON.stringify(watchedValues) + selectedCountryCode;
    if (watchedStr !== lastEmitted && activeType) {
      setLastEmitted(watchedStr);
      const dataToGenerate = prepareData(watchedValues);
      onGenerate(dataToGenerate);
    }
  }, [watchedValues, selectedCountryCode, activeType, lastEmitted, onGenerate]);

  if (!activeType) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-border shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-foreground mb-6">1. Selecione um tipo de código QR</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {qrOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => handleTypeSelect(option.type)}
              className="group flex flex-col items-center p-4 bg-white rounded-xl border border-border/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
              data-testid={`button-qr-type-${option.type}-${index}`}
            >
              <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                <option.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="font-bold text-foreground text-center text-sm mb-0.5">{option.label}</span>
              <span className="text-[9px] text-muted-foreground text-center leading-tight">{option.description}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeType}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg min-h-[250px] pb-24"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {qrOptions.find(o => o.type === activeType)?.icon && (
                    <div className="text-primary">
                      {(() => {
                        const Icon = qrOptions.find(o => o.type === activeType)!.icon;
                        return <Icon className="w-4 h-4" />;
                      })()}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {qrOptions.find(o => o.type === activeType)?.label}
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    {qrOptions.find(o => o.type === activeType)?.description}
                  </p>
                </div>
              </div>

              {activeType === "url" && (
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">URL do Site</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-white mt-1.5 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                            <Globe className="w-4 h-4 text-gray-400" />
                            <Input 
                              placeholder="https://exemplo.com" 
                              {...field} 
                              value={field.value || ''} 
                              className="border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none h-auto p-0" 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {activeType === "instagram" && (
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">URL do Perfil</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-white mt-1.5 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                            <Globe className="w-4 h-4 text-gray-400" />
                            <Input 
                              placeholder="https://instagram.com/seu.usuario" 
                              {...field} 
                              value={field.value || ''} 
                              className="border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none h-auto p-0" 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {activeType === "whatsapp" && (
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Número do WhatsApp</FormLabel>
                        <FormControl>
                          <div className="flex gap-2 mt-1.5">
                            <Select value={selectedCountryCode} onValueChange={setSelectedCountryCode}>
                              <SelectTrigger className="w-[100px] h-11 rounded-lg border border-gray-200 bg-white">
                                <SelectValue placeholder="+" />
                              </SelectTrigger>
                              <SelectContent>
                                {countryCodes.map((c) => (
                                  <SelectItem key={c.code} value={c.code}>
                                    {c.flag} +{c.code}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input 
                              placeholder="923 000 000" 
                              {...field} 
                              value={field.value || ''} 
                              className="h-11 rounded-lg border-gray-200" 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Mensagem (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Olá, gostaria de saber mais sobre seus serviços..." 
                            {...field} 
                            value={field.value || ''} 
                            className="min-h-[100px] rounded-lg border-gray-200" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {activeType === "pdf" && (
                <div className="space-y-6">
                   <div className="space-y-2">
                    <FormLabel className="text-sm font-medium text-gray-700">Upload do PDF</FormLabel>
                    <div 
                      className={`border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                      onClick={() => document.getElementById('pdf-upload')?.click()}
                    >
                      <input
                        id="pdf-upload"
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, "fileUrl");
                        }}
                      />
                      <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                        <Upload className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">Clique para carregar PDF</p>
                      <p className="text-xs text-gray-400 mt-1">PDF até 10MB</p>
                      
                      {isUploading && (
                        <div className="w-full max-w-[200px] mt-4">
                          <Progress value={progress} className="h-1" />
                        </div>
                      )}
                      
                      {(watchedValues as any).fileUrl && !isUploading && (
                        <div className="mt-4 p-2 bg-green-50 rounded-lg border border-green-100 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-[10px] font-medium text-green-700">Upload concluído</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeType === "links" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Título da Página</FormLabel>
                          <FormControl>
                            <Input placeholder="Meus Links" {...field} value={field.value || ''} />
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
                          <FormLabel className="text-sm font-medium text-gray-700">Descrição</FormLabel>
                          <FormControl>
                            <Input placeholder="Confira minhas redes sociais" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-base font-bold text-foreground">Links</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ label: "", url: "" })}
                        className="flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar Link
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {fields.map((item, index) => (
                        <div key={item.id} className="flex gap-3 items-start p-4 bg-gray-50 rounded-xl border border-gray-100 group">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormField
                              control={form.control}
                              name={`links.${index}.label`}
                              render={({ field }) => (
                                <FormItem className="space-y-1">
                                  <FormControl>
                                    <Input placeholder="Nome (ex: Instagram)" {...field} value={field.value || ''} className="bg-white" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`links.${index}.url`}
                              render={({ field }) => (
                                <FormItem className="space-y-1">
                                  <FormControl>
                                    <Input placeholder="https://..." {...field} value={field.value || ''} className="bg-white" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeType === "images" && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <FormLabel className="text-sm font-medium text-gray-700">Informações da imagem</FormLabel>
                    <div className="grid grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-muted-foreground uppercase font-bold">Título da galeria de imagens/álbum</FormLabel>
                            <FormControl>
                              <Input placeholder="Exemplo: Minha galeria" {...field} value={field.value || ""} />
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
                            <FormLabel className="text-xs text-muted-foreground uppercase font-bold">Descrição da galeria de imagens/álbum</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Por exemplo, fotos de verão" 
                                {...field} 
                                value={field.value || ""} 
                                className="min-h-[100px] resize-none"
                              />
                            </FormControl>
                            <div className="text-[10px] text-right text-muted-foreground">
                              {(field.value || "").length} / 4000
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="space-y-2">
                        <FormLabel className="text-xs text-muted-foreground uppercase font-bold">Upload da Imagem</FormLabel>
                        <div 
                          className={`border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
                          onClick={() => document.getElementById("image-upload")?.click()}
                        >
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, "fileUrl");
                            }}
                          />
                          <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                            <Upload className="w-6 h-6 text-primary" />
                          </div>
                          <p className="text-sm font-medium text-gray-700">Clique para carregar imagem</p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG ou GIF até 10MB</p>
                          
                          {isUploading && (
                            <div className="w-full max-w-[200px] mt-4">
                              <Progress value={progress} className="h-1" />
                            </div>
                          )}
                          
                          {(watchedValues as any).fileUrl && !isUploading && (
                            <div className="mt-4 p-2 bg-green-50 rounded-lg border border-green-100 flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <span className="text-[10px] font-medium text-green-700">Upload concluído</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-muted-foreground uppercase font-bold">Site</FormLabel>
                            <FormControl>
                              <Input placeholder="Exemplo: https://www.mypictures.com/" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="buttonLabel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-muted-foreground uppercase font-bold">Texto do Botão</FormLabel>
                            <FormControl>
                              <Input placeholder="Exemplo: Ver mais" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeType === "business" && (
                <div className="space-y-6">
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
                </div>
              )}

              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setActiveType(null); onStepChange(1); }}
                    className="rounded-xl px-8 h-12 font-medium border-primary text-primary hover:bg-primary/5"
                  >
                    ← Voltar
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-xl px-8 h-12 font-medium bg-primary hover:bg-primary/90 text-white shadow-md flex items-center gap-2"
                    data-testid="button-qr-generate"
                  >
                    Próximo →
                  </Button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </form>
      </Form>
    </div>
  );
}

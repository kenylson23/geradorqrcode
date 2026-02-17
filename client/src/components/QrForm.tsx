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
  Image as ImageIcon, 
  Facebook, 
  Instagram, 
  Users, 
  MessageCircle, 
  Music,
  Sparkles,
  Upload,
  RefreshCw
} from "lucide-react";
import { useState } from "react";
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
  { type: "pdf", label: "PDF", description: "Exibir um PDF", icon: FileText },
  { type: "links", label: "Lista de links", description: "Compartilhar vários links", icon: Share2 },
  { type: "business", label: "Negócios", description: "Compartilhe informações sobre sua empresa", icon: Briefcase },
  { type: "vcard", label: "vCard", description: "Compartilhe um cartão de visita digital", icon: UserCircle },
  { type: "video", label: "Vídeo", description: "Mostrar um vídeo", icon: Video },
  { type: "images", label: "Imagens", description: "Compartilhar várias imagens", icon: ImageIcon },
  { type: "facebook", label: "Facebook", description: "Compartilhe sua página do Facebook", icon: Facebook },
  { type: "instagram", label: "Instagram", description: "Compartilhe seu Instagram", icon: Instagram },
  { type: "whatsapp", label: "WhatsApp", description: "Receba mensagens do WhatsApp", icon: MessageCircle },
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

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    } finally {
      setIsUploading(false);
      setProgress(100);
    }
  };

  const handleFileUpload = async (file: File, fieldName: any) => {
    const result = await uploadFile(file);
    if (result) {
      form.setValue(fieldName, result.url || result.objectPath);
    }
  };

  const handleTypeSelect = (type: any) => {
    setActiveType(type);
    onStepChange(2);
    
    switch (type) {
      case "url":
      case "video":
      case "facebook":
      case "instagram":
      case "pdf":
        form.reset({ type: type as any, url: "" });
        break;
      case "text":
        form.reset({ type: "text", text: "" });
        break;
      case "whatsapp":
        form.reset({ type: "whatsapp", phone: "", message: "" });
        break;
      case "email":
        form.reset({ type: "email", email: "", subject: "", body: "" });
        break;
      case "phone":
        form.reset({ type: "phone", phone: "" });
        break;
      case "links":
        form.reset({ 
          type: "links", 
          title: "",
          description: "",
          photoUrl: "",
          links: [{ label: "", url: "" }] 
        });
        break;
      case "vcard":
        form.reset({ 
          type: "vcard", 
          firstName: "", 
          lastName: "", 
          phone: "", 
          email: "", 
          organization: "", 
          jobTitle: "",
          website: "",
          location: "",
          companyName: "",
          profession: "",
          summary: "",
          socialLinks: []
        });
        break;
      case "images":
        form.reset({ type: "images", urls: [""] });
        break;
      case "business":
        form.reset({ 
          type: "business", 
          companyName: "", 
          industry: "", 
          caption: "", 
          photoUrl: "", 
          location: "", 
          email: "", 
          website: "", 
          phone: "",
          openingHours: [{ day: "Segunda-feira", hours: "09:00 - 18:00" }],
          socialLinks: []
        });
        break;
    }
  };

  const onSubmit = (data: QrCodeForm) => {
    const modifiedData = { ...data } as any;
    if ((data.type === 'whatsapp' || data.type === 'phone' || data.type === 'vcard') && data.phone) {
      if (!data.phone.startsWith('+')) {
        modifiedData.phone = `+${selectedCountryCode}${data.phone.replace(/^0+/, '')}`;
      }
    }
    onGenerate(modifiedData);
  };

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
      <Button 
        variant="ghost" 
        onClick={() => {
          setActiveType(null);
          onStepChange(1);
        }} 
        className="mb-4 text-muted-foreground hover:text-primary"
      >
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
              {(activeType === "url" || activeType === "video" || activeType === "facebook" || activeType === "instagram" || activeType === "pdf") && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-foreground">
                          {activeType === "pdf" ? "URL do PDF" : 
                           activeType === "video" ? "URL do Vídeo" : 
                           activeType === "facebook" ? "URL do Facebook" : 
                           activeType === "instagram" ? "URL do Instagram" : "URL do Site"}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com" 
                            {...field} 
                            value={field.value || ''}
                            className="h-12 rounded-xl border-2 border-border focus-visible:ring-primary/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {activeType === "video" && (
                    <div className="space-y-2">
                      <FormLabel className="text-sm font-medium">Ou faça upload do arquivo</FormLabel>
                      <div className="flex flex-col gap-2">
                        <Input
                          type="file"
                          accept="video/*"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "fileUrl")}
                          disabled={isUploading}
                          className="cursor-pointer"
                        />
                        {isUploading && <Progress value={progress} className="h-2" />}
                        {form.watch("fileUrl") && (
                          <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                            <Upload className="w-3 h-3" /> Arquivo carregado com sucesso!
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeType === "vcard" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <FormLabel>Foto de Perfil</FormLabel>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "photoUrl")}
                      disabled={isUploading}
                    />
                    {isUploading && <Progress value={progress} className="h-2" />}
                  </div>
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl><Input {...field} value={field.value || ''}/></FormControl>
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
                        <FormControl><Input {...field} value={field.value || ''}/></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Telefone</FormLabel>
                        <div className="flex gap-2">
                          <Select value={selectedCountryCode} onValueChange={setSelectedCountryCode}>
                            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {countryCodes.map(c => <SelectItem key={c.code} value={c.code}>{c.flag} +{c.code}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormControl><Input {...field} value={field.value || ''} placeholder="923 000 000"/></FormControl>
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
                        <FormControl><Input type="email" {...field} value={field.value || ''}/></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="organization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Empresa</FormLabel>
                        <FormControl><Input {...field} value={field.value || ''}/></FormControl>
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
                        <FormControl><Input placeholder="https://..." {...field} value={field.value || ''}/></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Localização</FormLabel>
                        <FormControl><Input placeholder="Endereço ou Cidade" {...field} value={field.value || ''}/></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="md:col-span-2 border-t pt-4 mt-2">
                    <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Detalhes da Empresa</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome da Empresa</FormLabel>
                            <FormControl><Input placeholder="Sua Empresa" {...field} value={field.value || ''}/></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="profession"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Profissão</FormLabel>
                            <FormControl><Input placeholder="Ex: Designer, Engenheiro" {...field} value={field.value || ''}/></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="summary"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Resumo sobre a empresa ou negócio</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Conte um pouco sobre seu negócio..." 
                                className="resize-none"
                                {...field} 
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2 border-t pt-4 mt-2">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Redes Sociais</h3>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const current = form.getValues("socialLinks" as any) || [];
                          form.setValue("socialLinks" as any, [...current, { platform: "Instagram", url: "" }]);
                        }}
                      >
                        + Adicionar
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {(form.watch("socialLinks" as any) || []).map((_: any, index: number) => (
                        <div key={index} className="flex gap-2 items-end border p-3 rounded-lg bg-slate-50/50">
                          <FormField
                            control={form.control}
                            name={`socialLinks.${index}.platform`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel className="text-xs">Plataforma</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-9">
                                      <SelectValue placeholder="Plataforma" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Instagram">Instagram</SelectItem>
                                    <SelectItem value="Facebook">Facebook</SelectItem>
                                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                                    <SelectItem value="Twitter">Twitter/X</SelectItem>
                                    <SelectItem value="YouTube">YouTube</SelectItem>
                                    <SelectItem value="TikTok">TikTok</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`socialLinks.${index}.url`}
                            render={({ field }) => (
                              <FormItem className="flex-[2]">
                                <FormLabel className="text-xs">URL do Perfil</FormLabel>
                                <FormControl><Input className="h-9" placeholder="https://..." {...field} /></FormControl>
                              </FormItem>
                            )}
                          />
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon"
                            className="text-destructive h-9 w-9"
                            onClick={() => {
                              const current = form.getValues("socialLinks" as any) || [];
                              form.setValue("socialLinks" as any, current.filter((_: any, i: number) => i !== index));
                            }}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeType === "business" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <FormLabel>Foto da Empresa</FormLabel>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "photoUrl")}
                      disabled={isUploading}
                    />
                    {isUploading && <Progress value={progress} className="h-2" />}
                  </div>
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Empresa</FormLabel>
                        <FormControl><Input placeholder="Nome da sua empresa" {...field} value={field.value || ''}/></FormControl>
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
                        <FormControl><Input placeholder="Ex: Restauração, Tecnologia" {...field} value={field.value || ''}/></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="caption"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Legenda / Slogan</FormLabel>
                        <FormControl><Input placeholder="Uma frase curta sobre seu negócio" {...field} value={field.value || ''}/></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="md:col-span-2 border-t pt-4 mt-2">
                    <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Horário de Funcionamento</h3>
                    <div className="space-y-3">
                      {(form.watch("openingHours" as any) || []).map((_: any, index: number) => (
                        <div key={index} className="flex gap-2 items-end">
                          <FormField
                            control={form.control}
                            name={`openingHours.${index}.day`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl><Input placeholder="Dia (Ex: Seg-Sex)" {...field} /></FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`openingHours.${index}.hours`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl><Input placeholder="Horas (Ex: 08:00 - 17:00)" {...field} /></FormControl>
                              </FormItem>
                            )}
                          />
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              const current = form.getValues("openingHours" as any) || [];
                              form.setValue("openingHours" as any, current.filter((_: any, i: number) => i !== index));
                            }}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="w-full border-dashed"
                        onClick={() => {
                          const current = form.getValues("openingHours" as any) || [];
                          form.setValue("openingHours" as any, [...current, { day: "", hours: "" }]);
                        }}
                      >
                        + Adicionar Horário
                      </Button>
                    </div>
                  </div>

                  <div className="md:col-span-2 border-t pt-4 mt-2">
                    <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Contato e Localização</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl><Input placeholder="+244 ..." {...field} value={field.value || ''}/></FormControl>
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
                            <FormControl><Input type="email" placeholder="contato@empresa.com" {...field} value={field.value || ''}/></FormControl>
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
                            <FormControl><Input placeholder="https://..." {...field} value={field.value || ''}/></FormControl>
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
                            <FormControl><Input placeholder="Endereço da empresa" {...field} value={field.value || ''}/></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 border-t pt-4 mt-2">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Redes Sociais</h3>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const current = form.getValues("socialLinks" as any) || [];
                          form.setValue("socialLinks" as any, [...current, { platform: "Instagram", url: "" }]);
                        }}
                      >
                        + Adicionar
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {(form.watch("socialLinks" as any) || []).map((_: any, index: number) => (
                        <div key={index} className="flex gap-2 items-end border p-3 rounded-lg bg-slate-50/50">
                          <FormField
                            control={form.control}
                            name={`socialLinks.${index}.platform`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-9">
                                      <SelectValue placeholder="Plataforma" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Instagram">Instagram</SelectItem>
                                    <SelectItem value="Facebook">Facebook</SelectItem>
                                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                                    <SelectItem value="Twitter">Twitter/X</SelectItem>
                                    <SelectItem value="YouTube">YouTube</SelectItem>
                                    <SelectItem value="TikTok">TikTok</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`socialLinks.${index}.url`}
                            render={({ field }) => (
                              <FormItem className="flex-[2]">
                                <FormControl><Input className="h-9" placeholder="URL do Perfil" {...field} /></FormControl>
                              </FormItem>
                            )}
                          />
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon"
                            className="text-destructive h-9 w-9"
                            onClick={() => {
                              const current = form.getValues("socialLinks" as any) || [];
                              form.setValue("socialLinks" as any, current.filter((_: any, i: number) => i !== index));
                            }}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeType === "links" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <FormLabel>Foto de Perfil</FormLabel>
                    <div className="flex flex-col gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "photoUrl")}
                        disabled={isUploading}
                        className="cursor-pointer"
                      />
                      {isUploading && <Progress value={progress} className="h-2" />}
                      {form.watch("photoUrl") && (
                        <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                          <Upload className="w-3 h-3" /> Foto carregada!
                        </p>
                      )}
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título da Lista</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Meus Contatos" {...field} value={field.value || ''} />
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
                        <FormLabel>Breve Descrição</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Uma breve descrição sobre seus links..." 
                            className="resize-none"
                            {...field} 
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-3">
                    <FormLabel>Links</FormLabel>
                    {(form.watch("links") || []).map((_, index) => (
                      <div key={index} className="p-4 border rounded-xl space-y-3 bg-slate-50/50">
                        <FormField
                          control={form.control}
                          name={`links.${index}.label`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl><Input placeholder="Título do Link (Ex: Instagram)" {...field} /></FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`links.${index}.url`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl><Input placeholder="URL (https://...)" {...field} /></FormControl>
                            </FormItem>
                          )}
                        />
                        <div className="space-y-2">
                          <FormLabel className="text-xs">Ícone/Logo do Link</FormLabel>
                          <div className="flex items-center gap-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], `links.${index}.iconUrl`)}
                              disabled={isUploading}
                              className="h-8 text-xs cursor-pointer"
                            />
                            {form.watch(`links.${index}.iconUrl`) && (
                              <div className="w-8 h-8 rounded border bg-white flex items-center justify-center overflow-hidden shrink-0">
                                <img src={form.watch(`links.${index}.iconUrl`)} alt="Icon" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>
                        </div>
                        {index > 0 && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive h-8 px-2 hover:bg-destructive/10"
                            onClick={() => {
                              const current = form.getValues("links") || [];
                              form.setValue("links", current.filter((_, i) => i !== index));
                            }}
                          >
                            Remover
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full border-dashed"
                      onClick={() => {
                        const current = form.getValues("links") || [];
                        form.setValue("links", [...current, { label: "", url: "" }]);
                      }}
                    >
                      + Adicionar Link
                    </Button>
                  </div>
                </div>
              )}

              {activeType === "images" && (
                <div className="space-y-4">
                  <FormLabel>URLs das Imagens</FormLabel>
                  {(form.watch("urls") || []).map((_, index) => (
                    <FormField
                      key={index}
                      control={form.control}
                      name={`urls.${index}`}
                      render={({ field }) => (
                        <FormControl><Input placeholder="https://image-url.com/photo.jpg" {...field} /></FormControl>
                      )}
                    />
                  ))}
                  <Button type="button" variant="outline" onClick={async () => {
                    const current = form.getValues("urls") || [];
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = async (e: any) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const result = await uploadFile(file);
                        if (result) {
                          form.setValue("urls", [...current, result.url || result.objectPath]);
                        }
                      }
                    };
                    input.click();
                  }}>Upload de Imagem</Button>
                  <Button type="button" variant="outline" onClick={() => {
                    const current = form.getValues("urls") || [];
                    form.setValue("urls", [...current, ""]);
                  }}>Adicionar Link de Imagem</Button>
                </div>
              )}

              {activeType === "business" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <FormLabel>Foto da Empresa</FormLabel>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "photoUrl")}
                      disabled={isUploading}
                    />
                    {isUploading && <Progress value={progress} className="h-2" />}
                  </div>
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Empresa</FormLabel>
                        <FormControl><Input placeholder="Nome da sua empresa" {...field} value={field.value || ''}/></FormControl>
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
                        <FormControl><Input placeholder="Ex: Restauração, Tecnologia" {...field} value={field.value || ''}/></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="caption"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Legenda / Slogan</FormLabel>
                        <FormControl><Input placeholder="Uma frase curta sobre seu negócio" {...field} value={field.value || ''}/></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="md:col-span-2 border-t pt-4 mt-2">
                    <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Horário de Funcionamento</h3>
                    <div className="space-y-3">
                      {(form.watch("openingHours" as any) || []).map((_: any, index: number) => (
                        <div key={index} className="flex gap-2 items-end">
                          <FormField
                            control={form.control}
                            name={`openingHours.${index}.day`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl><Input placeholder="Dia (Ex: Seg-Sex)" {...field} /></FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`openingHours.${index}.hours`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl><Input placeholder="Horas (Ex: 08:00 - 17:00)" {...field} /></FormControl>
                              </FormItem>
                            )}
                          />
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              const current = form.getValues("openingHours" as any) || [];
                              form.setValue("openingHours" as any, current.filter((_: any, i: number) => i !== index));
                            }}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="w-full border-dashed"
                        onClick={() => {
                          const current = form.getValues("openingHours" as any) || [];
                          form.setValue("openingHours" as any, [...current, { day: "", hours: "" }]);
                        }}
                      >
                        + Adicionar Horário
                      </Button>
                    </div>
                  </div>

                  <div className="md:col-span-2 border-t pt-4 mt-2">
                    <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Contato e Localização</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl><Input placeholder="+244 ..." {...field} value={field.value || ''}/></FormControl>
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
                            <FormControl><Input type="email" placeholder="contato@empresa.com" {...field} value={field.value || ''}/></FormControl>
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
                            <FormControl><Input placeholder="https://..." {...field} value={field.value || ''}/></FormControl>
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
                            <FormControl><Input placeholder="Endereço da empresa" {...field} value={field.value || ''}/></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 border-t pt-4 mt-2">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Redes Sociais</h3>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const current = form.getValues("socialLinks" as any) || [];
                          form.setValue("socialLinks" as any, [...current, { platform: "Instagram", url: "" }]);
                        }}
                      >
                        + Adicionar
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {(form.watch("socialLinks" as any) || []).map((_: any, index: number) => (
                        <div key={index} className="flex gap-2 items-end border p-3 rounded-lg bg-slate-50/50">
                          <FormField
                            control={form.control}
                            name={`socialLinks.${index}.platform`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-9">
                                      <SelectValue placeholder="Plataforma" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Instagram">Instagram</SelectItem>
                                    <SelectItem value="Facebook">Facebook</SelectItem>
                                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                                    <SelectItem value="Twitter">Twitter/X</SelectItem>
                                    <SelectItem value="YouTube">YouTube</SelectItem>
                                    <SelectItem value="TikTok">TikTok</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`socialLinks.${index}.url`}
                            render={({ field }) => (
                              <FormItem className="flex-[2]">
                                <FormControl><Input className="h-9" placeholder="URL do Perfil" {...field} /></FormControl>
                              </FormItem>
                            )}
                          />
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon"
                            className="text-destructive h-9 w-9"
                            onClick={() => {
                              const current = form.getValues("socialLinks" as any) || [];
                              form.setValue("socialLinks" as any, current.filter((_: any, i: number) => i !== index));
                            }}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeType === "business" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <FormLabel>Foto da Empresa</FormLabel>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "photoUrl")}
                      disabled={isUploading}
                    />
                    {isUploading && <Progress value={progress} className="h-2" />}
                  </div>
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Empresa</FormLabel>
                        <FormControl><Input placeholder="Nome da sua empresa" {...field} value={field.value || ''}/></FormControl>
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
                        <FormControl><Input placeholder="Ex: Restauração, Tecnologia" {...field} value={field.value || ''}/></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="caption"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Legenda / Slogan</FormLabel>
                        <FormControl><Input placeholder="Uma frase curta sobre seu negócio" {...field} value={field.value || ''}/></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="md:col-span-2 border-t pt-4 mt-2">
                    <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Horário de Funcionamento</h3>
                    <div className="space-y-3">
                      {(form.watch("openingHours" as any) || []).map((_: any, index: number) => (
                        <div key={index} className="flex gap-2 items-end">
                          <FormField
                            control={form.control}
                            name={`openingHours.${index}.day`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl><Input placeholder="Dia (Ex: Seg-Sex)" {...field} /></FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`openingHours.${index}.hours`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl><Input placeholder="Horas (Ex: 08:00 - 17:00)" {...field} /></FormControl>
                              </FormItem>
                            )}
                          />
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              const current = form.getValues("openingHours" as any) || [];
                              form.setValue("openingHours" as any, current.filter((_: any, i: number) => i !== index));
                            }}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="w-full border-dashed"
                        onClick={() => {
                          const current = form.getValues("openingHours" as any) || [];
                          form.setValue("openingHours" as any, [...current, { day: "", hours: "" }]);
                        }}
                      >
                        + Adicionar Horário
                      </Button>
                    </div>
                  </div>

                  <div className="md:col-span-2 border-t pt-4 mt-2">
                    <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Contato e Localização</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl><Input placeholder="+244 ..." {...field} value={field.value || ''}/></FormControl>
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
                            <FormControl><Input type="email" placeholder="contato@empresa.com" {...field} value={field.value || ''}/></FormControl>
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
                            <FormControl><Input placeholder="https://..." {...field} value={field.value || ''}/></FormControl>
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
                            <FormControl><Input placeholder="Endereço da empresa" {...field} value={field.value || ''}/></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 border-t pt-4 mt-2">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Redes Sociais</h3>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const current = form.getValues("socialLinks" as any) || [];
                          form.setValue("socialLinks" as any, [...current, { platform: "Instagram", url: "" }]);
                        }}
                      >
                        + Adicionar
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {(form.watch("socialLinks" as any) || []).map((_: any, index: number) => (
                        <div key={index} className="flex gap-2 items-end border p-3 rounded-lg bg-slate-50/50">
                          <FormField
                            control={form.control}
                            name={`socialLinks.${index}.platform`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-9">
                                      <SelectValue placeholder="Plataforma" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Instagram">Instagram</SelectItem>
                                    <SelectItem value="Facebook">Facebook</SelectItem>
                                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                                    <SelectItem value="Twitter">Twitter/X</SelectItem>
                                    <SelectItem value="YouTube">YouTube</SelectItem>
                                    <SelectItem value="TikTok">TikTok</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`socialLinks.${index}.url`}
                            render={({ field }) => (
                              <FormItem className="flex-[2]">
                                <FormControl><Input className="h-9" placeholder="URL do Perfil" {...field} /></FormControl>
                              </FormItem>
                            )}
                          />
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon"
                            className="text-destructive h-9 w-9"
                            onClick={() => {
                              const current = form.getValues("socialLinks" as any) || [];
                              form.setValue("socialLinks" as any, current.filter((_: any, i: number) => i !== index));
                            }}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeType === "text" && (
                <FormField
                  control={form.control}
                  name="text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-foreground">Conteúdo do Texto</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Digite seu texto aqui..." 
                          className="min-h-[150px] resize-none rounded-xl border-2 border-border focus-visible:ring-primary/20"
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                            <Input 
                              placeholder="923 000 000" 
                              className="h-12 rounded-xl border-2 border-border flex-1"
                              {...field} 
                              value={field.value || ''}
                            />
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
                          <Textarea 
                            placeholder="Olá, gostaria de mais informações..." 
                            className="min-h-[100px] resize-none rounded-xl border-2 border-border"
                            {...field} 
                            value={field.value || ''}
                          />
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
                          <Input 
                            placeholder="222 123 456" 
                            className="h-12 rounded-xl border-2 border-border flex-1"
                            {...field} 
                            value={field.value || ''}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </motion.div>
          </AnimatePresence>

          <Button 
            type="submit" 
            className="w-full h-14 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Gerar QR Code
          </Button>
        </form>
      </Form>
    </div>
  );
}


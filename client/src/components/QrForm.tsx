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
  Sparkles
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface QrFormProps {
  onGenerate: (data: QrCodeForm) => void;
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
  { type: "text", label: "PDF", description: "Exibir um PDF", icon: FileText }, // Reusing text for PDF logic or similar
  { type: "text", label: "Lista de links", description: "Compartilhar vários links", icon: Share2 },
  { type: "phone", label: "vCard", description: "Compartilhe um cartão de visita digital", icon: UserCircle },
  { type: "text", label: "Negócios", description: "Compartilhe informações sobre sua empresa", icon: Briefcase },
  { type: "url", label: "Vídeo", description: "Mostrar um vídeo", icon: Video },
  { type: "text", label: "Imagens", description: "Compartilhar várias imagens", icon: ImageIcon },
  { type: "url", label: "Facebook", description: "Compartilhe sua página do Facebook", icon: Facebook },
  { type: "url", label: "Instagram", description: "Compartilhe seu Instagram", icon: Instagram },
  { type: "text", label: "Mídias sociais", description: "Compartilhe seus canais de mídia social", icon: Users },
  { type: "whatsapp", label: "WhatsApp", description: "Receba mensagens do WhatsApp", icon: MessageCircle },
  { type: "text", label: "MP3", description: "Compartilhar um arquivo de áudio", icon: Music },
];

export function QrForm({ onGenerate }: QrFormProps) {
  const [activeType, setActiveType] = useState<QrType | null>(null);
  const [selectedCountryCode, setSelectedCountryCode] = useState("244");

  const form = useForm<QrCodeForm>({
    resolver: zodResolver(qrCodeFormSchema),
    defaultValues: {
      type: "url",
      url: "",
    },
    mode: "onChange"
  });

  const handleTypeSelect = (type: QrType) => {
    setActiveType(type);
    
    switch (type) {
      case "url":
        form.reset({ type: "url", url: "" });
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
    }
  };

  const onSubmit = (data: QrCodeForm) => {
    const modifiedData = { ...data } as any;
    if ((data.type === 'whatsapp' || data.type === 'phone') && data.phone) {
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
        onClick={() => setActiveType(null)} 
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
              {activeType === "url" && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-foreground">URL do Site</FormLabel>
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


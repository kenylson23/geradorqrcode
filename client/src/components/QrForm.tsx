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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Link as LinkIcon, 
  Type, 
  Phone, 
  Mail, 
  MessageCircle, 
  Sparkles
} from "lucide-react";
import { useEffect, useState } from "react";
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

const icons: Record<QrType, React.ReactNode> = {
  url: <LinkIcon className="w-4 h-4" />,
  text: <Type className="w-4 h-4" />,
  whatsapp: <MessageCircle className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  phone: <Phone className="w-4 h-4" />,
};

const labels: Record<QrType, string> = {
  url: "Website",
  text: "Texto",
  whatsapp: "WhatsApp",
  email: "E-mail",
  phone: "Telefone",
};

export function QrForm({ onGenerate }: QrFormProps) {
  const [activeTab, setActiveTab] = useState<QrType>("url");
  const [selectedCountryCode, setSelectedCountryCode] = useState("244");

  const form = useForm<QrCodeForm>({
    resolver: zodResolver(qrCodeFormSchema),
    defaultValues: {
      type: "url",
      url: "",
    },
    mode: "onChange"
  });

  // Reset form when tab changes
  const handleTabChange = (value: string) => {
    const type = value as QrType;
    setActiveTab(type);
    
    // Set appropriate default values for the new type
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
    // Add country code if it's a phone-based type and not already present
    const modifiedData = { ...data } as any;
    if ((data.type === 'whatsapp' || data.type === 'phone') && data.phone) {
      // If the phone doesn't start with +, add the selected country code
      if (!data.phone.startsWith('+')) {
        modifiedData.phone = `+${selectedCountryCode}${data.phone.replace(/^0+/, '')}`;
      }
    }
    onGenerate(modifiedData);
  };

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full grid grid-cols-5 p-1 bg-muted/50 rounded-xl mb-6">
          {qrTypes.map((type) => (
            <TabsTrigger 
              key={type} 
              value={type}
              className="flex flex-col sm:flex-row items-center gap-2 py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-200"
            >
              {icons[type]}
              <span className="hidden sm:inline text-xs font-medium">{labels[type]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white p-6 rounded-2xl border border-border shadow-sm min-h-[300px]"
              >
                <TabsContent value="url" className="mt-0 space-y-4">
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-foreground">URL do Site</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://www.angola-online.ao" 
                            {...field} 
                            value={field.value || ''}
                            className="input-field"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <p className="text-sm text-muted-foreground">Cole o link para o qual você deseja que as pessoas sejam direcionadas.</p>
                </TabsContent>

                <TabsContent value="text" className="mt-0 space-y-4">
                  <FormField
                    control={form.control}
                    name="text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-foreground">Texto Simples</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Olá! Este é um código QR de texto." 
                            className="min-h-[150px] resize-none rounded-xl border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 p-4"
                            {...field} 
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="whatsapp" className="mt-0 space-y-4">
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
                              className="input-field flex-1"
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
                            className="min-h-[100px] resize-none rounded-xl border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 p-4"
                            {...field} 
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="email" className="mt-0 space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-foreground">E-mail de Destino</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="contacto@empresa.ao" 
                            className="input-field"
                            {...field} 
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-foreground">Assunto (Opcional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Dúvida sobre produto" 
                            className="input-field"
                            {...field} 
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="body"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-foreground">Corpo do E-mail (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Escreva sua mensagem aqui..." 
                            className="min-h-[100px] resize-none rounded-xl border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 p-4"
                            {...field} 
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="phone" className="mt-0 space-y-4">
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
                              className="input-field flex-1"
                              {...field} 
                              value={field.value || ''}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <p className="text-sm text-muted-foreground">O código QR iniciará uma chamada telefônica quando escaneado.</p>
                </TabsContent>
              </motion.div>
            </AnimatePresence>

            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-200"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Gerar QR Code
            </Button>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}


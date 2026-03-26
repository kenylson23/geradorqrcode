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
  Trash2,
  Clock,
  ChevronDown
} from "lucide-react";
import { SiTiktok, SiYoutube, SiInstagram, SiFacebook, SiWhatsapp } from "react-icons/si";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useFieldArray } from "react-hook-form";
import { Progress } from "@/components/ui/progress";

import { useUpload } from "@/hooks/use-upload";

const SOCIAL_OPTIONS = [
  { type: "instagram", label: "Instagram", Icon: SiInstagram, color: "#E1306C", placeholder: "https://instagram.com/seu_perfil" },
  { type: "tiktok",    label: "TikTok",    Icon: SiTiktok,    color: "#000000", placeholder: "https://tiktok.com/@seu_perfil" },
  { type: "facebook",  label: "Facebook",  Icon: SiFacebook,  color: "#1877F2", placeholder: "https://facebook.com/sua_pagina" },
  { type: "whatsapp",  label: "WhatsApp",  Icon: SiWhatsapp,  color: "#25D366", placeholder: "https://wa.me/seu_numero" },
  { type: "youtube",   label: "YouTube",   Icon: SiYoutube,   color: "#FF0000", placeholder: "https://youtube.com/@seu_canal" },
];

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

export const QrForm = forwardRef(({ onGenerate, onStepChange }, ref) => {
  const LS_KEY = "angoqrcode_form_state";
  const [activeType, setActiveType] = useState<QrType | null>(null);
  const [selectedCountryCode, setSelectedCountryCode] = useState("244");
  const [isUploading, setIsUploading] = useState(false);
  const [openingHoursOpen, setOpeningHoursOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOverZone, setDragOverZone] = useState<string | null>(null);

  const handleMultipleImageUpload = async (files: File[]) => {
    const current: string[] = (form.getValues() as any).fileUrls || [];
    const remaining = 10 - current.length;
    const toUpload = files.filter(f => f.type.startsWith('image/')).slice(0, remaining);
    if (toUpload.length === 0) return;
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    setIsUploading(true);
    const newUrls: string[] = [...current];
    for (let i = 0; i < toUpload.length; i++) {
      const file = toUpload[i];
      setProgress(Math.round((i / toUpload.length) * 100));
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", uploadPreset);
      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: fd });
        const result = await res.json();
        if (result.secure_url) {
          let url = result.secure_url;
          if (result.public_id && url.includes('.pdf')) {
            url = `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/v${result.version}/${result.public_id}`;
          }
          newUrls.push(url);
        }
      } catch {}
    }
    setProgress(100);
    setIsUploading(false);
    form.setValue("fileUrls" as any, newUrls);
    onGenerate({ ...form.getValues(), fileUrls: newUrls });
  };

  const createDropHandlers = (zoneId: string, onFileDrop: (files: File[]) => void) => ({
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragOverZone(zoneId); },
    onDragLeave: (e: React.DragEvent) => { e.preventDefault(); setDragOverZone(null); },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault(); e.stopPropagation(); setDragOverZone(null);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) onFileDrop(files);
    },
  });

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
      
      // Validate image files
      const isImageField = fieldName === 'photoUrl' || fieldName.includes('imageUrl');
      console.log("Upload attempt:", { fileName: file.name, fileType: file.type, fieldName, isImageField });
      
      if (isImageField) {
        const isImage = file.type.startsWith('image/');
        const validImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
        const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
        const hasValidExtension = validImageExtensions.includes(fileExtension);
        
        console.log("Image validation:", { isImage, fileType: file.type, fileExtension, hasValidExtension });
        
        if (!isImage || !hasValidExtension) {
          console.error("Invalid file type for image field:", file.type, file.name);
          throw new Error("Por favor, selecione uma imagem válida (JPG, PNG, GIF, WebP, etc.)");
        }
      }
      
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        throw new Error("Configurações do Cloudinary (Cloud Name ou Upload Preset) não encontradas.");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      
      // Preserve original format by specifying quality and format explicitly
      if (isImageField) {
        formData.append("fetch_format", "auto");
        formData.append("quality", "auto");
      }

      // Use 'auto' endpoint for all files to avoid forced transformations
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
        // If for image field and the returned URL has .pdf, try to reconstruct with original extension
        let downloadUrl = result.secure_url;
        
        if (isImageField && result.public_id && downloadUrl.includes('.pdf')) {
          // Reconstruct URL using public_id to avoid forced PDF conversion
          // Add image transformations (f_auto=automatic format, q_auto=automatic quality)
          // Format: https://res.cloudinary.com/{cloud_name}/image/upload/f_auto,q_auto/{version}/{public_id}
          const version = result.version ? `v${result.version}` : 'v1';
          downloadUrl = `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${version}/${result.public_id}`;
          console.log("Reconstructed image URL:", { downloadUrl, public_id: result.public_id, version: result.version });
        }
        
        console.log("Upload success, URL:", { downloadUrl, fieldName, isImageField, hasPdf: downloadUrl.includes('.pdf') });
        
        // Update form value and trigger immediate re-render
        form.setValue(fieldName, downloadUrl, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
        
        if (activeType === "pdf") {
          form.setValue("url", downloadUrl, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
        }
        
        // Small delay to allow form state to update before generating
        setTimeout(() => {
          const updatedValues = form.getValues();
          console.log("Emitting updated values after upload:", updatedValues);
          onGenerate(updatedValues);
        }, 100);
      }
    } catch (error: any) {
      console.error("Erro no processamento do arquivo:", error);
      alert(error.message || "Erro ao processar o arquivo.");
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const handleTypeSelect = (type: QrType) => {
    setActiveType(type);
    onStepChange(2);
    
    let defaultValues: any = { type };
    switch (type) {
      case "url":
        defaultValues = { ...defaultValues, url: "" };
        break;
      case "facebook":
        defaultValues = { ...defaultValues, url: "", title: "", description: "", buttonLabel: "", photoUrl: "" };
        break;
      case "pdf":
        defaultValues = { ...defaultValues, url: "", companyName: "", title: "", description: "", website: "", buttonLabel: "", fileUrl: "" };
        break;
      case "instagram":
        defaultValues = { ...defaultValues, url: "", instagramUser: "", title: "", description: "", buttonLabel: "", photoUrl: "" };
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
        defaultValues = { ...defaultValues, title: "", description: "", photoUrl: "", links: [{ label: "", url: "", imageUrl: "" }] };
        break;
      case "vcard":
        defaultValues = { ...defaultValues, firstName: "", lastName: "", phone: "", whatsappNumber: "", email: "", organization: "", jobTitle: "", website: "", location: "", companyName: "", profession: "", summary: "", photoUrl: "", socialLinks: [] };
        break;
      case "images":
        defaultValues = { ...defaultValues, title: "", description: "", website: "", url: "", buttonLabel: "", fileUrl: "", fileUrls: [] };
        break;
      case "business":
        defaultValues = { ...defaultValues, companyName: "", industry: "", caption: "", photoUrl: "", location: "", mapsUrl: "", email: "", website: "", phone: "", whatsappNumber: "", openingHours: [
          { day: "Segunda-Feira", enabled: false, slots: [{ from: "", to: "" }] },
          { day: "Terça-Feira",   enabled: false, slots: [{ from: "", to: "" }] },
          { day: "Quarta-Feira",  enabled: false, slots: [{ from: "", to: "" }] },
          { day: "Quinta-Feira",  enabled: false, slots: [{ from: "", to: "" }] },
          { day: "Sexta-Feira",   enabled: false, slots: [{ from: "", to: "" }] },
          { day: "Sábado",        enabled: false, slots: [{ from: "", to: "" }] },
          { day: "Domingo",       enabled: false, slots: [{ from: "", to: "" }] },
        ], socialLinks: [] };
        break;
    }
    form.reset(defaultValues);
    onGenerate(defaultValues);
  };

  
    useImperativeHandle(ref, () => ({
      handleBack
    }));

    const handleBack = () => {
      setActiveType(null);
      onStepChange(1);
      localStorage.removeItem(LS_KEY);
      form.reset({
        type: "url",
        url: "",
        instagramUser: "",
      });
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

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const { type, values, countryCode } = JSON.parse(saved);
        if (type && values) {
          setActiveType(type);
          if (countryCode) setSelectedCountryCode(countryCode);
          form.reset(values);
          onStepChange(2);
          onGenerate(values);
        }
      }
    } catch {
      // ignore parse errors
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    if (activeType) {
      try {
        localStorage.setItem(LS_KEY, JSON.stringify({
          type: activeType,
          values: watchedValues,
          countryCode: selectedCountryCode,
        }));
      } catch {
        // ignore storage errors
      }
    }
  }, [watchedValues, activeType, selectedCountryCode]);

  useEffect(() => {
    const watchedStr = JSON.stringify(watchedValues) + selectedCountryCode;
    if (watchedStr !== lastEmitted && activeType) {
      console.log("Form update detected, emitting:", watchedValues);
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
          <div
              key={activeType}
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg min-h-[250px] pb-20 animate-in fade-in slide-in-from-right-2 duration-200"
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
                        <FormLabel className="text-sm font-medium text-gray-700">URL do Perfil do Instagram</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-white mt-1.5 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                            <Instagram className="w-4 h-4 text-pink-500" />
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

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Nome / Título</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Fashion Inspiration" {...field} value={field.value || ''} />
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
                          <Textarea
                            placeholder="Descrição do seu perfil do Instagram..."
                            {...field}
                            value={field.value || ''}
                            className="min-h-[80px]"
                          />
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
                        <FormLabel className="text-sm font-medium text-gray-700">Texto do Botão</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Ver nosso Instagram" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col items-center gap-3">
                    <div
                      className={`relative w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors overflow-hidden ${isUploading ? 'opacity-50 pointer-events-none' : dragOverZone === 'instagram-photo' ? 'border-primary bg-primary/5' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
                      onClick={() => document.getElementById('instagram-photo-upload')?.click()}
                      data-testid="button-upload-instagram-photo"
                      {...createDropHandlers('instagram-photo', ([file]) => file && handleFileUpload(file, 'photoUrl'))}
                    >
                      <input
                        id="instagram-photo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, "photoUrl");
                        }}
                      />
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-1 text-gray-400">
                          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                          <span className="text-[9px] font-medium">{progress}%</span>
                        </div>
                      ) : watchedValues.photoUrl ? (
                        <img src={watchedValues.photoUrl} className="w-full h-full object-cover" alt="Foto de Perfil" />
                      ) : (
                        <div className="flex flex-col items-center text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4a4 4 0 100 8 4 4 0 000-8zM6 20v-1a6 6 0 0112 0v1" />
                          </svg>
                          <span className="text-[10px] font-medium">Foto</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Clique ou arraste a foto</p>
                  </div>
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
                            <select
                              value={selectedCountryCode}
                              onChange={(e) => setSelectedCountryCode(e.target.value)}
                              className="w-[100px] h-11 rounded-lg border border-gray-200 bg-white text-sm px-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                            >
                              {countryCodes.map((c) => (
                                <option key={c.code} value={c.code}>{c.flag} +{c.code}</option>
                              ))}
                            </select>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Empresa</FormLabel>
                          <FormControl>
                            <Input placeholder="Sua Empresa" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Título do PDF</FormLabel>
                          <FormControl>
                            <Input placeholder="Título do Documento" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Descrição</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Breve descrição do conteúdo..." {...field} value={field.value || ''} className="min-h-[80px]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Site</FormLabel>
                          <FormControl>
                            <Input placeholder="https://seusite.com" {...field} value={field.value || ''} />
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
                          <FormLabel className="text-sm font-medium text-gray-700">Texto do Botão</FormLabel>
                          <FormControl>
                            <Input placeholder="Download PDF" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <FormLabel className="text-sm font-medium text-gray-700">Upload do PDF</FormLabel>
                    <div 
                      className={`border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center cursor-pointer relative ${isUploading ? 'opacity-50 pointer-events-none' : dragOverZone === 'pdf' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'}`}
                      onClick={() => document.getElementById('pdf-upload')?.click()}
                      {...createDropHandlers('pdf', ([file]) => file && handleFileUpload(file, 'fileUrl'))}
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
                      {dragOverZone === 'pdf' ? (
                        <div className="flex flex-col items-center gap-2 pointer-events-none">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Upload className="w-6 h-6 text-primary" />
                          </div>
                          <p className="text-sm font-semibold text-primary">Solte para carregar</p>
                        </div>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                            <Upload className="w-6 h-6 text-primary" />
                          </div>
                          <p className="text-sm font-medium text-gray-700">Clique ou arraste o PDF aqui</p>
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
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeType === "links" && (
                <div className="space-y-6">
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className={`relative w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors overflow-hidden ${isUploading ? 'opacity-50 pointer-events-none' : dragOverZone === 'links-photo' ? 'border-primary bg-primary/5' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
                      onClick={() => document.getElementById('profile-upload')?.click()}
                      {...createDropHandlers('links-photo', ([file]) => file && handleFileUpload(file, 'photoUrl'))}
                    >
                      <input
                        id="profile-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file, "photoUrl");
                            e.target.value = '';
                          }
                        }}
                      />
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-1 text-gray-400">
                          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                          <span className="text-[9px] font-medium">{progress}%</span>
                        </div>
                      ) : watchedValues.photoUrl ? (
                        <img src={watchedValues.photoUrl} className="w-full h-full object-cover" alt="Foto de Perfil" />
                      ) : (
                        <div className="flex flex-col items-center text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4a4 4 0 100 8 4 4 0 000-8zM6 20v-1a6 6 0 0112 0v1" />
                          </svg>
                          <span className="text-[10px] font-medium">Foto</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Clique ou arraste a foto</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Nome do Perfil</FormLabel>
                          <FormControl>
                            <Input placeholder="Stephanie Nichols" {...field} value={field.value || ''} />
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
                          <FormLabel className="text-sm font-medium text-gray-700">Bio/Descrição</FormLabel>
                          <FormControl>
                            <Input placeholder="Confira minhas redes sociais" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* ── REDES SOCIAIS ─────────────────────────────── */}
                  <div className="space-y-3">
                    <FormLabel className="text-base font-bold text-foreground">Redes Sociais</FormLabel>
                    <div className="space-y-2">
                      {SOCIAL_OPTIONS.map(({ type, label, Icon, color, placeholder }) => {
                        const fieldIndex = fields.findIndex((_, i) =>
                          (watchedValues as any).links?.[i]?.socialType === type
                        );
                        const isActive = fieldIndex !== -1;
                        return (
                          <div
                            key={type}
                            className={`rounded-xl border transition-all overflow-hidden ${
                              isActive ? "border-gray-200 bg-white shadow-sm" : "border-gray-100 bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center gap-3 px-3 py-2.5">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: isActive ? color + "18" : "#f3f4f6" }}
                              >
                                <Icon size={18} style={{ color: isActive ? color : "#9ca3af" }} />
                              </div>
                              <span className={`flex-1 text-sm font-medium ${isActive ? "text-gray-800" : "text-gray-500"}`}>
                                {label}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (isActive) {
                                    remove(fieldIndex);
                                  } else {
                                    append({ label, url: "", imageUrl: "", socialType: type });
                                  }
                                }}
                                className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                                  isActive
                                    ? "bg-red-50 text-red-500 hover:bg-red-100"
                                    : "bg-primary/10 text-primary hover:bg-primary/20"
                                }`}
                              >
                                {isActive ? "Remover" : "Adicionar"}
                              </button>
                            </div>
                            {isActive && (
                              <div className="px-3 pb-3">
                                <FormField
                                  control={form.control}
                                  name={`links.${fieldIndex}.url`}
                                  render={({ field }) => (
                                    <FormItem className="space-y-1">
                                      <FormControl>
                                        <Input
                                          placeholder={placeholder}
                                          {...field}
                                          value={field.value || ''}
                                          className="bg-gray-50 text-sm"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── LINKS PERSONALIZADOS ─────────────────────── */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-base font-bold text-foreground">Links Personalizados</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ label: "", url: "", imageUrl: "", socialType: "" })}
                        className="flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar Link
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {fields.map((item, index) => {
                        const socialType = (watchedValues as any).links?.[index]?.socialType;
                        if (socialType) return null;
                        return (
                          <div key={item.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-12 h-12 bg-white rounded-xl border flex items-center justify-center flex-shrink-0 overflow-hidden cursor-pointer transition-colors relative group ${dragOverZone === `link-img-${index}` ? 'border-primary bg-primary/5' : 'border-slate-200 hover:bg-slate-50'}`}
                                onClick={() => document.getElementById(`link-img-${index}`)?.click()}
                                title="Carregar foto"
                                {...createDropHandlers(`link-img-${index}`, ([file]) => file && handleFileUpload(file, `links.${index}.imageUrl`))}
                              >
                                <input
                                  id={`link-img-${index}`}
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(file, `links.${index}.imageUrl`);
                                  }}
                                />
                                {(watchedValues as any).links?.[index]?.imageUrl ? (
                                  <img src={(watchedValues as any).links[index].imageUrl} className="w-full h-full object-cover" alt="Link icon" />
                                ) : (
                                  <ImageIcon className="w-5 h-5 text-slate-300" />
                                )}
                                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                  <Upload className="w-3 h-3 text-white" />
                                </div>
                              </div>
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormField
                                  control={form.control}
                                  name={`links.${index}.label`}
                                  render={({ field }) => (
                                    <FormItem className="space-y-1">
                                      <FormLabel className="text-xs text-gray-500">Nome</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Título do link (ex: Blog)" {...field} value={field.value || ''} className="bg-white" />
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
                                      <FormLabel className="text-xs text-gray-500">URL</FormLabel>
                                      <FormControl>
                                        <Input placeholder="https://..." {...field} value={field.value || ''} className="bg-white" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => remove(index)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                      {fields.every((_, i) => !!(watchedValues as any).links?.[i]?.socialType) && (
                        <p className="text-xs text-gray-400 text-center py-2">
                          Clique em "Adicionar Link" para adicionar links personalizados com foto e nome.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeType === "vcard" && (
                <div className="space-y-6">
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className={`relative w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors overflow-hidden ${dragOverZone === 'vcard-photo' ? 'border-primary bg-primary/5' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
                      onClick={() => document.getElementById('vcard-photo-upload')?.click()}
                      {...createDropHandlers('vcard-photo', ([file]) => file && handleFileUpload(file, 'photoUrl'))}
                    >
                      <input
                        type="file"
                        id="vcard-photo-upload"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, "photoUrl");
                        }}
                      />
                      {watchedValues.photoUrl ? (
                        <img src={watchedValues.photoUrl} className="w-full h-full object-cover" alt="Foto de Perfil" />
                      ) : (
                        <div className="flex flex-col items-center text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4a4 4 0 100 8 4 4 0 000-8zM6 20v-1a6 6 0 0112 0v1" />
                          </svg>
                          <span className="text-[10px] font-medium">Foto</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Clique ou arraste a foto</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Nome</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: João" {...field} value={field.value || ''} />
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
                          <FormLabel className="text-sm font-medium text-gray-700">Sobrenome</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Silva" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Telefone</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <select
                                value={selectedCountryCode}
                                onChange={(e) => setSelectedCountryCode(e.target.value)}
                                className="w-[100px] h-10 rounded-lg border border-gray-200 bg-white text-sm px-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                              >
                                {countryCodes.map((c) => (
                                  <option key={c.code} value={c.code}>{c.flag} +{c.code}</option>
                                ))}
                              </select>
                              <Input 
                                placeholder="923 000 000" 
                                {...field} 
                                value={field.value || ''} 
                                className="flex-1"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="whatsappNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">WhatsApp (opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="923 000 000" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Email</FormLabel>
                          <FormControl>
                            <Input placeholder="exemplo@email.com" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Localização</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Luanda, Angola" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-bold text-gray-900 mb-4">Detalhes da Empresa</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">Empresa</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome da Empresa" {...field} value={field.value || ''} />
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
                            <FormLabel className="text-sm font-medium text-gray-700">Profissão</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Designer, Gerente" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="summary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Resumo</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Breve resumo profissional..." 
                            {...field} 
                            value={field.value || ''} 
                            className="min-h-[100px]" 
                          />
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
                        <FormLabel className="text-sm font-medium text-gray-700">Website (Opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://seusite.com" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {activeType === "images" && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Título da Galeria</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Fotos de Verão" {...field} value={field.value || ""} />
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
                          <Textarea
                            placeholder="Descrição opcional da galeria"
                            {...field}
                            value={field.value || ""}
                            className="min-h-[80px] resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-sm font-medium text-gray-700">Imagens</FormLabel>
                      <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                        {((watchedValues as any).fileUrls || []).length}/10
                      </span>
                    </div>

                    {((watchedValues as any).fileUrls || []).length === 0 ? (
                      <div
                        className={`border-2 border-dashed rounded-xl p-10 transition-all flex flex-col items-center justify-center cursor-pointer ${isUploading ? "opacity-50 pointer-events-none" : dragOverZone === 'images-main' ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/50 hover:bg-primary/5"}`}
                        onClick={() => document.getElementById("images-upload")?.click()}
                        {...createDropHandlers('images-main', handleMultipleImageUpload)}
                      >
                        <input
                          id="images-upload"
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={async (e) => {
                            const files = Array.from(e.target.files || []);
                            await handleMultipleImageUpload(files);
                            e.target.value = "";
                          }}
                        />
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                          <ImageIcon className="w-7 h-7 text-primary" />
                        </div>
                        <p className="text-sm font-semibold text-gray-700">Clique ou arraste imagens</p>
                        <p className="text-xs text-gray-400 mt-1">Selecione ou arraste várias imagens de uma vez</p>
                        <p className="text-[11px] text-gray-300 mt-0.5">PNG, JPG, WebP · até 10MB · máx. 10 imagens</p>
                        {isUploading && (
                          <div className="w-full max-w-[200px] mt-4">
                            <Progress value={progress} className="h-1.5" />
                            <p className="text-[10px] text-gray-400 text-center mt-1">A fazer upload... {progress}%</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          {((watchedValues as any).fileUrls || []).map((url: string, index: number) => (
                            <div key={index} className="relative aspect-square rounded-xl overflow-hidden group border border-gray-100 shadow-sm">
                              <img src={url} alt={`Imagem ${index + 1}`} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                              <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[9px] text-white font-bold">{index + 1}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const current = (form.getValues() as any).fileUrls || [];
                                  const updated = current.filter((_: string, i: number) => i !== index);
                                  form.setValue("fileUrls" as any, updated);
                                  onGenerate({ ...form.getValues(), fileUrls: updated });
                                }}
                                className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}

                          {((watchedValues as any).fileUrls || []).length < 10 && (
                            <div
                              className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${isUploading ? "opacity-50 pointer-events-none" : dragOverZone === 'images-more' ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/50 hover:bg-primary/5"}`}
                              onClick={() => document.getElementById("images-upload-more")?.click()}
                              {...createDropHandlers('images-more', handleMultipleImageUpload)}
                            >
                              <input
                                id="images-upload-more"
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={async (e) => {
                                  const files = Array.from(e.target.files || []);
                                  await handleMultipleImageUpload(files);
                                  e.target.value = "";
                                }}
                              />
                              <Plus className="w-5 h-5 text-gray-400 mb-1" />
                              <span className="text-[10px] text-gray-400 font-medium">Adicionar</span>
                            </div>
                          )}
                        </div>

                        {isUploading && (
                          <div className="space-y-1">
                            <Progress value={progress} className="h-1.5" />
                            <p className="text-[10px] text-gray-400 text-center">A fazer upload... {progress}%</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Link do Botão</FormLabel>
                          <FormControl>
                            <Input placeholder="https://meusite.com" {...field} value={field.value || ""} />
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
                          <FormLabel className="text-sm font-medium text-gray-700">Texto do Botão</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Ver mais" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {activeType === "business" && (
                <div className="space-y-6">
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className={`relative w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors overflow-hidden ${isUploading ? 'opacity-50 pointer-events-none' : dragOverZone === 'business-logo' ? 'border-primary bg-primary/5' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
                      onClick={() => document.getElementById('business-photo-upload')?.click()}
                      {...createDropHandlers('business-logo', ([file]) => file && handleFileUpload(file, 'photoUrl'))}
                    >
                      <input
                        id="business-photo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, "photoUrl");
                        }}
                      />
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-1 text-gray-400">
                          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                          <span className="text-[9px] font-medium">{progress}%</span>
                        </div>
                      ) : watchedValues.photoUrl ? (
                        <img src={watchedValues.photoUrl} className="w-full h-full object-cover" alt="Logo" />
                      ) : (
                        <div className="flex flex-col items-center text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4a4 4 0 100 8 4 4 0 000-8zM6 20v-1a6 6 0 0112 0v1" />
                          </svg>
                          <span className="text-[10px] font-medium">Logo</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Clique ou arraste o logo</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Nome da Empresa</FormLabel>
                          <FormControl>
                            <Input placeholder="Minha Empresa" {...field} value={field.value || ''} />
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
                          <FormLabel className="text-sm font-medium text-gray-700">Ramo de Atividade</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Tecnologia, Consultoria" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="caption"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Slogan / Legenda</FormLabel>
                        <FormControl>
                          <Input placeholder="O melhor serviço para você" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Telefone (Ligar)</FormLabel>
                          <FormControl>
                            <Input placeholder="923 000 000" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="whatsappNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">WhatsApp</FormLabel>
                          <FormControl>
                            <Input placeholder="923 000 000" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Email</FormLabel>
                        <FormControl>
                          <Input placeholder="contato@empresa.com" {...field} value={field.value || ''} />
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
                        <FormLabel className="text-sm font-medium text-gray-700">Website</FormLabel>
                        <FormControl>
                          <Input placeholder="https://minhaempresa.com" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Localização</FormLabel>
                          <FormControl>
                            <Input placeholder="Endereço Completo" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="mapsUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Link Google Maps</FormLabel>
                          <FormControl>
                            <Input placeholder="https://maps.google.com/..." {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Redes Sociais */}
                  <div className="space-y-3">
                    <FormLabel className="text-base font-bold text-foreground">Redes Sociais</FormLabel>
                    <div className="space-y-2">
                      {SOCIAL_OPTIONS.map(({ type, label, Icon, color, placeholder }) => {
                        const socialLinks: any[] = (watchedValues as any).socialLinks || [];
                        const existingIdx = socialLinks.findIndex((s: any) => s.platform === type);
                        const isActive = existingIdx !== -1;
                        return (
                          <div
                            key={type}
                            className={`rounded-xl border transition-all overflow-hidden ${
                              isActive ? "border-gray-200 bg-white shadow-sm" : "border-gray-100 bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center gap-3 px-3 py-2.5">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: isActive ? color + "18" : "#f3f4f6" }}
                              >
                                <Icon size={18} style={{ color: isActive ? color : "#9ca3af" }} />
                              </div>
                              <span className={`flex-1 text-sm font-medium ${isActive ? "text-gray-800" : "text-gray-500"}`}>
                                {label}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const current: any[] = (watchedValues as any).socialLinks || [];
                                  if (isActive) {
                                    form.setValue("socialLinks" as any, current.filter((_: any, i: number) => i !== existingIdx));
                                  } else {
                                    form.setValue("socialLinks" as any, [...current, { platform: type, url: "" }]);
                                  }
                                }}
                                className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                                  isActive
                                    ? "bg-red-50 text-red-500 hover:bg-red-100"
                                    : "bg-primary/10 text-primary hover:bg-primary/20"
                                }`}
                              >
                                {isActive ? "Remover" : "Adicionar"}
                              </button>
                            </div>
                            {isActive && (
                              <div className="px-3 pb-3">
                                <input
                                  type="url"
                                  placeholder={placeholder}
                                  value={((watchedValues as any).socialLinks?.[existingIdx]?.url) || ""}
                                  onChange={(e) => {
                                    const current: any[] = [...((watchedValues as any).socialLinks || [])];
                                    current[existingIdx] = { ...current[existingIdx], url: e.target.value };
                                    form.setValue("socialLinks" as any, current);
                                  }}
                                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Opening Hours */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                      onClick={() => setOpeningHoursOpen(prev => !prev)}
                    >
                      <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-gray-900">Horário de funcionamento</p>
                        <p className="text-xs text-gray-500">Horário comercial para cada dia da semana.</p>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${openingHoursOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {openingHoursOpen && (
                      <div className="divide-y divide-gray-100">
                        {(watchedValues.openingHours || []).map((dayEntry: any, dayIdx: number) => (
                          <div key={dayEntry.day} className="px-4 py-3 bg-white">
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={dayEntry.enabled || false}
                                onChange={(e) => {
                                  const newHours = [...(watchedValues.openingHours || [])];
                                  newHours[dayIdx] = { ...newHours[dayIdx], enabled: e.target.checked };
                                  form.setValue("openingHours" as any, newHours);
                                }}
                                className="mt-2.5 w-4 h-4 rounded border-gray-300 accent-primary cursor-pointer"
                              />
                              <span className="w-28 pt-2 text-sm font-semibold text-gray-800 flex-shrink-0">{dayEntry.day}</span>
                              <div className="flex-1 space-y-2">
                                {(dayEntry.slots && dayEntry.slots.length > 0 ? dayEntry.slots : [{ from: "", to: "" }]).map((slot: any, slotIdx: number) => (
                                  <div key={slotIdx} className="flex items-center gap-2">
                                    <div className={`flex items-center gap-1.5 flex-1 border rounded-lg px-3 py-2 ${dayEntry.enabled ? 'border-gray-200 bg-gray-50' : 'border-gray-100 bg-gray-50 opacity-40'}`}>
                                      <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                      <input
                                        type="time"
                                        value={slot.from || ""}
                                        disabled={!dayEntry.enabled}
                                        onChange={(e) => {
                                          const newHours = [...(watchedValues.openingHours || [])];
                                          const newSlots = [...(newHours[dayIdx].slots || [])];
                                          newSlots[slotIdx] = { ...newSlots[slotIdx], from: e.target.value };
                                          newHours[dayIdx] = { ...newHours[dayIdx], slots: newSlots };
                                          form.setValue("openingHours" as any, newHours);
                                        }}
                                        className="flex-1 bg-transparent text-sm text-gray-700 outline-none disabled:cursor-not-allowed min-w-0"
                                      />
                                    </div>
                                    <div className={`flex items-center gap-1.5 flex-1 border rounded-lg px-3 py-2 ${dayEntry.enabled ? 'border-gray-200 bg-gray-50' : 'border-gray-100 bg-gray-50 opacity-40'}`}>
                                      <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                      <input
                                        type="time"
                                        value={slot.to || ""}
                                        disabled={!dayEntry.enabled}
                                        onChange={(e) => {
                                          const newHours = [...(watchedValues.openingHours || [])];
                                          const newSlots = [...(newHours[dayIdx].slots || [])];
                                          newSlots[slotIdx] = { ...newSlots[slotIdx], to: e.target.value };
                                          newHours[dayIdx] = { ...newHours[dayIdx], slots: newSlots };
                                          form.setValue("openingHours" as any, newHours);
                                        }}
                                        className="flex-1 bg-transparent text-sm text-gray-700 outline-none disabled:cursor-not-allowed min-w-0"
                                      />
                                    </div>
                                    {(dayEntry.slots || []).length > 1 && slotIdx < (dayEntry.slots || []).length - 1 ? (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newHours = [...(watchedValues.openingHours || [])];
                                          const newSlots = newHours[dayIdx].slots.filter((_: any, i: number) => i !== slotIdx);
                                          newHours[dayIdx] = { ...newHours[dayIdx], slots: newSlots };
                                          form.setValue("openingHours" as any, newHours);
                                        }}
                                        className="w-8 h-8 rounded-lg border border-red-100 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        disabled={!dayEntry.enabled}
                                        onClick={() => {
                                          const newHours = [...(watchedValues.openingHours || [])];
                                          const newSlots = [...(newHours[dayIdx].slots || [{ from: "", to: "" }]), { from: "", to: "" }];
                                          newHours[dayIdx] = { ...newHours[dayIdx], slots: newSlots };
                                          form.setValue("openingHours" as any, newHours);
                                        }}
                                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeType === "text" && (
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Seu Texto</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Escreva sua mensagem aqui..." 
                            {...field} 
                            value={field.value || ''} 
                            className="min-h-[150px] rounded-lg border-gray-200" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {activeType === "phone" && (
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Número de Telefone</FormLabel>
                        <FormControl>
                          <div className="flex gap-2 mt-1.5">
                            <select
                              value={selectedCountryCode}
                              onChange={(e) => setSelectedCountryCode(e.target.value)}
                              className="w-[100px] h-11 rounded-lg border border-gray-200 bg-white text-sm px-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                            >
                              {countryCodes.map((c) => (
                                <option key={c.code} value={c.code}>{c.flag} +{c.code}</option>
                              ))}
                            </select>
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
                </div>
              )}

              {activeType === "email" && (
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Seu Email</FormLabel>
                        <FormControl>
                          <Input placeholder="exemplo@email.com" {...field} value={field.value || ''} className="h-11 rounded-lg border-gray-200 mt-1.5" />
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
                        <FormLabel className="text-sm font-medium text-gray-700">Assunto</FormLabel>
                        <FormControl>
                          <Input placeholder="Gostaria de um orçamento" {...field} value={field.value || ''} className="h-11 rounded-lg border-gray-200 mt-1.5" />
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
                        <FormLabel className="text-sm font-medium text-gray-700">Mensagem</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Escreva sua mensagem aqui..." 
                            {...field} 
                            value={field.value || ''} 
                            className="min-h-[100px] rounded-lg border-gray-200 mt-1.5" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {activeType === "facebook" && (
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">URL da Página do Facebook</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-white mt-1.5 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                            <Facebook className="w-4 h-4 text-blue-600" />
                            <Input 
                              placeholder="https://facebook.com/sua.pagina" 
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

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Título</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: Fashion Inspiration" 
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
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Descrição</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descrição da sua página do Facebook..." 
                            {...field} 
                            value={field.value || ''} 
                            className="min-h-[80px]"
                          />
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
                        <FormLabel className="text-sm font-medium text-gray-700">Texto do Botão</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: Go to our Facebook page" 
                            {...field} 
                            value={field.value || ''} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col items-center gap-3">
                    <div
                      className={`relative w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors overflow-hidden ${isUploading ? 'opacity-50 pointer-events-none' : dragOverZone === 'facebook-photo' ? 'border-primary bg-primary/5' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
                      onClick={() => document.getElementById('facebook-photo-upload')?.click()}
                      data-testid="button-upload-facebook-photo"
                      {...createDropHandlers('facebook-photo', ([file]) => file && handleFileUpload(file, 'photoUrl'))}
                    >
                      <input
                        id="facebook-photo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, "photoUrl");
                        }}
                      />
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-1 text-gray-400">
                          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                          <span className="text-[9px] font-medium">{progress}%</span>
                        </div>
                      ) : watchedValues.photoUrl ? (
                        <img src={watchedValues.photoUrl} className="w-full h-full object-cover" alt="Foto de Perfil" />
                      ) : (
                        <div className="flex flex-col items-center text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4a4 4 0 100 8 4 4 0 000-8zM6 20v-1a6 6 0 0112 0v1" />
                          </svg>
                          <span className="text-[10px] font-medium">Foto</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Clique ou arraste a foto</p>
                  </div>
                </div>
              )}
            </div>
        </form>
      </Form>
    </div>
  );
});
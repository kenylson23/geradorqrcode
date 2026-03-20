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
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
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

export const QrForm = forwardRef(({ onGenerate, onStepChange }, ref) => {
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
        defaultValues = { ...defaultValues, companyName: "", industry: "", caption: "", photoUrl: "", location: "", email: "", website: "", phone: "", whatsappNumber: "", openingHours: [{ day: "Segunda-feira", hours: "09:00 - 18:00" }], socialLinks: [] };
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
          <AnimatePresence mode="wait">
            <motion.div
              key={activeType}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg min-h-[250px] pb-20"
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

                  <div className="space-y-2">
                    <FormLabel className="text-sm font-medium text-gray-700">Foto de Perfil</FormLabel>
                    <div
                      className={`border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                      onClick={() => document.getElementById('instagram-photo-upload')?.click()}
                      data-testid="button-upload-instagram-photo"
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
                        <div className="flex flex-col items-center gap-3">
                          <Progress value={progress} className="w-full max-w-xs" />
                          <p className="text-sm text-gray-600">{progress}%</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 text-center">Clique para escolher uma foto de perfil</p>
                        </>
                      )}
                    </div>
                    {form.getValues().photoUrl && (
                      <p className="text-xs text-green-600 flex items-center gap-1">✓ Foto enviada com sucesso</p>
                    )}
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
                  <div className="space-y-4">
                    <FormLabel className="text-sm font-medium text-gray-700">Foto de Perfil</FormLabel>
                    <div 
                      className={`border-2 border-dashed rounded-xl p-6 transition-all flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                      onClick={() => document.getElementById('profile-upload')?.click()}
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
                            // Reset input so same file can be selected again
                            e.target.value = '';
                          }
                        }}
                      />
                      {watchedValues.photoUrl ? (
                        <div className="relative w-20 h-20">
                          <img src={watchedValues.photoUrl} className="w-full h-full object-cover rounded-full" alt="Profile" />
                          <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Upload className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mb-2">
                            <Upload className="w-6 h-6 text-primary" />
                          </div>
                          <p className="text-xs font-medium text-gray-700">Carregar foto de perfil</p>
                        </div>
                      )}
                    </div>
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

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-base font-bold text-foreground">Lista de Links</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ label: "", url: "", imageUrl: "" })}
                        className="flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar Link
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {fields.map((item, index) => (
                        <div key={item.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
                          <div className="flex items-center gap-4">
                            <div 
                              className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors flex-shrink-0 overflow-hidden"
                              onClick={() => document.getElementById(`link-img-${index}`)?.click()}
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
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                              <FormField
                                control={form.control}
                                name={`links.${index}.label`}
                                render={({ field }) => (
                                  <FormItem className="space-y-1">
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
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeType === "vcard" && (
                <div className="space-y-6">
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="relative w-24 h-24 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors overflow-hidden"
                      onClick={() => document.getElementById('vcard-photo-upload')?.click()}
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
                    <p className="text-xs text-muted-foreground">Clique para adicionar foto de perfil</p>
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
                              <Select value={selectedCountryCode} onValueChange={setSelectedCountryCode}>
                                <SelectTrigger className="w-[100px] h-10 rounded-lg border border-gray-200 bg-white">
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
                        className={`border-2 border-dashed rounded-xl p-10 transition-all flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 ${isUploading ? "opacity-50 pointer-events-none" : "border-gray-200"}`}
                        onClick={() => document.getElementById("images-upload")?.click()}
                      >
                        <input
                          id="images-upload"
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={async (e) => {
                            const files = Array.from(e.target.files || []);
                            const current: string[] = (form.getValues() as any).fileUrls || [];
                            const remaining = 10 - current.length;
                            const toUpload = files.slice(0, remaining);
                            const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
                            const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
                            setIsUploading(true);
                            const newUrls: string[] = [...current];
                            for (let i = 0; i < toUpload.length; i++) {
                              const file = toUpload[i];
                              setProgress(Math.round(((i) / toUpload.length) * 100));
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
                            e.target.value = "";
                          }}
                        />
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                          <ImageIcon className="w-7 h-7 text-primary" />
                        </div>
                        <p className="text-sm font-semibold text-gray-700">Clique para adicionar imagens</p>
                        <p className="text-xs text-gray-400 mt-1">Selecione várias imagens de uma vez</p>
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
                              className={`aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
                              onClick={() => document.getElementById("images-upload-more")?.click()}
                            >
                              <input
                                id="images-upload-more"
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={async (e) => {
                                  const files = Array.from(e.target.files || []);
                                  const current: string[] = (form.getValues() as any).fileUrls || [];
                                  const remaining = 10 - current.length;
                                  const toUpload = files.slice(0, remaining);
                                  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
                                  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
                                  setIsUploading(true);
                                  const newUrls: string[] = [...current];
                                  for (let i = 0; i < toUpload.length; i++) {
                                    const file = toUpload[i];
                                    setProgress(Math.round(((i) / toUpload.length) * 100));
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
                  <div className="space-y-4">
                    <FormLabel className="text-sm font-medium text-gray-700">Foto de Perfil / Logo</FormLabel>
                    <div 
                      className={`border-2 border-dashed rounded-xl p-6 transition-all flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                      onClick={() => document.getElementById('business-photo-upload')?.click()}
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
                      {watchedValues.photoUrl ? (
                        <div className="relative w-20 h-20">
                          <img src={watchedValues.photoUrl} className="w-full h-full object-cover rounded-full" alt="Business Logo" />
                          <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Upload className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mb-2">
                            <Upload className="w-6 h-6 text-primary" />
                          </div>
                          <p className="text-xs font-medium text-gray-700">Carregar logo da empresa</p>
                        </div>
                      )}
                    </div>
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

                  <div className="space-y-2">
                    <FormLabel className="text-sm font-medium text-gray-700">Foto de Perfil</FormLabel>
                    <div 
                      className={`border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                      onClick={() => document.getElementById('facebook-photo-upload')?.click()}
                      data-testid="button-upload-facebook-photo"
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
                        <div className="flex flex-col items-center gap-3">
                          <Progress value={progress} className="w-full max-w-xs" />
                          <p className="text-sm text-gray-600">{progress}%</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 text-center">Clique para escolher uma foto de perfil</p>
                        </>
                      )}
                    </div>
                    {form.getValues().photoUrl && (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        ✓ Foto enviada com sucesso
                      </p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </form>
      </Form>
    </div>
  );
});
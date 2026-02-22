import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface ImagePageProps {
  params: {
    data: string;
  };
}

export default function ImagePage({ params }: ImagePageProps) {
  let data: any = {};
  try {
    data = JSON.parse(decodeURIComponent(params.data));
  } catch (e) {
    console.error("Failed to parse image data", e);
  }

  const { title, description, fileUrl, website, buttonLabel } = data;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 pt-8 pb-20">
      <div className="w-full max-w-md space-y-6">
        {fileUrl && (
          <div className="rounded-2xl overflow-hidden shadow-xl bg-white border border-gray-100">
            <img 
              src={fileUrl} 
              alt={title || "Imagem"} 
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        <div className="space-y-4 px-2">
          {title && (
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              {title}
            </h1>
          )}
          
          {description && (
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {(website || buttonLabel) && (
          <div className="pt-4">
            <Button 
              asChild
              className="w-full h-14 rounded-xl text-lg font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            >
              <a href={website || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                {buttonLabel || "Ver mais"}
                <ArrowRight className="w-5 h-5" />
              </a>
            </Button>
          </div>
        )}

        <div className="pt-12 flex flex-col items-center space-y-4">
          <Link href="/">
            <Button variant="ghost" className="text-muted-foreground hover:text-primary transition-colors">
              Criar meu próprio QR Code
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center pointer-events-none">
        <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-100 shadow-sm flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-gray-500">Gerado por QR Gen</span>
        </div>
      </div>
    </div>
  );
}

import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full py-6 mt-12 border-t border-border/40 bg-white/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} AngoQrCode. Todos os direitos reservados.</p>
        <div className="flex items-center gap-1 mt-2 md:mt-0">
          Feito com <Heart className="h-4 w-4 text-red-500 fill-red-500" /> em Angola
        </div>
      </div>
    </footer>
  );
}

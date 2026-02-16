import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { QrForm } from "@/components/QrForm";
import { QrResult } from "@/components/QrResult";
import { useQrGenerator } from "@/hooks/use-qr-generator";

export default function Home() {
  const { qrData, generate, download, reset } = useQrGenerator();

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col font-sans">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left Column: Form */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-display font-bold text-foreground">
                  Crie seu QR Code Personalizado
                </h2>
                <p className="text-lg text-muted-foreground">
                  Ferramenta simples, rápida e gratuita para gerar códigos QR para seus links, contatos e muito mais.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-1 shadow-sm border border-border/50">
                <QrForm onGenerate={generate} />
              </div>
            </div>

            {/* Right Column: Preview */}
            <div className="lg:col-span-5">
              <div className="sticky top-8">
                <QrResult 
                  value={qrData} 
                  onDownload={() => download("qr-code-element")}
                  onReset={reset}
                />
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div id="funciona" className="mt-20 lg:mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              title="100% Gratuito" 
              description="Gere quantos códigos quiser sem pagar nada. Sem assinaturas, sem taxas ocultas."
              icon="💸"
            />
            <FeatureCard 
              title="Alta Qualidade" 
              description="Baixe seus códigos em formato PNG de alta resolução pronto para impressão."
              icon="✨"
            />
            <FeatureCard 
              title="Privacidade Total" 
              description="O processamento é feito no seu navegador. Seus dados nunca saem do seu dispositivo."
              icon="🔒"
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string, description: string, icon: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2 font-display text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

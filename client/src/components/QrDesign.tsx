import { useRef } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

export interface QrDesignSettings {
  fgColor: string;
  bgColor: string;
  level: "L" | "M" | "Q" | "H";
  showLogo: boolean;
  logoSrc: string;
  logoSize: number;
  includeMargin: boolean;
}

export const defaultDesign: QrDesignSettings = {
  fgColor: "#000000",
  bgColor: "#ffffff",
  level: "M",
  showLogo: true,
  logoSrc: "/logo.png",
  logoSize: 40,
  includeMargin: true,
};

const DOT_PRESETS = [
  { label: "Preto",   color: "#000000" },
  { label: "Roxo",    color: "#7C3AED" },
  { label: "Azul",    color: "#1D4ED8" },
  { label: "Verde",   color: "#15803D" },
  { label: "Vermelho",color: "#B91C1C" },
  { label: "Laranja", color: "#C2410C" },
  { label: "Índigo",  color: "#3730A3" },
  { label: "Rosa",    color: "#BE185D" },
];

const BG_PRESETS = [
  { label: "Branco",   color: "#ffffff" },
  { label: "Cinza",    color: "#f3f4f6" },
  { label: "Creme",    color: "#fef9c3" },
  { label: "Azul claro", color: "#dbeafe" },
  { label: "Verde claro", color: "#dcfce7" },
  { label: "Rosa claro",  color: "#fce7f3" },
  { label: "Preto",    color: "#111827" },
  { label: "Escuro",   color: "#1e293b" },
];

const LEVELS: { value: QrDesignSettings["level"]; label: string; desc: string }[] = [
  { value: "L", label: "L — Baixa",   desc: "~7% correção" },
  { value: "M", label: "M — Média",   desc: "~15% correção" },
  { value: "Q", label: "Q — Alta",    desc: "~25% correção" },
  { value: "H", label: "H — Máxima",  desc: "~30% correção" },
];

interface Props {
  design: QrDesignSettings;
  onChange: (d: QrDesignSettings) => void;
}

export function QrDesign({ design, onChange }: Props) {
  const set = <K extends keyof QrDesignSettings>(k: K, v: QrDesignSettings[K]) =>
    onChange({ ...design, [k]: v });

  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (result) onChange({ ...design, logoSrc: result, showLogo: true });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Design do QR Code</h2>
        <p className="text-sm text-muted-foreground">Personaliza as cores, o logo e a qualidade do código.</p>
      </div>

      {/* ── COR DOS PONTOS ─────────────────────────────── */}
      <section className="space-y-3">
        <Label className="text-base font-bold text-foreground">Cor dos pontos</Label>
        <div className="flex flex-wrap gap-2">
          {DOT_PRESETS.map((p) => (
            <button
              key={p.color}
              type="button"
              title={p.label}
              onClick={() => set("fgColor", p.color)}
              className={`w-8 h-8 rounded-lg border-2 transition-all ${design.fgColor === p.color ? "border-primary scale-110 shadow-md" : "border-transparent hover:scale-105"}`}
              style={{ backgroundColor: p.color }}
            />
          ))}
          <label
            title="Cor personalizada"
            className={`w-8 h-8 rounded-lg border-2 cursor-pointer overflow-hidden transition-all hover:scale-105 ${!DOT_PRESETS.some(p => p.color === design.fgColor) ? "border-primary scale-110 shadow-md" : "border-slate-300"}`}
          >
            <input
              type="color"
              value={design.fgColor}
              onChange={(e) => set("fgColor", e.target.value)}
              className="w-full h-full opacity-0 cursor-pointer absolute"
            />
            <div className="w-full h-full rounded-md flex items-center justify-center bg-gradient-to-br from-red-400 via-yellow-400 to-blue-400 text-white text-[10px] font-bold">+</div>
          </label>
        </div>
        <p className="text-xs text-muted-foreground">Seleccionado: <span className="font-mono">{design.fgColor}</span></p>
      </section>

      {/* ── COR DO FUNDO ────────────────────────────────── */}
      <section className="space-y-3">
        <Label className="text-base font-bold text-foreground">Cor do fundo</Label>
        <div className="flex flex-wrap gap-2">
          {BG_PRESETS.map((p) => (
            <button
              key={p.color}
              type="button"
              title={p.label}
              onClick={() => set("bgColor", p.color)}
              className={`w-8 h-8 rounded-lg border-2 transition-all ${design.bgColor === p.color ? "border-primary scale-110 shadow-md" : "border-slate-200 hover:scale-105"}`}
              style={{ backgroundColor: p.color }}
            />
          ))}
          <label
            title="Cor personalizada"
            className={`w-8 h-8 rounded-lg border-2 cursor-pointer overflow-hidden transition-all hover:scale-105 ${!BG_PRESETS.some(p => p.color === design.bgColor) ? "border-primary scale-110 shadow-md" : "border-slate-300"}`}
          >
            <input
              type="color"
              value={design.bgColor}
              onChange={(e) => set("bgColor", e.target.value)}
              className="w-full h-full opacity-0 cursor-pointer absolute"
            />
            <div className="w-full h-full rounded-md flex items-center justify-center bg-gradient-to-br from-red-400 via-yellow-400 to-blue-400 text-white text-[10px] font-bold">+</div>
          </label>
        </div>
        <p className="text-xs text-muted-foreground">Seleccionado: <span className="font-mono">{design.bgColor}</span></p>
      </section>

      {/* ── LOGO CENTRAL ────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-bold text-foreground">Logo central</Label>
          <Switch
            checked={design.showLogo}
            onCheckedChange={(v) => set("showLogo", v)}
            data-testid="switch-show-logo"
          />
        </div>

        {design.showLogo && (
          <div className="space-y-4 pl-1">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => logoInputRef.current?.click()}
                title="Carregar logo"
              >
                <img src={design.logoSrc} alt="Logo" className="w-full h-full object-contain p-1" />
              </div>
              <div className="flex-1 space-y-1.5">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="text-xs text-primary font-semibold hover:underline"
                  data-testid="button-upload-logo"
                >
                  Carregar logo personalizado
                </button>
                <p className="text-[11px] text-muted-foreground">PNG, JPG, SVG · fundo transparente recomendado</p>
                {design.logoSrc !== "/logo.png" && (
                  <button
                    type="button"
                    onClick={() => set("logoSrc", "/logo.png")}
                    className="text-[11px] text-red-500 hover:underline"
                  >
                    Repor logo padrão
                  </button>
                )}
              </div>
            </div>
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-muted-foreground">Tamanho do logo</Label>
                <span className="text-xs font-mono text-muted-foreground">{design.logoSize}px</span>
              </div>
              <Slider
                min={20}
                max={64}
                step={4}
                value={[design.logoSize]}
                onValueChange={([v]) => set("logoSize", v)}
                data-testid="slider-logo-size"
              />
            </div>
          </div>
        )}
      </section>

      {/* ── NÍVEL DE QUALIDADE ──────────────────────────── */}
      <section className="space-y-3">
        <div>
          <Label className="text-base font-bold text-foreground">Nível de qualidade</Label>
          <p className="text-xs text-muted-foreground mt-0.5">Maior qualidade → QR mais denso mas mais resistente a danos</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {LEVELS.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => set("level", l.value)}
              data-testid={`button-level-${l.value}`}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                design.level === l.value
                  ? "border-primary bg-primary/5"
                  : "border-slate-100 bg-white hover:border-slate-200"
              }`}
            >
              <div className="text-xs font-bold text-foreground">{l.label}</div>
              <div className="text-[11px] text-muted-foreground">{l.desc}</div>
            </button>
          ))}
        </div>
      </section>

      {/* ── MARGEM ──────────────────────────────────────── */}
      <section className="flex items-center justify-between">
        <div>
          <Label className="text-base font-bold text-foreground">Margem branca</Label>
          <p className="text-xs text-muted-foreground mt-0.5">Recomendada para leitores de QR</p>
        </div>
        <Switch
          checked={design.includeMargin}
          onCheckedChange={(v) => set("includeMargin", v)}
          data-testid="switch-margin"
        />
      </section>
    </div>
  );
}

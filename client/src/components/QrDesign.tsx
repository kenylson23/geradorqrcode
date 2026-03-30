import { useRef } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

export interface QrDesignSettings {
  fgColor: string;
  bgColor: string;
  cornerColor: string;
  level: "L" | "M" | "Q" | "H";
  showLogo: boolean;
  logoSrc: string;
  logoSize: number;
  includeMargin: boolean;
  dotStyle: "square" | "rounded" | "dots" | "classy" | "classy-rounded" | "extra-rounded";
  cornerSquareStyle: "square" | "extra-rounded" | "dot";
  cornerDotStyle: "square" | "dot";
  frameStyle: "none" | "simple" | "rounded" | "shadow";
  frameColor: string;
  labelText: string;
  labelColor: string;
  qrSize: number;
}

export const defaultDesign: QrDesignSettings = {
  fgColor: "#000000",
  bgColor: "#ffffff",
  cornerColor: "",
  level: "M",
  showLogo: false,
  logoSrc: "/favicon.png",
  logoSize: 40,
  includeMargin: true,
  dotStyle: "square",
  cornerSquareStyle: "square",
  cornerDotStyle: "square",
  frameStyle: "none",
  frameColor: "#000000",
  labelText: "",
  labelColor: "#000000",
  qrSize: 200,
};

/* ── colour presets ─────────────────────────────── */
const DOT_PRESETS = [
  "#000000","#7C3AED","#1D4ED8","#15803D",
  "#B91C1C","#C2410C","#3730A3","#BE185D",
];
const BG_PRESETS = [
  "#ffffff","#f3f4f6","#fef9c3","#dbeafe",
  "#dcfce7","#fce7f3","#111827","#1e293b",
];

const DOT_STYLES: { value: QrDesignSettings["dotStyle"]; label: string; preview: string }[] = [
  { value: "square",        label: "Quadrado",       preview: "■" },
  { value: "rounded",       label: "Arredondado",    preview: "▣" },
  { value: "extra-rounded", label: "Extra arred.",   preview: "⬤" },
  { value: "dots",          label: "Círculos",       preview: "●" },
  { value: "classy",        label: "Clássico",       preview: "◆" },
  { value: "classy-rounded",label: "Clás. arred.",   preview: "◈" },
];
const CORNER_SQ_STYLES: { value: QrDesignSettings["cornerSquareStyle"]; label: string }[] = [
  { value: "square",        label: "Quadrado" },
  { value: "extra-rounded", label: "Arredondado" },
  { value: "dot",           label: "Círculo" },
];
const CORNER_DOT_STYLES: { value: QrDesignSettings["cornerDotStyle"]; label: string }[] = [
  { value: "square", label: "Quadrado" },
  { value: "dot",    label: "Círculo" },
];
const FRAME_STYLES: { value: QrDesignSettings["frameStyle"]; label: string }[] = [
  { value: "none",    label: "Nenhuma" },
  { value: "simple",  label: "Simples" },
  { value: "rounded", label: "Arredondada" },
  { value: "shadow",  label: "Sombra" },
];
const LEVELS: { value: QrDesignSettings["level"]; label: string; desc: string }[] = [
  { value: "L", label: "L — Baixa",  desc: "~7%" },
  { value: "M", label: "M — Média",  desc: "~15%" },
  { value: "Q", label: "Q — Alta",   desc: "~25%" },
  { value: "H", label: "H — Máxima", desc: "~30%" },
];

/* ── helpers ─────────────────────────────────────── */
function ColorRow({ colors, selected, onChange }: { colors: string[]; selected: string; onChange: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {colors.map(c => (
        <button key={c} type="button" title={c}
          onClick={() => onChange(c)}
          className={`w-7 h-7 rounded-lg border-2 transition-all ${selected === c ? "border-primary scale-110 shadow-md" : "border-slate-200 hover:scale-105"}`}
          style={{ backgroundColor: c }}
        />
      ))}
      <label title="Cor personalizada"
        className={`w-7 h-7 rounded-lg border-2 cursor-pointer overflow-hidden relative transition-all hover:scale-105 ${!colors.includes(selected) ? "border-primary scale-110 shadow-md" : "border-slate-300"}`}
      >
        <input type="color" value={selected} onChange={e => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        <div className="w-full h-full rounded-md bg-gradient-to-br from-red-400 via-yellow-300 to-blue-400 flex items-center justify-center text-white text-[10px] font-bold">+</div>
      </label>
    </div>
  );
}

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
    reader.onload = ev => {
      const r = ev.target?.result as string;
      if (r) onChange({ ...design, logoSrc: r, showLogo: true });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Design do QR Code</h2>
        <p className="text-sm text-muted-foreground">Personaliza as cores, o estilo e a moldura do código.</p>
      </div>

      {/* ── TAMANHO ──────────────────────────────────── */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-base font-bold text-foreground">Tamanho do QR</Label>
          <span className="text-xs font-mono text-muted-foreground">{design.qrSize}px</span>
        </div>
        <Slider min={150} max={300} step={10} value={[design.qrSize]}
          onValueChange={([v]) => set("qrSize", v)} data-testid="slider-qr-size" />
      </section>

      {/* ── ESTILO DOS PONTOS ────────────────────────── */}
      <section className="space-y-3">
        <Label className="text-base font-bold text-foreground">Estilo dos pontos</Label>
        <div className="grid grid-cols-3 gap-2">
          {DOT_STYLES.map(s => (
            <button key={s.value} type="button" onClick={() => set("dotStyle", s.value)}
              data-testid={`button-dot-${s.value}`}
              className={`p-2.5 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${design.dotStyle === s.value ? "border-primary bg-primary/5" : "border-slate-100 hover:border-slate-200"}`}
            >
              <span className="text-xl" style={{ color: design.fgColor || "#000" }}>{s.preview}</span>
              <span className="text-[10px] font-medium text-foreground">{s.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── ESTILO DOS CANTOS ────────────────────────── */}
      <section className="space-y-3">
        <Label className="text-base font-bold text-foreground">Estilo dos cantos</Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground font-medium">Quadrado externo</p>
            <div className="flex gap-2">
              {CORNER_SQ_STYLES.map(s => (
                <button key={s.value} type="button" onClick={() => set("cornerSquareStyle", s.value)}
                  className={`flex-1 py-1.5 rounded-lg border-2 text-[10px] font-semibold transition-all ${design.cornerSquareStyle === s.value ? "border-primary bg-primary/5 text-primary" : "border-slate-100 text-muted-foreground hover:border-slate-200"}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground font-medium">Ponto interno</p>
            <div className="flex gap-2">
              {CORNER_DOT_STYLES.map(s => (
                <button key={s.value} type="button" onClick={() => set("cornerDotStyle", s.value)}
                  className={`flex-1 py-1.5 rounded-lg border-2 text-[10px] font-semibold transition-all ${design.cornerDotStyle === s.value ? "border-primary bg-primary/5 text-primary" : "border-slate-100 text-muted-foreground hover:border-slate-200"}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── COR DOS PONTOS ───────────────────────────── */}
      <section className="space-y-2">
        <Label className="text-base font-bold text-foreground">Cor dos pontos</Label>
        <ColorRow colors={DOT_PRESETS} selected={design.fgColor} onChange={c => set("fgColor", c)} />
        <p className="text-[11px] text-muted-foreground font-mono">{design.fgColor}</p>
      </section>

      {/* ── COR DOS CANTOS (opcional) ────────────────── */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-base font-bold text-foreground">Cor dos cantos</Label>
          {design.cornerColor && (
            <button type="button" onClick={() => set("cornerColor", "")}
              className="text-[11px] text-red-500 hover:underline">
              Usar cor dos pontos
            </button>
          )}
        </div>
        <ColorRow colors={DOT_PRESETS} selected={design.cornerColor || design.fgColor} onChange={c => set("cornerColor", c)} />
        <p className="text-[11px] text-muted-foreground">
          {design.cornerColor ? <span className="font-mono">{design.cornerColor}</span> : "Igual aos pontos"}
        </p>
      </section>

      {/* ── COR DO FUNDO ─────────────────────────────── */}
      <section className="space-y-2">
        <Label className="text-base font-bold text-foreground">Cor do fundo</Label>
        <ColorRow colors={BG_PRESETS} selected={design.bgColor} onChange={c => set("bgColor", c)} />
        <p className="text-[11px] text-muted-foreground font-mono">{design.bgColor}</p>
      </section>

      {/* ── LOGO CENTRAL ─────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-bold text-foreground">Logo central</Label>
          <Switch checked={design.showLogo} onCheckedChange={v => set("showLogo", v)} data-testid="switch-show-logo" />
        </div>
        {design.showLogo && (
          <div className="space-y-4 pl-1">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => logoInputRef.current?.click()}>
                <img src={design.logoSrc} alt="Logo" className="w-full h-full object-contain p-1" />
              </div>
              <div className="flex-1 space-y-1">
                <button type="button" onClick={() => logoInputRef.current?.click()}
                  className="text-xs text-primary font-semibold hover:underline" data-testid="button-upload-logo">
                  Carregar logo personalizado
                </button>
                <p className="text-[11px] text-muted-foreground">PNG, JPG, SVG · fundo transparente recomendado</p>
                {design.logoSrc !== "/favicon.png" && (
                  <button type="button" onClick={() => set("logoSrc", "/favicon.png")}
                    className="text-[11px] text-red-500 hover:underline">
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
              <Slider min={16} max={72} step={4} value={[design.logoSize]}
                onValueChange={([v]) => set("logoSize", v)} data-testid="slider-logo-size" />
            </div>
          </div>
        )}
      </section>

      {/* ── MOLDURA ──────────────────────────────────── */}
      <section className="space-y-3">
        <Label className="text-base font-bold text-foreground">Moldura</Label>
        <div className="grid grid-cols-4 gap-2">
          {FRAME_STYLES.map(f => (
            <button key={f.value} type="button" onClick={() => set("frameStyle", f.value)}
              data-testid={`button-frame-${f.value}`}
              className={`py-2 rounded-xl border-2 text-[11px] font-semibold transition-all ${design.frameStyle === f.value ? "border-primary bg-primary/5 text-primary" : "border-slate-100 text-muted-foreground hover:border-slate-200"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {design.frameStyle !== "none" && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Cor da moldura</p>
            <ColorRow colors={DOT_PRESETS} selected={design.frameColor} onChange={c => set("frameColor", c)} />
          </div>
        )}
      </section>

      {/* ── TEXTO / LEGENDA ───────────────────────────── */}
      <section className="space-y-3">
        <Label className="text-base font-bold text-foreground">Legenda</Label>
        <Input
          placeholder="Ex: Scan para visitar o nosso site"
          value={design.labelText}
          onChange={e => set("labelText", e.target.value)}
          autoCorrect="off" autoComplete="off" spellCheck={false}
          data-testid="input-label-text"
        />
        {design.labelText && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Cor do texto</p>
            <ColorRow colors={DOT_PRESETS} selected={design.labelColor} onChange={c => set("labelColor", c)} />
          </div>
        )}
      </section>

      {/* ── NÍVEL DE QUALIDADE ───────────────────────── */}
      <section className="space-y-3">
        <div>
          <Label className="text-base font-bold text-foreground">Nível de qualidade</Label>
          <p className="text-xs text-muted-foreground mt-0.5">Maior qualidade → QR mais denso mas mais resistente a danos</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {LEVELS.map(l => (
            <button key={l.value} type="button" onClick={() => set("level", l.value)}
              data-testid={`button-level-${l.value}`}
              className={`p-3 rounded-xl border-2 text-left transition-all ${design.level === l.value ? "border-primary bg-primary/5" : "border-slate-100 bg-white hover:border-slate-200"}`}
            >
              <div className="text-xs font-bold text-foreground">{l.label}</div>
              <div className="text-[11px] text-muted-foreground">{l.desc} de correção</div>
            </button>
          ))}
        </div>
      </section>

      {/* ── MARGEM ───────────────────────────────────── */}
      <section className="flex items-center justify-between">
        <div>
          <Label className="text-base font-bold text-foreground">Margem branca</Label>
          <p className="text-xs text-muted-foreground mt-0.5">Recomendada para leitores de QR</p>
        </div>
        <Switch checked={design.includeMargin} onCheckedChange={v => set("includeMargin", v)} data-testid="switch-margin" />
      </section>
    </div>
  );
}

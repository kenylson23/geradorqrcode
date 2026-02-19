import { useState } from "react";
import { type QrCodeForm } from "@shared/schema";
import { toPng } from "html-to-image";
import { saveAs } from "file-saver";

export function useQrGenerator() {
  const [qrData, setQrData] = useState<any>(null);
  const [generatedType, setGeneratedType] = useState<string | null>(null);

  const generate = (data: QrCodeForm) => {
    setQrData(data);
    setGeneratedType(data.type);
  };

  const download = async (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      try {
        const dataUrl = await toPng(element, { backgroundColor: '#ffffff', pixelRatio: 2 });
        saveAs(dataUrl, `qrcode-${generatedType}-${Date.now()}.png`);
      } catch (error) {
        console.error("Could not download QR code", error);
      }
    }
  };

  const reset = () => {
    setQrData("");
    setGeneratedType(null);
  };

  return {
    qrData,
    generatedType,
    generate,
    download,
    reset,
  };
}

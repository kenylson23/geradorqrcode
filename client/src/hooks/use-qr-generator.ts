import { useState } from "react";
import { type QrCodeForm } from "@shared/schema";
import { toPng } from "html-to-image";
import { saveAs } from "file-saver";

export function useQrGenerator() {
  const [qrData, setQrData] = useState<string>("");
  const [generatedType, setGeneratedType] = useState<string | null>(null);

  const generate = (data: QrCodeForm) => {
    let value = "";
    
    switch (data.type) {
      case "url":
      case "video":
      case "facebook":
      case "instagram":
      case "pdf":
        value = data.url;
        break;
      case "text":
        value = data.text;
        break;
      case "whatsapp":
        // Simple WhatsApp link format
        const phone = data.phone.replace(/\D/g, "");
        const message = data.message ? `&text=${encodeURIComponent(data.message)}` : "";
        value = `https://wa.me/${phone}${message}`;
        break;
      case "email":
        const subject = data.subject ? `&subject=${encodeURIComponent(data.subject)}` : "";
        const body = data.body ? `&body=${encodeURIComponent(data.body)}` : "";
        value = `mailto:${data.email}?${subject.slice(1)}${body}`;
        break;
      case "phone":
        value = `tel:${data.phone}`;
        break;
      case "links":
        value = data.links.map(l => `${l.label}: ${l.url}`).join("\n");
        break;
      case "vcard":
        value = `BEGIN:VCARD\nVERSION:3.0\nN:${data.lastName};${data.firstName}\nFN:${data.firstName} ${data.lastName}\nTEL:${data.phone}\nEMAIL:${data.email || ""}\nORG:${data.organization || ""}\nTITLE:${data.jobTitle || ""}\nEND:VCARD`;
        break;
      case "images":
        value = data.urls.join("\n");
        break;
    }

    setQrData(value);
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

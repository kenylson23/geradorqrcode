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
        value = (data as any).fileUrl || ((data as any).url || "");
        break;
      case "text":
        value = data.text;
        break;
      case "whatsapp":
        // Simple WhatsApp link format
        const phone = data.phone.replace(/\D/g, "");
        const message = data.message ? `?text=${encodeURIComponent(data.message)}` : "";
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
        const photo = (data as any).photoUrl ? `\nPHOTO;VALUE=URI:${window.location.origin}${(data as any).photoUrl}` : "";
        const website = (data as any).website ? `\nURL:${(data as any).website}` : "";
        const location = (data as any).location ? `\nADR:;;${(data as any).location};;;;` : "";
        const org = (data as any).companyName ? `\nORG:${(data as any).companyName}` : ((data as any).organization ? `\nORG:${(data as any).organization}` : "");
        const title = (data as any).profession ? `\nTITLE:${(data as any).profession}` : ((data as any).jobTitle ? `\nTITLE:${(data as any).jobTitle}` : "");
        const summary = (data as any).summary ? `\nNOTE:${(data as any).summary}` : "";
        const social = ((data as any).socialLinks || []).map((s: any) => `\nX-SOCIAL-PROFILE;TYPE=${s.platform}:${s.url}`).join("");
        value = `BEGIN:VCARD\nVERSION:3.0\nN:${data.lastName};${data.firstName}\nFN:${data.firstName} ${data.lastName}\nTEL:${data.phone}\nEMAIL:${data.email || ""}${org}${title}${photo}${website}${location}${summary}${social}\nEND:VCARD`;
        break;
      case "images":
        const urls = [...((data as any).urls || []), ...((data as any).fileUrls || []).map((path: string) => `${window.location.origin}${path}`)];
        value = urls.join("\n");
        break;
      case "business":
        const bizPhoto = (data as any).photoUrl ? `\nPHOTO;VALUE=URI:${window.location.origin}${(data as any).photoUrl}` : "";
        const bizWebsite = (data as any).website ? `\nURL:${(data as any).website}` : "";
        const bizLocation = (data as any).location ? `\nADR:;;${(data as any).location};;;;` : "";
        const bizPhone = (data as any).phone ? `\nTEL:${(data as any).phone}` : "";
        const bizEmail = (data as any).email ? `\nEMAIL:${(data as any).email}` : "";
        const bizOrg = `\nORG:${(data as any).companyName}`;
        const bizTitle = `\nTITLE:${(data as any).industry}`;
        const bizCaption = (data as any).caption ? `\nNOTE:${(data as any).caption}` : "";
        const bizHours = ((data as any).openingHours || []).map((h: any) => `\nNOTE:Horário ${h.day}: ${h.hours}`).join("");
        const bizSocial = ((data as any).socialLinks || []).map((s: any) => `\nX-SOCIAL-PROFILE;TYPE=${s.platform}:${s.url}`).join("");
        value = `BEGIN:VCARD\nVERSION:3.0\nFN:${(data as any).companyName}${bizOrg}${bizTitle}${bizPhoto}${bizWebsite}${bizLocation}${bizPhone}${bizEmail}${bizCaption}${bizHours}${bizSocial}\nEND:VCARD`;
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

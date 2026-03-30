import { useState } from "react";
import { type QrCodeForm } from "@shared/schema";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";

export function useQrGenerator() {
  const [qrData, setQrData] = useState<any>(null);
  const [generatedType, setGeneratedType] = useState<string | null>(null);

  const generate = (data: QrCodeForm) => {
    if (data.type === "images") {
      const baseUrl = window.location.origin;
      const encodedData = encodeURIComponent(JSON.stringify(data));
      setQrData(`${baseUrl}/i/${encodedData}`);
    } else {
      setQrData(data);
    }
    setGeneratedType(data.type);
  };

  const getFileName = (ext: string) =>
    `qrcode-${generatedType || "qr"}-${Date.now()}.${ext}`;

  /** Load a URL as a base-64 data URI (to embed in SVG without CORS issues). */
  const toDataUri = (url: string): Promise<string> =>
    new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = img.naturalWidth || 64;
        c.height = img.naturalHeight || 64;
        c.getContext("2d")!.drawImage(img, 0, 0);
        resolve(c.toDataURL("image/png"));
      };
      img.onerror = () => resolve(url); // fallback: keep original URL
      img.src = url;
    });

  /** Render the <svg> inside elementId to a Canvas at the given scale. */
  const svgToCanvas = (elementId: string, scale = 4): Promise<HTMLCanvasElement | null> => {
    return new Promise(async (resolve) => {
      const element = document.getElementById(elementId);
      if (!element) { resolve(null); return; }

      const svgEl = element.querySelector("svg");
      if (!svgEl) { resolve(null); return; }

      const clone = svgEl.cloneNode(true) as SVGElement;
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

      // Fix size — use attribute first, then clientWidth fallback
      const w = parseInt(svgEl.getAttribute("width") || "0") || svgEl.clientWidth || 200;
      const h = parseInt(svgEl.getAttribute("height") || "0") || svgEl.clientHeight || 200;
      clone.setAttribute("width", String(w));
      clone.setAttribute("height", String(h));

      // Replace any <image> href with embedded data URIs to avoid CORS/relative-path issues
      const imageEls = clone.querySelectorAll("image");
      await Promise.all(Array.from(imageEls).map(async (imgEl) => {
        const href = imgEl.getAttribute("href") || imgEl.getAttribute("xlink:href") || "";
        if (!href || href.startsWith("data:")) return;
        const abs = href.startsWith("http") ? href : window.location.origin + href;
        const dataUri = await toDataUri(abs);
        imgEl.setAttribute("href", dataUri);
        imgEl.setAttribute("xlink:href", dataUri);
      }));

      const svgString = new XMLSerializer().serializeToString(clone);
      const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = w * scale;
        canvas.height = h * scale;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas);
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    });
  };

  const downloadPng = async (elementId: string) => {
    const canvas = await svgToCanvas(elementId, 4);
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (blob) saveAs(blob, getFileName("png"));
    }, "image/png");
  };

  const downloadSvg = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    const svgEl = element.querySelector("svg");
    if (!svgEl) return;
    const clone = svgEl.cloneNode(true) as SVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    const svgString = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    saveAs(blob, getFileName("svg"));
  };

  const downloadPdf = async (elementId: string) => {
    const canvas = await svgToCanvas(elementId, 4);
    if (!canvas) return;
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const qrSize = 80;
    const x = (pageW - qrSize) / 2;
    const y = (pageH - qrSize) / 2;
    pdf.addImage(imgData, "PNG", x, y, qrSize, qrSize);
    pdf.save(getFileName("pdf"));
  };

  const reset = () => {
    setQrData("");
    setGeneratedType(null);
  };

  return {
    qrData,
    generatedType,
    generate,
    downloadPng,
    downloadSvg,
    downloadPdf,
    reset,
  };
}

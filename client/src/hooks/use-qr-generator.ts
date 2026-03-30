import { useState } from "react";
import { type QrCodeForm } from "@shared/schema";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import type { QrDesignSettings } from "@/components/QrDesign";

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
      img.onerror = () => resolve(url);
      img.src = url;
    });

  /**
   * Render the <svg> inside elementId to a Canvas at the given scale,
   * compositing the frame and label according to design settings.
   */
  const svgToCanvas = (
    elementId: string,
    targetPx: number,
    design?: QrDesignSettings
  ): Promise<HTMLCanvasElement | null> => {
    return new Promise(async (resolve) => {
      const element = document.getElementById(elementId);
      if (!element) { resolve(null); return; }

      const svgEl = element.querySelector("svg");
      if (!svgEl) { resolve(null); return; }

      const clone = svgEl.cloneNode(true) as SVGElement;
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

      const w = parseInt(svgEl.getAttribute("width") || "0") || svgEl.clientWidth || 200;
      const h = parseInt(svgEl.getAttribute("height") || "0") || svgEl.clientHeight || 200;
      clone.setAttribute("width", String(w));
      clone.setAttribute("height", String(h));

      const scale = Math.round(targetPx / Math.max(w, h)) || 4;

      // Replace <image> hrefs with embedded data URIs
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
        const hasFrame = design?.frameStyle && design.frameStyle !== "none";
        const hasLabel = Boolean(design?.labelText);

        const padding = hasFrame ? 16 * scale : 0;
        const labelHeight = hasLabel ? 28 * scale : 0;
        const borderW = hasFrame ? 3 * scale : 0;
        const cornerRadius = design?.frameStyle === "rounded" ? 16 * scale : 0;

        const canvasW = w * scale + padding * 2;
        const canvasH = h * scale + padding * 2 + labelHeight;

        const canvas = document.createElement("canvas");
        canvas.width = canvasW;
        canvas.height = canvasH;
        const ctx = canvas.getContext("2d")!;

        // Background
        const bgColor = design?.bgColor ?? "#ffffff";
        if (cornerRadius > 0) {
          ctx.beginPath();
          ctx.roundRect(0, 0, canvasW, canvasH, cornerRadius);
          ctx.fillStyle = bgColor;
          ctx.fill();
        } else {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvasW, canvasH);
        }

        // Frame border
        if (hasFrame) {
          ctx.strokeStyle = design?.frameColor ?? "#000000";
          ctx.lineWidth = borderW;
          if (design?.frameStyle === "shadow") {
            ctx.shadowColor = "rgba(0,0,0,0.25)";
            ctx.shadowBlur = 20 * scale;
            ctx.shadowOffsetY = 4 * scale;
          }
          if (cornerRadius > 0) {
            ctx.beginPath();
            ctx.roundRect(borderW / 2, borderW / 2, canvasW - borderW, canvasH - borderW, cornerRadius);
            ctx.stroke();
          } else {
            ctx.strokeRect(borderW / 2, borderW / 2, canvasW - borderW, canvasH - borderW);
          }
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
          ctx.shadowOffsetY = 0;
        }

        // QR SVG
        ctx.drawImage(img, padding, padding, w * scale, h * scale);
        URL.revokeObjectURL(url);

        // Label text
        if (hasLabel && design?.labelText) {
          ctx.fillStyle = design.labelColor ?? "#000000";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = `bold ${14 * scale}px sans-serif`;
          ctx.fillText(
            design.labelText,
            canvasW / 2,
            h * scale + padding + labelHeight / 2,
            canvasW - padding * 2
          );
        }

        resolve(canvas);
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    });
  };

  const downloadPng = async (elementId: string, design?: QrDesignSettings, sizePx = 1024) => {
    const canvas = await svgToCanvas(elementId, sizePx, design);
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (blob) saveAs(blob, getFileName("png"));
    }, "image/png");
  };

  const downloadSvg = (elementId: string, sizePx = 1024) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    const svgEl = element.querySelector("svg");
    if (!svgEl) return;
    const clone = svgEl.cloneNode(true) as SVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    clone.setAttribute("width", String(sizePx));
    clone.setAttribute("height", String(sizePx));
    const w = parseInt(svgEl.getAttribute("width") || "0") || svgEl.clientWidth || 200;
    const h = parseInt(svgEl.getAttribute("height") || "0") || svgEl.clientHeight || 200;
    clone.setAttribute("viewBox", `0 0 ${w} ${h}`);
    const svgString = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    saveAs(blob, getFileName("svg"));
  };

  const downloadPdf = async (elementId: string, design?: QrDesignSettings, sizePx = 1024) => {
    const canvas = await svgToCanvas(elementId, sizePx, design);
    if (!canvas) return;
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const qrMm = Math.min(pageW, pageH) * 0.6;
    const x = (pageW - qrMm) / 2;
    const y = (pageH - qrMm) / 2;
    pdf.addImage(imgData, "PNG", x, y, qrMm, qrMm);
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

import { useState } from "react";
import { type QrCodeForm } from "@shared/schema";
import { toPng } from "html-to-image";
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

  const downloadPng = async (elementId: string, pixelRatio = 4) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    try {
      const dataUrl = await toPng(element, { backgroundColor: "#ffffff", pixelRatio });
      saveAs(dataUrl, getFileName("png"));
    } catch (error) {
      console.error("Could not download QR code as PNG", error);
    }
  };

  const downloadSvg = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    const svgEl = element.querySelector("svg");
    if (!svgEl) return;
    try {
      const clone = svgEl.cloneNode(true) as SVGElement;
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(clone);
      const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      saveAs(blob, getFileName("svg"));
    } catch (error) {
      console.error("Could not download QR code as SVG", error);
    }
  };

  const downloadPdf = async (elementId: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    try {
      const dataUrl = await toPng(element, { backgroundColor: "#ffffff", pixelRatio: 4 });
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const qrSize = 80;
      const x = (pageW - qrSize) / 2;
      const y = (pageH - qrSize) / 2;
      pdf.addImage(dataUrl, "PNG", x, y, qrSize, qrSize);
      pdf.save(getFileName("pdf"));
    } catch (error) {
      console.error("Could not download QR code as PDF", error);
    }
  };

  const download = (elementId: string) => downloadPng(elementId);

  const reset = () => {
    setQrData("");
    setGeneratedType(null);
  };

  return {
    qrData,
    generatedType,
    generate,
    download,
    downloadPng,
    downloadSvg,
    downloadPdf,
    reset,
  };
}

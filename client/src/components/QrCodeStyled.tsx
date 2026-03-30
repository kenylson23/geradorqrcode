import { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";
import type { QrDesignSettings } from "./QrDesign";

interface Props {
  value: string;
  design: QrDesignSettings;
  size?: number;
}

export function QrCodeStyled({ value, design, size = 200 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    qrRef.current = new QRCodeStyling({
      width: size,
      height: size,
      type: "svg",
      data: value || "https://angoqurcode.ao",
      margin: design.includeMargin ? 8 : 0,
      qrOptions: { errorCorrectionLevel: design.level },
      image: design.showLogo ? design.logoSrc : undefined,
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: design.logoSize / size,
        crossOrigin: "anonymous",
        margin: 2,
      },
      dotsOptions: {
        color: design.fgColor,
        type: design.dotStyle,
      },
      backgroundOptions: {
        color: design.bgColor,
      },
      cornersSquareOptions: {
        color: design.cornerColor || design.fgColor,
        type: design.cornerSquareStyle,
      },
      cornersDotOptions: {
        color: design.cornerColor || design.fgColor,
        type: design.cornerDotStyle,
      },
    });

    if (ref.current) {
      ref.current.innerHTML = "";
      qrRef.current.append(ref.current);
    }
  }, []);

  useEffect(() => {
    if (!qrRef.current) return;
    qrRef.current.update({
      width: size,
      height: size,
      data: value || "https://angoqurcode.ao",
      margin: design.includeMargin ? 8 : 0,
      qrOptions: { errorCorrectionLevel: design.level },
      image: design.showLogo ? design.logoSrc : undefined,
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: design.logoSize / size,
        crossOrigin: "anonymous",
        margin: 2,
      },
      dotsOptions: {
        color: design.fgColor,
        type: design.dotStyle,
      },
      backgroundOptions: {
        color: design.bgColor,
      },
      cornersSquareOptions: {
        color: design.cornerColor || design.fgColor,
        type: design.cornerSquareStyle,
      },
      cornersDotOptions: {
        color: design.cornerColor || design.fgColor,
        type: design.cornerDotStyle,
      },
    });
  }, [value, design, size]);

  return <div ref={ref} style={{ lineHeight: 0, display: "inline-block" }} />;
}

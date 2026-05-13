import { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";
import type { QrDesignSettings } from "./QrDesign";

interface Props {
  value: string;
  design: QrDesignSettings;
  size?: number;
}

function buildOptions(value: string, design: QrDesignSettings, size: number): ConstructorParameters<typeof QRCodeStyling>[0] {
  return {
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
  };
}

export function QrCodeStyled({ value, design, size = 200 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    if (!ref.current) return;

    if (!qrRef.current) {
      qrRef.current = new QRCodeStyling(buildOptions(value, design, size));
      ref.current.innerHTML = "";
      qrRef.current.append(ref.current);
    } else {
      qrRef.current.update(buildOptions(value, design, size));
    }

    return () => {
      mountedRef.current = false;
      if (ref.current) {
        ref.current.innerHTML = "";
      }
    };
  }, [value, design, size]);

  return (
    <div
      ref={ref}
      style={{ lineHeight: 0, display: "inline-block", overflow: "hidden" }}
    />
  );
}

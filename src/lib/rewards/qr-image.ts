import QRCode from "qrcode";

export async function generateQrPngBuffer(url: string, size = 512): Promise<Buffer> {
  return QRCode.toBuffer(url, {
    type: "png",
    width: size,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });
}

export async function generateQrSvg(url: string): Promise<string> {
  return QRCode.toString(url, {
    type: "svg",
    margin: 2,
  });
}

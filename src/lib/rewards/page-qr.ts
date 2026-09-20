import type { QrCode, QrDestinationConfig } from "@/lib/db/schema";

function configOf(qr: QrCode): QrDestinationConfig {
  return (qr.destinationConfig ?? {}) as QrDestinationConfig;
}

export function isPromotionPageQr(qr: QrCode, landingPageId: string): boolean {
  return qr.destinationType === "promotion" && configOf(qr).landingPageId === landingPageId;
}

export function isSurveyPageQr(qr: QrCode, surveyId: string): boolean {
  return (
    (qr.destinationType === "survey" || qr.destinationType === "poll") &&
    configOf(qr).surveyId === surveyId
  );
}

export function isBrandLinksPageQr(qr: QrCode): boolean {
  return (
    qr.destinationType === "link_hub" &&
    !qr.ambassadorId &&
    Boolean(configOf(qr).useBrandLinksPage)
  );
}

export function findPromotionPageQr(codes: QrCode[], landingPageId: string): QrCode | null {
  return codes.find((qr) => isPromotionPageQr(qr, landingPageId)) ?? null;
}

export function findSurveyPageQr(codes: QrCode[], surveyId: string): QrCode | null {
  return codes.find((qr) => isSurveyPageQr(qr, surveyId)) ?? null;
}

export function findBrandLinksPageQr(codes: QrCode[]): QrCode | null {
  return codes.find((qr) => isBrandLinksPageQr(qr)) ?? null;
}

export function qrStatusForPublished(published: boolean): QrCode["status"] {
  return published ? "published" : "draft";
}

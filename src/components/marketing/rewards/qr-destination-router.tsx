import { notFound, redirect } from "next/navigation";
import {
  getQrCodeByCode,
  getProductById,
  getLandingPageById,
  getSurveyById,
  logQrScan,
} from "@/lib/data";
import type { QrCode, QrDestinationConfig } from "@/lib/db/schema";
import { LinkHubView } from "@/components/marketing/rewards/link-hub-view";
import { AmbassadorHubView } from "@/components/marketing/ambassadors/ambassador-hub-view";
import { ClaimRewardForm } from "@/components/marketing/rewards/claim-reward-form";
import { SubscribeSection } from "@/components/marketing/subscribe-section";
import { headers } from "next/headers";
import {
  getAmbassadorById,
  getAmbassadorHubDefaults,
  resolveAmbassadorHub,
} from "@/lib/data/ambassadors";

type QrDestinationRouterProps = {
  qrCode: QrCode;
  searchParams: Record<string, string | string[] | undefined>;
};

function getParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

function appendUtm(url: string, code: string, searchParams: QrDestinationRouterProps["searchParams"]) {
  const parsed = new URL(url, "https://cat4.local");
  parsed.searchParams.set("utm_source", getParam(searchParams, "utm_source") ?? "qr");
  parsed.searchParams.set("utm_medium", getParam(searchParams, "utm_medium") ?? code);
  const campaign = getParam(searchParams, "utm_campaign");
  if (campaign) parsed.searchParams.set("utm_campaign", campaign);
  return `${parsed.pathname}${parsed.search}`;
}

export async function QrDestinationRouter({ qrCode, searchParams }: QrDestinationRouterProps) {
  const config = (qrCode.destinationConfig ?? {}) as QrDestinationConfig;

  switch (qrCode.destinationType) {
    case "product_page": {
      if (!qrCode.productId) notFound();
      const product = await getProductById(qrCode.productId);
      if (!product) notFound();
      redirect(`/products/${product.category}/${product.slug}`);
    }

    case "external_url": {
      const url = config.externalUrl;
      if (!url) notFound();
      redirect(url);
    }

    case "promotion": {
      if (!config.landingPageId) notFound();
      const page = await getLandingPageById(config.landingPageId);
      if (!page || page.status !== "published") notFound();
      redirect(appendUtm(`/${page.slug}`, qrCode.code, searchParams));
    }

    case "survey": {
      if (!config.surveyId) notFound();
      const survey = await getSurveyById(config.surveyId);
      if (!survey || survey.status !== "published" || survey.type === "poll") notFound();
      redirect(appendUtm(`/survey/${survey.slug}`, qrCode.code, searchParams));
    }

    case "poll": {
      if (!config.surveyId) notFound();
      const poll = await getSurveyById(config.surveyId);
      if (!poll || poll.status !== "published" || poll.type !== "poll") notFound();
      redirect(appendUtm(`/poll/${poll.slug}`, qrCode.code, searchParams));
    }

    case "subscribe":
      return <SubscribeSection source={`qr-${qrCode.code}`} compact />;

    case "link_hub": {
      if (qrCode.ambassadorId) {
        const ambassador = await getAmbassadorById(qrCode.ambassadorId);
        if (!ambassador || ambassador.status !== "published") notFound();
        const defaults = await getAmbassadorHubDefaults();
        const hub = resolveAmbassadorHub(ambassador, defaults);
        return (
          <AmbassadorHubView
            ambassadorId={ambassador.id}
            slug={ambassador.slug}
            hub={hub}
          />
        );
      }
      return <LinkHubView config={config} />;
    }

    case "claim_reward":
      return <ClaimRewardForm qrCode={qrCode} />;

    default:
      notFound();
  }
}

export async function resolveQrScan(
  code: string,
  searchParams: Record<string, string | string[] | undefined>
) {
  const qrCode = await getQrCodeByCode(code);
  if (!qrCode || qrCode.status !== "published") return null;

  const headerStore = await headers();
  await logQrScan(qrCode.id, {
    userAgent: headerStore.get("user-agent"),
    referrer: headerStore.get("referer"),
    utmSource: getParam(searchParams, "utm_source"),
    utmMedium: getParam(searchParams, "utm_medium"),
    utmCampaign: getParam(searchParams, "utm_campaign"),
  });

  return qrCode;
}

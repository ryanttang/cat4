import { notFound } from "next/navigation";
import {
  QrDestinationRouter,
  resolveQrScan,
} from "@/components/marketing/rewards/qr-destination-router";
import { getQrCodeByCode } from "@/lib/data";

type Props = {
  params: Promise<{ code: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props) {
  const { code } = await params;
  const qrCode = await getQrCodeByCode(code);
  return { title: qrCode?.title ?? "Rewards" };
}

export default async function QrScanPage({ params, searchParams }: Props) {
  const { code } = await params;
  const resolvedSearchParams = await searchParams;
  const qrCode = await resolveQrScan(code, resolvedSearchParams);

  if (!qrCode) notFound();

  return <QrDestinationRouter qrCode={qrCode} searchParams={resolvedSearchParams} />;
}

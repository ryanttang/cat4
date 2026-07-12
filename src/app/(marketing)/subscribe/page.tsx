import { SubscribeSection } from "@/components/marketing/subscribe-section";

export const metadata = { title: "Subscribe" };

export default function SubscribePage() {
  return (
    <div className="min-h-[60vh]">
      <SubscribeSection source="subscribe-page" />
    </div>
  );
}

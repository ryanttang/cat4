import type { HeroVideoSource } from "@/lib/hero-video";
import { buildYouTubeEmbedUrl, extractYouTubeId, isDirectVideoUrl } from "@/lib/hero-video";

export type HeroBlockData = {
  id: string;
  videoSourceType: HeroVideoSource | null;
  videoUrl: string | null;
  posterUrl: string | null;
  headline: string;
  subheadline: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  isActive: boolean;
};

type HeroVideoBackgroundProps = {
  videoSourceType: HeroVideoSource | null;
  videoUrl: string | null;
  posterUrl: string | null;
};

export function HeroVideoBackground({
  videoSourceType,
  videoUrl,
  posterUrl,
}: HeroVideoBackgroundProps) {
  if (!videoUrl) {
    if (posterUrl) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={posterUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      );
    }
    return <div className="absolute inset-0 bg-cat4-dark" />;
  }

  const source = videoSourceType ?? "paste";

  if (source === "embed") {
    const videoId = extractYouTubeId(videoUrl);
    if (videoId) {
      return (
        <div className="absolute inset-0 overflow-hidden">
          <iframe
            src={buildYouTubeEmbedUrl(videoId)}
            title="Hero background video"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      );
    }
  }

  if (source === "paste" || source === "upload") {
    const youtubeId = extractYouTubeId(videoUrl);
    if (youtubeId && source === "paste") {
      return (
        <div className="absolute inset-0 overflow-hidden">
          <iframe
            src={buildYouTubeEmbedUrl(youtubeId)}
            title="Hero background video"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      );
    }

    if (isDirectVideoUrl(videoUrl) || source === "upload") {
      return (
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={posterUrl ?? undefined}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      );
    }
  }

  if (posterUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={posterUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
    );
  }

  return <div className="absolute inset-0 bg-cat4-dark" />;
}

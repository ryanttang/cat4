import { extractYouTubeId, buildYouTubeEmbedUrl, isDirectVideoUrl } from "@/lib/hero-video";

type LandingPageHeroProps = {
  videoUrl?: string;
  imageUrl?: string;
  autoplay?: boolean;
};

export function LandingPageHero({ videoUrl, imageUrl, autoplay = true }: LandingPageHeroProps) {
  if (videoUrl) {
    const youtubeId = extractYouTubeId(videoUrl);
    if (youtubeId) {
      return (
        <div className="absolute inset-0 overflow-hidden">
          <iframe
            src={buildYouTubeEmbedUrl(youtubeId, { autoplay })}
            title="Promotion background"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      );
    }

    if (isDirectVideoUrl(videoUrl)) {
      return (
        <video
          autoPlay={autoplay}
          muted
          loop
          playsInline
          preload={autoplay ? "auto" : "metadata"}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      );
    }
  }

  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
    );
  }

  return <div className="absolute inset-0 bg-gradient-to-br from-cat4-blue/40 to-cat4-dark" />;
}

export type HeroVideoSource = "embed" | "paste" | "upload";

const YOUTUBE_ID_REGEX =
  /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;

/** Extract YouTube video ID from watch URL, short URL, or iframe embed code. */
export function extractYouTubeId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const iframeSrc = trimmed.match(/src=["']([^"']+)["']/i)?.[1];
  const target = iframeSrc ?? trimmed;

  const match = target.match(YOUTUBE_ID_REGEX);
  return match?.[1] ?? null;
}

export function buildYouTubeEmbedUrl(videoId: string, options?: { autoplay?: boolean }): string {
  const autoplay = options?.autoplay ?? true;
  const params = new URLSearchParams({
    autoplay: autoplay ? "1" : "0",
    mute: "1",
    loop: "1",
    playlist: videoId,
    controls: "0",
    showinfo: "0",
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    enablejsapi: "1",
  });
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

export function isDirectVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(url) || url.includes("blob.vercel-storage.com");
}

/** Default homepage hero video. */
export const DEFAULT_HERO_YOUTUBE_URL = "https://www.youtube.com/watch?v=jGDTz0IPcPk";

export const HERO_VIDEO_SOURCE_OPTIONS = [
  {
    value: "embed" as const,
    label: "Embed",
    description: "Paste a YouTube URL or iframe embed code",
  },
  {
    value: "paste" as const,
    label: "Paste URL",
    description: "Paste a direct link to an MP4 or hosted video file",
  },
  {
    value: "upload" as const,
    label: "Upload",
    description: "Upload a video file to Vercel Blob storage",
  },
];

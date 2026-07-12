"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUpload } from "@/components/admin/file-upload";
import { updateHero } from "@/lib/actions/admin";
import {
  DEFAULT_HERO_YOUTUBE_URL,
  HERO_VIDEO_SOURCE_OPTIONS,
  type HeroVideoSource,
} from "@/lib/hero-video";
import { adminSectionClass } from "@/components/admin/admin-ui";
import type { heroBlocks } from "@/lib/db/schema";

type Hero = typeof heroBlocks.$inferSelect;

export function HeroSettingsForm({ hero }: { hero: Hero }) {
  const router = useRouter();
  const [headline, setHeadline] = useState(hero.headline);
  const [subheadline, setSubheadline] = useState(hero.subheadline ?? "");
  const [videoSourceType, setVideoSourceType] = useState<HeroVideoSource>(
    hero.videoSourceType ?? "embed"
  );
  const [videoUrl, setVideoUrl] = useState(hero.videoUrl ?? DEFAULT_HERO_YOUTUBE_URL);
  const [posterUrl, setPosterUrl] = useState(hero.posterUrl ?? "");
  const [ctaLabel, setCtaLabel] = useState(hero.ctaLabel ?? "");
  const [ctaHref, setCtaHref] = useState(hero.ctaHref ?? "");
  const [isActive, setIsActive] = useState(hero.isActive);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const result = await updateHero(hero.id, {
      headline,
      subheadline,
      videoSourceType,
      videoUrl: videoUrl || undefined,
      posterUrl: posterUrl || undefined,
      ctaLabel,
      ctaHref,
      isActive,
    });

    if (result.success) {
      setSuccess(true);
      router.refresh();
    } else {
      setError(result.error ?? "Failed to save");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      <section className={adminSectionClass}>
        <h2 className="text-lg font-semibold text-foreground">Hero Video</h2>
        <p className="text-sm text-muted-foreground">
          Choose how to source the homepage background video. A 50% dark overlay is applied automatically.
        </p>

        <Tabs
          value={videoSourceType}
          onValueChange={(v) => setVideoSourceType(v as HeroVideoSource)}
        >
          <TabsList className="grid w-full grid-cols-3">
            {HERO_VIDEO_SOURCE_OPTIONS.map((opt) => (
              <TabsTrigger key={opt.value} value={opt.value}>
                {opt.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="embed" className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Paste a YouTube watch URL, short link, or full iframe embed code.
            </p>
            <div>
              <Label htmlFor="embedUrl">YouTube URL or embed code</Label>
              <Textarea
                id="embedUrl"
                rows={3}
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder='https://www.youtube.com/watch?v=... or <iframe src="...">'
                className="mt-1 font-mono text-sm"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setVideoUrl(DEFAULT_HERO_YOUTUBE_URL)}
            >
              Use placeholder video
            </Button>
          </TabsContent>

          <TabsContent value="paste" className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Paste a direct URL to an MP4/WebM file, or a YouTube link.
            </p>
            <div>
              <Label htmlFor="pasteUrl">Video URL</Label>
              <Input
                id="pasteUrl"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://example.com/video.mp4"
                className="mt-1"
              />
            </div>
          </TabsContent>

          <TabsContent value="upload" className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Upload an MP4 to Vercel Blob. Recommended: under 20MB for fast loading.
            </p>
            <FileUpload
              label="Video file"
              accept="video/*"
              value={videoUrl}
              onChange={setVideoUrl}
            />
            {videoUrl && (
              <div>
                <Label htmlFor="uploadUrl">Uploaded URL</Label>
                <Input id="uploadUrl" value={videoUrl} readOnly className="mt-1 text-xs" />
              </div>
            )}
          </TabsContent>
        </Tabs>

        <FileUpload
          label="Poster image (fallback while video loads)"
          accept="image/*"
          value={posterUrl}
          onChange={setPosterUrl}
        />
      </section>

      <section className={adminSectionClass}>
        <h2 className="text-lg font-semibold text-foreground">Hero Copy</h2>
        <div>
          <Label htmlFor="headline">Headline</Label>
          <Input
            id="headline"
            required
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="subheadline">Subheadline</Label>
          <Textarea
            id="subheadline"
            value={subheadline}
            onChange={(e) => setSubheadline(e.target.value)}
            className="mt-1"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="ctaLabel">CTA Label</Label>
            <Input
              id="ctaLabel"
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="ctaHref">CTA Link</Label>
            <Input
              id="ctaHref"
              value={ctaHref}
              onChange={(e) => setCtaHref(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={isActive} onCheckedChange={setIsActive} />
          <Label>Hero active on homepage</Label>
        </div>
      </section>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-green-400">Settings saved successfully!</p>}
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  );
}

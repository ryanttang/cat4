"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUpload } from "@/components/admin/file-upload";
import { updateHomepageSettings } from "@/lib/actions/admin";
import { adminPanelClass, adminSectionClass } from "@/components/admin/admin-ui";
import {
  HOMEPAGE_ICON_OPTIONS,
  type HomepageContent,
} from "@/lib/homepage";
import type { Product } from "@/lib/db/schema";

const HomePagePreview = dynamic(
  () => import("@/components/admin/home-page-preview").then((mod) => mod.HomePagePreview),
  {
    ssr: false,
    loading: () => (
      <div className={`flex min-h-[320px] items-center justify-center p-8 text-sm text-muted-foreground ${adminPanelClass}`}>
        Loading preview...
      </div>
    ),
  }
);

type HomePageFormProps = {
  content: HomepageContent;
  products: Product[];
  featuredProducts: Product[];
};

export function HomePageForm({ content: initial, products, featuredProducts }: HomePageFormProps) {
  const router = useRouter();
  const [content, setContent] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const result = await updateHomepageSettings(content);
    if (result.success) {
      setSuccess(true);
      router.refresh();
    } else {
      setError(result.error ?? "Failed to save");
    }
    setLoading(false);
  }

  function updateHero<K extends keyof HomepageContent["hero"]>(
    key: K,
    value: HomepageContent["hero"][K]
  ) {
    setContent((prev) => ({ ...prev, hero: { ...prev.hero, [key]: value } }));
  }

  function updateCta(
    section: "hero" | "finalCta",
    which: "primaryCta" | "secondaryCta",
    field: "label" | "href",
    value: string
  ) {
    setContent((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [which]: { ...prev[section][which], [field]: value },
      },
    }));
  }

  return (
    <div className="xl:grid xl:grid-cols-2 xl:items-start xl:gap-8">
      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <Tabs defaultValue="hero">
        <TabsList className="flex h-auto flex-wrap gap-1">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="what-is">What is CAT4</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="cta">Final CTA</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="mt-6 space-y-6">
          <section className={adminSectionClass}>
            <h2 className="text-lg font-semibold">Hero</h2>
            <div>
              <Label>Badge</Label>
              <Input
                value={content.hero.badge}
                onChange={(e) => updateHero("badge", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Headline</Label>
              <Input
                value={content.hero.headline}
                onChange={(e) => updateHero("headline", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Headline accent</Label>
              <Input
                value={content.hero.headlineAccent}
                onChange={(e) => updateHero("headlineAccent", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Body</Label>
              <Textarea
                rows={4}
                value={content.hero.body}
                onChange={(e) => updateHero("body", e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Primary CTA label</Label>
                <Input
                  value={content.hero.primaryCta.label}
                  onChange={(e) => updateCta("hero", "primaryCta", "label", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Primary CTA link</Label>
                <Input
                  value={content.hero.primaryCta.href}
                  onChange={(e) => updateCta("hero", "primaryCta", "href", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Secondary CTA label</Label>
                <Input
                  value={content.hero.secondaryCta.label}
                  onChange={(e) => updateCta("hero", "secondaryCta", "label", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Secondary CTA link</Label>
                <Input
                  value={content.hero.secondaryCta.href}
                  onChange={(e) => updateCta("hero", "secondaryCta", "href", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </section>

          <section className={adminSectionClass}>
            <h2 className="text-lg font-semibold">Stats bar</h2>
            {content.stats.map((stat, index) => (
              <div key={index} className="rounded-md border border-border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={stat.useProductCount ?? false}
                    onCheckedChange={(checked) => {
                      const stats = [...content.stats];
                      stats[index] = { ...stats[index], useProductCount: checked };
                      setContent((prev) => ({ ...prev, stats }));
                    }}
                  />
                  <Label>Use live product count</Label>
                </div>
                {!stat.useProductCount && (
                  <div>
                    <Label>Value</Label>
                    <Input
                      value={stat.value}
                      onChange={(e) => {
                        const stats = [...content.stats];
                        stats[index] = { ...stats[index], value: e.target.value };
                        setContent((prev) => ({ ...prev, stats }));
                      }}
                      className="mt-1"
                    />
                  </div>
                )}
                <div>
                  <Label>Label</Label>
                  <Input
                    value={stat.label}
                    onChange={(e) => {
                      const stats = [...content.stats];
                      stats[index] = { ...stats[index], label: e.target.value };
                      setContent((prev) => ({ ...prev, stats }));
                    }}
                    className="mt-1"
                  />
                </div>
              </div>
            ))}
          </section>
        </TabsContent>

        <TabsContent value="sections" className="mt-6 space-y-6">
          <section className={adminSectionClass}>
            <h2 className="text-lg font-semibold">Lineup section</h2>
            <div>
              <Label>Section label</Label>
              <Input
                value={content.lineup.sectionLabel}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    lineup: { sectionLabel: e.target.value },
                  }))
                }
                className="mt-1"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Category cards are generated automatically from your product catalog.
            </p>
          </section>

          <section className={adminSectionClass}>
            <h2 className="text-lg font-semibold">Fan favorites</h2>
            <div>
              <Label>Title</Label>
              <Input
                value={content.fanFavorites.title}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    fanFavorites: { ...prev.fanFavorites, title: e.target.value },
                  }))
                }
                className="mt-1"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>CTA label</Label>
                <Input
                  value={content.fanFavorites.ctaLabel}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      fanFavorites: { ...prev.fanFavorites, ctaLabel: e.target.value },
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>CTA link</Label>
                <Input
                  value={content.fanFavorites.ctaHref}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      fanFavorites: { ...prev.fanFavorites, ctaHref: e.target.value },
                    }))
                  }
                  className="mt-1"
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Products shown come from featured products in the Products admin.
            </p>
          </section>

          <section className={adminSectionClass}>
            <h2 className="text-lg font-semibold">Education preview</h2>
            <div>
              <Label>Section label</Label>
              <Input
                value={content.educationPreview.sectionLabel}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    educationPreview: {
                      ...prev.educationPreview,
                      sectionLabel: e.target.value,
                    },
                  }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label>Title</Label>
              <Input
                value={content.educationPreview.title}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    educationPreview: { ...prev.educationPreview, title: e.target.value },
                  }))
                }
                className="mt-1"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>CTA label</Label>
                <Input
                  value={content.educationPreview.ctaLabel}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      educationPreview: { ...prev.educationPreview, ctaLabel: e.target.value },
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>CTA link</Label>
                <Input
                  value={content.educationPreview.ctaHref}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      educationPreview: { ...prev.educationPreview, ctaHref: e.target.value },
                    }))
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="what-is" className="mt-6">
          <section className={`${adminSectionClass} space-y-4`}>
            <h2 className="text-lg font-semibold">What is CAT4?</h2>
            <div>
              <Label>Section label</Label>
              <Input
                value={content.whatIsCat4.sectionLabel}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    whatIsCat4: { ...prev.whatIsCat4, sectionLabel: e.target.value },
                  }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label>Title</Label>
              <Input
                value={content.whatIsCat4.title}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    whatIsCat4: { ...prev.whatIsCat4, title: e.target.value },
                  }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label>Body</Label>
              <Textarea
                rows={5}
                value={content.whatIsCat4.body}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    whatIsCat4: { ...prev.whatIsCat4, body: e.target.value },
                  }))
                }
                className="mt-1"
              />
            </div>
            <FileUpload
              label="Image"
              accept="image/*"
              value={content.whatIsCat4.imageUrl}
              onChange={(url) =>
                setContent((prev) => ({
                  ...prev,
                  whatIsCat4: { ...prev.whatIsCat4, imageUrl: url },
                }))
              }
            />
            <div>
              <Label>Image caption</Label>
              <Input
                value={content.whatIsCat4.imageCaption}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    whatIsCat4: { ...prev.whatIsCat4, imageCaption: e.target.value },
                  }))
                }
                className="mt-1"
              />
            </div>
            {content.whatIsCat4.bullets.map((bullet, index) => (
              <div key={index} className="rounded-md border border-border p-4 space-y-3">
                <Label>Bullet {index + 1}</Label>
                <Select
                  value={bullet.icon}
                  onValueChange={(value) => {
                    const bullets = [...content.whatIsCat4.bullets];
                    bullets[index] = { ...bullets[index], icon: value };
                    setContent((prev) => ({
                      ...prev,
                      whatIsCat4: { ...prev.whatIsCat4, bullets },
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOMEPAGE_ICON_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={bullet.text}
                  onChange={(e) => {
                    const bullets = [...content.whatIsCat4.bullets];
                    bullets[index] = { ...bullets[index], text: e.target.value };
                    setContent((prev) => ({
                      ...prev,
                      whatIsCat4: { ...prev.whatIsCat4, bullets },
                    }));
                  }}
                />
              </div>
            ))}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>CTA label</Label>
                <Input
                  value={content.whatIsCat4.ctaLabel}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      whatIsCat4: { ...prev.whatIsCat4, ctaLabel: e.target.value },
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>CTA link</Label>
                <Input
                  value={content.whatIsCat4.ctaHref}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      whatIsCat4: { ...prev.whatIsCat4, ctaHref: e.target.value },
                    }))
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="benefits" className="mt-6">
          <section className={`${adminSectionClass} space-y-4`}>
            <h2 className="text-lg font-semibold">Benefits</h2>
            <div>
              <Label>Section label</Label>
              <Input
                value={content.benefits.sectionLabel}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    benefits: { ...prev.benefits, sectionLabel: e.target.value },
                  }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label>Title</Label>
              <Input
                value={content.benefits.title}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    benefits: { ...prev.benefits, title: e.target.value },
                  }))
                }
                className="mt-1"
              />
            </div>
            {content.benefits.cards.map((card, index) => (
              <div key={index} className="rounded-md border border-border p-4 space-y-3">
                <h3 className="font-medium">Card {index + 1}</h3>
                <Input
                  placeholder="Title"
                  value={card.title}
                  onChange={(e) => {
                    const cards = [...content.benefits.cards];
                    cards[index] = { ...cards[index], title: e.target.value };
                    setContent((prev) => ({
                      ...prev,
                      benefits: { ...prev.benefits, cards },
                    }));
                  }}
                />
                <Textarea
                  placeholder="Description"
                  rows={3}
                  value={card.description}
                  onChange={(e) => {
                    const cards = [...content.benefits.cards];
                    cards[index] = { ...cards[index], description: e.target.value };
                    setContent((prev) => ({
                      ...prev,
                      benefits: { ...prev.benefits, cards },
                    }));
                  }}
                />
                <FileUpload
                  label="Image"
                  accept="image/*"
                  value={card.imageUrl}
                  onChange={(url) => {
                    const cards = [...content.benefits.cards];
                    cards[index] = { ...cards[index], imageUrl: url };
                    setContent((prev) => ({
                      ...prev,
                      benefits: { ...prev.benefits, cards },
                    }));
                  }}
                />
                <Select
                  value={card.icon}
                  onValueChange={(value) => {
                    const cards = [...content.benefits.cards];
                    cards[index] = { ...cards[index], icon: value };
                    setContent((prev) => ({
                      ...prev,
                      benefits: { ...prev.benefits, cards },
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOMEPAGE_ICON_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </section>
        </TabsContent>

        <TabsContent value="cta" className="mt-6">
          <section className={`${adminSectionClass} space-y-4`}>
            <h2 className="text-lg font-semibold">Final CTA</h2>
            <div>
              <Label>Section label</Label>
              <Input
                value={content.finalCta.sectionLabel}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    finalCta: { ...prev.finalCta, sectionLabel: e.target.value },
                  }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label>Title</Label>
              <Input
                value={content.finalCta.title}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    finalCta: { ...prev.finalCta, title: e.target.value },
                  }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Input
                value={content.finalCta.subtitle}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    finalCta: { ...prev.finalCta, subtitle: e.target.value },
                  }))
                }
                className="mt-1"
              />
            </div>
            {content.finalCta.bodyParagraphs.map((paragraph, index) => (
              <div key={index}>
                <Label>Paragraph {index + 1}</Label>
                <Textarea
                  rows={3}
                  value={paragraph}
                  onChange={(e) => {
                    const bodyParagraphs = [...content.finalCta.bodyParagraphs];
                    bodyParagraphs[index] = e.target.value;
                    setContent((prev) => ({
                      ...prev,
                      finalCta: { ...prev.finalCta, bodyParagraphs },
                    }));
                  }}
                  className="mt-1"
                />
              </div>
            ))}
            <FileUpload
              label="Image"
              accept="image/*"
              value={content.finalCta.imageUrl}
              onChange={(url) =>
                setContent((prev) => ({
                  ...prev,
                  finalCta: { ...prev.finalCta, imageUrl: url },
                }))
              }
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Primary CTA label</Label>
                <Input
                  value={content.finalCta.primaryCta.label}
                  onChange={(e) => updateCta("finalCta", "primaryCta", "label", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Primary CTA link</Label>
                <Input
                  value={content.finalCta.primaryCta.href}
                  onChange={(e) => updateCta("finalCta", "primaryCta", "href", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Secondary CTA label</Label>
                <Input
                  value={content.finalCta.secondaryCta.label}
                  onChange={(e) => updateCta("finalCta", "secondaryCta", "label", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Secondary CTA link</Label>
                <Input
                  value={content.finalCta.secondaryCta.href}
                  onChange={(e) => updateCta("finalCta", "secondaryCta", "href", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="seo" className="mt-6">
          <section className={adminSectionClass}>
            <h2 className="text-lg font-semibold">SEO</h2>
            <div>
              <Label>Page title</Label>
              <Input
                value={content.seo.title}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    seo: { ...prev.seo, title: e.target.value },
                  }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label>Meta description</Label>
              <Textarea
                rows={3}
                value={content.seo.description}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    seo: { ...prev.seo, description: e.target.value },
                  }))
                }
                className="mt-1"
              />
            </div>
          </section>
        </TabsContent>
      </Tabs>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-green-400">Home page saved successfully.</p>}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Home Page"}
        </Button>
        <Button asChild variant="outline">
          <Link href="/" target="_blank">
            View live site
          </Link>
        </Button>
      </div>
      </form>

      <aside className="min-w-0 xl:sticky xl:top-8">
        <HomePagePreview
          draft={content}
          products={products}
          featuredProducts={featuredProducts}
        />
      </aside>
    </div>
  );
}

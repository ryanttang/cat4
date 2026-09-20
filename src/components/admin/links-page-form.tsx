"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
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
import { adminPanelClass, adminSectionClass } from "@/components/admin/admin-ui";
import { LinksPageView } from "@/components/marketing/links-page-view";
import { deleteLinkPage, updateLinkPage } from "@/lib/actions/admin";
import {
  LINKS_BUTTON_TYPE_LABELS,
  LINKS_BUTTON_TYPES,
  buildLinksPageViewModel,
  createLinksButton,
  linksPagePath,
  type LinksButton,
  type LinksButtonType,
  type LinksPageContent,
} from "@/lib/links";
import type { Product, QrCode, Survey } from "@/lib/db/schema";
import type { LinkPageWithContent } from "@/lib/data/links";
import { LinksPageQrCard } from "@/components/admin/links-page-qr-card";
import { slugify } from "@/lib/utils";
import { cn } from "@/lib/utils";

type LinksPageFormProps = {
  page: LinkPageWithContent;
  qrCode: QrCode | null;
  products: Product[];
  surveys: Survey[];
  polls: Survey[];
};

function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(index, 1);
  next.splice(nextIndex, 0, item);
  return next;
}

export function LinksPageForm({
  page,
  qrCode,
  products,
  surveys,
  polls,
}: LinksPageFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [content, setContent] = useState(page.content);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const publicPath = linksPagePath(slug);

  const catalog = useMemo(
    () => [...surveys, ...polls],
    [surveys, polls]
  );
  const preview = useMemo(
    () => buildLinksPageViewModel(content, products, catalog),
    [content, products, catalog]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const result = await updateLinkPage(page.id, {
      title,
      slug,
      status: content.published ? "published" : "draft",
      content,
    });
    if (result.success) {
      setSuccess(true);
      router.refresh();
    } else {
      setError(result.error ?? "Failed to save");
    }
    setLoading(false);
  }

  function updateAppearance<K extends keyof LinksPageContent["appearance"]>(
    key: K,
    value: LinksPageContent["appearance"][K]
  ) {
    setContent((prev) => ({
      ...prev,
      appearance: { ...prev.appearance, [key]: value },
    }));
  }

  function updateButton(index: number, patch: Partial<LinksButton>) {
    setContent((prev) => {
      const buttons = [...prev.buttons];
      buttons[index] = { ...buttons[index], ...patch };
      return { ...prev, buttons };
    });
  }

  return (
    <div className="xl:grid xl:grid-cols-2 xl:items-start xl:gap-8">
      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <section className={adminSectionClass}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Publish</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Public URL:{" "}
                <Link href={publicPath} className="text-cat4-blue hover:underline" target="_blank">
                  {publicPath}
                </Link>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="links-published" className="text-sm font-normal">
                Live
              </Label>
              <Switch
                id="links-published"
                checked={content.published}
                onCheckedChange={(published) => setContent((prev) => ({ ...prev, published }))}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Page name</Label>
              <Input
                value={title}
                onChange={(e) => {
                  const next = e.target.value;
                  setTitle(next);
                  if (slug === slugify(page.title) || slug === page.slug) {
                    setSlug(slugify(next));
                  }
                }}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Slug</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>
        </section>

        <LinksPageQrCard qrCode={qrCode} />

        <Tabs defaultValue="appearance">
          <TabsList className="flex h-auto flex-wrap gap-1">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="buttons">Buttons</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="subscribe">Subscribe</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="mt-6 space-y-6">
            <section className={adminSectionClass}>
              <h2 className="text-lg font-semibold">Landing page</h2>
              <div>
                <Label>Title</Label>
                <Input
                  value={content.appearance.title}
                  onChange={(e) => updateAppearance("title", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Bio</Label>
                <Textarea
                  rows={3}
                  value={content.appearance.bio}
                  onChange={(e) => updateAppearance("bio", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Hero style</Label>
                  <Select
                    value={content.appearance.heroStyle}
                    onValueChange={(value) =>
                      updateAppearance("heroStyle", value as "avatar" | "banner")
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="avatar">Circular avatar</SelectItem>
                      <SelectItem value="banner">Wide banner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Button style</Label>
                  <Select
                    value={content.appearance.buttonStyle}
                    onValueChange={(value) =>
                      updateAppearance("buttonStyle", value as "filled" | "outline")
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="filled">Filled</SelectItem>
                      <SelectItem value="outline">Outline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <FileUpload
                label="Hero image"
                accept="image/*"
                value={content.appearance.heroImageUrl}
                onChange={(url) => updateAppearance("heroImageUrl", url)}
              />
              {content.appearance.heroImageUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => updateAppearance("heroImageUrl", "")}
                >
                  Remove hero image
                </Button>
              )}
              <div>
                <Label>Background</Label>
                <Select
                  value={content.appearance.backgroundStyle}
                  onValueChange={(value) =>
                    updateAppearance("backgroundStyle", value as "brand" | "image")
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brand">Brand colors</SelectItem>
                    <SelectItem value="image">Custom image</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {content.appearance.backgroundStyle === "image" && (
                <FileUpload
                  label="Background image"
                  accept="image/*"
                  value={content.appearance.backgroundImageUrl}
                  onChange={(url) => updateAppearance("backgroundImageUrl", url)}
                />
              )}
            </section>
          </TabsContent>

          <TabsContent value="buttons" className="mt-6 space-y-6">
            <section className={adminSectionClass}>
              <div>
                <h2 className="text-lg font-semibold">Buttons</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add custom URLs, products, surveys, polls, or a subscribe modal. Disabled
                  buttons stay saved but hidden on the public page.
                </p>
              </div>

              {content.buttons.map((button, index) => (
                <div key={button.id} className="space-y-3 rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={button.enabled}
                        onCheckedChange={(enabled) => updateButton(index, { enabled })}
                        aria-label={`Show ${button.label || "button"}`}
                      />
                      <span className="text-sm text-muted-foreground">Visible</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setContent((prev) => ({
                            ...prev,
                            buttons: moveItem(prev.buttons, index, -1),
                          }))
                        }
                        disabled={index === 0}
                        aria-label="Move up"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setContent((prev) => ({
                            ...prev,
                            buttons: moveItem(prev.buttons, index, 1),
                          }))
                        }
                        disabled={index === content.buttons.length - 1}
                        aria-label="Move down"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setContent((prev) => ({
                            ...prev,
                            buttons: prev.buttons.filter((_, i) => i !== index),
                          }))
                        }
                        aria-label="Remove button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label>Label</Label>
                      <Input
                        value={button.label}
                        onChange={(e) => updateButton(index, { label: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select
                        value={button.type}
                        onValueChange={(value) =>
                          updateButton(index, { type: value as LinksButtonType })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LINKS_BUTTON_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {LINKS_BUTTON_TYPE_LABELS[type]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {button.type === "url" && (
                    <div>
                      <Label>URL</Label>
                      <Input
                        value={button.url ?? ""}
                        onChange={(e) => updateButton(index, { url: e.target.value })}
                        placeholder="/products or https://"
                        className="mt-1"
                      />
                    </div>
                  )}

                  {button.type === "product" && (
                    <div>
                      <Label>Product</Label>
                        <Select
                          value={button.productId || undefined}
                          onValueChange={(productId) => updateButton(index, { productId })}
                        >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {button.type === "survey" && (
                    <div>
                      <Label>Survey</Label>
                      {surveys.length === 0 ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          No surveys yet. Create one under Brand Tools → Surveys.
                        </p>
                      ) : (
                        <Select
                          value={button.surveyId || undefined}
                          onValueChange={(surveyId) => updateButton(index, { surveyId })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select a survey" />
                          </SelectTrigger>
                          <SelectContent>
                            {surveys.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.title}
                                {item.status !== "published" ? " (draft)" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  )}

                  {button.type === "poll" && (
                    <div>
                      <Label>Poll</Label>
                      {polls.length === 0 ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          No polls yet. Create one under Brand Tools → Polls.
                        </p>
                      ) : (
                        <Select
                          value={button.surveyId || undefined}
                          onValueChange={(surveyId) => updateButton(index, { surveyId })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select a poll" />
                          </SelectTrigger>
                          <SelectContent>
                            {polls.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.title}
                                {item.status !== "published" ? " (draft)" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  )}

                  {button.type === "subscribe" && (
                    <p className="text-sm text-muted-foreground">
                      Opens the subscribe form modal. Edit copy in the Subscribe tab.
                    </p>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setContent((prev) => ({
                    ...prev,
                    buttons: [...prev.buttons, createLinksButton()],
                  }))
                }
              >
                <Plus className="mr-1 h-4 w-4" />
                Add button
              </Button>
            </section>
          </TabsContent>

          <TabsContent value="products" className="mt-6 space-y-6">
            <section className={adminSectionClass}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Product thumbnails</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Show a thumbnail grid of selected products on the Links page.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="links-products-enabled" className="text-sm font-normal">
                    Show
                  </Label>
                  <Switch
                    id="links-products-enabled"
                    checked={content.products.enabled}
                    onCheckedChange={(enabled) =>
                      setContent((prev) => ({
                        ...prev,
                        products: { ...prev.products, enabled },
                      }))
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Heading</Label>
                <Input
                  value={content.products.heading}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      products: { ...prev.products, heading: e.target.value },
                    }))
                  }
                  className="mt-1"
                />
              </div>

              {content.products.productIds.map((id, index) => {
                const selected = products.find((product) => product.id === id);
                return (
                  <div key={`${id}-${index}`} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
                      {selected?.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={selected.images[0]}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                    <Select
                      value={id}
                      onValueChange={(productId) =>
                        setContent((prev) => {
                          const productIds = [...prev.products.productIds];
                          productIds[index] = productId;
                          return { ...prev, products: { ...prev.products, productIds } };
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setContent((prev) => ({
                            ...prev,
                            products: {
                              ...prev.products,
                              productIds: moveItem(prev.products.productIds, index, -1),
                            },
                          }))
                        }
                        disabled={index === 0}
                        aria-label="Move product up"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setContent((prev) => ({
                            ...prev,
                            products: {
                              ...prev.products,
                              productIds: moveItem(prev.products.productIds, index, 1),
                            },
                          }))
                        }
                        disabled={index === content.products.productIds.length - 1}
                        aria-label="Move product down"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setContent((prev) => ({
                            ...prev,
                            products: {
                              ...prev.products,
                              productIds: prev.products.productIds.filter((_, i) => i !== index),
                            },
                          }))
                        }
                        aria-label="Remove product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={products.length === 0}
                onClick={() =>
                  setContent((prev) => {
                    const unused = products.find((product) => !prev.products.productIds.includes(product.id));
                    const nextId = unused?.id ?? products[0]?.id ?? "";
                    if (!nextId) return prev;
                    return {
                      ...prev,
                      products: {
                        ...prev.products,
                        productIds: [...prev.products.productIds, nextId],
                      },
                    };
                  })
                }
              >
                <Plus className="mr-1 h-4 w-4" />
                Add product thumbnail
              </Button>
            </section>
          </TabsContent>

          <TabsContent value="subscribe" className="mt-6 space-y-6">
            <section className={adminSectionClass}>
              <h2 className="text-lg font-semibold">Subscribe modal</h2>
              <p className="text-sm text-muted-foreground">
                Shown when a Subscribe button is tapped. Captures go to Brand Tools →
                Subscribes with source <code>links</code>.
              </p>
              <div>
                <Label>Modal title</Label>
                <Input
                  value={content.subscribe.modalTitle}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      subscribe: { ...prev.subscribe, modalTitle: e.target.value },
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Modal body</Label>
                <Textarea
                  rows={3}
                  value={content.subscribe.modalBody}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      subscribe: { ...prev.subscribe, modalBody: e.target.value },
                    }))
                  }
                  className="mt-1"
                />
              </div>
            </section>
          </TabsContent>

          <TabsContent value="seo" className="mt-6 space-y-6">
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
        {success && <p className="text-sm text-green-400">Links page saved successfully.</p>}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Links Page"}
          </Button>
          <Button asChild variant="outline">
            <Link href={publicPath} target="_blank">
              View live page
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={async () => {
              if (!confirm("Delete this links page and its QR code?")) return;
              const result = await deleteLinkPage(page.id);
              if (result.success) router.push("/admin/links");
              else setError(result.error ?? "Failed to delete");
            }}
          >
            Delete
          </Button>
        </div>
      </form>

      <aside className="min-w-0 xl:sticky xl:top-8">
        <div className={cn("overflow-hidden", adminPanelClass)}>
          <div className="border-b border-border px-4 py-3">
            <h3 className="font-semibold">Preview</h3>
            <p className="text-xs text-muted-foreground">Updates live as you edit.</p>
          </div>
          <div className="flex justify-center bg-muted/20 p-4">
            <div className="w-[390px] overflow-hidden rounded-xl border border-border bg-cat4-dark shadow-lg">
              <div className="h-[780px] overflow-y-auto">
                <LinksPageView view={preview} preview />
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

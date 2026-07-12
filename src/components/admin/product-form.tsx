"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUpload } from "@/components/admin/file-upload";
import { createProduct, updateProduct } from "@/lib/actions/admin";
import { PRODUCT_CATEGORIES, slugify } from "@/lib/utils";
import type { Product } from "@/lib/db/schema";
import { ChevronLeft } from "lucide-react";
import type { AdminDialogFormProps } from "@/components/admin/admin-form-dialog";

type ProductFormProps = AdminDialogFormProps & {
  product?: Product;
};

export function ProductForm({ product, dialog, onSuccess }: ProductFormProps) {
  const router = useRouter();
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [category, setCategory] = useState(product?.category ?? "cartridge");
  const [description, setDescription] = useState(product?.description ?? "");
  const [longDescription, setLongDescription] = useState(product?.longDescription ?? "");
  const [images, setImages] = useState<string[]>((product?.images as string[]) ?? []);
  const [price, setPrice] = useState(product?.price ?? "");
  const [compareAtPrice, setCompareAtPrice] = useState(product?.compareAtPrice ?? "");
  const [classification, setClassification] = useState(product?.classification ?? "");
  const [size, setSize] = useState(product?.size ?? "");
  const [thcPercent, setThcPercent] = useState(product?.thcPercent ?? "");
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [featuredOrder, setFeaturedOrder] = useState(product?.featuredOrder ?? 0);
  const [published, setPublished] = useState(product?.published ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = {
      name,
      slug: slug || slugify(name),
      category,
      description,
      longDescription,
      images,
      price: price || null,
      compareAtPrice: compareAtPrice || null,
      classification: classification || null,
      size: size || null,
      thcPercent: thcPercent || null,
      featured,
      featuredOrder,
      published,
    };

    const result = product
      ? await updateProduct(product.id, data)
      : await createProduct(data);

    if (result.success) {
      if (onSuccess) onSuccess();
      else {
        router.push("/admin/products");
        router.refresh();
      }
    } else {
      setError(result.error ?? "Failed to save");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={dialog ? "space-y-6" : "max-w-2xl space-y-6"}>
      {!dialog && (
        <Button asChild variant="ghost" className="-ml-2">
          <Link href="/admin/products">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>
      )}

      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!product) setSlug(slugify(e.target.value));
          }}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" required value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1" />
      </div>

      <div>
        <Label>Category</Label>
        <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRODUCT_CATEGORIES.map((c) => (
              <SelectItem key={c.slug} value={c.slug}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Short Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" />
      </div>

      <div>
        <Label htmlFor="longDescription">Long Description</Label>
        <Textarea
          id="longDescription"
          rows={6}
          value={longDescription}
          onChange={(e) => setLongDescription(e.target.value)}
          className="mt-1"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="price">Price (Bellflower)</Label>
          <Input id="price" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="3.60" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="compareAtPrice">Compare-at Price</Label>
          <Input id="compareAtPrice" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} placeholder="4.50" className="mt-1" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="classification">Classification</Label>
          <Input id="classification" value={classification} onChange={(e) => setClassification(e.target.value)} placeholder="Indica" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="size">Size</Label>
          <Input id="size" value={size} onChange={(e) => setSize(e.target.value)} placeholder="1G" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="thcPercent">THC %</Label>
          <Input id="thcPercent" value={thcPercent} onChange={(e) => setThcPercent(e.target.value)} placeholder="21.49" className="mt-1" />
        </div>
      </div>

      <FileUpload
        label="Product Image"
        value={images[0]}
        onChange={(url) => setImages([url])}
      />

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Switch checked={featured} onCheckedChange={setFeatured} />
          <Label>Featured</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={published} onCheckedChange={setPublished} />
          <Label>Published</Label>
        </div>
      </div>

      {featured && (
        <div>
          <Label htmlFor="featuredOrder">Featured Order</Label>
          <Input
            id="featuredOrder"
            type="number"
            value={featuredOrder}
            onChange={(e) => setFeaturedOrder(Number(e.target.value))}
            className="mt-1 w-24"
          />
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : product ? "Update Product" : "Create Product"}
      </Button>
    </form>
  );
}

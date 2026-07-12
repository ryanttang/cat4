import { randomUUID } from "crypto";
import { eq, desc, and } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { products, type Product } from "@/lib/db/schema";
import { isMockDataMode, mockProducts, now } from "./shared";

export async function getPublishedProducts(): Promise<Product[]> {
  if (isMockDataMode()) {
    return mockProducts()
      .filter((p) => p.published)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  return getDb()
    .select()
    .from(products)
    .where(eq(products.published, true))
    .orderBy(products.name);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  if (isMockDataMode()) {
    return mockProducts()
      .filter((p) => p.featured && p.published)
      .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0));
  }

  return getDb()
    .select()
    .from(products)
    .where(and(eq(products.featured, true), eq(products.published, true)))
    .orderBy(products.featuredOrder);
}

export async function getProductsByCategory(category: Product["category"]): Promise<Product[]> {
  if (isMockDataMode()) {
    return mockProducts()
      .filter((p) => p.category === category && p.published)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  return getDb()
    .select()
    .from(products)
    .where(and(eq(products.category, category), eq(products.published, true)))
    .orderBy(products.name);
}

export async function getAllProducts(): Promise<Product[]> {
  if (isMockDataMode()) {
    return [...mockProducts()].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  return getDb().select().from(products).orderBy(desc(products.updatedAt));
}

export async function getProductById(id: string): Promise<Product | null> {
  if (isMockDataMode()) {
    return mockProducts().find((p) => p.id === id) ?? null;
  }

  const [product] = await getDb().select().from(products).where(eq(products.id, id)).limit(1);
  return product ?? null;
}

export async function getProductBySlugAndCategory(
  slug: string,
  category: Product["category"],
  publishedOnly = false
): Promise<Product | null> {
  if (isMockDataMode()) {
    return (
      mockProducts().find(
        (p) =>
          p.slug === slug && p.category === category && (!publishedOnly || p.published)
      ) ?? null
    );
  }

  const conditions = [eq(products.slug, slug), eq(products.category, category)];
  if (publishedOnly) conditions.push(eq(products.published, true));

  const [product] = await getDb()
    .select()
    .from(products)
    .where(and(...conditions))
    .limit(1);
  return product ?? null;
}

export async function createProduct(
  data: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">> &
    Pick<Product, "name" | "slug" | "category">
): Promise<Product> {
  if (isMockDataMode()) {
    const product: Product = {
      id: randomUUID(),
      name: data.name,
      slug: data.slug,
      category: data.category,
      description: data.description ?? null,
      longDescription: data.longDescription ?? null,
      images: data.images ?? [],
      price: data.price ?? null,
      compareAtPrice: data.compareAtPrice ?? null,
      classification: data.classification ?? null,
      subtype: data.subtype ?? null,
      size: data.size ?? null,
      thcPercent: data.thcPercent ?? null,
      discountPercent: data.discountPercent ?? null,
      featured: data.featured ?? false,
      featuredOrder: data.featuredOrder ?? 0,
      published: data.published ?? false,
      createdAt: now(),
      updatedAt: now(),
    };
    mockProducts().push(product);
    return product;
  }

  const [product] = await getDb().insert(products).values(data).returning();
  return product;
}

export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>
): Promise<Product | null> {
  if (isMockDataMode()) {
    const index = mockProducts().findIndex((p) => p.id === id);
    if (index === -1) return null;
    mockProducts()[index] = {
      ...mockProducts()[index],
      ...data,
      updatedAt: now(),
    };
    return mockProducts()[index];
  }

  const [product] = await getDb()
    .update(products)
    .set({ ...data, updatedAt: now() })
    .where(eq(products.id, id))
    .returning();
  return product ?? null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (isMockDataMode()) {
    const index = mockProducts().findIndex((p) => p.id === id);
    if (index === -1) return false;
    mockProducts().splice(index, 1);
    return true;
  }

  await getDb().delete(products).where(eq(products.id, id));
  return true;
}

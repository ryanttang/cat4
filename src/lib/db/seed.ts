import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { isDatabaseConfigured } from "@/lib/config";
import { getDb } from "./index";
import {
  users,
  heroBlocks,
  products,
  locations,
  educationArticles,
  aboutSections,
  landingPages,
} from "./schema";
import { DEFAULT_HERO_YOUTUBE_URL } from "../hero-video";
import { MOCK_SWEEPSTAKES_PAGE } from "../mock/sweepstakes-seed";
import { brand } from "@/lib/brand";
import { MOCK_EDUCATION_ARTICLES } from "../mock/education-seed";
import { MOCK_PRODUCTS } from "../mock/products-seed";
import { MOCK_LOCATIONS } from "../mock/locations-seed";

async function seed() {
  if (!isDatabaseConfigured()) {
    console.log("DATABASE_URL not set — skipping seed (using mock data in dev).");
    return;
  }

  const db = getDb();

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? brand.defaults.seedAdminEmail;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "changeme123";

  const existing = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);
  if (existing.length === 0) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await db.insert(users).values({
      email: adminEmail,
      passwordHash,
      name: brand.defaults.seedAdminName,
      role: "admin",
    });
    console.log(`Created admin user: ${adminEmail}`);
  }

  const heroCount = await db.select().from(heroBlocks).limit(1);
  if (heroCount.length === 0) {
    await db.insert(heroBlocks).values({
      headline: "Elevate Your Experience",
      subheadline: "Premium cannabis products crafted with precision and passion.",
      ctaLabel: "Explore Products",
      ctaHref: "/products",
      videoSourceType: "embed",
      videoUrl: DEFAULT_HERO_YOUTUBE_URL,
      isActive: true,
      sortOrder: 0,
    });
  }

  const productCount = await db.select().from(products).limit(1);
  if (productCount.length === 0 && MOCK_PRODUCTS.length > 0) {
    await db.insert(products).values(
      MOCK_PRODUCTS.map(({ createdAt: _c, updatedAt: _u, ...product }) => product)
    );
    console.log(`Seeded ${MOCK_PRODUCTS.length} products`);
  } else if (productCount.length === 0) {
    console.log("No products to seed (catalog is empty — add via Admin → Products)");
  }

  const locationCount = await db.select().from(locations).limit(1);
  if (locationCount.length === 0) {
    await db.insert(locations).values(
      MOCK_LOCATIONS.map(({ id: _id, createdAt: _c, updatedAt: _u, ...location }) => location)
    );
    console.log(`Seeded ${MOCK_LOCATIONS.length} Catalyst dispensary locations`);
  }

  const articleCount = await db.select().from(educationArticles).limit(1);
  if (articleCount.length === 0) {
    await db.insert(educationArticles).values(
      MOCK_EDUCATION_ARTICLES.map(({ createdAt: _c, updatedAt: _u, ...article }) => ({
        ...article,
        publishedAt: article.publishedAt ?? new Date(),
      }))
    );
  }

  const aboutCount = await db.select().from(aboutSections).limit(1);
  if (aboutCount.length === 0) {
    await db.insert(aboutSections).values([
      {
        title: "Our Mission",
        body: "CAT4 is dedicated to delivering premium cannabis products that elevate every experience. We combine rigorous quality standards with innovative formulations to create products our community trusts.",
        sortOrder: 0,
        published: true,
      },
      {
        title: "Our Story",
        body: "Founded by cannabis enthusiasts who saw an opportunity to raise the bar, CAT4 started with a simple belief: consumers deserve transparency, quality, and consistency. Today, we partner with licensed retailers across the country to bring our products to discerning customers.",
        sortOrder: 1,
        published: true,
      },
      {
        title: "Our Values",
        body: "Quality without compromise. Transparency in everything we do. Respect for the plant and the people who enjoy it. Community-first partnerships with retailers and consumers alike.",
        sortOrder: 2,
        published: true,
      },
    ]);
  }

  const landingCount = await db.select().from(landingPages).limit(1);
  if (landingCount.length === 0) {
    await db.insert(landingPages).values({
      id: MOCK_SWEEPSTAKES_PAGE.id,
      slug: MOCK_SWEEPSTAKES_PAGE.slug,
      title: MOCK_SWEEPSTAKES_PAGE.title,
      type: MOCK_SWEEPSTAKES_PAGE.type,
      status: MOCK_SWEEPSTAKES_PAGE.status,
      blocks: MOCK_SWEEPSTAKES_PAGE.blocks,
      startsAt: MOCK_SWEEPSTAKES_PAGE.startsAt,
      endsAt: MOCK_SWEEPSTAKES_PAGE.endsAt,
      publishedAt: MOCK_SWEEPSTAKES_PAGE.publishedAt,
    });
    console.log("Created sample sweepstakes landing page");
  }

  console.log("Seed complete.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

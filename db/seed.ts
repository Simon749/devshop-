import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("🌱 Seeding DevCraft database...\n");

  const [template] = await db
    .insert(schema.templates)
    .values({
      title: "Côte Royale — Luxury Fragrance Website",
      slug: "cote-royale-luxury-fragrance",
      description: `A stunning luxury fragrance brand website built with Next.js 15 and GSAP. Features cinematic scroll-triggered animations, a parallax hero section, scroll-text reveal, full-bleed product showcase grids, and a Prismic CMS integration for content management.

This is a production-ready template — deployed live at https://luxury-website-course-c-te-royale.vercel.app/ — built for premium brands that demand editorial-quality web presence.`,
      category: "landing",
      techStack: [
        "Next.js 15",
        "React",
        "TypeScript",
        "Tailwind CSS",
        "GSAP",
        "Prismic CMS",
        "Vercel",
      ],
      features: [
        "Cinematic GSAP scroll-triggered animations throughout",
        "Parallax hero with full-viewport background image",
        "Scroll-text reveal section with character-by-character animation",
        "Full-bleed product feature grid (3-column asymmetric layout)",
        "Fragrance list with sticky scroll + progressive fade-in",
        "Mobile-responsive hamburger drawer navigation",
        "Prismic CMS integration — all content editable without code",
        "SEO-optimised meta tags + Open Graph image",
        "Vercel-ready deployment configuration",
        "Extended commercial license — use for client projects",
      ],
      priceUsd: "49.00",
      priceKes: "6500.00",
      licenseType: "extended",
      livePreviewUrl: "https://luxury-website-course-c-te-royale.vercel.app/",
      zipFileKey: null,
      screenshots: [],
      isPublished: true,
      downloadCount: 0,
    })
    .returning();

  console.log(`✅ Template inserted: "${template.title}"`);
  console.log(`   ID  : ${template.id}`);
  console.log(`   Slug: ${template.slug}`);
  console.log(`   USD : $${template.priceUsd}`);
  console.log(`   KES : KES ${template.priceKes}\n`);

  const all = await db.select().from(schema.templates);
  console.log(`📦 Total templates in DB: ${all.length}`);
  all.forEach((t) => {
    console.log(`   - [${t.isPublished ? "✅ published" : "⬜ draft   "}] ${t.title}`);
  });

  console.log("\n🎉 Seed complete.");
  console.log("\n⚠️  Next steps:");
  console.log("   1. Upload the Côte Royale ZIP to Uploadthing → copy the file key");
  console.log("   2. Upload 4-6 screenshots → copy the keys");
  console.log("   3. Update zipFileKey + screenshots[] via admin panel (Week 4)");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

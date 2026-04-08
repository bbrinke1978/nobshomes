/**
 * Seed script — inserts existing static content into the database.
 * Safe to run multiple times (uses onConflictDoNothing).
 *
 * Usage: npx tsx scripts/seed.ts
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { db } from "../src/lib/db";
import { nbsBlogPosts, nbsTestimonials, nbsGalleryImages } from "../src/lib/schema";

/** Lightweight markdown to HTML — matches blog.ts logic */
function inline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
}

function markdownToHtml(markdown: string): string {
  return markdown
    .split("\n\n")
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("## ")) return `<h2>${inline(trimmed.slice(3))}</h2>`;
      if (trimmed.startsWith("### ")) return `<h3>${inline(trimmed.slice(4))}</h3>`;
      if (trimmed.match(/^[-*] /m)) {
        const items = trimmed
          .split("\n")
          .map((li) => `<li>${inline(li.replace(/^[-*] /, ""))}</li>`)
          .join("");
        return `<ul>${items}</ul>`;
      }
      return `<p>${inline(trimmed.replace(/\n/g, " "))}</p>`;
    })
    .join("\n");
}

async function seed() {
  console.log("Seeding database...");

  // Gallery images
  await db
    .insert(nbsGalleryImages)
    .values([
      {
        blobUrl: "/images/gallery/placeholder-1.jpg",
        alt: "Renovated suburban home - before and after",
        projectName: "Salt Lake City Renovation",
        displayOrder: 1,
      },
      {
        blobUrl: "/images/gallery/placeholder-2.jpg",
        alt: "Rural property purchase in Carbon County",
        projectName: "Price Property Acquisition",
        displayOrder: 2,
      },
      {
        blobUrl: "/images/gallery/placeholder-3.jpg",
        alt: "Modern home restoration project",
        projectName: "Provo Home Restoration",
        displayOrder: 3,
      },
    ])
    .onConflictDoNothing();
  console.log("  Gallery images seeded.");

  // Testimonials
  await db
    .insert(nbsTestimonials)
    .values([
      {
        name: "Sarah M.",
        location: "Salt Lake City, UT",
        quote:
          "They gave us a fair offer and closed in 10 days. No runaround, no hidden fees. Exactly what they promised.",
        rating: 5,
        displayOrder: 1,
        active: true,
      },
      {
        name: "James & Linda R.",
        location: "Provo, UT",
        quote:
          "We were behind on payments and didn't know what to do. Brian and Shawn treated us like family, not a transaction.",
        rating: 5,
        displayOrder: 2,
        active: true,
      },
      {
        name: "Michael T.",
        location: "Price, UT",
        quote:
          "Inherited my mom's house and it needed too much work. They bought it as-is and I had cash in hand within two weeks.",
        rating: 5,
        displayOrder: 3,
        active: true,
      },
    ])
    .onConflictDoNothing();
  console.log("  Testimonials seeded.");

  // Blog post — read from markdown file
  const blogFilePath = path.join(process.cwd(), "content/blog/5-signs-time-to-sell-fast.md");
  const fileContents = fs.readFileSync(blogFilePath, "utf8");
  const { data, content } = matter(fileContents);
  const html = markdownToHtml(content);

  await db
    .insert(nbsBlogPosts)
    .values([
      {
        title: data.title as string,
        slug: data.slug as string,
        content: html,
        excerpt: (data.excerpt as string) || "",
        published: true,
      },
    ])
    .onConflictDoNothing();
  console.log("  Blog post seeded.");

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

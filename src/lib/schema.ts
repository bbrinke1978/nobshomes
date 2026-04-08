import { pgTable, serial, text, boolean, integer, timestamp, index, unique } from "drizzle-orm/pg-core";

export const nbsBlogPosts = pgTable(
  "nbs_blog_posts",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    content: text("content").notNull(),
    excerpt: text("excerpt").notNull().default(""),
    published: boolean("published").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("nbs_blog_posts_slug_idx").on(table.slug)]
);

export const nbsTestimonials = pgTable("nbs_testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull().default(""),
  quote: text("quote").notNull(),
  rating: integer("rating").notNull().default(5),
  displayOrder: integer("display_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const nbsGalleryImages = pgTable("nbs_gallery_images", {
  id: serial("id").primaryKey(),
  blobUrl: text("blob_url").notNull(),
  alt: text("alt").notNull().default(""),
  projectName: text("project_name").notNull().default(""),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

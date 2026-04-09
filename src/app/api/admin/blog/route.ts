import { auth } from "@/auth";
import { db } from "@/lib/db";
import { nbsBlogPosts } from "@/lib/schema";
import { desc } from "drizzle-orm";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const posts = await db
    .select({
      id: nbsBlogPosts.id,
      title: nbsBlogPosts.title,
      slug: nbsBlogPosts.slug,
      excerpt: nbsBlogPosts.excerpt,
      published: nbsBlogPosts.published,
      createdAt: nbsBlogPosts.createdAt,
    })
    .from(nbsBlogPosts)
    .orderBy(desc(nbsBlogPosts.createdAt));

  return Response.json(posts);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { title, content, excerpt, published } = await request.json();

  if (!title || !content) {
    return new Response("title and content are required", { status: 400 });
  }

  const slug = generateSlug(title);

  const [inserted] = await db
    .insert(nbsBlogPosts)
    .values({
      title,
      slug,
      content,
      excerpt: excerpt ?? "",
      published: published ?? false,
    })
    .returning();

  return Response.json(inserted, { status: 201 });
}

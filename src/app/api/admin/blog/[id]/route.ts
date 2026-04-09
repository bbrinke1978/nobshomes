import { auth } from "@/auth";
import { db } from "@/lib/db";
import { nbsBlogPosts } from "@/lib/schema";
import { eq } from "drizzle-orm";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const postId = parseInt(id, 10);
  if (isNaN(postId)) return new Response("Invalid id", { status: 400 });

  const [post] = await db
    .select()
    .from(nbsBlogPosts)
    .where(eq(nbsBlogPosts.id, postId))
    .limit(1);

  if (!post) return new Response("Not found", { status: 404 });

  return Response.json(post);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const postId = parseInt(id, 10);
  if (isNaN(postId)) return new Response("Invalid id", { status: 400 });

  const { title, content, excerpt, published } = await request.json();

  if (!title || !content) {
    return new Response("title and content are required", { status: 400 });
  }

  const slug = generateSlug(title);

  const [updated] = await db
    .update(nbsBlogPosts)
    .set({ title, slug, content, excerpt: excerpt ?? "", published: published ?? false, updatedAt: new Date() })
    .where(eq(nbsBlogPosts.id, postId))
    .returning();

  if (!updated) return new Response("Not found", { status: 404 });

  return Response.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const postId = parseInt(id, 10);
  if (isNaN(postId)) return new Response("Invalid id", { status: 400 });

  await db.delete(nbsBlogPosts).where(eq(nbsBlogPosts.id, postId));

  return new Response(null, { status: 204 });
}

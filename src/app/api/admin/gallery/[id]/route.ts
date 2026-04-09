import { auth } from "@/auth";
import { db } from "@/lib/db";
import { nbsGalleryImages } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (isNaN(id)) {
    return new Response("Invalid id", { status: 400 });
  }

  const { alt, projectName } = await request.json();

  const [updated] = await db
    .update(nbsGalleryImages)
    .set({ alt: alt ?? "", projectName: projectName ?? "" })
    .where(eq(nbsGalleryImages.id, id))
    .returning();

  if (!updated) {
    return new Response("Not found", { status: 404 });
  }

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

  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (isNaN(id)) {
    return new Response("Invalid id", { status: 400 });
  }

  await db
    .delete(nbsGalleryImages)
    .where(eq(nbsGalleryImages.id, id));

  return new Response(null, { status: 204 });
}

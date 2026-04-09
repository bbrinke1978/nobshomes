import { auth } from "@/auth";
import { db } from "@/lib/db";
import { nbsGalleryImages } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { orderedIds } = await request.json();

  if (!Array.isArray(orderedIds)) {
    return new Response("orderedIds must be an array", { status: 400 });
  }

  // Update displayOrder for each image
  for (let index = 0; index < orderedIds.length; index++) {
    const id = orderedIds[index];
    await db
      .update(nbsGalleryImages)
      .set({ displayOrder: index })
      .where(eq(nbsGalleryImages.id, id));
  }

  return new Response(null, { status: 200 });
}

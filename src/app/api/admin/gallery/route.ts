import { auth } from "@/auth";
import { db } from "@/lib/db";
import { nbsGalleryImages } from "@/lib/schema";
import { asc, max } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const images = await db
    .select()
    .from(nbsGalleryImages)
    .orderBy(asc(nbsGalleryImages.displayOrder));

  return Response.json(images);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { blobUrl, alt, projectName } = await request.json();

  if (!blobUrl) {
    return new Response("blobUrl is required", { status: 400 });
  }

  // Get current max displayOrder
  const [{ maxOrder }] = await db
    .select({ maxOrder: max(nbsGalleryImages.displayOrder) })
    .from(nbsGalleryImages);

  const nextOrder = (maxOrder ?? -1) + 1;

  const [inserted] = await db
    .insert(nbsGalleryImages)
    .values({
      blobUrl,
      alt: alt ?? "",
      projectName: projectName ?? "",
      displayOrder: nextOrder,
    })
    .returning();

  return Response.json(inserted, { status: 201 });
}

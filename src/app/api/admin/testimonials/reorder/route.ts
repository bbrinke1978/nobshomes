import { auth } from "@/auth";
import { db } from "@/lib/db";
import { nbsTestimonials } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { orderedIds } = await request.json() as { orderedIds: number[] };

  if (!Array.isArray(orderedIds)) {
    return new Response("orderedIds must be an array", { status: 400 });
  }

  // Update displayOrder for each testimonial in the ordered list
  await Promise.all(
    orderedIds.map((id, index) =>
      db
        .update(nbsTestimonials)
        .set({ displayOrder: index })
        .where(eq(nbsTestimonials.id, id))
    )
  );

  return Response.json({ ok: true });
}

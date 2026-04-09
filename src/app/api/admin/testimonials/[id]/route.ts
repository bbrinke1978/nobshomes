import { auth } from "@/auth";
import { db } from "@/lib/db";
import { nbsTestimonials } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const testimonialId = parseInt(id, 10);
  if (isNaN(testimonialId)) return new Response("Invalid id", { status: 400 });

  const { name, location, quote, rating, active } = await request.json();

  const updateValues: Partial<{
    name: string;
    location: string;
    quote: string;
    rating: number;
    active: boolean;
  }> = {};

  if (name !== undefined) updateValues.name = name;
  if (location !== undefined) updateValues.location = location;
  if (quote !== undefined) updateValues.quote = quote;
  if (rating !== undefined) updateValues.rating = rating;
  if (active !== undefined) updateValues.active = active;

  const [updated] = await db
    .update(nbsTestimonials)
    .set(updateValues)
    .where(eq(nbsTestimonials.id, testimonialId))
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
  const testimonialId = parseInt(id, 10);
  if (isNaN(testimonialId)) return new Response("Invalid id", { status: 400 });

  await db.delete(nbsTestimonials).where(eq(nbsTestimonials.id, testimonialId));

  return new Response(null, { status: 204 });
}

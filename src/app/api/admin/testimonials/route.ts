import { auth } from "@/auth";
import { db } from "@/lib/db";
import { nbsTestimonials } from "@/lib/schema";
import { asc, max } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const testimonials = await db
    .select()
    .from(nbsTestimonials)
    .orderBy(asc(nbsTestimonials.displayOrder));

  return Response.json(testimonials);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { name, location, quote, rating } = await request.json();

  if (!name || !quote) {
    return new Response("name and quote are required", { status: 400 });
  }

  const [{ maxOrder }] = await db
    .select({ maxOrder: max(nbsTestimonials.displayOrder) })
    .from(nbsTestimonials);

  const nextOrder = (maxOrder ?? -1) + 1;

  const [inserted] = await db
    .insert(nbsTestimonials)
    .values({
      name,
      location: location ?? "",
      quote,
      rating: rating ?? 5,
      displayOrder: nextOrder,
      active: true,
    })
    .returning();

  return Response.json(inserted, { status: 201 });
}

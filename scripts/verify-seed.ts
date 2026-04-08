import { db } from "../src/lib/db";
import { nbsBlogPosts, nbsTestimonials, nbsGalleryImages } from "../src/lib/schema";

async function verify() {
  const [b, t, g] = await Promise.all([
    db.select().from(nbsBlogPosts),
    db.select().from(nbsTestimonials),
    db.select().from(nbsGalleryImages),
  ]);
  console.log(`Blog posts: ${b.length} | Testimonials: ${t.length} | Gallery: ${g.length}`);
  if (b.length < 1 || t.length < 3 || g.length < 3) {
    console.error("VERIFICATION FAILED: Missing data");
    process.exit(1);
  }
  console.log("VERIFICATION PASSED");
  process.exit(0);
}

verify().catch((err) => {
  console.error(err);
  process.exit(1);
});

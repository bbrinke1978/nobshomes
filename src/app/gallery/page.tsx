import type { Metadata } from "next";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { db } from "@/lib/db";
import { nbsGalleryImages } from "@/lib/schema";
import { asc } from "drizzle-orm";

// Force dynamic rendering — gallery content is managed via DB and must not be statically generated
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Project Gallery | No BS Homes",
  description:
    "See homes we've purchased and transformed across Utah. No BS Homes buys houses in any condition.",
};

export default async function GalleryPage() {
  const images = await db
    .select()
    .from(nbsGalleryImages)
    .orderBy(asc(nbsGalleryImages.displayOrder));

  return (
    <>
      <Header />
      <main>
        {/* ── Hero Header ── */}
        <section className="hero-gradient py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
            <h1
              className="text-4xl sm:text-5xl font-bold text-white mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Our Projects
            </h1>
            <p className="text-brand-100 text-lg max-w-xl mx-auto">
              Homes we&apos;ve helped homeowners move on from.
            </p>
          </div>
        </section>

        {/* ── Gallery Grid ── */}
        <section className="py-16 sm:py-20 bg-cream">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            {images.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-slate-500 text-lg">
                  Gallery coming soon. Check back for photos of our projects.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                  >
                    <Image
                      src={image.blobUrl}
                      alt={image.alt}
                      width={600}
                      height={400}
                      className="w-full h-64 object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      unoptimized={image.blobUrl.includes("blob.core.windows.net")}
                    />
                    <div className="p-4 bg-white">
                      <p
                        className="font-bold text-brand-500"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {image.projectName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

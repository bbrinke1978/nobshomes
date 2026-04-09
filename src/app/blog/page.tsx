import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { db } from "@/lib/db";
import { nbsBlogPosts } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog | No BS Homes",
  description: "Tips and guides for homeowners looking to sell their house fast in Utah.",
};

export default async function BlogPage() {
  const posts = await db
    .select()
    .from(nbsBlogPosts)
    .where(eq(nbsBlogPosts.published, true))
    .orderBy(desc(nbsBlogPosts.createdAt));

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="hero-gradient py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 font-[var(--font-display)]">
              Blog
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Tips, guides, and stories for Utah homeowners.
            </p>
          </div>
        </section>

        {/* Post list */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
          {posts.length === 0 ? (
            <p className="text-center text-slate-500 text-lg">Coming soon — check back for helpful articles.</p>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="block bg-white rounded-2xl p-6 trust-glow hover:shadow-lg transition-shadow"
                >
                  <h2 className="text-xl font-bold text-brand-500 font-[var(--font-display)]">
                    {post.title}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-slate-600 mt-2">{post.excerpt}</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

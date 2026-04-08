import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getAllPosts, getPostBySlug, markdownToHtml } from "@/lib/blog";
import { contactData } from "@/lib/contact-data";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post Not Found | No BS Homes" };
  return {
    title: `${post.title} | No BS Homes`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const htmlContent = markdownToHtml(post.content);

  return (
    <>
      <Header />
      <main>
        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-500 hover:text-brand-600 mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 font-[var(--font-display)]">
            {post.title}
          </h1>

          {/* Date */}
          <p className="mt-3 text-sm text-slate-500">
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          {/* Content */}
          <div
            className="mt-8 prose-custom [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-brand-500 [&>h2]:mt-8 [&>h2]:mb-4 [&>h2]:font-[var(--font-display)] [&>p]:text-slate-600 [&>p]:leading-relaxed [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4 [&>ul>li]:text-slate-600 [&>ul>li]:mb-2 [&>a]:text-brand-500"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* CTA */}
          <div className="mt-12 bg-brand-50 border border-brand-100 rounded-2xl p-6 text-center">
            <p className="text-slate-700 font-semibold text-lg">
              Have questions? We&apos;re happy to help.
            </p>
            <a
              href={contactData.phoneHref}
              className="inline-flex items-center gap-2 mt-4 bg-brand-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-brand-600 transition-colors"
            >
              <Phone className="h-4 w-4" />
              Call us at {contactData.phone}
            </a>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}

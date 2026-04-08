import Link from "next/link";
import { auth } from "@/auth";
import { Image, FileText, MessageSquare } from "lucide-react";

const managementCards = [
  {
    label: "Gallery Management",
    href: "/admin/gallery",
    description: "Manage project photos",
    icon: Image,
  },
  {
    label: "Blog Posts",
    href: "/admin/blog",
    description: "Create and edit blog posts",
    icon: FileText,
  },
  {
    label: "Testimonials",
    href: "/admin/testimonials",
    description: "Manage customer testimonials",
    icon: MessageSquare,
  },
];

export default async function AdminDashboardPage() {
  const session = await auth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">
        Welcome, {session?.user?.name ?? "Admin"}
      </h1>
      <p className="text-slate-500 mb-8">What would you like to manage today?</p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {managementCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-2xl bg-white shadow hover:shadow-md border border-slate-100 p-6 flex flex-col gap-3 transition-all hover:-translate-y-0.5"
            >
              <div className="h-10 w-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-500 group-hover:bg-brand-100 transition-colors">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                  {card.label}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">{card.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

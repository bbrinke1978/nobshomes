import Link from "next/link";
import { auth, signOut } from "@/auth";

const navLinks = [
  { label: "Dashboard", href: "/admin" },
  { label: "Gallery", href: "/admin/gallery" },
  { label: "Blog", href: "/admin/blog" },
  { label: "Testimonials", href: "/admin/testimonials" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <>
      {session ? (
        <div className="min-h-screen bg-slate-50 flex flex-col">
          {/* Admin nav bar */}
          <header className="bg-slate-900 text-white shadow-md">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <div className="flex h-14 items-center justify-between">
                {/* Brand */}
                <div className="flex items-center gap-4">
                  <span className="font-bold text-white tracking-tight">
                    No BS Homes Admin
                  </span>
                  <nav className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                </div>

                {/* User + sign out */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-400 hidden sm:block">
                    {session.user?.email}
                  </span>
                  <form
                    action={async () => {
                      "use server";
                      await signOut({ redirectTo: "/admin/login" });
                    }}
                  >
                    <button
                      type="submit"
                      className="text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-8">
            {children}
          </main>
        </div>
      ) : (
        /* No session — render login page without admin nav (e.g. /admin/login) */
        <>{children}</>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, Menu, X } from "lucide-react";
import { contactData } from "@/lib/contact-data";

const navItems = [
  { label: "Home", href: "/" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "About Us", href: "/about" },
  { label: "FAQ", href: "/faq" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-brand-100/50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-white font-bold text-sm" style={{ fontFamily: "var(--font-display)" }}>NB</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-lg font-bold text-brand-500" style={{ fontFamily: "var(--font-display)" }}>
                No BS Homes
              </p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-sand-500 -mt-1 font-semibold">
                {contactData.slogan}
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-semibold text-slate-600 hover:text-brand-500 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Phone CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={contactData.phoneHref}
              className="inline-flex items-center gap-2 bg-brand-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-600 transition-colors shadow-md hover:shadow-lg"
            >
              <Phone className="h-4 w-4" />
              {contactData.phone}
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-slate-600"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-brand-100/50 bg-white animate-fade-in">
          <div className="px-4 py-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block text-base font-semibold text-slate-700 hover:text-brand-500 py-2"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <a
              href={contactData.phoneHref}
              className="flex items-center justify-center gap-2 bg-brand-500 text-white font-semibold px-5 py-3 rounded-xl mt-4"
            >
              <Phone className="h-4 w-4" />
              Call Us: {contactData.phone}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

import Link from "next/link";
import { Phone, Mail, MapPin, Heart } from "lucide-react";
import { contactData } from "@/lib/contact-data";

export function Footer() {
  return (
    <footer className="bg-brand-900 text-white">
      {/* CTA strip */}
      <div className="bg-brand-500">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 text-center">
          <h3
            className="text-2xl sm:text-3xl font-bold text-white mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Ready to talk? No pressure, no obligation.
          </h3>
          <p className="text-brand-100 mb-6 max-w-xl mx-auto">
            Call us or fill out the form below. We&apos;ll give you a straight answer within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href={contactData.phoneHref} className="btn-primary text-lg inline-flex items-center gap-2">
              <Phone className="h-5 w-5" />
              {contactData.phone}
            </a>
            <Link href="/faq" className="btn-secondary inline-flex items-center gap-2">
              Common Questions
            </Link>
          </div>
        </div>
      </div>

      {/* Footer content */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <img
              src="/images/logo/horizontal-white.png"
              alt="No BS Homes"
              className="h-10 mb-3"
            />
            <p className="text-sm text-brand-200 italic">&ldquo;{contactData.slogan}&rdquo;</p>
            <p className="text-sm text-brand-300 mt-3 leading-relaxed">
              Family-owned. Utah-based. We buy houses in any condition — no repairs, no fees, no hassle. Just honest deals for honest people.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h5 className="text-sm font-bold uppercase tracking-wider text-sand-400 mb-4">Quick Links</h5>
            <ul className="space-y-2">
              {[
                { label: "How It Works", href: "/how-it-works" },
                { label: "About Us", href: "/about" },
                { label: "FAQ", href: "/faq" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-brand-200 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 className="text-sm font-bold uppercase tracking-wider text-sand-400 mb-4">Contact</h5>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-brand-200">
                <Phone className="h-4 w-4 text-sand-400" />
                <a href={contactData.phoneHref} className="hover:text-white transition-colors">
                  {contactData.phone}
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-brand-200">
                <Mail className="h-4 w-4 text-sand-400" />
                <a href={`mailto:${contactData.email}`} className="hover:text-white transition-colors">
                  {contactData.email}
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-brand-200">
                <MapPin className="h-4 w-4 text-sand-400" />
                {contactData.address}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-brand-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-brand-400">
            &copy; {new Date().getFullYear()} No BS Homes. All rights reserved.
          </p>
          <p className="text-xs text-brand-400 flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-sand-400" /> in Utah
          </p>
        </div>
      </div>
    </footer>
  );
}

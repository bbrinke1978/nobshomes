import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContactForm } from "@/components/ContactForm";
import { contactData } from "@/lib/contact-data";
import {
  Phone,
  Shield,
  Clock,
  DollarSign,
  Home,
  Handshake,
  ArrowRight,
  CheckCircle,
  Star,
} from "lucide-react";
import Link from "next/link";

const trustPoints = [
  {
    icon: DollarSign,
    title: "Zero Fees",
    description: "No commissions, no closing costs, no hidden fees. Ever.",
  },
  {
    icon: Clock,
    title: "Close Fast",
    description: "Close in as little as 7 days. You pick the date.",
  },
  {
    icon: Home,
    title: "As-Is Condition",
    description: "No repairs needed. We buy houses in any condition.",
  },
  {
    icon: Shield,
    title: "No Obligation",
    description: "Get a free offer with zero pressure. Walk away anytime.",
  },
];

const situations = [
  "Behind on mortgage payments",
  "Facing foreclosure",
  "Inherited a property",
  "Going through divorce",
  "Tax liens or delinquent taxes",
  "Property needs major repairs",
  "Tired landlord / problem tenants",
  "Relocating and need to sell fast",
];

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          {/* Background image — rural home */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1600&q=80"
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-900/95 via-brand-800/90 to-brand-700/80" />
          </div>
          {/* Decorative shapes */}
          <div className="absolute inset-0 opacity-[0.04]">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-sand-400 -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-sand-400 translate-y-1/2 -translate-x-1/4" />
          </div>

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28 lg:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left — Copy */}
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-white/10 text-sand-200 text-xs font-semibold uppercase tracking-[0.15em] px-4 py-2 rounded-full mb-6 animate-fade-in">
                  <Star className="h-3 w-3 text-sand-300" />
                  Utah&apos;s Trusted Home Buyers
                </div>

                <h1
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6 animate-fade-in-up"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  We Buy Houses.
                  <br />
                  <span className="text-sand-300">The Best Last Option.</span>
                </h1>

                <p className="text-lg sm:text-xl text-brand-100 mb-8 max-w-lg mx-auto lg:mx-0 animate-fade-in-up stagger-2">
                  Behind on payments? Facing foreclosure? Inherited a property you can&apos;t keep?
                  We&apos;ll give you a fair cash offer — no repairs, no fees, no BS.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start animate-fade-in-up stagger-3">
                  <a href={contactData.phoneHref} className="btn-primary text-lg inline-flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Call Us Now
                  </a>
                  <Link href="/how-it-works" className="btn-secondary inline-flex items-center gap-2">
                    How It Works
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* Quick stats */}
                <div className="flex items-center justify-center lg:justify-start gap-8 mt-10 animate-fade-in-up stagger-4">
                  {[
                    { value: "24hr", label: "Response Time" },
                    { value: "7 Day", label: "Fast Close" },
                    { value: "$0", label: "Fees" },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <p className="text-2xl font-bold text-sand-300" style={{ fontFamily: "var(--font-display)" }}>
                        {stat.value}
                      </p>
                      <p className="text-xs text-brand-200 uppercase tracking-wider">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — Contact Form */}
              <div className="animate-fade-in-up stagger-3">
                <ContactForm />
              </div>
            </div>
          </div>
        </section>

        {/* ── Trust Points ── */}
        <section className="py-16 sm:py-20 bg-cream">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2
                className="text-3xl sm:text-4xl font-bold mb-3"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Why Homeowners Trust Us
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                We&apos;re not agents, we&apos;re not flippers looking to lowball you.
                We&apos;re a family company that gives you a fair deal when you need one most.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trustPoints.map((point, i) => {
                const Icon = point.icon;
                return (
                  <div
                    key={point.title}
                    className={`bg-white rounded-2xl p-6 text-center trust-glow hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in-up stagger-${i + 1}`}
                  >
                    <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-7 w-7 text-brand-500" />
                    </div>
                    <h3 className="text-lg font-bold text-brand-500 mb-2" style={{ fontFamily: "var(--font-display)" }}>
                      {point.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{point.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── We Help With ── */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2
                  className="text-3xl sm:text-4xl font-bold mb-4"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Going through a tough situation?
                  <br />
                  <span className="text-sand-500">We&apos;ve been there.</span>
                </h2>
                <p className="text-slate-600 mb-6 text-lg leading-relaxed">
                  Life doesn&apos;t always go as planned. Whether it&apos;s financial hardship,
                  a family change, or a property you just can&apos;t maintain — we understand.
                  No judgment, just solutions.
                </p>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-brand-500 font-semibold hover:text-brand-600 transition-colors"
                >
                  Meet Brian &amp; Shawn
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="space-y-6">
              {/* Rural home image */}
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&q=75"
                  alt="Small rural home in Utah"
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {situations.map((situation) => (
                  <div
                    key={situation}
                    className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 trust-glow"
                  >
                    <CheckCircle className="h-5 w-5 text-sand-500 shrink-0" />
                    <span className="text-sm font-medium text-slate-700">{situation}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── How It Works Preview ── */}
        <section className="py-16 sm:py-20 bg-cream">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
            <h2
              className="text-3xl sm:text-4xl font-bold mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Simple. Fast. Honest.
            </h2>
            <p className="text-slate-600 mb-12 max-w-xl mx-auto">
              Selling your house to us is straightforward. No showings, no open houses, no waiting.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: "1", title: "Call Us", desc: "Tell us about your property. Takes 5 minutes." },
                { step: "2", title: "We Evaluate", desc: "We look at your property and the local market." },
                { step: "3", title: "Fair Cash Offer", desc: "You get a no-obligation offer within 24 hours." },
                { step: "4", title: "You Pick the Date", desc: "Close in 7 days or 60 — your choice." },
              ].map((item, i) => (
                <div key={item.step} className={`animate-fade-in-up stagger-${i + 1}`}>
                  <div className="w-12 h-12 rounded-full bg-brand-500 text-white flex items-center justify-center mx-auto mb-4 text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-brand-500 mb-1" style={{ fontFamily: "var(--font-display)" }}>
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>

            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 mt-10 text-brand-500 font-semibold hover:text-brand-600 transition-colors"
            >
              Learn more about our process
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="hero-gradient rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.05]">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-sand-400 -translate-y-1/2 translate-x-1/3" />
              </div>
              <div className="relative">
                <Handshake className="h-12 w-12 text-sand-300 mx-auto mb-4" />
                <h2
                  className="text-3xl sm:text-4xl font-bold text-white mb-3"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Let&apos;s talk. No pressure.
                </h2>
                <p className="text-brand-100 mb-8 max-w-lg mx-auto text-lg">
                  Whether you&apos;re ready to sell today or just exploring your options,
                  we&apos;re here to help. One honest conversation — that&apos;s all it takes.
                </p>
                <a href={contactData.phoneHref} className="btn-primary text-lg inline-flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  {contactData.phone}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

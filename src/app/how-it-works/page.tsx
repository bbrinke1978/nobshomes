import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContactForm } from "@/components/ContactForm";
import { contactData } from "@/lib/contact-data";
import { Phone, PhoneCall, Search, HandCoins, CalendarCheck, ArrowDown, Shield } from "lucide-react";

const steps = [
  {
    number: "1",
    icon: PhoneCall,
    title: "Call Us or Fill Out the Form",
    description:
      "Tell us about your property — where it is, what condition it's in, and what's going on. This takes about 5 minutes. No paperwork, no commitments.",
    detail: "We'll ask you a few simple questions to understand your situation. There's no wrong answer — we've heard it all, and we don't judge.",
  },
  {
    number: "2",
    icon: Search,
    title: "We Evaluate Your Property",
    description:
      "We'll look at your property, research the local market, and put together the numbers. Sometimes we'll need to see it in person — sometimes a phone call is enough.",
    detail: "We look at comparable sales, the condition of the property, and what it would cost to bring it up to market standards. We're transparent about how we arrive at our number.",
  },
  {
    number: "3",
    icon: HandCoins,
    title: "You Get a Fair Cash Offer",
    description:
      "Within 24 hours, we'll give you a straightforward cash offer. No haggling, no bait-and-switch. If it works for you, great. If not, no hard feelings.",
    detail: "Our offer is based on real market data, not some formula designed to lowball you. We'll walk you through exactly how we got to our number.",
  },
  {
    number: "4",
    icon: CalendarCheck,
    title: "Close On Your Timeline",
    description:
      "Need to close in 7 days? We can do that. Need 60 days to figure things out? That works too. You pick the closing date, and we handle the rest.",
    detail: "We work with local, investor-friendly title companies. We cover all closing costs. You sign, you get paid, you move on with your life.",
  },
];

const promises = [
  "No repairs needed — we buy as-is",
  "No agent commissions or fees",
  "No showings or open houses",
  "No waiting months for a buyer",
  "No pressure — walk away anytime",
  "No judgment about your situation",
];

export default function HowItWorksPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="hero-gradient py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
            <h1
              className="text-4xl sm:text-5xl font-bold text-white mb-4 animate-fade-in-up"
              style={{ fontFamily: "var(--font-display)" }}
            >
              How It <span className="text-sand-300">Works</span>
            </h1>
            <p className="text-lg text-brand-100 max-w-2xl mx-auto animate-fade-in-up stagger-2">
              Four simple steps. No surprises. No hidden catches. Just a straight path from
              &ldquo;I need to sell&rdquo; to &ldquo;I got paid.&rdquo;
            </p>
          </div>
        </section>

        {/* Steps */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="space-y-8">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={step.number}>
                    <div className={`bg-white rounded-2xl p-6 sm:p-8 trust-glow animate-fade-in-up stagger-${i + 1}`}>
                      <div className="flex items-start gap-5">
                        <div className="shrink-0">
                          <div className="w-14 h-14 rounded-2xl bg-brand-500 text-white flex items-center justify-center text-xl font-bold shadow-md" style={{ fontFamily: "var(--font-display)" }}>
                            {step.number}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="h-5 w-5 text-sand-500" />
                            <h3 className="text-xl font-bold text-brand-500" style={{ fontFamily: "var(--font-display)" }}>
                              {step.title}
                            </h3>
                          </div>
                          <p className="text-slate-600 leading-relaxed mb-3">{step.description}</p>
                          <p className="text-sm text-slate-500 leading-relaxed border-l-2 border-sand-300 pl-4">
                            {step.detail}
                          </p>
                        </div>
                      </div>
                    </div>
                    {i < steps.length - 1 && (
                      <div className="flex justify-center py-2">
                        <ArrowDown className="h-5 w-5 text-brand-300" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Our Promises */}
        <section className="py-16 sm:py-20 bg-cream">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-500 text-xs font-semibold uppercase tracking-[0.15em] px-4 py-2 rounded-full mb-4">
                  <Shield className="h-3 w-3" />
                  Our Promises
                </div>
                <h2
                  className="text-3xl sm:text-4xl font-bold mb-4"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  What you can
                  <br />
                  <span className="text-sand-500">count on.</span>
                </h2>
                <p className="text-slate-600 text-lg leading-relaxed">
                  Selling a house is stressful enough. We take the complications out of it
                  so you can focus on what matters — your next chapter.
                </p>
              </div>

              <div className="space-y-3">
                {promises.map((promise) => (
                  <div
                    key={promise}
                    className="flex items-center gap-3 bg-white rounded-xl px-5 py-4 trust-glow"
                  >
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <svg className="h-3.5 w-3.5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-medium text-slate-700">{promise}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-xl px-4 sm:px-6">
            <div className="text-center mb-8">
              <h2
                className="text-3xl font-bold mb-3"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Ready to get started?
              </h2>
              <p className="text-slate-600">
                Fill out the form or call us directly at{" "}
                <a href={contactData.phoneHref} className="text-brand-500 font-semibold hover:underline">
                  {contactData.phone}
                </a>
              </p>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

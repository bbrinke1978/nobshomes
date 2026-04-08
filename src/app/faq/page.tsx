"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { contactData } from "@/lib/contact-data";
import { Phone, ChevronDown, MessageCircle } from "lucide-react";

const faqs = [
  {
    question: "Do I need to make any repairs before selling?",
    answer:
      "Absolutely not. We buy houses in any condition — water damage, fire damage, foundation issues, bad roof, overgrown yard, you name it. That's the whole point. You don't lift a finger.",
  },
  {
    question: "How fast can you close?",
    answer:
      "As fast as 7 days if you need to move quickly. But there's no rush — if you need 30, 60, or even 90 days, we'll work on your timeline. You pick the closing date.",
  },
  {
    question: "Are there any fees or commissions?",
    answer:
      "Zero. No agent commissions, no closing costs, no hidden fees. The price we offer is the price you get. We even cover the title company fees.",
  },
  {
    question: "What about my mortgage? I still owe money on the house.",
    answer:
      "That's completely fine. Most of the houses we buy still have a mortgage. At closing, the title company pays off your remaining mortgage balance, and you keep whatever is left. We'll walk you through the numbers before you commit to anything.",
  },
  {
    question: "What if I'm behind on my property taxes?",
    answer:
      "We work with homeowners in tax delinquency all the time. Back taxes get paid off at closing from the sale proceeds. In many cases, selling to us is the best way to resolve tax issues before they escalate to a tax sale.",
  },
  {
    question: "I inherited a property. Can you help?",
    answer:
      "Yes — inherited properties are one of the most common situations we handle. Whether you've gone through probate or not, we can help you navigate the process and make a fair offer on the property.",
  },
  {
    question: "How do you determine your offer price?",
    answer:
      "We look at comparable sales in the area, the condition of the property, and current market trends. We'll share exactly how we arrived at our number — no black boxes, no mystery formulas. If you disagree, no hard feelings.",
  },
  {
    question: "Is my information kept private?",
    answer:
      "100%. We never share, sell, or publicize your information. Your situation is your business, and we treat it with complete confidentiality.",
  },
  {
    question: "What if I'm facing foreclosure?",
    answer:
      "Time is critical, but it's not too late. We can often close fast enough to stop a foreclosure from going on your record. Call us immediately and we'll tell you honestly whether we can help in your timeframe.",
  },
  {
    question: "Do I have to accept your offer?",
    answer:
      "No. Our offer is completely no-obligation. If it doesn't work for you, just say no — we'll shake hands and wish you the best. No pressure, no follow-up calls, no guilt trips. That's the No BS promise.",
  },
];

function FAQItem({ faq }: { faq: { question: string; answer: string } }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl trust-glow overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left hover:bg-brand-50/30 transition-colors"
      >
        <span className="font-semibold text-slate-800 text-base sm:text-lg pr-4">
          {faq.question}
        </span>
        <ChevronDown
          className={`h-5 w-5 text-brand-400 shrink-0 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 animate-fade-in">
          <p className="text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
            {faq.answer}
          </p>
        </div>
      )}
    </div>
  );
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Header />
      <main>
        {/* Hero */}
        <section className="hero-gradient py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
            <h1
              className="text-4xl sm:text-5xl font-bold text-white mb-4 animate-fade-in-up"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Common <span className="text-sand-300">Questions</span>
            </h1>
            <p className="text-lg text-brand-100 max-w-2xl mx-auto animate-fade-in-up stagger-2">
              We believe in transparency. Here are honest answers to the questions we hear most.
            </p>
          </div>
        </section>

        {/* FAQ List */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="space-y-4">
              {faqs.map((faq) => (
                <FAQItem key={faq.question} faq={faq} />
              ))}
            </div>
          </div>
        </section>

        {/* Still have questions */}
        <section className="py-16 sm:py-20 bg-cream">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
            <MessageCircle className="h-10 w-10 text-sand-500 mx-auto mb-4" />
            <h2
              className="text-3xl font-bold mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Still have questions?
            </h2>
            <p className="text-slate-600 mb-8 text-lg">
              We&apos;d rather talk than type. Give us a call and we&apos;ll answer
              anything — honestly.
            </p>
            <a href={contactData.phoneHref} className="btn-primary text-lg inline-flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Call {contactData.phone}
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

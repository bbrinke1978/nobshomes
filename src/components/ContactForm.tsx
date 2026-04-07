"use client";

import { useState } from "react";
import { Send, CheckCircle, Loader2 } from "lucide-react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      // Step 1: Netlify Forms — primary submission, user-facing
      const netlifyRes = await fetch("/__forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(
          formData as unknown as Record<string, string>
        ).toString(),
      });

      if (!netlifyRes.ok) {
        setError("Something went wrong. Please call us instead.");
        return;
      }

      // Step 2: HouseFinder API — fire and forget (never blocks UX)
      fetch("/api/submit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          phone: formData.get("phone"),
          address: formData.get("address"),
          city: formData.get("city"),
          state: formData.get("state"),
          zip: formData.get("zip"),
          message: formData.get("message") ?? "",
        }),
      }).catch(() => {
        // Silent — Netlify Forms is the safety net
      });

      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please call us instead.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center trust-glow animate-fade-in">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-brand-500 mb-2" style={{ fontFamily: "var(--font-display)" }}>
          We got your message!
        </h3>
        <p className="text-slate-600">
          We&apos;ll get back to you within 24 hours with a no-obligation offer. No BS, we promise.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      name="contact"
      method="POST"
      data-netlify="true"
      className="bg-white rounded-2xl p-6 sm:p-8 trust-glow"
    >
      <input type="hidden" name="form-name" value="contact" />
      <h3
        className="text-xl sm:text-2xl font-bold text-brand-500 mb-1"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Get Your Free Cash Offer
      </h3>
      <p className="text-sm text-slate-500 mb-6">No obligation. No fees. Just a fair offer.</p>

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1">
            Your Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            placeholder="John Smith"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-warm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-300 transition"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            placeholder="(435) 555-1234"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-warm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-300 transition"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-semibold text-slate-700 mb-1">
            Street Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            required
            placeholder="123 Main St"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-warm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-300 transition"
          />
        </div>

        <div className="grid grid-cols-6 gap-3">
          <div className="col-span-3">
            <label htmlFor="city" className="block text-sm font-semibold text-slate-700 mb-1">
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              required
              placeholder="Price"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-warm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-300 transition"
            />
          </div>
          <div className="col-span-1">
            <label htmlFor="state" className="block text-sm font-semibold text-slate-700 mb-1">
              State
            </label>
            <input
              type="text"
              id="state"
              name="state"
              required
              defaultValue="UT"
              maxLength={2}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-warm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-300 transition"
            />
          </div>
          <div className="col-span-2">
            <label htmlFor="zip" className="block text-sm font-semibold text-slate-700 mb-1">
              Zip
            </label>
            <input
              type="text"
              id="zip"
              name="zip"
              required
              placeholder="84501"
              maxLength={10}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-warm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-300 transition"
            />
          </div>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-1">
            Tell us about your situation <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={3}
            placeholder="Anything you'd like us to know..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-warm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-300 transition resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full btn-primary text-base inline-flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Get My Free Offer
            </>
          )}
        </button>

        {error && (
          <p className="text-sm text-center text-red-500 mt-2">{error}</p>
        )}

        <p className="text-xs text-center text-slate-400 mt-2">
          Your information is private. We never share or sell your data.
        </p>
      </div>
    </form>
  );
}

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { contactData } from "@/lib/contact-data";
import { Phone, Heart, Users, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
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
              Two Brothers. <span className="text-sand-300">One Mission.</span>
            </h1>
            <p className="text-lg text-brand-100 max-w-2xl mx-auto animate-fade-in-up stagger-2">
              Helping our Utah neighbors through tough times — with honesty, respect, and fair deals.
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-500 text-xs font-semibold uppercase tracking-[0.15em] px-4 py-2 rounded-full mb-4">
                <Heart className="h-3 w-3" />
                Our Story
              </div>
              <h2
                className="text-3xl sm:text-4xl font-bold mb-6"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Why &ldquo;No BS&rdquo;?
              </h2>
            </div>

            {/* Utah landscape image */}
            <div className="rounded-2xl overflow-hidden shadow-lg mb-10 max-w-2xl mx-auto">
              <img
                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1000&q=75"
                alt="Rural Utah landscape"
                className="w-full h-64 object-cover"
              />
            </div>

            <div className="prose prose-lg mx-auto text-slate-600 leading-relaxed space-y-6">
              <p className="text-xl text-slate-700 font-medium">
                It stands for our names — <strong>B</strong>rian and <strong>S</strong>hawn.
                But it also stands for exactly how we do business.
              </p>

              <p>
                We&apos;re brothers, born and raised right here in Utah. We grew up in a family
                that believed in hard work, straight talk, and taking care of your neighbors.
                That&apos;s not a marketing line — it&apos;s how we were raised.
              </p>

              <p>
                We started No BS Homes because we saw too many people in our community struggling
                with properties they couldn&apos;t keep up with. Maybe they inherited a house they
                can&apos;t afford. Maybe they fell behind on taxes. Maybe life just threw them a
                curveball. Whatever the reason, they deserved better than a lowball offer from
                someone who doesn&apos;t care.
              </p>

              <p>
                When you call us, you&apos;re not talking to a call center or a faceless corporation.
                You&apos;re talking to Brian or Shawn — two brothers who will sit at your kitchen
                table, listen to your situation, and give you an honest answer.
              </p>

              <p className="text-xl text-brand-500 font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                Sometimes we&apos;re the best last option. And we take that responsibility seriously.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 sm:py-20 bg-cream">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2
              className="text-3xl font-bold text-center mb-12"
              style={{ fontFamily: "var(--font-display)" }}
            >
              What We Believe In
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Users,
                  title: "People First",
                  desc: "Every property has a person behind it with a real story. We listen first, then figure out how to help.",
                },
                {
                  icon: Heart,
                  title: "Honest Deals",
                  desc: "We'll tell you what your property is worth and make a fair offer. If we can't help, we'll tell you that too.",
                },
                {
                  icon: MapPin,
                  title: "Utah Roots",
                  desc: "We live here, we work here, our kids go to school here. Your community is our community.",
                },
              ].map((value) => {
                const Icon = value.icon;
                return (
                  <div key={value.title} className="bg-white rounded-2xl p-8 trust-glow text-center">
                    <div className="w-14 h-14 rounded-full bg-sand-100 flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-7 w-7 text-sand-600" />
                    </div>
                    <h3 className="text-xl font-bold text-brand-500 mb-2" style={{ fontFamily: "var(--font-display)" }}>
                      {value.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">{value.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
              Ready to have an honest conversation?
            </h2>
            <p className="text-slate-600 mb-8 text-lg">
              No scripts, no pressure, no games. Just two brothers who want to help.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href={contactData.phoneHref} className="btn-primary text-lg inline-flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Call {contactData.phone}
              </a>
              <Link href="/how-it-works" className="inline-flex items-center gap-2 text-brand-500 font-semibold hover:text-brand-600">
                See How It Works <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

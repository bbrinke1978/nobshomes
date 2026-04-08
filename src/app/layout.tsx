import type { Metadata } from "next";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "No BS Homes | We Buy Houses in Utah — The Best Last Option",
  description:
    "No BS Homes buys distressed properties in rural Utah. No repairs needed, no fees, close on your timeline. Brothers Brian & Shawn — honest deals for honest people.",
  openGraph: {
    title: "No BS Homes | The Best Last Option",
    description: "We buy distressed properties in Utah. No repairs, no fees, close fast.",
  },
};

// TODO: Replace PLACEHOLDER_STREET_ADDRESS and PLACEHOLDER_ZIP with LLC address
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "No BS Homes",
  description:
    "We buy houses for cash in Utah. Fast, fair offers for distressed homeowners. No repairs, no fees, no hassle.",
  url: "https://no-bshomes.com",
  telephone: "+1-435-250-3678",
  email: "contact@no-bshomes.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "PLACEHOLDER_STREET_ADDRESS",
    addressLocality: "Price",
    addressRegion: "UT",
    postalCode: "PLACEHOLDER_ZIP",
    addressCountry: "US",
  },
  areaServed: [
    { "@type": "State", name: "Utah" },
    { "@type": "City", name: "Salt Lake City" },
    { "@type": "City", name: "Provo" },
    { "@type": "City", name: "Ogden" },
    { "@type": "City", name: "Park City" },
    { "@type": "City", name: "Price" },
    { "@type": "City", name: "Logan" },
    { "@type": "City", name: "St. George" },
  ],
  founder: [
    { "@type": "Person", name: "Brian Brinker" },
    { "@type": "Person", name: "Shawn Brinker" },
  ],
  sameAs: [],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          id="local-business-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body>{children}</body>
      {process.env.NEXT_PUBLIC_GA_ID && process.env.NODE_ENV === "production" && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  );
}

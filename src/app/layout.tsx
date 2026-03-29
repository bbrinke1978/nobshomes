import type { Metadata } from "next";
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

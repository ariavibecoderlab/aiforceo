import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Boardroom AI — Your AI C-Suite", template: "%s | Boardroom AI" },
  description:
    "Replace a six-figure executive team with six AI executives — CMO, COO, CFO, CEO, CTO, and Aria — customized for your business in 30 minutes.",
  keywords: [
    "AI executive team",
    "AI CMO",
    "AI COO",
    "AI CFO",
    "AI CEO",
    "small business AI",
    "AI C-suite",
    "business automation",
    "AI chief of staff"
  ],
  authors: [{ name: "Boardroom AI" }],
  creator: "Boardroom AI",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Boardroom AI",
    title: "Boardroom AI — Your AI C-Suite",
    description:
      "Six AI executives customized for your business. CMO, COO, CFO, CEO, CTO, and Aria — in 30 minutes.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Boardroom AI — Your AI C-Suite",
    description: "Six AI executives customized for your business in 30 minutes.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true }
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

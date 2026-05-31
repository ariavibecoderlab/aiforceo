import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "AIforCEO — The C-Suite by AI", template: "%s | AIforCEO" },
  description:
    "Six AI Command Executives — CMO, COO, CFO, CEO, CTO, and Aria Chief of Staff — briefed on your business in under 30 minutes. You're the Founder. They execute.",
  keywords: [
    "AI executive team",
    "AI CMO",
    "AI COO",
    "AI CFO",
    "AI CEO",
    "small business AI",
    "AI C-suite",
    "business automation",
    "AI chief of staff",
    "AIforCEO",
  ],
  authors: [{ name: "AIforCEO" }],
  creator: "AIforCEO",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "AIforCEO",
    title: "AIforCEO — The C-Suite by AI",
    description:
      "Six AI Command Executives. One command centre. Trained on your business in under 30 minutes.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AIforCEO — The C-Suite by AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AIforCEO — The C-Suite by AI",
    description:
      "Six AI Command Executives. One command centre. Trained on your business.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: { google: "" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

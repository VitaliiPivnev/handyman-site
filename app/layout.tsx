import StickyBar from "./components/StickyBar";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Fixora | Handyman Services in Tampa Bay Area",
  description:
  "Professional handyman services in Tampa Bay Area, FL. Door repair, drywall, painting, flooring, TV mounting. Fast response. Call for a free estimate.",
  keywords: [
    "handyman Tampa",
    "handyman Clearwater",
    "handyman St Petersburg",
    "door repair Tampa",
    "drywall repair Tampa",
    "TV mounting Tampa",
    "home repair Tampa Bay",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}<StickyBar /></body>
    </html>
  );
}

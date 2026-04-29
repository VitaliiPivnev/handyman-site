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
      <body className="min-h-full flex flex-col">
  {children}

  {/* Footer */}
  <footer className="bg-neutral-950 px-5 pb-24 pt-6 text-center text-sm text-white/60 md:pb-6">
  <div className="mb-2">
    © 2026 Vitalii Handyman Services. All rights reserved.
  </div>

  <div className="flex justify-center gap-4">
    <a href="/privacy" className="hover:text-white">
      Privacy Policy
    </a>
    <a href="/terms" className="hover:text-white">
      Terms of Use
    </a>
  </div>
</footer>

  <StickyBar />
</body>
    </html>
  );
}

import StickyBar from "./components/StickyBar";
import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Handyman Tampa | Handyman Services in Tampa Bay",
  description:
    "Professional handyman services in Tampa Bay Area. Door repair, drywall repair, painting, flooring, TV mounting, plumbing repairs and more.",
  metadataBase: new URL("https://handymantampa.net"),
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
  const configuredGaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";
  const gaMeasurementId = /^G-[A-Z0-9]+$/.test(configuredGaId) ? configuredGaId : "";
  const analyticsEnabled = Boolean(
    gaMeasurementId &&
    (process.env.VERCEL_ENV === "production" || process.env.ENABLE_PREVIEW_ANALYTICS === "true")
  );

  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {analyticsEnabled && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaMeasurementId}', { allow_google_signals: false });
              `}
            </Script>
          </>
        )}

        {children}

        <footer className="bg-neutral-950 px-5 pb-24 pt-6 text-center text-sm text-white/60 md:pb-6">
          <div className="mb-2">
            © 2026 Handyman Tampa. All rights reserved.
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

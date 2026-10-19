import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Anton, Archivo, Instrument_Serif, Yellowtail } from "next/font/google";
import { RegisterServiceWorker } from "@/components/register-sw";
import { PlayerProvider } from "@/components/player";
import { heroIntroBoot } from "@/lib/hero-intro";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const barlow = Archivo({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--font-barlow",
  display: "swap",
});

const newsreader = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

const yellowtail = Yellowtail({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-yellowtail",
  display: "swap",
});

function siteUrl() {
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#145c32",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  referrer: "strict-origin-when-cross-origin",
  applicationName: "The Bart & Willie Show",
  appleWebApp: {
    capable: true,
    title: "The Bart & Willie Show",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  title: "The Bart & Willie Show",
  description:
    "Two NFL vets. Zero filter. New episodes dropping Mondays & Fridays all season long.",
  openGraph: {
    description: "Two NFL vets. Zero filter. New episodes dropping Mondays & Fridays all season long.",
    images: [{ url: "/brand/banner.jpg", width: 1500, height: 500 }],
  },
};

const themeScript = `
try {
  localStorage.removeItem('baw-theme');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) document.documentElement.classList.add('reduce-motion');
  var path = location.pathname.replace(/\\/$/, '') || '/';
  var home = path === '/';
  if (!reduce && home) {
    if (sessionStorage.getItem('baw-intro') === '1') document.documentElement.classList.add('intro-seen');
    else {
      sessionStorage.setItem('baw-intro', '1');
      document.documentElement.dataset.introFresh = '1';
    }
  }
} catch (e) {}
${heroIntroBoot}
`;

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${anton.variable} ${barlow.variable} ${newsreader.variable} ${yellowtail.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <noscript>
          <style>{`.blur-fade,.in-view{opacity:1!important;filter:none!important;transform:none!important}`}</style>
        </noscript>
        <RegisterServiceWorker />
        <PlayerProvider>{children}</PlayerProvider>
      </body>
    </html>
  );
}

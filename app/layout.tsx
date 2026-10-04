import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Anton, Barlow_Condensed, Newsreader, Yellowtail } from "next/font/google";
import { RegisterServiceWorker } from "@/components/register-sw";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const barlow = Barlow_Condensed({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--font-barlow",
  display: "swap",
});

const newsreader = Newsreader({
  weight: ["400", "500"],
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
    "Bart Scott and Willie Colon, former New York Jets, with new episodes Mondays and Fridays.",
  openGraph: {
    images: [{ url: "/brand/banner.jpg", width: 1500, height: 500 }],
  },
};

const themeScript = `
try {
  if (localStorage.getItem('baw-theme') === 'dark') document.documentElement.classList.add('dark');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('reduce-motion');
} catch (e) {}
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
        {children}
      </body>
    </html>
  );
}

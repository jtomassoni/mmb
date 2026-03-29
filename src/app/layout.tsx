import type { Metadata } from "next";
import { Orbitron, Rajdhani } from "next/font/google";
import "./globals.css";
import { getSiteName, getSiteUrl } from "@/lib/site";
import {
  DEFAULT_DESCRIPTION,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_PATH,
  OG_IMAGE_WIDTH,
  getMetadataBase,
  siteJsonLdGraph,
} from "@/lib/seo";

const display = Orbitron({
  subsets: ["latin"],
  variable: "--font-outrun",
  weight: ["600", "700", "800"],
});

const body = Rajdhani({
  subsets: ["latin"],
  variable: "--font-raj",
  weight: ["500", "600", "700"],
});

const siteName = getSiteName();
const metadataBase = getMetadataBase();
const baseUrl = getSiteUrl();

export const metadata: Metadata = {
  ...(metadataBase ? { metadataBase } : {}),
  title: `${siteName} | Late Night Burgers | Littleton, Englewood, Sheridan`,
  description: DEFAULT_DESCRIPTION,
  applicationName: siteName,
  authors: [{ name: siteName }],
  keywords: [
    "late night food Littleton",
    "late night food Englewood",
    "late night food Sheridan CO",
    "late night burgers Denver",
    "smash burger delivery",
    "food delivery south Denver",
    "Midnight Smashers",
    "woman owned restaurant Denver",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName,
    title: `${siteName} | Late night burgers · Littleton · Englewood · Sheridan`,
    description:
      "Opening April 9, 2026. Late-night smash burgers for delivery in south Denver.",
    images: [
      {
        url: OG_IMAGE_PATH,
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        alt: `${siteName} — late-night smash burgers`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | Late night burgers · Littleton · Englewood · Sheridan`,
    description:
      "Opening April 9, 2026. Late-night smash burgers for delivery in south Denver.",
    images: [OG_IMAGE_PATH],
  },
  category: "restaurant",
  icons: {
    icon: "/pics/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = baseUrl ? siteJsonLdGraph(baseUrl, siteName) : null;

  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <head>
        <link rel="preload" href="/pics/hero.png" as="image" />
        {jsonLd ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        ) : null}
      </head>
      <body
        className="outrun-bg antialiased [font-family:var(--font-raj),system-ui,sans-serif]"
      >
        {children}
      </body>
    </html>
  );
}

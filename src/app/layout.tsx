import type { Metadata } from "next";
import { Orbitron, Rajdhani } from "next/font/google";
import "./globals.css";

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

const siteName =
  process.env.NEXT_PUBLIC_SITE_NAME?.trim() || "MIDNIGHT SMASHERS";

export const metadata: Metadata = {
  title: `${siteName} | Late Night Burgers | Littleton, Englewood, Sheridan`,
  description:
    "Launching April 9, 2026. Minority woman-owned late-night smash burgers for delivery around Littleton, Englewood, Sheridan & south Denver. Order on Uber Eats or DoorDash when we open.",
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
  openGraph: {
    title: `${siteName} | Late night burgers · Littleton · Englewood · Sheridan`,
    description:
      "Opening April 9, 2026. Late-night smash burgers for delivery in south Denver.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <head>
        <link rel="preload" href="/pics/hero.png" as="image" />
      </head>
      <body
        className="outrun-bg antialiased [font-family:var(--font-raj),system-ui,sans-serif]"
      >
        {children}
      </body>
    </html>
  );
}

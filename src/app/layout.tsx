import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/providers";
import { ConditionalHeader } from "../components/conditional-header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Monaghan's Bar & Grill - Where Denver comes to eat, drink, and play",
  description: "Monaghan's Bar & Grill in Denver - featuring pool tables, poker nights, bingo, Broncos games, and delicious food. Come for the atmosphere, stay for the fun!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <Providers>
          <ConditionalHeader />
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
          <footer className="bg-gray-800 text-white py-4 px-6 mt-auto">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <p className="text-sm">&copy; 2024 Monaghan&apos;s Bar & Grill</p>
              <a 
                href="/login" 
                className="text-sm hover:underline hover:text-green-400 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/20 px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                aria-label="Owner / Staff Login"
              >
                Owner / Staff Login
              </a>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}

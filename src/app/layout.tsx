import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./theme.css";
import { Providers } from "../components/providers";
import { ThemeProvider } from "../components/theme-provider";
import { ConditionalHeader } from "../components/conditional-header";
import { getSiteData } from "../lib/site-data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const siteData = await getSiteData()
  
  return {
    title: `${siteData?.name || "Monaghan's Bar & Grill"} - Where Denver comes to eat, drink, and play`,
    description: siteData?.description || "Monaghan's Bar & Grill in Denver - featuring pool tables, poker nights, bingo, Broncos games, and delicious food. Come for the atmosphere, stay for the fun!",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteData = await getSiteData()
  
  return (
    <html lang="en">
      <head>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <Providers>
          <ThemeProvider>
            <ConditionalHeader />
            <main id="main-content" tabIndex={-1}>
              {children}
            </main>
          </ThemeProvider>
          <footer className="bg-gray-800 text-white py-4 px-6 mt-auto">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
                {/* Left side - Copyright */}
                <div className="flex items-center h-6">
                  <p className="text-sm">&copy; 2025 {siteData?.name || "Monaghan's Bar & Grill"}</p>
                </div>
                
                {/* Center - Sub Navigation */}
                <div className="flex items-center h-6">
                  <nav className="flex items-center gap-x-6">
                    <a href="/gallery" className="text-sm text-gray-300 hover:text-white transition-colors">
                      Gallery
                    </a>
                    <a 
                      href="https://www.google.com/search?q=Monaghan's+Bar+and+Grill+Denver+reviews"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      Reviews
                    </a>
                  </nav>
                </div>
                
                {/* Right side - Social & Login */}
                <div className="flex items-center h-6 space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-300">Follow us:</span>
                    <a 
                      href="https://www.facebook.com/people/Monaghans-Bar-and-Grill/100063611261508/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-blue-400 transition-colors flex items-center"
                      aria-label="Follow us on Facebook"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                    <a 
                      href="https://www.google.com/search?q=Monaghan's+Bar+and+Grill+Denver+reviews"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-red-400 transition-colors flex items-center"
                      aria-label="Read our Google reviews"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}

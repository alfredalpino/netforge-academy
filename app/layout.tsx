import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Syne } from "next/font/google";
import { Sidebar, MainContent } from "@/components/Sidebar";
import { AppProviders } from "@/components/AppProviders";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "NetForge — Network Engineering Academy",
  description:
    "Elite 28-week networking curriculum for NOC Analyst and Network Engineer roles. CCNA, Security+, NSE4, AZ-104, AZ-700.",
  applicationName: "NetForge",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NetForge",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
  themeColor: "#070b12",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} h-full antialiased`}
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem("netforge-theme");if(t==="light"){document.documentElement.dataset.theme="light";document.documentElement.style.colorScheme="light";}}catch(e){}})();`}
        </Script>
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to main content
        </a>
        <AppProviders>
          <Sidebar />
          <MainContent>{children}</MainContent>
        </AppProviders>
      </body>
    </html>
  );
}

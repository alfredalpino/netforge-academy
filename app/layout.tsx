import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "NetForge — Network Engineering Academy",
  description:
    "Distraction-free 28-week networking curriculum for NOC Analyst and Network Engineer roles. CCNA, Security+, NSE4, AZ-104, AZ-700.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AppProviders>
          <Sidebar />
          <MainContent>{children}</MainContent>
        </AppProviders>
      </body>
    </html>
  );
}

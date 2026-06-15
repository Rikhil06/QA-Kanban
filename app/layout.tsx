import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import { ReactQueryProvider } from "./providers/ReactQueryProvider";

const APP_URL = "https://app.annoture.com";
const OG_TITLE = "Annoture - Visual QA & Bug Reporting for Teams";
const OG_DESCRIPTION =
  "Click anywhere on a site to report bugs with annotated screenshots. Feedback is auto-organised into a Kanban board so your team can track, prioritise and resolve issues - no spreadsheets needed.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Annoture",
    template: "%s | Annoture",
  },
  description: OG_DESCRIPTION,
  keywords: ["QA", "bug reporting", "kanban", "screenshot annotation", "website feedback"],
  authors: [{ name: "Annoture" }],
  openGraph: {
    type: "website",
    url: APP_URL,
    siteName: "Annoture",
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Annoture - Visual QA & Bug Reporting",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    images: ["/og-image.png"],
  },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#121212]`}>
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  );
}

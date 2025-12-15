import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from '@/components/Sidebar';
import { UserProvider } from "@/context/UserContext";
import "./globals.css";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QA Board",
  description: "A collaborative QA tool that makes website feedback and bug reporting fast and visual. Users can click anywhere on a site, add comments, and capture annotated screenshots directly in the browser. All feedback is automatically organized into a lightweight Kanban board, where teams can track, prioritize, and resolve issues efficiently. With support for user authentication, shared site access, and activity tracking, it’s built for teams that want a streamlined, real-time QA process without messy spreadsheets or endless email chains.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#121212]`}>
        <UserProvider>
        <div className="flex h-screen bg-[#0F0F0F] text-gray-100 overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="relative">
            {children}
            </main>
          </div>
        </div>
        </UserProvider>
      </body>
    </html>
  );
}

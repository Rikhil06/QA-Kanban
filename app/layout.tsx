import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import { ReactQueryProvider } from "./providers/ReactQueryProvider";

export const metadata: Metadata = {
  title: "QA Board",
  description: "A collaborative QA tool that makes website feedback and bug reporting fast and visual. Users can click anywhere on a site, add comments, and capture annotated screenshots directly in the browser. All feedback is automatically organized into a lightweight Kanban board, where teams can track, prioritize, and resolve issues efficiently. With support for user authentication, shared site access, and activity tracking, it’s built for teams that want a streamlined, real-time QA process without messy spreadsheets or endless email chains.",
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
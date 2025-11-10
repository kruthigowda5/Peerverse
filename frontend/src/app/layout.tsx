import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster as ShadToaster, ToastProvider } from "@/components/ui/use-toast";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Peerverse – Peer Learning Platform",
  description: "Learn and share micro-sessions, earn SkillPoints and badges",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}>
        <ToastProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-64px)]">{children}</main>
          <ShadToaster />
          <Toaster position="top-center" />
        </ToastProvider>
      </body>
    </html>
  );
}

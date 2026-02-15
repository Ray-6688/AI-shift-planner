import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter as requested in docs (or similar modern font)
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sober Boba AI Shift Planner",
  description: "AI-powered shift scheduling for Sober Boba",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

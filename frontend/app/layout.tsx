import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { AppProviders } from "@/components/app-providers";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Courier Tracking",
  description: "Courier tracking SaaS — dashboards and public tracking",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} min-h-screen antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

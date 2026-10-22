import type { Metadata } from "next";

import localFont from "next/font/local";

import "./globals.css";

import { Toaster } from "@/components/ui/sonner";

import { UserDataProvider } from "@/context/UserDataProvider";

import { InterviewProvider } from "@/context/InterviewContext";

const sora = localFont({
  src: [
    { path: "./fonts/sora-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/sora-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/sora-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-sora",
  display: "swap",
});

const inter = localFont({
  src: [
    { path: "./fonts/inter-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/inter-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/inter-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

const raleway = localFont({
  src: [
    { path: "./fonts/raleway-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/raleway-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/raleway-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-raleway",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CareerIQ",
  description: "AI-powered career intelligence platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sora.variable} ${inter.variable} ${raleway.variable} antialiased`}
      >
        <UserDataProvider>
          <InterviewProvider>
            <main>{children}</main>
          </InterviewProvider>
        </UserDataProvider>

        <Toaster />
      </body>
    </html>
  );
}
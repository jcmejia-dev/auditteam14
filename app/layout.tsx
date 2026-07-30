import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { getSiteUrl } from "@/lib/site-url";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: "Audit Team 14 | Commission on Audit – BARMM",
  description:
    "Official public website of Commission on Audit – BARMM, Audit Group C – Maguindanao, Audit Team 14.",
  applicationName: "Audit Team 14",
  keywords: [
    "Commission on Audit",
    "COA BARMM",
    "Audit Group C",
    "Maguindanao",
    "Audit Team 14",
  ],
  openGraph: {
    title: "Audit Team 14 | Commission on Audit – BARMM",
    description:
      "Public institutional information for COA–BARMM, Audit Group C – Maguindanao, Audit Team 14.",
    type: "website",
    locale: "en_PH",
    siteName: "Audit Team 14",
  },
  twitter: {
    card: "summary",
    title: "Audit Team 14 | Commission on Audit – BARMM",
    description:
      "Public institutional information for COA–BARMM, Audit Group C – Maguindanao, Audit Team 14.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: {
      url: "/COA.png",
      type: "image/png",
    },
    shortcut: "/COA.png",
    apple: "/COA.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}

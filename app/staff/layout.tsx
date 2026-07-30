import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const metadata: Metadata = {
  title: {
    default: "Staff Portal | Audit Team 14",
    template: "%s | Audit Team 14 Staff Portal",
  },
  description: "Secure staff access for Audit Team 14.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nocache: true,
  },
};

export default function StaffLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

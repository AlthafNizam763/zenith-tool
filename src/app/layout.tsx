import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zenith-Academy | Support & Content Management Dashboard",
  description:
    "Centralized management tool for Zenith Academy homepage videos, student success stories, happening now banners, and structured study materials.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#09090b] text-[#fafafa] antialiased">
        {children}
      </body>
    </html>
  );
}

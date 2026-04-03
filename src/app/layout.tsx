import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bud Badge — Cannabis Dispensary Training & Certification",
  description: "The modern training platform for cannabis dispensaries. Certify your budtenders, track compliance, and build a knowledgeable team.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#15803D",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AXIS — Your word, quantified.",
  description: "Not a reminder app. An AI that refuses to let you off the hook.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
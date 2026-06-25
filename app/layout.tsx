import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

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
      <body className={inter.variable} style={{ fontFamily: "var(--font-inter, system-ui, sans-serif)" }}>
        {children}
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PlaySec | Structured Cybersecurity Playbooks",
  description: "Accelerate your expertise with daily, guided cybersecurity runbooks and structured career pathways.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="font-sans min-h-full bg-bg-canvas text-dark-text flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}

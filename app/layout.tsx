import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

// Match legora.com: Inter for body/UI, an editorial serif for display headings
// (Legora's headline face is Domaine Display, licensed — Playfair Display is the
// closest free equivalent and is one of the faces Legora ships).
const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "The Sparring Room",
  description: "Voice-first Socratic legal training.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

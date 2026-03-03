import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "BiasMatrix - K-Pop Destiny Analysis",
  description: "Discover the Karmic Synergy with your Bias. A premium K-Pop destiny analysis blending Korean Saju and Western Twin Flame storytelling.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} antialiased bg-onyx text-slate-100 font-sans min-h-screen relative overflow-x-hidden selection:bg-primary selection:text-onyx`}
      >
        <div className="fixed inset-0 z-0 pointer-events-none bg-aurora opacity-100"></div>
        <div className="fixed inset-0 z-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay"></div>
        <div className="relative z-10 w-full">
          {children}
        </div>
      </body>
    </html>
  );
}

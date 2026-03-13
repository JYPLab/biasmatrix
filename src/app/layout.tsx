import type { Metadata } from "next";
import { Inter, Playfair_Display, Lora } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://biasmatrix.com'),
  title: {
    default: 'K-Pop Twin Flame Analysis | Bias Soulmate Report | BiasMatrix',
    template: '%s | BiasMatrix',
  },
  description: 'Discover your karmic synergy with your K-pop bias. Powered by Korean Saju astrology — get your personal Twin Flame compatibility score and 15-page deep report. Free to try.',
  openGraph: {
    title: "What's your K-Pop Twin Flame score? ✨",
    description: 'Find your karmic synergy with your bias. Powered by Korean Saju — free to try.',
    url: 'https://biasmatrix.com',
    siteName: 'BiasMatrix',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'BiasMatrix - K-Pop Twin Flame Analysis',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "What's your K-Pop Twin Flame score? ✨",
    description: 'Find your karmic synergy with your bias.',
    images: ['/opengraph-image'],
  },
  alternates: {
    canonical: 'https://biasmatrix.com',
  },
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
        className={`${inter.variable} ${playfair.variable} ${lora.variable} antialiased bg-onyx text-slate-100 font-sans min-h-screen relative overflow-x-hidden selection:bg-primary selection:text-onyx`}
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

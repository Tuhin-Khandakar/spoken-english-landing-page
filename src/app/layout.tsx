import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Markiety English | Premium Spoken English LMS",
  description: "Master spoken English with Tuhin Khandakar. Professional training, live classes, and practical learning.",
  openGraph: {
    title: "Markiety English | Premium Spoken English LMS",
    description: "Master spoken English with Tuhin Khandakar. Professional training, live classes, and practical learning.",
    url: "https://markiety.com",
    siteName: "Markiety English",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Markiety English | Premium Spoken English LMS",
    description: "Master spoken English with Tuhin Khandakar. Professional training, live classes, and practical learning.",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${inter.variable} font-sans antialiased bg-[#050505] text-white`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}


import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "react-hot-toast";
import AuthProvider from "@/components/auth-provider";
import { Chatbot } from '@/components/Chatbot';

export const metadata: Metadata = {
  title: 'MarketChat GH',
  description: 'Your WhatsApp E-commerce solution for Ghana.',
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MarketChat GH",
  },
  icons: {
    icon: "/marketchat_favicon.ico",
    apple: "/marketchat_logo_clean.svg",
  },
  openGraph: {
    title: 'MarketChat GH',
    description: 'Your WhatsApp E-commerce solution for Ghana.',
    url: 'https://marketchatgh.com',
    siteName: 'MarketChat GH',
    images: [
      {
        url: '/logo.jpg',
        width: 1200,
        height: 630,
        alt: 'MarketChat GH Logo',
      },
    ],
    locale: 'en_GH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MarketChat GH',
    description: 'Your WhatsApp E-commerce solution for Ghana.',
    images: ['/logo.jpg'],
  },
};

export const viewport: Viewport = {
  themeColor: "#22c55e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
        <Chatbot />
      </body>
    </html>
  );
}

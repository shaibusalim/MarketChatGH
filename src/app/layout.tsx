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
    icon: "/favicon.ico",
    apple: "/logo.png",
  }
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

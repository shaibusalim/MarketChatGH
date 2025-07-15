import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, ShoppingCart, Smartphone, Store } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center min-h-screen p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-6xl mx-auto">
        
        <header className="text-center py-12 md:py-20">
          <div className="inline-block bg-primary p-4 rounded-full mb-6 shadow-lg">
            <ShoppingCart className="text-primary-foreground h-12 w-12" />
          </div>
          <h1 className="font-headline text-5xl md:text-7xl font-bold text-primary tracking-tighter">
            MarketChat GH
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto text-muted-foreground">
            The simplest way for Ghanaian entrepreneurs to sell online. All through WhatsApp.
          </p>
        </header>

        <section className="py-12 md:py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">How It Works</h2>
            <p className="text-muted-foreground mt-2">A seamless bridge between sellers and buyers.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="bg-secondary p-3 rounded-lg">
                    <Store className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-2xl">For Sellers</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-base">
                <div className="flex items-start gap-4">
                  <Smartphone className="h-6 w-6 text-accent mt-1 shrink-0"/>
                  <p><span className="font-bold">List Products Instantly:</span> Send a WhatsApp message with an image, price, and description to add items to your personal online store.</p>
                </div>
                <div className="flex items-start gap-4">
                  <Bot className="h-6 w-6 text-accent mt-1 shrink-0"/>
                  <p><span className="font-bold">AI Assistant:</span> Our smart bot handles common customer questions about availability and payments, so you can focus on your business.</p>
                </div>
                <div className="flex items-start gap-4">
                   <p className="text-sm bg-muted p-3 rounded-lg w-full font-mono text-muted-foreground">/addproduct [image] ₵100 Men's T-Shirt</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="bg-secondary p-3 rounded-lg">
                    <ShoppingCart className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-2xl">For Buyers</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-base">
                <div className="flex items-start gap-4">
                   <Smartphone className="h-6 w-6 text-accent mt-1 shrink-0"/>
                   <p><span className="font-bold">Discover Local Stores:</span> Browse products from your favorite local sellers on a simple, mobile-friendly webpage.</p>
                </div>
                <div className="flex items-start gap-4">
                  <Bot className="h-6 w-6 text-accent mt-1 shrink-0"/>
                  <p><span className="font-bold">Chat to Buy:</span> See something you like? Tap a button to start a WhatsApp chat with the seller, with your message already pre-filled.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <footer className="text-center py-12 mt-8 border-t">
          <p className="text-muted-foreground">&copy; {new Date().getFullYear()} MarketChat GH. All rights reserved.</p>
          <Link href="/admin" className="text-sm text-primary hover:underline mt-2 inline-block">
            Admin Dashboard
          </Link>
        </footer>

      </div>
    </main>
  );
}

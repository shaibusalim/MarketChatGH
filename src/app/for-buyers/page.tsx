"use client"

import { motion } from "framer-motion"
import { Header } from "@/components/header"
import { Bot, ShoppingBag, MessageCircle, ShieldCheck, Zap, Smartphone, CreditCard, Share2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function ForBuyersPage() {
  return (
    <main className="relative flex flex-col items-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      {/* Hero Section */}
      <section className="w-full pt-32 pb-16 px-4 sm:px-6 md:px-8 bg-gradient-to-b from-green-50 to-white dark:from-green-950/20 dark:to-gray-900 overflow-hidden relative">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-green-500/10 blur-3xl" />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="flex-1 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-sm font-bold mb-6"
            >
              <Zap className="h-4 w-4 fill-current" />
              <span>Smart Shopping in Ghana</span>
            </motion.div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline mb-6 text-gray-900 dark:text-white leading-tight">
              The smartest way to <br />
              <span className="text-green-600">shop in Ghana.</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-xl mb-8">
              Experience the future of commerce. No complex apps, just simple AI-driven shopping directly on WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link href="/sellers">
                <Button className="w-full sm:w-auto px-8 py-6 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl text-lg shadow-lg shadow-green-500/30">
                  <ShoppingBag className="mr-2 h-6 w-6" />
                  Enter the Marketplace
                </Button>
              </Link>
              <Link href="https://wa.me/+233209832978">
                <Button variant="outline" className="w-full sm:w-auto px-8 py-6 rounded-xl text-lg border-2 border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20">
                  <Bot className="mr-2 h-6 w-6" />
                  Ask our AI Bot
                </Button>
              </Link>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 hidden lg:block"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-green-500/20 to-yellow-500/20 blur-2xl rounded-3xl" />
              <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-2 overflow-hidden">
                <Image src="/img7.png" alt="Marketplace Preview" width={600} height={400} className="rounded-2xl object-cover hover:scale-105 transition-transform duration-700" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Benefits Section */}
      <section className="w-full py-20 px-4 sm:px-6 md:px-8 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-gray-900 dark:text-white mb-4">
              Why Shop with MarketChat?
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              We've redesigned online shopping to fit the way you already communicate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -10 }}
              className="p-8 rounded-3xl bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/40 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-green-500 text-white flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20">
                <Smartphone className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">No Apps to Download</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Save your phone storage. Browse our web catalog and chat directly on WhatsApp—no extra apps required.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="p-8 rounded-3xl bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-100 dark:border-yellow-900/40 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-yellow-500 text-white flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-500/20">
                <CreditCard className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Pay via MoMo</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Secure and familiar payments. Use MTN Mobile Money or Telecel Cash to pay verified sellers directly.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="p-8 rounded-3xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-500 text-white flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
                <MessageCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Chat on WhatsApp</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Real-time support. Negotiate, ask questions, and get product photos directly from sellers in your favorite chat app.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="w-full py-20 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-gray-900 dark:text-white mb-6">
              Three Steps to Your Next Purchase
            </h2>
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-lg shadow-green-500/30">1</div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Browse or Ask AI</h3>
                  <p className="text-gray-600 dark:text-gray-400">Explore our directory of verified shops or tell our AI bot exactly what you're looking for.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-lg shadow-green-500/30">2</div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Connect on WhatsApp</h3>
                  <p className="text-gray-600 dark:text-gray-400">Instantly connect with the seller. No middleman—just direct conversation to confirm details.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-lg shadow-green-500/30">3</div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Receive Your Item</h3>
                  <p className="text-gray-600 dark:text-gray-400">Finalize the delivery and payment details in the chat. Safe, fast, and local.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="order-1 md:order-2 bg-green-50 dark:bg-green-950/20 p-8 rounded-3xl border border-green-100 dark:border-green-900/40 relative">
            <div className="absolute -top-6 -right-6 bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded-xl rotate-12 shadow-lg">
              Smart Choice!
            </div>
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="h-10 w-10 text-green-600" />
              <h3 className="text-2xl font-bold">Safe & Verified</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              Every seller on MarketChat is verified. We ensure you're chatting with real businesses so you can shop with confidence.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Verified Business Credentials
              </li>
              <li className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Direct-to-Seller Communication
              </li>
              <li className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Community Trusted Shops
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="w-full py-16 px-4 sm:px-6 md:px-8 mb-16">
        <div className="max-w-5xl mx-auto bg-green-600 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4 relative z-10">Ready to start shopping?</h2>
          <p className="text-green-50 text-lg mb-8 max-w-2xl mx-auto relative z-10">
            Browse our verified shops and discover unique products across Ghana today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Link href="/sellers">
              <Button className="w-full sm:w-auto bg-white text-green-600 hover:bg-green-50 font-bold px-10 py-6 rounded-xl text-xl shadow-xl">
                <ShoppingBag className="mr-2 h-6 w-6" />
                Enter the Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="w-full py-8 border-t border-gray-100 dark:border-gray-800 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} MarketChat. All rights reserved.</p>
      </footer>
    </main>
  )
}

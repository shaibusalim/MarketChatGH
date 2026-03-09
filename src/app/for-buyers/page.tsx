"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Header } from "@/components/header"
import { Bot, ShoppingBag, Store, ArrowRight, MessageCircle, Star, Search, ShieldCheck, Zap } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getProducts, getSellers, Product, Seller } from "@/lib/product-actions"
import ProductCard from "@/components/ProductCard"
import { SellerCard } from "@/components/seller-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function ForBuyersPage() {
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([])
  const [featuredSellers, setFeaturedSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { products } = await getProducts("", "all", "createdAt-desc", 8)
        const sellers = await getSellers(6)
        setTrendingProducts(products)
        setFeaturedSellers(sellers)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

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
              Discover unique products from verified local sellers. Browse visually or let our AI find exactly what you need on WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link href="https://wa.me/+233209832978">
                <Button className="w-full sm:w-auto px-8 py-6 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl text-lg shadow-lg shadow-green-500/30">
                  <Bot className="mr-2 h-6 w-6" />
                  Ask our AI Bot
                </Button>
              </Link>
              <Button variant="outline" className="w-full sm:w-auto px-8 py-6 rounded-xl text-lg border-2" onClick={() => document.getElementById('trending')?.scrollIntoView({ behavior: 'smooth' })}>
                Explore Catalog
              </Button>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 hidden lg:block"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-green-500/20 to-yellow-500/20 blur-2xl rounded-3xl" />
              <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-2">
                <Image src="/img7.png" alt="Marketplace Preview" width={600} height={400} className="rounded-2xl object-cover" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trending Products Grid */}
      <section id="trending" className="w-full py-16 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-gray-900 dark:text-white mb-2">
              Trending Products
            </h2>
            <p className="text-gray-500 dark:text-gray-400">Hand-picked items from top sellers across the country.</p>
          </div>
          <Link href="/sellers" className="hidden sm:flex items-center gap-2 text-green-600 font-bold hover:underline">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-800 rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Featured Sellers */}
      <section className="w-full py-16 px-4 sm:px-6 md:px-8 bg-gray-100 dark:bg-gray-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-gray-900 dark:text-white mb-4">
              Featured Verified Shops
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Trusted local businesses with high ratings and exceptional service.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-200 dark:bg-gray-800 rounded-2xl h-64 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredSellers.map((seller, index) => (
                <SellerCard key={seller.id} seller={seller as any} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="w-full py-20 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-gray-900 dark:text-white mb-6">
              How MarketChat Works
            </h2>
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-lg shadow-green-500/30">1</div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Browse and Discover</h3>
                  <p className="text-gray-600 dark:text-gray-400">Explore the web catalog or chat with our AI bot to find specific items you need.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-lg shadow-green-500/30">2</div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Chat to Buy</h3>
                  <p className="text-gray-600 dark:text-gray-400">Click "Chat to Buy" on any product to immediately open a WhatsApp conversation with the verified seller.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-lg shadow-green-500/30">3</div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Secure Transaction</h3>
                  <p className="text-gray-600 dark:text-gray-400">Negotiate, confirm details, and arrange payment directly with the seller in a trusted environment.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-950/20 p-8 rounded-3xl border border-green-100 dark:border-green-900/40">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="h-10 w-10 text-green-600" />
              <h3 className="text-2xl font-bold">Buyer Protection</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              We verify every seller on our platform to ensure you're dealing with legitimate businesses. Our AI shopping assistant also monitors interactions to maintain a safe and reliable marketplace.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Verified Business Credentials
              </li>
              <li className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Transparent Seller Ratings
              </li>
              <li className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Direct Communication with Sellers
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full py-16 px-4 sm:px-6 md:px-8 mb-16">
        <div className="max-w-5xl mx-auto bg-green-600 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4 relative z-10">Can't find what you're looking for?</h2>
          <p className="text-green-50 text-lg mb-8 max-w-2xl mx-auto relative z-10">
            Our AI shopping assistant can search across thousands of products from local sellers to find exactly what you need in seconds.
          </p>
          <Link href="https://wa.me/+233209832978">
            <Button className="bg-white text-green-600 hover:bg-green-50 font-bold px-10 py-6 rounded-xl text-xl relative z-10">
              <MessageCircle className="mr-2 h-6 w-6" />
              Start Chatting with AI
            </Button>
          </Link>
        </div>
      </section>

      <footer className="w-full py-8 border-t border-gray-100 dark:border-gray-800 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} MarketChat. All rights reserved.</p>
      </footer>
    </main>
  )
}

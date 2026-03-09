"use client"

import { Header } from "@/components/header"
import { motion } from "framer-motion"
import { 
  Store, 
  Zap, 
  MessageCircle, 
  TrendingUp, 
  ShieldCheck, 
  BarChart3, 
  Smartphone, 
  ArrowRight,
  CheckCircle2,
  Globe,
  Users
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export default function ForSellersPage() {
  const features = [
    {
      icon: <Smartphone className="h-6 w-6 text-green-500" />,
      title: "WhatsApp Integrated",
      description: "Manage your entire shop directly from your WhatsApp. No complex dashboards required."
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-blue-500" />,
      title: "Boost Sales",
      description: "Reach thousands of verified buyers actively looking for your products in Ghana."
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-purple-500" />,
      title: "Verified Trust",
      description: "Get a 'Verified Seller' badge that builds instant credibility with new customers."
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-orange-500" />,
      title: "Sales Insights",
      description: "Track which products are trending and understand your customers better."
    }
  ]

  const steps = [
    {
      title: "Create your Account",
      description: "Sign up in minutes with your business name and WhatsApp number."
    },
    {
      title: "Upload your Catalog",
      description: "Easily add your products with photos, prices, and descriptions."
    },
    {
      title: "Start Selling",
      description: "Receive orders and inquiries directly on your WhatsApp and close deals instantly."
    }
  ]

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 md:px-8 bg-gradient-to-b from-green-50/50 to-white dark:from-green-950/10 dark:to-gray-950 overflow-hidden relative">
        <div className="absolute top-0 left-0 -ml-20 -mt-20 w-96 h-96 rounded-full bg-green-500/5 blur-3xl" />
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-sm font-bold mb-6"
            >
              <Zap className="h-4 w-4 fill-current" />
              <span>Scale your business in Ghana</span>
            </motion.div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline mb-6 text-gray-900 dark:text-white leading-tight">
              Transform your <br />
              <span className="text-green-600">WhatsApp into a Shop.</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl lg:mx-0 mx-auto mb-10 leading-relaxed">
              Join Ghana's fastest-growing marketplace. List your products, get verified, and connect directly with thousands of buyers on WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/seller/signup">
                <Button className="w-full sm:w-auto px-10 py-7 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl text-xl shadow-lg shadow-green-500/30">
                  Start Selling Now
                </Button>
              </Link>
              <Button variant="outline" className="w-full sm:w-auto px-10 py-7 rounded-2xl text-xl border-2 hover:bg-gray-50 dark:hover:bg-gray-900">
                Contact Sales
              </Button>
            </div>
            
            <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 opacity-60">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span className="font-semibold text-sm">5,000+ Buyers</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                <span className="font-semibold text-sm">Nationwide Reach</span>
              </div>
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 relative"
          >
            <div className="relative z-10 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-4 transform hover:-translate-y-2 transition-transform duration-500">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
                <div className="bg-[#075e54] p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Store className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">Your Business Shop</h3>
                    <p className="text-white/70 text-[10px]">Verified Marketplace Seller</p>
                  </div>
                </div>
                <div className="p-4 space-y-4 h-[400px] overflow-hidden bg-gray-50/50 dark:bg-gray-900/50">
                   {/* Example Product 1 */}
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.5 }}
                     className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4"
                   >
                      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                        <Image src="/img1.jpg" alt="Product" width={80} height={80} className="object-cover h-full w-full" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">Premium Cotton T-Shirt</h4>
                        <p className="text-green-600 dark:text-green-400 font-bold text-xs">GHS 120.00</p>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          <span>In Stock</span>
                        </div>
                        <Button className="h-7 w-full text-[10px] bg-[#25d366] hover:bg-[#128c7e] text-white rounded-lg mt-1">
                          <MessageCircle className="h-3 w-3 mr-1" /> Chat to Buy
                        </Button>
                      </div>
                   </motion.div>

                   {/* Example Product 2 */}
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.7 }}
                     className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4 opacity-70"
                   >
                      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                        <Image src="/img2.jpg" alt="Product" width={80} height={80} className="object-cover h-full w-full" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">Casual Summer Dress</h4>
                        <p className="text-green-600 dark:text-green-400 font-bold text-xs">GHS 250.00</p>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          <span>In Stock</span>
                        </div>
                      </div>
                   </motion.div>

                   {/* Example Product 3 */}
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.9 }}
                     className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4 opacity-40"
                   >
                      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                        <Image src="/img3.jpg" alt="Product" width={80} height={80} className="object-cover h-full w-full" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">Leather Handbag</h4>
                        <p className="text-green-600 dark:text-green-400 font-bold text-xs">GHS 450.00</p>
                      </div>
                   </motion.div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-10 -left-10 z-0 bg-yellow-400/20 w-40 h-40 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold font-headline mb-6 text-gray-900 dark:text-white">
            Everything you need to <span className="text-green-600">sell more.</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            Powerful tools designed specifically for the way businesses work in Ghana.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-green-500/20 transition-all group"
            >
              <div className="mb-6 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 inline-block group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 px-4 sm:px-6 md:px-8 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="flex-1">
              <h2 className="text-3xl md:text-5xl font-bold font-headline mb-10 text-gray-900 dark:text-white">
                Three simple steps <br />
                to <span className="text-green-600">start selling.</span>
              </h2>
              <div className="space-y-10">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex gap-6">
                    <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-lg shadow-green-500/30">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{step.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/seller/signup" className="inline-block mt-12">
                <Button className="px-8 py-6 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl text-lg flex items-center gap-2">
                  Create your Shop <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="flex-1 relative">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-700">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-700 pb-6">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                    <h4 className="text-xl font-bold">Seller Verification</h4>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 italic">
                    "Since joining MarketChat, our orders have increased by 40%. The best part is that everything happens right on WhatsApp where our customers are."
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full" />
                    <div>
                      <p className="font-bold">Esi Mensah</p>
                      <p className="text-sm text-gray-500">Founder, Esi's Fashion Hub</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 md:px-8">
        <div className="max-w-5xl mx-auto bg-green-600 rounded-[3rem] p-10 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
          <h2 className="text-4xl md:text-6xl font-bold mb-8 relative z-10 leading-tight">
            Ready to grow your <br /> business today?
          </h2>
          <p className="text-green-50 text-xl mb-12 max-w-2xl mx-auto relative z-10 opacity-90">
            Join thousands of successful sellers on Ghana's #1 WhatsApp-integrated marketplace.
          </p>
          <Link href="/seller/signup" className="relative z-10 inline-block">
            <Button className="bg-white text-green-600 hover:bg-green-50 font-bold px-12 py-8 rounded-2xl text-2xl shadow-xl">
              Launch your Shop Now
            </Button>
          </Link>
        </div>
      </section>

      <footer className="w-full py-12 border-t border-gray-100 dark:border-gray-800 text-center text-gray-500 text-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="bg-gradient-to-br from-red-500 via-yellow-400 to-green-500 p-1.5 rounded-lg">
              <Image src="/logo.png" alt="Logo" width={24} height={24} />
            </div>
            <span className="font-headline text-xl font-bold text-gray-900 dark:text-white">MarketChat</span>
          </div>
          <p>© {new Date().getFullYear()} MarketChat GH. Built for the future of commerce in Ghana.</p>
        </div>
      </footer>
    </main>
  )
}

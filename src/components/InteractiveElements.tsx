"use client"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { motion, useAnimation, useInView } from "framer-motion"
import { Bot, ShoppingCart, Smartphone, Store, ArrowRight, MessageCircle, Star, Info, Mail, User, Play } from "lucide-react"
import Link from "next/link"
import { ErrorBoundary } from "./error-boundary"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { BlogSection } from "./blog-section" // Import the new BlogSection
import { PersonalizedProducts } from "./PersonalizedProducts"

const AnimatedGradientText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.span
    initial={{ backgroundPosition: "0% 50%" }}
    animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
    transition={{
      duration: 4,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "loop",
      ease: "linear",
    }}
    whileHover={{ scale: 1.05, backgroundPosition: "50% 50%" }}
    className="bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 bg-clip-text text-transparent bg-[length:300%_auto]"
  >
    {children}
  </motion.span>
)

const FeatureCard = ({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode
  title: string
  description: string
  delay?: number
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  const controls = useAnimation()
  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.6, delay: delay || 0, ease: "easeOut" },
        },
      }}
      whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
    >
      <Card className="h-full shadow-lg hover:shadow-red-500/20 dark:hover:shadow-green-500/20 transition-all duration-500 border border-gray-100 dark:border-gray-800 bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-800/80 dark:to-gray-900/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center gap-3 pb-3">
          <div className="bg-gradient-to-br from-red-500 to-green-500 p-2 rounded-lg shadow-md">{icon}</div>
          <CardTitle className="font-headline text-lg sm:text-xl bg-gradient-to-r from-gray-900 to-red-600 dark:from-white dark:to-green-400 bg-clip-text text-transparent">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const TestimonialCard = ({ quote, author, role, avatarUrl }: { quote: string; author: string; role: string; avatarUrl?: string }) => {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  const controls = useAnimation()
  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, x: -30 },
        visible: {
          opacity: 1,
          x: 0,
          transition: { duration: 0.6, ease: "easeOut" },
        },
      }}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-5 shadow-lg hover:shadow-yellow-500/20 transition-all duration-500"
    >
      <Star className="h-5 w-5 text-yellow-400 mb-3" />
      <p className="text-muted-foreground text-sm mb-3">"{quote}"</p>
      <div className="flex items-center gap-3">
        {avatarUrl ? (
          <img src={avatarUrl} alt={author} className="w-10 h-10 rounded-full object-cover border-2 border-green-100 dark:border-green-900" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-sm">
            {author.charAt(0)}
          </div>
        )}
        <div>
          <p className="font-semibold text-sm text-gray-900 dark:text-white">{author}</p>
          <p className="text-xs text-gray-500">{role}</p>
        </div>
      </div>
    </motion.div>
  )
}

const ChatSimulation = () => {
  const [messages, setMessages] = useState<{ text: string; sender: "user" | "bot"; product?: any }[]>([])
  const [typing, setTyping] = useState(false)

  const script = [
    { text: "Hi, I'm looking for a new smartphone under 2000 GHS.", sender: "user" as const },
    { text: "Searching through local verified sellers...", sender: "bot" as const },
    { 
      text: "I found 3 great options from highly rated sellers in Accra! Here's the best match:", 
      sender: "bot" as const,
      product: { name: "Infinix Note 30", price: "1850 GHS", seller: "Premium Tech Hub" }
    },
    { text: "That looks perfect! Can I talk to the seller?", sender: "user" as const },
    { text: "Connecting you directly to Premium Tech Hub on WhatsApp...", sender: "bot" as const },
  ]

  useEffect(() => {
    let timeout: NodeJS.Timeout
    let currentIdx = 0

    const runScript = () => {
      if (currentIdx >= script.length) {
        timeout = setTimeout(() => {
          setMessages([])
          currentIdx = 0
          runScript()
        }, 5000)
        return
      }

      const msg = script[currentIdx]
      if (msg.sender === "bot") {
        setTyping(true)
        timeout = setTimeout(() => {
          setTyping(false)
          setMessages(prev => [...prev, msg])
          currentIdx++
          timeout = setTimeout(runScript, 2000)
        }, 1500)
      } else {
        timeout = setTimeout(() => {
          setMessages(prev => [...prev, msg])
          currentIdx++
          timeout = setTimeout(runScript, 1000)
        }, 1500)
      }
    }

    runScript()
    return () => clearTimeout(timeout)
  }, [])

  return (
    <div className="flex-1 bg-[#e5ddd5] dark:bg-gray-950/50 p-3 flex flex-col gap-3 overflow-y-auto custom-scrollbar">
      {messages.map((msg, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className={cn(
            "p-2 rounded-lg text-sm shadow-sm max-w-[85%] relative",
            msg.sender === "user" 
              ? "self-end bg-[#dcf8c6] dark:bg-green-900/40 rounded-tr-none text-gray-800 dark:text-gray-100" 
              : "self-start bg-white dark:bg-gray-800 rounded-tl-none text-gray-800 dark:text-gray-100"
          )}
        >
          {msg.product && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded p-2 mb-2 text-xs flex gap-3 border-l-4 border-green-500 shadow-inner">
              <div className="bg-white dark:bg-gray-800 p-1 rounded">
                <Smartphone className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <p className="font-bold text-green-600 dark:text-green-400">{msg.product.seller}</p>
                <p className="font-medium">{msg.product.name} - {msg.product.price}</p>
              </div>
            </div>
          )}
          {msg.text}
          <span className="text-[10px] text-gray-400 block mt-1 text-right">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </motion.div>
      ))}
      {typing && (
        <div className="self-start bg-white dark:bg-gray-800 p-3 rounded-lg rounded-tl-none shadow-sm">
          <div className="flex gap-1">
            <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
            <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
            <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
          </div>
        </div>
      )}
    </div>
  )
}

export function InteractiveElements() {
  const controls = useAnimation()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])
  return (
    <>
      <section className="relative w-full min-h-[60vh] sm:min-h-[80vh] xl:h-[800px] flex flex-col md:flex-row items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden pt-24 bg-gradient-to-b from-green-50/50 to-white dark:from-green-950/20 dark:to-gray-900">

        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-green-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[30rem] h-[30rem] rounded-full bg-yellow-500/10 blur-3xl z-0" />

        <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center z-10 gap-8 md:gap-12">
          {/* Left Text Column */}
          <div className="flex-1 text-center md:text-left z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="inline-block bg-gradient-to-br from-green-400 to-green-600 p-3 sm:p-4 rounded-2xl mb-6 shadow-lg shadow-green-500/30"
            >
              <ShoppingCart className="text-white h-8 w-8 sm:h-12 sm:w-12" />
            </motion.div>
            <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 text-gray-900 dark:text-white leading-tight">
              <AnimatedGradientText>MarketChat</AnimatedGradientText><br />
              <span className="text-gray-800 dark:text-gray-100">AI Commerce</span>
            </h1>
            <p className="mt-2 text-lg sm:text-xl max-w-lg mx-auto md:mx-0 text-gray-600 dark:text-gray-300">
              Transforming how Ghana buys and sells. AI-driven shopping experiences directly on WhatsApp.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link href="/for-buyers">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-8 py-4 bg-green-500 text-white rounded-xl font-semibold shadow-lg shadow-green-500/30 hover:bg-green-600 transition-all duration-300"
                >
                  How it Works
                </motion.button>
              </Link>
              <Link href="/sellers">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 border-2 border-green-500 rounded-xl font-semibold shadow-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-300"
                >
                  Browse Shops
                </motion.button>
              </Link>
            </div>

            {/* Trusted By Logos banner placeholder below CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800"
            >
              <p className="text-sm text-gray-500 font-medium mb-4 text-center md:text-left">Trusted by local businesses across Ghana</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-6 items-center opacity-60 grayscale">
                <div className="h-6 flex items-center gap-2 font-bold text-gray-600"><Store className="h-5 w-5" /> BizStore GH</div>
                <div className="h-6 flex items-center gap-2 font-bold text-gray-600"><Bot className="h-5 w-5" /> AI Retail</div>
                <div className="h-6 flex items-center gap-2 font-bold text-gray-600"><ShoppingCart className="h-5 w-5" /> QuickMart</div>
              </div>
            </motion.div>
          </div>

          {/* Right Visual Column (Smartphone Mockup) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex-1 flex justify-center mt-12 md:mt-0 relative z-10 w-full"
          >
            {/* The wrapper scales down the phone on mobile to fit nicely without overwhelming the screen */}
            <div className="relative w-[300px] h-[550px] sm:h-[600px] md:scale-100 scale-[0.85] origin-top bg-gray-900 rounded-[3rem] border-[8px] border-gray-800 shadow-2xl overflow-hidden flex flex-col pt-8">
              {/* Phone Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-xl z-20" />
              {/* WhatsApp Mock UI */}
              <div className="bg-[#075e54] text-white p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">MarketChat AI</h3>
                  <p className="text-[10px] text-white/80">Online</p>
                </div>
              </div>
              
              <ChatSimulation />

              {/* Chat Input */}
              <div className="bg-[#f0f0f0] dark:bg-gray-800 p-2 flex gap-2 items-center text-gray-500">
                <div className="flex-1 bg-white dark:bg-gray-900 rounded-full px-4 py-2 text-sm shadow-sm">Yes please show me</div>
                <div className="w-10 h-10 bg-[#128c7e] rounded-full flex items-center justify-center shadow-sm">
                  <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why MarketChat Section - Bento Grid */}
      <section
        id="features"
        className="relative w-full py-20 sm:py-24 px-4 max-w-7xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-headline mb-4 text-gray-900 dark:text-white">
            Designed for <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">Speed & Trust</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            A state-of-the-art AI infrastructure connecting buyers to verified local sellers instantly.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-auto md:auto-rows-[300px]">
          {/* Large Card 1 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-white/5 dark:bg-gray-800/40 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 p-8 flex flex-col justify-end transition-colors hover:bg-white/10 dark:hover:bg-gray-800/60 shadow-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Abstract visual for AI matching */}
            <div className="absolute top-8 right-8 w-48 h-48 sm:w-64 sm:h-64 opacity-50 flex items-center justify-center">
               <div className="absolute w-full h-full border border-green-500/30 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
               <div className="absolute w-3/4 h-3/4 border border-green-500/40 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite_500ms]"></div>
               <Bot className="absolute h-16 w-16 text-green-500/80 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
            </div>

            <div className="relative z-10 w-full sm:w-2/3 md:mt-24">
              <div className="inline-flex items-center rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-sm font-medium text-green-600 dark:text-green-400 mb-4">
                Smart Engine
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Hyper-Local AI Matching</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
                Our proprietary AI understands Ghanaian context and nuance, instantly finding exact matches from verified sellers in your city.
              </p>
            </div>
          </motion.div>

          {/* Square Card 2 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group relative overflow-hidden rounded-3xl bg-white/5 dark:bg-gray-800/40 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 p-8 flex flex-col items-center justify-center transition-all hover:border-green-500/30 shadow-sm min-h-[300px]"
          >
            <div className="relative w-24 h-24 mb-6">
               <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#25D366] to-[#128C7E] shadow-[0_0_40px_rgba(37,211,102,0.4)] group-hover:shadow-[0_0_60px_rgba(37,211,102,0.6)] transition-shadow duration-500 flex items-center justify-center">
                 <Smartphone className="h-12 w-12 text-white" />
               </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">Native WhatsApp</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm text-center">
              No apps to download. Everything happens where you already chat.
            </p>
          </motion.div>

          {/* Square Card 3 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group relative overflow-hidden rounded-3xl bg-white/5 dark:bg-gray-800/40 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 p-8 flex flex-col justify-end transition-colors hover:bg-white/10 dark:hover:bg-gray-800/60 shadow-sm min-h-[300px]"
          >
            <div className="flex-1 flex items-start justify-start">
              <span className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-gray-900 to-gray-400 dark:from-white dark:to-gray-600 drop-shadow-sm">
                100%
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Verified Sellers</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Every merchant is manually vetted to ensure quality and trust.</p>
            </div>
          </motion.div>

          {/* Large Card 4 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-white/5 dark:bg-gray-800/40 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 p-8 flex flex-col sm:flex-row items-center gap-8 transition-colors hover:bg-white/10 dark:hover:bg-gray-800/60 shadow-sm min-h-[300px]"
          >
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-sm font-medium text-yellow-600 dark:text-yellow-500 mb-4">
                <Store className="h-4 w-4" /> Direct Commerce
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Zero Middlemen</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
                Connect and negotiate directly with sellers. We don't hold your money or slow down your transaction.
              </p>
            </div>
            <div className="relative w-full sm:w-1/2 h-full flex items-center justify-center min-h-[150px]">
               <div className="flex gap-4 items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                 <div className="h-16 w-16 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 flex items-center justify-center shadow-lg"><User className="h-8 w-8 text-gray-500" /></div>
                 <div className="h-1 w-16 sm:w-24 bg-gradient-to-r from-gray-200 to-green-500 dark:from-gray-700 dark:to-green-500 relative rounded-full">
                    <motion.div animate={{ x: [0, 48, 80] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute -top-1 left-0 w-3 h-3 rounded-full bg-green-500 shadow-[0_0_12px_#22c55e]" />
                 </div>
                 <div className="h-16 w-16 rounded-full bg-white dark:bg-gray-800 border-2 border-green-200 dark:border-green-500/30 flex items-center justify-center shadow-lg"><Store className="h-8 w-8 text-green-500" /></div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={ref} className="relative w-full py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-headline mb-3 text-gray-900 dark:text-white">
            How It Works
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            A seamless bridge between sellers and buyers, powered by AI.
          </p>
        </motion.div>

        {/* Sticky Scroll Redesign */}
        <div className="flex flex-col lg:flex-row gap-12 items-start relative">

          {/* Left Side: Steps */}
          <div className="flex-1 space-y-12 lg:py-24">
            <div className="relative">
              <div className="absolute left-6 top-10 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800 -z-10" />

              {/* Step 1 */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ margin: "-100px" }}
                className="flex gap-6 relative"
              >
                <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-lg shadow-green-500/30">1</div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Connect your Business</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Sellers link their WhatsApp numbers and upload their product catalogs directly through our seamless onboarding.</p>

                  {/* Mobile Only: Inline Visual to prevent text wall */}
                  <div className="md:hidden mt-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm w-full mx-auto max-w-[280px]">
                    <div className="flex items-center gap-3 bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                      <div className="bg-green-100 dark:bg-green-900/40 p-2 rounded-full"><Store className="h-5 w-5 text-green-600" /></div>
                      <div>
                        <p className="font-bold text-sm text-gray-900 dark:text-white">Business Account</p>
                        <p className="text-xs text-gray-500">Connected</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ margin: "-100px" }}
                className="flex gap-6 mt-16 relative"
              >
                <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-lg shadow-green-500/30">2</div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Buyers Chat with AI</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Customers chat with our intelligent MarketChat bot on WhatsApp to find exactly what they are looking for.</p>

                  {/* Mobile Only: Inline Visual */}
                  <div className="md:hidden mt-4 bg-[#e5ddd5] rounded-2xl p-4 shadow-inner w-full mx-auto max-w-[280px]">
                    <div className="self-end bg-[#dcf8c6] p-2 rounded-lg rounded-tr-none text-xs shadow-sm w-[85%] ml-auto text-gray-800 mb-3">
                      I need a new smartphone under 2000 GHS
                    </div>
                    <div className="self-start bg-white p-2 rounded-lg rounded-tl-none text-xs shadow-sm w-[85%] text-gray-800 flex gap-2">
                      <Bot className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      <p>Found 3 great options from verified sellers!</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ margin: "-100px" }}
                className="flex gap-6 mt-16 relative"
              >
                <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-lg shadow-green-500/30">3</div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Seamless Direct Connection</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Once a buyer selects a product, they are directly connected to the seller's verified WhatsApp for secure negotiation and payment.</p>

                  {/* Mobile Only: Inline Visual */}
                  <div className="md:hidden mt-4 flex items-center justify-center gap-2 w-full mx-auto max-w-[280px]">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-700">
                      <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-green-500 stroke-[3px]" />
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/40">
                      <MessageCircle className="h-5 w-5 text-white" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-green-500 stroke-[3px]" />
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center border border-blue-200 dark:border-blue-800">
                      <Store className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Side: Sticky Visual (Simplified Mockup) */}
          <div className="flex-1 lg:sticky lg:top-32 hidden md:flex justify-center h-[600px] w-full">
            <div className="relative w-full max-w-md h-full bg-gray-50 dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden p-8 flex flex-col justify-center items-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-full"
              >
                <FeatureCard
                  icon={<Bot className="h-6 w-6 text-white" />}
                  title="Intelligent Matching"
                  description="Our engine connects buyers to the best local sellers instantly via WhatsApp."
                />

                <div className="mt-6 flex justify-center">
                  <ArrowRight className="h-8 w-8 text-green-500 rotate-90" />
                </div>

                <div className="mt-6">
                  <FeatureCard
                    icon={<Store className="h-6 w-6 text-white" />}
                    title="Direct to Seller"
                    description="No middlemen. Cut the friction and close deals quickly on your terms."
                  />
                </div>
              </motion.div>
            </div>
          </div>

        </div>
      </section>

      <PersonalizedProducts />

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="relative w-full py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto bg-gradient-to-b from-gray-100/50 to-transparent dark:from-gray-800/50"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-headline mb-3 text-gray-900 dark:text-white">
            What Our Users Say
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            Hear from our community of buyers and sellers in Ghana.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <TestimonialCard
            quote="MarketChat has transformed how I sell my products. It's so easy to manage everything through WhatsApp!"
            author="Mohammed Alhassan"
            role="Local Artisan"
            avatarUrl="https://i.pravatar.cc/150?u=a042581f4e29026704d"
          />
          <TestimonialCard
            quote="Shopping on MarketChat is a breeze. I found exactly what I needed in minutes."
            author="Ahmed Salam"
            role="Customer"
            avatarUrl="https://i.pravatar.cc/150?u=a042581f4e29026704b"
          />
          <TestimonialCard
            quote="The AI recommendations helped me discover new local businesses. Highly recommend!"
            author="Fatima Mensah"
            role="Entrepreneur"
            avatarUrl="https://i.pravatar.cc/150?u=a04258a2462d826712d"
          />
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative w-full py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-8 bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 text-white text-center overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('/placeholder.svg?height=200&width=200')] bg-repeat" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter mb-4"
          >
            Ready to Transform Your Business?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl mb-8"
          >
            Join MarketChat today and experience the future of commerce in Ghana.
          </motion.p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/for-buyers">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 8px 16px rgba(0,0,0,0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-green-600 rounded-xl font-semibold shadow-lg hover:bg-gray-100 transition-all duration-300"
              >
                Learn How it Works
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 8px 16px rgba(0,0,0,0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold shadow-lg hover:bg-white/20 transition-all duration-300"
            >
              Contact Sales
            </motion.button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative w-full py-16 sm:py-20 px-4 sm:px-6 md:px-8 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-headline mb-3 text-gray-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 dark:text-gray-400">Everything you need to know about MarketChat.</p>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                q: "How does WhatsApp shopping work?",
                a: "You simply start a chat with our AI bot, tell it what you need, and it finds the exact products from local sellers. You are then connected directly to the seller's WhatsApp to complete the purchase.",
              },
              {
                q: "Is it secure to buy through MarketChat?",
                a: "Yes. We thoroughly verify our sellers. Additionally, because the final transaction happens directly with the seller via WhatsApp, you have a direct line of communication, ensuring transparency.",
              },
              {
                q: "How much does it cost to sell on MarketChat?",
                a: "Creating a catalogue and getting listed on MarketChat is completely free for basic use! We offer premium tools for verified sellers to boost their visibility.",
              },
            ].map((faq, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{faq.q}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Blog Section */}


      <BlogSection />

      <div className="flex justify-center mt-4">
        <Link href="/blog" className="inline-flex items-center text-primary hover:underline text-sm font-medium">
          View All Posts <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>

    </>
  )
}

export function FloatingWhatsAppButton() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.5, duration: 0.6 }}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-16 sm:bottom-8 right-4 sm:right-8 z-50 animate-pulse"
    >
      <Link
        href="https://wa.me/+233209832978"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 text-white p-3 sm:p-4 rounded-full shadow-xl hover:bg-green-600 transition-colors flex items-center justify-center"
      >
        <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
      </Link>
    </motion.div>
  )
}

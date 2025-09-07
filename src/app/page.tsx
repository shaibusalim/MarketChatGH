"use client"

import { useState, Suspense, useEffect, useRef } from "react"
import { InteractiveElements, FloatingWhatsAppButton } from "@/components/InteractiveElements"
import { AdminLogin } from "@/components/AdminLogin"
import { Header } from "@/components/header"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BlogPostCard } from "@/components/blog-post-card";
import BlogPosts from "@/components/BlogPosts";

function HomeComponent() {
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const longPressTimerRef = useRef<number | null>(null)
  const tapCountRef = useRef(0)
  const tapResetTimerRef = useRef<number | null>(null)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault()
        setShowAdminLogin(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const handleTouchStart = () => {
    if (longPressTimerRef.current) window.clearTimeout(longPressTimerRef.current)
    longPressTimerRef.current = window.setTimeout(() => {
      setShowAdminLogin(true)
    }, 1200)
  }

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  const handleTap = () => {
    tapCountRef.current += 1
    if (tapResetTimerRef.current) window.clearTimeout(tapResetTimerRef.current)
    tapResetTimerRef.current = window.setTimeout(() => {
      tapCountRef.current = 0
    }, 3000)
    if (tapCountRef.current >= 5) {
      tapCountRef.current = 0
      setShowAdminLogin(true)
    }
  }

  return (
    <main className="relative flex flex-col items-center min-h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Header />
      {/* Content */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto">
        <InteractiveElements />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <BlogPosts />
        </div>
        <Link href="/blog" className="inline-flex items-center text-primary hover:underline text-sm font-medium">
          View All Posts <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
        <FloatingWhatsAppButton />

        {/* Hidden mobile hotspot: long-press (1.2s) or 5 taps to open admin login */}
        <div
          aria-hidden="true"
          className="fixed bottom-3 right-3 w-12 h-12 z-20"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={handleTap}
        />

        {/* Admin Login Modal (hidden behind keyboard/gesture) */}
        {showAdminLogin && <AdminLogin onClose={() => setShowAdminLogin(false)} />}
        {/* Footer */}
        <footer className="w-full py-8 px-4 sm:px-6 md:px-8 border-t border-gray-100 dark:border-gray-800 mt-auto bg-gradient-to-t from-gray-100/50 to-transparent dark:from-gray-800/50">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3"
            >
              <div className="bg-gradient-to-br from-red-500 via-yellow-400 to-green-500 p-2 rounded-lg">
                <Image src="/logo.png" alt="MarketChat GH Logo" width={24} height={24} className="object-contain" />
              </div>
              <span className="font-headline text-lg font-bold text-gray-900 dark:text-white">MarketChat</span>
            </motion.div>
            <div className="flex flex-col md:flex-row gap-3 items-center">
              <p className="text-muted-foreground text-xs">
                © {new Date().getFullYear()} MarketChat. All rights reserved.
              </p>
              <div className="flex gap-3">
                <motion.a
                  href="https://x.com/MarketChatGH"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  className="text-gray-500 hover:text-primary text-sm"
                >
                  X
                </motion.a>
                <motion.a
                  href="https://facebook.com/MarketChatGH"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  className="text-gray-500 hover:text-primary text-sm"
                >
                  Facebook
                </motion.a>
                <motion.a
                  href="https://instagram.com/MarketChatGH"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  className="text-gray-500 hover:text-primary text-sm"
                >
                  Instagram
                </motion.a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeComponent />
    </Suspense>
  )
}

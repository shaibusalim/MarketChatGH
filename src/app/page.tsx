"use client"

import { useState, Suspense, useEffect, useRef } from "react"
import { InteractiveElements, FloatingWhatsAppButton } from "@/components/InteractiveElements"
import { AdminLogin } from "@/components/AdminLogin"
import { Header } from "@/components/header"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
            <Link href="/" className="flex items-center group">
              <Image 
                src="/marketchat_logo.svg" 
                alt="MarketChat Logo" 
                width={200} 
                height={64} 
                className="h-16 w-auto object-contain scale-[1.5] origin-left" 
              />
            </Link>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 mt-8 md:mt-0 text-sm text-gray-500 dark:text-gray-400 w-full md:w-auto">
              <div className="flex flex-col space-y-3">
                <span className="font-semibold text-gray-900 dark:text-white mb-1">Company</span>
                <Link href="/about" className="hover:text-green-500 transition-colors">About</Link>
                <Link href="/pricing" className="hover:text-green-500 transition-colors">Pricing</Link>
                <Link href="#contact" className="hover:text-green-500 transition-colors">Contact</Link>
              </div>
              <div className="flex flex-col space-y-3">
                <span className="font-semibold text-gray-900 dark:text-white mb-1">Legal</span>
                <Link href="/privacy" className="hover:text-green-500 transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-green-500 transition-colors">Terms of Service</Link>
              </div>
              <div className="flex flex-col space-y-3 col-span-2 md:col-span-1 border-t border-gray-200 dark:border-gray-800 md:border-t-0 pt-6 md:pt-0">
                <span className="font-semibold text-gray-900 dark:text-white mb-1">Social</span>
                <div className="flex gap-4">
                  <motion.a href="https://x.com/MarketChatGH" whileHover={{ y: -2 }} className="hover:text-green-500">X (Twitter)</motion.a>
                  <motion.a href="https://facebook.com/MarketChatGH" whileHover={{ y: -2 }} className="hover:text-green-500">Facebook</motion.a>
                  <motion.a href="https://instagram.com/MarketChatGH" whileHover={{ y: -2 }} className="hover:text-green-500">Instagram</motion.a>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col items-center">
            <p className="text-muted-foreground text-xs text-center">
              © {new Date().getFullYear()} MarketChat. All rights reserved.
            </p>
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

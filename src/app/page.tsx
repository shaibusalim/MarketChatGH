"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { InteractiveElements, FloatingWhatsAppButton } from "@/components/InteractiveElements"
import { AdminLogin } from "@/components/AdminLogin"
import { Header } from "@/components/header"
import { motion } from "framer-motion"
import Image from "next/image"

function HomeComponent() {
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const searchParams = useSearchParams()
  const showAdminButton = searchParams.get("admin") === "true"

  return (
    <main className="relative flex flex-col items-center min-h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Header />
      {/* Content */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto">
        <InteractiveElements />
        <FloatingWhatsAppButton />
        {/* Admin Login Link */}
        {showAdminButton && (
          <motion.button
            whileHover={{ scale: 1.1, color: "#3b82f6" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAdminLogin(true)}
            className="fixed bottom-3 right-3 text-xs text-gray-300 hover:text-primary underline z-20 sm:bottom-4 sm:right-4"
          >
            Admin Login
          </motion.button>
        )}
        {/* Admin Login Modal */}
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

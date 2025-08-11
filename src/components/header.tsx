"use client"

import { Button } from "@/components/ui/button"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import { useState } from "react"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full px-4 lg:px-8 h-16 flex items-center justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm fixed top-0 left-0 z-50"
    >
      <Link href="/" className="flex items-center gap-2">
        <div className="bg-gradient-to-br from-red-500 via-yellow-400 to-green-500 p-1.5 rounded-lg">
          <Image src="/logo.png" alt="MarketChat GH Logo" width={24} height={24} className="object-contain" />
        </div>
        <span className="font-headline text-xl font-bold text-gray-900 dark:text-white">MarketChat</span>
      </Link>
      <nav className="hidden md:flex gap-6">
        <motion.a
          href="#features"
          whileHover={{ scale: 1.05, color: "#3b82f6" }}
          className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
        >
          Features
        </motion.a>
        <motion.a
          href="#testimonials"
          whileHover={{ scale: 1.05, color: "#3b82f6" }}
          className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
        >
          Testimonials
        </motion.a>
        <motion.a
          href="#about"
          whileHover={{ scale: 1.05, color: "#3b82f6" }}
          className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
        >
          About
        </motion.a>
        <motion.a
          href="#contact"
          whileHover={{ scale: 1.05, color: "#3b82f6" }}
          className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
        >
          Contact
        </motion.a>
      </nav>
      <div className="hidden md:block">
        <Link href="/sellers">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium shadow-md hover:bg-green-600 transition-all duration-300"
          >
            Get Started
          </motion.button>
        </Link>
      </div>
      <div className="md:hidden">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-700 dark:text-gray-300">
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-16 left-0 w-full bg-white dark:bg-gray-900 shadow-lg py-4 md:hidden"
        >
          <nav className="flex flex-col items-center gap-4">
            <Link
              href="#features"
              className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#testimonials"
              className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Testimonials
            </Link>
            <Link
              href="#about"
              className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="#contact"
              className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <Link href="/sellers">
              <Button
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Get Started
              </Button>
            </Link>
          </nav>
        </motion.div>
      )}
    </motion.header>
  )
}

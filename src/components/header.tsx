"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Search, ChevronDown, ShoppingBag, Store } from "lucide-react"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import ThemeToggle from "./ThemeToggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

export function Header() {
  const { data: session } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={cn(
        "w-full px-4 lg:px-8 h-16 flex items-center justify-between fixed top-0 left-0 z-50 transition-all duration-300",
        scrolled 
          ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md h-20" 
          : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm"
      )}
    >
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-gradient-to-br from-red-500 via-yellow-400 to-green-500 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
            <Image src="/logo.png" alt="MarketChat GH Logo" width={28} height={28} className="object-contain" />
          </div>
          <span className="font-headline text-2xl font-bold text-gray-900 dark:text-white">MarketChat</span>
        </Link>

        <nav className="hidden md:flex gap-1 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-500 transition-colors outline-none">
              Solutions <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 p-2">
              <DropdownMenuItem asChild>
                <Link href="/for-buyers" className="flex items-center gap-2 cursor-pointer">
                  <ShoppingBag className="h-4 w-4 text-green-500" />
                  <span>For Buyers</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/for-sellers" className="flex items-center gap-2 cursor-pointer">
                  <Store className="h-4 w-4 text-red-500" />
                  <span>For Sellers</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/about" className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-500 transition-colors">
            About
          </Link>
          <Link href="/pricing" className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-500 transition-colors">
            Pricing
          </Link>
          <Link href="/contact" className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-500 transition-colors">
            Contact
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 200, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="hidden sm:block overflow-hidden"
            >
              <Input 
                placeholder="Search products..." 
                className="h-9 w-full bg-gray-100 dark:bg-gray-800 border-none focus-visible:ring-1 focus-visible:ring-green-500"
                autoFocus
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="text-gray-700 dark:text-gray-300"
        >
          <Search className="h-5 w-5" />
        </Button>

        <ThemeToggle />

        <div className="hidden md:block">
          {session ? (
            <Link href={(session.user as any).role === 'admin' ? '/admin' : `/seller/dashboard/${(session.user as any).id}`}>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2 bg-green-500 text-white rounded-xl font-medium shadow-md hover:bg-green-600 transition-all duration-300"
              >
                Dashboard
              </motion.button>
            </Link>
          ) : (
            <Link href="/sellers">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2 bg-green-500 text-white rounded-xl font-medium shadow-md hover:bg-green-600 transition-all duration-300"
              >
                Get Started
              </motion.button>
            </Link>
          )}
        </div>

        <div className="md:hidden">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-700 dark:text-gray-300 p-1">
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 top-16 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-0 w-full bg-white dark:bg-gray-900 shadow-xl py-6 md:hidden z-50 rounded-b-2xl border-t border-gray-100 dark:border-gray-800"
          >
            <nav className="flex flex-col items-center gap-4 px-6">
              <div className="w-full space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4">Solutions</p>
                <Link
                  href="/for-buyers"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ShoppingBag className="h-5 w-5 text-green-500" />
                  <span className="font-medium">For Buyers</span>
                </Link>
                <Link
                  href="/for-sellers"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Store className="h-5 w-5 text-red-500" />
                  <span className="font-medium">For Sellers</span>
                </Link>
              </div>
              
              <div className="w-full h-px bg-gray-100 dark:bg-gray-800 my-2" />

              <Link
                href="/about"
                className="w-full px-4 py-2 text-center text-base font-medium text-gray-700 dark:text-gray-300 hover:text-green-500 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/pricing"
                className="w-full px-4 py-2 text-center text-base font-medium text-gray-700 dark:text-gray-300 hover:text-green-500 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/contact"
                className="w-full px-4 py-2 text-center text-base font-medium text-gray-700 dark:text-gray-300 hover:text-green-500 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              {session ? (
                <Link 
                  href={(session.user as any).role === 'admin' ? '/admin' : `/seller/dashboard/${(session.user as any).id}`} 
                  className="w-full pt-4"
                >
                  <Button
                    className="w-full py-6 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl text-lg shadow-lg shadow-green-500/30"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/sellers" className="w-full pt-4">
                  <Button
                    className="w-full py-6 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl text-lg shadow-lg shadow-green-500/30"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Started
                  </Button>
                </Link>
              )}
            </nav>
          </motion.div>
        </>
      )}
    </motion.header>
  )
}


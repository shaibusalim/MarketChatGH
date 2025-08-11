"use client"

import { Button } from "@/components/ui/button"
import { Shield, User, Package, Menu, X, Newspaper } from "lucide-react"
import Link from "next/link"
import  ThemeToggle from "@/components/ThemeToggle"
import LogoutButton from "@/components/LogoutButton"

interface AdminSidebarProps {
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (isOpen: boolean) => void
}

export function AdminSidebar({ isMobileMenuOpen, setIsMobileMenuOpen }: AdminSidebarProps) {
  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-md z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Admin Dashboard</h2>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            className="h-8 w-8"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            )}
          </Button>
        </div>
      </header>

      {/* Mobile Sidebar (Drawer) */}
      <div
        className={`fixed top-0 left-0 h-full w-11/12 max-w-[280px] bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-xl z-50 transform transition-transform duration-300 md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">MarketChat Admin</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
              className="h-8 w-8"
            >
              <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </Button>
          </div>
          <nav className="space-y-2">
            <Link
              href="/admin"
              className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-semibold text-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <User className="h-4 w-4" />
              Sellers
            </Link>
            <Link
              href="/admin/products"
              className="flex items-center gap-2 p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Package className="h-4 w-4" />
              Products
            </Link>
            <Link
              href="/admin/blog"
              className="flex items-center gap-2 p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Newspaper className="h-4 w-4" />
              Blog Posts
            </Link>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <LogoutButton />
            </div>
          </nav>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed top-0 left-0 h-full w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-xl border-r border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Shield className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">MarketChat Admin</h2>
            </div>
            <ThemeToggle />
          </div>
          <nav className="space-y-2">
            <Link
              href="/admin"
              className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-semibold text-sm"
            >
              <User className="h-5 w-5" />
              Sellers
            </Link>
            <Link
              href="/admin/products"
              className="flex items-center gap-3 p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
            >
              <Package className="h-5 w-5" />
              Products
            </Link>
            <Link
              href="/admin/blog"
              className="flex items-center gap-3 p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
            >
              <Newspaper className="h-5 w-5" />
              Blog Posts
            </Link>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <LogoutButton />
            </div>
          </nav>
        </div>
      </aside>
    </>
  )
}

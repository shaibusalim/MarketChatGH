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
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter">Admin <span className="text-blue-600">Pro</span></h2>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="h-9 w-9 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 text-gray-900 dark:text-white" />
            ) : (
              <Menu className="h-5 w-5 text-gray-900 dark:text-white" />
            )}
          </Button>
        </div>
      </header>

      {/* Mobile Sidebar (Drawer) */}
      <div
        className={`fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-[#020617] shadow-2xl z-50 transform transition-transform duration-500 md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-8 flex flex-col h-full">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tighter italic">MarketChat</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(false)}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex-1 space-y-2">
            <Link
              href="/admin"
              className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-black text-xs uppercase tracking-widest"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <User className="h-4 w-4" />
              Sellers
            </Link>
            <Link
              href="/admin/products"
              className="flex items-center gap-3 p-4 rounded-2xl text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-800/50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Package className="h-4 w-4" />
              Products
            </Link>
            <Link
              href="/admin/blog"
              className="flex items-center gap-3 p-4 rounded-2xl text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-800/50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Newspaper className="h-4 w-4" />
              Blog Posts
            </Link>
          </nav>
          <div className="mt-auto pt-8 border-t border-gray-100 dark:border-gray-800">
             <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black italic">A</div>
                <div>
                  <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tighter">Administrator</p>
                  <p className="text-[10px] text-gray-400 font-bold">admin@marketchat.com</p>
                </div>
             </div>
             <LogoutButton />
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed top-0 left-0 h-full w-64 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-2xl border-r border-gray-200/50 dark:border-gray-800/50 z-40 transition-all duration-300">
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-10">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="bg-blue-600 dark:bg-blue-500 p-2 rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-200">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">MarketChat</h2>
                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest">Admin Pro</p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 space-y-1.5">
            <Link
              href="/admin"
              className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold text-sm transition-all duration-200 shadow-sm shadow-blue-100/50 dark:shadow-none"
            >
              <User className="h-5 w-5" />
              Sellers
            </Link>
            <Link
              href="/admin/products"
              className="flex items-center gap-3 p-3 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white transition-all duration-200 text-sm"
            >
              <Package className="h-5 w-5" />
              Products
            </Link>
            <Link
              href="/admin/blog"
              className="flex items-center gap-3 p-3 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white transition-all duration-200 text-sm"
            >
              <Newspaper className="h-5 w-5" />
              Blog Posts
            </Link>
          </nav>

          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">Administrator</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">admin@marketchat.com</p>
              </div>
            </div>
            <div className="flex items-center justify-between px-2">
              <ThemeToggle />
              <LogoutButton />
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { Shield, User, Package, Menu, X, Newspaper, ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import ThemeToggle from "@/components/ThemeToggle"
import LogoutButton from "@/components/LogoutButton"

interface AdminSidebarProps {
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (isOpen: boolean) => void
}

export function AdminSidebar({ isMobileMenuOpen, setIsMobileMenuOpen }: AdminSidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { href: "/mcgh-admin-control", label: "Sellers", icon: User, exact: true },
    { href: "/mcgh-admin-control/products", label: "Products", icon: Package, exact: false },
    { href: "/mcgh-admin-control/blog", label: "Blog Posts", icon: Newspaper, exact: false },
  ]

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) {
      return pathname === item.href
    }
    return pathname?.startsWith(item.href)
  }

  return (
    <>
      {/* Mobile Top App Bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 z-50 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-xl shadow-md shadow-blue-500/20 text-white">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">MarketChat</h2>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Admin Control</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="h-10 w-10 rounded-xl bg-gray-50 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-800"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (App Look) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border-t border-gray-200/80 dark:border-gray-800/80 z-40 px-3 py-2 flex items-center justify-around shadow-2xl safe-area-bottom">
        {navItems.map((item) => {
          const active = isActive(item)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
                active
                  ? "text-blue-600 dark:text-blue-400 font-black scale-105"
                  : "text-gray-400 dark:text-gray-500 font-semibold hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-colors ${active ? "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" : ""}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
            </Link>
          )
        })}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-gray-400 dark:text-gray-500 font-semibold hover:text-gray-900 dark:hover:text-gray-200"
        >
          <div className="p-1.5 rounded-xl">
            <Menu className="h-5 w-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Menu</span>
        </button>
      </nav>

      {/* Mobile Drawer Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Drawer Sheet */}
      <div
        className={`fixed top-0 left-0 h-full w-[80%] max-w-xs bg-white dark:bg-[#020617] shadow-2xl z-50 transform transition-transform duration-300 ease-out md:hidden flex flex-col ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-500/25">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900 dark:text-white tracking-tight">MarketChat</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Admin Console</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(false)}
            className="h-9 w-9 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Drawer Navigation Links */}
        <div className="p-4 flex-1 overflow-y-auto space-y-1.5">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-3 py-2">Navigation</p>
          {navItems.map((item) => {
            const active = isActive(item)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between p-3.5 rounded-2xl transition-all duration-200 ${
                  active
                    ? "bg-blue-600 text-white font-black shadow-lg shadow-blue-600/25"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 font-bold"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${active ? "text-white" : "text-gray-400"}`} />
                  <span className="text-sm">{item.label}</span>
                </div>
                <ChevronRight className={`h-4 w-4 ${active ? "text-white/80" : "text-gray-300 dark:text-gray-600"}`} />
              </Link>
            )
          })}
        </div>

        {/* Admin User Card & Logout */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-900/30">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-gray-800/70 border border-gray-100 dark:border-gray-800 shadow-sm mb-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">
              A
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-gray-900 dark:text-white truncate">Administrator</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-gray-400 font-bold">Logged In</span>
              </div>
            </div>
          </div>
          <LogoutButton />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed top-0 left-0 h-full w-64 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-2xl border-r border-gray-200/50 dark:border-gray-800/50 z-40 transition-all duration-300">
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-10">
            <Link href="/mcgh-admin-control" className="flex items-center gap-3 group">
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
            {navItems.map((item) => {
              const active = isActive(item)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 p-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    active
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm shadow-blue-100/50 dark:shadow-none font-bold"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
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

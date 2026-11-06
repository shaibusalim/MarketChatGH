"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Star,
  Store,
  MapPin,
  Package,
  ShoppingBag,
  MessageCircle,
  Search,
  Loader2,
  AlertCircle,
  Share2,
  Check,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  X,
  Filter,
  Instagram,
  Video,
} from "lucide-react"
import Link from "next/link"
import ProductCard from "@/components/ProductCard"
import { WhatsAppCartDrawer, CartItem } from "@/components/whatsapp-cart-drawer"
import { SellerReviewsDisplay } from "@/components/seller-review-display"
import { toast } from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"

interface Product {
  id: string
  title?: string
  name?: string
  imageUrl: string
  images?: string[]
  price: string
  compareAtPrice?: string | null
  description: string
  category?: string
  sellerId: string
  status: string
  stockStatus: string
  isAvailable: boolean
}

interface SellerInfo {
  id: string
  name: string
  location: string
  active: boolean
  phone?: string
  rating?: number
  reviewCount?: number
  profileImageUrl?: string
  bio?: string
  bannerUrl?: string
  tagline?: string
  announcement?: string
  themeColor?: string
  instagram?: string
  tiktok?: string
}

interface SellerData {
  seller: SellerInfo | null
  products: Product[]
}

const THEME_STYLES: Record<string, {
  announcementBg: string
  primaryBtn: string
  activeChip: string
  badgeBg: string
  badgeText: string
  accentText: string
  gradientFrom: string
  gradientTo: string
}> = {
  emerald: {
    announcementBg: "bg-emerald-600",
    primaryBtn: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20",
    activeChip: "bg-emerald-600 text-white border-emerald-600 shadow-emerald-600/25",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/60",
    badgeText: "text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    accentText: "text-emerald-600",
    gradientFrom: "from-emerald-500",
    gradientTo: "to-teal-700",
  },
  blue: {
    announcementBg: "bg-blue-600",
    primaryBtn: "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20",
    activeChip: "bg-blue-600 text-white border-blue-600 shadow-blue-600/25",
    badgeBg: "bg-blue-50 dark:bg-blue-950/60",
    badgeText: "text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    accentText: "text-blue-600",
    gradientFrom: "from-blue-500",
    gradientTo: "to-indigo-700",
  },
  purple: {
    announcementBg: "bg-purple-600",
    primaryBtn: "bg-purple-600 hover:bg-purple-700 shadow-purple-600/20",
    activeChip: "bg-purple-600 text-white border-purple-600 shadow-purple-600/25",
    badgeBg: "bg-purple-50 dark:bg-purple-950/60",
    badgeText: "text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    accentText: "text-purple-600",
    gradientFrom: "from-purple-500",
    gradientTo: "to-indigo-800",
  },
  rose: {
    announcementBg: "bg-rose-600",
    primaryBtn: "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20",
    activeChip: "bg-rose-600 text-white border-rose-600 shadow-rose-600/25",
    badgeBg: "bg-rose-50 dark:bg-rose-950/60",
    badgeText: "text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    accentText: "text-rose-600",
    gradientFrom: "from-rose-500",
    gradientTo: "to-pink-700",
  },
  amber: {
    announcementBg: "bg-amber-600",
    primaryBtn: "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20",
    activeChip: "bg-amber-600 text-white border-amber-600 shadow-amber-600/25",
    badgeBg: "bg-amber-50 dark:bg-amber-950/60",
    badgeText: "text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    accentText: "text-amber-600",
    gradientFrom: "from-amber-500",
    gradientTo: "to-orange-700",
  },
  slate: {
    announcementBg: "bg-slate-900",
    primaryBtn: "bg-slate-900 hover:bg-black shadow-slate-900/20",
    activeChip: "bg-slate-900 text-white border-slate-900 shadow-slate-900/25",
    badgeBg: "bg-slate-100 dark:bg-slate-800",
    badgeText: "text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700",
    accentText: "text-slate-900 dark:text-white",
    gradientFrom: "from-gray-700",
    gradientTo: "to-slate-900",
  },
}

const CATEGORY_MAP: { name: string; icon: string; regex: RegExp }[] = [
  { name: "Computers", icon: "💻", regex: /computer|laptop|macbook|dell|hp\b|lenovo|thinkpad|monitor|keyboard|mouse|pc\b|desktop|processor|ram\b|intel|ssd\b/i },
  { name: "Electronics", icon: "📱", regex: /phone|iphone|samsung|android|charger|cable|earbud|airpod|headphone|speaker|bluetooth|tablet|ipad|smartwatch|gadget|camera|power\s*bank/i },
  { name: "Shoes", icon: "👟", regex: /shoe|sneaker|heel|boot|sandal|slippers|crocs|air force|jordan|loafer|slide|footwear/i },
  { name: "Bags", icon: "👜", regex: /bag|backpack|handbag|purse|tote|wallet|clutch|suitcase|duffle/i },
  { name: "Books", icon: "📚", regex: /book|novel|textbook|guide|bible|story|study|stationery|pen|pencil|notebook/i },
  { name: "Fashion", icon: "👗", regex: /dress|shirt|t-shirt|top|trouser|pant|jean|hoodie|jacket|skirt|suit|cloth|wear|jersey|underwear|short/i },
  { name: "Beauty & Care", icon: "💄", regex: /perfume|cologne|makeup|lipstick|lotion|cream|soap|hair|wig|skincare|cosmetic|fragrance/i },
  { name: "Groceries & Food", icon: "🍎", regex: /food|snack|drink|beverage|rice|oil|spice|grocer|biscuit|chocolate|candy/i },
  { name: "Jewelry & Watches", icon: "⌚", regex: /watch|jewelry|jewellery|ring|necklace|bracelet|chain|earring|gold|silver/i },
]

const CATEGORY_ICONS: Record<string, string> = {
  All: "🏷️",
  Computers: "💻",
  Electronics: "📱",
  Shoes: "👟",
  Bags: "👜",
  Books: "📚",
  Fashion: "👗",
  "Fashion & Clothing": "👗",
  "Beauty & Care": "💄",
  "Beauty & Cosmetics": "💄",
  "Groceries & Food": "🍎",
  "Jewelry & Watches": "⌚",
  "Home & Living": "🏠",
  General: "📦",
}

function resolveProductCategory(p: Product): string {
  // If explicitly categorized into something other than General, preserve it
  if (p.category && p.category.trim() && p.category.trim().toLowerCase() !== "general") {
    const catTrim = p.category.trim()
    const catLower = catTrim.toLowerCase()
    const found = CATEGORY_MAP.find((c) => c.name.toLowerCase() === catLower || (c.name === "Fashion" && catLower.includes("fashion")))
    return found ? found.name : catTrim
  }

  // Otherwise, smartly infer category from title and description
  const text = `${p.title || ""} ${p.name || ""} ${p.description || ""}`
  for (const c of CATEGORY_MAP) {
    if (c.regex.test(text)) {
      return c.name
    }
  }

  return "General"
}

const FORBIDDEN_SELLER_IDS = new Set(["admin", "mcgh-admin-control"])
const isForbiddenSellerId = (id: string) =>
  FORBIDDEN_SELLER_IDS.has(id) || id.startsWith("admin/") || id.startsWith("mcgh-admin-control/")

export default function SellerPage() {
  const { sellerId } = useParams() as { sellerId: string }
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status: sessionStatus } = useSession()
  const didRedirectRef = useRef(false)

  const [seller, setSeller] = useState<SellerInfo | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasFetched, setHasFetched] = useState(false)

  const [currentProductSearchQuery, setCurrentProductSearchQuery] = useState(searchParams.get("productQ") || "")
  const [currentProductFilterStatus, setCurrentProductFilterStatus] = useState(
    searchParams.get("productStatus") || "all"
  )
  const [fetchedProductSearchQuery, setFetchedProductSearchQuery] = useState(searchParams.get("productQ") || "")
  const [fetchedProductFilterStatus, setFetchedProductFilterStatus] = useState(
    searchParams.get("productStatus") || "all"
  )

  // E-Commerce UI State
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [sortBy, setSortBy] = useState<string>("featured")
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [hasCopiedLink, setHasCopiedLink] = useState(false)

  const activeTheme = THEME_STYLES[seller?.themeColor || "emerald"] || THEME_STYLES.emerald
  const forbiddenId = isForbiddenSellerId(sellerId)

  // Route & Admin guards
  useEffect(() => {
    if (forbiddenId && !didRedirectRef.current) {
      didRedirectRef.current = true
      window.location.href = "/"
    }
  }, [forbiddenId])

  useEffect(() => {
    if (sessionStatus === "loading") return
    if (didRedirectRef.current) return
    if (forbiddenId) return
    if (session?.user) {
      const user = session.user as any
      const isAdminUser = Boolean(user.isAdmin || user.role === "admin")
      if (isAdminUser) {
        if (hasFetched && !seller) {
          didRedirectRef.current = true
          router.replace("/mcgh-admin-control")
        } else if (seller) {
          didRedirectRef.current = true
          router.replace(`/mcgh-admin-control/sellers/${sellerId}`)
        }
      }
    }
  }, [sessionStatus, session, hasFetched, seller, sellerId, router, forbiddenId])

  const fetchSellerData = useCallback(
    async (query: string, status: string) => {
      if (forbiddenId) {
        setIsLoading(false)
        setHasFetched(true)
        setSeller(null)
        setProducts([])
        return
      }
      setIsLoading(true)
      setError(null)
      try {
        const url = new URL(
          `/api/sellers/${sellerId}`,
          typeof window !== "undefined" ? window.location.origin : "http://localhost"
        )
        if (query) url.searchParams.append("productQ", query)
        if (status !== "all") url.searchParams.append("productStatus", status)

        const response = await fetch(url.toString())
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ details: null }))
          throw new Error(errorData.details || `Failed to fetch seller data (Status: ${response.status})`)
        }
        const data: SellerData = await response.json()
        setSeller(data.seller)
        setProducts(data.products || [])
        setFetchedProductSearchQuery(query)
        setFetchedProductFilterStatus(status)
      } catch (err) {
        const msg = (err as Error).message || String(err)
        if (msg.includes("RESOURCE_EXHAUSTED") || msg.includes("Quota exceeded") || msg.includes("quota exceeded")) {
          setError(`__QUOTA_EXCEEDED__:${msg}`)
        } else {
          setError(msg)
          toast.error("Failed to load seller data: " + msg, { duration: 5000 })
        }
      } finally {
        setIsLoading(false)
        setHasFetched(true)
      }
    },
    [sellerId, forbiddenId]
  )

  useEffect(() => {
    if (forbiddenId) {
      setIsLoading(false)
      setHasFetched(true)
      return
    }
    const handler = setTimeout(() => {
      const shouldFetch =
        !hasFetched ||
        currentProductSearchQuery !== fetchedProductSearchQuery ||
        currentProductFilterStatus !== fetchedProductFilterStatus
      if (shouldFetch) {
        fetchSellerData(currentProductSearchQuery, currentProductFilterStatus)
      }
      const newSearchParams = new URLSearchParams()
      if (currentProductSearchQuery) {
        newSearchParams.set("productQ", currentProductSearchQuery)
      }
      if (currentProductFilterStatus !== "all") {
        newSearchParams.set("productStatus", currentProductFilterStatus)
      }
      const target = `?${newSearchParams.toString()}`
      const current = `?${searchParams.toString()}`
      if (target !== current) {
        router.replace(target, { scroll: false })
      }
    }, 400)

    return () => {
      clearTimeout(handler)
    }
  }, [
    currentProductSearchQuery,
    currentProductFilterStatus,
    fetchedProductSearchQuery,
    fetchedProductFilterStatus,
    fetchSellerData,
    router,
    hasFetched,
    searchParams,
    forbiddenId,
  ])

  // Track store visit
  useEffect(() => {
    const trackVisit = async () => {
      const targetSellerId = seller?.id || sellerId
      if (!targetSellerId) return

      try {
        await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sellerId: targetSellerId,
            type: "store_visit",
            sellerName: seller?.name || "Unknown Shop",
          }),
        })
      } catch (err) {
        console.error("[SellerPage] Error tracking visit:", err)
      }
    }

    if (seller) {
      trackVisit()
    }
  }, [sellerId, seller])

  // Enhance all products with resolved categories (covers legacy DB items too)
  const enhancedProducts = useMemo(() => {
    return products.map((p) => ({
      ...p,
      category: resolveProductCategory(p),
    }))
  }, [products])

  // Category counts
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = { All: enhancedProducts.length }
    enhancedProducts.forEach((p) => {
      const cat = p.category || "General"
      counts[cat] = (counts[cat] || 0) + 1
    })
    return counts
  }, [enhancedProducts])

  // List of active categories in this store
  const categories = useMemo(() => {
    const list = Object.keys(categoryStats)
    // Put "All" first, then sort by popularity (most items first)
    return ["All", ...list.filter((c) => c !== "All").sort((a, b) => (categoryStats[b] || 0) - (categoryStats[a] || 0))]
  }, [categoryStats])

  // Filter and sort products
  const displayedProducts = useMemo(() => {
    let list = [...enhancedProducts]

    // Category filter
    if (selectedCategory !== "All") {
      list = list.filter((p) => p.category?.toLowerCase() === selectedCategory.toLowerCase())
    }

    // Client-side text search
    if (currentProductSearchQuery.trim()) {
      const q = currentProductSearchQuery.toLowerCase()
      list = list.filter(
        (p) =>
          (p.title && p.title.toLowerCase().includes(q)) ||
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q))
      )
    }

    // Stock availability filter
    if (currentProductFilterStatus === "available") {
      list = list.filter((p) => p.isAvailable)
    } else if (currentProductFilterStatus === "outOfStock") {
      list = list.filter((p) => !p.isAvailable)
    }

    // Sorting
    if (sortBy === "price-asc") {
      list.sort((a, b) => {
        const pA = parseFloat(a.price.replace(/[^\d.]/g, "")) || 0
        const pB = parseFloat(b.price.replace(/[^\d.]/g, "")) || 0
        return pA - pB
      })
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => {
        const pA = parseFloat(a.price.replace(/[^\d.]/g, "")) || 0
        const pB = parseFloat(b.price.replace(/[^\d.]/g, "")) || 0
        return pB - pA
      })
    } else if (sortBy === "available") {
      list.sort((a, b) => (b.isAvailable ? 1 : 0) - (a.isAvailable ? 1 : 0))
    }

    return list
  }, [enhancedProducts, selectedCategory, currentProductSearchQuery, currentProductFilterStatus, sortBy])

  // Cart operations
  const handleAddToCart = (productToAdd: { id: string; title: string; price: string; imageUrl: string }) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === productToAdd.id)
      if (existing) {
        return prev.map((item) =>
          item.id === productToAdd.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...productToAdd, quantity: 1 }]
    })
    toast.success(`Added to WhatsApp Bag`, { icon: "🛍️", duration: 1800 })
  }

  const handleUpdateQuantity = (id: string, newQty: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
    )
  }

  const handleRemoveFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleClearCart = () => {
    setCartItems([])
  }

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)
  const totalCartAmount = cartItems.reduce((acc, item) => {
    const num = parseFloat(item.price.replace(/[^\d.]/g, "")) || 0
    return acc + num * item.quantity
  }, 0)

  // Direct WhatsApp Link for Store Header
  let cleanStorePhone = (seller?.phone || sellerId || "").replace(/\D/g, "")
  if (cleanStorePhone.startsWith("0")) {
    cleanStorePhone = "233" + cleanStorePhone.substring(1)
  } else if (cleanStorePhone.length > 0 && !cleanStorePhone.startsWith("233")) {
    cleanStorePhone = "233" + cleanStorePhone
  }
  const generalStoreChatUrl = `https://wa.me/${cleanStorePhone}?text=${encodeURIComponent(
    `Hello ${seller?.name || "Seller"}, I'm browsing your online store on MarketChatGH and would like to ask a few questions.`
  )}`

  const handleShareStore = async () => {
    const storeUrl = typeof window !== "undefined" ? window.location.href : `https://marketchat.site/${sellerId}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${seller?.name || "Store"} on MarketChatGH`,
          text: `Check out products from ${seller?.name} on MarketChatGH!`,
          url: storeUrl,
        })
        return
      } catch (err) {}
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(storeUrl)
      setHasCopiedLink(true)
      toast.success("Store link copied to clipboard!")
      setTimeout(() => setHasCopiedLink(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Opening Store...</p>
        </div>
      </div>
    )
  }

  const IS_QUOTA_ERROR = Boolean(
    error &&
      (error.startsWith("__QUOTA_EXCEEDED__:") ||
        error.includes("RESOURCE_EXHAUSTED") ||
        error.includes("Quota exceeded") ||
        error.includes("quota exceeded"))
  )

  if (IS_QUOTA_ERROR) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-amber-50 dark:bg-amber-950 p-4 text-center">
        <AlertCircle className="h-16 w-16 text-amber-600 dark:text-amber-400 mb-6" />
        <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-200 mb-3">Temporarily Busy</h2>
        <p className="text-amber-700 dark:text-amber-300 mb-6 max-w-md leading-relaxed">
          Our store systems are currently handling heavy traffic. Please refresh in a few moments.
        </p>
        <Button
          onClick={() => fetchSellerData(currentProductSearchQuery, currentProductFilterStatus)}
          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-6 rounded-lg"
        >
          Refresh Store
        </Button>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-red-50 dark:bg-red-950 p-4 text-center">
        <AlertCircle className="h-16 w-16 text-red-600 dark:text-red-400 mb-6" />
        <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-3">Something went wrong</h2>
        <p className="text-red-700 dark:text-red-300 mb-6">
          An error occurred while loading this seller&apos;s store. Please try again.
        </p>
        <Button
          onClick={() => fetchSellerData(currentProductSearchQuery, currentProductFilterStatus)}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg"
        >
          Try again
        </Button>
      </div>
    )
  }

  if (!seller) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <Store className="h-8 w-8 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Store Not Found</h2>
        <p className="text-muted-foreground text-sm mb-6 max-w-sm">
          The seller link might have expired or the store is no longer active.
        </p>
        <Button asChild className="rounded-xl">
          <Link href="/sellers">Explore Other Stores</Link>
        </Button>
      </div>
    )
  }

  if (!seller.active) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <Card className="shadow-xl p-8 sm:p-12 text-center max-w-md mx-auto bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-800">
          <CardContent className="p-0">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-600">
              <Store className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Store Temporarily Closed
            </CardTitle>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
              {seller.name} is not accepting new orders right now. Please check back later.
            </p>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
              <Link href="/sellers">Browse Active Stores</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-gray-950 text-gray-900 dark:text-gray-100 pb-24">
      {/* Top Brand Announcement Bar */}
      <div className={`${activeTheme.announcementBg} text-white py-2 px-4 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors`}>
        <Sparkles className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate max-w-2xl">
          {seller.announcement?.trim() || "Official MarketChat Storefront • WhatsApp Fast Order Ready"}
        </span>
      </div>

      {/* Real E-Commerce Store Banner & Identity */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 relative">
        {seller.bannerUrl ? (
          <div className="relative w-full h-36 sm:h-52 md:h-60 overflow-hidden bg-gray-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={seller.bannerUrl}
              alt={`${seller.name} banner`}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
          </div>
        ) : (
          <div className={`w-full h-20 sm:h-28 bg-gradient-to-r ${activeTheme.gradientFrom} ${activeTheme.gradientTo} opacity-85`} />
        )}

        <div className="container mx-auto px-4 max-w-7xl -mt-10 sm:-mt-14 relative z-10 pb-6 sm:pb-8">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            {/* Store Profile Info */}
            <div className="flex items-end gap-4 sm:gap-5">
              <div className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br ${activeTheme.gradientFrom} ${activeTheme.gradientTo} text-white flex items-center justify-center shadow-xl font-black text-2xl sm:text-3xl shrink-0 overflow-hidden ring-4 ring-white dark:ring-gray-900`}>
                {seller.profileImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={seller.profileImageUrl}
                    alt={seller.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{seller.name?.charAt(0).toUpperCase() || "S"}</span>
                )}
              </div>

              <div className="space-y-1 pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    {seller.name}
                  </h1>
                  <span className={`inline-flex items-center gap-1 ${activeTheme.badgeBg} ${activeTheme.badgeText} text-[10px] font-bold px-2 py-0.5 rounded-full border`}>
                    <ShieldCheck className="h-3 w-3" /> Verified Merchant
                  </span>
                </div>

                {seller.tagline && (
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 italic">
                    {seller.tagline}
                  </p>
                )}

                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    <span>{seller.location}</span>
                  </div>
                  <span>&bull;</span>
                  <div className="flex items-center gap-1">
                    <Package className="h-3.5 w-3.5 text-gray-400" />
                    <span>{products.length} Products</span>
                  </div>
                  {seller.rating && seller.rating > 0 && (
                    <>
                      <span>&bull;</span>
                      <div className="flex items-center gap-1 text-amber-500 font-semibold">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <span>{seller.rating.toFixed(1)}</span>
                        {seller.reviewCount ? (
                          <span className="text-gray-400 font-normal">({seller.reviewCount})</span>
                        ) : null}
                      </div>
                    </>
                  )}
                </div>

                {seller.bio && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 max-w-lg mt-1 line-clamp-2">
                    {seller.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions & Socials */}
            <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
              {seller.instagram && (
                <Button
                  asChild
                  variant="outline"
                  className="h-11 px-3 sm:px-4 rounded-xl border-pink-200 dark:border-pink-900/40 text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/20 font-bold text-xs"
                >
                  <a
                    href={`https://instagram.com/${seller.instagram.replace(/^@/, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Instagram Profile"
                  >
                    <Instagram className="h-4 w-4 sm:mr-1.5" />
                    <span className="hidden sm:inline">@{seller.instagram.replace(/^@/, "")}</span>
                  </a>
                </Button>
              )}

              {seller.tiktok && (
                <Button
                  asChild
                  variant="outline"
                  className="h-11 px-3 sm:px-4 rounded-xl border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 font-bold text-xs"
                >
                  <a
                    href={`https://tiktok.com/@${seller.tiktok.replace(/^@/, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="TikTok Profile"
                  >
                    <Video className="h-4 w-4 sm:mr-1.5" />
                    <span className="hidden sm:inline">@{seller.tiktok.replace(/^@/, "")}</span>
                  </a>
                </Button>
              )}

              <Button
                asChild
                className={`flex-1 md:flex-initial h-11 px-5 rounded-xl text-white font-bold shadow-sm ${activeTheme.primaryBtn}`}
              >
                <a href={generalStoreChatUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4 mr-2 fill-current" />
                  Chat on WhatsApp
                </a>
              </Button>

              <Button
                variant="outline"
                onClick={handleShareStore}
                className="h-11 px-4 rounded-xl border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                title="Share store"
              >
                {hasCopiedLink ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Share2 className="h-4 w-4" />
                )}
                <span className="ml-1.5 hidden sm:inline text-xs font-semibold">Share</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main E-Commerce Content */}
      <main className="container mx-auto px-3 sm:px-4 max-w-7xl py-6 sm:py-8">
        
        {/* Prominent Category Navigation Bar */}
        <section className="mb-6 bg-white dark:bg-gray-900 p-4 sm:p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-gray-900 dark:text-white">Shop by Category</span>
              <span className="text-xs text-muted-foreground font-medium">
                ({categories.length - 1} {categories.length - 1 === 1 ? "category" : "categories"} available)
              </span>
            </div>
            {selectedCategory !== "All" && (
              <button
                onClick={() => setSelectedCategory("All")}
                className="`text-xs font-bold ${activeTheme.accentText} flex items-center gap-1 hover:underline`"
              >
                <X className="w-3.5 h-3.5" /> Show All ({enhancedProducts.length})
              </button>
            )}
          </div>

          {/* Visual Category Chips */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
            {categories.map((cat) => {
              const count = categoryStats[cat] || 0
              const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase()
              const icon = CATEGORY_ICONS[cat] || "🏷️"

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shrink-0 transition-all flex items-center gap-2 shadow-sm border ${
                    isSelected
                      ? `${activeTheme.activeChip} scale-[1.02]`
                      : "bg-gray-50 dark:bg-gray-800/60 text-gray-700 dark:text-gray-200 border-gray-200/80 dark:border-gray-700/80 hover:border-emerald-500 hover:bg-white dark:hover:bg-gray-800"
                  }`}
                >
                  <span className="text-base">{icon}</span>
                  <span>{cat === "All" ? "All Products" : cat}</span>
                  <span
                    className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-white dark:bg-gray-900 text-gray-500 border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Active Category Filter Feedback Banner */}
          {selectedCategory !== "All" && (
            <div className="mt-3.5 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Filter className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  Filtering by: <strong className="text-gray-900 dark:text-white">{CATEGORY_ICONS[selectedCategory] || ""} {selectedCategory}</strong> ({displayedProducts.length} items)
                </span>
              </div>
              <button
                onClick={() => setSelectedCategory("All")}
                className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-semibold"
              >
                Clear filter
              </button>
            </div>
          )}
        </section>

        {/* Search, Filter & Sort Controls Bar */}
        <div className="bg-white dark:bg-gray-900 p-3 sm:p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder={`Search in ${selectedCategory === "All" ? "all products" : selectedCategory}...`}
              value={currentProductSearchQuery}
              onChange={(e) => setCurrentProductSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800/60 border-none text-xs sm:text-sm"
            />
          </div>

          <div className="flex items-center gap-2.5">
            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px] sm:w-[170px] h-10 rounded-xl text-xs border-gray-200 dark:border-gray-800">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Newest & Featured</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="available">In Stock First</SelectItem>
              </SelectContent>
            </Select>

            {/* Stock Filter */}
            <Select
              value={currentProductFilterStatus}
              onValueChange={setCurrentProductFilterStatus}
            >
              <SelectTrigger className="w-[125px] sm:w-[140px] h-10 rounded-xl text-xs border-gray-200 dark:border-gray-800">
                <SelectValue placeholder="Stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="available">In Stock Only</SelectItem>
                <SelectItem value="outOfStock">Sold Out</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Compact E-Commerce Product Grid (2 columns on mobile, 3 on tablet, 4 on desktop) */}
        {displayedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={{ ...product, sellerPhone: seller.phone }}
                onAddToCart={handleAddToCart}
                isInCart={cartItems.some((ci) => ci.id === product.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              No products found
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-6">
              {currentProductSearchQuery || selectedCategory !== "All"
                ? `No products found matching "${selectedCategory !== "All" ? selectedCategory : currentProductSearchQuery}".`
                : "This merchant currently has no active products listed."}
            </p>
            {(currentProductSearchQuery || selectedCategory !== "All" || currentProductFilterStatus !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentProductSearchQuery("")
                  setSelectedCategory("All")
                  setCurrentProductFilterStatus("all")
                }}
                className="rounded-xl text-xs"
              >
                Reset All Filters
              </Button>
            )}
          </div>
        )}

        {/* Reviews Section */}
        <section className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-800">
          <div className="text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
              Customer Reviews
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Feedback from verified buyers of {seller.name}
            </p>
          </div>
          <SellerReviewsDisplay sellerId={sellerId} />
        </section>
      </main>

      {/* Floating WhatsApp Bag Bar */}
      <AnimatePresence>
        {cartItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 inset-x-4 sm:inset-x-auto sm:right-8 z-40"
          >
            <div
              onClick={() => setIsCartOpen(true)}
              className="cursor-pointer bg-gray-900 dark:bg-emerald-600 text-white p-3.5 sm:px-6 sm:py-4 rounded-2xl sm:rounded-full shadow-2xl flex items-center justify-between sm:gap-6 hover:scale-[1.02] active:scale-[0.98] transition-all border border-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="p-2 bg-emerald-500 rounded-xl text-white">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-gray-900 dark:border-emerald-600">
                    {totalCartCount}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold leading-none">
                    WhatsApp Order Bag
                  </div>
                  <div className="text-[11px] text-gray-300 font-semibold mt-0.5">
                    GH₵{totalCartAmount.toFixed(2)} &bull; {totalCartCount} {totalCartCount === 1 ? "item" : "items"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold bg-emerald-500 text-white px-3 py-1.5 rounded-xl ml-4 sm:ml-0">
                <span>View Bag</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp Cart Drawer */}
      <WhatsAppCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClear={handleClearCart}
        sellerName={seller.name}
        sellerPhone={seller.phone}
        sellerId={sellerId}
      />

      {/* Footer */}
      <footer className="mt-20 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 py-10">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <div className="flex items-center justify-center gap-2 mb-2 font-bold text-gray-900 dark:text-white">
            <Store className="w-5 h-5 text-emerald-600" />
            <span>MarketChat GH</span>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Connecting verified merchants and smart shoppers across Ghana.
          </p>
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
            <Link href="/" className="hover:underline">Home</Link>
            <Link href="/sellers" className="hover:underline">Browse Sellers</Link>
            <a href="https://wa.me/+233209832978" target="_blank" rel="noopener noreferrer" className="hover:underline">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

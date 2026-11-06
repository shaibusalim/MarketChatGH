"use client"

import { TwilioMediaDisplay } from "./TwilioMediaDisplay"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Eye, ShoppingBag, Check } from "lucide-react"
import { useState } from "react"

const CATEGORY_ICONS: Record<string, string> = {
  Computers: "💻",
  Electronics: "📱",
  Shoes: "👟",
  Bags: "👜",
  Books: "📚",
  Fashion: "👗",
  "Clothing & Fashion": "👗",
  "Fashion & Clothing": "👗",
  "Beauty & Care": "💄",
  "Beauty & Cosmetics": "💄",
  "Groceries & Food": "🍎",
  "Jewelry & Watches": "⌚",
  "Home & Living": "🏠",
}

export interface ProductCardProps {
  product: {
    id: string
    title?: string
    name?: string
    imageUrl: string
    price: string
    compareAtPrice?: string | null
    description: string
    category?: string
    sellerId: string
    sellerPhone?: string
    isAvailable?: boolean
  }
  onAddToCart?: (product: {
    id: string
    title: string
    price: string
    imageUrl: string
  }) => void
  isInCart?: boolean
}

export default function ProductCard({ product, onAddToCart, isInCart }: ProductCardProps) {
  const {
    imageUrl,
    price,
    compareAtPrice,
    description,
    category,
    sellerId,
    id,
    isAvailable = true,
    sellerPhone,
  } = product

  const [addedJustNow, setAddedJustNow] = useState(false)

  const displayTitle =
    product.title ||
    product.name ||
    (description ? description.split("\n")[0].substring(0, 70) : "Product")

  // Clean Ghana WhatsApp phone number
  let cleanPhone = (sellerPhone || sellerId || "").replace(/\D/g, "")
  if (cleanPhone.startsWith("0")) {
    cleanPhone = "233" + cleanPhone.substring(1)
  } else if (cleanPhone.length > 0 && !cleanPhone.startsWith("233")) {
    cleanPhone = "233" + cleanPhone
  }

  const productUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${sellerId}/product/${id}`
      : ""
  const message = `Hi, I found this on MarketChatGH: ${productUrl}. I'm interested in buying "${displayTitle}" for GH₵${price}. Is it still available?`
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`

  const handleChatToBuy = () => {
    if (!isAvailable) return

    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: id,
        sellerId: sellerId,
        productDescription: displayTitle,
        productPrice: price,
        type: "chat_to_buy",
      }),
    }).catch((err) => console.error("[ProductCard] Error tracking lead:", err))
  }

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAvailable || !onAddToCart) return

    onAddToCart({
      id,
      title: displayTitle,
      price,
      imageUrl: imageUrl || "/img1.jpg",
    })

    setAddedJustNow(true)
    setTimeout(() => setAddedJustNow(false), 1500)
  }

  const hasDiscount =
    compareAtPrice &&
    parseFloat(compareAtPrice.replace(/[^\d.]/g, "")) >
      parseFloat(price.replace(/[^\d.]/g, ""))

  return (
    <div
      className={`group relative flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 ${
        !isAvailable ? "opacity-75" : ""
      }`}
    >
      {/* Product Image Area */}
      <Link
        href={`/${sellerId}/product/${id}`}
        className="block relative aspect-square w-full overflow-hidden bg-gray-50 dark:bg-gray-800"
      >
        <TwilioMediaDisplay
          mediaUrl={imageUrl || "/img1.jpg"}
          alt={displayTitle}
          width={400}
          height={400}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Floating Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {hasDiscount && isAvailable && (
            <Badge className="bg-rose-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-md shadow-sm border-none tracking-wide">
              SALE
            </Badge>
          )}
          {category && category !== "General" && (
            <span className="bg-black/75 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-md line-clamp-1 max-w-[130px] flex items-center gap-1 shadow-sm">
              <span>{CATEGORY_ICONS[category] || "🏷️"}</span>
              <span>{category}</span>
            </span>
          )}
        </div>

        {/* Out of Stock Overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-10">
            <span className="bg-gray-900/90 text-white font-bold text-xs uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-md border border-white/10">
              Sold Out
            </span>
          </div>
        )}

        {/* Quick View Pill on Hover */}
        <div className="absolute inset-x-0 bottom-2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
          <span className="inline-flex items-center gap-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-gray-800 dark:text-gray-200 text-[11px] font-semibold px-3 py-1 rounded-full shadow-md">
            <Eye className="w-3.5 h-3.5" /> Quick View
          </span>
        </div>
      </Link>

      {/* Product Information */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <Link href={`/${sellerId}/product/${id}`} className="block flex-1 group-hover:text-emerald-600 transition-colors">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug min-h-[2.4rem]">
            {displayTitle}
          </h3>
        </Link>

        {/* Price Row */}
        <div className="flex items-baseline gap-2 mt-2 pt-1 border-t border-gray-50 dark:border-gray-800/60">
          <span className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white">
            GH₵{price}
          </span>
          {hasDiscount && (
            <span className="text-[11px] text-gray-400 line-through">
              GH₵{compareAtPrice}
            </span>
          )}
        </div>

        {/* Compact Actions Row */}
        <div className="flex items-center gap-1.5 mt-3 pt-1">
          {/* Buy on WhatsApp */}
          {isAvailable ? (
            <Button
              asChild
              size="sm"
              onClick={handleChatToBuy}
              className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm shadow-emerald-600/20 px-2 sm:px-3"
            >
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="h-3.5 w-3.5 fill-current" />
                <span>Buy</span>
              </a>
            </Button>
          ) : (
            <Button
              disabled
              size="sm"
              className="flex-1 h-9 bg-gray-100 dark:bg-gray-800 text-gray-400 font-medium rounded-xl text-xs cursor-not-allowed"
            >
              Sold Out
            </Button>
          )}

          {/* Add to WhatsApp Bag Button (if callback provided) */}
          {onAddToCart && isAvailable && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleAddToCartClick}
              title={isInCart ? "Already in Bag (tap to add another)" : "Add to Bag"}
              className={`h-9 w-9 rounded-xl border transition-all ${
                addedJustNow || isInCart
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-600"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-emerald-500 hover:text-emerald-600"
              }`}
            >
              {addedJustNow ? (
                <Check className="h-4 w-4 text-emerald-600 animate-in zoom-in" />
              ) : (
                <ShoppingBag className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

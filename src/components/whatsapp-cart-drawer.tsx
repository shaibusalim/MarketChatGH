"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TwilioMediaDisplay } from "./TwilioMediaDisplay"
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  MessageCircle, 
  ArrowRight,
  Sparkles,
  ShoppingBag as BagIcon
} from "lucide-react"

export interface CartItem {
  id: string
  title: string
  price: string
  imageUrl: string
  quantity: number
}

interface WhatsAppCartDrawerProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  onUpdateQuantity: (id: string, newQty: number) => void
  onRemoveItem: (id: string) => void
  onClear: () => void
  sellerName: string
  sellerPhone?: string
  sellerId: string
}

export function WhatsAppCartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClear,
  sellerName,
  sellerPhone,
  sellerId,
}: WhatsAppCartDrawerProps) {
  const [customerNote, setCustomerNote] = useState("")

  // Parse numeric price safely
  const parsePrice = (priceStr: string) => {
    const numeric = parseFloat(priceStr.replace(/[^\d.]/g, ""))
    return isNaN(numeric) ? 0 : numeric
  }

  const totalAmount = items.reduce(
    (sum, item) => sum + parsePrice(item.price) * item.quantity,
    0
  )

  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  // Format clean Ghana WhatsApp phone number
  let cleanPhone = (sellerPhone || sellerId || "").replace(/\D/g, "")
  if (cleanPhone.startsWith("0")) {
    cleanPhone = "233" + cleanPhone.substring(1)
  } else if (cleanPhone.length > 0 && !cleanPhone.startsWith("233")) {
    cleanPhone = "233" + cleanPhone
  }

  const handleCheckoutWhatsApp = () => {
    if (items.length === 0) return

    const storeOrigin = typeof window !== "undefined" ? window.location.origin : "https://marketchat.site"
    const storeUrl = `${storeOrigin}/${sellerId}`

    const itemList = items
      .map(
        (item, idx) =>
          `${idx + 1}. *${item.title}*\n   Qty: ${item.quantity} × GH₵${parsePrice(item.price).toFixed(2)} = *GH₵${(
            parsePrice(item.price) * item.quantity
          ).toFixed(2)}*`
      )
      .join("\n\n")

    let message = `🛒 *NEW ORDER REQUEST*\nStore: *${sellerName}*\n\n`
    message += `I would like to order the following items:\n\n${itemList}\n\n`
    message += `━━━━━━━━━━━━━━━━━━━\n`
    message += `📦 *Total Items:* ${totalItemCount}\n`
    message += `💰 *Total Amount:* *GH₵${totalAmount.toFixed(2)}*\n`

    if (customerNote.trim()) {
      message += `📝 *Customer Note / Delivery:* ${customerNote.trim()}\n`
    }

    message += `━━━━━━━━━━━━━━━━━━━\n`
    message += `Ordered via MarketChatGH: ${storeUrl}`

    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`

    // Log lead in background
    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: items.map((i) => i.id).join(","),
        sellerId: sellerId,
        productDescription: `WhatsApp Bag (${totalItemCount} items)`,
        productPrice: `GH₵${totalAmount.toFixed(2)}`,
        type: "whatsapp_cart_checkout",
      }),
    }).catch((err) => console.error("Error logging cart lead:", err))

    window.open(whatsappUrl, "_blank", "noopener,noreferrer")
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-2xl">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <SheetTitle className="text-xl font-bold flex items-center gap-2">
                  WhatsApp Bag
                  {totalItemCount > 0 && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                      {totalItemCount}
                    </span>
                  )}
                </SheetTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ordering from <span className="font-semibold text-gray-800 dark:text-gray-200">{sellerName}</span>
                </p>
              </div>
            </div>

            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                Clear all
              </Button>
            )}
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 text-gray-300 dark:text-gray-600" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Your bag is empty</h4>
            <p className="text-xs text-muted-foreground max-w-xs mt-1 mb-6">
              Browse products and tap &quot;Add to Bag&quot; to order multiple items directly on WhatsApp.
            </p>
            <Button
              onClick={onClose}
              variant="outline"
              className="rounded-xl border-gray-200 dark:border-gray-700"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {items.map((item) => {
                  const itemPrice = parsePrice(item.price)
                  const lineTotal = itemPrice * item.quantity

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3.5 p-3 rounded-2xl bg-gray-50/70 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 group"
                    >
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0">
                        <TwilioMediaDisplay
                          mediaUrl={item.imageUrl}
                          alt={item.title}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">
                          {item.title}
                        </h5>
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          GH₵{itemPrice.toFixed(2)}
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          <div className="inline-flex items-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="px-2 py-1 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="px-2 text-xs font-bold text-gray-800 dark:text-gray-200">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-1 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <span className="text-[11px] text-muted-foreground ml-auto font-medium">
                            = GH₵{lineTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Delivery Note */}
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">
                  Delivery Details / Notes (Optional)
                </label>
                <Input
                  placeholder="e.g. Deliver to Osu, call 0244..., size 42"
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  className="rounded-xl text-xs h-10"
                />
              </div>
            </ScrollArea>

            <SheetFooter className="p-6 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-3 bg-white dark:bg-gray-900">
              <div className="w-full space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Total Items</span>
                  <span>{totalItemCount} items</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 dark:text-white pt-1 border-t border-gray-100 dark:border-gray-800">
                  <span>Estimated Total</span>
                  <span className="text-base text-emerald-600 dark:text-emerald-400 font-black">
                    GH₵{totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleCheckoutWhatsApp}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
              >
                <MessageCircle className="h-5 w-5 fill-current" />
                <span>Send Order to WhatsApp</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}


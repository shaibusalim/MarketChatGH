"use client"

import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TwilioMediaDisplay } from "@/components/TwilioMediaDisplay";
import { Star, MapPin, MessageCircle, Ban, ArrowLeft, Tag } from "lucide-react";
import Link from "next/link";

interface ProductPageClientProps {
  product: any;
  seller: any;
  sellerId: string;
}

export function ProductPageClient({ product, seller, sellerId }: ProductPageClientProps) {
  const displayTitle = product.title || product.name || (product.description ? product.description.split("\n")[0] : "Product");

  useEffect(() => {
    // Track product view (for counter and activity log)
    const trackView = async () => {
      try {
        fetch(`/api/products/${product.id}/view`, { method: "POST" }).catch(() => {});
        
        await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product.id,
            sellerId: sellerId,
            productDescription: displayTitle,
            productPrice: product.price,
            type: "product_view"
          }),
        });
      } catch (err) {
        console.error("[ProductPage] Error tracking view:", err);
      }
    };
    trackView();
  }, [product.id, sellerId, displayTitle, product.price]);

  const handleTrackLead = () => {
    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product.id,
        sellerId: sellerId,
        productDescription: displayTitle,
        productPrice: product.price,
        type: "chat_to_buy"
      }),
    }).catch(err => console.error("[ProductPage] Error tracking lead:", err));
  };

  // Format phone: remove non-digits, replace 0 with 233
  let cleanPhone = (seller.phone || sellerId || "").replace(/\D/g, "");
  if (cleanPhone.startsWith("0")) {
    cleanPhone = "233" + cleanPhone.substring(1);
  } else if (cleanPhone.length > 0 && cleanPhone.length < 10 && !cleanPhone.startsWith("233")) {
    cleanPhone = "233" + cleanPhone;
  }

  const productUrl = typeof window !== 'undefined' ? `${window.location.origin}/${sellerId}/product/${product.id}` : "";
  const whatsappMessage = `Hi, I found this on MarketChatGH: ${productUrl}. I'm interested in buying your "${displayTitle}" for GH₵${product.price}. Is it still available?`;
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;

  const hasDiscount = product.compareAtPrice && parseFloat(product.compareAtPrice.replace(/[^\d.]/g, '')) > parseFloat(product.price.replace(/[^\d.]/g, ''));

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-4">
        <Link 
          href={`/${sellerId}`} 
          className="inline-flex items-center text-xs font-bold text-gray-500 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to {seller.name}&apos;s Store
        </Link>
      </div>

      <Card className="shadow-lg border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden bg-white dark:bg-gray-900">
        <CardHeader className="p-6 sm:p-8 pb-4">
          {product.category && product.category !== "General" && (
            <div className="mb-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md">
                <Tag className="w-3 h-3" /> {product.category}
              </span>
            </div>
          )}
          <CardTitle className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            {displayTitle}
          </CardTitle>
          <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
            <MapPin className="w-3.5 h-3.5" />
            Sold by <strong className="text-gray-800 dark:text-gray-200">{seller.name}</strong> ({seller.location})
          </div>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 pt-0 flex flex-col lg:flex-row gap-8">
          {/* Product Image */}
          <div className="relative w-full lg:w-1/2">
            <div className="aspect-square relative rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800">
              <TwilioMediaDisplay
                mediaUrl={product.imageUrl}
                alt={displayTitle}
                width={500}
                height={500}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {product.isAvailable ? (
                <Badge className="bg-emerald-600 text-white font-black px-3 py-1 shadow-md border-none uppercase tracking-wider text-xs">
                  In Stock
                </Badge>
              ) : (
                <Badge className="bg-red-500 text-white font-black px-3 py-1 shadow-md border-none uppercase tracking-wider text-xs animate-pulse">
                  Out of Stock
                </Badge>
              )}
              {hasDiscount && (
                <Badge className="bg-rose-500 text-white font-black px-3 py-1 shadow-md border-none uppercase tracking-wider text-xs">
                  Sale Discount
                </Badge>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="flex-1 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Pricing */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Price</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">
                    GH₵{product.price}
                  </span>
                  {hasDiscount && (
                    <span className="text-lg text-gray-400 line-through">
                      GH₵{product.compareAtPrice}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Description</p>
                <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                  {product.description || "No description provided."}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500 pt-2">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {seller.rating && seller.rating > 0 ? seller.rating.toFixed(1) : "5.0"}
                  </span>
                </div>
                <span>&bull;</span>
                <span>Verified WhatsApp Merchant</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button 
                asChild={product.isAvailable}
                disabled={!product.isAvailable}
                className={`flex-1 py-6 rounded-2xl font-bold shadow-lg transition-all ${
                  product.isAvailable 
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25" 
                  : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed shadow-none"
                }`}
              >
                {product.isAvailable ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleTrackLead}
                    className="flex items-center justify-center text-sm"
                  >
                    <MessageCircle className="w-5 h-5 mr-2 fill-current" />
                    Chat to Buy on WhatsApp
                  </a>
                ) : (
                  <div className="flex items-center justify-center text-sm">
                    <Ban className="w-5 h-5 mr-2" />
                    Sold Out
                  </div>
                )}
              </Button>
              <Button asChild variant="outline" className="py-6 rounded-2xl border-gray-200 dark:border-gray-700">
                <Link href={`/${sellerId}`} className="flex items-center justify-center text-xs font-semibold">
                  Browse More Products
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

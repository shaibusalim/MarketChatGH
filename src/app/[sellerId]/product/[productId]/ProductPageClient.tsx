"use client"

import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TwilioMediaDisplay } from "@/components/TwilioMediaDisplay";
import { Star, MapPin, MessageCircle, Ban } from "lucide-react";
import Link from "next/link";

interface ProductPageClientProps {
  product: any;
  seller: any;
  sellerId: string;
}

export function ProductPageClient({ product, seller, sellerId }: ProductPageClientProps) {
  useEffect(() => {
    // Track product view (for counter and activity log)
    const trackView = async () => {
      try {
        // 1. Increment product view counter
        fetch(`/api/products/${product.id}/view`, { method: "POST" }).catch(() => {});
        
        // 2. Log activity in leads collection
        await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product.id,
            sellerId: sellerId,
            productDescription: product.description,
            productPrice: product.price,
            type: "product_view"
          }),
        });
      } catch (err) {
        console.error("[ProductPage] Error tracking view:", err);
      }
    };
    trackView();
  }, [product.id, sellerId, product.description, product.price]);

  const handleTrackLead = async () => {
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          sellerId: sellerId,
          productDescription: product.description,
          productPrice: product.price,
          type: "chat_to_buy"
        }),
      });
    } catch (err) {
      console.error("[ProductPage] Error tracking lead:", err);
    }
  };

  // Format phone: remove non-digits, replace 0 with 233
  let cleanPhone = (seller.phone || sellerId || "").replace(/\D/g, "");
  if (cleanPhone.startsWith("0")) {
    cleanPhone = "233" + cleanPhone.substring(1);
  } else if (cleanPhone.length > 0 && cleanPhone.length < 10 && !cleanPhone.startsWith("233")) {
    cleanPhone = "233" + cleanPhone;
  }

  const productUrl = typeof window !== 'undefined' ? `${window.location.origin}/${sellerId}/product/${product.id}` : "";
  const whatsappMessage = `Hi, I found this on MarketChatGH: ${productUrl}. I'm interested in buying your "${product.description}" for ${product.price}. Is it still available?`;
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <Card className="shadow-md border border-gray-100">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">
            {product.description}
          </CardTitle>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Sold by <strong>{seller.name}</strong> ({seller.location})
          </div>
        </CardHeader>
        <CardContent className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Product Image */}
          <div className="relative w-full lg:w-1/2">
            <div className="aspect-square relative rounded-md overflow-hidden">
              <TwilioMediaDisplay
                mediaUrl={product.imageUrl}
                alt={product.description}
                width={400}
                height={400}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {product.isAvailable ? (
                <Badge className="bg-emerald-500 text-white font-black px-3 py-1 shadow-lg border-none uppercase tracking-widest">In Stock</Badge>
              ) : (
                <Badge className="bg-red-500 text-white font-black px-3 py-1 shadow-lg border-none uppercase tracking-widest animate-pulse">Out of Stock</Badge>
              )}
              {product.status === "new" && (
                <Badge className="bg-blue-500 text-white font-black px-3 py-1 shadow-lg border-none uppercase tracking-widest">New</Badge>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="flex-1 space-y-6">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Price</h3>
              <p className="text-xl sm:text-2xl font-bold text-green-600">₵{product.price}</p>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Status</h3>
              <p className="text-gray-600">{product.status}</p>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Stock Status</h3>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-3 h-3 rounded-full ${product.isAvailable ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></div>
                <p className={`font-bold uppercase tracking-wider ${product.isAvailable ? "text-emerald-600" : "text-red-600"}`}>
                  {product.isAvailable ? "Available" : "Sold Out"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span className="text-gray-600">4.8 (Based on recent reviews)</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                asChild={product.isAvailable}
                disabled={!product.isAvailable}
                className={`flex-1 py-6 rounded-xl font-bold shadow-lg transition-all ${
                  product.isAvailable 
                  ? "bg-green-500 hover:bg-green-600 text-white shadow-green-500/20" 
                  : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed shadow-none"
                }`}
              >
                {product.isAvailable ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleTrackLead}
                    className="flex items-center justify-center"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Chat to Buy
                  </a>
                ) : (
                  <div className="flex items-center justify-center">
                    <Ban className="w-5 h-5 mr-2" />
                    Sold Out
                  </div>
                )}
              </Button>
              <Button asChild variant="outline" className="flex-1 py-6 rounded-xl border-2">
                <Link href={`/${sellerId}`} className="flex items-center justify-center">
                  Back to Store
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

"use client";

import { TwilioMediaDisplay } from "./TwilioMediaDisplay";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageCircle, Eye, ShoppingCart, Ban } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: {
    id: string;
    imageUrl: string;
    price: string;
    description: string;
    sellerId: string;
    isAvailable?: boolean;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { imageUrl, price, description, sellerId, id, isAvailable = true } = product;

  const handleChatToBuy = async (e: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!isAvailable) return;
    
    // Log lead
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: id,
          sellerId: sellerId,
          productDescription: description,
          productPrice: price,
        }),
      });
    } catch (err) {
      console.error("[ProductCard] Error tracking lead:", err);
    }

    const productUrl = `${window.location.origin}/${sellerId}/product/${id}`;
    const message = `Hi, I found this on MarketChatGH: ${productUrl}. I'm interested in buying your "${description}" for ${price}. Is it still available?`;
    const whatsappUrl = `https://wa.me/${sellerId}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Card className={`flex flex-col h-full overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 group border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl ${!isAvailable ? "opacity-75" : ""}`}>
      <Link href={`/${sellerId}/product/${id}`} className="block flex-grow">
        <CardHeader className="p-0 relative overflow-hidden">
          <div className={`relative w-full aspect-square group-hover:scale-105 transition-transform duration-500 ${!isAvailable ? "grayscale" : ""}`}>
            <TwilioMediaDisplay
              mediaUrl={imageUrl}
              alt={description}
              width={400}
              height={400}
              className="w-full h-full object-cover"
            />
            {!isAvailable && (
              <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center">
                <Badge className="bg-red-500/90 text-white font-black text-xs px-4 py-2 rounded-xl shadow-lg border-none animate-pulse">
                  SOLD OUT
                </Badge>
              </div>
            )}
          </div>
          <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm z-10">
            <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">₵{price}</span>
          </div>
          {isAvailable && (
            <div className="absolute top-3 left-3 bg-emerald-500/90 backdrop-blur-md px-3 py-1 rounded-sm shadow-sm z-10">
              <span className="text-white font-black text-[8px] uppercase tracking-widest">IN STOCK</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-base font-headline font-bold mb-2 leading-tight line-clamp-2 group-hover:text-green-600 transition-colors">
            {description}
          </CardTitle>
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button 
          asChild
          variant="outline"
          className="flex-1 border-gray-200 dark:border-gray-700 font-bold rounded-xl py-6 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <Link href={`/${sellerId}/product/${id}`}>
            <Eye className="mr-2 h-5 w-5" />
            View
          </Link>
        </Button>
        <Button 
          onClick={handleChatToBuy} 
          disabled={!isAvailable}
          className={`flex-1 font-bold rounded-xl shadow-lg py-6 ${
            isAvailable 
            ? "bg-green-500 hover:bg-green-600 text-white shadow-green-500/20" 
            : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed shadow-none"
          }`}
        >
          {isAvailable ? (
            <>
              <MessageCircle className="mr-2 h-5 w-5" />
              Buy
            </>
          ) : (
            <>
              <Ban className="mr-2 h-5 w-5" />
              Sold Out
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

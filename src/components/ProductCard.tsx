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
import { MessageCircle, Eye } from "lucide-react";

interface ProductCardProps {
  product: {
    id: string;
    imageUrl: string;
    price: string;
    description: string;
    sellerId: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { imageUrl, price, description, sellerId, id } = product;

  const handleChatToBuy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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
    <Card className="flex flex-col h-full overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 group border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl">
      <Link href={`/${sellerId}/product/${id}`} className="block flex-grow">
        <CardHeader className="p-0 relative overflow-hidden">
          <div className="relative w-full aspect-square group-hover:scale-105 transition-transform duration-500">
            <TwilioMediaDisplay
              mediaUrl={imageUrl}
              alt={description}
              width={400}
              height={400}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
            <span className="text-green-600 dark:text-green-400 font-bold text-sm">{price}</span>
          </div>
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
          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 py-6"
        >
          <MessageCircle className="mr-2 h-5 w-5" />
          Buy
        </Button>
      </CardFooter>
    </Card>
  );
}

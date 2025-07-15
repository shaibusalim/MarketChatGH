"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

interface ProductCardProps {
  product: {
    imageUrl: string;
    price: string;
    description: string;
    sellerId: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { imageUrl, price, description, sellerId } = product;

  const handleChatToBuy = () => {
    const message = `I'm interested in buying your product: "${description}" for ${price}. Is it still available?`;
    const whatsappUrl = `https://wa.me/${sellerId}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-0">
        <div className="relative w-full aspect-square">
          <Image
            src={imageUrl}
            alt={description}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            data-ai-hint="product image"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-headline font-bold mb-1 leading-tight">{description}</CardTitle>
        <CardDescription className="text-primary font-bold text-xl">{price}</CardDescription>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button onClick={handleChatToBuy} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
          <MessageCircle className="mr-2 h-5 w-5" />
          Chat to Buy
        </Button>
      </CardFooter>
    </Card>
  );
}

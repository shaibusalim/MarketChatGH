import { adminFirestore } from "@/lib/firebase-admin";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TwilioMediaDisplay } from "@/components/TwilioMediaDisplay";
import { Star, Package, MapPin, MessageCircle, Share2, ShieldCheck, ShoppingBag, ArrowLeft, Info, Loader2 } from "lucide-react";
import Link from "next/link";
import { ProductPageClient } from "./ProductPageClient";

interface Product {
  id: string;
  imageUrl: string;
  price: string;
  description: string;
  sellerId: string;
  status: string;
  stockStatus: string;
  isAvailable: boolean;
}

interface Seller {
  name: string;
  location: string;
  phone?: string;
}

interface ProductPageProps {
  params: Promise<{ sellerId: string; productId: string }>;
}

async function getProductAndSeller(slugOrId: string, productId: string): Promise<{ product: Product | null; seller: Seller | null; sellerId: string | null }> {
  try {
    const productDoc = await adminFirestore.collection("products").doc(productId).get();
    if (!productDoc.exists) {
      return { product: null, seller: null, sellerId: null };
    }

    const productData = productDoc.data()!;
    const actualSellerId = productData.sellerId;

    // Check if the provided slugOrId matches the actualSellerId or the seller's slug
    const sellerDoc = await adminFirestore.collection("sellers").doc(actualSellerId).get();
    if (!sellerDoc.exists) {
      return { product: null, seller: null, sellerId: null };
    }

    const sellerData = sellerDoc.data()!;
    if (actualSellerId !== slugOrId && sellerData.slug !== slugOrId) {
      return { product: null, seller: null, sellerId: null };
    }

    const product: Product = {
      id: productDoc.id,
      imageUrl: productData.imageUrl ?? "/img1.jpg",
      price: productData.price ?? "Price not specified",
      description: productData.description ?? "No description",
      sellerId: productData.sellerId ?? "",
      status: productData.status ?? "unknown",
      stockStatus: productData.stockStatus ?? "unknown",
      isAvailable: productData.isAvailable ?? false,
    };

    const seller: Seller = {
      name: sellerData.name ?? "Unnamed Seller",
      location: sellerData.location ?? "Unknown",
      phone: sellerData.phone ?? "",
    };

    return { product, seller, sellerId: actualSellerId };
  } catch (error) {
    console.error("Error fetching product or seller:", error);
    return { product: null, seller: null, sellerId: null };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { sellerId: slugOrId, productId } = await params;
  const { product, seller, sellerId } = await getProductAndSeller(slugOrId, productId);

  if (!product || !seller) {
    notFound();
  }

  return (
    <ProductPageClient 
      product={product} 
      seller={seller} 
      sellerId={sellerId || ""} 
    />
  );
}

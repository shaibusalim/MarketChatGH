import { adminFirestore } from "@/lib/firebase-admin";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TwilioMediaDisplay } from "@/components/TwilioMediaDisplay";
import { Star, Package, MapPin } from "lucide-react";
import Link from "next/link";

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
}

interface ProductPageProps {
  params: Promise<{ sellerId: string; productId: string }>;
}

async function getProductAndSeller(sellerId: string, productId: string): Promise<{ product: Product | null; seller: Seller | null }> {
  try {
    const productDoc = await adminFirestore.collection("products").doc(productId).get();
    if (!productDoc.exists || productDoc.data()?.sellerId !== sellerId) {
      return { product: null, seller: null };
    }

    const productData = productDoc.data()!;
    const product: Product = {
      id: productDoc.id,
      imageUrl: productData.imageUrl ?? "/placeholder-product.jpg",
      price: productData.price ?? "Price not specified",
      description: productData.description ?? "No description",
      sellerId: productData.sellerId ?? "",
      status: productData.status ?? "unknown",
      stockStatus: productData.stockStatus ?? "unknown",
      isAvailable: productData.isAvailable ?? false,
    };

    const sellerDoc = await adminFirestore.collection("sellers").doc(sellerId).get();
    const seller: Seller | null = sellerDoc.exists
      ? {
          name: sellerDoc.data()!.name ?? "Unnamed Seller",
          location: sellerDoc.data()!.location ?? "Unknown",
        }
      : null;

    return { product, seller };
  } catch (error) {
    console.error("Error fetching product or seller:", error);
    return { product: null, seller: null };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { sellerId, productId } = await params;
  const { product, seller } = await getProductAndSeller(sellerId, productId);

  if (!product || !seller) {
    notFound();
  }

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
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {!product.isAvailable && (
                <Badge className="bg-red-500 text-white">Out of Stock</Badge>
              )}
              {product.status === "new" && (
                <Badge className="bg-green-500 text-white">New</Badge>
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
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Stock</h3>
              <p className="text-gray-600">{product.stockStatus}</p>
            </div>

            <div className="flex items-center gap-4">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span className="text-gray-600">4.8 (Based on recent reviews)</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="flex-1 bg-green-500 hover:bg-green-600 text-white">
                <a
                  href={`https://wa.me/${sellerId}?text=I'm%20interested%20in%20buying%20your%20product:%20"${encodeURIComponent(
                    product.description
                  )}"%20for%20${encodeURIComponent(product.price)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Contact Seller
                </a>
              </Button>
              <Button asChild variant="outline" className="flex-1">
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
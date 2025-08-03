import { adminFirestore } from "@/lib/firebase-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// --- Types ---
interface Product {
  id: string;
  imageUrl: string;
  price: string;
  description: string;
}

interface Seller {
  id: string;
  name: string;
  products: Product[];
}

// --- Firestore query ---
async function getSellersWithProducts(): Promise<Seller[]> {
  const sellersSnapshot = await adminFirestore.collection("sellers").get();
  const sellers: Seller[] = [];

  for (const sellerDoc of sellersSnapshot.docs) {
    const sellerData = sellerDoc.data();
    const productsSnapshot = await adminFirestore
      .collection("products")
      .where("sellerId", "==", sellerDoc.id)
      .limit(3)
      .get();

    const products = productsSnapshot.docs.map((productDoc) => {
      const productData = productDoc.data();
      return {
        id: productDoc.id,
        imageUrl: productData.imageUrl ?? "/placeholder-product.jpg",
        price: productData.price ?? "N/A",
        description: productData.description ?? "No description",
      };
    });

    sellers.push({
      id: sellerDoc.id,
      name: sellerData.name ?? "Unnamed Seller",
      products,
    });
  }

  return sellers;
}

// --- Sellers page component ---
export default async function SellersPage() {
  const sellers = await getSellersWithProducts();

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-900 dark:to-blue-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          Our Sellers
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sellers.map((seller) => (
            <Card key={seller.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-2xl border border-gray-100 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {seller.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {seller.products.map((product) => (
                    <div key={product.id} className="relative aspect-square rounded-lg overflow-hidden">
                      <img
                        src={product.imageUrl}
                        alt={product.description}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <Link href={`/${seller.id}`}>
                    Shop from {seller.name}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}

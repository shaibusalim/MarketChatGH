import { firestore } from "@/lib/firebase";
import ProductCard from "@/components/ProductCard";
import { Store, Frown } from "lucide-react";
import admin from "firebase-admin";

interface Product {
  id: string;
  imageUrl: string;
  price: string;
  description: string;
  sellerId: string;
  createdAt: admin.firestore.Timestamp;
}

async function getSellerProducts(sellerId: string): Promise<Product[]> {
  if (!firestore) {
    console.error("Firestore is not initialized.");
    return [];
  }

  const productsSnapshot = await firestore
    .collection("products")
    .where("sellerId", "==", sellerId)
    .orderBy("createdAt", "desc")
    .get();

  if (productsSnapshot.empty) {
    return [];
  }

  return productsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Product, "id">),
  }));
}

export async function generateMetadata({ params }: { params: { sellerId: string } }) {
  return {
    title: `Shop of ${params.sellerId}`,
    description: `Browse products from seller ${params.sellerId} on MarketChat GH.`,
  }
}

export default async function SellerPage({
  params,
}: {
  params: { sellerId: string };
}) {
  const products = await getSellerProducts(params.sellerId);

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="text-center mb-10">
        <div className="inline-block bg-secondary p-4 rounded-full mb-4">
          <Store className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold font-headline">
          Welcome to this Shop
        </h1>
        <p className="text-muted-foreground mt-2">
          Seller ID: +{params.sellerId}
        </p>
      </header>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-secondary rounded-lg">
            <Frown className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold font-headline">No Products Yet</h2>
          <p className="text-muted-foreground mt-2">
            This seller hasn't added any products. Check back later!
          </p>
        </div>
      )}
    </main>
  );
}

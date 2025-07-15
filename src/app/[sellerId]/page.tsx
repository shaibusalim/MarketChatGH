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
  createdAt: admin.firestore.Timestamp | Date;
}

const demoProducts: Product[] = [
  {
    id: "demo-1",
    description: "Authentic Kente Cloth",
    price: "₵150",
    imageUrl: "https://placehold.co/600x600.png",
    sellerId: "demo",
    createdAt: new Date(),
  },
];

async function getSellerProducts(sellerId: string): Promise<Product[]> {
  if (sellerId === "demo") {
    return demoProducts;
  }

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
    ...(doc.data() as Omit<Product, "id" | "createdAt">),
    createdAt: doc.data().createdAt as admin.firestore.Timestamp,
  }));
}

export async function generateMetadata({ params }: { params: { sellerId: string } }) {
  if (params.sellerId === "demo") {
    return {
      title: "Demo Store",
      description: "A demonstration store for MarketChat GH.",
    };
  }

  return {
    title: `Shop of ${params.sellerId}`,
    description: `Browse products from seller ${params.sellerId} on MarketChat GH.`,
  };
}

export default async function SellerPage({ params }: { params: { sellerId: string } }) {
  const products = await getSellerProducts(params.sellerId);
  const isDemo = params.sellerId === "demo";

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="text-center mb-10">
        <div className="inline-block bg-secondary p-4 rounded-full mb-4">
          <Store className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold font-headline">
          {isDemo ? "Welcome to the Demo Store" : "Welcome to this Shop"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isDemo ? "This is a sample store to showcase MarketChat GH." : `Seller ID: +${params.sellerId}`}
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

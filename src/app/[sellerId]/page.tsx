import { firestore } from "@/lib/firebase";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";

interface Product {
  id: string;
  imageUrl: string;
  price: string;
  description: string;
  status: string;
  stockStatus: string;
  isAvailable: boolean;
  sellerId: string;
  createdAt: Date;
}

async function getSellerProducts(sellerId: string): Promise<Product[]> {
  const productsSnapshot = await firestore
    .collection("products")
    .where("sellerId", "==", sellerId)
    .orderBy("createdAt", "desc")
    .get();

  if (productsSnapshot.empty) {
    return [];
  }

  return productsSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      imageUrl: data.imageUrl,
      price: data.price,
      description: data.description,
      status: data.status,
      stockStatus: data.stockStatus,
      isAvailable: data.isAvailable,
      sellerId: data.sellerId,
      createdAt: data.createdAt.toDate(),
    };
  });
}

async function isSellerActive(sellerId: string): Promise<boolean> {
  const sellerDoc = await firestore.collection("sellers").doc(sellerId).get();
  return sellerDoc.exists ? sellerDoc.data()?.active ?? true : true;
}

export async function generateMetadata({ params }: { params: { sellerId: string } }) {
  const sellerId = params.sellerId;

  return {
    title: `Shop of ${sellerId}`,
    description: `Browse products from seller ${sellerId} on MarketChat GH.`,
  };
}

export default async function SellerPage({ params }: { params: { sellerId: string } }) {
  const sellerId = params.sellerId;

  const active = await isSellerActive(sellerId);
  if (!active) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">🚫 Store Locked</h2>
          <p className="text-muted-foreground">
            This store has been deactivated by the admin. Please contact support for more info.
          </p>
        </div>
      </div>
    );
  }

  const products = await getSellerProducts(sellerId);

  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Seller: {sellerId}</h1>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col hover:scale-105 transition-transform duration-300"
            >
              <Image
                src={product.imageUrl}
                alt={product.description}
                width={400}
                height={400}
                className="object-cover w-full h-56"
              />

              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-lg font-bold mb-2">{product.description}</h3>
                <p className="text-green-600 font-semibold text-lg mb-2">{product.price}</p>

                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    {product.status}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    {product.stockStatus}
                  </Badge>
                  <Badge variant="outline" className={product.isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {product.isAvailable ? "Available" : "Unavailable"}
                  </Badge>
                </div>

                <Link
                  href={`/${sellerId}/product/${product.id}`}
                  className="text-blue-600 hover:underline text-sm mb-2"
                >
                  View Details
                </Link>

                <a
                  href={`https://wa.me/${sellerId}?text=I'm%20interested%20in%20buying%20your%20product:%20"${encodeURIComponent(
                    product.description
                  )}"%20for%20${encodeURIComponent(product.price)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-block bg-green-500 text-white text-center px-4 py-2 rounded hover:bg-green-600"
                >
                  Contact Seller
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center mt-20">
          <h2 className="text-xl font-bold">No products found</h2>
          <p className="text-muted-foreground">Seller hasn't added any products yet.</p>
        </div>
      )}
    </main>
  );
}

import { NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebase-admin";

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

interface SellerInfo {
  name: string;
  location: string;
  active: boolean;
}

interface SellerResponse {
  seller: SellerInfo | null;
  products: Product[];
}

export async function GET(request: Request, { params }: { params: Promise<{ sellerId: string }> }) {
  const { sellerId } = await params;

  try {
    // Fetch seller info
    const sellerDoc = await adminFirestore.collection("sellers").doc(sellerId).get();
    let seller: SellerInfo | null = null;
    if (sellerDoc.exists) {
      const data = sellerDoc.data();
      seller = {
        name: data?.name ?? "Unnamed Seller",
        location: data?.location ?? "Unknown",
        active: data?.active ?? true,
      };
    }

    // Fetch products
    const productsSnapshot = await adminFirestore
      .collection("products")
      .where("sellerId", "==", sellerId)
      .get();
    const products: Product[] = productsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        imageUrl: data.imageUrl ?? "/placeholder-product.jpg",
        price: data.price ?? "Price not specified",
        description: data.description ?? "No description",
        sellerId: data.sellerId ?? "",
        status: data.status ?? "unknown",
        stockStatus: data.stockStatus ?? "unknown",
        isAvailable: data.isAvailable ?? false,
      };
    });

    return NextResponse.json({ seller, products });
  } catch (error) {
    console.error("Error fetching seller data:", error);
    return NextResponse.json({ error: "Failed to fetch seller data" }, { status: 500 });
  }
}
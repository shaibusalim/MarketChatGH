import { adminFirestore } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { cache } from "react";

// --- Types ---
interface Product {
  id: string;
  imageUrl: string;
  price: string;
  description: string;
  sellerId: string;
  createdAt: string;
  status: string;
  stockStatus: string;
  isAvailable: boolean;
}

interface Seller {
  id: string;
  name: string;
  location: string;
  active: boolean;
  products: Product[];
}

// --- Cached Firestore query ---
const getSellersAndProducts = cache(async (
  searchQuery: string = "",
  page: number = 1,
  pageSize: number = 10,
  startAfterDocId?: string
): Promise<{ sellers: Seller[]; total: number; lastDocId?: string }> => {
  console.log(`[API] Fetching sellers with query: ${searchQuery}, page: ${page}, startAfter: ${startAfterDocId}`);

  try {
    let sellersQuery = adminFirestore.collection("sellers").orderBy("name").limit(pageSize);
    if (startAfterDocId) {
      const startAfterDoc = await adminFirestore.collection("sellers").doc(startAfterDocId).get();
      if (!startAfterDoc.exists) {
        console.warn(`[API] StartAfter document ${startAfterDocId} does not exist`);
        return { sellers: [], total: 0, lastDocId: undefined };
      }
      sellersQuery = sellersQuery.startAfter(startAfterDoc);
    }
    if (searchQuery) {
      console.log(`[API] Applying search filter: ${searchQuery}`);
      sellersQuery = sellersQuery
        .where("name", ">=", searchQuery)
        .where("name", "<=", searchQuery + "\uf8ff");
    }

    const sellersSnapshot = await sellersQuery.get();
    console.log(`[API] Fetched ${sellersSnapshot.size} sellers`);

    const productsSnapshot = await adminFirestore.collection("products").get();
    console.log(`[API] Fetched ${productsSnapshot.size} products`);

    const sellers: Seller[] = [];
    sellersSnapshot.forEach((sellerDoc) => {
      const sellerId = sellerDoc.id;
      const data = sellerDoc.data();
      console.log(`[API] Processing seller: ${sellerId}, data:`, data);

      const products = productsSnapshot.docs
        .filter((p) => p.data().sellerId === sellerId)
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            imageUrl: data.imageUrl ?? "/placeholder-product.jpg",
            price: data.price ?? "Price not specified",
            description: data.description ?? "No description",
            sellerId: data.sellerId ?? "",
            createdAt: data.createdAt?.toDate?.().toISOString() ?? new Date().toISOString(),
            status: data.status ?? "unknown",
            stockStatus: data.stockStatus ?? "unknown",
            isAvailable: data.isAvailable ?? false,
          } as Product;
        });
      console.log(`[API] Found ${products.length} products for seller ${sellerId}`);

      sellers.push({
        id: sellerId,
        name: data.name ?? "Unnamed Seller",
        location: data.location ?? "Unknown",
        active: data.active ?? true,
        products,
      });
    });

    const lastDoc = sellersSnapshot.docs[sellersSnapshot.docs.length - 1];
    const lastDocId = lastDoc?.id;
    const totalSnapshot = await adminFirestore.collection("sellers").get();
    const total = totalSnapshot.size;
    console.log(`[API] Total sellers in collection: ${total}, lastDocId: ${lastDocId}`);

    return { sellers, total, lastDocId };
  } catch (error) {
    console.error("[API] Error in getSellersAndProducts:", error);
    throw new Error(`Failed to fetch sellers: ${(error as Error).message}`);
  }
});

export async function GET(request: Request) {
  console.log("[API] GET /api/sellers route accessed");
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1", 10) || 1;
    const pageSize = 10;
    const startAfterDocId = searchParams.get("startAfterDoc") || undefined;

    console.log(`[API] GET /api/sellers called with params: q=${q}, page=${page}, startAfterDoc=${startAfterDocId}`);

    const { sellers, total, lastDocId } = await getSellersAndProducts(q, page, pageSize, startAfterDocId);

    return NextResponse.json({ sellers, total, lastDocId }, { status: 200 });
  } catch (error) {
    console.error("[API] Error in GET /api/sellers:", error);
    return NextResponse.json({ error: "Failed to fetch sellers", details: (error as Error).message }, { status: 500 });
  }
}
import { NextResponse } from "next/server"
import { adminFirestore } from "@/lib/firebase-admin"
import type FirebaseFirestore from "firebase-admin/firestore"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

// --- Types ---
interface Product {
  id: string
  imageUrl: string
  price: string
  description: string
  sellerId: string
  createdAt: string
  status: string
  stockStatus: string
  isAvailable: boolean
}

interface SellerInfo {
  id: string
  name: string
  location: string
  active: boolean
  phone?: string // Added to support WhatsApp links
  rating?: number // Added for seller ratings
  reviewCount?: number // Added for seller review count
}

interface SellerResponse {
  seller: SellerInfo | null
  products: Product[]
}

// --- Firestore query ---
const getSellerAndProducts = async (
  slugOrId: string,
  productQ = "",
  productStatus = "all",
): Promise<SellerResponse> => {
 
  try {
    // Try to fetch seller by ID first
    let sellerDoc = await adminFirestore.collection("sellers").doc(slugOrId).get()
    let seller: SellerInfo | null = null
    let actualSellerId = slugOrId;

    if (!sellerDoc.exists) {
      // If not found by ID, try to fetch by slug
      const sellersBySlug = await adminFirestore.collection("sellers").where("slug", "==", slugOrId).limit(1).get();
      if (!sellersBySlug.empty) {
        sellerDoc = sellersBySlug.docs[0];
        actualSellerId = sellerDoc.id;
      }
    }

    if (sellerDoc.exists) {
      const data = sellerDoc.data()
      console.log(`[API] Seller data:`, data)
      seller = {
        id: sellerDoc.id,
        name: data?.name ?? "Unnamed Seller",
        location: data?.location ?? "Unknown",
        active: data?.active ?? true,
        phone: data?.phone ?? "", // Pass phone number to client
        rating: data?.rating ?? 0, // Retrieve rating
        reviewCount: data?.reviewCount ?? 0, // Retrieve review count
      }
    }

    // Fetch products with filters using the actual doc ID
    let productsQuery: FirebaseFirestore.Query = adminFirestore.collection("products").where("sellerId", "==", actualSellerId)

    if (productQ) {
      // Basic prefix search for description
      productsQuery = productsQuery.where("description", ">=", productQ).where("description", "<=", productQ + "\uf8ff")
    }

    if (productStatus === "available") {
      productsQuery = productsQuery.where("isAvailable", "==", true)
    } else if (productStatus === "outOfStock") {
      productsQuery = productsQuery.where("isAvailable", "==", false)
    }

    const productsSnapshot = await productsQuery.get()
   

    const products: Product[] = productsSnapshot.docs.map((doc) => {
      const data = doc.data()
      const imageUrl = data.imageUrl ?? "/img1.jpg"
      if (!data.imageUrl) {
        console.warn(`[API] Product ${doc.id} missing imageUrl, using fallback. Data:`, {
          id: doc.id,
          description: data.description?.substring(0, 50),
          sellerId: data.sellerId,
          hasMediaReference: !!data.mediaReference,
        })
      }
      return {
        id: doc.id,
        imageUrl,
        price: data.price ?? "Price not specified",
        description: data.description ?? "No description",
        sellerId: data.sellerId ?? "",
        createdAt: data.createdAt?.toDate?.().toISOString() ?? new Date().toISOString(),
        status: data.status ?? "unknown",
        stockStatus: data.stockStatus ?? "unknown",
        isAvailable: data.isAvailable ?? false,
        views: data.views ?? 0,
      }
    })

    return { seller, products }
  } catch (error) {
    console.error("Error in getSellerAndProducts:", error);
    throw error;
  }
}

export async function GET(request: Request, props: { params: Promise<{ sellerId: string }> }) {
  const params = await props.params;
  try {
    const { sellerId } = params
    const { searchParams } = new URL(request.url)
    const productQ = searchParams.get("productQ") || ""
    const productStatus = searchParams.get("productStatus") || "all"

   

    const response = await getSellerAndProducts(sellerId, productQ, productStatus)
    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error("[API] Error in GET /api/sellers/[sellerId]:", error)
    return NextResponse.json(
      { error: "Failed to fetch seller data", details: (error as Error).message },
      { status: 500 },
    )
  }
}

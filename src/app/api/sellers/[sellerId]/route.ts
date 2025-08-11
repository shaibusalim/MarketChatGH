import { NextResponse } from "next/server"
import { adminFirestore } from "@/lib/firebase-admin"
import type  FirebaseFirestore  from "firebase-admin/firestore"

export const dynamic = "force-dynamic" // Ensure this API route is dynamic

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
  rating?: number // Added for seller ratings
  reviewCount?: number // Added for seller review count
}

interface SellerResponse {
  seller: SellerInfo | null
  products: Product[]
}

// --- Firestore query ---
const getSellerAndProducts = async (
  sellerId: string,
  productQ = "",
  productStatus = "all",
): Promise<SellerResponse> => {
  console.log(`[API] Fetching seller with ID: ${sellerId}`)
  try {
    // Fetch seller info
    const sellerDoc = await adminFirestore.collection("sellers").doc(sellerId).get()
    let seller: SellerInfo | null = null
    if (sellerDoc.exists) {
      const data = sellerDoc.data()
      console.log(`[API] Seller data:`, data)
      seller = {
        id: sellerDoc.id,
        name: data?.name ?? "Unnamed Seller",
        location: data?.location ?? "Unknown",
        active: data?.active ?? true,
        rating: data?.rating ?? 0, // Retrieve rating
        reviewCount: data?.reviewCount ?? 0, // Retrieve review count
      }
    } else {
      console.log(`[API] No seller found for ID: ${sellerId}`)
    }

    // Fetch products with filters
    let productsQuery: FirebaseFirestore.Query = adminFirestore.collection("products").where("sellerId", "==", sellerId)

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
    console.log(`[API] Fetched ${productsSnapshot.size} products for seller ${sellerId} with filters.`)

    const products: Product[] = productsSnapshot.docs.map((doc) => {
      const data = doc.data()
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
      }
    })

    return { seller, products }
  } catch (error) {
    console.error(`[API] Error fetching seller data for sellerId ${sellerId}:`, error)
    throw new Error("Failed to fetch seller data")
  }
}

export async function GET(request: Request, { params }: { params: { sellerId: string } }) {
  console.log("[API] GET /api/sellers/[sellerId] route accessed")
  try {
    const { sellerId } = params
    const { searchParams } = new URL(request.url)
    const productQ = searchParams.get("productQ") || ""
    const productStatus = searchParams.get("productStatus") || "all"

    console.log(
      `[API] GET /api/sellers/[sellerId] called with params: sellerId=${sellerId}, productQ=${productQ}, productStatus=${productStatus}`,
    )

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

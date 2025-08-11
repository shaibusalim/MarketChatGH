import { adminFirestore } from "@/lib/firebase-admin"
import { NextResponse } from "next/server"
import type { firestore as FirebaseFirestoreNS } from "firebase-admin"
type FirebaseFirestore = FirebaseFirestoreNS.Firestore

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

interface Seller {
  id: string
  name: string
  location: string
  active: boolean
  products: Product[]
}

// --- Firestore query function ---
async function fetchPaginatedSellers(
  searchQuery = "",
  page = 1,
  pageSize = 10,
): Promise<{ sellers: Seller[]; total: number }> {
  console.log(`[API] Fetching sellers with query: '${searchQuery}', page: ${page}, pageSize: ${pageSize}`)
  try {
    let baseSellersQuery: FirebaseFirestore.Query = adminFirestore.collection("sellers")

    // Apply search filter if query is provided
    if (searchQuery) {
      console.log(`[API] Applying search filter: '${searchQuery}'`)
      baseSellersQuery = baseSellersQuery.where("name", ">=", searchQuery).where("name", "<=", searchQuery + "\uf8ff")
    }

    // Get total count for pagination (before applying offset/limit)
    const totalSnapshot = await baseSellersQuery.count().get()
    const total = totalSnapshot.data().count
    console.log(`[API] Total sellers matching query: ${total}`)

    // Apply ordering for consistent pagination
    const paginatedSellersQuery = baseSellersQuery.orderBy("name")

    // Calculate offset for pagination
    const offset = (page - 1) * pageSize
    console.log(`[API] Calculated offset: ${offset}`)

    // Apply offset and limit for the current page
    const sellersSnapshot = await paginatedSellersQuery.offset(offset).limit(pageSize).get()
    console.log(`[API] Fetched ${sellersSnapshot.docs.length} sellers documents for page ${page}.`)

    const sellers: Seller[] = []
    for (const sellerDoc of sellersSnapshot.docs) {
      const sellerId = sellerDoc.id
      const data = sellerDoc.data()
      console.log(`[API] Processing seller: ${sellerId}, data:`, data)

      // Fetch ALL products for each seller (no limit applied here)
      const productsSnapshot = await adminFirestore.collection("products").where("sellerId", "==", sellerId).get() // Removed .limit(3)
      console.log(`[API] Fetched ${productsSnapshot.docs.length} products for seller ${sellerId} (for chart accuracy).`)

      const products = productsSnapshot.docs.map((productDoc) => {
        const productData = productDoc.data()
        return {
          id: productDoc.id,
          imageUrl: productData.imageUrl ?? "/placeholder-product.png",
          price: productData.price ?? "N/A",
          description: productData.description ?? "No description",
          sellerId: productData.sellerId ?? "",
          createdAt: productData.createdAt?.toDate?.().toISOString() ?? new Date().toISOString(),
          status: productData.status ?? "unknown",
          stockStatus: productData.stockStatus ?? "unknown",
          isAvailable: productData.isAvailable ?? false,
        } as Product
      })
      console.log(`[API] Processed ${products.length} products for seller ${sellerId}.`)

      sellers.push({
        id: sellerId,
        name: data.name ?? "Unnamed Seller",
        location: data.location ?? "Unknown",
        active: data.active ?? true,
        products,
      })
    }

    console.log(`[API] Returning ${sellers.length} sellers for the current page.`)
    return { sellers, total }
  } catch (error) {
    console.error("[API] Error in fetchPaginatedSellers:", error)
    throw new Error(`Failed to fetch sellers: ${(error as Error).message}`)
  }
}

// --- Function to fetch ALL sellers (for chart) ---
async function fetchAllSellers(): Promise<{ sellers: Seller[] }> {
  console.log(`[API] Fetching all sellers for chart`)
  try {
    const sellersSnapshot = await adminFirestore.collection("sellers").orderBy("name").get()
    console.log(`[API] Fetched ${sellersSnapshot.docs.length} total sellers documents.`)

    const sellers: Seller[] = []
    for (const sellerDoc of sellersSnapshot.docs) {
      const sellerId = sellerDoc.id
      const data = sellerDoc.data()

      const productsSnapshot = await adminFirestore.collection("products").where("sellerId", "==", sellerId).get()
      const products = productsSnapshot.docs.map((productDoc) => {
        const productData = productDoc.data()
        return {
          id: productDoc.id,
          imageUrl: productData.imageUrl ?? "/placeholder-product.png",
          price: productData.price ?? "N/A",
          description: productData.description ?? "No description",
          sellerId: productData.sellerId ?? "",
          createdAt: productData.createdAt?.toDate?.().toISOString() ?? new Date().toISOString(),
          status: productData.status ?? "unknown",
          stockStatus: productData.stockStatus ?? "unknown",
          isAvailable: productData.isAvailable ?? false,
        } as Product
      })

      sellers.push({
        id: sellerId,
        name: data.name ?? "Unnamed Seller",
        location: data.location ?? "Unknown",
        active: data.active ?? true,
        products,
      })
    }
    return { sellers }
  } catch (error) {
    console.error("[API] Error in fetchAllSellers:", error)
    throw new Error(`Failed to fetch all sellers: ${(error as Error).message}`)
  }
}

export async function GET(request: Request) {
  console.log("[API] GET /api/sellers route accessed")
  try {
    const { searchParams } = new URL(request.url)
    const fetchAll = searchParams.get("all") === "true"

    if (fetchAll) {
      console.log("[API] 'all=true' detected, fetching all sellers.")
      const { sellers } = await fetchAllSellers()
      return NextResponse.json({ sellers, total: sellers.length }, { status: 200 })
    }

    const q = searchParams.get("q") || ""
    const page = Number.parseInt(searchParams.get("page") || "1", 10) || 1
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "10", 10) || 10

    console.log(`[API] GET /api/sellers called with params: q=${q}, page=${page}, pageSize=${pageSize}`)
    const { sellers, total } = await fetchPaginatedSellers(q, page, pageSize)

    return NextResponse.json({ sellers, total }, { status: 200 })
  } catch (error) {
    console.error("[API] Error in GET /api/sellers:", error)
    return NextResponse.json({ error: "Failed to fetch sellers", details: (error as Error).message }, { status: 500 })
  }
}

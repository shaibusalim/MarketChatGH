import { adminFirestore } from "@/lib/firebase-admin"
import { NextResponse } from "next/server"
import type { firestore as FirebaseFirestoreNS } from "firebase-admin"
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth.config'
export const runtime = 'nodejs'

type FirebaseFirestore = FirebaseFirestoreNS.Firestore

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
  views?: number
}

interface Seller {
  id: string
  name: string
  email?: string
  phone?: string
  slug?: string
  location: string
  active: boolean
  isApproved: boolean
  approvalStatus?: string
  isRejected?: boolean
  products: Product[]
}

// --- Firestore query function ---
async function fetchPaginatedSellers(
  searchQuery = "",
  page = 1,
  pageSize = 10,
  status = "all",
): Promise<{ sellers: Seller[]; total: number }> {

  try {
    // Specialized handling for pending sellers: excludes any rejected sellers
    if (status === "pending") {
      const snapshot = await adminFirestore.collection("sellers").where("isApproved", "==", false).get()
      
      let pendingDocs = snapshot.docs.filter((doc) => {
        const d = doc.data()
        return d.approvalStatus !== "rejected" && d.isRejected !== true
      })

      if (searchQuery) {
        const qLower = searchQuery.toLowerCase()
        pendingDocs = pendingDocs.filter((doc) => {
          const name = (doc.data().name || "").toLowerCase()
          return name.includes(qLower)
        })
      }

      const total = pendingDocs.length
      const offset = (page - 1) * pageSize
      const pagedDocs = pendingDocs.slice(offset, offset + pageSize)

      const sellers: Seller[] = []
      for (const sellerDoc of pagedDocs) {
        const sellerId = sellerDoc.id
        const data = sellerDoc.data()

        const productsSnapshot = await adminFirestore.collection("products").where("sellerId", "==", sellerId).get()
        const products = productsSnapshot.docs.map((productDoc) => {
          const productData = productDoc.data()
          const imageUrl = productData.imageUrl ?? "/img1.jpg"
          return {
            id: productDoc.id,
            imageUrl,
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
          email: data.email ?? "No Email",
          phone: data.phone ?? "No Phone",
          slug: data.slug,
          location: data.location ?? "Unknown",
          active: data.active ?? true,
          isApproved: false,
          approvalStatus: "pending",
          isRejected: false,
          products,
        })
      }

      return { sellers, total }
    }

    let baseSellersQuery: FirebaseFirestore.Query = adminFirestore.collection("sellers")

    // Apply search filter if query is provided
    if (searchQuery) {
      baseSellersQuery = baseSellersQuery.where("name", ">=", searchQuery).where("name", "<=", searchQuery + "\uf8ff")
    }

    // Filter by approval status if provided
    if (status === "approved") {
      baseSellersQuery = baseSellersQuery.where("isApproved", "==", true);
    }

    // Get total count for pagination (before applying offset/limit)
    const totalSnapshot = await baseSellersQuery.count().get()
    const total = totalSnapshot.data().count
    

    // Apply ordering for consistent pagination
    let paginatedSellersQuery: FirebaseFirestore.Query = baseSellersQuery;
    
    if (searchQuery) {
       paginatedSellersQuery = paginatedSellersQuery.orderBy("name")
    } else if (status === "all") {
       paginatedSellersQuery = paginatedSellersQuery.orderBy("name")
    }

    // Calculate offset for pagination
    const offset = (page - 1) * pageSize
   

    // Apply offset and limit for the current page
    const sellersSnapshot = await paginatedSellersQuery.offset(offset).limit(pageSize).get()
   

    const sellers: Seller[] = []
    for (const sellerDoc of sellersSnapshot.docs) {
      const sellerId = sellerDoc.id
      const data = sellerDoc.data()
      

      // Fetch ALL products for each seller (no limit applied here)
      const productsSnapshot = await adminFirestore.collection("products").where("sellerId", "==", sellerId).get()
      

      const products = productsSnapshot.docs.map((productDoc) => {
        const productData = productDoc.data()
        const imageUrl = productData.imageUrl ?? "/img1.jpg"
        if (!productData.imageUrl) {
          console.warn(`[API] fetchPaginatedSellers: Product ${productDoc.id} missing imageUrl for seller ${sellerId}`, {
            description: productData.description?.substring(0, 30),
            hasMediaReference: !!productData.mediaReference,
          })
        }
        return {
          id: productDoc.id,
          imageUrl,
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
        email: data.email ?? "No Email",
        phone: data.phone ?? "No Phone",
        slug: data.slug,
        location: data.location ?? "Unknown",
        active: data.active ?? true,
        isApproved: data.isApproved ?? false,
        approvalStatus: data.approvalStatus ?? (data.isApproved ? "approved" : data.isRejected ? "rejected" : "pending"),
        isRejected: data.isRejected ?? (data.approvalStatus === "rejected"),
        products,
      })
    }

    
    return { sellers, total }
  } catch (error) {
   
    throw new Error(`Failed to fetch sellers: ${(error as Error).message}`)
  }
}

// --- Function to fetch ALL sellers (for chart) ---
async function fetchAllSellers(): Promise<{ sellers: Seller[] }> {
 
  try {
    const sellersSnapshot = await adminFirestore.collection("sellers").orderBy("name").get()
  

    const sellers: Seller[] = []
    for (const sellerDoc of sellersSnapshot.docs) {
      const sellerId = sellerDoc.id
      const data = sellerDoc.data()

      const productsSnapshot = await adminFirestore.collection("products").where("sellerId", "==", sellerId).get()
      const products = productsSnapshot.docs.map((productDoc) => {
        const productData = productDoc.data()
        const imageUrl = productData.imageUrl ?? "/img1.jpg"
        if (!productData.imageUrl) {
          console.warn(`[API] fetchAllSellers: Product ${productDoc.id} missing imageUrl for seller ${sellerId}`, {
            description: productData.description?.substring(0, 30),
          })
        }
        return {
          id: productDoc.id,
          imageUrl,
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
        email: data.email ?? "No Email",
        phone: data.phone ?? "No Phone",
        slug: data.slug,
        location: data.location ?? "Unknown",
        active: data.active ?? true,
        isApproved: data.isApproved ?? false,
        approvalStatus: data.approvalStatus ?? (data.isApproved ? "approved" : data.isRejected ? "rejected" : "pending"),
        isRejected: data.isRejected ?? (data.approvalStatus === "rejected"),
        products,
      })
    }
    return { sellers }
  } catch (error) {

    throw new Error(`Failed to fetch all sellers: ${(error as Error).message}`)
  }
}

export async function GET(request: Request) {
  console.log("[API] GET /api/sellers route accessed")
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fetchAll = searchParams.get("all") === "true"

    if (fetchAll) {
     
      const { sellers } = await fetchAllSellers()
      return NextResponse.json({ sellers, total: sellers.length }, { status: 200 })
    }

    const q = (searchParams.get("q") || "").slice(0, 80)
    // Clamp user-controlled paging values (prevents ?pageSize=100000 from reading the whole database).
    const page = Math.max(1, Math.min(Number.parseInt(searchParams.get("page") || "1", 10) || 1, 1000))
    const pageSize = Math.max(1, Math.min(Number.parseInt(searchParams.get("pageSize") || "10", 10) || 10, 50))
    const status = searchParams.get("status") || "all"

   
    const { sellers, total } = await fetchPaginatedSellers(q, page, pageSize, status)

    return NextResponse.json({ sellers, total }, { status: 200 })
  } catch (error) {
    console.error(`[API] GET /api/sellers failed:`, error)
    return NextResponse.json({ 
      error: "Failed to fetch sellers", 
      details: (error as Error).message,
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    }, { status: 500 })
  }
}

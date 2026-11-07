import { adminFirestore } from "@/lib/firebase-admin"
import type FirebaseFirestore from "firebase-admin/firestore"
import { cachedWithStale } from "@/lib/cache"

// --- Types ---
export interface StoreProduct {
  id: string
  title?: string
  name?: string
  imageUrl: string
  images?: string[]
  price: string
  compareAtPrice?: string | null
  description: string
  category?: string
  sellerId: string
  createdAt: string
  status: string
  stockStatus: string
  isAvailable: boolean
  views?: number
}

export interface StoreSeller {
  id: string
  name: string
  location: string
  active: boolean
  phone?: string
  email?: string // Only ever returned to the owner / admins (see stripPrivateSellerFields)
  rating?: number
  reviewCount?: number
  isApproved?: boolean
  profileImageUrl?: string
  bio?: string
  bannerUrl?: string
  bannerPosition?: string
  storeNameColor?: string
  tagline?: string
  announcement?: string
  themeColor?: string
  instagram?: string
  tiktok?: string
}

export interface StoreResponse {
  seller: StoreSeller | null
  products: StoreProduct[]
}

/**
 * Smart automatic category inference for existing products in the DB
 * that were created before the category field was introduced.
 */
function inferCategory(text: string, existingCategory?: string): string {
  if (existingCategory && existingCategory.trim() && existingCategory.trim().toLowerCase() !== "general") {
    return existingCategory.trim()
  }

  const t = text.toLowerCase()
  if (/computer|laptop|macbook|dell|hp\b|lenovo|thinkpad|monitor|keyboard|mouse|pc\b|desktop|processor|ram\b|intel|ssd\b/i.test(t)) {
    return "Computers"
  }
  if (/phone|iphone|samsung|android|charger|cable|earbud|airpod|headphone|speaker|bluetooth|tablet|ipad|smartwatch|gadget|camera|power\s*bank/i.test(t)) {
    return "Electronics"
  }
  if (/shoe|sneaker|heel|boot|sandal|slippers|crocs|air force|jordan|loafer|slide|footwear/i.test(t)) {
    return "Shoes"
  }
  if (/bag|backpack|handbag|purse|tote|wallet|clutch|suitcase|duffle/i.test(t)) {
    return "Bags"
  }
  if (/book|novel|textbook|guide|bible|story|study|stationery|pen|pencil|notebook/i.test(t)) {
    return "Books"
  }
  if (/dress|shirt|t-shirt|top|trouser|pant|jean|hoodie|jacket|skirt|suit|cloth|wear|jersey|underwear|short/i.test(t)) {
    return "Clothing & Fashion"
  }
  if (/perfume|cologne|makeup|lipstick|lotion|cream|soap|hair|wig|skincare|cosmetic|fragrance/i.test(t)) {
    return "Beauty & Care"
  }
  if (/food|snack|drink|beverage|rice|oil|spice|grocer|biscuit|chocolate|candy/i.test(t)) {
    return "Groceries & Food"
  }
  if (/watch|jewelry|jewellery|ring|necklace|bracelet|chain|earring|gold|silver/i.test(t)) {
    return "Jewelry & Watches"
  }
  return "General"
}

/** Raw Firestore read - does NOT use any cache. */
export async function fetchSellerAndProducts(
  slugOrId: string,
  productQ = "",
  productStatus = "all",
  productCategory = "all",
): Promise<StoreResponse> {
  // Try to fetch seller by ID first
  let sellerDoc = await adminFirestore.collection("sellers").doc(slugOrId).get()
  let seller: StoreSeller | null = null
  let actualSellerId = slugOrId

  if (!sellerDoc.exists) {
    // If not found by ID, try to fetch by slug
    const sellersBySlug = await adminFirestore.collection("sellers").where("slug", "==", slugOrId).limit(1).get()
    if (!sellersBySlug.empty) {
      sellerDoc = sellersBySlug.docs[0]
      actualSellerId = sellerDoc.id
    }
  }

  if (sellerDoc.exists) {
    const data = sellerDoc.data()
    seller = {
      id: sellerDoc.id,
      name: data?.name ?? "Unnamed Seller",
      location: data?.location ?? "Unknown",
      active: data?.active ?? true,
      phone: data?.phone ?? "",
      email: data?.email ?? undefined,
      rating: data?.rating ?? 0,
      reviewCount: data?.reviewCount ?? 0,
      isApproved: data?.isApproved ?? true,
      profileImageUrl: data?.profileImageUrl ?? undefined,
      bio: data?.bio ?? undefined,
      bannerUrl: data?.bannerUrl ?? undefined,
      bannerPosition: data?.bannerPosition ?? "50%",
      storeNameColor: data?.storeNameColor ?? "auto",
      tagline: data?.tagline ?? undefined,
      announcement: data?.announcement ?? undefined,
      themeColor: data?.themeColor ?? "emerald",
      instagram: data?.instagram ?? undefined,
      tiktok: data?.tiktok ?? undefined,
    }
  }

  // Unknown seller: skip the products query entirely (saves reads on bot/typo traffic)
  if (!seller) return { seller: null, products: [] }

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

  const products: StoreProduct[] = productsSnapshot.docs.map((doc) => {
    const data = doc.data()
    const imageUrl = data.imageUrl ?? "/img1.jpg"
    const title = data.title || data.name || (data.description ? data.description.split("\n")[0] : "Product")
    const category = inferCategory((data.title || "") + " " + (data.description || ""), data.category)

    return {
      id: doc.id,
      title,
      name: title,
      imageUrl,
      images: Array.isArray(data.images) && data.images.length > 0 ? data.images : [imageUrl],
      price: data.price ?? "Price not specified",
      compareAtPrice: data.compareAtPrice ?? null,
      description: data.description ?? "",
      category,
      sellerId: data.sellerId ?? "",
      createdAt:
        data.createdAt?.toDate?.().toISOString() ??
        (typeof data.createdAt === "string" ? data.createdAt : new Date().toISOString()),
      status: data.status ?? "unknown",
      stockStatus: data.stockStatus ?? "unknown",
      isAvailable: data.isAvailable ?? false,
      views: data.views ?? 0,
    }
  })

  const filteredProducts =
    productCategory !== "all"
      ? products.filter((p) => p.category?.toLowerCase() === productCategory.toLowerCase())
      : products

  return { seller, products: filteredProducts }
}

/** Store data behind the shared Redis cache (60s fresh, 24h stale fallback for quota errors). */
export function getCachedStore(
  slugOrId: string,
  productQ = "",
  productStatus = "all",
  productCategory = "all",
  options: { bypassFresh?: boolean } = {},
): Promise<StoreResponse> {
  const key = `store:${slugOrId}:${productQ}:${productStatus}:${productCategory}`
  return cachedWithStale(key, 60, () => fetchSellerAndProducts(slugOrId, productQ, productStatus, productCategory), options)
}

/** Remove fields that must never be exposed to anonymous visitors. */
export function stripPrivateSellerFields(seller: StoreSeller | null): StoreSeller | null {
  if (!seller) return seller
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { email, ...publicFields } = seller
  return publicFields
}


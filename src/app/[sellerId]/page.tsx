import { Suspense } from "react"
import { cache } from "react"
import type { Metadata } from "next"
import StorefrontClient from "./store-client"
import { fetchSellerAndProducts, stripPrivateSellerFields } from "@/lib/store-data"

/**
 * Public storefront, rendered on the server and cached at the edge (ISR).
 *
 *  - Most visits are served from the CDN cache: zero Firestore reads.
 *  - The page is regenerated in the background at most once per minute.
 *  - Seller edits call revalidatePath('/<sellerId>') (see admin/seller actions) so changes appear immediately.
 *  - If regeneration fails (e.g. Firestore quota), Next keeps serving the last good page.
 */
export const revalidate = 60

const RESERVED_IDS = new Set(["admin", "mcgh-admin-control"])
const SELLER_ID_PATTERN = /^[A-Za-z0-9._-]{1,128}$/

// De-duplicates the Firestore read between generateMetadata() and the page itself.
const loadStore = cache(async (sellerId: string) => {
  if (RESERVED_IDS.has(sellerId) || !SELLER_ID_PATTERN.test(sellerId)) return null
  try {
    const data = await fetchSellerAndProducts(sellerId)
    return { seller: stripPrivateSellerFields(data.seller), products: data.products }
  } catch (error) {
    console.error("[Storefront] server fetch failed, falling back to client fetch:", error)
    return null
  }
})

export async function generateMetadata({ params }: { params: Promise<{ sellerId: string }> }): Promise<Metadata> {
  const { sellerId } = await params
  const data = await loadStore(sellerId)
  if (!data?.seller) return { title: "Store | MarketChatGH" }

  const { seller } = data
  const description =
    seller.tagline || seller.bio || `Shop ${seller.name} on MarketChatGH and order directly on WhatsApp.`
  const image = seller.bannerUrl || seller.profileImageUrl

  return {
    title: `${seller.name} | MarketChatGH`,
    description,
    openGraph: {
      title: seller.name,
      description,
      type: "website",
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: seller.name,
      description,
      ...(image ? { images: [image] } : {}),
    },
  }
}

export default async function SellerStorePage({ params }: { params: Promise<{ sellerId: string }> }) {
  const { sellerId } = await params
  const initialData = await loadStore(sellerId)

  return (
    // useSearchParams() inside the client component requires a Suspense boundary.
    <Suspense fallback={null}>
      <StorefrontClient initialData={initialData} />
    </Suspense>
  )
}

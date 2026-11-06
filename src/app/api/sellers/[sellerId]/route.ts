import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth.config"
import { enforceRateLimit } from "@/lib/ratelimit"
import { getCachedStore, stripPrivateSellerFields } from "@/lib/store-data"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const SELLER_ID_PATTERN = /^[A-Za-z0-9._-]{1,128}$/

export async function GET(request: Request, props: { params: Promise<{ sellerId: string }> }) {
  const params = await props.params
  try {
    const { sellerId } = params

    if (!SELLER_ID_PATTERN.test(sellerId)) {
      return NextResponse.json({ seller: null, products: [] }, { status: 200 })
    }

    const limited = await enforceRateLimit(request, "store-read", 120, "1 m")
    if (limited) return limited

    const { searchParams } = new URL(request.url)
    const productQ = (searchParams.get("productQ") || "").slice(0, 80)
    const productStatus = searchParams.get("productStatus") || "all"
    const productCategory = searchParams.get("category") || "all"

    // Only look up the session when a session cookie is present (anonymous traffic stays cacheable).
    const hasSessionCookie = (request.headers.get("cookie") || "").includes("next-auth.session-token")
    const session = hasSessionCookie ? await getServerSession(authOptions) : null
    const sessionUser = session?.user as { id?: string; isAdmin?: boolean } | undefined

    const result = await getCachedStore(sellerId, productQ, productStatus, productCategory, {
      // Owners/admins refreshing their dashboard (?t=...) always get fresh data.
      bypassFresh: Boolean(sessionUser && searchParams.has("t")),
    })

    const isPrivileged = Boolean(
      sessionUser && (sessionUser.isAdmin || (result.seller && sessionUser.id === result.seller.id)),
    )

    if (isPrivileged) {
      // Contains the seller's login email -> never cache in shared caches.
      return NextResponse.json(result, { status: 200, headers: { "Cache-Control": "private, no-store" } })
    }

    return NextResponse.json(
      { seller: stripPrivateSellerFields(result.seller), products: result.products },
      {
        status: 200,
        headers: {
          // Edge CDN serves this for 60s and refreshes in the background -> near-zero Firestore reads for visitors.
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    )
  } catch (error) {
    console.error("[API] Error in GET /api/sellers/[sellerId]:", error)
    const msg = (error as Error).message || ""
    const isQuota = msg.includes("RESOURCE_EXHAUSTED") || msg.toLowerCase().includes("quota exceeded")
    return NextResponse.json(
      { error: "Failed to fetch seller data", details: isQuota ? "RESOURCE_EXHAUSTED" : "Internal error" },
      { status: isQuota ? 503 : 500 },
    )
  }
}

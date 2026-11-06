import { adminFirestore } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";
import { enforceRateLimit, getClientIp, redis } from "@/lib/ratelimit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;

  if (!productId || productId.length > 128) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
  }

  // Overall per-IP throttle.
  const limited = await enforceRateLimit(req, "product-view", 60, "1 m");
  if (limited) return limited;

  try {
    // Count a given visitor's view of a given product at most once per 10 minutes.
    // This stops view-count inflation AND saves a Firestore write for every refresh.
    if (redis) {
      try {
        const first = await redis.set(`view:${productId}:${getClientIp(req)}`, 1, { nx: true, ex: 600 });
        if (first === null) {
          return NextResponse.json({ success: true, counted: false });
        }
      } catch (error) {
        console.error("[API View] dedupe error (continuing):", error);
      }
    }

    const productRef = adminFirestore.collection("products").doc(productId);

    // Increment the views field or set it to 1 if it doesn't exist
    await productRef.update({
      views: admin.firestore.FieldValue.increment(1)
    });

    return NextResponse.json({ success: true, counted: true });
  } catch (error) {
    console.error(`[API View] Error incrementing views for ${productId}:`, error);
    // If document doesn't exist, we might get an error, but that's fine for tracking
    return NextResponse.json({ error: "Failed to increment views" }, { status: 500 });
  }
}

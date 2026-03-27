import { adminFirestore } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";

export async function POST(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  const { productId } = await params;

  if (!productId) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
  }

  try {
    const productRef = adminFirestore.collection("products").doc(productId);
    
    // Increment the views field or set it to 1 if it doesn't exist
    await productRef.update({
      views: admin.firestore.FieldValue.increment(1)
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[API View] Error incrementing views for ${productId}:`, error);
    // If document doesn't exist, we might get an error, but that's fine for tracking
    return NextResponse.json({ error: "Failed to increment views" }, { status: 500 });
  }
}

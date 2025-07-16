// src/app/api/admin/toggle-seller/route.ts
import { firestore } from "@/lib/firebase";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sellerId = searchParams.get("sellerId");
  const active = searchParams.get("active") === "true";

  if (sellerId) {
    await firestore.collection("sellers").doc(sellerId).update({ active });
  }

  return new Response(null, { status: 302, headers: { Location: "/admin" } });
}

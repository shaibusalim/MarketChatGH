// src/app/api/admin/update-product/route.ts
import { firestore } from "@/lib/firebase";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const productId = formData.get("productId") as string;
  const action = formData.get("action") as string;

  const productRef = firestore.collection("products").doc(productId);

  if (action === "markAvailable") {
    await productRef.update({
      status: "available",
      stockStatus: "in stock",
      isAvailable: true,
    });
  } else if (action === "markOutOfStock") {
    await productRef.update({
      status: "out of stock",
      stockStatus: "out of stock",
      isAvailable: false,
    });
  } else if (action === "delete") {
    await productRef.delete();
  }

  return new Response(null, { status: 302, headers: { Location: "/admin" } });
}

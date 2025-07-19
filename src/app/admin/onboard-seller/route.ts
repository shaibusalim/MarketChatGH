import { NextRequest } from "next/server";
import { firestore } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const sellerId = (data.get("sellerId") as string)?.trim();
  const name = (data.get("name") as string)?.trim();
  const location = (data.get("location") as string)?.trim();

  if (!sellerId || !name || !location) {
    return new Response("Missing fields", { status: 400 });
  }

  await firestore.collection("sellers").doc(sellerId).set({
    sellerId,
    name,
    location,
    active: true,
    createdAt: new Date(),
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: "/admin",
    },
  });
}

import { adminFirestore } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, sellerId, productDescription, productPrice, type, sellerName } = body;

    if (!sellerId) {
      return NextResponse.json({ error: "Missing sellerId" }, { status: 400 });
    }

    const leadData: any = {
      sellerId,
      type: type || "chat_to_buy",
      createdAt: new Date().toISOString(),
    };

    if (productId) leadData.productId = productId;
    if (productDescription) leadData.productDescription = productDescription;
    if (productPrice) leadData.productPrice = productPrice;
    if (sellerName) leadData.sellerName = sellerName;

    await adminFirestore.collection("leads").add(leadData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API Leads] Error logging lead:", error);
    return NextResponse.json({ error: "Failed to log lead" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sellerId = searchParams.get("sellerId");

  if (!sellerId) {
    return NextResponse.json({ error: "Seller ID is required" }, { status: 400 });
  }

  try {
    const leadsSnapshot = await adminFirestore
      .collection("leads")
      .where("sellerId", "==", sellerId)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const leads = leadsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ leads });
  } catch (error) {
    console.error("[API Leads] Error fetching leads:", error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

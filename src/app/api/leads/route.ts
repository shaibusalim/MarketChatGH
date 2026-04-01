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
  const daysString = searchParams.get("days");

  if (!sellerId) {
    return NextResponse.json({ error: "Seller ID is required" }, { status: 400 });
  }

  try {
    console.log(`[API Leads] Fetching leads for sellerId: ${sellerId}, days: ${daysString}`);
    
    let query = adminFirestore
      .collection("leads")
      .where("sellerId", "==", sellerId);

    // Apply date filter if requested
    if (daysString && daysString !== "all") {
      const days = parseInt(daysString);
      if (!isNaN(days)) {
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() - days);
        thresholdDate.setHours(0, 0, 0, 0); // Start of the day
        query = query.where("createdAt", ">=", thresholdDate.toISOString());
      }
    }

    let leadsSnapshot;
    try {
      // Primary attempt: Ordered query
      leadsSnapshot = await query
        .orderBy("createdAt", "desc")
        .limit(100) // Increased limit for filtered history
        .get();
    } catch (e: any) {
      // Fallback: If orderBy fails (missing index), return unordered results
      if (e.message?.includes("index")) {
        console.warn("[API Leads] Firestore index missing for orderBy/where, falling back to unordered query.");
        leadsSnapshot = await query
          .limit(100)
          .get();
      } else {
        throw e;
      }
    }

    console.log(`[API Leads] Found ${leadsSnapshot.size} leads`);

    const leads = leadsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ leads });
  } catch (error) {
    console.error("[API Leads] Error fetching leads:", error);
    return NextResponse.json({ error: "Failed to fetch leads", details: (error as Error).message }, { status: 500 });
  }
}

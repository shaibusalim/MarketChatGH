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

    // Parse threshold date if filtering
    const days = (daysString && daysString !== "all") ? parseInt(daysString) : null;
    const thresholdISO = days !== null && !isNaN(days)
      ? (() => {
          const d = new Date();
          d.setDate(d.getDate() - days);
          d.setHours(0, 0, 0, 0);
          return d.toISOString();
        })()
      : null;

    let leads: any[] = [];

    // Strategy: fetch raw leads for the seller with a reasonable limit,
    // then apply date filtering and sorting client-side.
    // This avoids Firestore composite index requirements on (sellerId, createdAt).
    const RAW_LIMIT = 500;
    let rawSnapshot: FirebaseFirestore.QuerySnapshot;

    try {
      rawSnapshot = await adminFirestore
        .collection("leads")
        .where("sellerId", "==", sellerId)
        .limit(RAW_LIMIT)
        .get();
    } catch (firstErr: any) {
      // Last-resort fallback: fetch without limit if even the basic query is problematic
      console.warn("[API Leads] Initial query failed, trying unindexed fallback:", firstErr.message);
      rawSnapshot = await adminFirestore
        .collection("leads")
        .limit(RAW_LIMIT)
        .get();
    }

    // Filter by sellerId (again for fallback) and by date if requested
    for (const doc of rawSnapshot.docs) {
      const data = doc.data();
      if (data.sellerId !== sellerId) continue;

      if (thresholdISO) {
        const createdAt = typeof data.createdAt === "string" ? data.createdAt : null;
        if (!createdAt || createdAt < thresholdISO) continue;
      }

      leads.push({ id: doc.id, ...data });
    }

    // Sort descending by createdAt (newest first)
    leads.sort((a, b) => {
      const ta = typeof a.createdAt === "string" ? a.createdAt : "";
      const tb = typeof b.createdAt === "string" ? b.createdAt : "";
      return tb.localeCompare(ta);
    });

    // Cap to 100 most recent after sort
    leads = leads.slice(0, 100);

    console.log(`[API Leads] Found ${leads.length} leads (from ${rawSnapshot.size} raw)`);

    return NextResponse.json({ leads });
  } catch (error) {
    console.error("[API Leads] Error fetching leads:", error);
    return NextResponse.json({ error: "Failed to fetch leads", details: (error as Error).message }, { status: 500 });
  }
}

import { adminFirestore } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth.config";
import { enforceRateLimit } from "@/lib/ratelimit";

const ALLOWED_LEAD_TYPES = new Set(["chat_to_buy", "product_view", "store_visit"]);
const clip = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : undefined);

export async function POST(req: NextRequest) {
  try {
    // Public tracking endpoint -> throttle to stop analytics spam / Firestore write abuse.
    const limited = await enforceRateLimit(req, "leads", 30, "1 m");
    if (limited) return limited;

    const body = await req.json();
    const { productId, sellerId, productDescription, productPrice, type, sellerName } = body;

    if (typeof sellerId !== "string" || !sellerId || sellerId.length > 128) {
      return NextResponse.json({ error: "Missing sellerId" }, { status: 400 });
    }

    const leadType = typeof type === "string" && ALLOWED_LEAD_TYPES.has(type) ? type : "chat_to_buy";

    const leadData: any = {
      sellerId,
      type: leadType,
      createdAt: new Date().toISOString(),
    };

    const pid = clip(productId, 128);
    const desc = clip(productDescription, 500);
    const price = clip(productPrice, 50);
    const sname = clip(sellerName, 120);
    if (pid) leadData.productId = pid;
    if (desc) leadData.productDescription = desc;
    if (price) leadData.productPrice = price;
    if (sname) leadData.sellerName = sname;

    await adminFirestore.collection("leads").add(leadData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API Leads] Error logging lead:", error);
    return NextResponse.json({ error: "Failed to log lead" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Lead data is private business information: only the owning seller or an admin may read it.
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as { id?: string; isAdmin?: boolean } | undefined;
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sellerId = searchParams.get("sellerId");
  const daysString = searchParams.get("days");

  if (!sellerId) {
    return NextResponse.json({ error: "Seller ID is required" }, { status: 400 });
  }

  if (!sessionUser.isAdmin && sessionUser.id !== sellerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
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
    const rawSnapshot = await adminFirestore
      .collection("leads")
      .where("sellerId", "==", sellerId)
      .limit(RAW_LIMIT)
      .get();

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

    return NextResponse.json({ leads }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[API Leads] Error fetching leads:", error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

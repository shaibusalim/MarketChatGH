import { NextRequest, NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
 
  try {
    const data = await req.formData();
    const sellerId = (data.get("sellerId") as string)?.trim();
    const name = (data.get("name") as string)?.trim();
    const location = (data.get("location") as string)?.trim();

    

    if (!sellerId || !name || !location) {
      console.warn("[API] Missing required fields");
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await adminFirestore.collection("sellers").doc(sellerId).set({
      sellerId,
      name,
      location,
      active: true,
      createdAt: new Date(),
    }, { merge: true }); // Use merge to avoid overwriting existing data


    return NextResponse.json({ message: "Seller onboarded successfully" }, {
      status: 200,
      headers: {
        Location: "/admin",
      },
    });
  } catch (error) {
    
    return NextResponse.json(
      { error: "Failed to onboard seller", details: (error as Error).message },
      { status: 500 }
    );
  }
}
import { NextRequest } from "next/server";
import { TwilioMessagingResponse } from "@/lib/twilio";
import { firestore } from "@/lib/firebase";
import admin from "firebase-admin";
import { answerComplexQuery } from "@/ai/flows/answer-complex-queries";

export async function POST(req: NextRequest) {
  const twiml = new TwilioMessagingResponse();

  try {
    const formData = await req.formData();
    const body = (formData.get("Body") as string) || "";
    const from = (formData.get("From") as string) || "";
    const numMedia = parseInt((formData.get("NumMedia") as string) || "0", 10);
    const mediaUrl = (formData.get("MediaUrl0") as string) || "";

    const userId = from.replace("whatsapp:+", "");

    // Add seller doc if not exists
    const sellerRef = firestore.collection("sellers").doc(userId);
    const sellerDoc = await sellerRef.get();
    if (!sellerDoc.exists) {
      await sellerRef.set({ active: true });
    }

    if (numMedia > 0 && body.trim().length > 0) {
      const lines = body.split("\n").map(line => line.trim()).filter(Boolean);

      // Find price line
      const priceLine = lines.find(line =>
        line.toLowerCase().includes("price") ||
        line.includes("₵") ||
        line.toLowerCase().includes("ghc")
      );

      // Remove price line from description lines
      const descriptionLines = lines.filter(line => line !== priceLine);

      const description = descriptionLines.join("\n");
      const price = priceLine ? priceLine : "Price not specified";

      // Save to Firestore
      await firestore.collection("products").add({
        sellerId: userId,
        imageUrl: mediaUrl,
        price,
        description,
        status: "available",
        stockStatus: "in stock",
        isAvailable: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const storeUrl = `${process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin}/${userId}`;
      twiml.message(`✅ Product added successfully!\nView your store: ${storeUrl}`);
    } else {
      // Default fallback to AI if no media or no caption
      const aiResult = await answerComplexQuery({ query: body });
      twiml.message(aiResult.reply);
    }
  } catch (error) {
    console.error("Error processing WhatsApp message:", error);
    twiml.message("Oops! Something went wrong. Please try again later.");
  }

  return new Response(twiml.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}

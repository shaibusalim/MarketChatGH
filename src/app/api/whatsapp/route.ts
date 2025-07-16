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
    const lowerBody = body.toLowerCase();

    // Add seller doc if not exists
    const sellerRef = firestore.collection("sellers").doc(userId);
    const sellerDoc = await sellerRef.get();
    if (!sellerDoc.exists) {
      await sellerRef.set({ active: true });
    }

    if (lowerBody.startsWith("/addproduct") && numMedia > 0) {
      const commandRegex = /^\/addproduct\s+(₵\s*\d+(\.\d{1,2})?)\s+(.+)/is;
      const match = body.match(commandRegex);

      if (match) {
        const price = match[1].trim();
        const description = match[3].trim();

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
        twiml.message(
          '❌ Invalid format. Use: /addproduct [image] ₵PRICE DESCRIPTION\n\nExample:\n/addproduct ₵50 Nice black T-shirt'
        );
      }
    } else {
      // Default AI fallback
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

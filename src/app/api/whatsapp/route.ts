import { NextRequest } from "next/server";
import { TwilioMessagingResponse } from "@/lib/twilio";
import { firestore } from "@/lib/firebase";
import { answerComplexQuery } from "@/ai/flows/answer-complex-queries";
import admin from "firebase-admin";

export async function POST(req: NextRequest) {
  const twiml = new TwilioMessagingResponse();

  if (!firestore) {
    console.error("Firestore not initialized");
    twiml.message("❌ Store config issue. Please try again later.");
    return new Response(twiml.toString(), {
      headers: { "Content-Type": "text/xml" },
    });
  }

  try {
    const formData = await req.formData();
    const body = (formData.get("Body") as string) || "";
    const from = (formData.get("From") as string) || "";
    const numMedia = parseInt((formData.get("NumMedia") as string) || "0", 10);
    const mediaUrl = (formData.get("MediaUrl0") as string) || "";

    const userId = from.replace("whatsapp:+", "");
    const lowerBody = body.toLowerCase();

    console.log("👉 Incoming from:", userId);
    console.log("👉 Body:", body);
    console.log("👉 Media URL:", mediaUrl);

    if (lowerBody.startsWith("/addproduct") && numMedia > 0) {
      const commandRegex = /^\/addproduct\s+(₵\s*\d+(\.\d{1,2})?)\s+(.+)/is;
      const match = body.match(commandRegex);

      if (match) {
        const price = match[1].trim();
        const description = match[3].trim();

        try {
          const docRef = await firestore.collection("products").add({
            sellerId: userId,
            imageUrl: mediaUrl,
            price,
            description,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          console.log("✅ Firestore write success, doc ID:", docRef.id);

          const storeUrl = `${process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin}/${userId}`;
          twiml.message(`✅ Product added! Your store is now live at: ${storeUrl}`);
        } catch (firestoreError) {
          console.error("🔥 Firestore add failed:", firestoreError);
          twiml.message("❌ Failed to add product. Please try again later.");
        }
      } else {
        twiml.message(
          '❌ Invalid format. Use: /addproduct ₵PRICE DESCRIPTION and attach an image. Example: /addproduct ₵50 Nice Shirt'
        );
      }
    } else {
      // AI fallback logic
      const aiResult = await answerComplexQuery({ query: body });
      twiml.message(aiResult.reply);
    }
  } catch (error) {
    console.error("Error processing WhatsApp message:", error);
    twiml.message("❌ Oops! Something went wrong. Please try again.");
  }

  return new Response(twiml.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}

import { NextRequest } from "next/server";
import { TwilioMessagingResponse } from "@/lib/twilio";
import { firestore } from "@/lib/firebase";
import { answerComplexQuery } from "@/ai/flows/answer-complex-queries";
import admin from "firebase-admin";

export async function POST(req: NextRequest) {
  const twiml = new TwilioMessagingResponse();

  if (!firestore) {
    console.error("Firestore not initialized for /api/whatsapp");
    twiml.message(
      "Sorry, there is a configuration problem with the store. Please try again later."
    );
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
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        const storeUrl = `${process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin}/${userId}`;
        twiml.message(`✅ Product added! Your store is now live at: ${storeUrl}`);
      } else {
        twiml.message(
          '❌ Invalid format. Please use: /addproduct [image] ₵PRICE DESCRIPTION. Example: /addproduct ₵50 Nice T-shirt'
        );
      }
    } else {
      const interestRegex = /i'm interested in buying your product: "([^"]+)" for (₵\s*\d+(\.\d{1,2})?)/i;
      const interestMatch = body.match(interestRegex);

      if (interestMatch && lowerBody.includes("available")) {
        const price = interestMatch[2];
        twiml.message(`Yes, the item is available! Price: ${price}. To pay, please send money to MTN Mobile Money number: 055 123 4567. Send a screenshot of the payment confirmation to finalize your order.`);
      } else if (lowerBody.includes("paid") || lowerBody.includes("payment")) {
        twiml.message("Thank you! Your order is confirmed. 🚚 We will deliver it within 24 hours.");
      } else {
        const aiResult = await answerComplexQuery({ query: body });
        twiml.message(aiResult.reply);
      }
    }
  } catch (error) {
    console.error("Error processing WhatsApp message:", error);
    twiml.message("Oops! Something went wrong on our end. Please try again in a moment.");
  }

  return new Response(twiml.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}
